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
          A natureza nunca cria duas folhas exatamente iguais.
          <br />
          Nem duas flores.
          <br />
          Nem duas pedras.
          <br />
          Nem dois momentos.
          <br />
          Escolha a peça que irá preservar o seu.
        </p>

        <blockquote>
          “Quando uma peça Aflora encontra sua pessoa, aquela
          combinação existe somente para ela.”
        </blockquote>
      </div>
    </section>
  );
}