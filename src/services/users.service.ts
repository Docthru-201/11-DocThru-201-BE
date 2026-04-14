// src/services/users.service.js
import { ConflictException, NotFoundException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants';
import type { UserRepository } from '#repositories';

export class UsersService {
  #userRepository: UserRepository;

  // 생성자 주입 이름을 userRepository로 변경하여 컨테이너와 일치시킵니다.
  constructor({ userRepository }: { userRepository: UserRepository }) {
    this.#userRepository = userRepository;
  }

  // 1️⃣ ID로 내 정보 조회 (전체 필드)
  async getUserById(userId: string) {
    const user = await this.#userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    // 비밀번호 제외하고 반환 (보안 강화)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: string, data: Record<string, unknown>) {
    const user = await this.#userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    if (data.nickname && data.nickname !== user.nickname) {
      const exist = await this.#userRepository.findUserByNickname(
        data.nickname as string,
      );

      if (exist) {
        throw new ConflictException(ERROR_MESSAGE.NICKNAME_ALREADY_EXISTS);
      }
    }

    return this.#userRepository.updateUser(userId, data);
  }

  // 3️⃣ 계정 삭제
  async deleteUser(userId: string) {
    const user = await this.#userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return this.#userRepository.deleteUser(userId);
  }

  // 4️⃣ 다른 유저 공개 프로필 조회
  async getPublicProfile(userId: string) {
    const user = await this.#userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const { id, nickname, image, grade, profile } = user;
    return {
      id,
      nickname,
      image,
      grade,
      introduction: profile?.introduction ?? null,
    };
  }

  // 5️⃣ 전체 유저 목록 조회
  async getAllUsers() {
    return this.#userRepository.findAllUsers();
  }
}
