import { ForbiddenException, NotFoundException } from '#exceptions';
import type {
  CommentRepository,
  WorkRepository,
  UserRepository,
  ChallengeRepository,
} from '#repositories';
import type { NotificationsService } from '#services';

export class CommentsService {
  #commentRepository: CommentRepository;
  #workRepository: WorkRepository;
  #userRepository: UserRepository;
  #challengeRepository: ChallengeRepository;
  #notificationsService: NotificationsService;

  constructor({
    commentRepository,
    workRepository,
    userRepository,
    challengeRepository,
    notificationsService,
  }: {
    commentRepository: CommentRepository;
    workRepository: WorkRepository;
    userRepository: UserRepository;
    challengeRepository: ChallengeRepository;
    notificationsService: NotificationsService;
  }) {
    this.#commentRepository = commentRepository;
    this.#workRepository = workRepository;
    this.#userRepository = userRepository;
    this.#challengeRepository = challengeRepository;
    this.#notificationsService = notificationsService;
  }

  async listCommentsByWorkId(workId: string) {
    const work = await this.#workRepository.findById(workId);
    if (!work) {
      throw new NotFoundException('작업물을 찾을 수 없습니다.');
    }

    return this.#commentRepository.findManyByWorkId(workId);
  }

  async createComment(
    userId: string,
    workId: string,
    data: { content: string; parentId?: string },
  ) {
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

    const comment = await this.#commentRepository.create({
      content: data.content,
      work: { connect: { id: workId } },
      ...(userId ? { author: { connect: { id: userId } } } : {}),
      ...(data.parentId ? { parent: { connect: { id: data.parentId } } } : {}),
    });

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        work.challengeId,
      );

    if (challengeInfo && this.#notificationsService) {
      const recipientIds = [
        challengeInfo.authorId,
        ...challengeInfo.participants.map((participant) => participant.userId),
      ].filter((recipientId) => recipientId && recipientId !== userId);

      const uniqueRecipientIds = [...new Set(recipientIds)];

      for (const recipientId of uniqueRecipientIds) {
        await this.#notificationsService.createNotification({
          userId: recipientId,
          type: 'NEW_COMMENT',
          targetId: comment.id,
          targetUrl: `/works/${workId}`,
          message: `'${challengeInfo.title}' 챌린지에 댓글이 등록되었어요`,
        });
      }
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    userId: string,
    data: { content?: string; reason?: string },
  ) {
    const comment = await this.#commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }

    const user = await this.#userRepository.findUserById(userId);
    const isAdmin = user?.role === 'ADMIN';
    const isOwner = comment.authorId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    const updatedComment = await this.#commentRepository.update(commentId, {
      content: data.content,
    });

    if (!this.#notificationsService) {
      return updatedComment;
    }

    if (isAdmin) {
      if (comment.authorId !== userId && comment.authorId) {
        const reasonText = data.reason ? ` 사유: ${data.reason}` : '';

        await this.#notificationsService.createNotification({
          userId: comment.authorId,
          type: 'ADMIN_ACTION',
          targetId: updatedComment.id,
          targetUrl: `/works/${comment.workId}`,
          message: `작성한 피드백이 관리자에 의해 수정되었어요. ${reasonText}`,
        });
      }

      return updatedComment;
    }

    const work = await this.#workRepository.findById(comment.workId);
    if (!work) {
      return updatedComment;
    }

    const challengeInfo =
      await this.#challengeRepository.findNotificationRecipientsByChallengeId(
        work.challengeId,
      );

    if (!challengeInfo) {
      return updatedComment;
    }

    const recipientIds = [
      challengeInfo.authorId,
      ...challengeInfo.participants.map((participant) => participant.userId),
    ].filter((recipientId) => recipientId && recipientId !== userId);

    const uniqueRecipientIds = [...new Set(recipientIds)];

    for (const recipientId of uniqueRecipientIds) {
      await this.#notificationsService.createNotification({
        userId: recipientId,
        type: 'NEW_COMMENT',
        targetId: updatedComment.id,
        targetUrl: `/works/${comment.workId}`,
        message: `'${challengeInfo.title}' 챌린지의 댓글이 수정되었어요.`,
      });
    }

    return updatedComment;
  }

  async deleteComment(
    commentId: string,
    userId: string,
    data: { reason?: string } = {},
  ) {
    const comment = await this.#commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }

    const actor = await this.#userRepository.findUserById(userId);
    const isAdmin = actor?.role === 'ADMIN';
    if (!isAdmin && comment.authorId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    const work = await this.#workRepository.findById(comment.workId);
    const challengeInfo = work
      ? await this.#challengeRepository.findNotificationRecipientsByChallengeId(
          work.challengeId,
        )
      : null;

    const deletedAt = new Date().toISOString().slice(0, 10);

    const hasReplies = comment.replies && comment.replies.length > 0;

    if (hasReplies) {
      await this.#commentRepository.softDelete(commentId);
    } else {
      await this.#commentRepository.delete(commentId);

      if (comment.parentId) {
        const parent = await this.#commentRepository.findById(comment.parentId);

        if (parent && parent.deletedAt && parent.replies.length === 0) {
          await this.#commentRepository.delete(comment.parentId);
        }
      }
    }

    if (!this.#notificationsService) {
      return;
    }

    if (isAdmin) {
      if (comment.authorId !== userId && comment.authorId) {
        const reasonText = data.reason ? ` 사유: ${data.reason}` : '';

        await this.#notificationsService.createNotification({
          userId: comment.authorId,
          type: 'ADMIN_ACTION',
          targetId: commentId,
          targetUrl: `/works/${comment.workId}`,
          message: `작성한 피드백이 관리자에 의해 삭제되었어요. (${deletedAt})${reasonText}`,
        });
      }

      return;
    }

    if (challengeInfo) {
      const recipientIds = [
        challengeInfo.authorId,
        ...challengeInfo.participants.map((participant) => participant.userId),
      ].filter((recipientId) => recipientId && recipientId !== userId);

      const uniqueRecipientIds = [...new Set(recipientIds)];

      for (const recipientId of uniqueRecipientIds) {
        await this.#notificationsService.createNotification({
          userId: recipientId,
          type: 'NEW_COMMENT',
          targetId: commentId,
          targetUrl: `/works/${comment.workId}`,
          message: `'${challengeInfo.title}' 챌린지의 댓글이 삭제되었어요. (${deletedAt})`,
        });
      }
    }
  }
}
