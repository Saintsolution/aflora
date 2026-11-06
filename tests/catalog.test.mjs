import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORE, parseProduct, parseSitemap, parseListing, readCatalog, createHandler } from '../netlify/functions/catalog.mjs';
import { readCatalog as extractCatalog } from '../netlify/lib/catalog-extractor.mjs';
import { handler as sourceHandler, createSourceHandler } from '../netlify/functions/catalog-source.mjs';

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

test('extrator compartilhado conclui lotes paginados de 56, 200, 300 e 500 produtos', async () => {
  for (const count of [56, 200, 300, 500]) {
    const urls = Array.from({length:count}, (_,i) => `${STORE}/produtos/lote-${count}-${i}/`);
    const pageSize = 25;
    const requestLog = [];
    const data = await extractCatalog(async (requested) => {
      requestLog.push(requested);
      if (requested.endsWith('xml')) return '<urlset/>';
      if (new URL(requested).pathname === '/produtos/') {
        const page = Number(new URL(requested).searchParams.get('page') ?? 1);
        const items = urls.slice((page - 1) * pageSize, page * pageSize);
        return `<main>${items.map(u => `<div class="js-product-table"><a href="${u}">Peça</a></div>`).join('')}</main>`;
      }
      return html().replaceAll(url, requested);
    });
    assert.equal(data.complete, true);
    assert.equal(data.productCount, count);
    assert.equal(data.products.length, count);
    assert.equal(new Set(data.products.map(p => p.product_url)).size, count);
    assert.equal(requestLog.filter(r => new URL(r).searchParams.has('page')).length, Math.ceil(count / pageSize));
  }
});

test('endpoint independente aceita somente GET e não possui rotina de escrita', async () => {
  const response = await sourceHandler({httpMethod:'POST'});
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET');
  assert.equal(response.body, '');
});

test('extrator protegido autentica antes de ler e preserva o contrato completo', async () => {
  let reads = 0;
  const catalog = {source:'nuvemshop',fetchedAt:'2026-11-06T12:00:00Z',complete:true,productCount:1,products:[{id:url,name:'Peça',price:87,images:['https://cdn.example.org/a.webp'],description:'Descrição',category:'ÁGUA',product_url:url,collection:'agua',available:false}],unknownCategories:[]};
  const protectedHandler = createSourceHandler(async () => {reads++; return catalog;}, () => 'test-token');
  for (const headers of [{}, {authorization:'Bearer wrong-token'}, {Authorization:'Basic test-token'}]) {
    const response = await protectedHandler({httpMethod:'GET',headers});
    assert.equal(response.statusCode,401);
    assert.equal(response.headers['WWW-Authenticate'],'Bearer');
    assert.deepEqual(JSON.parse(response.body),{error:'Não autorizado'});
    assert.equal(reads,0);
  }
  const response = await protectedHandler({httpMethod:'GET',headers:{authorization:'Bearer test-token'}});
  assert.equal(response.statusCode,200);
  assert.equal(response.headers['Cache-Control'],'no-store');
  assert.deepEqual(JSON.parse(response.body),catalog);
  assert.equal(reads,1);
});

test('configuração ausente falha fechada sem iniciar extração', async () => {
  let reads = 0;
  const protectedHandler = createSourceHandler(async () => {reads++; return {};}, () => '');
  assert.equal((await protectedHandler({httpMethod:'GET',headers:{authorization:'Bearer any'}})).statusCode,401);
  assert.equal(reads,0);
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

test('URL removida apenas do sitemap é ignorada em 404/410; outros erros continuam fatais', async () => {
  const removed = `${STORE}/produtos/removido/`;
  for (const status of [404, 410, 429, 503]) {
    const read = async (requested) => {
      if (requested.endsWith('xml')) return sitemap.replace('</urlset>', `<url><loc>${removed}</loc></url></urlset>`);
      if (requested === `${STORE}/produtos/`) return '<main/>';
      if (requested === removed) throw Object.assign(new Error('origem'), {status});
      return html();
    };
    if ([404, 410].includes(status)) assert.deepEqual((await readCatalog(read)).products.map(p => p.product_url), [url]);
    else await assert.rejects(readCatalog(read), /origem/);
  }
});

test('404/410 de produto listado preserva os demais; todos removidos não viram sucesso vazio', async () => {
  const removed = `${STORE}/produtos/removido/`;
  for (const status of [404, 410]) {
    const read = async requested => {
      if (requested.endsWith('xml')) return sitemap;
      if (requested === `${STORE}/produtos/`) return `<main><div class="js-product-table"><a href="${removed}">Removido</a></div></main>`;
      if (requested.includes('?page=')) return '<main/>';
      if (requested === removed) throw Object.assign(new Error('removido'), {status});
      return html();
    };
    assert.deepEqual((await readCatalog(read)).products.map(p => p.product_url), [url]);
    await assert.rejects(readCatalog(async requested => {
      if (requested === url) throw Object.assign(new Error('removido'), {status});
      return read(requested);
    }), /Nenhum produto/);
  }
});

test('parâmetros de navegação não duplicam produto nem invalidam canonical', async () => {
  const tracked = `${url}?entry_path=category#foto`;
  assert.deepEqual(parseListing(`<main><div class="js-product-table"><a href="${tracked}">Peça</a><a href="${url}">Peça</a></div></main>`), [url]);
  const requests = [];
  const data = await readCatalog(async requested => {
    requests.push(requested);
    if (requested.endsWith('xml')) return sitemap;
    if (requested === `${STORE}/produtos/`) return `<main><div class="js-product-table"><a href="${tracked}">Peça</a></div></main>`;
    if (requested.includes('?page=')) return '<main/>';
    return html();
  });
  assert.equal(data.products.length, 1);
  assert.equal(requests.filter(u => u === url).length, 1);
  assert.equal(data.products[0].product_url, url);
});

test('descrição estruturada supre bloco ausente; descrição HTML tem prioridade', () => {
  const withStructured = html().replace('"@type":"Product",', '"@type":"Product","description":"Descrição da origem.",');
  assert.equal(parseProduct(withStructured, url).description, 'Descrição completa. Segundo parágrafo.');
  const withoutBlock = withStructured.replace(/<div class="js-product-description">.*?<\/div>/, '');
  assert.equal(parseProduct(withoutBlock, url).description, 'Descrição da origem.');
  assert.throws(() => parseProduct(withoutBlock.replace('Descrição da origem.', ''), url), /Produto incompleto/);
  assert.throws(() => parseProduct(withoutBlock.replace('"price":"87"', '"price":null'), url), /Produto incompleto/);
});

test('fallback limitado a uma hora preserva snapshot e data; cooldown e recuperação', async () => {
  let time = 0; let calls = 0; let fail = false;
  const snapshot = {source:'nuvemshop',fetchedAt:'2026-10-27T12:00:00Z', products:[{name:'Peça (REF)',price:87}]};
  const handler = createHandler(async () => {calls++; if(fail) throw new Error('offline'); return snapshot;}, () => time);
  const get = () => handler({httpMethod:'GET'});
  assert.equal((await get()).statusCode,200);
  fail = true; time = 300001;
  const stale = await get(); const body = JSON.parse(stale.body);
  assert.equal(stale.statusCode,200); assert.equal(body.stale,true);
  assert.equal(body.fetchedAt,snapshot.fetchedAt); assert.deepEqual(body.products,snapshot.products);
  assert.equal(stale.headers['Cache-Control'],'no-store');
  await get(); assert.equal(calls,2);
  time = 3600001; assert.equal((await get()).statusCode,503);
  fail = false; time += 30001;
  const fresh = JSON.parse((await get()).body);
  assert.equal(fresh.stale,undefined); assert.deepEqual(fresh.products,snapshot.products);
});

test('falhas de origem, timeout e validação sem cache retornam 503 e aplicam cooldown', async () => {
  for (const error of [Object.assign(new Error('HTTP'),{status:503}), Object.assign(new Error('timeout'),{name:'TimeoutError'}), new Error('Produto incompleto')]) {
    let calls = 0;
    const handler = createHandler(async () => {calls++; throw error;}, () => 0);
    for(let i=0;i<2;i++) {
      const response = await handler({httpMethod:'GET'});
      assert.equal(response.statusCode,503);
      assert.equal(JSON.parse(response.body).products,undefined);
    }
    assert.equal(calls,1);
  }
});

test('reconhece Água, Terra, Fogo, Ar, Fé e Casa sem alterar nomes e links', () => {
  for(const [name, id] of [['Água','agua'],['Terra','terra'],['Fogo','fogo'],['Ar','ar'],['Fé','fe'],['Casa','casa']]) {
    const product = parseProduct(html(name).replace('>Peça</h1>', '>Peça (AF001)</h1>'),url);
    assert.equal(product.collection,id); assert.equal(product.name,'Peça (AF001)'); assert.equal(product.product_url,url);
  }
});
