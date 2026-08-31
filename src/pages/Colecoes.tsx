import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';

import {
  universes,
  collections as staticCollections,
} from '../data/content';

import {
  fetchProducts,
  formatPrice,
  type Product,
} from '../lib/products';

function getQueryParam(name: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return (
    new URLSearchParams(
      window.location.search
    ).get(name) || ''
  );
}

export function Colecoes() {
  const initialUniverse =
    getQueryParam('elemento');

  const initialCollection =
    getQueryParam('colecao');

  const [selected, setSelected] =
    useState(
      universes.some(
        (item) =>
          item.id === initialUniverse
      )
        ? initialUniverse
        : universes[0]?.id || 'terra'
    );

  const [
    selectedCollection,
    setSelectedCollection,
  ] = useState(
    initialCollection
  );

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const productsSectionRef =
    useRef<HTMLDivElement | null>(null);

  const shouldScrollToProductsRef =
    useRef(Boolean(initialCollection));

  useEffect(() => {
    const previousScrollRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration =
      'manual';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    return () => {
      window.history.scrollRestoration =
        previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data =
          await fetchProducts();

        if (mounted) {
          setProducts(data);
          setError(false);
        }
      } catch (err) {
        console.error(
          'Erro ao carregar peças:',
          err
        );

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const current =
    universes.find(
      (universe) =>
        universe.id === selected
    ) || universes[0];

  const currentCollections =
    useMemo(() => {
      const names = products
        .filter(
          (product) =>
            product.active !== false &&
            product.universe === current.id &&
            product.collection
        )
        .map(
          (product) =>
            product.collection.trim()
        );

      return Array.from(
        new Set(names)
      ).map((name) => {
        const collectionProducts = products
          .filter(
            (product) =>
              product.active !== false &&
              product.universe === current.id &&
              product.collection
                .toLowerCase()
                .trim() ===
                name
                  .toLowerCase()
                  .trim()
          )
          .sort(
            (first, second) =>
              Number(first.sort_order ?? 0) -
              Number(second.sort_order ?? 0)
          );

        const staticCollection =
          staticCollections.find(
            (item) =>
              item.elemento === current.id &&
              item.nome
                .toLowerCase()
                .trim() ===
                name
                  .toLowerCase()
                  .trim()
          );

        const coverPiece =
          collectionProducts.find(
            (product) => product.image_url
          );

        return {
          name,

          description:
            staticCollection?.descricao ||
            `Uma coleção do elemento ${current.name}.`,

          image:
            coverPiece?.image_url ||
            staticCollection?.imagemPeca ||
            staticCollection?.imagemFundo ||
            current.image,
        };
      });
    }, [
      products,
      current.id,
      current.name,
      current.image,
    ]);

  const currentPieces =
    useMemo(() => {
      if (!selectedCollection) {
        return [];
      }

      return products.filter(
        (product) =>
          product.active !== false &&
          product.universe === current.id &&
          product.collection
            .toLowerCase()
            .trim() ===
            selectedCollection
              .toLowerCase()
              .trim()
      );
    }, [
      products,
      current.id,
      selectedCollection,
    ]);

  useEffect(() => {
    if (
      loading ||
      !selectedCollection ||
      !shouldScrollToProductsRef.current
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          shouldScrollToProductsRef.current =
            false;

          productsSectionRef.current
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    loading,
    selectedCollection,
    currentPieces.length,
  ]);

  function selectUniverse(
    id: string
  ) {
    shouldScrollToProductsRef.current =
      false;

    setSelected(id);
    setSelectedCollection('');

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      'elemento',
      id
    );

    url.searchParams.delete(
      'colecao'
    );

    window.history.replaceState(
      {},
      '',
      url
    );
  }

  function selectCollection(
    name: string
  ) {
    shouldScrollToProductsRef.current =
      true;

    setSelectedCollection(name);

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      'elemento',
      current.id
    );

    url.searchParams.set(
      'colecao',
      name
    );

    window.history.replaceState(
      {},
      '',
      url
    );
  }

  return (
    <div className="inner-page">
      <Header />

      <main>
        <section className="collections-intro section-cream">
          <SectionKicker>
            Explorar por sensação
          </SectionKicker>

          <h1>
            Elementos
            <br />

            <em>
              Aflora.
            </em>
          </h1>

          <p>
            Escolha um caminho.
            Cada elemento abriga
            coleções que nascem
            de uma mesma atmosfera.
          </p>
        </section>

        <section className="collection-explorer section-sand">
          <div
            className="universe-tabs"
            role="tablist"
          >
            {universes.map(
              (universe) => (
                <button
                  type="button"
                  className={
                    selected ===
                    universe.id
                      ? 'active'
                      : ''
                  }
                  key={universe.id}
                  onClick={() =>
                    selectUniverse(
                      universe.id
                    )
                  }
                >
                  {universe.name}
                </button>
              )
            )}
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
                elemento selecionado
              </SectionKicker>

              <h2>
                {current.name}
              </h2>

              <p>
                {current.mood}
              </p>
            </div>

            <span className="explorer-index">
              0
              {
                universes.indexOf(
                  current
                ) + 1
              }

              {' / '}

              {String(
                universes.length
              ).padStart(
                2,
                '0'
              )}
            </span>
          </div>

          {loading ? (
            <div className="empty-collection">
              Carregando coleções...
            </div>
          ) : error ? (
            <div className="empty-collection">
              Não foi possível carregar
              as coleções agora.
            </div>
          ) : (
            <div className="collection-list">
              {currentCollections.length ? (
                currentCollections.map(
                  (collection) => (
                    <button
                      type="button"
                      className={`collection-row ${
                        selectedCollection ===
                        collection.name
                          ? 'active'
                          : ''
                      }`}
                      key={collection.name}
                      onClick={() =>
                        selectCollection(
                          collection.name
                        )
                      }
                    >
                      <div
                        className="collection-row-image"
                        aria-hidden="true"
                      >
                        <img
                          src={collection.image}
                          alt=""
                        />
                      </div>

                      <div className="collection-row-copy">
                        <small>
                          Coleção
                        </small>

                        <strong>
                          {collection.name}
                        </strong>

                        <p>
                          {collection.description}
                        </p>
                      </div>

                      <div
                        className="collection-row-arrow"
                        aria-hidden="true"
                      >
                        <ArrowRight size={19} />
                      </div>
                    </button>
                  )
                )
              ) : (
                <div className="empty-collection">
                  Novas coleções deste
                  elemento estão florescendo.
                </div>
              )}
            </div>
          )}

          {selectedCollection && (
            <div
              className="collection-products"
              ref={productsSectionRef}
            >
              <div className="collection-products-header">
                <SectionKicker>
                  {selectedCollection}
                </SectionKicker>

                <p>
                  Peças únicas deste
                  elemento. Clique para
                  conhecer todos os detalhes
                  e disponibilidade na
                  Nuvemshop.
                </p>
              </div>

              {currentPieces.length ? (
                <div className="collection-products-carousel">
                  <div
                    className={`collection-products-track ${
                      currentPieces.length > 1
                        ? ''
                        : 'is-static'
                    }`}
                  >
                    {(currentPieces.length > 1
                      ? [0, 1]
                      : [0]
                    ).map((copyIndex) => (
                      <div
                        className="collection-products-group"
                        key={copyIndex}
                        aria-hidden={
                          copyIndex === 1
                            ? true
                            : undefined
                        }
                      >
                        {currentPieces.map(
                          (piece) => (
                            <a
                              className="collection-product-card"
                              key={`${piece.id}-${copyIndex}`}
                              href={
                                piece.product_url ||
                                '#'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={
                                copyIndex === 1
                                  ? -1
                                  : undefined
                              }
                            >
                              <div className="collection-product-image">
                                {piece.image_url && (
                                  <img
                                    src={
                                      piece.image_url
                                    }
                                    alt={
                                      copyIndex === 1
                                        ? ''
                                        : piece.name
                                    }
                                  />
                                )}
                              </div>

                              <div>
                                <small>
                                  {piece.collection}
                                </small>

                                <h3>
                                  {piece.name}
                                </h3>

                                {piece.description && (
                                  <p>
                                    {piece.description}
                                  </p>
                                )}

                                <strong>
                                  {formatPrice(
                                    Number(
                                      piece.price
                                    )
                                  )}
                                </strong>

                                <span>
                                  Ver peça

                                  <ExternalLink
                                    size={13}
                                  />
                                </span>
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-collection">
                  Ainda não existem peças
                  cadastradas nesta coleção.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}