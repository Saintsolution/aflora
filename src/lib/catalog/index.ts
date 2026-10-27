import type { Product } from '../products';

export type PublicProduct = Product & { images: string[] };
let cached: { expires: number; products: PublicProduct[] } | undefined;
let notice: string | undefined;

export function getCatalogNotice() {
  return notice;
}

let pending: Promise<PublicProduct[]> | undefined;

async function loadCatalog(): Promise<PublicProduct[]> {
  const response = await fetch('/.netlify/functions/catalog', { signal: AbortSignal.timeout(28000) });
  if (!response.ok) throw new Error(`Catálogo HTTP ${response.status}`);
  const data = await response.json();
  if (data.source !== 'nuvemshop' || !Array.isArray(data.products)) throw new Error('Catálogo inválido');
  const products = data.products.map((p: Record<string, unknown>, index: number): PublicProduct => {
    if (typeof p.name !== 'string' || typeof p.price !== 'number' || !Number.isFinite(p.price)
      || !Array.isArray(p.images) || !p.images.length || !p.images.every((url) => typeof url === 'string' && url.startsWith('https://'))
      || typeof p.description !== 'string' || typeof p.category !== 'string' || typeof p.collection !== 'string'
      || typeof p.product_url !== 'string' || !p.product_url.startsWith('https://lojadoaafloraatelier.lojavirtualnuvem.com.br/produtos/')) {
      throw new Error('Produto inválido');
    }
    return { id: p.product_url, name: p.name, price: p.price, images: p.images, image_url: p.images[0],
      description: p.description, category: p.category, collection: p.collection, universe: null,
      product_url: p.product_url, active: true, featured: false, new_arrival: false, sort_order: index, created_at: '' };
  });
  if (data.unknownCategories?.length) console.warn('Categorias Nuvemshop para revisão:', data.unknownCategories);
  notice = data.stale === true
    ? 'Exibindo a última consulta disponível. Nomes, preços e disponibilidade podem estar desatualizados; confirme na Nuvemshop.'
    : undefined;
  cached = { products, expires: Date.now() + 60000 };
  return products;
}

export function fetchPublicProducts(): Promise<PublicProduct[]> {
  if (cached && Date.now() < cached.expires) return Promise.resolve(cached.products);
  pending ??= loadCatalog().finally(() => { pending = undefined; });
  return pending;
}
