import { useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../integrations/supabase/client';
import { completeRecovery, invalidateRecovery, recoverySnapshot, subscribeRecovery } from '../lib/passwordRecovery';

export function ResetPassword() {
  const status = useSyncExternalStore(subscribeRecovery, recoverySnapshot);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || status !== 'ready') return;
    setError('');
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('Use uma senha com pelo menos 8 caracteres.');
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        if (updateError.status === 401 || updateError.status === 403
          || ['session_not_found', 'refresh_token_not_found', 'refresh_token_already_used', 'bad_jwt'].includes(updateError.code ?? '')) {
          invalidateRecovery();
        } else {
          setError(updateError.code === 'same_password'
            ? 'Escolha uma senha diferente da anterior.'
            : updateError.code === 'weak_password'
              ? 'A senha não atende aos requisitos de segurança. Escolha uma senha mais forte.'
              : 'Não foi possível atualizar a senha. Verifique sua conexão e tente novamente.');
        }
        return;
      }
      setPassword('');
      setConfirmation('');
      completeRecovery();
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signOutError) {
        setError('Senha atualizada. Não foi possível encerrar a sessão. Clique em ir para o login para tentar novamente.');
        return;
      }
      window.location.replace('/admin?senha=atualizada');
    } catch {
      setError('Não foi possível concluir a operação. Verifique sua conexão e tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      window.location.replace('/admin?senha=atualizada');
    } catch {
      setError('Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fffdf8] text-[#26321f] px-6 py-16">
      <section className="w-full max-w-md" aria-labelledby="reset-title">
        <p className="text-xs tracking-widest uppercase mb-4">Ateliê Aflora · Área reservada</p>
        <h1 id="reset-title" className="text-4xl font-serif mb-6">Redefinir senha</h1>
        {status === 'checking' && <p role="status">Verificando o link de recuperação…</p>}
        {(status === 'invalid' || status === 'idle') && (
          <div role="alert">
            <p>O link de recuperação é inválido, expirou ou a sessão não pôde ser validada. Solicite um novo e-mail de recuperação no Supabase e abra o link mais recente.</p>
            <a className="underline inline-block mt-6" href="/admin">Voltar ao login administrativo</a>
          </div>
        )}
        {status === 'ready' && (
          <form onSubmit={submit} className="space-y-5">
            <p>Cadastre uma nova senha com pelo menos 8 caracteres.</p>
            <label className="block">Nova senha
              <input className="block w-full border border-[#66705f] p-3 mt-2 bg-white" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
            </label>
            <label className="block">Confirme a nova senha
              <input className="block w-full border border-[#66705f] p-3 mt-2 bg-white" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} />
            </label>
            <button className="w-full p-3 bg-[#26321f] text-white disabled:opacity-50" disabled={busy}>{busy ? 'Salvando…' : 'Salvar nova senha'}</button>
          </form>
        )}
        {status === 'complete' && <button className="underline" disabled={busy} onClick={() => void finish()}>{busy ? 'Encerrando sessão…' : 'Senha atualizada. Ir para o login'}</button>}
        {error && <p role="alert" className="mt-5 text-red-800">{error}</p>}
      </section>
    </main>
  );
}
