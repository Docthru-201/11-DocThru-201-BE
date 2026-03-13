export class NotificationsService {
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  async createNotification() {}

  async listMyNotifications() {}

  async deleteMyNotification() {}

  async markAsRead() {}
}
