import { useState } from 'react';
import {
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

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
        type="button"
        onClick={() => handleNavigate('/')}
        aria-label="Voltar para o início"
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
            type="button"
            onClick={() => handleNavigate(target)}
          >
            {label}
          </button>
        ))}

        <button
          className="nav-store"
          type="button"
          onClick={() => handleNavigate('#loja')}
        >
          Loja
          <ArrowRight size={14} />
        </button>
      </nav>

      <button
        className="menu-toggle"
        type="button"
        aria-label={
          open
            ? 'Fechar menu'
            : 'Abrir menu'
        }
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}