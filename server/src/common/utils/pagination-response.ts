export function paginationResponse<T>(
  data: T[],
  total: number,
  limit: number,
  skip = 0,
) {
  const page = Math.floor(skip / limit) + 1;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    },
  };
}
