import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';

const HISTORY_IMAGES = {
  beginning: '/assets/images/history/hist01.png',
  making: '/assets/images/history/hist04.png',
  closing: '/assets/images/history/hist03.png',
};

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
          <div className="history-image">
            <img
              src={HISTORY_IMAGES.beginning}
              alt="Elementos naturais que inspiram a criação Aflora"
            />
          </div>

          <div>
            <SectionKicker>
              O começo
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
              O fazer
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

          <div className="history-image">
            <img
              src={HISTORY_IMAGES.making}
              alt="Processo artesanal de criação no Ateliê Aflora"
            />
          </div>
        </section>

        <section className="history-closing section-sand">
          <div className="history-image">
            <img
              src={HISTORY_IMAGES.closing}
              alt="Marca do Ateliê Aflora"
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