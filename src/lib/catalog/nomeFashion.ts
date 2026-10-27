export function nomeFashion(nome: string): string {
  return nome.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}
