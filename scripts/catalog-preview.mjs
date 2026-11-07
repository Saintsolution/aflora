// Local homologation: same Netlify handler with Vite serving the existing app.
// Public configuration is loaded by the dev middleware. Synchronization runs only
// on an explicitly authorized Admin request, with a server-only credential.
import { createServer } from 'vite';
// The shared Vite configuration provides the local read-only catalogue route.
const server = await createServer({ server: { host:'127.0.0.1',port:5173,strictPort:true } });
await server.listen();
server.printUrls();
