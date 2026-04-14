import { NotFoundException } from '#exceptions';
import { ERROR_MESSAGE } from '#constants';
import type { ProfileRepository } from '#repositories';

export class ProfilesService {
  #profileRepository: ProfileRepository;

  constructor({ profileRepository }: { profileRepository: ProfileRepository }) {
    this.#profileRepository = profileRepository;
  }

  async getMyProfile(userId: string) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGE.PROFILE_NOT_FOUND);
    }

    return profile;
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      return this.#profileRepository.create(userId, data);
    }

    return this.#profileRepository.update(userId, data);
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.#profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(ERROR_MESSAGE.PROFILE_NOT_FOUND);
    }

    return profile;
  }
}
