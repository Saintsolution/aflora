import { SectionKicker } from './SectionKicker';

const STAMP = '/assets/images/packaging/afl01.JPG';

const processSteps = [
  [
    '01',
    'A escolha',
    'Flores, folhas, cores e elementos naturais são escolhidos individualmente.',
  ],
  [
    '02',
    'O tempo',
    'Os elementos passam pelos processos necessários de preparação e preservação.',
  ],
  [
    '03',
    'A composição',
    'Cada elemento é posicionado manualmente. Não existe produção em série da composição.',
  ],
  [
    '04',
    'A resina',
    'A natureza é preservada dentro da transparência. Luz, profundidade e detalhes passam a fazer parte da peça.',
  ],
  [
    '05',
    'O acabamento',
    'Lixamento, polimento, montagem e revisão são feitos artesanalmente.',
  ],
  [
    '06',
    'O cuidado',
    'A peça é limpa, conferida e preparada individualmente.',
  ],
  [
    '07',
    'A embalagem',
    'O toque final que prepara a peça para chegar a uma nova história.',
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
        <img
          src={STAMP}
          alt="Placeholder da embalagem e sinete Aflora"
        />

        <span>
          Sinete e embalagem · placeholder
        </span>
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