import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  collection: string;
  category: string;
  image_url: string | null;
  product_url: string | null;
  created_at: string;
};

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export const CATEGORIES = [
  { value: "brinco", label: "Brincos" },
  { value: "colar", label: "Colares" },
  { value: "decoracao", label: "Decoração" },
] as const;

export function formatPrice(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
