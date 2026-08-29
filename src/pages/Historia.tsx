import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';
import { PlaceholderVisual } from '../components/PlaceholderVisual';

import { imageUrls } from '../data/content';

const STAMP = '/assets/images/packaging/afl01.JPG';

export function Historia() {
  return (
    <div className="inner-page">
      <Header />

      <main>
        <section className="page-intro section-cream">
          <SectionKicker>
            Uma história feita de matéria
          </SectionKicker>

          <h1>
            O que é passageiro
            <br />
            <em>pode permanecer.</em>
          </h1>

          <p>
            A Aflora nasceu de um desejo simples:
            guardar a delicadeza da natureza e transformá-la
            em algo que pudesse acompanhar uma vida.
          </p>
        </section>

        <section className="editorial-pair section-light">
  <PlaceholderVisual
    image={imageUrls.terra}
    label="Jardim e matéria · placeholder"
  />

  <div>
    <SectionKicker>
      01 · O começo
    </SectionKicker>

            <h2>
              Antes da peça, existe um olhar.
            </h2>

            <p>
              O processo começa muito antes da resina.
              Começa na atenção: ao formato de uma folha,
              à cor que só aparece quando a luz atravessa
              uma pétala, à pequena imperfeição que torna
              um fragmento irrepetível.
            </p>
          </div>
        </section>

        <section className="editorial-wide section-moss">
          <div>
            <SectionKicker>
              02 · O fazer
            </SectionKicker>

            <h2>
              O tempo também é parte da técnica.
            </h2>

            <p>
              Escolher, preparar, posicionar, esperar,
              lixar, polir. Cada etapa pede presença.
              No atelier, as mãos não tentam acelerar
              a natureza — elas aprendem a acompanhá-la.
            </p>
          </div>

          <PlaceholderVisual
            label="Atelier Aflora · fotografia em breve"
          />
        </section>

        <section className="history-closing section-sand">
          <div className="history-seal">
            <img
              src={STAMP}
              alt="Sinete físico Aflora"
            />
          </div>

          <SectionKicker>
            03 · Um gesto final
          </SectionKicker>

          <h2>
            Uma marca para uma história que começa.
          </h2>

          <p>
            Cada embalagem é preparada como uma extensão
            da peça: um gesto pequeno, mas cheio de intenção,
            antes de chegar às suas mãos.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}