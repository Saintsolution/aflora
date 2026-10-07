import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionKicker } from './SectionKicker';
import { navigateTo } from '../utils/navigation';
import './FeaturedCollections.css';

const featuredCollections = [
  {
    id: 'fe',
    name: 'Fé',
    image: '/assets/images/sections/fe.png',
    alt: 'Peças da coleção Fé do Ateliê Aflora',
    title: 'O que você acredita também pode florescer.',
    description:
      'Símbolos, intenções e histórias ganham forma em peças feitas à mão. Uma coleção que acolhe diferentes religiões, caminhos espirituais e expressões do esoterismo, com delicadeza e respeito ao que é sagrado para cada pessoa.',
  },
  {
    id: 'casa',
    name: 'Casa',
    image: '/assets/images/sections/casa.png',
    alt: 'Objetos decorativos da coleção Casa do Ateliê Aflora',
    title: 'A natureza encontra um lugar para ficar.',
    description:
      'Objetos decorativos que levam a delicadeza da Aflora para perto de você. Matérias, formas e detalhes se encontram em criações feitas uma a uma, para dar presença aos espaços e acompanhar os pequenos rituais de morar.',
  },
] as const;

type CollectionImageProps = {
  image: string;
  alt: string;
  name: string;
};

function CollectionImage({
  image,
  alt,
  name,
}: CollectionImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="featured-collections__visual">
      {failed ? (
        <div className="featured-collections__placeholder">
          <span>Coleção {name}</span>
          <small>Fotografia em breve</small>
        </div>
      ) : (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function FeaturedCollections() {
  return (
    <div className="featured-collections">
      {featuredCollections.map((collection) => {
        const target = `/colecoes?colecao=${collection.id}`;

        return (
          <section
            key={collection.id}
            id={`colecao-${collection.id}`}
            aria-labelledby={`titulo-${collection.id}`}
            className={`featured-collections__section featured-collections__section--${collection.id}`}
          >
            <CollectionImage
              image={collection.image}
              alt={collection.alt}
              name={collection.name}
            />

            <div className="featured-collections__copy">
              <SectionKicker>
                Coleção {collection.name}
              </SectionKicker>

              <h2 id={`titulo-${collection.id}`}>
                {collection.title}
              </h2>

              <p>{collection.description}</p>

              <a
                className="text-link featured-collections__link"
                href={target}
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
                  navigateTo(target);
                }}
              >
                Ver coleção {collection.name}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </section>
        );
      })}
    </div>
  );
}