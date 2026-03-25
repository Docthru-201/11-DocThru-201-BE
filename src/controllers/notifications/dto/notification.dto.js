import { NotificationType } from '#generated/prisma/enums.ts';
import { z } from 'zod';
import { idParamSchema, ulidSchema } from '../../schemas/baseSchema.js';

export const notificationIdParamSchema = idParamSchema;
export const createNotificationSchema = z.object({
  userId: z.string().trim().nonempty('알림을 수신할 ID가 필요합니다.'),
  message: z.string().trim().nonempty('알림 내용이 필요합니다.'),
  targetType: z.enum(NotificationType),
  targetId: ulidSchema.optional(),
  targetUrl: z.url('올바른 URL 형식으로 입력해 주세요').optional(),
});

export const getMyNotificationsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  targetType: z.enum(NotificationType).optional(),
});

export const readNotificationSchema = z.object({
  isRead: z.boolean(),
});
