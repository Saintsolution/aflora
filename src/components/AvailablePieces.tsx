import { useMemo } from 'react';
import { SectionKicker } from './SectionKicker';
import { pecasDisponiveis } from '../data/content';

export function AvailablePieces() {
  const pieces = useMemo(
    () => pecasDisponiveis.filter((piece) => piece.ativa),
    []
  );

  const loop = [...pieces, ...pieces];

  return (
    <section
      className="pieces-strip"
      id="pecas"
    >
      <div className="pieces-label">
        <SectionKicker>
          Peças vivendo agora
        </SectionKicker>

        <p>
          Pequenas presenças, disponíveis por um tempo.
        </p>
      </div>

      <div className="marquee">
        {loop.map((piece, index) => (
          <a
            className="piece-item"
            href={piece.url}
            key={`${piece.id}-${index}`}
          >
            <img
              src={piece.imagem}
              alt={`Placeholder da peça ${piece.nome}`}
            />

            <span>
              <strong>{piece.nome}</strong>
              <small>{piece.colecao}</small>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}