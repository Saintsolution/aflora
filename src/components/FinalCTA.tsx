import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { navigateTo } from '../utils/navigation';

const LOGO = '/assets/images/logo/afl03.jpg';

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
        <SectionKicker>
          Um encontro
        </SectionKicker>

        <h2>
          Talvez a sua Aflora
          <br />
          <em>já esteja esperando por você.</em>
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
            className="text-link light"
          >
            Visite a loja
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}