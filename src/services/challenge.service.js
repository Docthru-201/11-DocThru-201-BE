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
      throw new Error(`There's no challenge at all.`);
    }
    return challenge;
  }

  async createChallenge(data) {
    return await this.#challengeRepository.create(data);
  }

  async updateChallenge(id, userId, updateData) {
    const challenge = await this.#challengeRepository.findById(id);

    if (!challenge) {
      throw new Error(`There's no challenge at all.`);
    }
    if (challenge.authorId !== userId) {
      throw new Error(`There's no authority to update at all.`);
    }
    return await this.#challengeRepository.update(id, updateData);
  }

  async deleteChallenge(id, userId) {
    const challenge = await this.#challengeRepository.findById(id);

    if (!challenge) {
      throw new Error(`There's no challenge at all.`);
    }
    if (challenge.authorId !== userId) {
      throw new Error(`There's no authority to delete at all.`);
    }

    await this.#challengeRepository.delete(id);
  }

  async getChallengesByUser(userId) {
    return await this.#challengeRepository.findByUserId(userId);
  }
}
