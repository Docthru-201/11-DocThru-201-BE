import { z } from 'zod';
import { Category, ChallengeStatus, Type } from '#generated/prisma/enums.ts';
import { CHALLENGE_LIMITS } from '#constants';
import { idParamSchema, ulidSchema } from '../../schemas/baseSchema.js';

const {
  TITLE_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  DECLINE_REASON_MAX_LENGTH,
  CURSOR_LIST_LIMIT_DEFAULT,
  CURSOR_LIST_LIMIT_MAX,
} = CHALLENGE_LIMITS;

export const challengeIdParamSchema = idParamSchema;

// 커서 기반 페이지네이션
export const listChallengesQuerySchema = z.object({
  cursor: ulidSchema
    .optional()
    .describe('다음 페이지를 위한 커서(없으면 첫 페이지 조회)'),
  limit: z.coerce
    .number()
    .int()
    .min(1, { error: 'limit은 1 이상이어야 합니다.' })
    .max(CURSOR_LIST_LIMIT_MAX, {
      error: `limit은 ${CURSOR_LIST_LIMIT_MAX}이하여야 합니다.`,
    })
    .default(CURSOR_LIST_LIMIT_DEFAULT)
    .describe('한 번에 조회할 최대 개수'),
  type: z.enum(Type).optional().describe('챌린지 타입 필터'),
  category: z.enum(Category).optional().describe('카테고리 필터'),
  status: z.enum(ChallengeStatus).optional().describe('상태 필터'),
  keyword: z
    .string()
    .trim()
    .min(1, { error: 'keyword는 비어 있을 수 없습니다.' })
    .optional()
    .describe('제목/설명 검색 키워드'),
});

export const createChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해 주세요.')
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자를 넘을 수 없습니다.`), // 101자 에러
  originalUrl: z.url('올바른 URL 형식으로 입력해 주세요'),
  type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }),
  category: z.enum(Category, { required_error: '카테고리를 선택해 주세요' }),
  description: z
    .string()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상이어야 합니다.`,
    )
    .max(
      DESCRIPTION_MAX_LENGTH,
      `설명은 ${DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`,
    ),
  deadline: z.iso.datetime({ required_error: '마감일을 정해주세요.' }),
  maxParticipants: z.coerce
    .number()
    .int()
    .min(1, '참가자는 1명 이상 이어야 합니다.'),
});

export const updateChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해 주세요.')
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자를 넘을 수 없습니다.`),
  originalUrl: z.url(`올바른 웹 주소 형식이 아닙니다.`),
  type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }).optional(),
  category: z.enum(Category, { required_error: '카테고리를 선택해 주세요' }),
  description: z
    .string()
    .trim()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `수정할 설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상 상세히 적어주세요.`,
    )
    .max(
      DESCRIPTION_MAX_LENGTH,
      `설명은 ${DESCRIPTION_MAX_LENGTH}자를 넘길 수 없습니다.`,
    ),
  deadline: z.iso.datetime(`올바른 날짜와 시간 형식이 아닙니다.`),
  maxParticipants: z
    .number()
    .int(`참가자 수는 정수로 입력해주세요.`)
    .min(1, `참가자는 최소 1명 이상이어야 합니다.`),
  status: z.enum(ChallengeStatus),
  declineReason: z
    .string()
    .trim()
    .max(
      DECLINE_REASON_MAX_LENGTH,
      `거절 사유가 너무 깁니다. ${DECLINE_REASON_MAX_LENGTH}자를 넘기지 마세요.`,
    ),
});

export const myChallengesQuerySchema = z.object({
  tab: z.enum(['participating', 'done', 'applied']).default('participating'),
});
