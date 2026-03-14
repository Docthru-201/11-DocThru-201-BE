import { Category, ChallengeStatus, Type } from '#generated/prisma/enums.js';
import { z } from 'zod';

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/i; // ulid 정규식

export const listChallengesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(Type).optional(),
  category: z.enum(Category).optional(),
  status: z.enum(ChallengeStatus).optional(),
  isClosed: z.string().optional(),
});

export const challengeIdParamSchema = z.object({
  id: z.string().trim().regex(ULID_REGEX, '유효한 ID 형식이 아닙니다.'), //.ulid() 취소선생김.
});

export const createChallengeSchema = z.object({
  title: z.string().trim().nonempty('제목을 입력해 주세요.'),
  originalUrl: z.url('올바른 URL 형식으로 입력해 주세요'),
  type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }),
  category: z.enum(Category, { required_error: '카테고리를 선택해 주세요' }),
  description: z.string().trim().nonempty('설명을 입력해 주세요'),
  deadline: z.coerce.date({ required_error: '마감일을 정해주세요.' }), //.datetime() 취소선생김 z.coerce.date()로 사용하는게 명확
  maxParticipants: z
    .number()
    .int()
    .positive('참가자는 1명 이상 이어야 합니다.'),
});

export const updateChallengeSchema = z
  .object({
    title: z.string().trim().nonempty('제목을 입력해 주세요').optional(),
    originalUrl: z.url('올바른 URL 형식으로 입력해 주세요').optional(),
    type: z.enum(Type, { required_error: '타입을 선택해 주세요.' }).optional(),
    category: z
      .enum(Category, { required_error: '카테고리를 선택해 주세요' })
      .optional(),
    description: z.string().trim().nonempty('설명을 입력해 주세요').optional(),
    deadline: z.coerce
      .date({ required_error: '마감일을 정해주세요.' })
      .optional(),
    maxParticipants: z
      .number()
      .int()
      .positive('참가자는 1명 이상 이어야 합니다.')
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.originalUrl !== undefined ||
      data.type !== undefined ||
      data.category !== undefined ||
      data.description !== undefined ||
      data.deadline !== undefined ||
      data.maxParticipants !== undefined,
    {
      message: '수정할 필드가 하나 이상 필요합니다.',
    },
  );
