// Prisma 에러 코드 상수
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};

export const ERROR_MESSAGE = {
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  EMAIL_REQUIRED: '이메일은 필수 입력 항목입니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  FAILED_TO_FETCH_USERS: '사용자 목록 조회에 실패했습니다.',
  FAILED_TO_FETCH_USER: '사용자 조회에 실패했습니다.',
  FAILED_TO_CREATE_USER: '사용자 생성에 실패했습니다.',
  FAILED_TO_UPDATE_USER: '사용자 수정에 실패했습니다.',
  FAILED_TO_DELETE_USER: '사용자 삭제에 실패했습니다.',
  NICKNAME_ALREADY_EXISTS: 'Nickname already exists',
  INVALID_LOGIN: 'Invalid login credentials',

  // Profile 관련
  PROFILE_NOT_FOUND: 'Profile not found',

  NO_AUTH_TOKEN: '인증 토큰이 없습니다.',
  INVALID_TOKEN: '유효하지 않거나 만료된 토큰입니다.',
  USER_NOT_FOUND_FROM_TOKEN: '토큰에 해당하는 사용자를 찾을 수 없습니다.',
  AUTH_FAILED: '인증에 실패했습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',

  // 일반 에러 (Exception 기본값으로 사용)
  RESOURCE_NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  RESOURCE_CONFLICT: 'Resource already exists',
  INTERNAL_SERVER_ERROR: 'Internal server error',

  //challenge 관련
  CHALLENGE_NOT_FOUND: '존재하지 않는 챌린지입니다.',
  NO_AUTHORITY_TO_UPDATE: '수정 권한이 없습니다.',
  N0_AUTHORITY_TO_DELETE: '삭제 권한이 없습니다.',
  INVALID_INPUT: '잘못된 입력값입니다.',
  VALIDATION_FAILED: '입력값 검증에 실패했습니다.',

  RESOURCE_NOT_FOUND: '리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  RESOURCE_CONFLICT: '이미 존재하는 리소스입니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
};
