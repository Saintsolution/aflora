import { useEffect, useState } from 'react';
import type {
  CSSProperties,
  FormEvent,
} from 'react';
import type { User } from '@supabase/supabase-js';

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

type CadernoPost = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  author_name: string;
  meta: string;
  image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid rgba(38,50,31,.22)',
  background: '#fffdf8',
  color: '#26321f',
  fontSize: 14,
  outline: 'none',
  borderRadius: 2,
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 11,
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: '#66705f',
};

export function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
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

  const [posts, setPosts] = useState<CadernoPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  const [postErrorMessage, setPostErrorMessage] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postKicker, setPostKicker] = useState('A origem');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postAuthor, setPostAuthor] = useState('Cris · Ateliê Aflora');
  const [postMeta, setPostMeta] = useState('Publicação do Caderno');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postPublished, setPostPublished] = useState(false);
  const [postSortOrder, setPostSortOrder] = useState('0');

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(error);
        setLoginError('Não foi possível verificar o acesso.');
      }

      setUser(data.session?.user ?? null);
      setCheckingAuth(false);

      if (data.session?.user) {
        await loadProducts();
        await loadPosts();
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        const authenticatedUser = session?.user ?? null;
        setUser(authenticatedUser);

        if (authenticatedUser) {
          void loadProducts();
          void loadPosts();
        } else {
          setProducts([]);
          setPosts([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  async function loadPosts() {
    setPostsLoading(true);
    setPostErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('caderno_posts')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setPosts((data ?? []) as CadernoPost[]);
    } catch (error) {
      console.error(error);
      setPostErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as publicações.'
      );
    } finally {
      setPostsLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError('');

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      console.error(error);
      setLoginError(
        'E-mail ou senha inválidos. Confira os dados e tente novamente.'
      );
      setLoginLoading(false);
      return;
    }

    setUser(data.user);
    setPassword('');
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);
    setProducts([]);
    resetForm();
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

  function resetPostForm() {
    setEditingPostId(null);
    setPostKicker('A origem');
    setPostTitle('');
    setPostBody('');
    setPostAuthor('Cris · Ateliê Aflora');
    setPostMeta('Publicação do Caderno');
    setPostImageUrl('');
    setPostPublished(false);
    setPostSortOrder('0');
    setPostMessage('');
    setPostErrorMessage('');
  }

  function startEditingPost(post: CadernoPost) {
    setEditingPostId(post.id);
    setPostKicker(post.kicker || 'A origem');
    setPostTitle(post.title || '');
    setPostBody(post.body || '');
    setPostAuthor(post.author_name || 'Cris · Ateliê Aflora');
    setPostMeta(post.meta || 'Publicação do Caderno');
    setPostImageUrl(post.image_url || '');
    setPostPublished(Boolean(post.published));
    setPostSortOrder(String(post.sort_order ?? 0));
    setPostMessage('');
    setPostErrorMessage('');

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }

  async function handlePostSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPostSaving(true);
    setPostMessage('');
    setPostErrorMessage('');

    try {
      const payload = {
        kicker: postKicker.trim() || 'A origem',
        title: postTitle.trim(),
        body: postBody.trim(),
        author_name: postAuthor.trim() || 'Cris · Ateliê Aflora',
        meta: postMeta.trim() || 'Publicação do Caderno',
        image_url: postImageUrl.trim() || null,
        published: postPublished,
        sort_order: Number(postSortOrder) || 0,
      };

      if (!payload.title || !payload.body) {
        throw new Error('Preencha o título e o texto da publicação.');
      }

      if (editingPostId) {
        const { error } = await supabase
          .from('caderno_posts')
          .update(payload)
          .eq('id', editingPostId);

        if (error) {
          throw error;
        }

        setPostMessage('Publicação atualizada com sucesso.');
      } else {
        const { error } = await supabase
          .from('caderno_posts')
          .insert(payload);

        if (error) {
          throw error;
        }

        setPostMessage('Publicação criada com sucesso.');
      }

      await loadPosts();
      resetPostForm();
      setPostMessage(
        editingPostId
          ? 'Publicação atualizada com sucesso.'
          : 'Publicação criada com sucesso.'
      );
    } catch (error) {
      console.error(error);
      setPostErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar a publicação.'
      );
    } finally {
      setPostSaving(false);
    }
  }

  async function handlePostDelete(id: string) {
    if (!window.confirm('Remover esta publicação do Caderno?')) {
      return;
    }

    setPostMessage('');
    setPostErrorMessage('');

    try {
      const { error } = await supabase
        .from('caderno_posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPostMessage('Publicação removida.');
      await loadPosts();

      if (editingPostId === id) {
        resetPostForm();
      }
    } catch (error) {
      console.error(error);
      setPostErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao remover a publicação.'
      );
    }
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function uploadProductImage() {
    if (!file) {
      return null;
    }

    setUploading(true);

    try {
      const rawExt =
        file.name.split('.').pop() || 'jpg';

      const ext = rawExt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const path =
        `${crypto.randomUUID()}.${ext || 'jpg'}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const newImageUrl =
        await uploadProductImage();

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
        ...(newImageUrl
          ? { image_url: newImageUrl }
          : {}),
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);

        if (error) {
          throw error;
        }

        setMessage('Peça atualizada com sucesso.');
      } else {
        if (!newImageUrl) {
          throw new Error(
            'Escolha uma foto para cadastrar a peça.'
          );
        }

        const { error } = await supabase
          .from('products')
          .insert({
            ...payload,
            image_url: newImageUrl,
          });

        if (error) {
          throw error;
        }

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
    if (
      !window.confirm(
        'Remover esta peça do ateliê?'
      )
    ) {
      return;
    }

    setErrorMessage('');
    setMessage('');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMessage('Peça removida.');
      await loadProducts();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao remover a peça.'
      );
    }
  }

  if (checkingAuth) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#eee8dc',
          color: '#26321f',
        }}
      >
        <p>Verificando acesso...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#eee8dc',
          color: '#26321f',
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: 'min(430px, 100%)',
            padding: 32,
            background: '#f8f4ec',
            border: '1px solid rgba(38,50,31,.14)',
            boxShadow:
              '0 18px 50px rgba(38,50,31,.08)',
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              letterSpacing: '.24em',
              textTransform: 'uppercase',
              color: '#8a7b58',
            }}
          >
            Ateliê Aflora
          </p>

          <h1
            style={{
              margin: 0,
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(42px, 7vw, 68px)',
              fontWeight: 400,
              lineHeight: .95,
            }}
          >
            Área reservada
          </h1>

          <p
            style={{
              marginTop: 16,
              color: '#66705f',
              lineHeight: 1.6,
            }}
          >
            Entre para administrar as peças
            do ateliê.
          </p>

          <label
            style={{
              display: 'block',
              marginTop: 28,
            }}
          >
            <span style={labelStyle}>
              E-mail
            </span>

            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label
            style={{
              display: 'block',
              marginTop: 20,
            }}
          >
            <span style={labelStyle}>
              Senha
            </span>

            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          {loginError && (
            <p
              style={{
                marginTop: 18,
                color: '#9b3f34',
                lineHeight: 1.5,
              }}
            >
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: '100%',
              marginTop: 24,
              border: 0,
              padding: '14px 22px',
              background: '#26321f',
              color: '#fffdf8',
              cursor: loginLoading
                ? 'wait'
                : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '.14em',
              fontSize: 11,
            }}
          >
            {loginLoading
              ? 'Entrando...'
              : 'Entrar'}
          </button>
        </form>
      </main>
    );
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
      <div
        style={{
          width: 'min(1180px, 100%)',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: 24,
            marginBottom: 42,
          }}
        >
          <div>
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
              Cadastre, edite e organize as peças
              que aparecem no site. A venda continua
              acontecendo pela Nuvemshop.
            </p>

            <p
              style={{
                marginTop: 12,
                color: '#8a7b58',
                fontSize: 12,
              }}
            >
              Acesso: {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: '1px solid rgba(38,50,31,.22)',
              padding: '11px 16px',
              background: 'transparent',
              color: '#26321f',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '.12em',
              fontSize: 10,
            }}
          >
            Sair
          </button>
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
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            <label>
              <span style={labelStyle}>
                Nome da peça
              </span>

              <input
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>
                Preço (R$)
              </span>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>
                Elemento
              </span>

              <select
                value={universe}
                onChange={(event) =>
                  setUniverse(event.target.value)
                }
                style={inputStyle}
              >
                {UNIVERSES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={labelStyle}>
                Coleção
              </span>

              <input
                required
                placeholder="Ex: Raízes, Aurora, Rio, Brasa..."
                value={collection}
                onChange={(event) =>
                  setCollection(event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label>
              <span style={labelStyle}>
                Categoria
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                style={inputStyle}
              >
                {CATEGORIES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={labelStyle}>
                Ordem
              </span>

              <input
                type="number"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>

          <label
            style={{
              display: 'block',
              marginTop: 20,
            }}
          >
            <span style={labelStyle}>
              Descrição
            </span>

            <textarea
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              style={{
                ...inputStyle,
                resize: 'vertical',
              }}
            />
          </label>

          <label
            style={{
              display: 'block',
              marginTop: 20,
            }}
          >
            <span style={labelStyle}>
              Link do produto na Nuvemshop
            </span>

            <input
              type="url"
              placeholder="https://..."
              value={productUrl}
              onChange={(event) =>
                setProductUrl(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              marginTop: 20,
              alignItems: 'end',
            }}
          >
            <label>
              <span style={labelStyle}>
                Foto da peça
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ?? null
                  )
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
                    border:
                      '1px solid rgba(38,50,31,.16)',
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
                onChange={(event) =>
                  setActive(event.target.checked)
                }
              />{' '}
              Ativa
            </label>

            <label>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(event.target.checked)
                }
              />{' '}
              Destaque
            </label>

            <label>
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(event) =>
                  setNewArrival(event.target.checked)
                }
              />{' '}
              Novidade
            </label>
          </div>

          {message && (
            <p
              style={{
                color: '#4f6948',
                marginTop: 20,
              }}
            >
              {message}
            </p>
          )}

          {errorMessage && (
            <p
              style={{
                color: '#9b3f34',
                marginTop: 20,
              }}
            >
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
                cursor:
                  saving || uploading
                    ? 'wait'
                    : 'pointer',
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
                  border:
                    '1px solid rgba(38,50,31,.22)',
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
              {products.length === 1
                ? 'peça'
                : 'peças'}
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
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 18,
              }}
            >
              {products.map((product) => (
                <article
                  key={product.id}
                  style={{
                    background: '#f8f4ec',
                    border:
                      '1px solid rgba(38,50,31,.14)',
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
                      {product.universe ||
                        'sem elemento'}
                      {' · '}
                      {product.collection}
                    </small>

                    <h3
                      style={{
                        margin: '9px 0 4px',
                        fontFamily:
                          '"Cormorant Garamond", serif',
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
                      {formatPrice(
                        Number(product.price)
                      )}
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
                        onClick={() =>
                          startEditing(product)
                        }
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
                        onClick={() =>
                          handleDelete(product.id)
                        }
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
                          style={{
                            color: '#4f6948',
                          }}
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

        <section style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: '#8a7b58',
              }}
            >
              Caderno Aflora
            </p>

            <h2
              style={{
                margin: '4px 0 0',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 40,
                fontWeight: 400,
              }}
            >
              Publicações
            </h2>

            <p style={{ color: '#66705f', lineHeight: 1.6 }}>
              Crie textos, salve como rascunho e publique quando estiverem prontos.
              Separe os parágrafos com uma linha em branco.
            </p>
          </div>

          <form
            onSubmit={handlePostSubmit}
            style={{
              background: '#f8f4ec',
              border: '1px solid rgba(38,50,31,.14)',
              padding: 28,
              marginBottom: 28,
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
                <span style={labelStyle}>Etiqueta</span>
                <input
                  value={postKicker}
                  onChange={(event) => setPostKicker(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Título</span>
                <input
                  required
                  value={postTitle}
                  onChange={(event) => setPostTitle(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Autor</span>
                <input
                  value={postAuthor}
                  onChange={(event) => setPostAuthor(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Identificação</span>
                <input
                  value={postMeta}
                  onChange={(event) => setPostMeta(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Ordem</span>
                <input
                  type="number"
                  value={postSortOrder}
                  onChange={(event) => setPostSortOrder(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Imagem opcional</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={postImageUrl}
                  onChange={(event) => setPostImageUrl(event.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={{ display: 'block', marginTop: 20 }}>
              <span style={labelStyle}>Texto da publicação</span>
              <textarea
                required
                rows={12}
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
                placeholder="Escreva a publicação aqui..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </label>

            <label style={{ display: 'block', marginTop: 20 }}>
              <input
                type="checkbox"
                checked={postPublished}
                onChange={(event) => setPostPublished(event.target.checked)}
              />{' '}
              Publicar no Caderno
            </label>

            {postMessage && (
              <p style={{ color: '#4f6948', marginTop: 20 }}>
                {postMessage}
              </p>
            )}

            {postErrorMessage && (
              <p style={{ color: '#9b3f34', marginTop: 20 }}>
                {postErrorMessage}
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
                disabled={postSaving}
                style={{
                  border: 0,
                  padding: '13px 22px',
                  background: '#26321f',
                  color: '#fffdf8',
                  cursor: postSaving ? 'wait' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '.14em',
                  fontSize: 11,
                }}
              >
                {postSaving
                  ? 'Salvando...'
                  : editingPostId
                    ? 'Salvar publicação'
                    : 'Criar publicação'}
              </button>

              {editingPostId && (
                <button
                  type="button"
                  onClick={resetPostForm}
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

          {postsLoading ? (
            <p>Carregando publicações...</p>
          ) : posts.length === 0 ? (
            <p>Nenhuma publicação cadastrada.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 18,
              }}
            >
              {posts.map((post) => (
                <article
                  key={post.id}
                  style={{
                    background: '#f8f4ec',
                    border: '1px solid rgba(38,50,31,.14)',
                    padding: 20,
                  }}
                >
                  <small
                    style={{
                      color: post.published ? '#4f6948' : '#8a7b58',
                      textTransform: 'uppercase',
                      letterSpacing: '.12em',
                    }}
                  >
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </small>

                  <h3
                    style={{
                      margin: '9px 0 6px',
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 29,
                      fontWeight: 500,
                    }}
                  >
                    {post.title}
                  </h3>

                  <p style={{ color: '#66705f', lineHeight: 1.5 }}>
                    {post.meta} · {post.author_name}
                  </p>

                  <p
                    style={{
                      color: '#66705f',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  >
                    {post.body}
                  </p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => startEditingPost(post)}
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
                      onClick={() => handlePostDelete(post.id)}
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
