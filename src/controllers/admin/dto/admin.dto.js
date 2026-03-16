// TODO: 어드민 전용 검증 스키마
import { z } from 'zod';

// 1. 신청 내역 리스트 조회 (GET /admin/challenges)
export const getAllChallengesScheme = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().min(1).max(100)),
  sort: z
    .enum([
      'pending',
      'approved',
      'rejected',
      'createdAt_asc',
      'createdAt_desc',
      'deadline_asc',
      'deadline_desc',
    ])
    .optional(),
  keyword: z.string().trim().optional(),
  userId: z.string().optional(),
});

// 승인/거절 처리 (PATCH /admin/challenges/:challengesId)
export const updateChallengeStatusScheme = {
  params: z.object({
    challengeId: z.string().min(1, '챌린지 ID는 필수입니다.'),
  }),

  body: z
    .object({
      status: z.enum(['APPROVED', 'REJECTED']),
      declineReason: z.string().max(200).optional(),
    })
    .refine(
      (data) => {
        if (data.status === 'REJECTED' && !data.declineReason?.trim())
          return false;
        return true;
      },
      { message: '거절 사유 필수', path: ['declineReason'] },
    ),
};
