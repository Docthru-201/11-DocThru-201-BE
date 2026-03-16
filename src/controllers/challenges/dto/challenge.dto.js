import { Category, ChallengeStatus, Type } from '#generated/prisma/enums.js';
import { z } from 'zod';

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LIMIT = 500;
const TITLE_MAX_LENGTH = 100;
const TITLE_MIN_LENGTH = 1;
const REASON_MAX_LIMIT = 255;
const PARTICIPANT_MIN_LIMIT = 1;

export const listChallengesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(Type).optional(),
  category: z.enum(Category).optional(),
  status: z.enum(ChallengeStatus).optional(),
  isClosed: z.string().optional(),
});

export const challengeIdParamSchema = z.object({
  id: z.ulid({ message: `유효한 id 형식(ULID)이 아닙니다.` }),
});

export const createChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(TITLE_MIN_LENGTH, '제목을 입력해 주세요.')
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자 이하여야 합니다.`),
  originalUrl: z.url('올바른 URL 형식으로 입력해 주세요'),
  type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }),
  category: z.enum(Category, { required_error: '카테고리를 선택해 주세요' }),
  description: z
    .string()
    .trim()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상이어야 합니다.`,
    )
    .max(
      DESCRIPTION_MAX_LIMIT,
      `설명은 ${DESCRIPTION_MAX_LIMIT}자 이하여야 합니다.`,
    ),
  deadline: z.iso.datetime({ required_error: '마감일을 정해주세요.' }),
  maxParticipants: z.coerce
    .number()
    .int()
    .min(PARTICIPANT_MIN_LIMIT, '참가자는 1명 이상 이어야 합니다.'),
});

export const updateChallengeSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(TITLE_MIN_LENGTH, '제목을 입력해 주세요.')
      .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자 이하여야 합니다.`)
      .optional(), //
    originalUrl: z.url('올바른 URL 형식으로 입력해 주세요').optional(),
    type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }).optional(),
    category: z
      .enum(Category, { required_error: '카테고리를 선택해 주세요' })
      .optional(),
    description: z
      .string()
      .trim()
      .min(
        DESCRIPTION_MIN_LENGTH,
        `설명은 최소 ${DESCRIPTION_MIN_LENGTH}자 이상이어야 합니다.`,
      )
      .max(
        DESCRIPTION_MAX_LIMIT,
        `설명은 ${DESCRIPTION_MAX_LIMIT}자 이하여야 합니다.`,
      )
      .optional(),
    deadline: z.iso.datetime({ required_error: '마감일을 정해주세요.' }),
    maxParticipants: z.coerce
      .number()
      .int()
      .min(PARTICIPANT_MIN_LIMIT, '참가자는 1명 이상 이어야 합니다.'),
    declineReason: z
      .string()
      .trim()
      .max(
        REASON_MAX_LIMIT,
        `거절 사유가 너무 길고 장황합니다. ${REASON_MAX_LIMIT}자를 넘기지 마세요.`,
      ),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.originalUrl !== undefined ||
      data.type !== undefined ||
      data.category !== undefined ||
      data.description !== undefined ||
      data.deadline !== undefined ||
      data.maxParticipants !== undefined ||
      data.declineReason !== undefined,
    {
      message: '수정 내용이 없습니다.',
    },
  );
