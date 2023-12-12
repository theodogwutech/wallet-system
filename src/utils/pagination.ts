import { PaginationQueryDto } from 'src/shared/global.dto';

export class Pagination {
  constructor(private readonly paginationQueryDto: PaginationQueryDto) {}

  PaginateResponse(data: any[], total: number, page: number, limit: number) {
    return {
      data,
      meta: {
        page: Number(page),
        take: Number(limit),
        itemCount: total,
        pageCount: Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }
}
