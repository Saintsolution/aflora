export const COLLECTION_OPTIONS = [
  { value: 'agua', label: 'Água' },
  { value: 'ar', label: 'Ar' },
  { value: 'terra', label: 'Terra' },
  { value: 'fogo', label: 'Fogo' },
  { value: 'fe', label: 'Fé' },
  { value: 'casa', label: 'Casa' },
] as const;

function normalize(value: string | null | undefined) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

type Classification = { collection?: string | null; universe?: string | null };

export function getProductCollection(product: Classification): string {
  const id = normalize(product.collection);
  return COLLECTION_OPTIONS.some((option) => option.value === id) ? id : 'sem_colecao';
}

export function getProductCollectionLabel(product: Classification) {
  const id = getProductCollection(product);
  return COLLECTION_OPTIONS.find((option) => option.value === id)?.label ?? '';
}
