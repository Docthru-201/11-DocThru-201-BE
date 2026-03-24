import { ERROR_MESSAGE } from '#constants';
import { NotFoundException } from '#exceptions';

export class NotificationsService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async createNotification({ userId, type, targetId, targetUrl, message }) {
    if (!message) return null;

    return await this.#notificationRepository.create({
      userId,
      type: targetType,
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

  async listMyNotifications({ userId, page, limit }) {
    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 10;
    const skip = (pageNum - 1) * perPage;
    const take = perPage;

    const notifications = await this.#notificationRepository.findManyByUserId(
      userId,
      { skip, take },
    );

    return notifications;
  }

  async deleteMyNotification({ userId, notificationId }) {
    const notification =
      await this.#notificationRepository.findById(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    // soft delete
    return await this.#notificationRepository.update(notificationId, {
      deletedAt: new Date(),
    });
  }

  async markAsRead({ notificationId, userId, isRead }) {
    const notification =
      await this.#notificationRepository.findById(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(ERROR_MESSAGE.NOTIFICATION_NOT_FOUND);
    }

    return await this.#notificationRepository.update(notificationId, {
      isRead: isRead ?? true,
      readAt: new Date(),
    });
  }
}
