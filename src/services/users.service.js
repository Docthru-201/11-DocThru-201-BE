// src/services/UsersService.js
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '#exceptions';
import { ERROR_MESSAGE } from '#constants';

export class UsersService {
  #userRepository;
  #passwordProvider;

  constructor({ userRepository, passwordProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
  }

  // 1️⃣ 모든 유저 조회
  async listUsers() {
    return await this.#userRepository.findAll();
  }

  // 2️⃣ 유저 상세 조회
  async getUserDetail(id) {
    const user = await this.#userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }
    return user;
  }

  // 3️⃣ 회원가입
  async signup({ email, password, nickname }) {
    // 1. 이메일 중복 체크
    const existingUser = await this.#userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_USED);
    }

    // 2. 비밀번호 해시 처리
    const hashedPassword = await this.#passwordProvider.hash(password);

    // 3. DB에 유저 생성
    const user = await this.#userRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });

    return user;
  }

  // 4️⃣ 유저 정보 수정 (프로필/닉네임/비밀번호)
  async updateUser(id, reqUserId, data) {
    // 1. 요청자 검증 (본인만 수정 가능)
    if (Number(reqUserId) !== Number(id)) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    // 2. 존재 여부 확인
    const existingUser = await this.#userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    // 3. 비밀번호가 있으면 해시 처리
    if (data.password) {
      data.password = await this.#passwordProvider.hash(data.password);
    }

    // 4. 이메일 중복 체크 (email이 변경된 경우)
    if (data.email && data.email !== existingUser.email) {
      const duplicate = await this.#userRepository.findByEmail(data.email);
      if (duplicate) {
        throw new ConflictException(ERROR_MESSAGE.EMAIL_ALREADY_USED);
      }
    }

    // 5. DB 업데이트
    return await this.#userRepository.update(id, data);
  }

  // 5️⃣ 계정 삭제
  async deleteUser(id, reqUserId) {
    // 요청자 검증
    if (Number(reqUserId) !== Number(id)) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    // 존재 여부 확인
    const existingUser = await this.#userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    // DB 삭제
    await this.#userRepository.delete(id);
  }
}
