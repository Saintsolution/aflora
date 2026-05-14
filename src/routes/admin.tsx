import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { fetchProducts, formatPrice, CATEGORIES } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Ateliê Aflora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [collection, setCollection] = useState("");
  const [category, setCategory] = useState<string>("brinco");
  const [productUrl, setProductUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMut = useMutation({
    mutationFn: async () => {
      let image_url: string | null = null;

      if (file) {
        setUploading(true);

        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });

        if (upErr) throw upErr;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        image_url = data.publicUrl;
        setUploading(false);
      }

      const { error } = await supabase.from("products").insert({
        name,
        price: Number(price),
        description: description || null,
        collection: collection || "Geral",
        category,
        image_url,
        product_url: productUrl || null,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Peça adicionada ao ateliê");

      setName("");
      setPrice("");
      setDescription("");
      setCollection("");
      setCategory("brinco");
      setProductUrl("");
      setFile(null);

      qc.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (e: Error) => {
      setUploading(false);
      toast.error("Erro ao salvar: " + e.message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Peça removida");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-6 py-16 w-full flex-1">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">
            Administração
          </p>

          <h1 className="font-script text-5xl text-primary">
            Ateliê — bastidores
          </h1>

          <p className="text-sm text-muted-foreground mt-2 italic">
            Adicione novas peças. Elas aparecerão imediatamente na vitrine.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="grid md:grid-cols-2 gap-6 bg-card border border-border p-8 mb-16"
        >
          <Field label="Nome da peça">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Preço (R$)">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Coleção">
            <input
              placeholder="Ex: Jardim de Inverno"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Categoria">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Texto explicativo" className="md:col-span-2">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Link do produto na Nuvemshop" className="md:col-span-2">
            <input
              type="url"
              placeholder="https://... link da página do produto na Nuvemshop"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Foto da peça" className="md:col-span-2">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center px-5 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition">
                {file ? "trocar foto" : "escolher foto"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>

              {file ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-12 h-12 object-cover border border-border"
                  />

                  <span className="truncate max-w-[220px]">{file.name}</span>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-destructive hover:underline"
                  >
                    remover
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  nenhuma foto selecionada
                </span>
              )}
            </div>
          </Field>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createMut.isPending || uploading}
              className="px-7 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-widest hover:bg-primary/90 transition disabled:opacity-50"
            >
              {uploading
                ? "enviando foto..."
                : createMut.isPending
                  ? "salvando..."
                  : "adicionar peça"}
            </button>
          </div>
        </form>

        <h2 className="text-primary mb-6 font-script text-3xl">
          Peças no ateliê ({products.length})
        </h2>

        <div className="border border-border divide-y divide-border bg-card">
          {products.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground italic">
              Nenhuma peça cadastrada ainda.
            </p>
          )}

          {products.map((p) => (
            <div key={p.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-muted overflow-hidden shrink-0">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>

                <p className="text-xs text-muted-foreground">
                  {p.collection} ·{" "}
                  {CATEGORIES.find((c) => c.value === p.category)?.label ??
                    p.category}
                </p>
              </div>

              <p className="text-sm text-primary">
                {formatPrice(Number(p.price))}
              </p>

              <button
                onClick={() => {
                  if (confirm("Remover esta peça?")) deleteMut.mutate(p.id);
                }}
                className="text-xs uppercase tracking-widest text-destructive hover:underline"
              >
                remover
              </button>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}