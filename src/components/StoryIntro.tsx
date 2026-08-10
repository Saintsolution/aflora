import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { navigateTo } from '../utils/navigation';

export function StoryIntro() {
  return (
    <section
      className="story-cinematic section-light"
      id="natureza"
    >
      <div
        className="story-cinematic-bg"
        aria-hidden="true"
      />

      <div
        className="story-cinematic-overlay"
        aria-hidden="true"
      />

      <div className="story-cinematic-copy">
        <SectionKicker>
          A origem
        </SectionKicker>

        <h2>
          Toda Aflora começa na natureza.
        </h2>

        <p>
          Flores, folhas, cores e pequenos elementos naturais
          são escolhidos para ganhar uma nova existência.
          Na Aflora, aquilo que seria passageiro pode permanecer.
        </p>

        <button
          className="text-link"
          onClick={() => navigateTo('/historia')}
        >
          Conheça nossa história
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}