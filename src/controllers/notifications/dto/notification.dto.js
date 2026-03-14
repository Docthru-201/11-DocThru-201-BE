import { NotificationType } from '#generated/prisma/enums.js';
import { z } from 'zod';

export const notificationIdParamSchema = z.object({
  id: z.string(),
});
export const createNotificationSchema = z.object({
  userId: z.string().trim().nonempty('알림을 수신할 ID가 필요합니다.'),
  message: z.string().trim().nonempty('알림 내용이 필요합니다.'),
  targetType: z.enum(NotificationType),
  targetId: z.string().optional(),
  targetUrl: z.string().optional(),
});

export const getMyNotificationsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  targetType: z.enum(NotificationType).optional(),
});

export const readNotificationSchema = z.object({
  isRead: z.boolean(),
});
