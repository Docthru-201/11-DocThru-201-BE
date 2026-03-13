import { NotFoundException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants';

export class ProfilesService {
  #profileRepository;

  constructor({ profileRepository }) {
    this.#profileRepository = profileRepository;
  }

  async getMyProfile(userId) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGE.PROFILE_NOT_FOUND);
    }

    return profile;
  }

  async updateProfile(userId, data) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      return this.#profileRepository.create(userId, data);
    }

    return this.#profileRepository.update(userId, data);
  }

  async getProfileByUserId(userId) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGE.PROFILE_NOT_FOUND);
    }

    return profile;
  }
}
