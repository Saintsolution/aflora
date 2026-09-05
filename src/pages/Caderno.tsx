import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';

const CRIS_IMAGE =
  '/assets/images/caderno/cris-memoria-aflora.png';

const FIRST_POST = {
  author: 'Cris · Ateliê Aflora',
  meta: 'Primeira página do Caderno',
  title: 'A memória que floresce.',
  paragraphs: [
    `Sempre fui apaixonada por histórias, por pessoas e pelos pequenos detalhes que tornam cada encontro único. Minha trajetória passou pela moda, pelo jornalismo e pelo Direito, sempre muito próxima da escuta, da beleza e de tudo o que carrega identidade.`,
    `Sou mãe de três filhos, avó de três netos que enchem meus dias de vida, amante dos animais e das memórias que nos fazem sentir em casa.`,
    `Meu pai, Renato, é uma dessas presenças que me acompanham. A lembrança dele — ao lado da minha mãe, Dona Bia — vive em gestos, sentimentos e momentos que o tempo não apaga. Foi pensando nesse tipo de afeto que comecei a imaginar o Aflora.`,
    `Porque uma flor não dura para sempre em sua forma mais visível. Ela desabrocha, encanta, se transforma. Mas sua beleza pode continuar existindo de outro modo.`,
    `No atelier, folhas, flores e pequenos elementos da natureza ganham uma nova permanência. São preservados à mão, um a um, para se tornarem peças que carregam tempo, delicadeza e memória.`,
    `Não quero congelar a natureza. Quero honrar o instante dela. Aflora é um lugar onde aquilo que poderia se perder ganha um gesto de infinitude.`,
  ],
};

export function Caderno() {
  return (
    <div className="inner-page">
      <Header />

      <main className="caderno-page">
        <section className="caderno-opening section-light">
          <div className="caderno-portrait">
            <img
              src={CRIS_IMAGE}
              alt="Cris, criadora do Ateliê Aflora, com joia botânica"
            />
          </div>

          <div className="caderno-opening-copy">
            <SectionKicker>
              Caderno Aflora
            </SectionKicker>

            <blockquote className="caderno-quote">
              Há coisas que nos atravessam
              <br />
              e não nos deixam mais.
            </blockquote>

            <p>
              Uma flor que se abre por poucos dias.
              Uma folha encontrada no caminho.
              O perfume de uma casa querida.
              A luz de uma tarde.
            </p>

            <p>
              Aflora nasceu deste desejo de guardar
              o que é delicado.
            </p>

            <p>
              E o Caderno Aflora nasce para dividir
              memórias, histórias, descobertas e
              experiências com quem quiser acompanhar
              o que continua florescendo por aqui.
            </p>

            <p className="caderno-signature">
              Com carinho,
              <br />
              <strong>Cris</strong>
            </p>
          </div>
        </section>

        <section className="caderno-feed section-sand">
          <div className="caderno-feed-heading">
            <SectionKicker>
              Primeira publicação
            </SectionKicker>

            <h2>
              Uma história que
              <br />
              começa a <em>permanecer.</em>
            </h2>
          </div>

          <article className="caderno-post-card">
            <header className="caderno-post-header">
              <img
                className="caderno-avatar"
                src={CRIS_IMAGE}
                alt=""
                aria-hidden="true"
              />

              <div>
                <strong>{FIRST_POST.author}</strong>
                <span>{FIRST_POST.meta}</span>
              </div>
            </header>

            <div className="caderno-post-content">
              <SectionKicker>
                A origem
              </SectionKicker>

              <h3>{FIRST_POST.title}</h3>

              {FIRST_POST.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ))}

              <p className="caderno-post-signature">
                Com carinho,
                <br />
                <strong>Cris</strong>
              </p>
            </div>

            <footer className="caderno-post-footer">
              Em breve, você poderá curtir, comentar e
              acompanhar as próximas páginas do Caderno.
            </footer>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}