import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { navigateTo } from '../utils/navigation';

const LOGO = '/assets/images/joias/joias05.png';

export function FinalCTA() {
  return (
    <section
      className="final-cta section-moss"
      id="loja"
    >
      <div className="final-object">
        <div className="hero-orbit">
          <img
            src={LOGO}
            alt="Placeholder de peça hero Aflora"
          />
        </div>

        <span>
          Peça hero · mídia em breve
        </span>
      </div>

      <div>

        <h2>
          A sua Aflora
          <br />
          <em>está esperando por você.</em>
        </h2>

        <p>
          Descubra peças criadas uma a uma e encontre
          aquela que conversa com a sua história.
        </p>

        <div className="final-actions">
          <button
            className="button-light"
            onClick={() => navigateTo('/colecoes')}
          >
            Conheça as coleções
            <ArrowRight size={15} />
          </button>

          <a
  href="#"
  className="text-link"
  style={{ color: '#d2b8a6' }}
>
  Visite a loja
  <ArrowRight size={15} />
</a>
        </div>
      </div>
    </section>
  );
}