import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { signUpSchema, loginSchema } from '#controllers/auth/dto/auth.dto.js';
import {
  createUserSchema,
  idParamSchema,
  updateUserSchema,
} from '#controllers/users/dto/users.dto.js';

const userResponseSchema = z
  .object({
    id: z.number().int().positive(),
    email: z.string().email(),
    name: z.string().nullable(),
    createdAt: z.string(),
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
              schema: signUpSchema,
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
              },
            },
          },
          409: {
            description: '이메일 중복',
            content: {
              'application/json': {
                schema: errorResponseSchema,
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
              },
            },
          },
          401: {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
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
      post: {
        tags: ['Users'],
        summary: '사용자 생성',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: createUserSchema,
            },
          },
        },
        responses: {
          201: {
            description: '사용자 생성 성공',
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
              },
            },
          },
          409: {
            description: '이메일 중복',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
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
              },
            },
          },
          401: {
            description: '로그인 필요',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          403: {
            description: '본인 정보만 수정 가능',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          404: {
            description: '사용자 없음',
            content: {
              'application/json': {
                schema: errorResponseSchema,
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
              },
            },
          },
          403: {
            description: '본인 계정만 삭제 가능',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          404: {
            description: '사용자 없음',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
  },
});
