import argon2 from 'argon2';

/** 신규 저장·시드용 Argon2id 옵션 */
export const ARGON2ID_HASH_OPTIONS = {
  type: argon2.argon2id,
};

export async function hashPasswordArgon2id(password) {
  return argon2.hash(password, ARGON2ID_HASH_OPTIONS);
}
