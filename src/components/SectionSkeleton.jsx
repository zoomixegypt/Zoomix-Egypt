export default function SectionSkeleton({ tone = "light", className = "" }) {
  const isDark = tone === "dark";
  return (
    <div
      role="status"
      aria-label="Loading section"
      className={`${isDark ? "bg-[#0A0A0A]" : "bg-[#F5F4EF]"} ${className}`}
    >
      <div className="mx-auto max-w-[1400px] animate-pulse px-6 py-16 md:px-12 md:py-24">
        <div className={`h-3 w-28 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div
            className={`h-16 max-w-xl rounded md:h-24 ${isDark ? "bg-white/10" : "bg-black/10"}`}
          />
          <div className="space-y-4">
            <div className={`h-5 w-full rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
            <div className={`h-5 w-4/5 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
            <div className={`h-40 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
