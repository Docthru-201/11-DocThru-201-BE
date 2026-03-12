import { ForbiddenException, NotFoundException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants';

export class UsersService {
  #usersRepo;
  #passwordProvider;

  constructor({ usersRepo, passwordProvider }) {
    this.#usersRepo = usersRepo;
    this.#passwordProvider = passwordProvider;
  }

  // 1️⃣ 내 기본 정보 조회
  async getMyInfo(userId) {
    const user = await this.#usersRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }
    return user;
  }

  // 2️⃣ 내 정보 수정 (닉네임, 이미지)
  async updateMyInfo(userId, data) {
    const user = await this.#usersRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return await this.#usersRepo.updateUser(userId, data);
  }

  // 3️⃣ 내 계정 삭제
  async deleteMyAccount(userId) {
    const user = await this.#usersRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    await this.#usersRepo.deleteUser(userId);
  }

  // 4️⃣ 특정 유저 기본 정보 조회
  async getUserBasicInfo(userId) {
    const user = await this.#usersRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    // 공개 가능한 기본 정보만 반환 (nickname, image 등)
    const { id, nickname, image } = user;
    return { id, nickname, image };
  }

  // 5️⃣ 전체 유저 조회 (필요시)
  async listUsers() {
    return await this.#usersRepo.findAllUsers();
  }
}
