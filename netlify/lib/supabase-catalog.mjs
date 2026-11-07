// Read-only PostgREST adapter. No scraper, RPC, sync trigger or admin credential.
const COLLECTIONS = new Set(['agua', 'terra', 'fogo', 'ar', 'fe', 'casa']);
const STORE = 'https://lojadoaafloraatelier.lojavirtualnuvem.com.br';
const FIELDS = 'name,price,description,category,collection,image_url,product_url,available,synced_at';
const fail = (code) => Object.assign(new Error(code), { code });

function publicKey(key) {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sb_publishable_')) return true;
  try { return JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon'; }
  catch { return false; }
}

function httpsUrl(value, product = false) {
  if (typeof value !== 'string') throw fail('CATALOG_ROW_INVALID');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password
    || (product && (url.origin !== STORE || !/^\/produtos\/[^/]+\/$/.test(url.pathname) || url.search || url.hash))) {
    throw fail('CATALOG_ROW_INVALID');
  }
  return value;
}

export function mapProduct(row) {
  if (typeof row.name !== 'string' || !row.name.trim() || typeof row.price !== 'number'
    || !Number.isFinite(row.price) || row.price < 0
    || (row.description !== null && typeof row.description !== 'string')
    || typeof row.category !== 'string' || typeof row.collection !== 'string'
    || typeof row.available !== 'boolean' || !Number.isFinite(Date.parse(row.synced_at))) {
    throw fail('CATALOG_ROW_INVALID');
  }
  const product_url = httpsUrl(row.product_url, true);
  return { id: product_url, name: row.name, price: row.price,
    description: row.description ?? '', category: row.category,
    collection: COLLECTIONS.has(row.collection) ? row.collection : 'sem_colecao',
    images: [httpsUrl(row.image_url)], product_url, available: row.available };
}

export async function readSupabaseCatalog({ env = process.env, fetchImpl = fetch, now = Date.now, pageSize = 100 } = {}) {
  const base = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !publicKey(key)) throw fail('CATALOG_PUBLIC_CONFIG_INVALID');
  const origin = new URL(base);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw fail('CATALOG_PUBLIC_CONFIG_INVALID');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) throw fail('CATALOG_PAGE_SIZE_INVALID');
  const signal = AbortSignal.timeout(20000);
  const headers = { apikey: key, Prefer: 'count=exact' };
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`;
  const query = async (params) => {
    const url = new URL('/rest/v1/products', origin);
    url.search = new URLSearchParams({ or: '(active.is.null,active.eq.true)', ...params }).toString();
    const response = await fetchImpl(url, { method: 'GET', headers, signal, redirect: 'error' });
    if (!response.ok) throw Object.assign(fail('CATALOG_SUPABASE_HTTP'), { status: response.status });
    const range = /^(?:\d+-\d+|\*)\/(\d+)$/.exec(response.headers.get('content-range') ?? '');
    const rows = await response.json();
    if (!range || !Array.isArray(rows)) throw fail('CATALOG_PAGE_INVALID');
    const total = Number(range[1]);
    if (!Number.isSafeInteger(total)) throw fail('CATALOG_PAGE_INVALID');
    return { rows, total };
  };
  // Synchronization updates synced_at transactionally. Check revision before and
  // after paging, so an import crossing these requests cannot publish a mixed batch.
  const revision = () => query({ select: 'product_url,synced_at', order: 'synced_at.desc.nullslast,product_url.asc', limit: '1' });
  const before = await revision();
  if (!before.total) throw fail('CATALOG_UNEXPECTED_EMPTY');
  const products = [];
  const urls = new Set();
  while (products.length < before.total) {
    const page = await query({ select: FIELDS, order: 'product_url.asc', offset: String(products.length), limit: String(pageSize) });
    if (page.total !== before.total || !page.rows.length || page.rows.length > pageSize
      || products.length + page.rows.length > before.total) throw fail('CATALOG_PAGE_INCOMPLETE');
    for (const row of page.rows) {
      const product = mapProduct(row);
      if (urls.has(product.id)) throw fail('CATALOG_DUPLICATE_URL');
      urls.add(product.id);
      products.push(product);
    }
  }
  const after = await revision();
  if (JSON.stringify(after) !== JSON.stringify(before)) throw fail('CATALOG_CHANGED_DURING_READ');
  return { source: 'nuvemshop', storage: 'supabase', fetchedAt: new Date(now()).toISOString(),
    syncedAt: before.rows[0]?.synced_at, complete: true, productCount: products.length, products,
    unknownCategories: [...new Set(products.filter(p => p.collection === 'sem_colecao').map(p => p.category))] };
}
