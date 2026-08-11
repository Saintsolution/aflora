import { SectionKicker } from './SectionKicker';

const STAMP_VIDEO =
  '/assets/images/packaging/selo01_quadrado_site.mp4';

const processSteps = [
  [
    '01',
    'Escolha',
    'Flores, folhas, cores e elementos naturais são escolhidos individualmente.',
  ],
  [
    '02',
    'Tempo',
    'Os elementos passam pelos processos necessários de preparação e preservação.',
  ],
  [
    '03',
    'Composição',
    'Cada elemento é posicionado manualmente. Não existe produção em série da composição.',
  ],
  [
    '04',
    'Resina',
    'A natureza é preservada dentro da transparência. Luz, profundidade e detalhes passam a fazer parte da peça.',
  ],
  [
    '05',
    'Acabamento',
    'Lixamento, polimento, montagem e revisão são feitos artesanalmente.',
  ],
  [
    '06',
    'Cuidado',
    'A peça é limpa, conferida e preparada individualmente.',
  ],
  [
    '07',
    'Embalagem',
    'O toque final que prepara a peça para chegar a uma nova história.',
  ],
  [
    '08',
    'Exclusiva',
    'Cada peça Aflora é única e carrega sua própria composição. Uma criação singular, feita para pertencer somente a quem a escolheu.',
  ],
];

export function Process() {
  return (
    <section
      className="process section-moss"
      id="processo"
    >
      <div className="process-intro">
        <SectionKicker>
          O fazer
        </SectionKicker>

        <h2>
          Da natureza
          <br />
          <em>às suas mãos.</em>
        </h2>

        <p>
          Um percurso lento, atento e inteiramente humano.
        </p>
      </div>

      <div className="process-steps">
        {processSteps.map(([number, title, text]) => (
          <div
            className="process-step"
            key={number}
          >
            <span>{number}</span>

            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="process-stamp">
        <video
          className="process-stamp-video"
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
        >
          <source
            src={STAMP_VIDEO}
            type="video/mp4"
          />
        </video>
      </div>

      <div className="process-end">
        Feita pela natureza.
        <br />
        Terminada pelas mãos.
        <br />
        <em>Preparada para chegar às suas.</em>
      </div>
    </section>
  );
}