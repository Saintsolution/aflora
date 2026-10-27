import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundle = await build({entryPoints:['src/lib/catalog/nomeFashion.ts'],bundle:true,write:false,format:'esm'});
const {nomeFashion} = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('limpa referências apenas na apresentação e normaliza espaços', () => {
  for (const [original, expected] of [
    ['Colar Aurora (AF001)','Colar Aurora'],
    ['Brinco Primavera (BR023)','Brinco Primavera'],
    ['Pingente Jardim Secreto (AG015)','Pingente Jardim Secreto'],
    ['Colar Flor do Campo (REF12) (Água)','Colar Flor do Campo'],
    ['Brinco Rosa do Deserto','Brinco Rosa do Deserto'],
    ['  Colar  (REF)  Aurora\n (Água)  ','Colar Aurora'],
    ['',''],
  ]) {
    const product = {name:original,product_url:'https://example.org/produtos/peca/',price:87};
    const before = {...product};
    assert.equal(nomeFashion(product.name),expected);
    assert.deepEqual(product,before);
  }
});
