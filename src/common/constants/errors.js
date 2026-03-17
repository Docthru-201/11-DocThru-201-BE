// Prisma 에러 코드 상수
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};

// 에러 메시지 상수
export const ERROR_MESSAGE = {
  // User 관련
  USER_NOT_FOUND: 'User not found',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  FAILED_TO_FETCH_USERS: 'Failed to fetch users',
  FAILED_TO_FETCH_USER: 'Failed to fetch user',
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_UPDATE_USER: 'Failed to update user',
  FAILED_TO_DELETE_USER: 'Failed to delete user',

  // Auth 관련
  NO_AUTH_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND_FROM_TOKEN: 'User not found from token',
  AUTH_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid email or password',
  FORBIDDEN: 'Forbidden',
  UNAUTHORIZED: 'Unauthorized',

  // Validation
  INVALID_INPUT: 'Invalid input',
  VALIDATION_FAILED: 'Validation failed',

  // 일반 에러 (Exception 기본값으로 사용)
  RESOURCE_NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  RESOURCE_CONFLICT: 'Resource already exists',
  INTERNAL_SERVER_ERROR: 'Internal server error',

  //challenge 관련
  CHALLENGE_NOT_FOUND: '존재하지 않는 챌린지입니다.',
  NO_AUTHORITY_TO_UPDATE: '수정 권한이 없습니다.',
  N0_AUTHORITY_TO_DELETE: '삭제 권한이 없습니다.',
};
