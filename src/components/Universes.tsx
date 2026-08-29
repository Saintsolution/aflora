import { SectionKicker } from './SectionKicker';
import { CollectionFrame } from './CollectionFrame';
import {
  collections,
  universes,
} from '../data/content';

type UniversesProps = {
  compact?: boolean;
};

export function Universes({
  compact = false,
}: UniversesProps) {
  return (
    <section
      className={`universes section-sand ${
        compact ? 'universes-compact' : ''
      }`}
      id="Elementos"
    >
      <div className="universes-intro">
        

        <h2>
          Encontre o elemento
          <br />
          <em>que fala de você.</em>
        </h2>

        <p>
          Não é sobre escolher uma categoria.
          É sobre reconhecer uma sensação.
        </p>
      </div>

      <div className="universe-grid">
        {universes.map((universe) => (
          <CollectionFrame
            key={universe.id}
            universe={universe}
            collection={collections.find(
              (item) => item.elemento === universe.id
            )}
          />
        ))}
      </div>
    </section>
  );
}