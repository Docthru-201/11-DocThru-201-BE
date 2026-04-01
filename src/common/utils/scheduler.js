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
        const message =
          this.#notificationsService.notificationMessages.challengeEnd(
            challenge.title,
          );
        const targetIds = [
          challenge.authorId,
          ...(challenge.participants?.map((p) => p.userId) || []),
        ];

        await Promise.all(
          targetIds.map((id) =>
            this.#notificationsService.createNotification({
              userId: id,
              message: message,
              type: 'CLOSED',
            }),
          ),
        );

        await this.#challengeRepository.closeChallenge(challenge.id);
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
      scheduled: true,
      timezone: 'Asia/Seoul',
    });

    console.log('🚀 데드라인 스케줄러가 활성화되었습니다.');
  }
}
