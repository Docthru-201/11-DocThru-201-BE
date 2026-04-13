import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import { ARGON2ID_HASH_OPTIONS } from '#utils/argon2-hash.js';

/** 기존 bcrypt 저장분 ($2a/$2b/$2y) — Argon2id는 `$argon2id$` 로 시작 */
const BCRYPT_HASH_PREFIX = /^\$2[aby]\$/;

export class PasswordProvider {
  async hash(password) {
    try {
      return await argon2.hash(password, ARGON2ID_HASH_OPTIONS);
    } catch {
      throw new Error('비밀번호 해싱 중 오류가 발생했습니다.');
    }
  }

  async compare(password, hashedPassword) {
    try {
      if (hashedPassword == null || hashedPassword === '') {
        return false;
      }
      if (BCRYPT_HASH_PREFIX.test(hashedPassword)) {
        return await bcrypt.compare(password, hashedPassword);
      }
      return await argon2.verify(hashedPassword, password);
    } catch {
      return false;
    }
  }
}
