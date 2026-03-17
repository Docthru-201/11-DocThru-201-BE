const DEFAULT_CURSOR_LIMIT = 20;
const MAX_CURSOR_LIMIT = 100;

// Prisma findMany에 넣을 cursor/skip/take 계산
export function getCursorParams({
  cursor,
  limit = DEFAULT_CURSOR_LIMIT,
  maxLimit = MAX_CURSOR_LIMIT,
  cursorKey = 'id',
} = {}) {
  const resolvedLimit = Math.min(
    maxLimit,
    Math.max(1, Number(limit) || DEFAULT_CURSOR_LIMIT),
  );

  const hasCursor = cursor != null && String(cursor).trim() !== '';

  return {
    ...(hasCursor && {
      cursor: { [cursorKey]: String(cursor).trim() },
      skip: 1,
    }),
    take: resolvedLimit + 1,
    limit: resolvedLimit,
  };
}

// findMany 결과에서 다음 커서와 잘린 목록 추출
export function parseCursorResult({
  items,
  requestedLimit,
  cursorKey = 'id',
} = {}) {
  const list = Array.isArray(items) ? items : [];
  const limit = Math.min(
    MAX_CURSOR_LIMIT,
    Math.max(1, Number(requestedLimit) || DEFAULT_CURSOR_LIMIT),
  );

  const hasNext = list.length > limit;
  const resultItems = hasNext ? list.slice(0, limit) : list;

  const lastItem = resultItems[resultItems.length - 1];
  const nextCursor =
    hasNext && lastItem && typeof lastItem === 'object' && cursorKey in lastItem
      ? String(lastItem[cursorKey])
      : null;

  return {
    items: resultItems,
    nextCursor,
    hasNext,
  };
}
