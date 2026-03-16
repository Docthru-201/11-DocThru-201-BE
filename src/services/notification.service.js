export class NotificationsService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async createNotification({ userId, type, message, targetId, targetUrl }) {
    if (!message) return null;

    return await this.#notificationRepository.create({
      userId,
      type,
      message,
      targetId,
      targetUrl,
    });
  }

  notificationMessages = {
    adminReviewResult: (title, status, reason) => {
      const statusText = status === 'REJECTED' ? '반려' : status === 'DELETED' ? '삭제' : '승인';
      const reasonText = reason ? ` (사유: ${reason})` : '';
      return `[${title}] 챌린지가 관리자에 의해 ${statusText}되었습니다.${reasonText}`;
    },

    challengeProgressUpdate: (title, status) => {
      return `[${title}] 챌린지의 진행 상태가 '${status}'로 업데이트되었습니다.`;
    }
  }; 

  async listMyNotifications(userId) {
  }

  async deleteMyNotification(notificationId, userId) {
  }

  async markAsRead(notificationId, userId) {
  }
} 