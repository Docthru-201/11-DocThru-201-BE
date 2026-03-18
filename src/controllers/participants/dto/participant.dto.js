import { z } from 'zod';

// URL 파라미터 (:challengeId) 검증용
export const participantParamsSchema = z.object({
  challengeId: z.string().ulid(),
});
