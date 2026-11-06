# HANDOFF TÉCNICO — AFLORA
**Data:** 06/11/2026
**Projeto:** Ateliê Aflora Preservada
**Site:** https://aflorapreservada.com.br
**Repositório:** `Saintsolution/aflora`
**Branch informada:** `main`

## 1. Objetivo da evolução

Migrar a vitrine pública da Aflora para um catálogo persistente no Supabase, atualizado automaticamente a partir da Nuvemshop.

A Nuvemshop continuará sendo a única ferramenta de gestão comercial utilizada pela Cris.

O Supabase funcionará como banco intermediário de leitura rápida, evitando que o carregamento das coleções dependa de consultar dezenas de páginas da Nuvemshop em tempo real.

## 2. Arquitetura aprovada

**Nuvemshop → extrator → sincronização → Supabase → Netlify → frontend**

Regras:

- Sincronização automática três vezes ao dia.
- Atualização manual futura pelo Admin.
- Inclusão automática de novos produtos, sem limite fixo de 56 peças.
- Atualização de nomes, preços, descrições, categorias, imagens e links.
- Somente a primeira imagem de cada produto será utilizada.
- As imagens permanecerão hospedadas na Nuvemshop.
- Produtos esgotados continuarão visíveis.
- Produtos ausentes numa extração incompleta não serão excluídos automaticamente.
- Falhas devem preservar o último catálogo válido.
- Nenhuma operação da sincronização deve afetar o Caderno.

## 3. Coleções e navegação

Coleções atualmente reconhecidas:

`agua`, `terra`, `fogo`, `ar`, `fe`, `casa`.

Nova regra aprovada:

Produtos cuja categoria não corresponda a uma coleção reconhecida receberão classificação interna `sem_colecao`.

Eles deverão:

- Aparecer no carrossel da Home.
- Aparecer numa seção provisória sem título na página Coleções.
- Manter a categoria original da Nuvemshop.
- Ser reclassificáveis quando uma nova coleção for implementada.

Não inventar automaticamente novos universos editoriais.

Preservar a navegação existente: cards da página Coleções levam à Nuvemshop; o carrossel da Home atualmente leva às coleções internas.

## 4. Alterações já executadas no Supabase

### Tabela `public.products`

Tabela existente, originalmente vazia, com 14 colunas e RLS ativado.

Campos adicionados com sucesso:

- `source_product_id TEXT`
- `available BOOLEAN`
- `synced_at TIMESTAMPTZ`

Índices criados:

- `products_product_url_unique`
- `products_source_product_id_unique`
- `products_collection_idx`

A chave primária original `id UUID` foi preservada.

Não houve importação de produtos até o momento.

### Tabela `public.catalog_sync_runs`

Criada com sucesso, contendo:

- `id UUID`
- `started_at`
- `finished_at`
- `status`: running, success ou failed
- `products_found`
- `products_inserted`
- `products_updated`
- `error_message`

RLS ativado. Nenhuma política pública adicionada.

Índice `catalog_sync_one_running_idx` criado para evitar múltiplos registros com status `running`.

Esse índice não substitui um mecanismo completo de recuperação de execuções interrompidas; será necessário tratar registros abandonados e concorrência real.

### Extensões instaladas

- `pg_cron` — 1.6.4
- `pg_net` — 0.20.0

**Nenhum agendamento foi criado ainda.**

## 5. Segurança existente

Políticas da tabela `products`:

- Visitantes podem ler produtos ativos.
- Administradores autenticados podem inserir, editar e excluir.
- Controle administrativo realizado por `is_admin()`.

Na implementação definitiva, a sincronização fará escritas exclusivamente pelo servidor, com autenticação privilegiada.

Revisar posteriormente as permissões antigas de escrita administrativa, considerando que o Admin deixará de gerenciar produtos.

## 6. Edge Function publicada

**Nome:** `sync-aflora-catalog`

Criada no editor do Supabase.

Estado atual: exclusivamente diagnóstico, sem operações de escrita.

Utiliza:

`withSupabase({ auth: "secret" })`

Configuração:

- `Verify JWT with legacy secret`: desativado.
- Autenticação por chave secreta exigida pelo código.

### Testes realizados

**Teste sem chave secreta:** rejeitado com `INVALID_API_KEY`, confirmando que chave publishable não é aceita.

**Teste autenticado:** aprovado.

Resposta:

```json
{
  "ok": true,
  "function": "sync-aflora-catalog",
  "mode": "diagnostic",
  "products_in_database": 0
}
```

A função conseguiu consultar `public.products`.

Não foram realizadas operações de INSERT, UPDATE ou DELETE.

Nenhuma chave secreta deve ser enviada ao Codex, colocada no frontend ou incluída no Git.

## 7. Catálogo atual e levantamento do Codex

Extrator existente:

`netlify/functions/catalog.mjs`

Consumidores diretos:

- `src/components/AvailablePieces.tsx`
- `src/pages/Colecoes.tsx`

Adaptador:

`src/lib/catalog/index.ts`

O contrato JSON contém `source`, `fetchedAt`, `products`, `unknownCategories` e metadados opcionais de cache.

Cada produto possui URL canônica, nome, preço, imagens, descrição, categoria, URL de compra, coleção e disponibilidade.

O extrator corrigido anteriormente retornou HTTP 200 com 56 produtos reais.

A correção local foi testada com 22 testes aprovados. O estado exato da publicação dessa correção deve ser confirmado no Git/Netlify antes de depender dela.

### Limitações conhecidas

- O identificador atual é a URL canônica, não um ID numérico estável da Nuvemshop.
- Mudanças de slug precisam de tratamento para não duplicar produtos.
- Duas peças já foram identificadas sem coleção reconhecida.
- O extrator realiza scraping das páginas públicas.
- A duração observada da extração completa foi de aproximadamente 10 segundos.
- É necessário testar paginação e desempenho com centenas de produtos.

## 8. Próximas implementações

### Fase A — Prévia da sincronização

Transformar a Edge Function diagnóstica em rotina capaz de:

1. Consultar o JSON do extrator atual.
2. Validar o contrato e os campos obrigatórios.
3. Normalizar categorias e coleções.
4. Classificar produtos desconhecidos como `sem_colecao`.
5. Identificar produtos novos e já cadastrados.
6. Retornar relatório de prévia sem gravar dados.

### Fase B — Persistência

- Implementar upsert seguro.
- Garantir idempotência e evitar duplicatas.
- Preservar um catálogo íntegro quando houver erro.
- Registrar execuções em `catalog_sync_runs`.
- Tratar execuções simultâneas ou abandonadas.
- Validar comportamento com quantidade crescente de produtos.
- Não confundir falta de estoque com produto inativo.

A publicação de um lote deverá ser consistente, sem expor uma atualização parcialmente gravada.

### Fase C — Agendamento

Após validar a importação:

- Configurar três execuções diárias com `pg_cron` e `pg_net`.
- Proteger as chamadas com segredo armazenado no servidor.
- Registrar resultados, duração e erros.
- Adicionar atualização manual autenticada.

### Fase D — Migração do frontend

Modificar o handler público para consultar o Supabase e devolver um contrato compatível com o existente.

Preservar componentes, layout, coleções, nomes, preços e links.

Adicionar a exibição provisória de `sem_colecao`, inclusive no carrossel.

Remover do Admin as funcionalidades de cadastro, edição, exclusão e upload de produtos. Manter o Caderno, autenticação e funcionalidades editoriais.

## 9. Situação atual e restrições

**Concluído:**

- Preparação inicial de `products`.
- Criação de `catalog_sync_runs`.
- Instalação das extensões necessárias.
- Publicação e teste da Edge Function diagnóstica.
- Definição das regras comerciais e de apresentação.

**Ainda não concluído:**

- Sincronizador real.
- Importação dos produtos.
- Cron.
- Alteração do frontend.
- Remoção do gerenciamento de produtos do Admin.

Não presumir que a migração está publicada ou que os 56 produtos estão armazenados no Supabase.

**Instrução ao Codex:** este documento é uma atualização de contexto, não uma autorização para executar alterações. Aguardar uma ordem de serviço específica para implementar, commitar ou publicar qualquer mudança.

---

## 10. Consolidação do estado e verificação — 06/11/2026

Este adendo atualiza o estado corrente sem substituir os registros históricos acima ou os relatórios anteriores. O conteúdo inicial deste arquivo é cópia integral do handoff fornecido pelo usuário, pois não havia arquivo de handoff no repositório local. O anexo original foi preservado.

### Estado atual da migração

Adota-se o handoff de 06/11/2026 como referência atual. Conforme informações do usuário, products mantém a PK UUID, recebeu source_product_id TEXT, available BOOLEAN e synced_at TIMESTAMPTZ e os três índices informados; catalog_sync_runs e suas restrições foram criados; pg_cron e pg_net instalados; sync-aflora-catalog está publicada exclusivamente em modo diagnóstico e protegida por segredo. Não há importação, cron ou migração do frontend concluídos. Essas informações do Supabase não foram novamente verificadas no banco nesta etapa.

Mantêm-se: Nuvemshop como fonte oficial; apenas primeira URL de imagem, sem Storage; esgotados visíveis; preservação do catálogo válido diante de falhas; Caderno independente; classificação interna sem_colecao para produtos sem coleção reconhecida, com exibição futura na Home e em seção sem título nas Coleções; preservação da navegação existente. Fases A a D seguem pendentes de implementação autorizada.

### Correção anterior e estado do Git

A pendência histórica de push registrada no relatório técnico foi resolvida em etapa anterior, após confirmação do usuário de que a produção utiliza main. O commit ae425b027fc2dd3b30967cfe0f0a8a3eac6a8a19 foi enviado para origin/main naquela etapa, com 22 testes e build aprovados. Nenhum commit, push ou deploy foi executado nesta nova verificação.

Consulta remota atual: refs/heads/main = ae425b027fc2dd3b30967cfe0f0a8a3eac6a8a19. O conteúdo remoto de netlify/functions/catalog.mjs foi comparado byte a byte com o arquivo local: idêntico. Git blob: 2aa52498fb0855347850f72531e2214c7a048766. Não foi acessado painel/artefato de deploy do Netlify nesta etapa; o Git confirma o código na main, e o teste HTTP confirma o comportamento público, sem atestar o hash interno da implantação.

### Verificação pública do contrato

GET https://aflorapreservada.com.br/.netlify/functions/catalog em 06/11/2026, aproximadamente 14:51 de Brasília:

- HTTP 200; application/json; charset=utf-8.
- Duração observada: 14,94 s; corpo: 40.592 bytes.
- source: nuvemshop; fetchedAt: 2026-11-06T17:51:30.905Z.
- 56 produtos, 56 product_url distintas; sem stale.
- Campos superiores: source, fetchedAt, products, unknownCategories.
- Todos os produtos apresentaram id, name, price, images, description, category, product_url, collection e available com os tipos esperados; images não vazio com URLs HTTPS; id igual a product_url.
- Duas categorias desconhecidas continuam registradas para colar-folha-seca-col00011-t-1aeww e colar-margarida-oval-col00014-ar-nvb0d. O extrator ainda retorna collection vazia nesses casos; a futura sincronização deverá normalizar para sem_colecao.
- Na resposta observada, nenhum produto tinha available=false; portanto esta consulta não testa o caso real de esgotado.
- Request ID: 01M6RZRYYAPA4JSPYENGGGPA2R.

Não foram exibidas credenciais. A consulta ao endpoint público não exigiu autenticação.

### Consumo pela futura Edge Function

É tecnicamente compatível com fetch servidor a servidor: GET público, JSON padrão, sem necessidade de credenciais Nuvemshop ou de CORS de navegador. Isso é uma avaliação de contrato; não houve execução a partir da rede do Supabase nem alteração da Edge Function.

O endpoint é utilizável para prévia e carga inicial enquanto continuar sendo extrator Nuvemshop. Quando o handler público passar a ler Supabase na Fase D, a sincronização deverá chamar um extrator separado/reutilizado. Manter o mesmo endpoint como origem criaria leitura circular da própria cópia persistida e impediria buscar novidades da Nuvemshop. Essa separação é pré-requisito para a migração definitiva.

Limites e cuidados para implementação futura:

1. O endpoint entrega um único lote, sem paginação externa, cursor ou total esperado. A paginação é interna sobre a Nuvemshop; parâmetros page no endpoint não implementam lotes. Há limite fixo atual de 200 produtos e proteção de 201 páginas. Não há limite fixo de 56, mas mais de 200 exigirá evolução do extrator.
2. Downloads têm timeout de 8 s e sinal global de 24 s; concorrência máxima de cinco detalhes. Com crescimento ou origem lenta, a extração pode falhar antes dos limites da Edge Function. O sinal global é passado aos downloads, não equivale a garantia rígida sobre toda CPU/parsing. Não foi realizado teste de carga com centenas de páginas reais nesta etapa.
3. Segundo documentação oficial consultada, Supabase Edge Functions têm 150 s de duração no Free, 400 s em planos pagos, request idle timeout de 150 s e 2 s de CPU por requisição. Espera de rede assíncrona não consome esse orçamento de CPU. O plano e os limites específicos deste projeto não foram consultados. A latência observada é compatível, mas não garante próximas execuções. Definir timeout de fetch e orçamento de validação/persistência antes de implementar.
4. O cache atual dura cinco minutos por instância, com CDN e navegador; falha de renovação pode devolver HTTP 200 com stale:true por até uma hora. A sincronização deve validar fetchedAt e stale e não registrar snapshot antigo como nova extração bem-sucedida. Não há opção explícita implementada de atualização forçada. Falhas têm cooldown de 30 s; tentativas imediatas não garantem nova extração.
5. HTTP 200 não prova completude: 404/410 individuais são omitidos; sitemap/listagem validamente vazios podem resultar em products vazio; não há manifesto de descartes/contagem esperada no JSON. Quedas inesperadas ou lote vazio não devem apagar registros anteriores. Preservar catálogo e produzir relatório para revisão.
6. id é URL, não ID comercial estável. source_product_id não deve receber esse valor como se fosse um ID estável Nuvemshop. Mudanças de slug e conflitos entre índices precisam de política explícita antes do upsert; id UUID do banco deve permanecer separado.
7. Persistir apenas images[0]; nunca enviar arquivos a Storage. Manter available separado de active. Não inferir novas coleções pelos nomes. Validar todos os campos e duplicatas antes de qualquer publicação de lote.
8. A capacidade de consumir JSON está confirmada por contrato; upsert atômico, recuperação de execuções abandonadas, políticas de escrita e agendamento não foram implementados nem testados nesta etapa.

Fonte dos limites: https://supabase.com/docs/guides/functions/limits (consultada nesta verificação).

### Escopo desta etapa

Única alteração no projeto: criação deste documento, preservando integralmente o handoff fornecido e acrescentando este adendo. Relatórios anteriores intactos. Sem alteração de código de produção, banco, configurações, cron ou Edge Functions. Sem commit, push ou deploy. deno.lock e public/assets/images/history/hist05.png permanecem preexistentes e não modificados.

---

## 11. Preparação local do extrator independente — 06/11/2026

### Implementação local

A lógica de leitura e parsing foi movida para `netlify/lib/catalog-extractor.mjs`. A função pública existente `netlify/functions/catalog.mjs` agora importa essa implementação compartilhada e mantém seu handler/cache HTTP atual, preservando o JSON consumido pela vitrine. A extração passa a incluir `complete: true` e `productCount` apenas depois de concluir sitemap, paginação e validação de todos os produtos retornados; uma falha interrompe a operação e não produz manifesto parcial.

Removido o teto estrutural de 200 produtos e de 201 páginas. Paginação prossegue até página sem produtos; página repetida continua sendo erro. Concorrência de detalhes permanece limitada a cinco e validação/preço/imagens/URLs continuam como antes. 404/410 individuais continuam sendo omitidos; se todos os produtos falharem dessa forma, a extração falha em vez de declarar sucesso vazio.

Criada `netlify/functions/catalog-source.mjs`, endpoint somente GET e somente leitura da Nuvemshop, que usa o extrator e retorna o lote completo com `no-store`. Não importa cliente Supabase, não lê credenciais e não escreve em banco. Métodos diferentes de GET recebem 405. A função é independente da rota pública `/catalog`, portanto uma futura rota `/catalog` que leia Supabase não cria dependência circular.

Este endpoint de origem é público e pode provocar uma extração custosa quando invocado. Ele não oferece escrita privilegiada, mas deve receber autenticação compartilhada servidor-servidor ou limitação de acesso antes de ser publicado para uso pelo sincronizador. Não colocar segredo no frontend. Como Netlify descobre e prepara cada função da pasta configurada durante o build, o novo endpoint poderá ser publicado no próximo deploy do projeto; a publicação foi expressamente adiada e nenhuma configuração foi alterada nesta etapa.

### Testes e limites

24 testes aprovados, incluindo novos cenários simulados paginados de 56, 200, 300 e 500 produtos, unicidade, marcador de conclusão, paginação e método permitido no endpoint. A simulação é rápida e não representa centenas de downloads reais. Build aprovado; persiste aviso de Browserslist desatualizado. `git diff --check` aprovado. Caderno, autenticação e Admin não foram editados; nenhuma chamada ao Supabase foi feita.

Limite operacional ainda presente: timeout global de 24 s, timeout de 8 s por download e concorrência cinco. A remoção do limite de contagem não significa que 500 produtos reais serão extraídos dentro do orçamento. A função síncrona tem limite padrão documentado pelo Netlify de 60 s e resposta bufferizada de 6 MB; os planos/limites específicos do site não foram verificados. A última consulta pública foi cerca de 40,6 KB para 56 itens, mas esse dado não estima adequadamente o HTML de origem nem o corpo com 500 itens. Se a leitura exceder o timeout global, o endpoint retorna erro e nenhum lote é marcado como completo. Próximos passos possíveis: extrair em páginas retomáveis com cursor/checkpoint e coordenador durável, ou usar workload assíncrono; não aumentar cegamente o timeout.

O endpoint mantém um único JSON agregado, sem paginação externa. `complete: true` e `productCount` fornecem validação básica, mas não um manifesto de URLs descartadas por 404/410 nem um total esperado independente. A Edge Function deve também rejeitar `stale`, validar campos e duplicatas, impor política contra lote vazio ou queda brusca de contagem, registrar descartes e só iniciar publicação quando a extração for comprovadamente aceitável. Falhas de escrita exigem operação atômica na camada Supabase; nada disso foi implementado aqui.

### Integração futura

1. Configurar segredo de leitura do endpoint fonte no servidor e exigir validação server-side; nunca usar service role ou segredo no cliente público. Não há endpoint privilegiado de importação neste patch.
2. Adaptar `sync-aflora-catalog` para obter JSON do endpoint fonte, validar `source`, `complete`, `productCount === products.length`, `fetchedAt`, campos, URLs únicas, imagens e preços; mapear coleção vazia para `sem_colecao` e usar apenas `images[0]`.
3. Identidade permanece URL canônica provisória; tratar `source_product_id` sem inventar ID e manter UUID da tabela. Upsert deve preservar `active`, `featured`, `new_arrival`, `sort_order` e `created_at`; atualizar campos comerciais e `available` separadamente.
4. Implementar transação/estágio e publicação consistente na RPC já existente ou em operação equivalente após rever sua definição real. Registrar a execução e falhas sem tocar tabelas do Caderno. Testar concorrência, execução interrompida, erro no meio do upsert e snapshots incompletos.
5. Importar e reconciliar 56 itens existentes, conferir seis coleções, valores editoriais e imagem principal. Em simulações de crescimento, medir execução e tamanho do corpo aos 200/300/500 com HTML real representativo.
6. Só então modificar `/catalog` para consultar Supabase mantendo seu contrato e adaptar `images: [image_url]`. Manter temporariamente a fonte atual ou fallback controlado até validar os dados persistidos; ativar nova leitura após smoke test de cada coleção e dos produtos esgotados. Alterar carrossel/sem_colecao em etapa compatível separada se necessário.
7. Remover ou restringir operações de produto do Admin em intervenção própria, preservando autenticação e Caderno.

### Escopo e publicação

Arquivos locais adicionados/modificados nesta preparação: `netlify/lib/catalog-extractor.mjs`, `netlify/functions/catalog-source.mjs`, `netlify/functions/catalog.mjs`, `tests/catalog.test.mjs` e este handoff. Frontend, Admin, Caderno, autenticação, banco, Edge Functions hospedadas, cron, `netlify.toml` e demais configurações não foram alterados. Sem SQL, commit, push ou deploy. O endpoint recém-criado existe apenas no código local e não está publicado.

---

## 12. Proteção Bearer local do extrator — 06/11/2026

`netlify/functions/catalog-source.mjs` agora exige `Authorization: Bearer <token>` antes de chamar `readCatalog()`. O segredo vem somente da variável de ambiente Netlify `AFLORA_CATALOG_SOURCE_TOKEN`; nenhum valor de segredo está no código, testes ou documento. Comparação em tempo constante para tokens de mesmo tamanho. Requisição sem token, com token inválido ou sem a variável configurada falha de forma fechada com HTTP 401, `WWW-Authenticate: Bearer` e `no-store`. GET com token válido mantém o JSON original, inclusive `complete`, `productCount`, `fetchedAt` e `products`. Método diferente de GET permanece 405. A rota pública `/catalog` não foi alterada por esta proteção.

Testes de autenticação injetam leitor e configuração fictícios em memória; não definem nem registram segredo real. Casos cobrem autorizado, cabeçalho ausente, token incorreto, esquema Basic, configuração ausente e confirmação de que respostas 401 não iniciam leitura. Suíte do catálogo: 26 aprovados; build Vite e bundling esbuild das Functions aprovados. Nenhum serviço externo foi alterado.

### Configuração futura (ainda necessária antes do deploy)

1. Gerar o token fora do Codex, em ferramenta segura da equipe. Não colocar seu valor em arquivos do repositório, conversa, logs ou frontend.
2. No Netlify, configurar `AFLORA_CATALOG_SOURCE_TOKEN` como variável secreta do contexto de produção (e deploy previews apenas se necessário). Salvar o valor no cofre da equipe.
3. No Supabase, adicionar o mesmo valor como secret disponível somente a `sync-aflora-catalog`, por exemplo com nome `AFLORA_CATALOG_SOURCE_TOKEN`; configurar também o URL do endpoint fonte como variável não secreta conforme o domínio final. A Edge Function enviará `Authorization: Bearer ${token}` em `fetch` servidor-servidor.
4. Fazer deploy da Netlify Function protegida e testar ausência/invalidez (401), depois chamada autorizada (200, `complete === true`, contagem e campos válidos), sem imprimir o cabeçalho.
5. Só então atualizar/deployar a Edge Function Supabase para usar a URL e token. Manter seu próprio segredo de autorização de sincronização separado; o token de leitura não é service role e não concede acesso de escrita ao Supabase.
6. Rotacionar ambos os lados coordenadamente se o token for exposto. Evitar testar tokens pela URL, query string ou cliente navegador.

Esta preparação requer configuração de segredo no Netlify e Supabase, mas nenhuma configuração foi feita nesta etapa. Sem commit, push ou deploy.
