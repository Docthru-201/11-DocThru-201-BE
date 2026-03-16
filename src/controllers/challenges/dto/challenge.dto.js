import { z } from 'zod';
import { Category, ChallengeStatus, Type } from '#generated/prisma/enums.js';

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LIMIT = 500;
const TITLE_MAX_LENGTH = 100;
const TITLE_MIN_LENGTH = 1;
const REASON_MAX_LIMIT = 255;
const PARTICIPANT_MIN_LIMIT = 1;

// export const listChallengesQuerySchema = z.object({}); // TODO: 추후 페이지네이션 추가

export const ulidSchema = z.ulid({
  message: `유효한 id 형식(ULID)이 아닙니다.`,
});
export const challengeIdParamSchema = z.object({
  id: ulidSchema,
});

export const createChallengeSchema = z.object({
  title: z
    .string()
    .min(
      TITLE_MIN_LENGTH,
      `제목은 최소 ${TITLE_MIN_LENGTH}글자 이상 입력해주세요.`,
    )
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자를 넘을 수 없습니다.`), // 101자 에러
  originalUrl: z.url(),
  type: z.enum(Type, { required_error: `타입을 선택해 주세요.` }),
  category: z.enum(Category, { required_error: `카테고리를 선택해 주세요.` }),
  description: z
    .string()
    .trim()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `챌린지 설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상 상세히 적어주세요.`,
    )
    .max(
      DESCRIPTION_MAX_LIMIT,
      `설명은 ${DESCRIPTION_MAX_LIMIT}자를 넘길 수 없습니다.`,
    ),
  deadline: z.iso.datetime(),
  maxParticipants: z
    .number()
    .int(`참가자 수는 정수로 입력해주세요.`)
    .min(
      PARTICIPANT_MIN_LIMIT,
      `참가자는 최소 ${PARTICIPANT_MIN_LIMIT}명 이상이어야 합니다.`,
    ),
});

export const updateChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      TITLE_MIN_LENGTH,
      `제목은 최소 ${TITLE_MIN_LENGTH}자 이상 입력해주세요.`,
    )
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자를 넘을 수 없습니다.`),
  originalUrl: z.url(`올바른 웹 주소 형식이 아닙니다.`), // http://, https:// 포함
  type: z.enum(Type, { required_error: `타입을 선택해 주세요.` }),
  category: z.enum(Category, { required_error: `카테고리를 선택해 주세요.` }),
  description: z
    .string()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `수정할 설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상 상세히 적어주세요.`,
    )
    .max(
      DESCRIPTION_MAX_LIMIT,
      `설명은 ${DESCRIPTION_MAX_LIMIT}자를 넘길 수 없습니다.`,
    ),
  deadline: z
    .string()
    .trim()
    .iso.datetime(`올바른 날짜와 시간 형식이 아닙니다.`),
  maxParticipants: z
    .number()
    .int(`참가자 수는 정수로 입력해주세요.`)
    .min(
      PARTICIPANT_MIN_LIMIT,
      `참가자는 최소 ${PARTICIPANT_MIN_LIMIT}명 이상이어야 합니다.`,
    ),
  status: z.enum(ChallengeStatus),
  declineReason: z
    .string()
    .trim()
    .max(
      REASON_MAX_LIMIT,
      `거절 사유가 너무 깁니다. ${REASON_MAX_LIMIT}자를 넘기지 마세요.`,
    )
    .optional(),
});
