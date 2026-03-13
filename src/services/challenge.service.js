export class ChallengesService {
  #challengeRepository;
  #notificationsService;

  constructor({ challengeRepository, notificationsService }) {
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
  }

  // Admin 챌린지 관리 조회
  async getAllChallenges({
    page = 1,
    pageSize = 10,
    sort = 'createdAt_desc',
    keyword,
    userId,
  }) {
    const offset = (page - 1) * pageSize;

    const options = {
      skip: offset,
      take: pageSize,
      orderBy: {},
      where: {},
    };

    if (userId) {
      options.where.authorId = userId;
    }

    if (['pending_approval', 'recruting', 'rejected'].includes(sort)) {
      options.where.adminStatus = sort.toUpperCase();
    }

    if (sort === 'createdAt_asc') {
      options.orderBy = { createdAt: 'asc' };
    } else if (sort === 'createdAt_desc') {
      options.orderBy = { createdAt: 'desc' };
    } else if (sort === 'deadline_asc') {
      options.orderBy = { deadline: 'asc' };
    } else if (sort === 'deadline_desc') {
      options.orderBy = { deadline: 'desc' };
    }

    if (keyword) {
      const keywordFilter = {
        OR: [
          { challenge: { title: { contains: keyword, mode: 'insensitive' } } },
          {
            challenge: {
              description: { contains: keyword, mode: 'insensitive' },
            },
          },
        ],
      };
      options.where = { ...options.where, ...keywordFilter };
    }

    return this.#challengeRepository.findAllChallenges(options);
  }

  // Admin 챌린지 관리 - 상세 조회(이전/이후 페이지 포함)
  async getChallengeDetailById(challengeId) {
    return await this.#challengeRepository.findChallengeDetailById(challengeId);
  }

  // Admin 챌린지 신청승인/신청거절
  async updateChallengeStatus(challengeId, data, userId) {
    try {
      const challenge = await this.#challengeRepository.findChallengeById(challengeId);
      if (challenge.isClosed) {
        const error = new Error('완료된 챌린지는 수정 및 삭제가 불가능합니다.');
        error.statusCode = 403;
        throw error;
      }
      
      const updatedChallenge = await this.#challengeRepository.updateChallengeStatus(
        challengeId,
        data,
      );

      // // 알림 전송
      // if (challenge.authorId !== userId) {
      //   const { adminStatus, adminMessage } = updatedChallenge;
      //   let message;

      //   if (['REJECTED', 'DELETED'].includes(adminStatus)) {
      //     message = this.#notificationsService.notificationMessages.adminAction(
      //       challenge.title,
      //       adminStatus,
      //       adminMessage,
      //     );
      //   } else {
      //     message = this.#notificationsService.notificationMessages.challengeStatusChange(
      //       challenge.title,
      //       adminStatus,
      //     );
      //   }

      //   await this.#notificationsService.createNotification(
      //     challenge.authorId,
      //     message,
      //   );
      // }

      return updatedChallenge;
    } catch (e) {
      // Prisma 에러 및 커스텀 에러 처리
      if (e.code === 'P2025') {
        const error = new Error('챌린지를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
      }
      throw e; 
    }
  }
}