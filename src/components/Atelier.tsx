import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { PlaceholderVisual } from './PlaceholderVisual';
import { navigateTo } from '../utils/navigation';
import { imageUrls } from '../data/content';

export function Atelier() {
  return (
    <section
      className="atelier section-light"
      id="atelier"
    >
      <div className="atelier-header">
        <div>
          <SectionKicker>
            04 · O atelier
          </SectionKicker>

          <h2>
            É aqui que uma Aflora ganha forma.
          </h2>
        </div>

        <p>
          Um lugar de concentração, matéria e imperfeições bonitas.
          Onde cada detalhe encontra seu tempo.
        </p>
      </div>

      <div className="atelier-grid">
        <PlaceholderVisual
          image={imageUrls.calendula}
          label="Bancada · fotografia em breve"
          className="atelier-large"
        />

        <PlaceholderVisual
          label="Mãos trabalhando · vídeo em breve"
          className="atelier-small"
        />

        <PlaceholderVisual
          image={imageUrls.buttercups}
          label="Detalhes do processo · placeholder"
          className="atelier-small"
        />
      </div>

      <button
        className="text-link"
        onClick={() => navigateTo('/historia')}
      >
        Conheça a Aflora por dentro
        <ArrowRight size={15} />
      </button>
    </section>
  );
}