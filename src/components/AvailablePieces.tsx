import { fetchPublicProducts, getCatalogNotice } from '../lib/catalog';
import { nomeFashion } from '../lib/catalog/nomeFashion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import { SectionKicker } from './SectionKicker';
import { getProductCollection, getProductCollectionLabel } from '../lib/collections';
import { navigateTo } from '../utils/navigation';
import {
  type Product,
} from '../lib/products';

export function AvailablePieces() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catalogNotice, setCatalogNotice] = useState<string>();
  const [arrastando, setArrastando] = useState(false);

  const faixaRef = useRef<HTMLDivElement | null>(null);
  const periodoRef = useRef(0);
  const [repeticoes, setRepeticoes] = useState(2);

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
        const dados = await fetchPublicProducts();

        if (montado) {
          setProducts(dados);
          setError(false);
          setCatalogNotice(getCatalogNotice());
        }
      } catch (erro) {
        console.error(
          'Erro ao carregar catálogo público:',
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
    () => {
      const disponiveis = products.filter(
        (product) =>
          product.active !== false &&
          Boolean(product.image_url) && Boolean(getProductCollection(product))
      );
      // Embaralha uma vez por carga; a ordem permanece estável durante o movimento.
      for (let i = disponiveis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [disponiveis[i], disponiveis[j]] = [disponiveis[j], disponiveis[i]];
      }
      const grupos = new Map<string, Product[]>();
      for (const product of disponiveis) {
        const collection = getProductCollection(product);
        const grupo = grupos.get(collection) ?? [];
        grupo.push(product);
        grupos.set(collection, grupo);
      }
      const intercaladas: Product[] = [];
      // Coleções vazias são ignoradas; as restantes continuam até a última peça.
      for (let rodada = 0; intercaladas.length < disponiveis.length; rodada++) {
        for (const grupo of grupos.values()) {
          if (grupo[rodada]) intercaladas.push(grupo[rodada]);
        }
      }
      return intercaladas;
    },
    [products]
  );

  // Repete apenas os cards: cada metade precisa preencher a janela inteira.
  const loop = Array.from({ length: repeticoes * 2 }, () => pecas).flat();

  const normalizarLoop = useCallback((position?: number) => {
    const faixa = faixaRef.current;
    const periodo = periodoRef.current;
    if (!faixa || !periodo) return;
    const requested = position ?? faixa.scrollLeft;
    faixa.scrollLeft = ((requested % periodo) + periodo) % periodo;
  }, []);

  useLayoutEffect(() => {
    const faixa = faixaRef.current;
    const track = faixa?.firstElementChild as HTMLDivElement | null;
    if (!faixa || !track || !pecas.length) return;

    function medir() {
      if (!faixa || !track) return;
      const first = track.children[0] as HTMLElement;
      const next = track.children[pecas.length] as HTMLElement;
      if (!first || !next) return;
      // A distância entre sequências inclui o gap: scrollWidth / 2 não inclui
      // corretamente a emenda e pode ficar além do limite de rolagem.
      const sequence = next.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (sequence <= 0) return;
      const needed = Math.max(2, Math.ceil(faixa.clientWidth / sequence) + 1);
      setRepeticoes(needed);
      const secondHalf = track.children[pecas.length * repeticoes] as HTMLElement;
      periodoRef.current = secondHalf.getBoundingClientRect().left - first.getBoundingClientRect().left;
      normalizarLoop();
    }

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(faixa);
    observer.observe(track);
    return () => observer.disconnect();
  }, [pecas.length, repeticoes, loading, error, normalizarLoop]);

  useEffect(() => {
    if (!faixaRef.current || !pecas.length) return;
    const intervalo = window.setInterval(() => {
      const faixa = faixaRef.current;
      if (!faixa || arrasteRef.current.ativo) return;
      // Normaliza antes da atribuição para evitar que o navegador trave no fim.
      normalizarLoop(faixa.scrollLeft + 1);
    }, 20);
    return () => window.clearInterval(intervalo);
  }, [pecas.length, loading, error, normalizarLoop]);
  function getPieceLink(piece: Product) {
    const collection = getProductCollection(piece);
    if (collection) {
      return `/colecoes?colecao=${encodeURIComponent(collection)}`;
    }

    return '/colecoes';
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

    const distancia =
      event.clientX - arraste.iniciouEm;

    if (Math.abs(distancia) > 6) {
      arraste.moveu = true;
    }

    const requested = arraste.scrollInicial - distancia;
    normalizarLoop(requested);
    // Mantém o arraste contínuo também ao atravessar a emenda.
    arraste.scrollInicial += faixa.scrollLeft - requested;
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

  function impedirCliqueDepoisDoArraste(
    event: ReactMouseEvent<HTMLAnchorElement>
  ) {
    if (arrasteRef.current.moveu) {
      event.preventDefault();
      arrasteRef.current.moveu = false;
      return;
    }
    const href = event.currentTarget.getAttribute('href');
    if (href?.startsWith('/colecoes?') && event.button === 0
      && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigateTo(href);
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

          <p>Catálogo temporariamente indisponível. Tente novamente em instantes.</p>
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
        {catalogNotice && <p role="status">{catalogNotice}</p>}
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
              onClick={impedirCliqueDepoisDoArraste}
              draggable={false}
            >
              <img
                src={piece.image_url || ''}
                loading="lazy"
                decoding="async"
                alt={nomeFashion(piece.name)}
                draggable={false}
              />

              <span>
                <strong>{nomeFashion(piece.name)}</strong>

                <small>
                  Coleção {getProductCollectionLabel(piece)}
                </small>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
