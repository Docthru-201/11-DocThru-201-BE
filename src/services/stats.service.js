// src/services/stats.service.js
export class StatsService {
  #participantRepository;
  #workRepository;

  constructor({ participantRepository, workRepository }) {
    this.#participantRepository = participantRepository;
    this.#workRepository = workRepository;
  }

  async getMyStats(userId) {
    const [participantCount, workCount, likeCount] = await Promise.all([
      this.#participantRepository.countByUserId(userId),
      this.#workRepository.countByUserId(userId),
      this.#workRepository.sumLikeCountByUserId(userId),
    ]);

    return { participantCount, workCount, likeCount };
  }
}
