import { SectionKicker } from './SectionKicker';

const memoryWords = [
  'Uma flor.',
  'Uma viagem.',
  'Um jardim.',
  'Um encontro.',
  'Uma pessoa.',
  'Um lugar.',
  'Uma lembrança.',
];

export function Memories() {
  return (
    <section className="memories section-sand">
      <div className="memory-words">
        {memoryWords.map((item, index) => (
          <span
            key={item}
            className={`memory-word memory-${index + 1}`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="memory-copy">
        <SectionKicker>
          05 · Memória
        </SectionKicker>

        <h2>
          Algumas histórias merecem permanecer.
        </h2>

        <p>
          A Aflora transforma inspirações, memórias e sentimentos
          em cores, formas e objetos que podem acompanhar uma história.
        </p>
      </div>
    </section>
  );
}