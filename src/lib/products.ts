import { supabase } from '../integrations/supabase/client';

export type Product = {
  id: string;
  name: string;
  price: number;

  description: string | null;

  universe: string | null;
  collection: string;
  category: string;

  image_url: string | null;
  product_url: string | null;

  featured: boolean;
  new_arrival: boolean;
  active: boolean;

  sort_order: number;

  created_at: string;
};

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    throw error;
  }

  const products =
    (data ?? []) as unknown as Product[];

  return products
    .filter((product) => product.active !== false)
    .sort((a, b) => {
      const orderA = a.sort_order ?? 0;
      const orderB = b.sort_order ?? 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
}

export const CATEGORIES = [
  {
    value: 'brinco',
    label: 'Brincos',
  },
  {
    value: 'colar',
    label: 'Colares',
  },
  {
    value: 'decoracao',
    label: 'Decoração',
  },
] as const;

export function formatPrice(value: number) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  ).format(value);
}