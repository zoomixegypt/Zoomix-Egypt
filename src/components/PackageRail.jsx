import { useEffect, useRef, useState } from "react";

function revisionLabel(count, arabic) {
  if (!count) return "—";
  if (arabic && Number(count) === 2) return "مراجعتان على اتجاه اللوجو";
  return `${count}${arabic ? " جولات" : " logo-direction rounds"}`;
}

export default function PackageRail({ offers, language, children }) {
  const ar = language === "ar";
  const rail = useRef(null);
  const [active, setActive] = useState(0);
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
                  <b className="public-number">{offer.price}</b> {ar ? "جنيه" : "EGP"}
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
    </div>
  );
}
