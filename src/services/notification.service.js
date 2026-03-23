export class NotificationsService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async createNotification({ userId, type, targetId, targetUrl, message }) {
    if (!message) return null;

    return await this.#notificationRepository.create({
      userId,
      type,
      targetId,
      targetUrl,
      message,
    });
  }

  notificationMessages = {
    adminReviewResult: (title, status, reason) => {
      const statusText =
        status === 'REJECTED' ? '반려' : status === 'DELETED' ? '삭제' : '승인';
      const reasonText = reason ? ` (사유: ${reason})` : '';
      return `[${title}] 챌린지가 관리자에 의해 ${statusText}되었습니다.${reasonText}`;
    },

    challengeProgressUpdate: (title, status) => {
      return `[${title}] 챌린지의 진행 상태가 '${status}'로 업데이트되었습니다.`;
    },
    
    newWork: (challengeTitle) =>
    `'${challengeTitle}' 챌린지에 작업물이 추가되었어요`,
  };

  async listMyNotifications(userId) {}

  async deleteMyNotification(notificationId, userId) {}

  async markAsRead(notificationId, userId) {}
}
