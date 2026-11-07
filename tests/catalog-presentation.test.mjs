import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundle = await build({ stdin: { contents: `
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server.browser';
import {CollectionProductCard} from './src/pages/Colecoes';
export {getProductCollection, getProductCollectionLabel} from './src/lib/collections';
export function card(piece,label) {return renderToStaticMarkup(createElement(CollectionProductCard,{piece,label}));}
`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'esm',platform:'browser',jsx:'automatic',
plugins:[{name:'no-live-auth-in-render-test',setup(b){
 b.onResolve({filter:/integrations\/supabase\/client/},()=>({path:'client',namespace:'test'}));
 b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const supabase = {};'}));
}}] });
const ui = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const piece={id:'url',name:'Colar Aurora (COL1)',price:87.5,description:'Descrição original',
 image_url:'https://images.example/a.webp',product_url:'https://lojadoaafloraatelier.lojavirtualnuvem.com.br/produtos/aurora/',available:true};
test('cards mantêm preço BRL, imagem, descrição, link Nuvemshop e suprimem parênteses só na apresentação',()=>{
 const markup=ui.card(piece,'Água');
 assert.match(markup,/Colar Aurora/); assert.doesNotMatch(markup,/COL1/);
 assert.match(markup,/R\$ 87,50/); assert.match(markup,/Descrição original/);
 assert.ok(markup.includes(piece.image_url)); assert.ok(markup.includes(piece.product_url));
 assert.match(markup,/target="_blank"/); assert.match(markup,/noopener noreferrer/);
 assert.equal(piece.name,'Colar Aurora (COL1)');
});
test('esgotado permanece com link de consulta e indicação que não é descrição oculta no mobile',()=>{
 const markup=ui.card({...piece,available:false});
 assert.match(markup,/<small role="status">Indisponível no momento<\/small>/);
 assert.ok(markup.includes(piece.product_url));
 assert.doesNotMatch(ui.card(piece),/Indisponível/);
});
test('seis coleções preservadas; sem_colecao não usa universe nem recebe título inventado',()=>{
 for(const collection of ['agua','terra','fogo','ar','fe','casa']) assert.equal(ui.getProductCollection({collection}),collection);
 for(const collection of ['sem_colecao','Raízes','']) {
  assert.equal(ui.getProductCollection({collection,universe:'agua'}),'sem_colecao');
  assert.equal(ui.getProductCollectionLabel({collection,universe:'agua'}),'');
 }
 assert.doesNotMatch(ui.card(piece),/<small>/);
});
