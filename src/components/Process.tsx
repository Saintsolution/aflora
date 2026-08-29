const STAMP_VIDEO =
  '/assets/images/packaging/selo01_quadrado_site.mp4';

const processSteps = [
  [
    'Escolha',
    'Flores, folhas, cores e elementos naturais são escolhidos individualmente.',
  ],
  [
    'Tempo',
    'Os elementos passam pelos processos necessários de preparação e preservação.',
  ],
  [
    'Composição',
    'Cada elemento é posicionado manualmente. Não existe produção em série da composição.',
  ],
  [
    'Resina',
    'A natureza é preservada dentro da transparência. Luz, profundidade e detalhes passam a fazer parte da peça.',
  ],
  [
    'Acabamento',
    'Lixamento, polimento, montagem e revisão são feitos artesanalmente.',
  ],
  [
    'Cuidado',
    'A peça é limpa, conferida e preparada individualmente.',
  ],
  [
    'Embalagem',
    'O toque final que prepara a peça para chegar a uma nova história.',
  ],
  [
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
        {processSteps.map(([title, text]) => (
          <div
            className="process-step"
            key={title}
          >
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
        Preparada pelas mãos.
        <br />
        <em>
          Prontas para chegar às suas.
        </em>
      </div>
    </section>
  );
}