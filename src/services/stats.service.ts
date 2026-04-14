// src/services/stats.service.js
import type { ParticipantRepository, WorkRepository } from '#repositories';

export class StatsService {
  #participantRepository: ParticipantRepository;
  #workRepository: WorkRepository;

  constructor({
    participantRepository,
    workRepository,
  }: {
    participantRepository: ParticipantRepository;
    workRepository: WorkRepository;
  }) {
    this.#participantRepository = participantRepository;
    this.#workRepository = workRepository;
  }

  async getMyStats(userId: string) {
    const [participantCount, workCount, likeCount] = await Promise.all([
      this.#participantRepository.countByUserId(userId),
      this.#workRepository.countByUserId(userId),
      this.#workRepository.sumLikeCountByUserId(userId),
    ]);

    return { participantCount, workCount, likeCount };
  }
}
