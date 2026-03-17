import { z } from 'zod';
import { Category, ChallengeStatus, Type } from '#generated/prisma/enums.ts';

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LIMIT = 500;
const TITLE_MAX_LENGTH = 100;
const REASON_MAX_LIMIT = 255;

export const ulidSchema = z.ulid({
  message: `유효한 id 형식(ULID)이 아닙니다.`,
});

// GET /challenges
// 페이지네이션 쿼리 확정해서 수정 필요
export const listChallengesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(Type).optional(),
  category: z.enum(Category).optional(),
  status: z.enum(ChallengeStatus).optional(),
  isClosed: z.string().optional(),
});

export const challengeIdParamSchema = z.object({
  id: ulidSchema,
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
      DESCRIPTION_MAX_LIMIT,
      `설명은 ${DESCRIPTION_MAX_LIMIT}자 이하여야 합니다.`,
    ),
  deadline: z.iso.datetime({ required_error: '마감일을 정해주세요.' }),
  maxParticipants: z.number().int().min(1, '참가자는 1명 이상 이어야 합니다.'),
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
      DESCRIPTION_MAX_LIMIT,
      `설명은 ${DESCRIPTION_MAX_LIMIT}자를 넘길 수 없습니다.`,
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
      REASON_MAX_LIMIT,
      `거절 사유가 너무 깁니다. ${REASON_MAX_LIMIT}자를 넘기지 마세요.`,
    ),
});
