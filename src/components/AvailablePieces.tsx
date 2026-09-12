import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import { SectionKicker } from './SectionKicker';
import {
  fetchProducts,
  type Product,
} from '../lib/products';
import { navigateTo } from '../utils/navigation';

export function AvailablePieces() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  const faixaRef = useRef<HTMLDivElement | null>(null);

  const arrasteRef = useRef({
    ativo: false,
    iniciouEm: 0,
    scrollInicial: 0,
    moveu: false,
  });

  useEffect(() => {
    let montado = true;

    async function carregarProdutos() {
      try {
        const dados = await fetchProducts();

        if (montado) {
          setProducts(dados);
          setError(false);
        }
      } catch (erro) {
        console.error(
          'Erro ao carregar peças do Supabase:',
          erro
        );

        if (montado) {
          setError(true);
        }
      } finally {
        if (montado) {
          setLoading(false);
        }
      }
    }

    void carregarProdutos();

    return () => {
      montado = false;
    };
  }, []);

  const pecas = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false &&
          Boolean(product.image_url)
      ),
    [products]
  );

  /*
   * Quatro cópias garantem espaço suficiente
   * para o looping também em telas grandes.
   */
  const loop = [
    ...pecas,
    ...pecas,
    ...pecas,
    ...pecas,
  ];

  function normalizarLoop() {
    const faixa = faixaRef.current;

    if (!faixa) {
      return;
    }

    /*
     * Com quatro sequências, metade da faixa
     * equivale a duas sequências completas.
     */
    const metade = faixa.scrollWidth / 2;

    if (!metade) {
      return;
    }

    while (faixa.scrollLeft >= metade) {
      faixa.scrollLeft -= metade;
    }

    while (faixa.scrollLeft < 0) {
      faixa.scrollLeft += metade;
    }
  }

  useEffect(() => {
  if (!faixaRef.current || pecas.length < 1) {
    return;
  }

  const intervalo = window.setInterval(() => {
    const faixa = faixaRef.current;

    if (!faixa || arrasteRef.current.ativo) {
      return;
    }

    faixa.scrollLeft += 1;
    normalizarLoop();
  }, 20);

  return () => {
    window.clearInterval(intervalo);
  };
}, [pecas.length]);
  function getPieceLink(piece: Product) {
    if (piece.universe && piece.collection) {
      return `/colecoes?elemento=${encodeURIComponent(
        piece.universe
      )}&colecao=${encodeURIComponent(
        piece.collection
      )}`;
    }

    if (piece.universe) {
      return `/colecoes?elemento=${encodeURIComponent(
        piece.universe
      )}`;
    }

    return piece.product_url || '#';
  }

  function iniciarArraste(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {
      return;
    }

    const faixa = faixaRef.current;

    if (!faixa) {
      return;
    }

    faixa.setPointerCapture(event.pointerId);

    arrasteRef.current = {
      ativo: true,
      iniciouEm: event.clientX,
      scrollInicial: faixa.scrollLeft,
      moveu: false,
    };

    setArrastando(true);
  }

  function moverArraste(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    const arraste = arrasteRef.current;
    const faixa = faixaRef.current;

    if (!arraste.ativo || !faixa) {
      return;
    }

    event.preventDefault();

    const distancia =
      event.clientX - arraste.iniciouEm;

    if (Math.abs(distancia) > 6) {
      arraste.moveu = true;
    }

    faixa.scrollLeft =
      arraste.scrollInicial - distancia;

    normalizarLoop();
  }

  function finalizarArraste(
    event?: ReactPointerEvent<HTMLDivElement>
  ) {
    const faixa = faixaRef.current;

    if (
      faixa &&
      event &&
      faixa.hasPointerCapture(event.pointerId)
    ) {
      faixa.releasePointerCapture(event.pointerId);
    }

    arrasteRef.current.ativo = false;
    setArrastando(false);
  }

  function abrirPeca(
    event: ReactMouseEvent<HTMLAnchorElement>,
    piece: Product
  ) {
    if (arrasteRef.current.moveu) {
      event.preventDefault();
      arrasteRef.current.moveu = false;
      return;
    }

    const destino = getPieceLink(piece);

    if (destino.startsWith('/')) {
      event.preventDefault();
      navigateTo(destino);
    }
  }

  if (loading) {
    return (
      <section className="pieces-strip" id="pecas">
        <div className="pieces-label">
          <SectionKicker>
            Natureza em Movimento
          </SectionKicker>

          <p>Preparando as peças do ateliê...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pieces-strip" id="pecas">
        <div className="pieces-label">
          <SectionKicker>
            Natureza em Movimento
          </SectionKicker>

          <p>As peças estão sendo preparadas.</p>
        </div>
      </section>
    );
  }

  if (!pecas.length) {
    return null;
  }

  return (
    <section className="pieces-strip" id="pecas">
      <div className="pieces-label">
        <SectionKicker>
          Natureza em Movimento
        </SectionKicker>

        <p>Peças disponíveis por um tempo.</p>
      </div>

      <div
        ref={faixaRef}
        className={`marquee ${
          arrastando ? 'is-dragging' : ''
        }`}
        onPointerDown={iniciarArraste}
        onPointerMove={moverArraste}
        onPointerUp={finalizarArraste}
        onPointerCancel={finalizarArraste}
        onLostPointerCapture={finalizarArraste}
        aria-label="Peças disponíveis. Arraste lateralmente para navegar."
      >
        <div className="marquee-track">
          {loop.map((piece, index) => (
            <a
              className="piece-item"
              href={getPieceLink(piece)}
              key={`${piece.id}-${index}`}
              onClick={(event) =>
                abrirPeca(event, piece)
              }
              draggable={false}
            >
              <img
                src={piece.image_url || ''}
                alt={piece.name}
                draggable={false}
              />

              <span>
                <strong>{piece.name}</strong>

                <small>
                  {piece.collection || 'Aflora'}
                </small>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}