import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

export function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    ['História', '/historia'],
    ['Atelier', '#atelier'],
    ['Coleções', '/colecoes'],
    ['Contato', '#contato'],
  ];

  function handleNavigate(target: string) {
    setOpen(false);
    navigateTo(target);
  }

  return (
    <header className="site-header">
      <button
        className="wordmark"
        onClick={() => handleNavigate('/')}
        aria-label="Voltar para início"
      >
        AFLORA<span>•</span>
      </button>

      <nav
        className={open ? 'nav-open' : ''}
        aria-label="Navegação principal"
      >
        {nav.map(([label, target]) => (
          <button
            key={label}
            onClick={() => handleNavigate(target)}
          >
            {label}
          </button>
        ))}

        <a
          className="nav-store"
          href="#loja"
          onClick={() => setOpen(false)}
        >
          Loja
          <ArrowRight size={14} />
        </a>
      </nav>

      <button
        className="menu-toggle"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}