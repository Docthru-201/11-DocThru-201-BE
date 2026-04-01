import { ConflictException } from '#exceptions';

export class ParticipantsService {
  #participantRepository;
  #gradeService;

  constructor({ participantRepository, gradeService }) {
    this.#participantRepository = participantRepository;
    this.#gradeService = gradeService;
  }

  async joinChallenge(challengeId, userId) {
    const existing = await this.#participantRepository.findByUserAndChallenge(
      userId,
      challengeId,
    );

    if (existing) {
      throw new ConflictException('이미 해당 챌린지에 참여 중입니다.');
    }

    const result = await this.#participantRepository.create({
      challengeId,
      userId,
    });

    await this.#gradeService.updateGradeIfNeeded(userId);

    return result;
  }

  async getParticipantsByChallenge(challengeId) {
    return await this.#participantRepository.findManyByChallengeId(challengeId);
  }
}
