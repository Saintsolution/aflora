import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { readSupabaseCatalog, mapProduct } from '../netlify/lib/supabase-catalog.mjs';
import { createHandler } from '../netlify/functions/catalog.mjs';
const env = { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' };
const row = (i, extra = {}) => ({ name: `Peça ${i} (REF${i})`, price: 75.5, description: 'Descrição original',
  category: 'Categoria original', collection: ['agua','terra','fogo','ar','fe','casa','sem_colecao'][i % 7],
  image_url: `https://images.example/${i}.webp`, product_url: `https://lojadoaafloraatelier.lojavirtualnuvem.com.br/produtos/p${String(i).padStart(5,'0')}/`,
  available: i % 2 === 0, synced_at: '2026-11-07T12:00:00Z', ...extra });
function database(rows, { cap = 100, changeRevision = false, failPage, duplicate = false, truncate = false } = {}) {
  const requests = []; let revisions = 0;
  const fetchImpl = async (input, options) => {
    const url = new URL(input); requests.push({ url, options });
    assert.equal(url.origin, env.SUPABASE_URL);
    assert.equal(url.pathname, '/rest/v1/products');
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.apikey, env.SUPABASE_PUBLISHABLE_KEY);
    assert.equal(options.redirect, 'error');
    const revision = url.searchParams.get('select') === 'product_url,synced_at';
    if (revision) {
      revisions++;
      return new Response(JSON.stringify(rows.slice(0,1).map(r => ({ product_url: r.product_url,
        synced_at: changeRevision && revisions > 1 ? '2026-11-07T13:00:00Z' : r.synced_at }))), { headers: { 'content-range': `0-0/${rows.length}` } });
    }
    const offset = Number(url.searchParams.get('offset'));
    if (offset === failPage) throw new TypeError('network unavailable');
    let page = rows.slice(offset, offset + Math.min(cap, Number(url.searchParams.get('limit'))));
    if (duplicate && offset) page = rows.slice(0,page.length);
    if (truncate && offset) page = [];
    return new Response(JSON.stringify(page), { headers: { 'content-range': `${offset}-${offset + page.length - 1}/${rows.length}` } });
  };
  return { fetchImpl, requests };
}
for (const n of [56,150,300,500]) test(`Supabase pagina todos os ${n} registros, inclusive limite de página imposto pelo servidor`, async () => {
  const rows = Array.from({ length: n }, (_,i) => row(i));
  const db = database(rows, { cap: 37 });
  const result = await readSupabaseCatalog({ env, ...db });
  assert.equal(result.productCount, n); assert.equal(result.complete,true);
  assert.equal(result.storage,'supabase'); assert.equal(result.source,'nuvemshop');
  assert.deepEqual(result.products, rows.map(mapProduct));
  assert.equal(new Set(result.products.map(p => p.id)).size,n);
  assert.equal(db.requests.length, Math.ceil(n / 37) + 2);
  assert.ok(db.requests.every(r => r.url.searchParams.get('or') === '(active.is.null,active.eq.true)'));
});
test('campos preservados, primeira imagem, seis coleções, esgotado e classificação sem universe', () => {
  const input = row(1, { collection:'Raízes', universe:'agua', available:false });
  const mapped = mapProduct(input);
  assert.equal(mapped.collection,'sem_colecao'); assert.equal(mapped.category,input.category);
  assert.equal(mapped.id,input.product_url); assert.equal(mapped.name,input.name);
  assert.equal(mapped.available,false); assert.deepEqual(mapped.images,[input.image_url]);
  for (const field of ['price','description','product_url']) assert.equal(mapped[field],input[field]);
  assert.equal('universe' in mapped,false);
  assert.throws(() => mapProduct({...input,image_url:null}));
  assert.throws(() => mapProduct({...input,available:null}));
  assert.throws(() => mapProduct({...input,product_url:'https://external.test/produtos/a/'}));
});
test('falha intermediária, página truncada, duplicatas ou import concorrente recusam lote inteiro', async () => {
  for (const config of [{failPage:100},{truncate:true},{duplicate:true},{changeRevision:true}]) {
    const db=database(Array.from({length:150},(_,i)=>row(i)),config);
    await assert.rejects(readSupabaseCatalog({env,...db}));
  }
});
test('erro HTTP, JSON inválido, contagem ausente, vazio inesperado e chave administrativa falham fechados', async () => {
  for (const fetchImpl of [async()=>new Response('{}',{status:503}), async()=>new Response('invalid'),
    async()=>new Response('[]'), database([]).fetchImpl]) {
    await assert.rejects(readSupabaseCatalog({env,fetchImpl}));
  }
  let called = false;
  await assert.rejects(readSupabaseCatalog({env:{...env,SUPABASE_PUBLISHABLE_KEY:'sb_secret_rejected'},fetchImpl:async()=>{called=true;}}));
  assert.equal(called,false);
});
test('cache conserva último lote completo em falha Supabase e expira fallback em uma hora', async () => {
  let time = 0; let offline = false;
  const db=database(Array.from({length:56},(_,i)=>row(i)));
  const handler=createHandler(()=>readSupabaseCatalog({env,fetchImpl:(...args)=>offline ? Promise.reject(new Error('offline')) : db.fetchImpl(...args)}),()=>time);
  assert.equal(JSON.parse((await handler({httpMethod:'GET'})).body).productCount,56);
  offline=true; time=300001;
  const stale=await handler({httpMethod:'GET'});
  assert.equal(stale.statusCode,200); assert.equal(JSON.parse(stale.body).stale,true);
  assert.equal(JSON.parse(stale.body).products.length,56); assert.equal(stale.headers['Cache-Control'],'no-store');
  time=3600001; assert.equal((await handler({httpMethod:'GET'})).statusCode,503);
});
test('bundle público não inclui extrator e arquivos protegidos mantêm dependência independente', async () => {
  const bundle=await build({entryPoints:['netlify/functions/catalog.mjs'],bundle:true,write:false,platform:'node',format:'esm',metafile:true});
  assert.ok(!Object.keys(bundle.metafile.inputs).some(p=>/catalog-extractor|catalog-source|sync-aflora/.test(p)));
  assert.match(readFileSync('netlify/functions/catalog-source.mjs','utf8'),/from '..\/lib\/catalog-extractor.mjs'/);
});
