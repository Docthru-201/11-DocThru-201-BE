import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { fakerKO as faker } from '@faker-js/faker';
import { hashPasswordArgon2id } from '../src/common/utils/argon2-hash.js';
import crypto from 'node:crypto';
import * as seedConstants from './seed.constants.js';

class Seeder {
  #prisma;
  #numUsersToCreate;
  #numChallengesToCreate;
  #hashedPassword;

  constructor(
    prisma,
    numUsersToCreate = seedConstants.USERS_COUNT,
    numChallengesToCreate = seedConstants.CHALLENGES_COUNT,
  ) {
    this.#prisma = prisma;
    this.#numUsersToCreate = numUsersToCreate;
    this.#numChallengesToCreate = numChallengesToCreate;
  }

  #xs(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  #buildWorkContent() {
    const topic = faker.helpers.arrayElement(
      seedConstants.CHALLENGE_TOPIC_TEMPLATES,
    );
    let text = faker.helpers
      .arrayElement(seedConstants.WORK_CONTENT_TEMPLATES)
      .replace('{topic}', topic);

    const MIN_WORK_TEXT_LENGTH = 500;
    while (text.length < MIN_WORK_TEXT_LENGTH) {
      text += `\n\n${faker.lorem.paragraph()}`;
    }

    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text,
            },
          ],
        },
      ],
    };
  }

  /** 챌린지 제목과 동일 규칙: CHALLENGE_TITLE_TEMPLATES + topic 치환 */
  #buildWorkTitle() {
    const topic = faker.helpers.arrayElement(
      seedConstants.CHALLENGE_TOPIC_TEMPLATES,
    );
    const titleTemplate = faker.helpers.arrayElement(
      seedConstants.CHALLENGE_TITLE_TEMPLATES,
    );
    return titleTemplate.replace('{topic}', topic);
  }

  async #resetDb() {
    // FK 순서대로 삭제. $transaction(기본 5초)으로 묶으면 데이터가 많을 때 타임아웃(P2028)이 날 수 있어 순차 실행함.
    await this.#prisma.like.deleteMany();
    await this.#prisma.comment.deleteMany();
    await this.#prisma.work.deleteMany();
    await this.#prisma.participant.deleteMany();
    await this.#prisma.notification.deleteMany();
    await this.#prisma.challenge.deleteMany();
    await this.#prisma.profile.deleteMany();
    await this.#prisma.refreshToken.deleteMany();
    await this.#prisma.socialAccount.deleteMany();
    await this.#prisma.user.deleteMany();
  }

  async #seedUsers() {
    const users = [];

    for (let i = 0; i < this.#numUsersToCreate; i += 1) {
      const email = faker.internet.email();
      const baseNickname = faker.person.firstName();
      const nickname = `${baseNickname}_${i + 1}`;

      const user = await this.#prisma.user.create({
        data: {
          role: i === 0 ? 'ADMIN' : 'USER',
          grade: faker.helpers.arrayElement(seedConstants.GRADES),
          email,
          nickname,
          password: this.#hashedPassword,
          image: faker.image.avatar(),
        },
      });

      await this.#prisma.profile.create({
        data: {
          userId: user.id,
          introduction: faker.helpers.arrayElement(
            seedConstants.PROFILE_INTRO_TEMPLATES,
          ),
        },
      });

      users.push(user);
    }

    return users;
  }

  async #seedSocialAccounts(users) {
    const sampled = faker.helpers.arrayElements(users, {
      min: Math.floor(users.length / 2),
      max: users.length,
    });

    for (const user of sampled) {
      await this.#prisma.socialAccount.create({
        data: {
          userId: user.id,
          provider: seedConstants.AUTH_PROVIDERS[0],
          providerId: faker.string.uuid(),
        },
      });
    }
  }

  async #seedRefreshTokens(users) {
    const now = new Date();
    const expiresInDays = 30;

    for (const user of users) {
      await this.#prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: crypto.randomBytes(32).toString('hex'),
          device: faker.internet.userAgent(),
          expiresAt: new Date(
            now.getTime() + expiresInDays * seedConstants.DAY_IN_MS,
          ),
        },
      });
    }
  }

  async #seedChallenges(users) {
    const challenges = [];

    for (let i = 0; i < this.#numChallengesToCreate; i += 1) {
      const author = faker.helpers.arrayElement(users);
      const topic = faker.helpers.arrayElement(
        seedConstants.CHALLENGE_TOPIC_TEMPLATES,
      );
      const titleTemplate = faker.helpers.arrayElement(
        seedConstants.CHALLENGE_TITLE_TEMPLATES,
      );
      // 균등 분포면 비승인 챌린지가 ~75%가 되어 참가자 0이 과다해짐 → 승인·대기 비중을 크게 둠
      const statusRoll = faker.number.int({ min: 1, max: 100 });
      const status =
        i === 0
          ? 'APPROVED'
          : statusRoll <= 68
            ? 'APPROVED'
            : statusRoll <= 88
              ? 'PENDING'
              : statusRoll <= 94
                ? 'REJECTED'
                : 'DELETED';

      const shouldClose = faker.number.int({ min: 1, max: 10 }) <= 3; // 1~10 중 3 이하 → 약 30%
      const rawDeadline = shouldClose
        ? faker.date.recent({ days: seedConstants.CHALLENGE_DEADLINE })
        : faker.date.soon({ days: seedConstants.CHALLENGE_DEADLINE });
      const isClosed = shouldClose;

      const challenge = await this.#prisma.challenge.create({
        data: {
          authorId: author.id,
          title: titleTemplate.replace('{topic}', topic),
          originalUrl: faker.helpers.arrayElement(
            seedConstants.ORIGINAL_URL_TEMPLATES,
          ),
          type: faker.helpers.arrayElement(seedConstants.CHALLENGE_TYPES),
          category: faker.helpers.arrayElement(
            seedConstants.CHALLENGE_CATEGORIES,
          ),
          description: faker.helpers.arrayElement(
            seedConstants.CHALLENGE_DESCRIPTION_TEMPLATES,
          ),
          deadline: rawDeadline,
          maxParticipants: faker.number.int({
            min: seedConstants.CHALLENGE_MIN_PARTICIPANTS,
            max: seedConstants.CHALLENGE_MAX_PARTICIPANTS,
          }),
          status,
          declineReason:
            status === 'REJECTED'
              ? faker.helpers.arrayElement(
                  seedConstants.DECLINE_REASON_TEMPLATES,
                )
              : null,
          isClosed,
        },
      });

      challenges.push(challenge);
    }

    return challenges;
  }

  async #seedParticipants(challenges, users) {
    // 승인됨·승인대기 챌린지에만 참가자 부여 (거절/삭제는 0명이 자연스러움)
    const withParticipants = challenges.filter((c) =>
      ['APPROVED', 'PENDING'].includes(c.status),
    );

    for (const challenge of withParticipants) {
      // 유저 수와 정원 중 작은 값이 실제로 뽑을 수 있는 최대 인원
      const cap = Math.min(challenge.maxParticipants, users.length);
      if (cap < 1) continue;

      // 정원의 20%~100% 구간에서 참가자 수 결정 (최소 1명)
      const minCount = Math.max(1, Math.ceil(cap * 0.2));
      const targetCount = faker.number.int({ min: minCount, max: cap });

      const participants = faker.helpers.arrayElements(users, {
        min: targetCount,
        max: targetCount,
      });

      for (const user of participants) {
        await this.#prisma.participant.create({
          data: {
            challengeId: challenge.id,
            userId: user.id,
          },
        });
      }
    }
  }

  async #seedWorksCommentsLikes(challenges) {
    for (const challenge of challenges) {
      const participants = await this.#prisma.participant.findMany({
        where: { challengeId: challenge.id },
      });

      if (participants.length === 0) continue;

      const commenters = await this.#prisma.user.findMany({
        take: seedConstants.COMMENTERS_TAKE,
        orderBy: { createdAt: 'desc' },
      });

      for (const participant of participants) {
        const content = this.#buildWorkContent();

        const work = await this.#prisma.work.create({
          data: {
            challengeId: challenge.id,
            participantId: participant.id,
            userId: participant.userId,
            title: this.#buildWorkTitle(),
            content: JSON.stringify(content),
            status: 'SUBMITTED',
          },
        });

        const parentComments = [];

        for (const commenter of commenters) {
          const parent = await this.#prisma.comment.create({
            data: {
              workId: work.id,
              authorId: commenter.id,
              content: faker.helpers.arrayElement(
                seedConstants.COMMENT_TEMPLATES,
              ),
            },
          });
          parentComments.push(parent);
        }

        // 일부 댓글에 대해서는 대댓글도 생성 (parentId가 있는 댓글)
        if (parentComments.length > 0) {
          const replyTargets = faker.helpers.arrayElements(parentComments, {
            min: 1,
            max: Math.min(2, parentComments.length),
          });

          for (const parent of replyTargets) {
            const replyAuthor = faker.helpers.arrayElement(commenters);

            await this.#prisma.comment.create({
              data: {
                workId: work.id,
                authorId: replyAuthor.id,
                parentId: parent.id,
                content: faker.helpers.arrayElement(
                  seedConstants.COMMENT_TEMPLATES,
                ),
              },
            });
          }
        }

        // 좋아요 수는 API/목록에서 Work.likeCount 기준 — 100~2000 랜덤(Like 행은 생성하지 않음)
        const likeCount = faker.number.int({ min: 100, max: 2000 });

        await this.#prisma.work.update({
          where: { id: work.id },
          data: { likeCount },
        });
      }
    }
  }

  async #seedNotifications(users) {
    for (const user of users) {
      const count = faker.number.int({
        min: seedConstants.NOTIFICATIONS_PER_USER_MIN,
        max: seedConstants.NOTIFICATIONS_PER_USER_MAX,
      });

      for (const _ of this.#xs(count)) {
        const isRead = faker.helpers.arrayElement([true, false]);
        await this.#prisma.notification.create({
          data: {
            userId: user.id,
            type: faker.helpers.arrayElement(seedConstants.NOTIFICATION_TYPES),
            targetId: null,
            targetUrl: null,
            isRead,
            readAt: isRead
              ? faker.date.recent({
                  days: seedConstants.NOTIFICATION_RECENT_DAYS,
                })
              : null,
          },
        });
      }
    }
  }

  async run() {
    // if (process.env.NODE_ENV !== 'development') {
    //   throw new Error('⚠️ 프로덕션 환경에서는 시딩을 실행하지 않습니다');
    // }

    // if (!process.env.DATABASE_URL?.includes('localhost')) {
    //   throw new Error(
    //     '⚠️ localhost 데이터베이스에만 시딩을 실행할 수 있습니다',
    //   );
    // }

    console.log('🌱 시딩 시작...');

    this.#hashedPassword = await hashPasswordArgon2id(
      seedConstants.SEED_PASSWORD,
    );

    await this.#resetDb();
    console.log('🗑️ 기존 데이터 삭제 완료');

    const users = await this.#seedUsers();
    console.log(`👥 ${users.length}명의 유저가 생성되었습니다`);
    console.log(`🔑 모든 유저의 비밀번호: ${seedConstants.SEED_PASSWORD}`);

    await this.#seedSocialAccounts(users);
    console.log('🔗 소셜 계정 데이터 생성 완료');

    await this.#seedRefreshTokens(users);
    console.log('🔐 리프레시 토큰 데이터 생성 완료');

    const challenges = await this.#seedChallenges(users);
    console.log(`🎯 ${challenges.length}개의 챌린지가 생성되었습니다`);

    await this.#seedParticipants(challenges, users);
    console.log('👋 참여자 데이터 생성 완료');

    await this.#seedWorksCommentsLikes(challenges);
    console.log('📄 작업물·댓글·좋아요 데이터 생성 완료');

    await this.#seedNotifications(users);
    console.log('🔔 알림 데이터 생성 완료');

    console.log('✅ 데이터 시딩 완료');
  }
}

const adapter = new PrismaPg({
  // Migrate는 `directUrl`을 쓰지만, 이 시드 스크립트는 직접 Prisma adapter를 구성하므로
  // 가능하면 DIRECT_URL(직접 커넥션)로 붙도록 우선순위를 둡니다.
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
const seeder = new Seeder(
  prisma,
  seedConstants.USERS_COUNT,
  seedConstants.CHALLENGES_COUNT,
);

seeder
  .run()
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
