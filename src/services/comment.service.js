export class CommentsService {
  #commentRepository;
  #workRepository;
  #userRepository;

  constructor({ commentRepository, workRepository, userRepository }) {
    this.#commentRepository = commentRepository;
    this.#workRepository = workRepository;
    this.#userRepository = userRepository;
  }

  async listCommentsByWorkId(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

    return this.#commentRepository.findManyByWorkId(workId);
  }

  async createComment(userId, workId, data) {
    const work = await this.#workRepository.findById(workId);
    if (!work) throw new Error('작업물을 찾을 수 없습니다.');

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

  async updateComment(commentId, userId, data) {
    const comment = await this.#commentRepository.findById(commentId);
    if (!comment) throw new Error('댓글이 존재하지 않습니다.');
    if (comment.authorId !== userId) throw new Error('수정 권한이 없습니다.');

    return this.#commentRepository.update(commentId, { content: data.content });
  }

  async deleteComment(commentId, userId) {
    const comment = await this.#commentRepository.findById(commentId);

    if (!comment) throw new Error('댓글이 존재하지 않습니다.');

    const user = await this.#userRepository.findUserById(userId);
    const isAdmin = user?.role === 'ADMIN';
    const isOwner = comment.authorId === userId;

    if (!isAdmin && !isOwner) throw new Error('삭제 권한이 없습니다.');

    // ✅ 답글이 있으면 soft delete, 없으면 hard delete
    const hasReplies = comment.replies && comment.replies.length > 0;

    if (hasReplies) {
      await this.#commentRepository.softDelete(commentId);
    } else {
      await this.#commentRepository.delete(commentId);

      // ✅ 방법 3: 답글 삭제 후 부모 댓글 확인
      if (comment.parentId) {
        const parent = await this.#commentRepository.findById(comment.parentId);

        // 부모 댓글이 soft delete 상태이고 남은 답글이 0개이면 hard delete
        if (parent && parent.deletedAt && parent.replies.length === 0) {
          await this.#commentRepository.delete(comment.parentId);
        }
      }
    }
  }
}
