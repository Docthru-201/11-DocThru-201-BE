// Graceful Shutdown
// 종료 신호(SIGINT, SIGTERM)를 받으면
// 서버 요청을 막고 → DB 연결을 닫고 → 프로세스를 종료

import type { Server } from 'node:http';
import type { PrismaClient } from '#generated/prisma/client.js';

export const setupGracefulShutdown = (server: Server, prisma: PrismaClient) => {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          // 새로운 요청은 받지 않음, 이미 처리 중인 요청은 끝날 때까지 기다림
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('서버가 종료되었습니다.');

      await prisma.$disconnect();
      console.log('데이터베이스 연결이 종료되었습니다.');
      process.exit(0); // 정상 종료
    } catch (error) {
      console.error('데이터베이스 종료 중 에러:', error);
      process.exit(1); // 비정상 종료
    }
  };

  // process.on -> 이벤트 감지
  process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
  process.on('SIGTERM', () => shutdown('SIGTERM')); // 시스템 종료 명령 (예: kill 명령)
};
