import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { StoryIntro } from '../components/StoryIntro';
import { UniquePiece } from '../components/UniquePiece';
import { Universes } from '../components/Universes';
import { AvailablePieces } from '../components/AvailablePieces';
import { Process } from '../components/Process';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { MusicPlayer } from '../components/MusicPlayer';

export function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <StoryIntro />
        <UniquePiece />
        <Universes />
        <AvailablePieces />
        <Process />
        <FinalCTA />
      </main>

      <Footer />

      <MusicPlayer />
    </>
  );
}