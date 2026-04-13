// import { AuthMiddleware } from './auth.middleware.js';
// import { tokenProvider } from '../utils/token.provider.js';
// import { authService } from '../services/auth.service.js';
// import { cookieProvider } from '../utils/cookie.provider.js';

// // 2. AuthMiddleware 인스턴스를 생성합니다.
// // 생성자(constructor)에 필요한 객체들을 주입(Dependency Injection)합니다.
// export const authMiddleware = new AuthMiddleware({
//   tokenProvider,
//   authService,
//   cookieProvider
// });

// // 3. 기존의 함수형 미들웨어들을 그대로 내보냅니다.
// // 이들은 클래스가 아니므로 기존 방식대로 export * 해도 무방합니다.
// export * from './auth.middleware.js'; // 클래스 정의 자체도 필요한 경우를 대비
// export * from './authorization.middleware.js';
// export * from './error-handler.middleware.js';
// export * from './validation.middleware.js';
// export * from './cors.middleware.js';
export * from './auth.middleware.js';
export * from './authorization.middleware.js';
export * from './error-handler.middleware.js';
export * from './validation.middleware.js';
export * from './cors.middleware.js';
export * from './role.middleware.js';
export * from './helmet.middleware.js';
export * from './csrf-origin.middleware.js';
export * from './https-redirect.middleware.js';
export * from './rate-limit.middleware.js';
export * from './security.middleware.js';
