import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { fakerKO as faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import * as seedConstants from './seed.constants.js';

class Seeder {
  #prisma;
  #numUsersToCreate;
  #numChallengesToCreate;
  #hashedPassword;

  constructor(prisma, numUsersToCreate = seedConstants.USERS_COUNT, numChallengesToCreate = seedConstants.CHALLENGES_COUNT) {
    this.#prisma = prisma;
    this.#numUsersToCreate = numUsersToCreate;
    this.#numChallengesToCreate = numChallengesToCreate;
  }

  #xs(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  async #resetDb() {
    return this.#prisma.$transaction([
      this.#prisma.like.deleteMany(),
      this.#prisma.comment.deleteMany(),
      this.#prisma.work.deleteMany(),
      this.#prisma.participant.deleteMany(),
      this.#prisma.notification.deleteMany(),
      this.#prisma.challenge.deleteMany(),
      this.#prisma.profile.deleteMany(),
      this.#prisma.user.deleteMany(),
    ]);
  }

  async #seedUsers() {
    const users = [];

    for (let i = 0; i < this.#numUsersToCreate; i += 1) {
      const email = faker.internet.email();
      const nickname = faker.person.firstName();

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
      const status =
        i === 0
          ? 'RECRUITING'
          : faker.helpers.arrayElement(seedConstants.CHALLENGE_STATUSES);

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
          deadline: faker.date.soon({
            days: seedConstants.CHALLENGE_DEADLINE,
          }),
          maxParticipants: faker.number.int({
            min: seedConstants.CHALLENGE_MIN_PARTICIPANTS,
            max: seedConstants.CHALLENGE_MAX_PARTICIPANTS,
          }),
          status,
        },
      });

      challenges.push(challenge);
    }

    return challenges;
  }

  async #seedParticipants(challenges, users) {
    const recruitingStatus = 'RECRUITING';
    const recruitingChallenges = challenges.filter(
      (c) => c.status === recruitingStatus,
    );

    for (const challenge of recruitingChallenges) {
      const participants = faker.helpers.arrayElements(users, {
        min: seedConstants.APPLICANTS_MIN,
        max: Math.min(seedConstants.APPLICANTS_MAX, users.length),
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

      for (const participant of participants) {
        const work = await this.#prisma.work.create({
          data: {
            challengeId: challenge.id,
            participantId: participant.id,
            userId: participant.userId,
            content: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: faker.helpers
                        .arrayElement(seedConstants.WORK_CONTENT_TEMPLATES)
                        .replace(
                          '{topic}',
                          faker.helpers.arrayElement(
                            seedConstants.CHALLENGE_TOPIC_TEMPLATES,
                          ),
                        ),
                    },
                  ],
                },
              ],
            }),
          },
        });

        const commenters = await this.#prisma.user.findMany({
          take: seedConstants.COMMENTERS_TAKE,
          orderBy: { createdAt: 'desc' },
        });

        for (const commenter of commenters) {
          await this.#prisma.comment.create({
            data: {
              workId: work.id,
              authorId: commenter.id,
              content: faker.helpers.arrayElement(
                seedConstants.COMMENT_TEMPLATES,
              ),
            },
          });
        }

        const likers = await this.#prisma.user.findMany({
          take: seedConstants.LIKERS_TAKE,
          orderBy: { createdAt: 'asc' },
        });

        for (const liker of likers) {
          await this.#prisma.like.upsert({
            where: {
              workId_userId: {
                workId: work.id,
                userId: liker.id,
              },
            },
            create: {
              workId: work.id,
              userId: liker.id,
            },
            update: {},
          });
        }

        const likeCount = await this.#prisma.like.count({
          where: { workId: work.id },
        });

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
        await this.#prisma.notification.create({
          data: {
            userId: user.id,
            message: faker.helpers.arrayElement(
              seedConstants.NOTIFICATION_TEMPLATES,
            ),
            targetType: faker.helpers.arrayElement(
              seedConstants.NOTIFICATION_TYPES,
            ),
            targetId: null,
            targetUrl: null,
            isRead: faker.helpers.arrayElement([true, false]),
          },
        });
      }
    }
  }

  async run() {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('⚠️ 프로덕션 환경에서는 시딩을 실행하지 않습니다');
    }

    if (!process.env.DATABASE_URL?.includes('localhost')) {
      throw new Error(
        '⚠️ localhost 데이터베이스에만 시딩을 실행할 수 있습니다',
      );
    }

    console.log('🌱 시딩 시작...');

    this.#hashedPassword = await bcrypt.hash(seedConstants.SEED_PASSWORD, 10);

    await this.#resetDb();
    console.log('🗑️ 기존 데이터 삭제 완료');

    const users = await this.#seedUsers();
    console.log(`👥 ${users.length}명의 유저가 생성되었습니다`);
    console.log(`🔑 모든 유저의 비밀번호: ${seedConstants.SEED_PASSWORD}`);

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
  connectionString: process.env.DATABASE_URL,
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
