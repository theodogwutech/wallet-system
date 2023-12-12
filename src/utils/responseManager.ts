import { ApiProperty } from '@nestjs/swagger';

export class ResponseManager {
  public static StandardResponse<T>(
    success: boolean,
    statusCode: number,
    message: string,
    data?: T,
    extra?: any,
  ): StandardResponse<T> {
    return {
      success,
      statusCode,
      message,
      data,
      extra,
    };
  }
}

export class StandardResponse<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  extra?: any;
}
