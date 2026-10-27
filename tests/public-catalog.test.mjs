import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function reader(fetchMock) {
  globalThis.fetch = fetchMock;
  const bundle = await build({ entryPoints: ['src/lib/catalog/index.ts'], bundle: true, write: false, format: 'esm',
    plugins: [{ name: 'forbid-product-access', setup(b) {
      b.onResolve({ filter: /products|supabase/ }, () => { throw new Error('Leitura pública não pode importar acesso ao Supabase'); });
    } }] });
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + `\n//${Math.random()}`).toString('base64')}`);
}

test('vazio válido não consulta alternativa; cache evita segunda requisição', async () => {
  let requests = 0;
  const mod = await reader(async () => {requests++; return new Response(JSON.stringify({source:'nuvemshop', products:[]}));});
  assert.deepEqual(await mod.fetchPublicProducts(), []);
  assert.deepEqual(await mod.fetchPublicProducts(), []);
  assert.equal(requests, 1);
});
test('falha da Function rejeita sem consultar Supabase', async () => {
  const mod = await reader(async () => new Response('offline', {status:503}));
  await assert.rejects(mod.fetchPublicProducts(), /HTTP 503/);
});
test('produto inválido rejeita lote inteiro sem alternativa', async () => {
  const mod = await reader(async () => new Response(JSON.stringify({source:'nuvemshop',products:[{name:'Incompleto'}]})));
  await assert.rejects(mod.fetchPublicProducts(), /Produto inválido/);
});

test('falha de rede não consulta outro endpoint e permite nova tentativa', async () => {
  const requests = [];
  const mod = await reader(async (url) => { requests.push(url); throw new Error('offline'); });
  await assert.rejects(mod.fetchPublicProducts(), /offline/);
  await assert.rejects(mod.fetchPublicProducts(), /offline/);
  assert.deepEqual(requests, ['/.netlify/functions/catalog', '/.netlify/functions/catalog']);
});

test('snapshot antigo sinaliza aviso; nomes, preços e URLs originais são preservados', async () => {
  const product = {name:'Colar Aurora (AF001)',price:87,images:['https://cdn.example.org/a.png'],description:'Descrição',category:'Água',collection:'agua',product_url:'https://lojadoaafloraatelier.lojavirtualnuvem.com.br/produtos/aurora/'};
  const mod = await reader(async () => new Response(JSON.stringify({source:'nuvemshop',stale:true,products:[product]})));
  const [received] = await mod.fetchPublicProducts();
  assert.equal(received.name,product.name); assert.equal(received.price,product.price);
  assert.equal(received.product_url,product.product_url);
  assert.match(mod.getCatalogNotice(), /desatualizados/);
});
