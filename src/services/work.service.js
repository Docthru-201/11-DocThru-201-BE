export class WorksService {
  #workRepository;
  #challengeRepository;
  #participantRepository;

  constructor({ workRepository, challengeRepository, participantRepository }) {
    this.#workRepository = workRepository;
    this.#challengeRepository = challengeRepository;
    this.#participantRepository = participantRepository;
  }

  async createWork(userId, challengeId, data) {
    const challenge =
      await this.#challengeRepository.findChallengeById(challengeId);

    if (!challenge) {
      throw new Error('챌린지를 찾을 수 없습니다.');
    }
    if (challenge.isClosed || challenge.status === 'CLOSED') {
      throw new Error('마감된 챌린지입니다.');
    }

    // 참여 여부 확인 (스키마의 Participant 모델 기준)
    const participant =
      await this.#participantRepository.findByUserAndChallenge(
        userId,
        challengeId,
      );

    if (!participant) throw new Error('챌린지에 참여하지 않은 사용자입니다.');

    // 중복 제출 확인 (1인 1제출 제한)
    const existingWork = await this.#workRepository.findWorkByParticipant(
      participant.id,
    );
    if (existingWork) throw new Error('이미 작업물을 제출했습니다.');

    return this.#workRepository.create({
      content: data.content, // Tiptap JSON
      challengeId,
      participantId: participant.id,
      userId: userId,
    });
  }

  async getWorkDetail(workId) {
    const work = await this.#workRepository.findByIdWithDetail(workId);

    if (!work) {
      throw new Error('작업물을 찾을 수 없습니다.');
    }

    return work;
  }

  async updateWork(workId, userId, data) {
    const work = await this.#workRepository.findById(workId);

    if (!work) {
      throw new Error('작업물이 없습니다.');
    }

    if (work.userId !== userId) {
      throw new Error('수정 권한이 없습니다.');
    }

    return this.#workRepository.update(workId, data);
  }

  async deleteWork(workId, userId) {
    const work = await this.#workRepository.findById(workId);

    if (!work) {
      throw new Error('작업물이 없습니다.');
    }

    if (work.userId !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await this.#workRepository.delete(workId);
  }
}
