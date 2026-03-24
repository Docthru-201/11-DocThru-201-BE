import { ConflictException } from '#exceptions';

export class ParticipantsService {
  #participantRepository;

  constructor({ participantRepository }) {
    this.#participantRepository = participantRepository;
  }

  async joinChallenge(challengeId, userId) {
    const existing = await this.#participantRepository.findByUserAndChallenge(
      userId,
      challengeId,
    );

    if (existing) {
      throw new ConflictException('이미 해당 챌린지에 참여 중입니다.');
    }

    return await this.#participantRepository.create({
      challengeId,
      userId,
    });
  }

  async getParticipantsByChallenge(challengeId) {
    return await this.#participantRepository.findManyByChallengeId(challengeId);
  }
}
