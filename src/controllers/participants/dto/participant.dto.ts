import { z } from 'zod';
import { ulidSchema } from '../../schemas/baseSchema.js';

// URL 파라미터 (:challengeId) 검증용
export const participantParamsSchema = z.object({
  challengeId: ulidSchema,
});
