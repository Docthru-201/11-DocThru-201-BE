// src/services/stats.service.js
export class StatsService {
  #participantRepository;
  #workRepository;
  #likeRepository;

  constructor({ participantRepository, workRepository, likeRepository }) {
    this.#participantRepository = participantRepository;
    this.#workRepository = workRepository;
    this.#likeRepository = likeRepository;
  }

  async getMyStats(userId) {
    const [participantCount, workCount, likeCount] = await Promise.all([
      this.#participantRepository.countByUserId(userId),
      this.#workRepository.countByUserId(userId),
      this.#likeRepository.countReceivedByUserId(userId),
    ]);

    return { participantCount, workCount, likeCount };
  }
}
