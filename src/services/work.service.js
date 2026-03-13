export class WorksService {
  #workRepository;

  constructor({ workRepository }) {
    this.#workRepository = workRepository;
  }

  async createWork() {}

  async getWorkDetail() {}

  async updateWork() {}

  async deleteWork() {}
}
