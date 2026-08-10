import { SectionKicker } from './SectionKicker';

export function UniquePiece() {
  return (
    <section className="unique section-light">
      <div className="unique-image">
        <img
          src="/assets/images/joias/joias01.jpeg"
          alt="Joias botânicas Aflora com flores, folhas e elementos naturais preservados em resina"
        />
      </div>

      <div className="unique-copy">
        <SectionKicker>
          Exclusividade
        </SectionKicker>

        <h2>
          Não existem
          <br />
          <em>duas Afloras iguais.</em>
        </h2>

        <p>
          Cada flor é diferente. Cada composição é feita à mão.
          A posição dos elementos, a transparência e as pequenas
          características naturais fazem com que cada criação
          seja única.
        </p>

        <blockquote>
          “Quando uma peça Aflora encontra sua pessoa, aquela
          combinação existe somente para ela.”
        </blockquote>
      </div>
    </section>
  );
}