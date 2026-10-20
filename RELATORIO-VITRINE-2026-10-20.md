# Vitrine pública Aflora + Nuvemshop — ajustes finais

Estado local em 20/10/2026. Sem deploy, migrações ou gravações no Supabase.
Este relatório substitui as instruções anteriores de fallback: a vitrine pública agora é exclusivamente Nuvemshop.

## Origem exclusiva

React → `/.netlify/functions/catalog` → união do sitemap com a listagem pública paginada → páginas públicas Nuvemshop.

`src/lib/catalog/index.ts` não importa mais `fetchProducts()` em execução. A referência a `Product` é somente de tipo e desaparece na compilação. A Function é o único endpoint do leitor público. Em falha de rede, HTTP 503 ou produto inválido, a Promise rejeita e os componentes apresentam indisponibilidade temporária. Não há retorno ao catálogo Supabase nem cache de erro convertido em produtos antigos. Catálogo vazio válido continua sendo lista vazia, sem mensagem de falha.

O cache bem-sucedido do React dura 60 segundos. Pode apresentar a última resposta Nuvemshop dentro desse prazo; depois dele, falha em nova consulta mostra indisponibilidade. Tela aberta não faz polling. `Admin.tsx` e `src/lib/products.ts`/`fetchProducts()` permanecem intactos. Nenhuma tabela, RLS, bucket, autenticação, rota administrativa, blog ou Estúdio IA foi alterado.

## Extração e apresentação

`netlify/functions/catalog.mjs` usa Cheerio para obter nome, preço, todas as fotos da galeria, descrição completa do corpo da página, categoria pública e URL canônica. Imagens são servidas diretamente pelo CDN Nuvemshop, sem upload ao Storage. Identidade, disponibilidade e coleção são metadados. Produtos esgotados continuam visíveis; catálogo bem-sucedido substitui a lista anterior por completo. A descoberta combina o sitemap com `/produtos/` e páginas `?page=N`, sem duplicar URLs. Produtos novos podem entrar pela listagem antes da atualização diária do sitemap. URLs antigas ainda presentes no sitemap continuam sendo consultadas; remoção/despublicação pode depender de sua atualização ou causar falha se a página deixar de existir.

As categorias públicas reconhecidas são Água, Ar, Terra, Fogo, Fé e Casa. Categorias desconhecidas ou ambíguas são registradas em `unknownCategories` e no console, sem atribuição arbitrária; não entram nas seis coleções. Cards mantêm a foto principal; todas as fotos permanecem no array `images`, sem galeria visual nova.

Carrossel: links internos para a coleção correspondente, imagens progressivas e repetição exclusivamente visual. Coleções: links canônicos com `target="_blank"` e `rel="noopener noreferrer"`. Layout e CSS preservados.

## Correção do carrossel

A lógica anterior usava `scrollWidth / 2`, sem considerar a janela visível e a emenda entre sequências. Com poucas peças, o limite físico da rolagem podia ser atingido antes do ponto de reinício. A condição já existia e ficou exposta pelo catálogo reduzido; não era uma limitação da Nuvemshop.

O componente agora repete visualmente as sequências conforme a largura da janela, acompanhada por `ResizeObserver`. Mede a distância real entre as metades, incluindo gaps e larguras fracionárias, e normaliza a posição antes da atribuição. Mantém 1 px a cada 20 ms. O arraste atravessa a emenda, pausa o avanço enquanto ativo e mantém o bloqueio de clique após movimentação.

A matriz anterior com o componente real e dados simulados testou 1, 2, 3 e 200 produtos em 1620 px e 390 px: oito cenários com 50–51 px/s e emenda sem travamento. Dois produtos renderizaram 16 cards no desktop e 8 no móvel, sem duplicação dos dados. Arraste móvel retomou 25 px em 500 ms. Harness temporário removido.

## Cache e revisão de escalabilidade

A Function atual mantém cache de cinco minutos em memória por instância e headers de CDN Netlify com prazo restante; navegador usa 60 segundos. Atualizações simultâneas na mesma instância compartilham uma Promise. Falhas retornam HTTP 503 sem lote parcial e suspendem novas tentativas por 30 segundos na mesma instância. Instâncias frias distintas não compartilham memória. Cache CDN não é reproduzido integralmente pelo Netlify Dev.

São cinco páginas concorrentes, oito segundos por página e 24 segundos globais, até 200 produtos. Isso NÃO garante capacidade real de 200 páginas dentro do prazo. Estimativa sem considerar sitemap, download e parsing:

| Produtos | Rodadas de cinco | Se cada rodada levar 1 s |
| --- | --- | --- |
| 10 | 2 | 2 s |
| 50 | 10 | 10 s |
| 100 | 20 | 20 s |
| 200 | 40 | 40 s |

Para 200 páginas, cada rodada teria de levar menos de 600 ms, ainda reservando tempo para sitemap e processamento. O teste real de dois produtos levou 1.381 ms; não permite extrapolar uma garantia para 200. O teste simulado de 2, 10, 50 e 200 confirma apenas contagem, ausência de duplicatas e concorrência máxima de cinco.

### Estratégia proposta, ainda não implementada

Separar atualização do catálogo da requisição do visitante:

1. Uma tarefa agendada inicia uma atualização em background, com concorrência controlada, orçamento de tentativas e limites da origem.
2. Um cache compartilhado de snapshots JSON na própria Netlify (por exemplo, Blobs) mantém o último catálogo Nuvemshop validado e sua data de obtenção. Não seria cadastro editorial nem banco de produtos Supabase; nenhuma imagem seria copiada.
3. O atualizador consulta o sitemap e páginas em lotes. `lastmod` pode ser pista para priorização, mas não garantia de invalidação: fazer também atualização periódica completa. Remover URLs ausentes na publicação de uma nova versão completa.
4. Publicar uma versão completa e trocar a referência ativa apenas depois de validá-la; não sobrescrever a versão ativa com resultado parcial ou falha.
5. A Function do visitante apenas lê esse snapshot e responde via CDN. Não consulta páginas de produtos. Sem snapshot válido dentro de um limite de idade definido, responde indisponibilidade. Atualização por agendamento também evita endpoint público de refresh dispendioso.

Essa separação evita que um visitante espere a leitura de 200 páginas. Requer definir frequência, idade máxima aceitável, coordenação entre atualizações e orçamento do plano Netlify antes de implementação. Não foi adicionado armazenamento novo nesta etapa.

Referências oficiais consultadas: [Background Functions](https://docs.netlify.com/build/functions/background-functions/) (tarefas separadas da resposta ao visitante, até 15 minutos) e [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). Não houve verificação do plano/consumo desta conta Netlify; disponibilidade e custos precisam ser confirmados na configuração da futura hospedagem.

## Validação final

- Leitura real novamente pela `readCatalog()`: Triângulo Capim e Pedras do Mar Azul; ambos R$ 87,00, categoria ÁGUA, descrição completa, URL canônica e duas fotos reais por produto. Tempo observado: 1.381 ms.
- Home local no Chrome: dois nomes únicos, links somente `/colecoes?colecao=agua` e avanço de 50 px em um segundo.
- Clique interno abriu Água e mostrou as duas peças. Cards verificados com URLs Nuvemshop, `_blank` e `noopener noreferrer`. Clique efetivo no Pedras do Mar abriu uma nova aba da loja; a aba Aflora permaneceu em Água.
- Playlist apresentava `Pausar música` antes e depois da navegação e continuou no mesmo estado no móvel. Isso comprova o estado de reprodução do player/SDK; não houve captura ou análise acústica do som.
- Móvel de 390 x 844: home avançou 50 px em um segundo; largura da página 390 px. Na coleção Água, dois cards de aproximadamente 169,8 px permaneceram dentro da tela. Viewport restaurado após o teste.
- Falha HTTP 503 injetada localmente com componentes reais: home mostrou indisponibilidade temporária; Coleções mostrou o alerta de falha. Nos dois testes, a lista de fetch registrou SOMENTE `/.netlify/functions/catalog`, sem acesso a produtos Supabase. Harness temporário removido.
- 11 testes automatizados aprovados, incluindo extração, esgotados, categoria desconhecida, sitemap/URL inválidos, vazio válido, falha parcial, concorrência/cache/expiração, crescimento simulado, rejeição de erros no frontend, nova tentativa e proibição de dependência executável Supabase/produtos no leitor público.
- Build aprovado. ESLint dos três arquivos TypeScript públicos envolvidos aprovado. `git diff --check` aprovado.
- Typecheck global continua com os três erros preexistentes: `calendula` e `buttercups` em `Atelier.tsx`, `wildflowerDetail` em `Objects.tsx`. Não alterados nesta tarefa.
- Sem operações reais de cadastro, edição, remoção, despublicação ou estoque na loja. Sem teste de 200 páginas reais. Sem login/gravação no admin.

## Arquivos da implementação

- `netlify/functions/catalog.mjs`: leitor e cache atuais; sem alteração nesta revisão final.
- `src/lib/catalog/index.ts`: leitor público exclusivo, sem fallback.
- `src/components/AvailablePieces.tsx`: consumidor público, movimento corrigido e mensagem de indisponibilidade explícita.
- `src/pages/Colecoes.tsx`: consumidor público, estado de erro e links externos já existentes; sem mudança adicional nesta revisão.
- `tests/catalog.test.mjs`, `tests/public-catalog.test.mjs`: testes atualizados.
- `netlify.toml`: build, diretório de functions e Node 22.
- `package.json`/lock: Cheerio e comando de teste já incluídos anteriormente.
- `.gitignore`: `.netlify` ignorado. `dist/` regenerado e já ignorado.
- Este relatório atualizado para remover a orientação obsoleta de fallback.

## Configuração e limitações

Node 22. Instalar com `npm ci`. Executar `netlify dev --offline --port 8888` e abrir `http://localhost:8888`. `npm run dev` sozinho não serve a Function e agora exibirá indisponibilidade em vez de consultar Supabase.

Testes: `npm run test:catalog`. Build: `npm run build`.

Nenhuma variável nova ou credencial Nuvemshop é necessária. Preservar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para admin/blog existentes; não são alternativa da vitrine. Não colocar tokens privados em `VITE_*`.

A leitura continua dependente do HTML público e da atualização do sitemap. Mudanças de tema ou bloqueios podem causar indisponibilidade. Não há contorno de bloqueios, garantia de atualização instantânea ou implantação do cache compartilhado proposto. O cache de instância/CDN atual reduz consultas, mas uma requisição sem cache ainda pode iniciar a leitura completa. Não considerar a escala de 200 páginas reais resolvida antes da evolução proposta.

A instalação anterior apontou 32 vulnerabilidades no conjunto de dependências. Não houve atualização ampla nem `npm audit fix` fora do escopo. Nenhum deploy realizado.

## Atualização: descoberta pela listagem pública

Implementada após constatar cinco produtos na listagem pública e apenas dois no sitemap. A Function combina ambas as fontes, percorre `?page=N` até uma página sem produtos e deduplica as URLs antes de baixar os detalhes. Listagem sem `main`, paginação inteiramente repetida, mais de 200 produtos ou mais de 201 páginas resultam em falha explícita. Permanecem os limites globais de tempo, cache e concorrência de cinco downloads de detalhes; não há garantia de leitura de 200 páginas reais.

Validação real da implementação local: cinco produtos, todos em Água, sem categorias desconhecidas: Pedras do Mar V, Pedras do Mar Azul, Folha Esqueletizada V, Flores na Praia e Triângulo Capim V. Os três novos eram ausentes do sitemap; a categoria pública dos cinco já estava corrigida na Nuvemshop. Treze testes aprovados, incluindo união de fontes, paginação com sobreposição, deduplicação e rejeição de listagem inválida/paginação repetida. Nenhuma alteração na Nuvemshop e nenhum deploy. O cache de cinco minutos permanece; uma página já aberta não faz polling. Esta seção atualiza a descoberta e a contagem dos registros anteriores deste relatório.
