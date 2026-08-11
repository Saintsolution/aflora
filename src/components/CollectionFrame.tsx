import { ArrowRight } from 'lucide-react';
import {
  universes,
  type Collection,
  type Universe,
} from '../data/content';

type CollectionFrameProps = {
  universe: Universe;
  collection?: Collection;
};

export function CollectionFrame({
  universe,
  collection,
}: CollectionFrameProps) {
  return (
    <article
      className="collection-frame"
      style={{
        backgroundImage: `
          linear-gradient(
            180deg,
            rgba(33,44,26,.05),
            rgba(33,44,26,.78)
          ),
          url(${universe.image})
        `,
      }}
    >
      <div className="frame-top">
        <span>Universo</span>
        <span>
          0{universes.indexOf(universe) + 1}
        </span>
      </div>

      <div className="frame-copy">
        <h3>{universe.name}</h3>

        <p>{universe.description}</p>

        <a href={collection?.urlNuvemshop || '#'}>
          Descobrir este universo
          <ArrowRight size={14} />
        </a>
      </div>
    </article>
  );
}