import {
  useEffect,
  useRef,
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
  {
    title: 'Aflora Song',
    src: '/assets/music/Aflora Song.mp3',
  },
  {
    title: 'Sensibilidade Rara',
    src: '/assets/music/Sensibilidade Rara.mp3',
  },
  {
    title: 'Terra Sagrada',
    src: '/assets/music/Terra Sagrada.mp3',
  },
  {
    title: 'Aflora Alecrim',
    src: '/assets/music/Aflora Alecrim.mp3',
  },
  {
    title: 'Fita de Cetim',
    src: '/assets/music/Fita de cetim.mp3',
  },
  {
    title: 'Aflora Obrigada, Senhor',
    src: '/assets/music/Aflora Obrigada Senhor.mp3',
  },
  {
    title: 'Me Transformo em Rosa',
    src: '/assets/music/Me Transformo em Rosa.mp3',
  },

  {
    title: 'Passarinhada',
    src: '/assets/music/Passarinhada.mp3',
  },

  {
    title: 'Terra Germinada',
    src: '/assets/music/Terra Germinada.mp3',
  },
  {
    title: 'Aflora Sol Reflete',
    src: '/assets/music/Aflora Sol Reflete.mp3',
  },
  {
    title: 'Chuva do Vento',
    src: '/assets/music/Chuva do Vento.mp3',
  },
];

type MusicPlayerProps = {
  autoPlay?: boolean;
};

export function MusicPlayer({
  autoPlay = false,
}: MusicPlayerProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const hasAutoStarted = useRef(false);

  const [currentTrack, setCurrentTrack] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  const track = tracks[currentTrack];

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.src = track.src;
    audio.load();

    if (playing) {
      audio.play().catch(() => {
        setPlaying(false);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    if (
      !autoPlay ||
      hasAutoStarted.current ||
      !audio
    ) {
      return;
    }

    hasAutoStarted.current = true;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [autoPlay]);

  function togglePlay() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  function nextTrack() {
    setCurrentTrack((current) =>
      current === tracks.length - 1
        ? 0
        : current + 1
    );
  }

  function previousTrack() {
    setCurrentTrack((current) =>
      current === 0
        ? tracks.length - 1
        : current - 1
    );
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={track.src}
        onEnded={nextTrack}
      />

      <div
        className="music-player-icon"
        aria-hidden="true"
      >
        <Music2 size={14} />
      </div>

      <div className="music-info">
        <span>{track.title}</span>

        <small>
          Viaje por nossas coleções ao som da trilha Aflora.
        </small>
      </div>

      <div className="music-controls">
        <button
          type="button"
          onClick={previousTrack}
          aria-label="Música anterior"
        >
          <SkipBack size={14} />
        </button>

        <button
          className="music-play"
          type="button"
          onClick={togglePlay}
          aria-label={
            playing
              ? 'Pausar música'
              : 'Tocar música'
          }
        >
          {playing ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )}
        </button>

        <button
          type="button"
          onClick={nextTrack}
          aria-label="Próxima música"
        >
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
}