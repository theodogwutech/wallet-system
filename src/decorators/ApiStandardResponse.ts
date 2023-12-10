import { Type, applyDecorators } from '@nestjs/common';
import { StandardResponse } from 'src/utils/responseManager';
import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

export const ApiStandardArrayResponse = <
  TModel extends Type<any>,
  TMeta extends Type<any>,
>(
  ApiResonse: (
    options?: ApiResponseOptions,
  ) => MethodDecorator & ClassDecorator,
  model: TModel,
  description: string,
  meta: TMeta | null = null,
) => {
  return applyDecorators(
    ApiResonse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
          {
            properties:
              meta != null
                ? {
                    meta: {
                      type: 'object',
                      $ref: getSchemaPath(meta),
                    },
                  }
                : {},
          },
        ],
      },
    }),
  );
};

export const ApiStandardResponse = <
  TModel extends Type<any>,
  TMeta extends Type<any>,
>(
  ApiResonse: (
    options?: ApiResponseOptions,
  ) => MethodDecorator & ClassDecorator,
  model: TModel | null,
  description: string,
  meta: TMeta | null = null,
  type: 'number' | 'string' | 'object' = 'object',
) => {
  return applyDecorators(
    ApiResonse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties:
              model == null
                ? {}
                : {
                    data: {
                      type: type,
                      $ref: getSchemaPath(model),
                    },
                  },
          },
          {
            properties:
              meta != null
                ? {
                    meta: {
                      type: type,
                      $ref: getSchemaPath(meta),
                    },
                  }
                : {},
          },
        ],
      },
    }),
  );
};
