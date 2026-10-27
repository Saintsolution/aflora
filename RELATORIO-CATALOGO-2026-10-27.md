# Correção local do catálogo e nomes — 27/10/2026

Sem commit, push, deploy ou alterações na Nuvemshop/Supabase.

## Causa comprovada

A execução local do leitor original, com acesso à origem pública, falhou com `Nuvemshop HTTP 404` durante o download de detalhes. A URL foi identificada numa consulta diagnóstica:

`/produtos/colar-margarida-oval-correntinha-col00027ar-3ie5z/`

Ela permanece no sitemap e não está na listagem paginada atual. A função anterior tratava qualquer erro de qualquer página como falha de todo o lote e devolvia 503. O 503 observado localmente resulta, portanto, da política interna de agregação diante de um 404 da origem; não comprova uma indisponibilidade geral da Nuvemshop.

A razão administrativa do 404 (exclusão, despublicação ou alteração de endereço) não foi verificada. Não foram consultados logs de produção ou configurações privadas da Netlify; não é possível garantir que toda ocorrência histórica de 503 tenha a mesma causa.

## Correção

- Ignorar exclusivamente respostas HTTP 404/410 em URLs descobertas apenas pelo sitemap e ausentes de toda a listagem paginada. Registrar status e caminho público descartado.
- Manter falha integral para erros 404/410 de produtos ainda listados, 429/5xx, erros de rede/timeout, HTML inválido e produtos incompletos. Não publicar lotes parciais diante dessas falhas.
- Preservar descoberta pela união sitemap/listagem, deduplicação, paginação, concorrência máxima de cinco e limite de 200 URLs.
- Preservar o cache normal de cinco minutos, cache do frontend de 60 segundos, compartilhamento de requisições simultâneas e intervalo de 30 segundos entre tentativas após erro.
- Após falha de atualização, permitir o último snapshot válido da mesma instância até completar uma hora desde sua obtenção bem-sucedida. Não prolongar essa idade após falhas. Responder com `stale: true`, `cacheAgeSeconds`, `fetchedAt` original e `no-store` para navegador/CDN. Home e coleções mostram aviso de possíveis nomes, preços e disponibilidade desatualizados.
- Sem snapshot, ou após o limite de uma hora, continuar respondendo 503 com erro explícito. Um catálogo vazio que já era validamente lido continua vazio; nenhuma exceção é convertida em lista vazia.
- Logs distinguem HTTP da origem, timeout, rede, cooldown e validação/falha interna. Registram status, caminho, código de rede, motivo conhecido e idade do cache, sem cabeçalhos, corpos de resposta, credenciais ou variáveis de ambiente.
- `nomeFashion()` remove trechos entre parênteses e normaliza espaços somente em títulos e textos alternativos dos cards públicos. Dados originais, preços, imagens, categorias, descrições e URLs permanecem intactos. Títulos editoriais e admin não foram alterados.

## Todas as condições de 503 do handler

Sem cache aproveitável: falha HTTP da origem (exceto a remoção comprovada acima), falha de rede, redirecionamento recusado, timeout por download (8 s) ou total (24 s), sitemap inválido/URL externa, listagem inválida, paginação repetida, limites de paginação/200 URLs, JSON-LD ausente, campos obrigatórios/canonical/imagens inválidos, erro interno inesperado ou nova chamada dentro do cooldown após falha. Com cache dentro de uma hora, essas condições usam o snapshot sinalizado. Métodos diferentes de GET retornam 405.

O endereço fixo `https://lojadoaafloraatelier.lojavirtualnuvem.com.br` e suas rotas `/sitemap.xml`, `/produtos/`, `?page=N` funcionaram na consulta real. Não foi necessário alterar endpoints, timeout ou variáveis: a função não depende de variáveis de ambiente ou credenciais. Configuração local: Node 22, bundler esbuild, diretório `netlify/functions`.

## Validação

- Handler corrigido consultando a origem real: HTTP 200, 33 produtos, 7.941 ms numa execução. O 404 antigo foi registrado e descartado.
- Coleções reais: Água 5, Terra 8, Fogo 2, Ar 7, Fé 6 e Casa 3. Duas peças têm somente a categoria pública `Produtos`, permanecem sem coleção atribuída e geram aviso para revisão: `colar-folha-seca-col00011-t-1aeww` e `colar-margarida-oval-col00014-ar-nvb0d`. Não foi deduzida categoria a partir do nome/referência.
- 20 testes automatizados aprovados: extração, disponibilidade, seis coleções, descoberta/paginação/deduplicação, concorrência/cache/expiração, 404/410 antigos, falha em produto listado, 429/503, timeout simulado, ausência/limite/recuperação de cache, cooldown, nomes, preservação dos dados e aviso de desatualização no leitor público. Cenários de 2, 10, 50 e 200 produtos usam dados simulados.
- Build aprovado; aviso de base Browserslist desatualizada preexistente.
- ESLint dos quatro arquivos TypeScript alterados aprovado. `git diff --check` aprovado.
- Typecheck global falhou nos três erros preexistentes também registrados no relatório de 20/10: `calendula` e `buttercups` em `Atelier.tsx`; `wildflowerDetail` em `Objects.tsx`.
- Lint global falhou em código gerado `.netlify/functions-serve/...` (seis regras ausentes), import não utilizado em `FinalCTA.tsx` e `prefer-const` em `MusicPlayer.tsx`; há também aviso de dependência de hook em `Caderno.tsx`. Não foram feitas correções fora do escopo.
- Navegador com componentes reais e snapshot público recém-consultado servido por handler local: seis coleções conferidas, nomes sem parênteses nos cards e alt; 31 produtos classificados na Home, repetidos apenas visualmente. A primeira rodada do carrossel contém seis coleções distintas; embaralhamento/intercalação não tiveram seu código alterado. Avanço medido de 354 px em 7,089 s, aproximadamente 50 px/s.
- Desktop 1440 × 900: cards de Casa com aproximadamente 298,4 px; documento sem overflow horizontal. Mobile 390 × 844: cards com aproximadamente 169,8 px, contidos na largura da tela; inspeção visual aprovada. Emulação removida ao concluir.
- Links de cards das quatro coleções elementais conferidos com origem Nuvemshop, `_blank` e `noopener`; clique efetivo no Incensário Quartzo Verde em Casa abriu sua URL correta em nova aba, onde a referência original continua no título. Home continua navegando para a coleção, como antes.
- Falhas simuladas somente no servidor local: snapshot antigo mostrou aviso na Home e nas coleções mantendo cards; HTTP 503 sem cache mostrou as mensagens existentes de indisponibilidade na Home e nas coleções. Harness e fixtures ficaram em `/tmp`, fora do código do produto.

## Limitações

O cache de fallback é em memória por instância: não sobrevive a reinicialização, deploy ou instância fria e não é compartilhado entre instâncias. A documentação da [Netlify Functions](https://docs.netlify.com/build/functions/overview/) descreve esse ambiente como efêmero. Não foi introduzido armazenamento persistente nem dependência nova. CDN real e limites do plano precisam ser observados após eventual deploy autorizado; não foram validados por um servidor Vite local.

Permanecem a dependência do HTML público e o orçamento total de 24 s. A leitura real atual passou, mas não garante que 200 páginas reais caibam nesse prazo. Mudanças de tema, bloqueio de origem ou novas falhas são reportados explicitamente; não há produtos/preços/disponibilidade inventados. Uma tela aberta não faz polling e pode manter a apresentação já carregada, como antes.

## Arquivos

- `netlify/functions/catalog.mjs`
- `src/lib/catalog/index.ts`
- `src/lib/catalog/nomeFashion.ts` (novo)
- `src/components/AvailablePieces.tsx`
- `src/pages/Colecoes.tsx`
- `tests/catalog.test.mjs`
- `tests/public-catalog.test.mjs`
- `tests/product-name.test.mjs` (novo)
- Este relatório.

`deno.lock` e `public/assets/images/history/hist05.png` já estavam não rastreados antes desta tarefa e não foram modificados.
