const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function normalizePage(value) {
  return Math.max(1, Number(value) || 1);
}

function normalizePageSize(value, maxPageSize = MAX_PAGE_SIZE) {
  const safeMaxPageSize = Math.max(1, Number(maxPageSize) || MAX_PAGE_SIZE);

  return Math.min(
    safeMaxPageSize,
    Math.max(1, Number(value) || DEFAULT_PAGE_SIZE),
  );
}

// Prisma findMany에 넣을 skip/take 계산
export function getOffsetParams({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  maxPageSize = MAX_PAGE_SIZE,
} = {}) {
  const currentPage = normalizePage(page);
  const size = normalizePageSize(pageSize, maxPageSize);

  return {
    skip: (currentPage - 1) * size,
    take: size,
    page: currentPage,
    pageSize: size,
  };
}

// 전체 개수 기반 응답 메타 정보 계산
export function getOffsetMeta({ totalCount, page, pageSize }) {
  const total = Math.max(0, Number(totalCount) || 0);
  const currentPage = normalizePage(page);
  const size = normalizePageSize(pageSize);
  const totalPages = Math.ceil(total / size);

  return {
    totalCount: total,
    totalPages,
    currentPage,
    pageSize: size,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
