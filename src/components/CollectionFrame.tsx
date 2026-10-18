import { navigateTo } from '../utils/navigation';
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
}: CollectionFrameProps) {
  return (
    <a
      href={`/colecoes?elemento=${universe.id}`}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        navigateTo(`/colecoes?elemento=${universe.id}`);
      }}
      aria-label={`Ver coleções do elemento ${universe.name}`}
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
        <span>elemento</span>
        <span>
          0{universes.indexOf(universe) + 1}
        </span>
      </div>

      <div className="frame-copy">
        <h3>{universe.name}</h3>

        <p>{universe.description}</p>
      </div>
    </a>
  );
}
