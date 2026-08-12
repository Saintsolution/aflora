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

  universo:
    | 'terra'
    | 'agua'
    | 'ar'
    | 'fogo';

  colecaoId: string;
  colecaoNome: string;

  descricao: string;
  preco: number;

  imagem: string;
  urlNuvemshop: string;

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
    universo: 'terra',
    colecaoId: 'raizes',
    colecaoNome: 'Raízes',
    descricao:
      'Matéria vegetal preservada em uma composição de tons terrosos.',
    preco: 189,
    imagem: imageUrls.terra,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'agua-01',
    nome: 'Correnteza',
    universo: 'agua',
    colecaoId: 'rio',
    colecaoNome: 'Rio',
    descricao:
      'Pedras azuis e matéria vegetal em uma composição inspirada no movimento da água.',
    preco: 189,
    imagem: imageUrls.agua,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'ar-01',
    nome: 'Primeira Luz',
    universo: 'ar',
    colecaoId: 'aurora',
    colecaoNome: 'Aurora',
    descricao:
      'Transparência e leveza em uma peça inspirada na primeira luz do dia.',
    preco: 189,
    imagem: imageUrls.ar,
    urlNuvemshop: '#',
    ativa: true,
  },
  {
    id: 'fogo-01',
    nome: 'Brasa',
    universo: 'fogo',
    colecaoId: 'brasa',
    colecaoNome: 'Brasa',
    descricao:
      'Flores em tons quentes reunidas em uma composição de presença e intensidade.',
    preco: 189,
    imagem: imageUrls.fogo,
    urlNuvemshop: '#',
    ativa: true,
  },
];