import { useRef, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

const messages: Record<string, string> = {
  authentication_required: 'Sua sessão expirou. Entre novamente para atualizar.',
  admin_required: 'Somente a administradora pode atualizar o catálogo.',
  forbidden_origin: 'Abra o Admin pelo endereço principal do site.',
  sync_not_configured: 'A atualização manual ainda precisa ser habilitada no servidor. O agendamento automático continua funcionando.',
  authorization_unavailable: 'Não foi possível verificar o acesso. Tente novamente em instantes.',
  sync_already_running: 'Já existe uma atualização em andamento. Aguarde antes de tentar novamente.',
  sync_cooldown: 'Aguarde um minuto antes de solicitar outra atualização.',
  sync_failed: 'A sincronização não foi concluída. O catálogo anterior foi preservado. Tente novamente mais tarde.',
  sync_result_unknown: 'Não foi possível confirmar o resultado. A atualização pode continuar no servidor; aguarde e confira a vitrine antes de tentar novamente.',
};

export function CatalogSyncPanel() {
  const busy = useRef(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  async function sync() {
    if (busy.current) return;
    busy.current = true; setRunning(true); setFailed(false);
    setMessage('Atualizando as peças da Nuvemshop. Aguarde a confirmação.');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) throw new Error('authentication_required');
      const response = await fetch('/.netlify/functions/catalog-sync', {
        method: 'POST', headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
        body: '{}', signal: AbortSignal.timeout(55000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'sync_result_unknown');
      const counts = [
        ['products_found', 'encontradas'], ['products_inserted', 'novas'], ['products_updated', 'atualizadas'],
      ].filter(([key]) => Number.isSafeInteger(result[key])).map(([key, label]) => `${result[key]} ${label}`).join(', ');
      setMessage(`Catálogo atualizado às ${new Date().toLocaleTimeString('pt-BR')}.${counts ? ` Peças: ${counts}.` : ''} A vitrine pode levar até dois minutos para mostrar as mudanças; recarregue a página para conferir.`);
    } catch (error) {
      setFailed(true);
      setMessage(messages[error instanceof Error ? error.message : ''] || messages.sync_result_unknown);
    } finally {
      busy.current = false; setRunning(false);
    }
  }

  return (
    <section aria-labelledby="catalog-sync-title" style={{ padding: 28, background: '#f8f4ec', border: '1px solid rgba(38,50,31,.14)' }}>
      <h2 id="catalog-sync-title" style={{ fontSize: 32, marginBottom: 12 }}>Catálogo da Nuvemshop</h2>
      <p style={{ lineHeight: 1.6, marginBottom: 20 }}>Cadastre e altere as peças na Nuvemshop. Depois, use este botão se quiser atualizar o site antes do próximo horário automático: 06h, 14h ou 22h (Brasília).</p>
      <button type="button" onClick={sync} disabled={running} aria-busy={running}
        style={{ padding: '14px 22px', border: 0, background: '#26321f', color: '#fffdf8', cursor: running ? 'wait' : 'pointer' }}>
        {running ? 'Atualizando catálogo…' : 'Atualizar catálogo agora'}
      </button>
      {message && <p role={failed ? 'alert' : 'status'} style={{ lineHeight: 1.6, marginTop: 16 }}>{message}</p>}
    </section>
  );
}
