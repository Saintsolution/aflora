# Admin simplificado — implementação local, 07/11/2026

## Entrega

Admin contém o botão “Atualizar catálogo agora” e as funcionalidades existentes do Caderno, publicações e moderação. Foram removidos da página os campos, estados, listagem, carregamento, inserção, edição, exclusão e upload de imagens de produtos. Isso não apaga produtos nem remove tabelas, políticas ou arquivos de Storage. Login e recuperação de senha continuam existentes.

Intermediário: `netlify/functions/catalog-sync.mjs`. Recebe POST vazio com Bearer da sessão; valida usuário em `/auth/v1/user` e exige resultado booleano true da RPC existente `is_admin`, usando o token desse usuário. Não usa metadados editáveis do usuário. Origem permitida fixa; não aceita URL, chave ou mode do navegador. Só depois da autorização utiliza `AFLORA_CATALOG_SYNC_SECRET`, exclusivamente no servidor, para chamar a Edge v10 com apikey e mode=import. Respostas sanitizadas, sem credenciais ou erros brutos nos logs.

O bloqueio local e intervalo mínimo de 60 segundos reduzem repetições na mesma instância; o lock existente da Edge/RPC é quem protege execuções concorrentes entre instâncias e cron. Timeout do intermediário informa resultado não confirmado, pois a Edge pode continuar trabalhando. Não há repetição automática do POST. O botão fica desabilitado durante a solicitação.

A leitura pública mantém cache de lote completo e fallback de até uma hora em falhas. TTL normal foi reduzido de cinco minutos para um minuto, para refletir atualizações manuais sem chave de purge do Netlify. Com o cache do navegador, orientar até dois minutos e recarregar a vitrine. Em falha temporária, o snapshot antigo pode continuar com aviso. Nenhuma visita ao site dispara importação.

## Arquivos desta etapa

- src/pages/Admin.tsx
- src/components/CatalogSyncPanel.tsx (novo)
- netlify/functions/catalog-sync.mjs (novo)
- netlify/functions/catalog.mjs (TTL)
- netlify/lib/local-catalog-plugin.mjs (novo; integração de desenvolvimento)
- vite.config.ts e scripts/catalog-preview.mjs (prévia local unificada, incluindo correção anterior)
- tests/catalog-admin.test.mjs (novo)
- Este relatório e seção 20 do handoff.

As mudanças visuais anteriores e vídeos continuam locais em seus arquivos; não foram publicados nesta etapa. Nenhum commit, push, deploy, alteração de cron/Vault/RPC/Edge/Nuvemshop ou importação real foi executado.

## Validação

62/62 testes do workspace aprovados, incluindo oito casos novos de acesso, autorização, método/origem/payload, configuração ausente, concorrência, cooldown, falhas, sanitização, cache e remoção de gerenciamento de produtos. Build aprovado; git diff --check aprovado. Typecheck da aplicação mantém somente os três erros antigos de Atelier.tsx e Objects.tsx. A configuração TypeScript separada de Node já não encontra os tipos Node no projeto; não foi alterado o conjunto de dependências para resolver essa dívida.

Comparação estrutural com HEAD confirmou preservação integral das funções loadPosts, loadComments, handleCommentApproval, handleCommentDelete, handleLogin, handlePasswordRecovery, resetPostForm, startEditingPost, handlePostSubmit e handlePostDelete.

Consulta à RPC existente sem sessão: HTTP 200, boolean false; prova disponibilidade e recusa anônima, sem alteração de dados. Os dois servidores locais recusam chamada manual sem sessão com HTTP 401. Nenhuma chamada real à Edge foi feita; os testes de sincronização desta etapa usam mocks.

## Pendências para ativação

1. Com o proprietário, cadastrar no Netlify uma variável **AFLORA_CATALOG_SYNC_SECRET**, usando a credencial secret existente da sincronização, apenas no contexto Production e escopo Functions. Não prefixar VITE_, não registrar valor no repositório, arquivo, mensagem ou log. Não criar/alterar segredo do Vault. Ainda não foi configurada por esta implementação.
2. Confirmar via login real que a proprietária satisfaz a RPC is_admin. Fazer isso sem modificar suas permissões automaticamente. Testar o painel logado e a preservação das ações editoriais, sem publicar/excluir conteúdo de teste real inadvertidamente.
3. Depois da aprovação do responsável para a publicação, selecionar os arquivos desta etapa e os visuais aprovados, excluindo trabalhos antigos não relacionados. Publicar via Git/Netlify conforme autorização específica.
4. O teste ponta a ponta do disparo real importa produtos: fazê-lo somente com autorização explícita para esse teste. Sem a variável, a resposta é “atualização manual ainda precisa ser habilitada”; não há fallback inseguro.
5. Rollback: restaurar o deploy completo anterior ou reverter somente os arquivos desta etapa. Nenhuma alteração de banco é necessária.

Documentação consultada: https://supabase.com/docs/reference/javascript/auth-getuser (verificação de usuário no Auth) e https://docs.netlify.com/build/functions/configuration/ (limite síncrono de 60 segundos; timeout local da chamada Edge em 45 segundos mais autorização em até oito segundos).
