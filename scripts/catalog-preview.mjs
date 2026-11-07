// Local homologation: same Netlify handler with Vite serving the existing app.
// Only public Supabase configuration is loaded. No synchronization is invoked.
import { createServer, loadEnv } from 'vite';
import { createHandler } from '../netlify/functions/catalog.mjs';
import { readSupabaseCatalog } from '../netlify/lib/supabase-catalog.mjs';
const values = loadEnv('development', process.cwd(), ['VITE_SUPABASE_', 'SUPABASE_']);
const env = Object.fromEntries(['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY']
  .map(key => [key, process.env[key] || values[key]]));
const handler = createHandler(() => readSupabaseCatalog({ env }));
const server = await createServer({ server: { host:'127.0.0.1',port:5173,strictPort:true }, plugins:[{
  name:'local-catalog-function', configureServer(vite) {
    vite.middlewares.use('/.netlify/functions/catalog', async (req,res) => {
      const result = await handler({ httpMethod:req.method });
      res.writeHead(result.statusCode,result.headers); res.end(result.body);
    });
  },
}] });
await server.listen();
server.printUrls();
