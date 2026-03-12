export class ParticipantsService {
  #participantRepository;

  constructor({ participantRepository }) {
    this.#participantRepository = participantRepository;
  }

  async listParticipantsByChallengeId() {}
}
