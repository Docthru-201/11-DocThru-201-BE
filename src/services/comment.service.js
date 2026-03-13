export class CommentsService {
  #commentRepository;

  constructor({ commentRepository }) {
    this.#commentRepository = commentRepository;
  }

  async listCommentsByWorkId() {}

  async createComment() {}

  async updateComment() {}

  async deleteComment() {}
}
