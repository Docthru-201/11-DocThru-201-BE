const DEFAULT_CURSOR_LIMIT = 20;
const MAX_CURSOR_LIMIT = 100;

// 쿼리 정규화
function normalizeLimit(value, maxLimit = MAX_CURSOR_LIMIT) {
  const safeMaxLimit = Math.max(1, Number(maxLimit) || MAX_CURSOR_LIMIT);

  return Math.min(
    safeMaxLimit,
    Math.max(1, Number(value) || DEFAULT_CURSOR_LIMIT),
  );
}

// Prisma findMany에 넣을 cursor/skip/take 계산
export function getCursorParams({
  cursor,
  limit = DEFAULT_CURSOR_LIMIT,
  maxLimit = MAX_CURSOR_LIMIT,
  cursorKey = 'id',
}: {
  cursor?: string | null;
  limit?: number;
  maxLimit?: number;
  cursorKey?: string;
} = {}) {
  const resolvedLimit = normalizeLimit(limit, maxLimit);
  const trimmedCursor = cursor == null ? '' : String(cursor).trim();
  const hasCursor = trimmedCursor !== '';

  return {
    ...(hasCursor && {
      cursor: { [cursorKey]: trimmedCursor },
      skip: 1,
    }),
    take: resolvedLimit + 1,
    limit: resolvedLimit,
  };
}

// findMany 결과에서 다음 커서와 잘린 목록 추출
export function parseCursorResult({
  items,
  limit = DEFAULT_CURSOR_LIMIT,
  maxLimit = MAX_CURSOR_LIMIT,
  cursorKey = 'id',
}: {
  items?: unknown[];
  limit?: number;
  maxLimit?: number;
  cursorKey?: string;
} = {}) {
  const list = Array.isArray(items) ? items : [];
  const resolvedLimit = normalizeLimit(limit, maxLimit);

  const hasNext = list.length > resolvedLimit;
  const resultItems = hasNext ? list.slice(0, resolvedLimit) : list;
  const lastItem = resultItems[resultItems.length - 1];

  const nextCursor =
    hasNext && lastItem?.[cursorKey] != null
      ? String(lastItem[cursorKey])
      : null;

  return {
    items: resultItems,
    nextCursor,
    hasNext,
  };
}
