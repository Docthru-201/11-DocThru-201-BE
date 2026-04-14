import { ConflictException } from '#exceptions';
import type { ParticipantRepository } from '#repositories';
import type { GradeService } from '#services';

export class ParticipantsService {
  #participantRepository: ParticipantRepository;
  #gradeService: GradeService;

  constructor({
    participantRepository,
    gradeService,
  }: {
    participantRepository: ParticipantRepository;
    gradeService: GradeService;
  }) {
    this.#participantRepository = participantRepository;
    this.#gradeService = gradeService;
  }

  async joinChallenge(challengeId: string, userId: string) {
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

  async getParticipantsByChallenge(challengeId: string) {
    return await this.#participantRepository.findManyByChallengeId(challengeId);
  }
}
