import { fetchPublicProducts, getCatalogNotice } from '../lib/catalog';
import { nomeFashion } from '../lib/catalog/nomeFashion';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';

import { universes } from '../data/content';
import { getProductCollection } from '../lib/collections';

import {
  formatPrice,
  type Product,
} from '../lib/products';

// Preserva a ordem visual das coleções no site.
const collections = [
  ...universes,
  {
    id: 'fe',
    name: 'Fé',
    image: '/assets/images/sections/fe.png',
    mood:
      'Símbolos, intenções e delicadeza para acompanhar aquilo em que você acredita.',
  },
  {
    id: 'casa',
    name: 'Casa',
    image: '/assets/images/sections/casa.png',
    mood:
      'Objetos autorais que levam natureza, presença e delicadeza para os seus espaços.',
  },
];

function normalize(value: string | null | undefined) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isCollection(id: string) {
  return collections.some((collection) => collection.id === id);
}

function getSelectedCollection() {
  const params = new URLSearchParams(window.location.search);

  const collection = normalize(params.get('colecao'));
  const element = normalize(params.get('elemento'));

  if (isCollection(collection)) {
    return collection;
  }

  // Compatibilidade com os links antigos dos cards e carrossel.
  if (isCollection(element)) {
    return element;
  }

  return collections[0]?.id || 'terra';
}

export function Colecoes() {
  const [selected, setSelected] = useState(getSelectedCollection);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catalogNotice, setCatalogNotice] = useState<string>();

  useEffect(() => {
    const previousScrollRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    function syncLocation() {
      setSelected(getSelectedCollection());

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }

    syncLocation();

    // Atualiza também quando Fé ou Casa é escolhida no menu
    // enquanto esta página já está aberta.
    window.addEventListener('popstate', syncLocation);

    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.history.scrollRestoration =
        previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await fetchPublicProducts();

        if (mounted) {
          setProducts(data);
          setError(false);
          setCatalogNotice(getCatalogNotice());
        }
      } catch (err) {
        console.error('Erro ao carregar peças:', err);

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const current =
    collections.find((collection) => collection.id === selected) ||
    collections[0];

  const currentPieces = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.active !== false &&
            getProductCollection(product) === selected
        )
        .sort(
          (first, second) =>
            Number(first.sort_order ?? 0) -
            Number(second.sort_order ?? 0)
        ),
    [products, selected]
  );

  function selectCollection(id: string) {
    setSelected(id);

    const url = new URL(window.location.href);

    url.searchParams.set('colecao', id);
    url.searchParams.delete('elemento');

    window.history.replaceState({}, '', url);
  }

  return (
    <div className="inner-page">
      <Header />

      <main>
        <section className="collections-intro section-cream">
          <SectionKicker>
            Coleções Aflora
          </SectionKicker>

          <h1>
            {current.name}
            <br />
            <em>Aflora.</em>
          </h1>

          <p>
            {`Conheça as peças da coleção ${current.name}, feitas uma a uma no Ateliê Aflora.`}
          </p>
        </section>

        <section className="collection-explorer section-sand">

          <div
            className="universe-tabs"
            role="group"
            aria-label="Escolher coleção"
          >
            {collections.map((element) => (
              <button
                key={element.id}
                type="button"
                className={
                  selected === element.id ? 'active' : ''
                }
                aria-pressed={selected === element.id}
                onClick={() => selectCollection(element.id)}
              >
                {element.name}
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
                url("${current.image}")
              `,
            }}
          >
            <div>
              <SectionKicker>
                Coleção {current.name}
              </SectionKicker>

              <h2>{current.name}</h2>
              <p>{current.mood}</p>
            </div>

            <span className="explorer-index">
              {String(collections.indexOf(current) + 1).padStart(
                2,
                '0'
              )}
              {' / '}
              {String(collections.length).padStart(2, '0')}
            </span>
          </div>

          <div className="collection-products">
            <div className="collection-products-header">
              <SectionKicker>
                Peças · {current.name}
              </SectionKicker>

              <p>
                Conheça nossas criações. Para comprar e consultar
                a disponibilidade, abra o link da peça na Nuvemshop.
              </p>
            </div>

            {catalogNotice && <p role="status">{catalogNotice}</p>}

            {loading ? (
              <div className="empty-collection" role="status">
                Carregando peças...
              </div>
            ) : error ? (
              <div className="empty-collection" role="alert">
                Não foi possível carregar as peças agora.
                Tente atualizar a página.
              </div>
            ) : currentPieces.length ? (
              <div className="collection-products-grid">
                {currentPieces.map((piece) => {
                  const productUrl = piece.product_url?.trim();

                  const content = (
                    <>
                      <div className="collection-product-image">
                        {piece.image_url && (
                          <img
                            src={piece.image_url}
                            alt={nomeFashion(piece.name)}
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div>
                        <small>{current.name}</small>

                        <h3>{nomeFashion(piece.name)}</h3>

                        {piece.description && (
                          <p>{piece.description}</p>
                        )}

                        <strong>
                          {formatPrice(Number(piece.price))}
                        </strong>

                        <span>
                          {productUrl ? (
                            <>
                              Ver na Nuvemshop
                              <ExternalLink
                                size={13}
                                aria-hidden="true"
                              />
                            </>
                          ) : (
                            'Link de compra em breve'
                          )}
                        </span>
                      </div>
                    </>
                  );

                  return productUrl ? (
                    <a
                      key={piece.id}
                      className="collection-product-card"
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={piece.id}
                      className="collection-product-card"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-collection">
                Novas peças da coleção {current.name} estão
                florescendo. Em breve, estarão aqui.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}