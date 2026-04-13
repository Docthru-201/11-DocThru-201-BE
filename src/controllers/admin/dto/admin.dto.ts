// TODO: 어드민 전용 검증 스키마
import { z } from 'zod';
import { ChallengeStatus } from '#generated/prisma/enums.ts';
import { ADMIN_LIMITS, MAX_PAGE_SIZE, PAGINATION } from '#constants';
import { ulidSchema } from '../../schemas/baseSchema.js';

// 1. 신청 내역 리스트 조회 (GET /admin/challenges)
export const getAllChallengesScheme = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(PAGINATION.OFFSET_DEFAULT_PAGE_SIZE),

  sort: z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase())
    .pipe(
      z.union([
        z.nativeEnum(ChallengeStatus),
        z.enum([
          'CREATEDAT_ASC',
          'CREATEDAT_DESC',
          'DEADLINE_ASC',
          'DEADLINE_DESC',
        ]),
      ]),
    )
    .optional(),
  keyword: z.string().trim().optional(),
  userId: ulidSchema.optional(),
});

// 승인/거절 처리 (PATCH /admin/challenges/:challengesId)
export const updateChallengeStatusScheme = {
  params: z.object({
    challengeId: ulidSchema,
  }),

  body: z
    .object({
      status: z.nativeEnum(ChallengeStatus),
      declineReason: z
        .string()
        .max(ADMIN_LIMITS.DECLINE_REASON_MAX_LENGTH)
        .optional(),
    })
    .refine(
      (data) => {
        // 상태가 REJECTED일 때만 거절 사유 필수 체크
        if (
          data.status === ChallengeStatus.REJECTED &&
          !data.declineReason?.trim()
        ) {
          return false;
        }
        return true;
      },
      { message: '거절 사유를 입력해주세요.', path: ['declineReason'] },
    ),
};
