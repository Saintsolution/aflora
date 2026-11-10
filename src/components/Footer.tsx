import { Instagram } from 'lucide-react';
import { navigateTo, scrollToId } from '../utils/navigation';

export function Footer() {
  return (
    <footer
      className="footer"
      id="contato"
    >
      <div className="footer-brand">
        <button
          className="wordmark"
          onClick={() => navigateTo('/')}
          aria-label="Voltar para o início"
        >
          AFLORA<span>•</span>
        </button>

        <p>
          Natureza preservada.
          <br />
          Beleza que permanece.
        </p>
      </div>

      <div>
        <span className="footer-label">
          Explorar
        </span>

        <button onClick={() => navigateTo('/historia')}>
          História
        </button>

        <button onClick={() => navigateTo('/colecoes')}>
          Coleções
        </button>

        <button onClick={() => scrollToId('atelier')}>
          Atelier
        </button>
      </div>

      <div>
        <span className="footer-label">
          Conversar
        </span>

        <a href="/contato" onClick={(event) => { event.preventDefault(); navigateTo('/contato'); }}>
          Contato
        </a>

        <a href="https://wa.me/5521990826026" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>

        <a
          href="https://www.instagram.com/aflorapreservada/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram size={14} />
          Instagram
        </a>
      </div>

      <div>
        <span className="footer-label">
          Aflora
        </span>

        <a href="#">
          Política de privacidade
        </a>

        <a href="#">
          Termos
        </a>

        <a href="https://lojadoaafloraatelier.lojavirtualnuvem.com.br/" target="_blank" rel="noopener noreferrer">
          Loja online
        </a>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Aflora · Feito com tempo,
        cuidado e natureza.
      </div>
    </footer>
  );
}
