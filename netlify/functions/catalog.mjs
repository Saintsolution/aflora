import { load } from 'cheerio';

export const STORE = 'https://lojadoaafloraatelier.lojavirtualnuvem.com.br';
const TTL = 5 * 60 * 1000;
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const collections = new Set(['agua', 'ar', 'terra', 'fogo', 'fe', 'casa']);

function storeUrl(value) {
  const url = new URL(value, STORE);
  if (url.origin !== STORE || url.username || url.password) throw new Error('URL externa no catálogo');
  return url.href;
}

export function parseSitemap(xml) {
  const $ = load(xml, { xmlMode: true });
  if (!$('urlset').length) throw new Error('Sitemap inválido');
  return [...new Set($('url > loc').toArray().map((el) => storeUrl($(el).text().trim())))]
    .filter((url) => /^\/produtos\/[^/]+\/$/.test(new URL(url).pathname));
}

export function parseProduct(html, url) {
  const $ = load(html);
  const page = $('script[type="application/ld+json"]').toArray()
    .map((el) => { try { return JSON.parse($(el).text()); } catch { return null; } })
    .find((data) => data?.mainEntity?.['@type'] === 'Product');
  if (!page) throw new Error(`Dados estruturados ausentes: ${url}`);
  const product = page.mainEntity;
  const name = $('.js-product-name').first().text().trim();
  const descriptionNode = $('.js-product-description').first().clone();
  descriptionNode.find('script, style').remove();
  descriptionNode.find('p, br, li, div').append(' ');
  const description = descriptionNode.text().replace(/\s+/g, ' ').trim();
  const rawPrice = product.offers?.price;
  const price = Number(rawPrice);
  const categoryNames = (page.breadcrumb?.itemListElement ?? []).slice(1, -1).map((item) => item.name);
  const matches = [...new Set(categoryNames.map(normalize).filter((id) => collections.has(id)))];
  const images = [...new Set($('.js-product-images a[data-fancybox="product-gallery"]').toArray().map((el) => {
    const image = new URL($(el).attr('href'), STORE);
    if (image.protocol !== 'https:' || !image.hostname.endsWith('.mitiendanube.com')) throw new Error('Imagem inválida');
    return image.href;
  }))];
  const canonical = storeUrl($('link[rel="canonical"]').attr('href') || '');
  if (!name || !description || rawPrice == null || rawPrice === '' || !Number.isFinite(price) || price < 0 || !images.length || canonical !== url) {
    throw new Error(`Produto incompleto: ${url}`);
  }
  return {
    name, price, images, description, category: categoryNames.join(' / '), product_url: canonical,
    collection: matches.length === 1 ? matches[0] : '',
    // Identidade e disponibilidade são somente metadados da integração.
    id: canonical, available: product.offers?.availability?.endsWith('/InStock') ?? false,
  };
}

async function download(url, signal) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    redirect: 'error', headers: { 'User-Agent': 'AfloraPublicCatalog/1.0' },
  });
  if (!response.ok) throw new Error(`Nuvemshop HTTP ${response.status}`);
  return response.text();
}

export async function readCatalog(read = download) {
  const signal = AbortSignal.timeout(24000);
  const urls = parseSitemap(await read(`${STORE}/sitemap.xml`, signal));
  if (urls.length > 200) throw new Error('Catálogo excede o limite validado de 200 produtos');
  const products = new Array(urls.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(5, urls.length) }, async () => {
    while (cursor < urls.length) {
      const index = cursor++;
      products[index] = parseProduct(await read(urls[index], signal), urls[index]);
    }
  }));
  const unknown = products.filter((p) => !p.collection).map((p) => ({ url: p.product_url, category: p.category }));
  if (unknown.length) console.warn('Categorias para revisão:', JSON.stringify(unknown));
  return { source: 'nuvemshop', fetchedAt: new Date().toISOString(), products, unknownCategories: unknown };
}

export function createHandler(read = readCatalog, now = Date.now) {
  let cached;
  let expires = 0;
  let pending;
  let retryAt = 0;
  return async (event) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, headers: { Allow: 'GET' }, body: '' };
    try {
      if (!cached || now() >= expires) {
        if (now() < retryAt) throw new Error('Aguardando nova tentativa');
        pending ??= read().then((data) => { cached = data; expires = now() + TTL; return data; })
          .catch((error) => { retryAt = now() + 30000; throw error; }).finally(() => { pending = undefined; });
        await pending;
      }
      return { statusCode: 200, headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'Netlify-CDN-Cache-Control': `public, s-maxage=${Math.max(1, Math.floor((expires - now()) / 1000))}, must-revalidate`,
      }, body: JSON.stringify(cached) };
    } catch (error) {
      console.error('Falha na leitura do catálogo:', error.message);
      return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'Catálogo temporariamente indisponível' }) };
    }
  };
}

export const handler = createHandler();
