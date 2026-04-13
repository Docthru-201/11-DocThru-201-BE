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
  NICKNAME_ALREADY_EXISTS: '이미 사용하고 있는 닉네임입니다.',
  INVALID_LOGIN: '유효하지 않은 로그인 정보입니다.',
  /** IP 기반 일시 차단(브루트포스 등). 클라이언트에 상세 사유 미노출 */
  ACCESS_TEMPORARILY_BLOCKED:
    '접근이 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.',
  PASSWORD_RESET_LINK_INVALID:
    '유효하지 않거나 만료된 비밀번호 재설정 링크입니다.',

  // Profile 관련
  PROFILE_NOT_FOUND: 'Profile not found',

  NO_AUTH_TOKEN: '인증 토큰이 없습니다.',
  INVALID_TOKEN: '유효하지 않거나 만료된 토큰입니다.',
  USER_NOT_FOUND_FROM_TOKEN: '토큰에 해당하는 사용자를 찾을 수 없습니다.',
  AUTH_FAILED: '인증에 실패했습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',

  INVALID_INPUT: '잘못된 입력값입니다.',
  VALIDATION_FAILED: '입력값 검증에 실패했습니다.',

  /** 쿠키 기반 요청 CSRF 방어: Origin/Referer가 허용 목록에 없음 */
  CSRF_ORIGIN_INVALID:
    '허용되지 않은 출처에서의 요청입니다. CORS_ORIGINS와 동일한 Origin으로 호출해 주세요.',
  /** 프로덕션에서 CORS_ORIGINS 미설정 시 상태 변경 요청 차단 */
  CSRF_CORS_NOT_CONFIGURED:
    '서버에 CORS_ORIGINS가 설정되어 있지 않아 요청을 거절했습니다. 운영 설정을 확인해 주세요.',

  RESOURCE_NOT_FOUND: '리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  RESOURCE_CONFLICT: '이미 존재하는 리소스입니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',

  //challenge 관련 실패메시지 추가
  USER_ID_REQUIRED: '사용자 아이디가 필요합니다.',
  CHALLENGE_ID_REQUIRED: '챌린지 아이디가 필요합니다.',
  CHALLENGE_NOT_FOUND: '존재하지 않는 챌린지입니다.',
  CHALLENGE_ALREADY_CLOSED: '이미 마감된 챌린지입니다.',
  REQUIRED_FIELDS_MISSING: '필수 입력 항목이 누락되었습니다.',
  ADMIN_ONLY_ACCESS: '관리자 권한이 필요한 요청입니다.',
  CANNOT_MODIFY_CLOSED_CHALLENGE: '이미 완료된 챌린지는 수정할 수 없습니다.',
  ADMIN_ONLY_EDIT: '관리자만 수정할 수 있습니다.',
  ALREADY_SUBMITTED_WORK: '이미 등록된 작업물이 있습니다.',

  // notification 관련
  NOTIFICATION_NOT_FOUND: '알림을 찾을 수 없습니다.',
};
//성공메시지 추가
export const SUCCESS_MESSAGE = {
  PASSWORD_RESET_COMPLETED: '비밀번호가 변경되었습니다.',
  WORK_CREATED: '작업물이 성공적으로 등록되었습니다.',
  WORK_UPDATED: '작업물이 수정되었습니다.',
  WORK_DELETED: '작업물이 삭제되었습니다.',
  WORK_FETCHED: '작업물 조회가 완료되었습니다.',

  CHALLENGE_CREATED: '챌린지가 생성되었습니다.',

  REQUEST_PROCESSED: '요청이 성공적으로 처리되었습니다.',
  /** 비밀번호 재설정 요청 — 계정 존재 여부와 무관하게 동일 응답 */
  PASSWORD_RESET_REQUEST_ACCEPTED:
    '요청이 접수되었습니다. 등록된 이메일이 있으면 안내를 보냅니다.',
};
