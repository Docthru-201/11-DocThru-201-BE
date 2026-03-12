export class UsersService {
  #userRepository;
  #passwordProvider;

  constructor({ userRepository, passwordProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
  }

  async listUsers() {}

  async getUserDetail() {}

  async registerUser() {}

  async changeProfile() {}

  async deleteAccount() {}
}
