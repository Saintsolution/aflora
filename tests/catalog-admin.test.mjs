import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSyncProxy } from '../netlify/functions/catalog-sync.mjs';
import { createHandler } from '../netlify/functions/catalog.mjs';

const env = { SUPABASE_URL: 'https://pgzxphalazwsgizfsvkz.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test', AFLORA_CATALOG_SYNC_SECRET: 'sb_secret_test_only' };
const event = { httpMethod: 'POST', headers: { origin: 'https://aflorapreservada.com.br', authorization: 'Bearer test.jwt.token', 'content-type': 'application/json' }, body: '{}' };
const json = (data,status=200) => new Response(JSON.stringify(data),{status});
function setup({ admin=true, userStatus=200, dispatch=async()=>json({ok:true,mode:'import',products_found:56,products_updated:56,products_inserted:0,secret:'never_return'}) , config=env }={}) {
 const calls=[];
 const handler=createSyncProxy({env:config,fetchImpl:async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/user')) return json({id:'user'},userStatus);
  if(url.endsWith('/is_admin')) return json(admin);
  return dispatch(url,options);
 }});
 return {handler,calls};
}
test('manual sync rejects method, foreign origin, missing session and injected body before upstream',async()=>{
 const {handler,calls}=setup();
 for(const [patch,status] of [[{httpMethod:'GET'},405],[{headers:{...event.headers,origin:'https://evil.example'}},403],[{headers:{...event.headers,authorization:''}},401],[{body:'{"mode":"preview"}'},400],[{body:'{"url":"https://evil.example"}'},400]]) assert.equal((await handler({...event,...patch})).statusCode,status);
 assert.equal(calls.length,0);
});
test('manual sync validates session remotely and checks real admin RPC with user token',async()=>{
 for(const [opts,status,n] of [[{userStatus:401},401,1],[{admin:false},403,2],[{admin:'true'},403,2]]){
  const {handler,calls}=setup(opts);assert.equal((await handler(event)).statusCode,status);assert.equal(calls.length,n);
  assert.ok(calls.every(c=>c.options.headers.Authorization===event.headers.authorization));
 }
});
test('only admin dispatches fixed import with server secret and sanitized counts',async()=>{
 const {handler,calls}=setup(); const result=await handler(event);
 assert.equal(result.statusCode,200);assert.equal(result.headers['Cache-Control'],'no-store');
 assert.deepEqual(JSON.parse(result.body),{ok:true,products_found:56,products_inserted:0,products_updated:56});
 const call=calls[2];assert.equal(call.url,`${env.SUPABASE_URL}/functions/v1/sync-aflora-catalog`);
 assert.equal(call.options.headers.apikey,env.AFLORA_CATALOG_SYNC_SECRET);
 assert.equal(call.options.headers.Authorization,undefined);assert.equal(call.options.body,'{"mode":"import"}');
 assert.equal((await handler(event)).statusCode,429);
});
test('manual sync fails closed when server credential missing or project differs',async()=>{
 for(const config of [{...env,AFLORA_CATALOG_SYNC_SECRET:''},{...env,SUPABASE_URL:'https://other.supabase.co'}]){
 const {handler,calls}=setup({config});assert.equal((await handler(event)).statusCode,503);assert.ok(calls.length<=2);
 }
});
test('manual sync prevents simultaneous dispatch and respects shared Edge lock',async()=>{
 let finish;const {handler,calls}=setup({dispatch:()=>new Promise(resolve=>{finish=resolve;})});
 const first=handler(event);
 while(!finish) await new Promise(resolve=>setTimeout(resolve,1));
 assert.equal((await handler(event)).statusCode,409);assert.equal(calls.filter(c=>c.url.includes('/functions/')).length,1);
 finish(json({error:'sync_already_running'},409));assert.equal((await first).statusCode,409);
});
test('timeouts and upstream errors never expose response bodies or claim success',async()=>{
 for(const dispatch of [async()=>{throw new Error('sensitive error');},async()=>json({error:'sensitive error'},500),async()=>json({ok:false})]){
  const {handler}=setup({dispatch});const r=await handler(event);assert.ok(r.statusCode>=500);assert.ok(!r.body.includes('sensitive'));assert.ok(!r.body.includes('sb_secret'));
 }
});
test('public cache refreshes within a minute after a manual sync without importing on reads',async()=>{
 let time=0,revision=1,reads=0;const handler=createHandler(async()=>{reads++;return {revision};},()=>time);
 assert.equal(JSON.parse((await handler({httpMethod:'GET'})).body).revision,1);
 revision=2;time=59999;assert.equal(JSON.parse((await handler({httpMethod:'GET'})).body).revision,1);
 time=60000;assert.equal(JSON.parse((await handler({httpMethod:'GET'})).body).revision,2);assert.equal(reads,2);
});
test('Admin removes product write/upload/list while retaining editorial sections',()=>{
 const admin=readFileSync('src/pages/Admin.tsx','utf8');
 assert.doesNotMatch(admin,/from\('products'\)|product-images|handleDelete|uploadProductImage|loadProducts|fetchProducts/);
 for(const fragment of ['<CatalogSyncPanel />','handlePostSubmit','handlePostDelete','handleCommentApproval','handleCommentDelete','handleLogin','handlePasswordRecovery']) assert.ok(admin.includes(fragment));
});
