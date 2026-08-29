import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import {
  CATEGORIES,
  fetchProducts,
  formatPrice,
  type Product,
} from '../lib/products';

const UNIVERSES = [
  { value: 'terra', label: 'Terra' },
  { value: 'agua', label: 'Água' },
  { value: 'ar', label: 'Ar' },
  { value: 'fogo', label: 'Fogo' },
] as const;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid rgba(38,50,31,.22)',
  background: '#fffdf8',
  color: '#26321f',
  fontSize: 14,
  outline: 'none',
  borderRadius: 2,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 11,
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: '#66705f',
};

export function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [universe, setUniverse] = useState('terra');
  const [collection, setCollection] = useState('Raízes');
  const [category, setCategory] = useState<string>('colar');
  const [productUrl, setProductUrl] = useState('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as peças.'
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setCurrentImageUrl(null);
    setName('');
    setPrice('');
    setDescription('');
    setUniverse('terra');
    setCollection('Raízes');
    setCategory('colar');
    setProductUrl('');
    setActive(true);
    setFeatured(false);
    setNewArrival(false);
    setSortOrder('0');
    setFile(null);
    setMessage('');
    setErrorMessage('');
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setCurrentImageUrl(product.image_url ?? null);
    setName(product.name ?? '');
    setPrice(String(product.price ?? ''));
    setDescription(product.description ?? '');
    setUniverse(product.universe || 'terra');
    setCollection(product.collection || 'Raízes');
    setCategory(product.category || 'colar');
    setProductUrl(product.product_url || '');
    setActive(product.active !== false);
    setFeatured(Boolean(product.featured));
    setNewArrival(Boolean(product.new_arrival));
    setSortOrder(String(product.sort_order ?? 0));
    setFile(null);
    setMessage('');
    setErrorMessage('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadProductImage() {
    if (!file) return null;

    setUploading(true);

    try {
      const rawExt = file.name.split('.').pop() || 'jpg';
      const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${crypto.randomUUID()}.${ext || 'jpg'}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const newImageUrl = await uploadProductImage();

      const payload = {
        name: name.trim(),
        price: Number(price),
        description: description.trim() || null,
        universe,
        collection: collection || 'Geral',
        category,
        product_url: productUrl.trim() || null,
        active,
        featured,
        new_arrival: newArrival,
        sort_order: Number(sortOrder) || 0,
        ...(newImageUrl ? { image_url: newImageUrl } : {}),
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        setMessage('Peça atualizada com sucesso.');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...payload,
            image_url: newImageUrl,
          });

        if (error) throw error;
        setMessage('Peça adicionada ao ateliê.');
      }

      await loadProducts();

      if (!editingId) {
        resetForm();
        setMessage('Peça adicionada ao ateliê.');
      } else {
        setEditingId(null);
        setCurrentImageUrl(null);
        setFile(null);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar a peça.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Remover esta peça do ateliê?')) return;

    setErrorMessage('');
    setMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage('Peça removida.');
      await loadProducts();

      if (editingId === id) resetForm();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao remover a peça.'
      );
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '72px 24px',
        background: '#eee8dc',
        color: '#26321f',
      }}
    >
      <div style={{ width: 'min(1180px, 100%)', margin: '0 auto' }}>
        <header style={{ marginBottom: 42 }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              letterSpacing: '.24em',
              textTransform: 'uppercase',
              color: '#8a7b58',
            }}
          >
            Administração
          </p>

          <h1
            style={{
              margin: 0,
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(48px, 7vw, 86px)',
              fontWeight: 400,
              lineHeight: .95,
            }}
          >
            Admin Aflora
          </h1>

          <p
            style={{
              maxWidth: 620,
              marginTop: 14,
              color: '#66705f',
              lineHeight: 1.6,
            }}
          >
            Cadastre, edite e organize as peças que aparecem no site.
            A venda continua acontecendo pela Nuvemshop.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#f8f4ec',
            border: '1px solid rgba(38,50,31,.14)',
            padding: 28,
            marginBottom: 52,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            <label>
              <span style={labelStyle}>Nome da peça</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>Preço (R$)</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>elemento</span>
              <select
                value={universe}
                onChange={(event) => setUniverse(event.target.value)}
                style={inputStyle}
              >
                {UNIVERSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={labelStyle}>Coleção</span>
              <input
                required
                placeholder="Ex: Raízes, Aurora, Rio, Brasa..."
                value={collection}
                onChange={(event) => setCollection(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>Categoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={labelStyle}>Ordem</span>
              <input
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 20 }}>
            <span style={labelStyle}>Descrição</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          <label style={{ display: 'block', marginTop: 20 }}>
            <span style={labelStyle}>Link do produto na Nuvemshop</span>
            <input
              type="url"
              placeholder="https://..."
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              style={inputStyle}
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              marginTop: 20,
              alignItems: 'end',
            }}
          >
            <label>
              <span style={labelStyle}>Foto da peça</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFile(event.target.files?.[0] ?? null)
                }
                style={inputStyle}
              />
            </label>

            <div>
              {(file || currentImageUrl) && (
                <div
                  style={{
                    width: 88,
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    border: '1px solid rgba(38,50,31,.16)',
                    background: '#fff',
                  }}
                >
                  <img
                    src={
                      file
                        ? URL.createObjectURL(file)
                        : currentImageUrl || ''
                    }
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
              marginTop: 24,
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />{' '}
              Ativa
            </label>

            <label>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />{' '}
              Destaque
            </label>

            <label>
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(event) => setNewArrival(event.target.checked)}
              />{' '}
              Novidade
            </label>
          </div>

          {message && (
            <p style={{ color: '#4f6948', marginTop: 20 }}>{message}</p>
          )}

          {errorMessage && (
            <p style={{ color: '#9b3f34', marginTop: 20 }}>
              {errorMessage}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 24,
            }}
          >
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                border: 0,
                padding: '13px 22px',
                background: '#26321f',
                color: '#fffdf8',
                cursor: saving || uploading ? 'wait' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '.14em',
                fontSize: 11,
              }}
            >
              {uploading
                ? 'Enviando foto...'
                : saving
                  ? 'Salvando...'
                  : editingId
                    ? 'Salvar alterações'
                    : 'Adicionar peça'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  border: '1px solid rgba(38,50,31,.22)',
                  padding: '13px 22px',
                  background: 'transparent',
                  color: '#26321f',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '.14em',
                  fontSize: 11,
                }}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              alignItems: 'end',
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  color: '#8a7b58',
                }}
              >
                Estoque
              </p>

              <h2
                style={{
                  margin: '4px 0 0',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 40,
                  fontWeight: 400,
                }}
              >
                Peças no ateliê
              </h2>
            </div>

            <span style={{ color: '#66705f' }}>
              {products.length}{' '}
              {products.length === 1 ? 'peça' : 'peças'}
            </span>
          </div>

          {loading ? (
            <p>Carregando peças...</p>
          ) : products.length === 0 ? (
            <p>Nenhuma peça cadastrada.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 18,
              }}
            >
              {products.map((product) => (
                <article
                  key={product.id}
                  style={{
                    background: '#f8f4ec',
                    border: '1px solid rgba(38,50,31,.14)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: '#e4dfd4',
                      overflow: 'hidden',
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#7d8277',
                          fontSize: 13,
                        }}
                      >
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 18 }}>
                    <small
                      style={{
                        color: '#8a7b58',
                        textTransform: 'uppercase',
                        letterSpacing: '.12em',
                      }}
                    >
                      {product.universe || 'sem elemento'}
                      {' · '}
                      {product.collection}
                    </small>

                    <h3
                      style={{
                        margin: '9px 0 4px',
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: 27,
                        fontWeight: 500,
                      }}
                    >
                      {product.name}
                    </h3>

                    <strong
                      style={{
                        display: 'block',
                        marginBottom: 12,
                      }}
                    >
                      {formatPrice(Number(product.price))}
                    </strong>

                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => startEditing(product)}
                        style={{
                          border: 0,
                          background: 'transparent',
                          padding: 0,
                          color: '#26321f',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        style={{
                          border: 0,
                          background: 'transparent',
                          padding: 0,
                          color: '#8e4337',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        remover
                      </button>

                      {product.product_url && (
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#4f6948' }}
                        >
                          Nuvemshop
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}