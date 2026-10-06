import { memo } from "react";

const LIME_STRIPE_CLIP = "inset(36% 56% 48% 34%)";

const ZoomixLogo = memo(function ZoomixLogo({
  variant = "dark",
  className = "",
  width = 250,
  height = 100,
  alt = "ZOOMIX",
  ...props
}) {
  const isLight = variant === "light";

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      {...props}
    >
      <img
        src="/zoomix-logo.svg"
        alt={alt}
        width={width}
        height={height}
        className={`absolute inset-0 h-full w-full object-contain ${isLight ? "brightness-0" : ""}`}
      />
      {isLight && (
        <img
          src="/zoomix-logo.svg"
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: LIME_STRIPE_CLIP }}
        />
      )}
    </span>
  );
});

export default ZoomixLogo;
