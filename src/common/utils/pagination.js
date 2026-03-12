import { idParamSchema } from '#controllers/users/dto/users.dto.js';

/* 
1. offset 기반 페이지네이션
일반적인 게시판 형태
*/
export const getOffsetPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

/* 
2. cursor 기반 페이지네이션
*/

export const getCursorPagination = (query) => {
  const limit = parseInt(query.limit, 10) || 10;
  const cursor = query.cursor;

  if (!cursor) {
    return {
      take: limit,
    };
  }

  return {
    take: limit,
    skip: 1,
    cursor: { id: parseInt(cursor, 10) },
  };
};
