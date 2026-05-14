import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="leading-none">
          <span className="font-script text-4xl md:text-5xl text-primary block">Ateliê Aflora</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Joias Botânicas · Rio de Janeiro</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Coleção</Link>
          <a href="/#historia" className="hover:text-foreground transition">História</a>
          <a href="/#contato" className="hover:text-foreground transition">Contato</a>
          <Link to="/admin" className="hover:text-foreground transition">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contato" className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-script text-3xl text-primary">Ateliê Aflora</p>
          <p className="text-sm text-muted-foreground mt-2 italic">A natureza efêmera, eternizada.</p>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="uppercase tracking-widest text-xs text-foreground mb-2">Visite</p>
          <p>Rio de Janeiro — RJ</p>
          <p>Atendimento com hora marcada</p>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="uppercase tracking-widest text-xs text-foreground mb-2">Contato</p>
          <p>contato@atelieaflora.com.br</p>
          <p>@atelie.aflora</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ateliê Aflora · Feito à mão no Rio
      </div>
    </footer>
  );
}
