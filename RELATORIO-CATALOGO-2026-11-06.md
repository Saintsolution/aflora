# Diagnóstico e correção local — 06/11/2026

## Resultado

Correção implementada somente no ambiente local. Handler corrigido consultando a Nuvemshop real: HTTP 200, 56 produtos, 10.077 ms. Sem commit, push, deploy ou alterações na Nuvemshop, Supabase ou configuração do Netlify.

## Evidências e causa

Às 12:56 de Brasília, o endpoint público `https://aflorapreservada.com.br/.netlify/functions/catalog` respondeu HTTP 503, `Content-Type: application/json`, `Cache-Control: no-store`, corpo `{"error":"Catálogo temporariamente indisponível"}`. Cabeçalhos: `server: Netlify`, Edge `fwd-status=503`, request ID `01M6RS5R9YAASKEFQ9QRWNTJ2F`. O corpo corresponde exatamente ao retorno de erro tratado do handler; não é uma página genérica de erro da infraestrutura.

O código original local, lendo a origem real, falhou em 10.151 ms com `Produto incompleto`, caminho `/produtos/colar-astromelia-petala-laranja-col00051ar-1icb4/`.

A página pública desse produto tem nome, imagens, preço 75, canonical e JSON-LD Product, mas não tem bloco `.js-product-description`. O JSON-LD contém a descrição pública: “Compre online Colar Astromélia pétala laranja (COL00051AR) por R$75,00. Faça seu pedido e pague-o online.” A validação anterior exigia descrição extraída exclusivamente do HTML, rejeitando o produto e todo o catálogo.

Uma segunda incompatibilidade foi comprovada: os links atuais da listagem contêm `?entry_path=category`. Antes, eram considerados diferentes dos links do sitemap e do canonical sem query. Reproduzido com o parser original e uma descrição HTML inserida exclusivamente em memória para isolar a comparação: continuou falhando em `Produto incompleto` para a URL com query.

Sitemap e primeira listagem responderam HTTP 200. A execução corrigida percorreu descoberta e detalhes com sucesso. Não houve evidência de bloqueio, timeout ou indisponibilidade geral da loja nessas consultas; isso não exclui eventos intermitentes ou diferenças na rede do Netlify.

Não foram acessados logs de produção ou o artefato implantado. A causa está comprovada no código local contra as páginas públicas atuais; a exceção exata da execução de produção precisa ser confirmada no log `catalog_refresh_failed`, correlacionado ao request ID e horário acima. Não há ferramenta Netlify disponível nesta sessão para essa leitura.

## Histórico, configuração e cache

HEAD local: `5459f73`. Nenhuma diferença em `netlify/functions`, `src/lib/catalog` ou testes entre o commit de referência `8374bad3de185435c67eb7d9af9885fe16665dd8` e o HEAD. Não foi verificado o HEAD remoto ou qual commit está implantado.

A função usa páginas públicas do endereço fixo `https://lojadoaafloraatelier.lojavirtualnuvem.com.br` e não exige variável de ambiente nem token Nuvemshop. Não foi necessário ler segredos de `.env`. `netlify.toml` usa Node 22 e esbuild; execução local em Node 22.18.0. Não foram inspecionadas variáveis privadas de produção.

Cache normal de cinco minutos em memória por instância; CDN recebe o tempo restante e navegador recebe 60 segundos. Ao expirar, a atualização é aguardada e compartilhada por chamadas simultâneas. Falhas impõem intervalo de 30 segundos. Snapshot anterior pode ser servido até uma hora desde a leitura bem-sucedida, com `stale: true`, aviso existente e `no-store`. Instâncias frias não têm esse fallback; sem cache válido, a falha resulta em 503. O cache não cria a incompatibilidade, mas deixa de escondê-la quando expira ou quando uma instância é iniciada. Nenhuma dessas durações foi alterada.

## Correção

- Normalizar query e fragmento dos endereços da loja antes da deduplicação e comparação com canonical, preservando origem e caminho e rejeitando URLs externas e credenciais embutidas. A paginação continua construída separadamente com `?page=N`.
- Preservar descrição HTML quando disponível; usar a descrição real do JSON-LD Product quando o bloco estiver ausente/vazio. Nenhuma descrição foi inventada. Ausência em ambas as fontes continua sendo erro.
- Ignorar e registrar 404/410 de produto individual mesmo se ainda listado. Se todas as URLs descobertas falharem assim, retornar erro em vez de sucesso vazio. Sitemap/listagem validamente vazios continuam permitidos.
- Manter falha explícita para 429/5xx, timeout, erros de rede, HTML/JSON-LD inesperado, preço/imagens/canonical inválidos, limites excedidos e paginação repetida. Esses erros usam o snapshot válido quando disponível; não são transformados em catálogo parcial ou vazio de sucesso.
- Incluir o novo erro de todos os produtos removidos na classificação dos logs.

Arquitetura, integração, layout e frontend não foram alterados. Os campos originais são preservados; descrições estruturadas podem ser textos comerciais gerados pela própria loja quando não há descrição editorial.

## Arquivos modificados

- `netlify/functions/catalog.mjs`
- `tests/catalog.test.mjs`
- Este relatório.

Os arquivos preexistentes não rastreados `deno.lock` e `public/assets/images/history/hist05.png` foram preservados. Não houve conflito com alterações locais.

## Testes e verificações

- 22 testes automatizados aprovados: catálogo normal, extração dos campos, coleções, descoberta/paginação/deduplicação e concorrência até 200 produtos simulados, cache/expiração/recuperação/cooldown, 404/410 de sitemap e listagem, todos removidos, 429/503, timeout, respostas inválidas/incompletas, parâmetros de navegação, fallback de descrição e preservação dos dados no leitor público.
- Handler real corrigido: HTTP 200, 56 produtos, 10.077 ms. Snapshot temporário em `/tmp`, sem adicionar dados de catálogo ao projeto.
- Leitor TypeScript real do frontend compilado com esbuild e executado sobre esse snapshot: 56 produtos aceitos; nomes, preços, descrições, imagens principais e links comparados com os dados do handler e preservados.
- Build aprovado antes e depois da correção. Aviso preexistente de Browserslist desatualizado.
- `git diff --check` aprovado.
- Typecheck global: três erros preexistentes em `Atelier.tsx` (`calendula`, `buttercups`) e `Objects.tsx` (`wildflowerDetail`).
- Lint global: oito erros preexistentes (seis regras ausentes em código gerado `.netlify/functions-serve`, import não utilizado em `FinalCTA.tsx`, `prefer-const` em `MusicPlayer.tsx`) e cinco avisos. Já falhavam antes das edições.
- Conferência visual em navegador não realizada: serviço de acesso ao navegador indisponível. Servidor temporário local foi encerrado. Não se afirma que carregamento visual das imagens ou interação das coleções foi conferido nesta sessão.

## Pendências e publicação

Correção local funcional e pronta para revisão; publicação ainda não autorizada. Recomenda-se concluir a conferência visual antes da publicação e correlacionar os logs do Netlify para confirmar o erro da execução de produção. Não há mudança externa comprovadamente necessária neste diagnóstico.

Permanecem a dependência do HTML público, limites atuais de oito segundos por download e 24 segundos totais, cache efêmero por instância e diferenças possíveis na rede/infraestrutura de produção. Uma falha de validação ou HTTP temporário ainda exige fallback válido para manter o catálogo disponível; não se elimina esse risco ampliando o escopo sem evidência.

Duas peças continuam com categoria pública apenas `Produtos`: `colar-folha-seca-col00011-t-1aeww` e `colar-margarida-oval-col00014-ar-nvb0d`. Seus dados permanecem no catálogo sem coleção inventada. Nenhuma alteração na loja foi feita.

## Preparação da publicação autorizada — 06/11/2026

Usuário autorizou commit e push para `origin/main`, com deploy automático existente. Na nova conferência, branch local `main` e referência remota `refs/heads/main` apontavam para `5459f73c6a35e0b0b38f5aa1142e00d843594cac`, sem divergência. Novamente: 22 testes aprovados, build aprovado e `git diff --check` aprovado. Somente função, testes e este relatório foram selecionados para commit.

A sessão Netlify disponível não lista o site Aflora. As consultas do GitHub ao HEAD não retornaram deployments, check-runs ou statuses do Netlify. Assim, não foi possível verificar independentemente a branch de produção configurada. O push fica pendente dessa confirmação, conforme condição explícita da autorização. Não foi iniciada migração para Supabase.
