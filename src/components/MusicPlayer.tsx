import {
  useEffect,
  useState,
} from 'react';

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Music2,
} from 'lucide-react';

const tracks = [
  { title: 'Aflora Song', src: '/assets/music/Aflora Song.mp3' },
  { title: 'Sensibilidade Rara', src: '/assets/music/Sensibilidade Rara.mp3' },
  { title: 'Terra Sagrada', src: '/assets/music/Terra Sagrada.mp3' },
  { title: 'Aflora Alecrim', src: '/assets/music/Aflora Alecrim.mp3' },
  { title: 'Fita de Cetim', src: '/assets/music/Fita de cetim.mp3' },
  { title: 'Aflora Obrigada, Senhor', src: '/assets/music/Aflora Obrigada Senhor.mp3' },
  { title: 'Me Transformo em Rosa', src: '/assets/music/Me Transformo em Rosa.mp3' },
  { title: 'Passarinhada', src: '/assets/music/Passarinhada.mp3' },
  { title: 'Terra Germinada', src: '/assets/music/Terra Germinada.mp3' },
  { title: 'Sereia', src: '/assets/music/Sereia.mp3' },
  { title: 'Aflora Sol Reflete', src: '/assets/music/Aflora Sol Reflete.mp3' },
  { title: 'Chuva do Vento', src: '/assets/music/Chuva do Vento.mp3' },
];

type MusicState = {
  currentTrack: number;
  playing: boolean;
};

const STORAGE_KEY = 'aflora_music_state';

function readSavedState(): MusicState {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return { currentTrack: 0, playing: false };

    const parsed = JSON.parse(saved) as Partial<MusicState>;
    const currentTrack = Number(parsed.currentTrack);

    return {
      currentTrack:
        Number.isInteger(currentTrack) &&
        currentTrack >= 0 &&
        currentTrack < tracks.length
          ? currentTrack
          : 0,
      playing: false,
    };
  } catch {
    return { currentTrack: 0, playing: false };
  }
}

// Este áudio é criado uma única vez enquanto a aplicação estiver aberta.
// Por isso ele não reinicia quando uma página troca por outra.
const audio = new Audio();
audio.preload = 'auto';

let state: MusicState = readSavedState();
let currentListeners = new Set<(state: MusicState) => void>();

function notify() {
  currentListeners.forEach((listener) => listener(state));

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currentTrack: state.currentTrack })
    );
  } catch {
    // sessionStorage pode estar indisponível em navegação privada.
  }
}

function loadTrack(index: number, shouldPlay = false) {
  const safeIndex =
    (index + tracks.length) % tracks.length;

  state = {
    currentTrack: safeIndex,
    playing: false,
  };

  audio.src = tracks[safeIndex].src;
  audio.load();

  if (shouldPlay) {
    audio
      .play()
      .then(() => {
        state = { ...state, playing: true };
        notify();
      })
      .catch(() => {
        state = { ...state, playing: false };
        notify();
      });
  }

  notify();
}

audio.addEventListener('ended', () => {
  loadTrack(state.currentTrack + 1, true);
});

audio.addEventListener('play', () => {
  state = { ...state, playing: true };
  notify();
});

audio.addEventListener('pause', () => {
  state = { ...state, playing: false };
  notify();
});

loadTrack(state.currentTrack);

function subscribe(listener: (state: MusicState) => void) {
  currentListeners.add(listener);
  listener(state);

  return () => {
    currentListeners.delete(listener);
  };
}

function togglePlay() {
  if (state.playing) {
    audio.pause();
    return;
  }

  audio.play().catch(() => {
    state = { ...state, playing: false };
    notify();
  });
}

function nextTrack() {
  loadTrack(state.currentTrack + 1, state.playing);
}

function previousTrack() {
  loadTrack(state.currentTrack - 1, state.playing);
}

type MusicPlayerProps = {
  autoPlay?: boolean;
};

export function MusicPlayer({
  autoPlay = false,
}: MusicPlayerProps) {
  const [musicState, setMusicState] =
    useState<MusicState>(state);

  useEffect(() => subscribe(setMusicState), []);

  useEffect(() => {
    if (autoPlay && !state.playing) {
      audio.play().catch(() => {
        // O navegador pode bloquear autoplay sem interação do usuário.
      });
    }
  }, [autoPlay]);

  const track = tracks[musicState.currentTrack];

  return (
    <div className="music-player">
      <div className="music-player-icon" aria-hidden="true">
        <Music2 size={14} />
      </div>

      <div className="music-info">
        <span>{track.title}</span>
        <small>
          Viaje por nossas coleções ao som da trilha Aflora.
        </small>
      </div>

      <div className="music-controls">
        <button type="button" onClick={previousTrack} aria-label="Música anterior">
          <SkipBack size={14} />
        </button>

        <button
          className="music-play"
          type="button"
          onClick={togglePlay}
          aria-label={musicState.playing ? 'Pausar música' : 'Tocar música'}
        >
          {musicState.playing ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button type="button" onClick={nextTrack} aria-label="Próxima música">
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
}
