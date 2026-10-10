import { useEffect, useId, useRef, useState } from "react";

export default function PackageRail({ offers, language, children }) {
  const ar = language === "ar";
  const rail = useRef(null);
  const id = useId();
  const [active, setActive] = useState(0);
  const [compare, setCompare] = useState(false);
  const move = (index) => {
    const next = Math.max(0, Math.min(offers.length - 1, index));
    rail.current?.children[next]?.scrollIntoView({block:"nearest",inline:"center",behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    setActive(next);
  };
  useEffect(() => { setActive(0); }, [offers, language]);
  const track = () => {
    const box = rail.current?.getBoundingClientRect();
    if (!box) return;
    const center = box.left + box.width / 2;
    const distances = Array.from(rail.current.children).map(child => {
      const rect = child.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - center);
    });
    setActive(distances.indexOf(Math.min(...distances)));
  };
  return <div className="public-package-rail">
    <div className="public-rail-controls">
      <button type="button" disabled={active === 0} aria-label={ar ? "الباقة السابقة" : "Previous package"} onClick={() => move(active - 1)}>{ar ? "→" : "←"}</button>
      <span aria-live="polite"><b className="public-number">{active + 1}</b> {ar ? "من" : "of"} <b className="public-number">{offers.length}</b></span>
      <button type="button" disabled={active >= offers.length - 1} aria-label={ar ? "الباقة التالية" : "Next package"} onClick={() => move(active + 1)}>{ar ? "←" : "→"}</button>
      <button type="button" aria-expanded={compare} aria-controls={id} onClick={() => setCompare(value => !value)}>{compare ? (ar ? "إغلاق المقارنة" : "Close comparison") : (ar ? "قارن الباقات" : "Compare packages")}</button>
    </div>
    <div className="mobile-package-scroller" ref={rail} onScroll={track} role="region" aria-label={ar ? "بطاقات الباقات؛ استخدم الأسهم للتنقل" : "Package cards; use arrows to navigate"} tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) {
        event.preventDefault();
        move(event.key === "Home" ? 0 : event.key === "End" ? offers.length - 1 : active + ((event.key === "ArrowRight") !== ar ? 1 : -1));
      }
    }}>{children}</div>
    {compare && <div id={id} className="public-comparison" tabIndex={0} role="region" aria-label={ar ? "مقارنة الباقات" : "Package comparison"}>
      <table><caption>{ar ? "قارن السعر والنطاق؛ التفاصيل الكاملة تظل في البطاقات أعلاه" : "Compare price and scope; complete details remain in the cards above"}</caption>
        <thead><tr><th scope="col">{ar ? "الباقة" : "Package"}</th><th scope="col">{ar ? "السعر والنطاق" : "Price and scope"}</th></tr></thead>
        <tbody>{offers.map(offer => <tr key={offer.id}><th scope="row">{offer.name?.[language]}</th><td>
          <b className="public-number">{offer.price}</b> {ar ? "جنيه" : "EGP"}
          <ul>{offer.outputs?.[language]?.map(line => <li key={line}>{line}</li>)}</ul>
          {offer.exclusions?.[language] && <p>{offer.exclusions[language]}</p>}
          {offer.priceNote?.[language] && <p>{offer.priceNote[language]}</p>}
        </td></tr>)}</tbody>
      </table>
    </div>}
  </div>;
}
