const LOGO = '/assets/images/logo/afl03.jpg';

type PlaceholderVisualProps = {
  image?: string;
  label: string;
  className?: string;
};

export function PlaceholderVisual({
  image,
  label,
  className = '',
}: PlaceholderVisualProps) {
  return (
    <div
      className={`placeholder-visual ${className}`}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(
                180deg,
                rgba(35,48,28,.04),
                rgba(35,48,28,.5)
              ), url(${image})`,
            }
          : undefined
      }
    >
      {!image && (
        <div className="placeholder-orbit">
          <div className="placeholder-drop">
            <img
              src={LOGO}
              alt="Placeholder de joia Aflora"
            />
          </div>
        </div>
      )}

      <span>{label}</span>
    </div>
  );
}