export function Hero() {
  return (
    <section className="hero" id="inicio">
      <video
        className="hero-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        loop
        aria-label="Apresentação visual do Ateliê Aflora"
      >
        <source
          src="/assets/images/hero/abertura_aflora_final.mp4"
          type="video/mp4"
        />

        Seu navegador não suporta vídeo HTML5.
      </video>
    </section>
  );
}