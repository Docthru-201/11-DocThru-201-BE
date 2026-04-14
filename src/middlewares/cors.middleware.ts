import corsLib from 'cors';
import { corsOrigins, isProduction } from '#config';

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'Accept',
  'X-Requested-With',
];

function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean | string) => void,
) {
  if (!isProduction) {
    if (!origin) return callback(null, '*');
    return callback(null, true);
  }
  if (!origin) return callback(null, false);
  if (corsOrigins.includes(origin)) return callback(null, true);
  return callback(null, false);
}

export const cors = corsLib({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ALLOWED_HEADERS,
  optionsSuccessStatus: 200,
});
