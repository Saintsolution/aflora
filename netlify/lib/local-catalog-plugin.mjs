// Development only: same handlers as Netlify, no credential bundled into the app.
import { loadEnv } from 'vite';
import { createHandler } from '../functions/catalog.mjs';
import { readSupabaseCatalog } from './supabase-catalog.mjs';
import { createSyncProxy } from '../functions/catalog-sync.mjs';

export function localCatalogPlugin() {
  return {
    name: 'local-catalog-functions',
    configureServer(server) {
      const values = loadEnv(server.config.mode, process.cwd(), ['SUPABASE_', 'VITE_SUPABASE_']);
      const env = Object.fromEntries([
        'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY',
      ].map(key => [key, process.env[key] || values[key]]));
      const read = createHandler(() => readSupabaseCatalog({ env }));
      const sync = createSyncProxy({ env: { ...env, NETLIFY_DEV: 'true',
        AFLORA_CATALOG_SYNC_SECRET: process.env.AFLORA_CATALOG_SYNC_SECRET } });
      for (const [route,handler] of [['catalog',read],['catalog-sync',sync]]) {
        server.middlewares.use(`/.netlify/functions/${route}`, async (req,res,next) => {
          if (req.url?.split('?')[0] !== '/') return next();
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
            if (body.length > 100) { res.writeHead(400); res.end(); return; }
          }
          const result = await handler({ httpMethod: req.method, headers: req.headers, body });
          res.writeHead(result.statusCode,result.headers); res.end(result.body);
        });
      }
    },
  };
}
