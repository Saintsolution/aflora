import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SectionKicker } from '../components/SectionKicker';
import { supabase } from '../integrations/supabase/client';

const CRIS_IMAGE =
  '/assets/images/caderno/cris-memoria-aflora.png';

const FIRST_POST = {
  author: 'Cris · Ateliê Aflora',
  meta: 'Primeira página do Caderno',
  title: 'A memória que floresce.',
  paragraphs: [
    `Sempre fui apaixonada por histórias, por pessoas e pelos pequenos detalhes que tornam cada encontro único. Minha trajetória passou pela moda, pelo jornalismo e pelo Direito, sempre muito próxima da escuta, da beleza e de tudo o que carrega identidade.`,

    `Sou mãe de três filhos, avó de três netos que enchem meus dias de vida, amante dos animais e das memórias que nos fazem sentir em casa.`,

    `Meu pai, Renato, é uma dessas presenças que me acompanham. A lembrança dele — ao lado da minha mãe, Dona Bia — vive em gestos, sentimentos e momentos que o tempo não apaga. Foi pensando nesse tipo de afeto que comecei a imaginar o Aflora.`,

    `Porque uma flor não dura para sempre em sua forma mais visível. Ela desabrocha, encanta, se transforma. Mas sua beleza pode continuar existindo de outro modo.`,

    `No atelier, folhas, flores e pequenos elementos da natureza ganham uma nova permanência. São preservados à mão, um a um, para se tornarem peças que carregam tempo, delicadeza e memória.`,

    `Não quero congelar a natureza. Quero honrar o instante dela. Aflora é um lugar onde aquilo que poderia se perder ganha um gesto de infinitude.`,
  ],
};

type CadernoPost = {
  id: string;
  kicker: string;
  author_name: string;
  meta: string;
  title: string;
  body: string;
  image_url: string | null;
};

type CadernoComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  approved: boolean;
  created_at: string;
};

export function Caderno() {
  const [user, setUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<CadernoPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<
    Record<string, boolean>
  >({});

  const [comments, setComments] = useState<
    Record<string, CadernoComment[]>
  >({});

  const [commentOpen, setCommentOpen] = useState<
    Record<string, boolean>
  >({});

  const [commentText, setCommentText] = useState<
    Record<string, string>
  >({});

  const [sendingComment, setSendingComment] = useState<
    Record<string, boolean>
  >({});

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(
    'signup'
  );

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } =
        await supabase.auth.getSession();

      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      const { data, error } = await supabase
        .from('caderno_posts')
        .select(
          'id, kicker, author_name, meta, title, body, image_url'
        )
        .eq('published', true)
        .order('sort_order', {
          ascending: true,
        })
        .order('created_at', {
          ascending: true,
        });

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          'Erro ao carregar o Caderno:',
          error
        );
        setLoadingPosts(false);
        return;
      }

      const loadedPosts =
        (data ?? []) as CadernoPost[];

      setPosts(loadedPosts);

      if (loadedPosts.length > 0) {
        await loadInteractions(
          loadedPosts.map((post) => post.id)
        );
      }

      setLoadingPosts(false);
    }

    void loadPosts();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function loadInteractions(
    postIds: string[]
  ) {
    const { data: likesData } = await supabase
      .from('caderno_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    const likeTotals: Record<string, number> = {};
    const userLikes: Record<string, boolean> = {};

    for (const like of likesData ?? []) {
      likeTotals[like.post_id] =
        (likeTotals[like.post_id] || 0) + 1;

      if (user && like.user_id === user.id) {
        userLikes[like.post_id] = true;
      }
    }

    setLikes(likeTotals);
    setLikedPosts(userLikes);

    const { data: commentsData } = await supabase
      .from('caderno_comments')
      .select(
        'id, post_id, user_id, body, approved, created_at'
      )
      .in('post_id', postIds)
      .order('created_at', {
        ascending: true,
      });

    const groupedComments: Record<
      string,
      CadernoComment[]
    > = {};

    for (const comment of commentsData ?? []) {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push(
        comment as CadernoComment
      );
    }

    setComments(groupedComments);
  }

  function openAuth(
    mode: 'login' | 'signup'
  ) {
    setAuthMode(mode);
    setAuthError('');
    setAuthMessage('');
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
    setAuthError('');
    setAuthMessage('');
    setAuthPassword('');
  }

  async function handleAuthSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      if (authMode === 'signup') {
        const { data, error } =
          await supabase.auth.signUp({
            email: authEmail.trim(),
            password: authPassword,
            options: {
              data: {
                full_name: authName.trim(),
              },
            },
          });

        if (error) {
          throw error;
        }

        if (data.session) {
          setUser(data.session.user);
          closeAuth();
        } else {
          setAuthMessage(
            'Cadastro realizado. Verifique seu e-mail para confirmar o acesso.'
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: authEmail.trim(),
            password: authPassword,
          });

        if (error) {
          throw error;
        }

        setUser(data.user);
        closeAuth();
      }
    } catch (error) {
      console.error(error);

      setAuthError(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o acesso.'
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLike(postId: string) {
    if (!user) {
      openAuth('signup');
      return;
    }

    const alreadyLiked =
      likedPosts[postId] === true;

    if (alreadyLiked) {
      const { error } = await supabase
        .from('caderno_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
        return;
      }

      setLikedPosts((current) => ({
        ...current,
        [postId]: false,
      }));

      setLikes((current) => ({
        ...current,
        [postId]: Math.max(
          0,
          (current[postId] || 1) - 1
        ),
      }));

      return;
    }

    const { error } = await supabase
      .from('caderno_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) {
      console.error(error);
      return;
    }

    setLikedPosts((current) => ({
      ...current,
      [postId]: true,
    }));

    setLikes((current) => ({
      ...current,
      [postId]: (current[postId] || 0) + 1,
    }));
  }

  function toggleComments(postId: string) {
    if (!user) {
      openAuth('signup');
      return;
    }

    setCommentOpen((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  async function handleCommentSubmit(
    event: React.FormEvent<HTMLFormElement>,
    postId: string
  ) {
    event.preventDefault();

    if (!user) {
      openAuth('signup');
      return;
    }

    const body =
      commentText[postId]?.trim() || '';

    if (body.length < 2) {
      return;
    }

    setSendingComment((current) => ({
      ...current,
      [postId]: true,
    }));

    const { error } = await supabase
      .from('caderno_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        body,
      });

    setSendingComment((current) => ({
      ...current,
      [postId]: false,
    }));

    if (error) {
      console.error(error);
      return;
    }

    setCommentText((current) => ({
      ...current,
      [postId]: '',
    }));

    alert(
      'Comentário enviado. Ele aparecerá depois da aprovação.'
    );

    await loadInteractions(
      posts.map((post) => post.id)
    );
  }

  return (
    <div className="inner-page">
      <Header />

      <main className="caderno-page">
        <section className="caderno-opening section-light">
          <div className="caderno-portrait">
            <img
              src={CRIS_IMAGE}
              alt="Cris, criadora do Ateliê Aflora, com joia botânica"
            />
          </div>

          <div className="caderno-opening-copy">
            <SectionKicker>
              Caderno Aflora
            </SectionKicker>

            <blockquote className="caderno-quote">
              Há coisas que nos atravessam
              <br />
              e não nos deixam mais.
            </blockquote>

            <p>
              Uma flor que se abre por poucos dias.
              Uma folha encontrada no caminho.
              O perfume de uma casa querida.
              A luz de uma tarde.
            </p>

            <p>
              Aflora nasceu deste desejo de guardar
              o que é delicado.
            </p>

            <p>
              E o Caderno Aflora nasce para dividir
              memórias, histórias, descobertas e
              experiências com quem quiser acompanhar
              o que continua florescendo por aqui.
            </p>

            <p className="caderno-signature">
              Com carinho,
              <br />
              <strong>Cris</strong>
            </p>
          </div>
        </section>

        <section className="caderno-feed section-sand">
          <div className="caderno-feed-heading">
            <SectionKicker>
              Primeira publicação
            </SectionKicker>

            <h2>
              Uma história que
              <br />
              começa a <em>permanecer.</em>
            </h2>
          </div>

          <article className="caderno-post-card">
            <header className="caderno-post-header">
              <img
                className="caderno-avatar"
                src={CRIS_IMAGE}
                alt=""
                aria-hidden="true"
              />

              <div>
                <strong>
                  {FIRST_POST.author}
                </strong>

                <span>
                  {FIRST_POST.meta}
                </span>
              </div>
            </header>

            <div className="caderno-post-content">
              <SectionKicker>
                A origem
              </SectionKicker>

              <h3>
                {FIRST_POST.title}
              </h3>

              {FIRST_POST.paragraphs.map(
                (paragraph) => (
                  <p key={paragraph}>
                    {paragraph}
                  </p>
                )
              )}

              <p className="caderno-post-signature">
                Com carinho,
                <br />
                <strong>Cris</strong>
              </p>
            </div>

            <footer className="caderno-post-footer">
              Em breve, você poderá curtir, comentar e
              acompanhar as próximas páginas do Caderno.
            </footer>
          </article>

          {loadingPosts && (
            <p className="caderno-post-footer">
              Carregando novas páginas...
            </p>
          )}

          {!loadingPosts && posts.length > 0 && (
            <div className="caderno-new-posts">
              <div className="caderno-feed-heading">
                <SectionKicker>
                  Novas páginas
                </SectionKicker>
              </div>

              {posts.map((post) => (
                <article
                  className="caderno-post-card"
                  key={post.id}
                >
                  <header className="caderno-post-header">
                    <div>
                      <strong>
                        {post.author_name}
                      </strong>

                      <span>
                        {post.meta}
                      </span>
                    </div>
                  </header>

                  {post.image_url && (
                    <div className="caderno-post-image">
                      <img
                        src={post.image_url}
                        alt={post.title}
                      />
                    </div>
                  )}

                  <div className="caderno-post-content">
                    <SectionKicker>
                      {post.kicker}
                    </SectionKicker>

                    <h3>
                      {post.title}
                    </h3>

                    {post.body
                      .split(/\n\s*\n/)
                      .map(
                        (paragraph, index) => (
                          <p
                            key={`${post.id}-${index}`}
                          >
                            {paragraph}
                          </p>
                        )
                      )}
                  </div>

                  <div
                    className="caderno-post-actions"
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      borderTop:
                        '1px solid rgba(38,50,31,.12)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void handleLike(post.id)
                      }
                    >
                      {likedPosts[post.id]
                        ? '♥ Curtido'
                        : '♡ Curtir'}{' '}
                      ({likes[post.id] || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleComments(post.id)
                      }
                    >
                      Comentar (
                      {comments[post.id]?.filter(
                        (comment) =>
                          comment.approved
                      ).length || 0}
                      )
                    </button>
                  </div>

                  {commentOpen[post.id] && (
                    <div
                      className="caderno-comments"
                      style={{
                        padding: '0 1.5rem 1.5rem',
                      }}
                    >
                      <form
                        onSubmit={(event) =>
                          void handleCommentSubmit(
                            event,
                            post.id
                          )
                        }
                      >
                        <textarea
                          required
                          rows={4}
                          value={
                            commentText[post.id] || ''
                          }
                          onChange={(event) =>
                            setCommentText(
                              (current) => ({
                                ...current,
                                [post.id]:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="Escreva seu comentário..."
                        />

                        <button
                          type="submit"
                          disabled={
                            sendingComment[post.id]
                          }
                        >
                          {sendingComment[post.id]
                            ? 'Enviando...'
                            : 'Enviar comentário'}
                        </button>
                      </form>

                      <div>
                        {(
                          comments[post.id] || []
                        )
                          .filter(
                            (comment) =>
                              comment.approved
                          )
                          .map((comment) => (
                            <p key={comment.id}>
                              {comment.body}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {authOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'grid',
            placeItems: 'center',
            padding: '1.5rem',
            background: 'rgba(38,50,31,.48)',
          }}
        >
          <div
            style={{
              width: 'min(430px, 100%)',
              padding: '2rem',
              background: '#f8f4ec',
              color: '#26321f',
            }}
          >
            <button
              type="button"
              onClick={closeAuth}
              style={{
                float: 'right',
                border: 0,
                background: 'transparent',
                fontSize: '1.4rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <SectionKicker>
              Caderno Aflora
            </SectionKicker>

            <h2>
              {authMode === 'signup'
                ? 'Crie seu acesso'
                : 'Entre no Caderno'}
            </h2>

            <p>
              {authMode === 'signup'
                ? 'Cadastre-se para comentar e curtir as publicações.'
                : 'Entre para continuar participando.'}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <input
                  required
                  placeholder="Seu nome"
                  value={authName}
                  onChange={(event) =>
                    setAuthName(event.target.value)
                  }
                />
              )}

              <input
                required
                type="email"
                placeholder="Seu e-mail"
                value={authEmail}
                onChange={(event) =>
                  setAuthEmail(event.target.value)
                }
              />

              <input
                required
                type="password"
                minLength={6}
                placeholder="Senha com pelo menos 6 caracteres"
                value={authPassword}
                onChange={(event) =>
                  setAuthPassword(event.target.value)
                }
              />

              {authError && <p>{authError}</p>}
              {authMessage && <p>{authMessage}</p>}

              <button
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? 'Aguarde...'
                  : authMode === 'signup'
                    ? 'Criar cadastro'
                    : 'Entrar'}
              </button>
            </form>

            <button
              type="button"
              onClick={() =>
                setAuthMode((current) =>
                  current === 'signup'
                    ? 'login'
                    : 'signup'
                )
              }
            >
              {authMode === 'signup'
                ? 'Já tenho cadastro'
                : 'Ainda não tenho cadastro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}