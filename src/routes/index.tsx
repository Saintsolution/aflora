import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { fetchProducts, formatPrice, CATEGORIES, type Product } from "@/lib/products";
import heroImg from "@/assets/hero.jpg";
import storyImg from "@/assets/story.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ateliê Aflora — Joias Botânicas feitas à mão no Rio" },
      { name: "description", content: "Brincos, colares e peças de decoração com flores e folhas reais. Joias botânicas artesanais do Ateliê Aflora, Rio de Janeiro." },
      { property: "og:title", content: "Ateliê Aflora — Joias Botânicas" },
      { property: "og:description", content: "A natureza efêmera, eternizada em joias e peças únicas." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const byCollection = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = p.collection || "Geral";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">Coleção autoral · Rio de Janeiro</p>
            <h1 className="font-script text-6xl md:text-7xl text-primary leading-none mb-6">
              Ateliê Aflora
            </h1>
            <p className="text-2xl md:text-3xl font-light text-foreground/80 leading-snug mb-8 italic">
              A beleza efêmera da natureza, costurada ao cotidiano em forma de joia.
            </p>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Brincos, colares e pequenas peças de decoração feitos à mão com flores e folhas
              que guardamos para sempre. Cada peça é única — como o instante em que a flor foi colhida.
            </p>
            <div className="mt-10 flex gap-4">
              <a href="#colecao" className="px-7 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-widest hover:bg-primary/90 transition">
                Ver coleção
              </a>
              <a href="#historia" className="px-7 py-3 border border-border text-sm uppercase tracking-widest hover:bg-muted transition">
                Nossa história
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="Brincos de resina com flores prensadas e folhas de eucalipto"
              width={1600}
              height={1200}
              className="w-full h-[520px] object-cover shadow-[0_30px_60px_-30px_rgba(60,40,20,0.3)]"
            />
            <div className="absolute -bottom-6 -left-6 bg-background border border-border px-6 py-4 shadow-md hidden md:block">
              <p className="font-script text-2xl text-accent leading-none">peça única</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">feita à mão</p>
            </div>
          </div>
        </div>
      </section>

      {/* História */}
      <section id="historia" className="bg-secondary/40 py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <img
              src={storyImg}
              alt="Mãos da artesã arranjando flores prensadas no ateliê"
              width={1200}
              height={1400}
              loading="lazy"
              className="w-full h-[480px] object-cover"
            />
          </div>
          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">Nossa história</p>
            <h2 className="text-4xl md:text-5xl text-primary leading-tight mb-8">
              A flor que durou um dia,<br/>agora dura para sempre.
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-foreground/80">
              <p>
                O Ateliê Aflora nasceu de uma inquietação simples: por que algo tão belo
                quanto uma flor precisa ser tão breve? Caminhando pelos jardins do Rio,
                colhendo o que o vento já havia derrubado, começamos a guardar pequenos
                fragmentos do efêmero — uma pétala, uma folha, um pedacinho de samambaia.
              </p>
              <p>
                Cada peça é uma tentativa de trazer a natureza para dentro do dia a dia.
                Não como ornamento distante, mas como gesto íntimo: algo que se usa
                no corpo, que se pendura na parede, que se carrega junto.
              </p>
              <p className="font-script text-3xl text-primary pt-4">
                — eternizar o instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coleção */}
      <section id="colecao" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4">Catálogo</p>
            <h2 className="text-5xl md:text-6xl text-primary">Nossas coleções</h2>
          </div>

          {isLoading && (
            <p className="text-center text-muted-foreground italic">colhendo as peças...</p>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border max-w-xl mx-auto">
              <p className="font-script text-4xl text-primary mb-2">em breve</p>
              <p className="text-muted-foreground text-sm">As primeiras peças estão sendo preparadas no ateliê.</p>
            </div>
          )}

          {byCollection.map(([collection, items]) => (
            <div key={collection} className="mb-20">
              <div className="flex items-end justify-between mb-8 border-b border-border pb-4">
                <h3 className="text-3xl md:text-4xl font-script text-primary">{collection}</h3>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {items.length} {items.length === 1 ? "peça" : "peças"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const categoryLabel = CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category;
  return (
    <article className="group">
      <div className="aspect-[4/5] overflow-hidden bg-muted mb-5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
            sem imagem
          </div>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-1">{categoryLabel}</p>
      <h4 className="text-xl text-foreground mb-1">{product.name}</h4>
      {product.description && (
        <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">{product.description}</p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-base text-primary">{formatPrice(Number(product.price))}</p>
        {product.product_url && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.25em] px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            Comprar
          </a>
        )}
      </div>
    </article>
  );
}
