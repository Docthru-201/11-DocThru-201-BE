import { ERROR_MESSAGE } from '#constants';
import { ForbiddenException, NotFoundException } from '#exceptions';

export class ChallengesService {
  #challengeRepository;

  constructor({ challengeRepository }) {
    this.#challengeRepository = challengeRepository;
  }

  async listChallenges(query) {
    return await this.#challengeRepository.findAll(query);
  }

  async getChallengeDetail(challengeId) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    return challenge;
  }

  async createChallenge({ authorId, data }) {
    return await this.#challengeRepository.create({
      ...data,
      authorId,
    });
  }

  async updateChallenge(challengeId, userId, data) {
    const challenge = await this.#challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }

    if (challenge.authorId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }

    return await this.#challengeRepository.update(challengeId, data);
  }

  async deleteChallenge(challengeId, userId) {
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_MESSAGE.CHALLENGE_NOT_FOUND);
    }
    if (challenge.authorId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGE.FORBIDDEN);
    }
    await this.#challengeRepository.delete(challengeId);
  }

  async listMyChallenges(userId) {
    return await this.#challengeRepository.findByAuthor(userId);
  }
}
