import { ForbiddenException } from '../exceptions/http.exception.js';
// 네 프로젝트에서 쓰는 예외 파일 경로에 맞게 수정하면 됨

export function isAdmin(user) {
  return user.role === 'ADMIN';
}

export function requireAdmin(user) {
  if (user.role !== 'ADMIN') {
    throw new ForbiddenException('관리자만 가능합니다.');
  }
}
