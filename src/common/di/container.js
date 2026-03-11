import {
  createContainer as createAwilixContainer,
  asClass,
  asValue,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { prisma } from '#db/prisma.js';
import { UserRepository } from '#repository';
import { AuthService, UsersService } from '#services';
import { AuthController, UsersController, Controller } from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware } from '#middlewares';

export const createContainer = () => {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    // 1. Providers / Data Access
    prisma: asValue(prisma),
    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    passwordProvider: asClass(PasswordProvider, {
      lifetime: Lifetime.SINGLETON,
    }),
    tokenProvider: asClass(TokenProvider, { lifetime: Lifetime.SINGLETON }),
    cookieProvider: asClass(CookieProvider, { lifetime: Lifetime.SINGLETON }),

    // 2. Services
    authService: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    usersService: asClass(UsersService, { lifetime: Lifetime.SINGLETON }),

    // 3. Middlewares
    authMiddleware: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),

    // 4. Controllers
    authController: asClass(AuthController, { lifetime: Lifetime.SINGLETON }),
    usersController: asClass(UsersController, { lifetime: Lifetime.SINGLETON }),

    // 5. Root Controller
    controller: asClass(Controller, { lifetime: Lifetime.SINGLETON }),
  });

  return container.cradle;
};
