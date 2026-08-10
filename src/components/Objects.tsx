import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { PlaceholderVisual } from './PlaceholderVisual';
import { navigateTo } from '../utils/navigation';
import { imageUrls } from '../data/content';

export function Objects() {
  return (
    <section className="objects section-light">
      <div className="objects-image">
        <PlaceholderVisual
          image={imageUrls.wildflowerDetail}
          label="Objetos botânicos · fotografia em breve"
        />
      </div>

      <div className="objects-copy">
        <SectionKicker>
          06 · Além das joias
        </SectionKicker>

        <h2>
          A natureza também pode habitar os espaços.
        </h2>

        <p>
          Bandejas, peças decorativas e objetos de mesa carregam
          a mesma delicadeza de uma joia: feitos um a um,
          para permanecer perto.
        </p>

        <button
          className="text-link"
          onClick={() => navigateTo('/colecoes')}
        >
          Ver objetos autorais
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}