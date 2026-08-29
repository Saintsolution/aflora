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
  elemento: string;
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

  elemento:
    | 'agua'
    | 'terra'
    | 'fogo'
    | 'ar';

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
  agua: '/assets/images/universe/agua.png',
  terra: '/assets/images/universe/terra.png',
  fogo: '/assets/images/universe/fogo.png',
  ar: '/assets/images/universe/ar.png',
};

export const universes: Universe[] = [
  {
    id: 'agua',
    name: 'Água',
    description:
      'Fluidez, profundidade e renovação.',
    mood:
      'Para quem muda sem deixar de reconhecer a própria essência.',
    image: imageUrls.agua,
    accent: '#557c83',
  },

  {
    id: 'terra',
    name: 'Terra',
    description:
      'Raízes, presença e permanência.',
    mood:
      'Para quem encontra força naquilo que permanece.',
    image: imageUrls.terra,
    accent: '#6f7352',
  },

  {
    id: 'fogo',
    name: 'Fogo',
    description:
      'Intensidade, calor e transformação.',
    mood:
      'Para quem carrega uma presença que não passa despercebida.',
    image: imageUrls.fogo,
    accent: '#a65b35',
  },

  {
    id: 'ar',
    name: 'Ar',
    description:
      'Leveza, movimento e horizonte.',
    mood:
      'Para quem sente liberdade antes mesmo de escolher o caminho.',
    image: imageUrls.ar,
    accent: '#aebbc2',
  },
];

export const collections: Collection[] = [
  {
    id: 'rio',
    elemento: 'agua',
    nome: 'Rio',
    descricao:
      'Movimento, pedra e caminhos que nunca deixam de seguir.',
    imagemFundo: imageUrls.agua,
    imagemPeca: imageUrls.agua,
    urlNuvemshop: '#',
    ativa: true,
  },

  {
    id: 'raizes',
    elemento: 'terra',
    nome: 'Raízes',
    descricao:
      'Matéria, memória e a força silenciosa do que sustenta.',
    imagemFundo: imageUrls.terra,
    imagemPeca: imageUrls.terra,
    urlNuvemshop: '#',
    ativa: true,
  },

  {
    id: 'brasa',
    elemento: 'fogo',
    nome: 'Brasa',
    descricao:
      'Calor contido, intensidade e transformação.',
    imagemFundo: imageUrls.fogo,
    imagemPeca: imageUrls.fogo,
    urlNuvemshop: '#',
    ativa: true,
  },

  {
    id: 'aurora',
    elemento: 'ar',
    nome: 'Aurora',
    descricao:
      'Primeira luz, horizonte e a delicadeza de um novo começo.',
    imagemFundo: imageUrls.ar,
    imagemPeca: imageUrls.ar,
    urlNuvemshop: '#',
    ativa: true,
  },
];

export const pecasDisponiveis: AvailablePiece[] = [
  {
    id: 'agua-01',
    nome: 'Correnteza',
    elemento: 'agua',
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
    id: 'terra-01',
    nome: 'Raiz',
    elemento: 'terra',
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
    id: 'fogo-01',
    nome: 'Brasa',
    elemento: 'fogo',
    colecaoId: 'brasa',
    colecaoNome: 'Brasa',
    descricao:
      'Flores em tons quentes reunidas em uma composição de presença e intensidade.',
    preco: 189,
    imagem: imageUrls.fogo,
    urlNuvemshop: '#',
    ativa: true,
  },

  {
    id: 'ar-01',
    nome: 'Primeira Luz',
    elemento: 'ar',
    colecaoId: 'aurora',
    colecaoNome: 'Aurora',
    descricao:
      'Transparência e leveza em uma peça inspirada na primeira luz do dia.',
    preco: 189,
    imagem: imageUrls.ar,
    urlNuvemshop: '#',
    ativa: true,
  },
];