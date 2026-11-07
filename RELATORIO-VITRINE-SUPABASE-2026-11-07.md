# Fase 2 — leitura da vitrine via Supabase (07/11/2026)

## Resultado

Implementação exclusivamente local pronta para homologação, com ressalva dos três erros preexistentes no typecheck global. Nenhuma publicação, commit, push, importação ou escrita remota. A leitura pública usa apenas GET em PostgREST com chave pública/anon e RLS já existente. Edge v10, RPCs, cron, Vault, Nuvemshop, Caderno e Admin não foram editados nesta fase.

Homologação local: `node scripts/catalog-preview.mjs`, URL `http://127.0.0.1:5173`. Esse servidor adiciona o handler Netlify ao Vite e lê apenas as variáveis públicas necessárias. `npm run dev` sozinho não emula Netlify Functions. O servidor de homologação ficou disponível ao final desta etapa.

## Diagnóstico real somente leitura

Projeto Aflora `pgzxphalazwsgizfsvkz`, consultado pelo SQL Editor, sem comandos de escrita:

- `public.products`: 17 colunas reais: id uuid; name text; price numeric; description text nullable; collection text; category text; image_url text nullable; product_url text nullable; featured boolean nullable; new_arrival boolean nullable; active boolean nullable; sort_order integer nullable; created_at timestamptz; universe text nullable; source_product_id text nullable; available boolean nullable; synced_at timestamptz nullable.
- RLS habilitada, anon possui SELECT. Política `Anyone can view active products`, roles anon/authenticated, expressão `COALESCE(active,true)=true OR is_admin()`. Políticas administrativas de INSERT/UPDATE/DELETE continuam instaladas e intactas.
- 56 produtos, 56 URLs únicas, nenhum inativo, nenhum esgotado, nenhum campo obrigatório name/price/product_url/image_url nulo no diagnóstico. Água 5, Terra 15, Fogo 3, Ar 18, Fé 7, Casa 8. Não há sem_colecao real neste snapshot.
- `syncedAt` mais recente observado: `2026-11-06T23:58:38.570765+00:00` (06/11 20:58:38 Brasília). Esta fase não verificou execução do cron nem afirma que um disparo automático já concluiu. Consultar catálogo não dispara sincronização.
- Teste anônimo real pelo novo adaptador confirmou as mesmas 56 linhas sem sessão administrativa. Nenhuma política foi criada ou alterada.

A descrição e as URLs de imagem podem ser nulas no schema; o leitor recusa registros sem imagem/URL comercial/disponibilidade/synced_at válidos, para não publicar um catálogo silenciosamente parcial. Descrição null é representada como string vazia no contrato público legado. Os 56 registros reais passaram sem essa conversão.

## Dependências e contrato

Antes: Home → AvailablePieces e página Colecoes → src/lib/catalog/index.ts → GET /.netlify/functions/catalog → extrator → HTML Nuvemshop. O navegador mantém cache de 60 segundos e compartilha chamadas simultâneas. O handler mantém cinco minutos por instância, cooldown de 30 segundos e fallback de até uma hora.

Agora, localmente: mesmos consumidores e endpoint → `netlify/lib/supabase-catalog.mjs` → GET `/rest/v1/products`. `source:'nuvemshop'` é preservado porque continua sendo a origem comercial; `storage:'supabase'` informa o armazenamento. Preservados `fetchedAt`, `complete`, `productCount`, `products`, `unknownCategories`. Adicionado `syncedAt` para proveniência; fetchedAt é a hora de leitura do banco, não a hora da última sincronização.

`product_url` é o ID público. `image_url` vira `images:[image_url]`. Nomes comerciais, preços numéricos, descrições, categorias, links e disponibilidade permanecem originais. O leitor do frontend continua sem importar cliente Supabase em runtime. `Product` é tipo compartilhado, com available opcional para compatibilidade com o Admin antigo; o contrato produzido pelo novo adaptador exige booleano.

Outras dependências: `src/lib/products.ts` contém formatPrice e fetchProducts, este último usado somente pelo Admin. `src/lib/collections.ts` é compartilhado por Admin e vitrine: agora classifica somente por collection, nunca universe. O Admin em si não foi alterado; coleções legadas livres deixam de herdar universe nesse helper. `nomeFashion` permanece intacto e remove parênteses somente da apresentação. Preço continua com Intl.NumberFormat pt-BR/BRL.

O endpoint protegido `catalog-source.mjs` continua importando diretamente `catalog-extractor.mjs`, sem depender do catálogo público ou do Supabase. Não há dependência circular. Teste de bundling comprova que o catálogo público não inclui scraper, endpoint fonte ou código Edge.

## Paginação e continuidade

Paginação ordenada por product_url, páginas de até 100 (tamanho de requisição, não limite do catálogo), avançando pela quantidade efetivamente recebida. Aceita limite menor imposto pelo servidor. Requer count=exact; total inconsistente, duplicatas, página vazia prematura, registro inválido ou erro HTTP/rede abortam o lote inteiro.

Uma revisão com contagem e maior synced_at é consultada antes/depois. Como a importação atual atualiza synced_at transacionalmente, uma importação atravessando a paginação invalida o novo snapshot. Isso não equivale a snapshot SQL entre várias requisições: alterações manuais que não atualizem synced_at podem escapar da detecção. A remoção futura do CRUD comercial reduz esse risco; não foi feita nesta etapa.

O cache anterior só é substituído após validação integral. Falha usa snapshot válido por até uma hora com stale:true, aviso existente e no-store; sem snapshot, retorna 503. Cache efêmero não protege instância fria. Lote vazio inesperado do banco é tratado como erro, preservando snapshot anterior; não há fallback para scraping. Prazo total de leitura: 20 segundos, sem teto de produtos. Volume futuro deve ser medido frente a esse orçamento.

## Apresentação e navegação

- Mantidas seis abas, ordem, layout, tipografia, fotos, preços e textos existentes.
- Carrossel continua embaralhado/intercalado; cards reconhecidos abrem `/colecoes?colecao=...`.
- Sem coleção reconhecida: participa do carrossel, sem rótulo inventado; abre `/colecoes#pecas-sem-colecao`. Página inclui bloco provisório sem título abaixo da coleção selecionada. Categoria original é preservada.
- Cards de Coleções continuam links externos Nuvemshop, target=_blank e noopener noreferrer.
- Esgotados não são filtrados; recebem “Indisponível no momento” em Home e Coleções e conservam link de consulta. Em Coleções a indicação usa small para não ser escondida pela regra mobile preexistente que oculta descrições em p.
- Descrições permanecem visíveis no desktop e ocultas no mobile conforme CSS anterior. Não foi solicitado restyling.
- A ordem de Coleções segue a leitura determinística por URL; campos editoriais não são usados para classificação. Home continua embaralhando. Nenhum CSS ou texto editorial foi modificado.

## Auditoria do Admin e preparação da remoção (proposta, não aplicada)

`src/pages/Admin.tsx`:

- `loadProducts` usa fetchProducts, que lê a tabela inteira sem paginação e filtra inativos; o CRUD não é a nova fonte pública.
- Estados comerciais nas linhas aproximadas 81–103; resetForm (~451), startEditing (~623), uploadProductImage (~648), handleSubmit (~696), handleDelete (~797).
- handleSubmit cria/atualiza name, price, description, universe, collection, category, product_url, active, featured, new_arrival, sort_order e image_url. Isso pode conflitar com sincronização futura dos campos comerciais.
- upload envia arquivo com UUID para bucket product-images e retorna URL pública; exclusão da linha não remove arquivo do bucket, podendo deixar órfãos.
- Formulário e listagem comerciais aproximadamente 1150–1710; login/logout/recuperação ficam em blocos anteriores, e o Caderno começa na seção seguinte. O effect de sessão carrega produtos, posts e comentários no mesmo fluxo: remover somente chamadas/estado de produtos, preservando posts/comentários e subscription.

Plano para próxima revisão: remover handlers, upload, estados/imports e formulário/listagem de edição de produtos; substituir texto de apresentação comercial por orientação à Nuvemshop e eventual resumo somente leitura. Não remover sessão, login, recuperação, usuários, handlers editoriais, posts, aprovação/moderação, bucket ou políticas automaticamente. Revisão posterior de permissões de escrita comercial deve ser separada e preservar as RPCs service_role e toda a operação editorial. Não há patch de remoção aplicado nesta fase.

## Proposta do botão “Atualizar catálogo agora” (não implementado)

Admin autenticado → POST em intermediário Netlify dedicado → Edge v10 com apikey obtida exclusivamente de variável de servidor. O navegador envia somente token da sessão; intermediário valida usuário no Supabase e autorização administrativa real (`is_admin`/papel verificado no servidor), não apenas existência de sessão. Recusar método/origem inadequados, limitar frequência e reutilizar o lock já existente (409 se execução ativa). Não aceitar URL, chave ou payload arbitrários do navegador: fixar destino e mode:import no servidor. Retornar somente status/contagens e mensagem sanitizada; no-store, sem headers de autenticação em logs. Chave administrativa nunca VITE_ nem resposta de API.

Depois de sucesso, prever invalidação/expiração do cache (até cinco minutos backend e 60 s navegador) e mostrar hora/contagens; sem prometer atualização instantânea da vitrine enquanto houver cache. Nenhuma Edge, RPC, política ou botão novo foi implementado agora. Essa proposta depende de revisão específica de autenticação, secrets de servidor, autorização e testes.

## Arquivos desta fase

Modificados:
- netlify/functions/catalog.mjs
- src/lib/catalog/index.ts
- src/lib/collections.ts
- src/lib/products.ts (tipo available opcional apenas)
- src/components/AvailablePieces.tsx
- src/pages/Colecoes.tsx (card compartilhado entre blocos normal/provisório)
- tests/catalog.test.mjs (testes do extrator importam o módulo independente)
- tests/public-catalog.test.mjs
- HANDOFF-TECNICO-AFLORA.md (nova seção, sem apagar histórico)

Criados:
- netlify/lib/supabase-catalog.mjs
- scripts/catalog-preview.mjs
- tests/supabase-catalog.test.mjs
- tests/catalog-presentation.test.mjs
- Este relatório.

Alterações/untracked de etapas anteriores foram preservados, incluindo package.json, supabase/, testes de sincronização, relatórios, deno.lock e hist05.png. Não foram incluídos snapshots de produtos nem credenciais no repositório.

## Validação

- `npm run test:catalog`: 54/54 aprovados; inclui testes existentes e sincronização. Paginação 56/150/300/500 e páginas de 37, falha intermediária, truncamento, duplicação, revisão concorrente, HTTP/JSON inválidos, recusa de chave administrativa, cache/stale/expiração, bundle sem scraping, seis coleções, sem_colecao, disponibilidade, imagens, preço e nomes.
- Teste real read-only: 56/56 produtos mantidos pelo adapter e pelo leitor TypeScript compilado; comparação de name/price/description/category/collection/product_url/available e images[0]. IDs únicos por URL. 56/56 imagens públicas responderam HEAD com sucesso e Content-Type image/*.
- Nova extração pública usou três GETs no Supabase (revisão, página única, revisão), nenhum HTTP de catálogo à Nuvemshop. As fotos naturalmente continuam sendo baixadas do CDN Nuvemshop pelo navegador; isso é esperado.
- Build aprovado após alterações. `git diff --check` aprovado.
- Typecheck executado antes e depois: os mesmos três TS2339 preexistentes em Atelier.tsx (calendula, buttercups) e Objects.tsx (wildflowerDetail). Não foram corrigidos para evitar alterar áreas visuais fora desta ordem. A homologação não deve ser descrita como typecheck global aprovado.
- Desktop real no Chrome: Home e carrossel carregados; clique de peça levou a coleção Água; cards/links/fotos e preço conferidos. Mobile emulado 350×739: grid, nomes, preços e menu; navegação do menu para Fé aprovada. Não é teste em aparelho físico, nem auditoria visual individual das 56 fotos. As 56 URLs passaram HEAD e os 56 registros passaram validação de dados.
- sem_colecao/esgotados não existem no snapshot real: cobertos em simulação/SSR, não com alterações no banco.
- Sem diferenças nos arquivos rastreados catalog-source.mjs, catalog-extractor.mjs, Admin.tsx e Caderno.tsx. Nenhuma edição em Edge/RPC/cron/Vault foi feita nesta fase.

## Publicação e rollback propostos

1. Homologar localmente via script acima, inclusive seis coleções e regras de nomes. Revisar o relatório e os três problemas preexistentes de typecheck antes de liberar publicação.
2. Confirmar no contexto Functions do Netlify URL e chave pública do MESMO projeto: preferencialmente SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY; aceita também VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY se disponíveis no runtime. Variáveis VITE configuradas só para Build podem não chegar às Functions. Usar somente publishable ou JWT anon; o adaptador recusa secret/service_role. Nenhuma configuração Netlify foi feita nesta fase.
3. Após autorização explícita futura: selecionar apenas os arquivos desta fase, revisar diff para não incluir trabalho anterior indevidamente, publicar versão controlada e verificar GET público com complete:true, storage:supabase, contagem, seis coleções e navegação. Primeiro request pode ser frio. Não fazer import manual para testar leitura.
4. Acompanhar erros catalog_refresh_failed e freshness/syncedAt; não interpretar fetchedAt como sucesso de sync. O frontend atual mostra aviso em fallback de leitura, não implementa alerta operacional de cron.
5. Rollback preferido: restaurar o deploy anterior no Netlify. Código anterior de catalog.mjs volta a ler o extrator independente; isso é rollback explícito, não fallback de toda visita na versão nova. Não desfazer banco, Edge v10, cron, Vault, RPCs ou dados. Se frontend novo for mantido com catálogo antigo, available continua disponível e coleção vazia será tratada como sem_colecao; para reversão visual integral, restaurar o deploy completo anterior.

Fontes técnicas: https://supabase.com/docs/guides/api e https://supabase.com/docs/reference/javascript/using-modifiers-range (leitura REST com RLS e paginação ordenada). Consulta em 07/11/2026.
