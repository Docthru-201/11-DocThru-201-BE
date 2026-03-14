import { ulid, z } from 'zod';

const typeEnum = z.enum(['NEXT_JS', 'API', 'CAREER', 'MODERN_JS', 'WEB']);
const categoryEnum = z.enum(['DOCUMENT', 'BLOG']);
const statusEnum = z.enum(['PENDING', 'APPROVAL', 'CLOSED', 'DELETED'], {
  error: '유효한 상태 값이 아닙니다.',
});

// export const listChallengesQuerySchema = z.object({}); // TODO: 추후 페이지네이션 추가

//나도 ⭐️수전전
export const ulidSchema = z
  .string()
  .trim()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, {
    message: '유효한 id 형식(ULID)이 아닙니다.',
  });

export const challengeIdParamSchema = z.object({
  id: ulidSchema,
});

export const createChallengeSchema = z.object({
  title: z
    .string({ required_error: '제목은 필수 입력 항목입니다.' }) //사용자가 제목 칸을 아예 비워두고 제출할 경우 에러가 발생할 수 있으니까
    .min(1, `제목은 최소 1글자 이상 입력해주세요.`)
    .max(100, `제목은 100자를 넘을 수 없습니다.`), // 101자 에러
  originalUrl: z.url(),
  type: typeEnum,
  category: categoryEnum,
  description: z
    .string()
    .min(10, `챌린지 설명은 최소 10자 이상 상세히 적어주세요.`)
    .max(500, `설명은 500자를 넘길 수 없습니다.`),
  deadline: z.string().datetime(),
  maxParticipants: z
    .number()
    .int(`참가자 수는 정수로 입력해주세요.`)
    .min(1, `참가자는 최소 1명 이상이어야 합니다.`),
});

export const updateChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, '제목은 최소 5자 이상 입력해주세요.')
    .max(100, `제목은 100자를 넘을 수 없습니다.`),
  originalUrl: z.url(`올바른 웹 주소 형식이 아닙니다.`), // http://, https:// 포함
  type: typeEnum,
  category: categoryEnum,
  description: z
    .string()
    .min(10, `수정할 설명은 최소 10자 이상 상세히 적어주세요.`)
    .max(500, `설명은 500자를 넘길 수 없습니다.`),
  deadline: z.string().trim().datetime(`올바른 날짜와 시간 형식이 아닙니다.`),
  maxParticipants: z
    .number()
    .int(`참가자 수는 정수로 입력해주세요.`)
    .min(1, `참가자는 최소 1명 이상이어야 합니다.`),
  status: statusEnum,
  declineReason: z
    .string()
    .trim()
    .max(255, `거절 사유가 너무 길고 장황합니다. 255자를 넘기지 마세요.`)
    .optional(),
});
