import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      nickname: string;
      userId?: string;
    }

    interface Request {
      user: User;
    }
  }
}
