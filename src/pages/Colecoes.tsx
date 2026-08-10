import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MusicPlayer } from '../components/MusicPlayer';
import { SectionKicker } from '../components/SectionKicker';

import {
  collections,
  universes,
} from '../data/content';

export function Colecoes() {
  const [selected, setSelected] = useState('mar');

  const current =
    universes.find(
      (universe) => universe.id === selected
    ) || universes[0];

  const currentCollections = collections.filter(
    (collection) =>
      collection.universo === current.id &&
      collection.ativa
  );

  return (
    <div className="inner-page">
      <Header />

      <main>
        <section className="collections-intro section-cream">
          <SectionKicker>
            Explorar por sensação
          </SectionKicker>

          <h1>
            Universos
            <br />
            <em>Aflora.</em>
          </h1>

          <p>
            Escolha um caminho. Cada universo abriga
            coleções que nascem de uma mesma atmosfera.
          </p>
        </section>

        <section className="collection-explorer section-sand">
          <div
            className="universe-tabs"
            role="tablist"
          >
            {universes.map((universe) => (
              <button
                className={
                  selected === universe.id
                    ? 'active'
                    : ''
                }
                key={universe.id}
                onClick={() =>
                  setSelected(universe.id)
                }
              >
                {universe.name}
              </button>
            ))}
          </div>

          <div
            className="explorer-feature"
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(33,44,26,.9),
                  rgba(33,44,26,.18)
                ),
                url(${current.image})
              `,
            }}
          >
            <div>
              <SectionKicker>
                Universo selecionado
              </SectionKicker>

              <h2>
                {current.name}
              </h2>

              <p>
                {current.mood}
              </p>
            </div>

            <span className="explorer-index">
              0{universes.indexOf(current) + 1}
              {' / '}
              {String(universes.length).padStart(2, '0')}
            </span>
          </div>

          <div className="collection-list">
            {currentCollections.length ? (
              currentCollections.map(
                (collection) => (
                  <a
                    href={collection.urlNuvemshop}
                    className="collection-row"
                    key={collection.id}
                  >
                    <span>
                      <small>
                        Coleção
                      </small>

                      <strong>
                        {collection.nome}
                      </strong>
                    </span>

                    <p>
                      {collection.descricao}
                    </p>

                    <ArrowRight size={18} />
                  </a>
                )
              )
            ) : (
              <div className="empty-collection">
                Novas coleções deste universo
                estão florescendo.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MusicPlayer />
    </div>
  );
}