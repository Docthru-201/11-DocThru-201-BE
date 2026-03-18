import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { signupSchema, loginSchema } from '#controllers/auth/dto/auth.dto.js';
import { updateUserSchema } from '#controllers/users/dto/user.dto.js';
import {
  listChallengesQuerySchema,
  createChallengeSchema,
} from '#controllers/challenges/dto/challenge.dto.js';
import { ERROR_MESSAGE } from '#constants';

const idParamSchema = z.object({
  id: z.string().describe('사용자 ID'),
});

const userResponseSchema = z
  .object({
    id: z.string(), // z.number()에서 z.string()으로 변경!
    email: z.string().email(),
    nickname: z.string(),
    image: z.string().nullable().optional(),
    createdAt: z.string(), // ISOString 형태로 응답되므로 string 유지
    // Role이나 Grade도 추가하고 싶다면 아래처럼 가능합니다.
    role: z.enum(['USER', 'ADMIN']).optional(),
    grade: z.enum(['NORMAL', 'EXPERT']).optional(),
  })
  .meta({
    id: 'UserResponse',
    description: '사용자 공개 정보 응답',
  });

const usersResponseSchema = z.array(userResponseSchema).meta({
  id: 'UsersResponse',
  description: '사용자 목록 응답',
});

const pingResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({
    id: 'PingResponse',
    description: '서버 헬스 체크 응답',
  });

const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
  })
  .meta({
    id: 'ErrorResponse',
    description: '공통 에러 응답',
  });

const userIdPathSchema = idParamSchema.meta({
  id: 'UserIdPath',
});

const challengeSummarySchema = createChallengeSchema
  .extend({
    id: z.string().describe('챌린지 ID (ULID)'),
    authorId: z.string().describe('작성자 ID'),
    createdAt: z.string().describe('생성 시각 (ISO8601)'),
    updatedAt: z.string().describe('수정 시각 (ISO8601)'),
  })
  .partial({
    declineReason: true,
  })
  .meta({
    id: 'ChallengeSummary',
    description: '챌린지 목록용 요약 정보',
  });

const challengeListResponseSchema = z
  .object({
    challenges: z.array(challengeSummarySchema),
    nextCursor: z.string().nullable().describe('다음 페이지 조회용 커서'),
    hasNext: z.boolean().describe('다음 페이지 존재 여부'),
  })
  .meta({
    id: 'ChallengeListResponse',
    description: '커서 기반 챌린지 목록 응답',
  });

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'DI Express API',
    version: '1.0.0',
    description:
      'feature-based에서 layered architecture로 마이그레이션한 인증/사용자 API 문서',
  },
  tags: [
    {
      name: 'Health',
      description: '서버 상태 확인',
    },
    {
      name: 'Auth',
      description: '인증 관련 API',
    },
    {
      name: 'Users',
      description: '사용자 관리 API',
    },
    {
      name: 'Challenges',
      description: '챌린지 조회/생성 API',
    },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: '로그인 시 발급되는 Access Token 쿠키',
      },
    },
  },
  paths: {
    '/api/ping': {
      get: {
        tags: ['Health'],
        summary: '서버 상태 확인',
        responses: {
          200: {
            description: '서버 정상 응답',
            content: {
              'application/json': {
                schema: pingResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: '회원가입',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: signupSchema,
            },
          },
        },
        responses: {
          201: {
            description: '회원가입 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  ValidationError: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.VALIDATION_FAILED,
                    },
                  },
                },
              },
            },
          },
          409: {
            description: '이메일 중복',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  EmailConflict: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.EMAIL_ALREADY_EXISTS,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '로그인',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: loginSchema,
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  ValidationError: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.VALIDATION_FAILED,
                    },
                  },
                },
              },
            },
          },
          401: {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Unauthorized: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.INVALID_LOGIN,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: '로그아웃',
        responses: {
          204: {
            description: '로그아웃 성공',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '내 정보 조회',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '내 정보 조회 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          401: {
            description: '로그인 필요',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Unauthorized: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.UNAUTHORIZED,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: '전체 사용자 조회',
        responses: {
          200: {
            description: '사용자 목록 조회 성공',
            content: {
              'application/json': {
                schema: usersResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: '단일 사용자 조회',
        requestParams: {
          path: userIdPathSchema,
        },
        responses: {
          200: {
            description: '사용자 조회 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          404: {
            description: '사용자 없음',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  NotFound: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.USER_NOT_FOUND,
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: '사용자 수정',
        security: [{ accessTokenCookie: [] }],
        requestParams: {
          path: userIdPathSchema,
        },
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: updateUserSchema,
            },
          },
        },
        responses: {
          200: {
            description: '사용자 수정 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  ValidationError: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.VALIDATION_FAILED,
                    },
                  },
                },
              },
            },
          },
          401: {
            description: '로그인 필요',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Unauthorized: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.UNAUTHORIZED,
                    },
                  },
                },
              },
            },
          },
          403: {
            description: '본인 정보만 수정 가능',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Forbidden: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.FORBIDDEN,
                    },
                  },
                },
              },
            },
          },
          404: {
            description: '사용자 없음',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  NotFound: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.USER_NOT_FOUND,
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: '사용자 삭제',
        security: [{ accessTokenCookie: [] }],
        requestParams: {
          path: userIdPathSchema,
        },
        responses: {
          204: {
            description: '사용자 삭제 성공',
          },
          401: {
            description: '로그인 필요',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Unauthorized: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.UNAUTHORIZED,
                    },
                  },
                },
              },
            },
          },
          403: {
            description: '본인 계정만 삭제 가능',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  Forbidden: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.FORBIDDEN,
                    },
                  },
                },
              },
            },
          },
          404: {
            description: '사용자 없음',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  NotFound: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.USER_NOT_FOUND,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/challenges': {
      get: {
        tags: ['Challenges'],
        summary: '챌린지 목록 조회 (커서 기반 페이지네이션)',
        requestParams: {
          query: listChallengesQuerySchema,
        },
        responses: {
          200: {
            description: '챌린지 목록 조회 성공',
            content: {
              'application/json': {
                schema: challengeListResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
                examples: {
                  ValidationError: {
                    value: {
                      success: false,
                      message: ERROR_MESSAGE.VALIDATION_FAILED,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
