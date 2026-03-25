import { MAX_PAGE_SIZE, PAGINATION } from '#constants';

const DEFAULT_PAGE_SIZE = PAGINATION.OFFSET_DEFAULT_PAGE_SIZE;

// 쿼리 정규화
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
