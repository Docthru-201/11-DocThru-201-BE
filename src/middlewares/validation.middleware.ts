import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { isProduction } from '#config';
import { flattenError } from 'zod';
import { ERROR_MESSAGE } from '#constants';
import { BadRequestException } from '#exceptions';

export const validate = (
  target: 'body' | 'query' | 'params',
  schema: ZodTypeAny,
) => {
  if (!['body', 'query', 'params'].includes(target)) {
    throw new Error(
      `[validate middleware] Invalid target: "${target}". Expected "body", "query", or "params".`,
    );
  }
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[target]);

      // 실패했을 때만 issues를 출력
      if (!result.success) {
        console.error(`❌ [Validation Error] Target: ${target}`);
        console.error(
          'Detailed Issues:',
          JSON.stringify(result.error.issues, null, 2),
        );

        const { fieldErrors } = flattenError(result.error);

        if (isProduction) {
          throw new BadRequestException(ERROR_MESSAGE.INVALID_INPUT);
        }

        throw new BadRequestException(
          ERROR_MESSAGE.VALIDATION_FAILED,
          fieldErrors as Record<string, string[]>,
        );
      }

      Object.assign(req[target], result.data);
      next();
    } catch (error) {
      next(error);
    }
  };
};
