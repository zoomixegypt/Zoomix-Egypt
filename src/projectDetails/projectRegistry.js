import { PROJECT_META_BY_SLUG } from "../data/projectMeta";
import { lazy } from "react";

// Project detail components will be registered as ZOOMIX case studies in Prompt 07.
// Keeping the registry empty prevents legacy MotionFolio routes from loading.
const PROJECT_DETAIL_COMPONENTS = {
  "content-system": lazy(() => import("./ZoomixCaseStudy")),
  "story-system": lazy(() => import("./ZoomixCaseStudy")),
  "reel-system": lazy(() => import("./ZoomixCaseStudy")),
  "mirsa-brand-world": lazy(() => import("./ZoomixCaseStudy")),
  "nodra-brand-world": lazy(() => import("./ZoomixCaseStudy")),
  "athar-brand-world": lazy(() => import("./ZoomixCaseStudy")),
  "riwaq-brand-world": lazy(() => import("./ZoomixCaseStudy")),
};

export function getProjectRouteConfig(slug) {
  const metadata = PROJECT_META_BY_SLUG[slug];
  if (!metadata) return null;

  return {
    ...metadata,
    Component: PROJECT_DETAIL_COMPONENTS[slug],
  };
}
