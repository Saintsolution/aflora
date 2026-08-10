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

        <a href="mailto:oi@aflora.com.br">
          Contato
        </a>

        <a href="#">
          WhatsApp
        </a>

        <a href="#">
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

        <a href="#loja">
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