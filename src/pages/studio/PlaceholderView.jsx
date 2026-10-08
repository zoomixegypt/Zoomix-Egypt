import { Sparkles } from "lucide-react";
import {} from "../../data/commercialStudioPrototype";

import { NAVIGATION } from "./shared";
export default function PlaceholderView({ page, language }) {
  const item = NAVIGATION.find(([id]) => id === page);
  return (
    <div className="csp-empty-view csp-view-enter">
      <Sparkles />
      <p className="csp-kicker">PROTOTYPE / NEXT PHASE</p>
      <h1>{item?.[language === "ar" ? 2 : 3]}</h1>
      <p>
        {language === "ar"
          ? "تم حجز هذا القسم داخل الهيكل وسنبنيه في المرحلة التالية بعد اعتماد الرحلة التجارية الأساسية."
          : "This section is reserved in the product shell and will be built after the core commercial flow is approved."}
      </p>
    </div>
  );
}
