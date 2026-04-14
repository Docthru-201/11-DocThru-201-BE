// src/services/grade.service.js
import type {
  UserRepository,
  ParticipantRepository,
  LikeRepository,
} from '#repositories';

export class GradeService {
  #userRepository: UserRepository;
  #participantRepository: ParticipantRepository;
  #likeRepository: LikeRepository;

  constructor({
    userRepository,
    participantRepository,
    likeRepository,
  }: {
    userRepository: UserRepository;
    participantRepository: ParticipantRepository;
    likeRepository: LikeRepository;
  }) {
    this.#userRepository = userRepository;
    this.#participantRepository = participantRepository;
    this.#likeRepository = likeRepository;
  }

  async updateGradeIfNeeded(userId: string) {
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
