import { ForbiddenException, NotFoundException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants';

export class UsersService {
  #userRepository;
  #passwordProvider;

  constructor({ userRepository, passwordProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
  }

  async listUsers() {
    return await this.#userRepository.findAll();
  }

  async getUserDetail(id) {
    const user = await this.#userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return user;
  }

  async registerUser({ email, password, name }) {
    const hashedPassword = await this.#passwordProvider.hash(password);

    return await this.#userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  }

  async changeProfile(id, reqUserId, { email, name }) {
    if (Number(reqUserId) !== Number(id)) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    const existingUser = await this.#userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    return await this.#userRepository.update(id, { email, name });
  }

  async deleteAccount(id, reqUserId) {
    if (Number(reqUserId) !== Number(id)) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    const existingUser = await this.#userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND);
    }

    await this.#userRepository.delete(id);
  }
}
