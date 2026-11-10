import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';

export function Contato() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nome = String(data.get('nome') || '').trim();
    const telefone = String(data.get('telefone') || '').trim();
    const assunto = String(data.get('assunto') || '').trim();
    if (nome.length < 2 || telefone.replace(/\D/g, '').length < 8 || assunto.length < 5) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contato-aflora',
          'bot-field': String(data.get('bot-field') || ''),
          nome,
          telefone,
          assunto,
        }).toString(),
      });
      if (!response.ok) throw new Error('Não foi possível enviar');
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="inner-page">
      <Header />
      <main>
        <section className="contact-page section-light" aria-labelledby="contact-title">
          <div className="contact-intro">
            <SectionKicker>Contato · Ateliê Aflora</SectionKicker>
            <h1 id="contact-title">Vamos conversar?</h1>
            <p>Deixe seu nome, telefone e sua mensagem. Será um prazer ouvir você.</p>
          </div>
          <form
            className="contact-form"
            name="contato-aflora"
            method="POST"
            action="/__forms.html"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            aria-busy={status === 'sending'}
          >
            <input type="hidden" name="form-name" value="contato-aflora" />
            <div hidden aria-hidden="true">
              <label>Não preencha este campo<input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <label htmlFor="contact-name">Nome</label>
            <input id="contact-name" name="nome" autoComplete="name" required minLength={2} maxLength={120} />
            <label htmlFor="contact-phone">Telefone</label>
            <input id="contact-phone" name="telefone" type="tel" autoComplete="tel" required minLength={8} maxLength={30} placeholder="(DDD) seu número" />
            <label htmlFor="contact-subject">Assunto / mensagem</label>
            <textarea id="contact-subject" name="assunto" required minLength={5} maxLength={5000} rows={6} />
            <p className="contact-privacy">Usaremos seus dados para responder ao seu contato.</p>
            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
            </button>
            <div aria-live="polite" aria-atomic="true">
              {status === 'success' && <p role="status">Mensagem recebida! Obrigada pelo contato. Retornaremos pelo telefone informado.</p>}
              {status === 'error' && (
                <p role="alert">Não foi possível enviar. Confira os campos e tente novamente. Se preferir, escreva para <a href="mailto:aflorapreservada@gmail.com">aflorapreservada@gmail.com</a>.</p>
              )}
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
