import { useState } from 'react';
import {
  Music2,
  X,
} from 'lucide-react';

import { MusicPlayer } from './MusicPlayer';

export function PlaylistWelcome() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);

  function startJourney() {
    setOpen(false);
    setStarted(true);
  }

  return (
    <>
      {!started && (
        <button
          className="playlist-trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          <Music2 size={15} />
          Playlist Aflora
        </button>
      )}

      {open && !started && (
        <section
          className="playlist-welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Boas-vindas à playlist Aflora"
        >
          <button
            className="playlist-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar mensagem"
          >
            <X size={16} />
          </button>

          <span className="playlist-kicker">
            Ateliê Aflora
          </span>

          <h2>
            Sua experiência começa aqui.
          </h2>

          <p>
            Sua experiência entre flores, cores e sensações,
            começa aqui, na Aflora.
          </p>

          <p>
            Criamos uma playlist delicada, totalmente dedicada
            a você. Enquanto caminha por nosso jardim, fique
            à vontade para colher aquelas que mais gostar.
          </p>

          <p>
            Mas, no fim de tudo, o mais importante é que esteja
            aqui conosco, conhecendo um pouquinho do que nossos
            corações foram capazes de criar.
          </p>

          <p className="playlist-signature">
            Aproveite sua viagem!!
            <br />
            Obrigada pela presença.
            <br />
            <br />
            Com carinho,
            <br />
            Aflora
          </p>

          <button
            className="playlist-start"
            type="button"
            onClick={startJourney}
          >
            Começar minha viagem
          </button>
        </section>
      )}

      {started && <MusicPlayer autoPlay />}
    </>
  );
}