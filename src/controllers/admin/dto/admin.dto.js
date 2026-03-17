// TODO: 어드민 전용 검증 스키마
import { z } from 'zod';
import { ChallengeStatus } from '#generated/prisma/enums.ts';
const ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

// 1. 신청 내역 리스트 조회 (GET /admin/challenges)
export const getAllChallengesScheme = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

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
  userId: z.string().regex(ULID_REGEX, '유효하지 않은 사용자 ID 형식입니다.').optional(),
});

// 승인/거절 처리 (PATCH /admin/challenges/:challengesId)
export const updateChallengeStatusScheme = {
  params: z.object({
    challengeId: z
      .string()
      .min(1,'챌린지 ID는 필수 입력 사항입니다.')
      .regex(ULID_REGEX, '유효하지 않은 챌린지 ID 형식입니다.'),
  }),

  body: z
    .object({
      status: z.nativeEnum(ChallengeStatus),
      declineReason: z.string().max(200).optional(),
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
