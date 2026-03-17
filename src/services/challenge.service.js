import { ERROR_MESSAGE } from '#constants';

export class ChallengesService {
  #challengeRepository;

  constructor({ challengeRepository }) {
    this.#challengeRepository = challengeRepository;
  }

  async listChallenges(query) {
    return await this.#challengeRepository.findMany(query);
  }

  async getChallengeDetail(id) {
    const challenge = await this.#challengeRepository.findById(id);
    if (!challenge) {
      throw new Error(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }
    return challenge;
  }

  async createChallenge(data) {
    return await this.#challengeRepository.create(data);
  }

  async updateChallenge(id, userId, updateData) {
    const challenge = await this.#challengeRepository.findById(id);

    if (!challenge) {
      throw new Error(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }
    if (challenge.authorId !== userId) {
      throw new Error(ERROR_MESSAGE.NO_AUTHORITY_TO_UPDATE);
    }
    return await this.#challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id, userId) {
    const challenge = await this.#challengeRepository.findById(id);

    if (!challenge) {
      throw new Error(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }
    if (challenge.authorId !== userId) {
      throw new Error(ERROR_MESSAGE.N0_AUTHORITY_TO_DELETE);
    }

    await this.#challengeRepository.delete(id);
  }

  async getChallengesByUser(userId) {
    return await this.#challengeRepository.findByUserId(userId);
  }
}
