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
  terra: '/assets/images/universe/terra.png',
  agua: '/assets/images/universe/agua.png',
  ar: '/assets/images/universe/ar.png',
  fogo: '/assets/images/universe/fogo.png',
};

export const universes: Universe[] = [
  {
    id: 'terra',
    name: 'Terra',
    description: 'Raízes, presença e permanência.',
    mood: 'Para quem encontra força naquilo que permanece.',
    image: imageUrls.terra,
    accent: '#6f7352',
  },
  {
    id: 'agua',
    name: 'Água',
    description: 'Fluidez, profundidade e renovação.',
    mood: 'Para quem muda sem deixar de reconhecer a própria essência.',
    image: imageUrls.agua,
    accent: '#557c83',
  },
  {
    id: 'ar',
    name: 'Ar',
    description: 'Leveza, movimento e horizonte.',
    mood: 'Para quem sente liberdade antes mesmo de escolher o caminho.',
    image: imageUrls.ar,
    accent: '#aebbc2',
  },
  {
    id: 'fogo',
    name: 'Fogo',
    description: 'Intensidade, calor e transformação.',
    mood: 'Para quem carrega uma presença que não passa despercebida.',
    image: imageUrls.fogo,
    accent: '#a65b35',
  },
];

export const collections: Collection[] = [
  {
    id: 'raizes',
    universo: 'terra',
    nome: 'Raízes',
    descricao: 'Matéria, memória e a força silenciosa do que sustenta.',
    imagemFundo: imageUrls.terra,
    imagemPeca: imageUrls.terra,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'rio',
    universo: 'agua',
    nome: 'Rio',
    descricao: 'Movimento, pedra e caminhos que nunca deixam de seguir.',
    imagemFundo: imageUrls.agua,
    imagemPeca: imageUrls.agua,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'aurora',
    universo: 'ar',
    nome: 'Aurora',
    descricao: 'Primeira luz, horizonte e a delicadeza de um novo começo.',
    imagemFundo: imageUrls.ar,
    imagemPeca: imageUrls.ar,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'brasa',
    universo: 'fogo',
    nome: 'Brasa',
    descricao: 'Calor contido, intensidade e transformação.',
    imagemFundo: imageUrls.fogo,
    imagemPeca: imageUrls.fogo,
    urlNuvemshop: '#',
    ativa: true,
  },
];

export const pecasDisponiveis: AvailablePiece[] = [
  {
    id: 'terra-01',
    nome: 'Raiz',
    colecao: 'Raízes',
    imagem: imageUrls.terra,
    url: '#',
    ativa: true,
  },
  {
    id: 'agua-01',
    nome: 'Correnteza',
    colecao: 'Rio',
    imagem: imageUrls.agua,
    url: '#',
    ativa: true,
  },
  {
    id: 'ar-01',
    nome: 'Primeira Luz',
    colecao: 'Aurora',
    imagem: imageUrls.ar,
    url: '#',
    ativa: true,
  },
  {
    id: 'fogo-01',
    nome: 'Brasa',
    colecao: 'Brasa',
    imagem: imageUrls.fogo,
    url: '#',
    ativa: true,
  },
];

export const playlist: PlaylistTrack[] = [
  {
    id: 'faixa-01',
    titulo: 'Entre folhas',
    arquivo: '/audio/entre-folhas.mp3',
    artista: 'Aflora',
    ativa: false,
  },
  {
    id: 'faixa-02',
    titulo: 'Luz de dentro',
    arquivo: '/audio/luz-de-dentro.mp3',
    artista: 'Aflora',
    ativa: false,
  },
];