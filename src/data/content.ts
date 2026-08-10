export type Universe = {
  id: string;
  name: string;
  description: string;
  mood: string;
  image: string;
  accent: string;
};

export type Collection = {
  id: string;
  universo: string;
  nome: string;
  descricao: string;
  imagemFundo: string;
  imagemPeca: string;
  urlNuvemshop: string;
  ativa: boolean;
};

export type AvailablePiece = {
  id: string;
  nome: string;
  colecao: string;
  imagem: string;
  url: string;
  ativa: boolean;
};

export type PlaylistTrack = {
  id: string;
  titulo: string;
  arquivo: string;
  artista: string;
  ativa: boolean;
};

export const imageUrls = {
  wildflower: 'https://images.pexels.com/photos/38597855/pexels-photo-38597855.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800',
  buttercups: 'https://images.pexels.com/photos/539719/pexels-photo-539719.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800',
  calendula: 'https://images.pexels.com/photos/65950/calendula-medicinal-plant-nature-65950.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800',
  wildflowerDetail: 'https://images.pexels.com/photos/33731645/pexels-photo-33731645.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1800',
};

export const universes: Universe[] = [
  { id: 'mar', name: 'Mar', description: 'Liberdade, sal e transparência.', mood: 'Para quem carrega o horizonte consigo.', image: imageUrls.buttercups, accent: '#c5b486' },
  { id: 'ceu', name: 'Céu', description: 'Luz, infinito e delicadeza.', mood: 'Leve como aquilo que ainda está por vir.', image: imageUrls.wildflowerDetail, accent: '#ddd2b8' },
  { id: 'rio', name: 'Rio', description: 'Movimento, pedra e verde.', mood: 'A beleza de seguir encontrando caminhos.', image: imageUrls.wildflower, accent: '#a9b19a' },
  { id: 'mistica', name: 'Mística', description: 'Símbolos, energia e profundidade.', mood: 'Para sentir antes de entender.', image: imageUrls.calendula, accent: '#8e8062' },
  { id: 'esporte', name: 'Esporte', description: 'Paixões, histórias e presença.', mood: 'O que vibra em você também pode florescer.', image: imageUrls.buttercups, accent: '#c17d50' },
  { id: 'classica', name: 'Clássica', description: 'Sobriedade, tempo e permanência.', mood: 'A delicadeza de uma escolha que atravessa o tempo.', image: imageUrls.wildflower, accent: '#ded4c2' },
];

export const collections: Collection[] = [
  { id: 'mediterraneo', universo: 'mar', nome: 'Mediterrâneo', descricao: 'Azuis que guardam o calor do sol.', imagemFundo: imageUrls.buttercups, imagemPeca: '/assets/images/logo/afl03.jpg', urlNuvemshop: '#', ativa: true },
  { id: 'aurora', universo: 'ceu', nome: 'Aurora', descricao: 'Primeira luz sobre a matéria.', imagemFundo: imageUrls.wildflowerDetail, imagemPeca: '/assets/images/logo/afl03.jpg', urlNuvemshop: '#', ativa: true },
  { id: 'margem', universo: 'rio', nome: 'Margem', descricao: 'Onde a terra encontra o movimento.', imagemFundo: imageUrls.wildflower, imagemPeca: '/assets/images/logo/afl03.jpg', urlNuvemshop: '#', ativa: true },
  { id: 'constelacao', universo: 'mistica', nome: 'Constelação', descricao: 'Pequenos sinais para iluminar o caminho.', imagemFundo: imageUrls.calendula, imagemPeca: '/assets/images/logo/afl03.jpg', urlNuvemshop: '#', ativa: true },
];

export const pecasDisponiveis: AvailablePiece[] = [
  { id: 'gota-01', nome: 'Gota Solar', colecao: 'Aurora', imagem: '/assets/images/logo/afl03.jpg', url: '#', ativa: true },
  { id: 'gota-02', nome: 'Margem', colecao: 'Margem', imagem: '/assets/images/logo/afl03.jpg', url: '#', ativa: true },
  { id: 'gota-03', nome: 'Maré Baixa', colecao: 'Mediterrâneo', imagem: '/assets/images/logo/afl03.jpg', url: '#', ativa: true },
  { id: 'gota-04', nome: 'Pequena Luz', colecao: 'Constelação', imagem: '/assets/images/logo/afl03.jpg', url: '#', ativa: true },
];

export const playlist: PlaylistTrack[] = [
  { id: 'faixa-01', titulo: 'Entre folhas', arquivo: '/audio/entre-folhas.mp3', artista: 'Aflora', ativa: false },
  { id: 'faixa-02', titulo: 'Luz de dentro', arquivo: '/audio/luz-de-dentro.mp3', artista: 'Aflora', ativa: false },
];
