import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORE, parseProduct, parseSitemap, readCatalog, createHandler } from '../netlify/functions/catalog.mjs';

const url = `${STORE}/produtos/piloto/`;
const sitemap = `<urlset><url><loc>${url}</loc></url></urlset>`;
function html(category = 'ÁGUA', availability = 'OutOfStock') {
  return `<link rel="canonical" href="${url}"><h1 class="js-product-name">Peça</h1>
  <div class="js-product-description"><p>Descrição completa.</p><p>Segundo parágrafo.</p></div>
  <div class="js-product-images"><a data-fancybox="product-gallery" href="//dcdn-us.mitiendanube.com/a.webp"></a>
  <a data-fancybox="product-gallery" href="//dcdn-us.mitiendanube.com/b.webp"></a></div>
  <script type="application/ld+json">${JSON.stringify({ breadcrumb: { itemListElement: [{name:'Início'}, {name:category}, {name:'Peça'}] },
    mainEntity: {'@type':'Product',offers:{price:'87',availability:`https://schema.org/${availability}`}} })}</script>`;
}
test('extrai seis campos, todas as fotos e preserva esgotado', () => {
  const p = parseProduct(html(), url);
  assert.equal(p.price, 87); assert.equal(p.collection, 'agua'); assert.equal(p.available, false);
  assert.equal(p.images.length, 2); assert.equal(p.description, 'Descrição completa. Segundo parágrafo.');
  assert.equal(p.product_url, url); assert.equal(p.category, 'ÁGUA'); assert.equal(p.name, 'Peça');
});
test('categoria desconhecida não recebe coleção inventada', () => assert.equal(parseProduct(html('Outra'), url).collection, ''));
test('sitemap inválido e URLs externas falham', () => {
  assert.throws(() => parseSitemap('<html>Erro</html>'));
  assert.throws(() => parseSitemap('<urlset><url><loc>https://example.org/produtos/a/</loc></url></urlset>'));
});
test('descobre produtos e aceita catálogo vazio válido', async () => {
  assert.equal((await readCatalog(async (u) => u.endsWith('xml') ? sitemap : u.includes('/produtos/?') || u === `${STORE}/produtos/` ? '<main/>' : html())).products.length, 1);
  assert.deepEqual((await readCatalog(async (u) => u.endsWith('xml') ? '<urlset/>' : '<main/>')).products, []);
});
test('falha parcial nunca retorna catálogo parcial', async () => {
  await assert.rejects(readCatalog(async (u) => u.endsWith('xml') ? sitemap : '<html/>'));
});
test('crescimento até 200 limita concorrência a cinco e não duplica produtos', async () => {
  for (const count of [2, 10, 50, 200]) {
    const urls = Array.from({length:count}, (_,i) => `${STORE}/produtos/p${i}/`);
    let active = 0; let peak = 0; let requests = 0;
    const data = await readCatalog(async (requested) => {
      if (requested.endsWith('xml')) return `<urlset>${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`;
      if (requested === `${STORE}/produtos/`) return '<main/>';
      requests++; peak = Math.max(peak, ++active);
      await new Promise(resolve => setTimeout(resolve, 1));
      active--;
      return html().replaceAll(url, requested);
    });
    assert.equal(requests, count);
    assert.equal(data.products.length, count);
    assert.equal(new Set(data.products.map(p=>p.id)).size, count);
    assert.ok(peak <= 5);
  }
});
test('cache compartilha consultas; expiração remove produtos; falha retorna 503', async () => {
  let time = 0; let calls = 0;
  const handler = createHandler(async () => ({products: ++calls === 1 ? [{name:'Peça'}] : []}), () => time);
  await Promise.all([handler({httpMethod:'GET'}),handler({httpMethod:'GET'})]); assert.equal(calls,1);
  time = 300001;
  assert.deepEqual(JSON.parse((await handler({httpMethod:'GET'})).body).products, []);
  const failed = createHandler(async () => {throw new Error('offline');});
  assert.equal((await failed({httpMethod:'GET'})).statusCode,503);
  assert.equal((await handler({httpMethod:'POST'})).statusCode,405);
});

test('combina sitemap antigo com listagem paginada sem duplicatas', async () => {
  const urls = Array.from({length: 5}, (_, i) => `${STORE}/produtos/p${i}/`);
  const listing = (items) => `<main><div class="js-product-table">${items.map(u => `<a href="${u}">Peça</a>`).join('')}</div></main>`;
  const requests = [];
  const data = await readCatalog(async (requested) => {
    requests.push(requested);
    if (requested.endsWith('xml')) return `<urlset>${urls.slice(0, 2).map(u => `<url><loc>${u}</loc></url>`).join('')}</urlset>`;
    if (requested === `${STORE}/produtos/`) return listing(urls.slice(0, 3));
    if (requested === `${STORE}/produtos/?page=2`) return listing(urls.slice(2));
    if (requested === `${STORE}/produtos/?page=3`) return '<main/>';
    return html().replaceAll(url, requested);
  });
  assert.equal(data.products.length, 5);
  assert.equal(new Set(data.products.map(p => p.id)).size, 5);
  for (const u of urls) assert.equal(requests.filter(r => r === u).length, 1);
});

test('listagem inválida e paginação repetida falham sem publicar lote parcial', async () => {
  await assert.rejects(readCatalog(async (u) => u.endsWith('xml') ? sitemap : '<html>Erro</html>'), /Listagem pública inválida/);
  await assert.rejects(readCatalog(async (u) => u.endsWith('xml') ? sitemap : `<main><div class="js-product-table"><a href="${url}">Peça</a></div></main>`), /Paginação da listagem repetida/);
});
