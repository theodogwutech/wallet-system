import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty()
  total: number;
}
