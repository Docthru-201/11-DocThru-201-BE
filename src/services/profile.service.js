export class ProfilesService {
  #profileRepository;

  constructor({ profileRepository }) {
    this.#profileRepository = profileRepository;
  }

  async getMyProfile() {}

  async updateMyProfile() {}

  async getUserProfile() {}
}
