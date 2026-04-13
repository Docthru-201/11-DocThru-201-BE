import cron from 'node-cron';

export class DeadlineScheduler {
  #challengeRepository;
  #notificationsService;

  constructor({ challengeRepository, notificationsService }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
  }

  // 실제 마감 처리 로직
  async processCloseChallenges() {
    try {
      const currentTime = new Date();
      const challenges =
        await this.#challengeRepository.findEndedChallenges(currentTime);

      for (const challenge of challenges) {
        const closedAt = currentTime.toISOString().slice(0, 10);

        const recipientIds = [
          challenge.authorId,
          ...(challenge.participants?.map(
            (participant) => participant.userId,
          ) || []),
        ].filter(Boolean);

        const uniqueRecipientIds = [...new Set(recipientIds)];

        await this.#challengeRepository.closeChallenge(challenge.id);

        if (!this.#notificationsService || uniqueRecipientIds.length === 0) {
          continue;
        }

        const message = `'${challenge.title}' 챌린지가 마감되었어요. (${closedAt})`;

        await Promise.all(
          uniqueRecipientIds.map((recipientId) =>
            this.#notificationsService.createNotification({
              userId: recipientId,
              type: 'CLOSED',
              targetId: challenge.id,
              targetUrl: `/challenges/${challenge.id}`,
              message,
            }),
          ),
        );
      }

      console.log(
        `[${currentTime.toLocaleString()}] 스케줄러: ${challenges.length}건 처리 완료`,
      );
    } catch (error) {
      console.error('스케줄러 실행 오류:', error);
    }
  }

  // 스케줄 등록 및 시작
  start() {
    // 1. 서버 시작 시 즉시 한 번 실행
    this.processCloseChallenges();

    // 2. 매일 자정 실행 예약
    cron.schedule('0 0 * * *', () => this.processCloseChallenges(), {
      timezone: 'Asia/Seoul',
    });

    console.log('🚀 데드라인 스케줄러가 활성화되었습니다.');
  }
}
