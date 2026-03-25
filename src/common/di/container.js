import {
  createContainer as createAwilixContainer,
  asClass,
  asValue,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { prisma } from '#db/prisma.js';
import {
  UserRepository,
  ProfileRepository,
  AuthRepository,
  ChallengeRepository,
  ParticipantRepository,
  WorkRepository,
  CommentRepository,
  LikeRepository,
  NotificationRepository,
} from '#repositories';
import {
  AuthService,
  UsersService,
  ProfilesService,
  ChallengesService,
  ParticipantsService,
  WorksService,
  CommentsService,
  LikesService,
  NotificationsService,
} from '#services';
import {
  AuthController,
  UsersController,
  ProfilesController,
  ChallengesController,
  ParticipantsController,
  WorksController,
  CommentsController,
  LikesController,
  NotificationsController,
  AdminController,
  Controller,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware } from '#middlewares';

import { DeadlineScheduler
} from './../utils/scheduler.js'; 

export const createContainer = () => {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    prisma: asValue(prisma),
    authRepository: asClass(AuthRepository, { lifetime: Lifetime.SINGLETON }),
    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    profileRepository: asClass(ProfileRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeRepository: asClass(ChallengeRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    participantRepository: asClass(ParticipantRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    workRepository: asClass(WorkRepository, { lifetime: Lifetime.SINGLETON }),
    commentRepository: asClass(CommentRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    likeRepository: asClass(LikeRepository, { lifetime: Lifetime.SINGLETON }),
    notificationRepository: asClass(NotificationRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    passwordProvider: asClass(PasswordProvider, {
      lifetime: Lifetime.SINGLETON,
    }),
    tokenProvider: asClass(TokenProvider, { lifetime: Lifetime.SINGLETON }),
    cookieProvider: asClass(CookieProvider, { lifetime: Lifetime.SINGLETON }),
    jwtSecret: asValue(process.env.JWT_SECRET),
    // 2. Services
    authService: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    usersService: asClass(UsersService, { lifetime: Lifetime.SINGLETON }),
    profilesService: asClass(ProfilesService, { lifetime: Lifetime.SINGLETON }),
    challengesService: asClass(ChallengesService, {
      lifetime: Lifetime.SINGLETON,
    }),
    participantsService: asClass(ParticipantsService, {
      lifetime: Lifetime.SINGLETON,
    }),
    worksService: asClass(WorksService, { lifetime: Lifetime.SINGLETON }),
    commentsService: asClass(CommentsService, {
      lifetime: Lifetime.SINGLETON,
    }),
    likesService: asClass(LikesService, { lifetime: Lifetime.SINGLETON }),
    notificationsService: asClass(NotificationsService, {
      lifetime: Lifetime.SINGLETON,
    }),

    authMiddleware: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),

    authController: asClass(AuthController, { lifetime: Lifetime.SINGLETON }),
    usersController: asClass(UsersController, { lifetime: Lifetime.SINGLETON }),
    profilesController: asClass(ProfilesController, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengesController: asClass(ChallengesController, {
      lifetime: Lifetime.SINGLETON,
    }),
    participantsController: asClass(ParticipantsController, {
      lifetime: Lifetime.SINGLETON,
    }),
    worksController: asClass(WorksController, {
      lifetime: Lifetime.SINGLETON,
    }),
    commentsController: asClass(CommentsController, {
      lifetime: Lifetime.SINGLETON,
    }),
    likesController: asClass(LikesController, {
      lifetime: Lifetime.SINGLETON,
    }),
    notificationsController: asClass(NotificationsController, {
      lifetime: Lifetime.SINGLETON,
    }),
    adminController: asClass(AdminController, {
      lifetime: Lifetime.SINGLETON,
    }),

    controller: asClass(Controller, { lifetime: Lifetime.SINGLETON }),
  
    deadlineScheduler: asClass(DeadlineScheduler, {
      lifetime: Lifetime.SINGLETON,
    }),
  });

  return container.cradle;
};
