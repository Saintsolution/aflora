import { useEffect, useMemo, useState } from 'react';
import { SectionKicker } from './SectionKicker';
import {
  fetchProducts,
  type Product,
} from '../lib/products';

export function AvailablePieces() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await fetchProducts();

        if (mounted) {
          setProducts(data);
          setError(false);
        }
      } catch (err) {
        console.error(
          'Erro ao carregar peças do Supabase:',
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

  const pieces = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false &&
          product.image_url
      ),
    [products]
  );

  const loop = [...pieces, ...pieces];

  function getPieceLink(piece: Product) {
    /*
      Produtos novos:
      se já tiverem universo, vão para a página
      de coleções do universo.

      Produtos antigos:
      ainda não têm universo, então usamos
      o link da Nuvemshop como fallback.
    */

    if (piece.universe) {
      return `/colecoes?universo=${piece.universe}`;
    }

    return piece.product_url || '#';
  }

  if (loading) {
    return (
      <section
        className="pieces-strip"
        id="pecas"
      >
        <div className="pieces-label">
          <SectionKicker>
            Peças vivendo agora
          </SectionKicker>

          <p>
            Preparando as peças do ateliê...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="pieces-strip"
        id="pecas"
      >
        <div className="pieces-label">
          <SectionKicker>
            Peças vivendo agora
          </SectionKicker>

          <p>
            As peças estão sendo preparadas.
          </p>
        </div>
      </section>
    );
  }

  if (!pieces.length) {
    return null;
  }

  return (
    <section
      className="pieces-strip"
      id="pecas"
    >
      <div className="pieces-label">
        <SectionKicker>
          Peças vivendo agora
        </SectionKicker>

        <p>
          Pequenas presenças, disponíveis por um tempo.
        </p>
      </div>

      <div className="marquee">
        {loop.map((piece, index) => (
          <a
            className="piece-item"
            href={getPieceLink(piece)}
            key={`${piece.id}-${index}`}
          >
            <img
              src={piece.image_url || ''}
              alt={piece.name}
            />

            <span>
              <strong>
                {piece.name}
              </strong>

              <small>
                {piece.collection || 'Aflora'}
              </small>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}