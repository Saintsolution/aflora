import { readCatalog } from '../lib/catalog-extractor.mjs';
import { timingSafeEqual } from 'node:crypto';

const TOKEN_ENV = 'AFLORA_CATALOG_SOURCE_TOKEN';

function hasValidBearer(event, expected) {
  if (typeof expected !== 'string' || !expected) return false;
  const authorization = Object.entries(event.headers ?? {})
    .find(([name]) => name.toLowerCase() === 'authorization')?.[1];
  if (typeof authorization !== 'string') return false;
  const match = /^Bearer ([^\s]+)$/i.exec(authorization);
  if (!match) return false;
  const suppliedBytes = Buffer.from(match[1]);
  const expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}

// Read-only extraction endpoint for the server-side catalog synchronizer.
// It has no Supabase client and cannot write to the database.
export function createSourceHandler(read = readCatalog, getToken = () => process.env[TOKEN_ENV]) {
  return async function handler(event) {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: { Allow: 'GET' }, body: '' };
    }
    if (!hasValidBearer(event, getToken())) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'WWW-Authenticate': 'Bearer' },
        body: JSON.stringify({ error: 'Não autorizado' }),
      };
    }

    try {
      const catalog = await read();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
        },
        body: JSON.stringify(catalog),
      };
    } catch (error) {
      console.error('catalog_source_extraction_failed', {
        name: error.name,
        status: error.status,
        path: error.path,
        reason: error.message,
      });
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'Catálogo da Nuvemshop incompleto ou indisponível' }),
      };
    }
  };
}

export const handler = createSourceHandler();
