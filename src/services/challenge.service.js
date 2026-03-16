export class ChallengesService {
  #challengeRepository;

  constructor({ challengeRepository }) {
    this.#challengeRepository = challengeRepository;
  }

  async listChallenges() {}

  async getChallengeDetail() {}

  async createChallenge() {}

  async updateChallenge() {}

  async deleteChallenge() {}

  async getChallengeByUser() {}
}
