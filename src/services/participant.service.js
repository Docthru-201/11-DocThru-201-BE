import { ConflictException } from '#exceptions';

export class ParticipantsService {
  #participantRepository;

  constructor({ participantRepository }) {
    this.#participantRepository = participantRepository;
  }

  async joinChallenge(challengeId, userId) {
    // 1. 이미 참여 중인지 확인
    const existing = await this.#participantRepository.findByUserAndChallenge(
      userId,
      challengeId,
    );

    if (existing) {
      throw new ConflictException('이미 해당 챌린지에 참여 중입니다.');
    }

    // 2. 참여 데이터 생성
    return await this.#participantRepository.create({
      challengeId,
      userId,
    });
  }

  // 필요한 경우 목록 조회 기능 추가
  async getParticipantsByChallenge(challengeId) {
    return await this.#participantRepository.findManyByChallengeId(challengeId);
  }
}
