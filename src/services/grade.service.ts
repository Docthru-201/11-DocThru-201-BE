// src/services/grade.service.js
export class GradeService {
  #userRepository;
  #participantRepository;
  #likeRepository;

  constructor({ userRepository, participantRepository, likeRepository }) {
    this.#userRepository = userRepository;
    this.#participantRepository = participantRepository;
    this.#likeRepository = likeRepository;
  }

  async updateGradeIfNeeded(userId) {
    const participantCount =
      await this.#participantRepository.countByUserId(userId);
    const likeCount = await this.#likeRepository.countReceivedByUserId(userId);

    const isExpert =
      (participantCount >= 5 && likeCount >= 5) ||
      participantCount >= 10 ||
      likeCount >= 10;

    const newGrade = isExpert ? 'EXPERT' : 'NORMAL';

    await this.#userRepository.updateUser(userId, { grade: newGrade });
  }
}
