# Parecer de pré-publicação — vitrine Supabase, 07/11/2026

## Parecer

Parecer FAVORÁVEL à publicação controlada, mediante autorização do responsável. A pendência de configuração do Netlify foi resolvida em acesso somente leitura na conta correta, site atelieaflora/aflorapreservada.com.br, repositório Saintsolution/aflora. A sessão anterior estava em outro perfil; a conferência posterior substitui aquela limitação. Nenhuma variável/configuração foi alterada; nenhum commit, push ou deploy foi executado.

## Configuração e credenciais

| Item | Evidência e estado |
| --- | --- |
| Leitor aceita SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY ou equivalentes VITE_ | Confirmado no código; os nomes sem VITE_ têm precedência |
| Projeto esperado | Aflora, ref público pgzxphalazwsgizfsvkz |
| Configuração local | Somente variáveis públicas selecionadas do .env foram usadas na homologação; leitura real dos 56 produtos no projeto correto passou |
| Configuração Functions/Production Netlify | CONFIRMADA: VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY, All scopes, mesmo valor em todos os contextos, inclusive Production |
| Chave efetiva no Netlify é pública e do projeto certo | CONFIRMADO: tipo publishable; comparação SHA-256 em memória comprovou identidade com a chave pública já testada contra o projeto Aflora. Valor e fingerprint não foram gravados neste relatório |
| Guarda do adaptador | Só aceita sb_publishable_ ou JWT com role anon; rejeita sb_secret_ e service_role antes do fetch |
| Credencial no frontend | Configuração local validada como pública; a compilação local não continha sb_secret_. Não há chave administrativa nova no código |

O netlify.toml não define essas variáveis. O painel Netlify confirmou o par VITE_ em All scopes/Production; a listagem do projeto não contém SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY que sobrescrevam o par VITE_. A URL de produção corresponde ao projeto pgzxphalazwsgizfsvkz. A chave foi classificada em memória, sem exibir seu valor no retorno das ferramentas, copiar para clipboard ou gravar em arquivo; depois voltou a ficar ocultada. É publishable, não sb_secret_ nem JWT service_role, e coincide com a credencial pública usada na leitura real aprovada. A configuração do runtime foi verificada no painel, mas o novo handler ainda não foi executado em produção porque não houve deploy.

A documentação oficial distingue scopes Builds/Functions e informa que variáveis declaradas apenas no netlify.toml não chegam às Functions: https://docs.netlify.com/build/functions/environment-variables/ (consultada em 07/11/2026).

## TypeScript e publicação

Typecheck reexecutado: três TS2339 preexistentes, sem mudança:
- src/components/Atelier.tsx:32 — imageUrls.calendula.
- src/components/Atelier.tsx:43 — imageUrls.buttercups.
- src/components/Objects.tsx:12 — imageUrls.wildflowerDetail.

imageUrls tem somente agua, terra, fogo e ar. Os componentes Atelier e Objects não estão importados pela árvore atual de App/Home/páginas; a busca de consumidores não encontrou seu uso. Se voltassem a ser renderizados, os acessos ausentes produziriam undefined e PlaceholderVisual usaria o placeholder já existente. Não afetam a nova leitura comercial nem introduzem falha de execução no catálogo.

O build configurado no repositório é npm run build → vite build, sem tsc. Ele passou, inclusive na cópia isolada. Portanto esses três erros NÃO bloqueiam esse comando de publicação. Uma verificação de CI/Netlify que execute npm run typecheck separadamente continuará falhando; o painel Netlify confirmou npm run build, publish dist, Functions netlify/functions, Node 22.x e branch de produção main. Não foi feita auditoria exaustiva de gates externos ao Netlify/GitHub. Não foram alterados componentes visuais, tipos de imagens ou configuração para ocultar os erros.

## Primeiro disparo automático confirmado

Consulta somente leitura no SQL Editor do projeto Aflora, após o horário de 14h Brasília:

- cron.job_run_details: jobid 1, runid 1; início 07/11/2026 17:00:00.145577 UTC (14:00:00 Brasília), fim 17:00:00.166130 UTC, status succeeded.
- catalog_sync_runs: ID 5ba8ed9d-c711-4ded-849f-04c6074e2a1f; início 17:00:01.543625 UTC e fim 17:00:16.243080 UTC (14:00:16 Brasília); status success; 56 encontrados, 0 inseridos, 56 atualizados.
- O enfileiramento cron e a importação comercial bem-sucedida estão correlacionados por horário. Não existe ID HTTP compartilhado de ponta a ponta nesta implementação. Nenhuma importação manual foi disparada nesta conferência.

Cron, Edge Function, RPCs, Vault, Nuvemshop, produtos e Caderno não foram modificados pelo agente. As atualizações acima foram feitas pelo cron previamente autorizado, no horário previsto.

## Inventário exato proposto

Base local: 556bef49e5ec088928097717b6ba9925cd86bb37. Nenhum arquivo foi staged/committed nesta revisão.

Incluir o conteúdo atual integral destes 14 arquivos:

1. netlify/functions/catalog.mjs
2. netlify/lib/supabase-catalog.mjs (novo)
3. src/components/AvailablePieces.tsx
4. src/lib/catalog/index.ts
5. src/lib/collections.ts
6. src/lib/products.ts
7. src/pages/Colecoes.tsx
8. tests/catalog.test.mjs
9. tests/public-catalog.test.mjs
10. tests/catalog-presentation.test.mjs (novo)
11. tests/supabase-catalog.test.mjs (novo)
12. scripts/catalog-preview.mjs (novo)
13. RELATORIO-VITRINE-SUPABASE-2026-11-07.md (novo)
14. RELATORIO-PREPUBLICACAO-2026-11-07.md (este parecer)

15º arquivo, com seleção PARCIAL: HANDOFF-TECNICO-AFLORA.md — incluir apenas as novas seções 17, 18 e 19 sobre vitrine/pré-publicação; preservar o conteúdo já existente em HEAD. As seções 13–16 pertencem ao trabalho anterior de sincronização/cron e ficam fora deste commit. O workspace as mantém intactas. Não usar git add do arquivo inteiro sem separar esses trechos.

Excluir integralmente:
- package.json: a única mudança é o script test:catalog-sync da etapa anterior, não necessário para a vitrine.
- tests/catalog-sync.test.mjs e todo supabase/ (inclusive .temp, diagnósticos, migration/rollback, fixture, Edge Function e cron).
- RELATORIO-CATALOGO-SYNC-2026-11-06.md e RELATORIO-CRON-2026-11-07.md.
- deno.lock e public/assets/images/history/hist05.png.
- .env, node_modules/, dist/, caches, snapshots reais e todos os arquivos /tmp.
- Quaisquer alterações novas fora da lista acima que apareçam depois desta revisão.

Não alterar ou selecionar catalog-source.mjs/catalog-extractor.mjs, que já existem em HEAD e permanecem intactos. Não remover arquivos das fases anteriores para limpar status; apenas excluí-los da seleção futura. Conferir git diff --cached por nome e conteúdo antes de qualquer commit futuramente autorizado; nunca git add . neste workspace.

## Validação da seleção isolada

Criada cópia descartável em /tmp/aflora-vitrine-prepublish a partir de git archive HEAD, com somente os arquivos da vitrine sobrepostos e handoff recortado. Sem git checkout/stash/reset ou mudanças de índice no workspace. node_modules reutilizado por symlink local; sem instalação de dependências. package.json permaneceu o de HEAD; supabase/ e tests/catalog-sync.test.mjs ficaram fora.

- Testes dessa seleção: 40/40 aprovados. A diferença para os 54 do workspace é a exclusão intencional dos 14 testes da sincronização anterior, não perda de cobertura da vitrine.
- Build da seleção: aprovado.
- Typecheck do workspace: os mesmos três erros acima. Componentes e configuração são idênticos na seleção.
- git diff --check: aprovado.
- Homologação real anterior: 56 produtos, 56 imagens públicas válidas, desktop/mobile emulado e paginação simulada 150/300/500; não foi repetida sem necessidade nesta revisão.

## Decisão de publicação

Cron automático: confirmado funcional. Código/build/seleção de arquivos: aprovados com a dívida técnica TypeScript documentada. Configuração Functions/Production, URL/projeto, credencial pública e build command do Netlify: CONFIRMADOS. Parecer favorável para o responsável autorizar publicação via Git.

Evidências do painel: site atelieaflora, domínio aflorapreservada.com.br, repositório github.com/Saintsolution/aflora, produção main; Build command npm run build; Publish directory dist; Functions directory netlify/functions; Node.js 22.x. Variáveis VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY em All scopes e Same value in all deploy contexts. Não foi necessário adicionar variáveis sem VITE_ ou alterar scopes.

Após autorização futura, publicar via Git com a seleção acima e verificar GET público storage:supabase/complete:true, contagem e navegação. Rollback: restaurar o deploy completo anterior no Netlify, sem desfazer Supabase, cron ou dados. Nada foi publicado nesta etapa.
