export class CommentsService {
  #commentRepository;
  #workRepository;

  constructor({ commentRepository, workRepository }) {
    this.#commentRepository = commentRepository;
    this.#workRepository = workRepository;
  }

  async listCommentsByWorkId(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    return this.#commentRepository.findManyByWorkId(workId);
  }

  // 댓글 또는 대댓글 작성
  async createComment(userId, workId, data) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    // parentId가 있으면 대댓글 -> 부모 댓글 존재 확인
    if (data.parentId) {
      const parent = await this.#commentRepository.findById(data.parentId);
      if (!parent) throw new Error('부모 댓글이 존재하지 않습니다.');
    }

    return this.#commentRepository.create({
      content: data.content,
      workId,
      authorId: userId,
      parentId: data.parentId || null,
    });
  }

  // 댓글/대댓글 수정
  async updateComment(commentId, userId, data) {
    const comment = await this.#commentRepository.findById(commentId);
    if (!comment) throw new Error('댓글이 존재하지 않습니다.');
    if (comment.authorId !== userId) throw new Error('수정 권한이 없습니다.');

    return this.#commentRepository.update(commentId, { content: data.content });
  }

  // 댓글/대댓글 삭제 (답글 포함)
  async deleteComment(commentId, userId) {
    const comment = await this.#commentRepository.findById(commentId);

    if (!comment) throw new Error('댓글이 존재하지 않습니다.');
    if (comment.authorId !== userId) throw new Error('삭제 권한이 없습니다.');

    await this.#commentRepository.delete(commentId);
  }
}
