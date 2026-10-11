import { useEffect, useRef, useState } from "react";

function revisionLabel(count, arabic) {
  if (!count) return "—";
  if (arabic && Number(count) === 2) return "مراجعتان على اتجاه اللوجو";
  return `${count}${arabic ? " جولات" : " logo-direction rounds"}`;
}

export default function PackageRail({ offers, language, route, children }) {
  const ar = language === "ar";
  const rail = useRef(null);
  const [active, setActive] = useState(0);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState(() => offers.slice(0, 2).map((offer) => offer.id));
  const comparisonTitleId = `mobile-comparison-title-${offers[0]?.id || "packages"}`;
  const comparisonOffers = comparisonIds
    .map((id) => offers.find((offer) => offer.id === id))
    .filter(Boolean);
  const priceSuffix = route === "continue" ? (ar ? "جنيه / شهريًا" : "EGP / month") : ar ? "جنيه" : "EGP";

  useEffect(() => {
    setComparisonIds(offers.slice(0, 2).map((offer) => offer.id));
    setComparisonOpen(false);
  }, [offers, language]);

  useEffect(() => {
    if (!comparisonOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setComparisonOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [comparisonOpen]);

  const comparisonRows = [
    {
      label: ar ? "السعر" : "Price",
      render: (offer) => (
        <span className="public-mobile-comparison-price" dir="ltr" style={{ unicodeBidi: "isolate" }}>
          <b className="public-number">{offer.price}</b> {priceSuffix}
        </span>
      ),
    },
    {
      label: ar ? "المدة" : "Timeline",
      render: (offer) => offer.duration?.[language] || "—",
    },
    {
      label: ar ? "المراجعات" : "Revisions",
      render: (offer) => revisionLabel(offer.revisions, ar),
    },
    {
      label: ar ? "أهم المخرجات" : "Key outputs",
      render: (offer) => (
        <ul className="public-mobile-comparison-list">
          {(offer.outputs?.[language] || []).slice(0, 3).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
    },
    {
      label: ar ? "نطاق مهم" : "Important scope",
      render: (offer) => offer.exclusions?.[language] || offer.priceNote?.[language] || "—",
    },
  ];

  const updateComparison = (slot, value) => {
    setComparisonIds((current) => {
      const next = [...current];
      const otherSlot = slot === 0 ? 1 : 0;
      if (next[otherSlot] === value) {
        next[otherSlot] = next[slot];
      }
      next[slot] = value;
      return next;
    });
  };
  const move = (index) => {
    const next = Math.max(0, Math.min(offers.length - 1, index));
    rail.current?.children[next]?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setActive(next);
  };
  useEffect(() => {
    setActive(0);
  }, [offers, language]);
  const track = () => {
    const box = rail.current?.getBoundingClientRect();
    if (!box) return;
    const center = box.left + box.width / 2;
    const distances = Array.from(rail.current.children).map((child) => {
      const rect = child.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - center);
    });
    setActive(distances.indexOf(Math.min(...distances)));
  };
  return (
    <div className="public-package-rail">
      <div className="public-rail-controls">
        <button
          type="button"
          disabled={active === 0}
          aria-label={ar ? "الباقة السابقة" : "Previous package"}
          onClick={() => move(active - 1)}
        >
          {ar ? "→" : "←"}
        </button>
        <span aria-live="polite">
          <b className="public-number">{active + 1}</b> {ar ? "من" : "of"}{" "}
          <b className="public-number">{offers.length}</b>
        </span>
        <button
          type="button"
          disabled={active >= offers.length - 1}
          aria-label={ar ? "الباقة التالية" : "Next package"}
          onClick={() => move(active + 1)}
        >
          {ar ? "←" : "→"}
        </button>
        <span className="public-rail-controls__hint">
          {ar ? "اسحب للمقارنة" : "Swipe to compare"}
        </span>
      </div>
      <div
        className="mobile-package-scroller"
        ref={rail}
        onScroll={track}
        role="region"
        aria-label={
          ar ? "بطاقات الباقات؛ استخدم الأسهم للتنقل" : "Package cards; use arrows to navigate"
        }
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            move(
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? offers.length - 1
                  : active + ((event.key === "ArrowRight") !== ar ? 1 : -1),
            );
          }
        }}
      >
        {children}
      </div>
      <div
        className="public-comparison"
        tabIndex={0}
        role="region"
        aria-label={ar ? "مقارنة الباقات" : "Package comparison"}
      >
        <table>
          <caption>
            {ar
              ? "مقارنة سريعة ظاهرة؛ التفاصيل الكاملة تظل في البطاقات أعلاه"
              : "Quick comparison; complete details remain in the cards above"}
          </caption>
          <thead>
            <tr>
              <th scope="col">{ar ? "الباقة" : "Package"}</th>
              <th scope="col">{ar ? "السعر" : "Price"}</th>
              <th scope="col">{ar ? "المدة" : "Timeline"}</th>
              <th scope="col">{ar ? "المراجعات" : "Revisions"}</th>
              <th scope="col">{ar ? "أهم المخرجات" : "Key outputs"}</th>
              <th scope="col">{ar ? "نطاق مهم" : "Important scope"}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <th scope="row">{offer.name?.[language]}</th>
                <td>
                  <b className="public-number">{offer.price}</b> {priceSuffix}
                </td>
                <td>{offer.duration?.[language] || "—"}</td>
                <td>{revisionLabel(offer.revisions, ar)}</td>
                <td>
                  <ul>
                    {offer.outputs?.[language]?.slice(0, 3).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </td>
                <td>{offer.exclusions?.[language] || offer.priceNote?.[language] || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {offers.length > 1 && (
        <>
          <button
            type="button"
            className="public-mobile-comparison-trigger"
            aria-expanded={comparisonOpen}
            aria-controls={comparisonTitleId}
            onClick={() => setComparisonOpen(true)}
          >
            <span>
              <strong>{ar ? "قارن الباقات" : "Compare packages"}</strong>
              <small>{ar ? "اختار باقتين وشوف الفرق من غير سحب أفقي" : "Choose two packages without horizontal scrolling"}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>

          {comparisonOpen && (
            <div
              className="public-comparison-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby={comparisonTitleId}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setComparisonOpen(false);
              }}
            >
              <div className="public-comparison-sheet__panel" dir={ar ? "rtl" : "ltr"}>
                <span className="public-comparison-sheet__handle" aria-hidden="true" />
                <div className="public-comparison-sheet__header">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#BBFF00]">
                      {ar ? "مقارنة سريعة" : "QUICK COMPARISON"}
                    </span>
                    <h3 id={comparisonTitleId}>
                      {ar ? "اختار باقتين للمقارنة" : "Choose two packages to compare"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="public-comparison-sheet__close"
                    onClick={() => setComparisonOpen(false)}
                    aria-label={ar ? "إغلاق المقارنة" : "Close comparison"}
                    autoFocus
                  >
                    ×
                  </button>
                </div>

                <div className="public-comparison-selectors">
                  {[0, 1].map((slot) => (
                    <label key={slot}>
                      <span>{ar ? `الباقة ${slot === 0 ? "الأولى" : "الثانية"}` : `Package ${slot + 1}`}</span>
                      <select value={comparisonIds[slot] || ""} onChange={(event) => updateComparison(slot, event.target.value)}>
                        {offers.map((offer) => (
                          <option key={offer.id} value={offer.id} disabled={comparisonIds[slot === 0 ? 1 : 0] === offer.id}>
                            {offer.name?.[language] || offer.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="public-mobile-comparison-grid">
                  <div className="public-mobile-comparison-header">
                    <span aria-hidden="true">&nbsp;</span>
                    {comparisonOffers.map((offer) => (
                      <h4 key={offer.id}>{offer.name?.[language] || offer.name}</h4>
                    ))}
                  </div>
                  {comparisonRows.map((row) => (
                    <div className="public-mobile-comparison-row" key={row.label}>
                      <strong>{row.label}</strong>
                      {comparisonOffers.map((offer) => (
                        <div key={offer.id}>{row.render(offer)}</div>
                      ))}
                    </div>
                  ))}
                </div>

                <button type="button" className="public-comparison-sheet__done" onClick={() => setComparisonOpen(false)}>
                  {ar ? "خلصت المقارنة" : "Done comparing"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
