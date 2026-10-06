import { useEffect, useState } from "react";

export default function ImageWithFallback({
  src,
  alt,
  fallbackLabel = "ZOOMIX",
  className = "",
  fallbackClassName = "",
  style,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const shouldFade = typeof src === "string" && !src.toLowerCase().endsWith(".svg");

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel}
        className={`flex items-center justify-center bg-[#171717] text-[#BBFF00] ${fallbackClassName} ${className}`}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] opacity-70">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      {...props}
      className={`${className} transition-opacity duration-500`}
      style={{ ...style, ...(shouldFade && !isLoaded ? { opacity: 0.18 } : {}) }}
    />
  );
}
