import { ForbiddenException, NotFoundException } from '#exceptions';

export class CommentsService {
  #commentRepository;
  #workRepository;

  constructor({ commentRepository, workRepository }) {
    this.#commentRepository = commentRepository;
    this.#workRepository = workRepository;
  }

  async listCommentsByWorkId(workId) {
    const work = await this.#workRepository.findById(workId);
    if (!work) {
      throw new NotFoundException('작업물을 찾을 수 없습니다.');
    }

    return this.#commentRepository.findManyByWorkId(workId);
  }

  async createComment(userId, workId, data) {
    const work = await this.#workRepository.findById(workId);
    if (!work) {
      throw new NotFoundException('작업물을 찾을 수 없습니다.');
    }

    if (data.parentId) {
      const parent = await this.#commentRepository.findById(data.parentId);
      if (!parent) {
        throw new NotFoundException('부모 댓글이 존재하지 않습니다.');
      }
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
    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    return this.#commentRepository.update(commentId, { content: data.content });
  }

  async deleteComment(commentId, userId) {
    const comment = await this.#commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.#commentRepository.delete(commentId);
  }
}
