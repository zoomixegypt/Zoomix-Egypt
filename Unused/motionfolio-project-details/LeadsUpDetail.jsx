import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "LeadsUp",
  category: "AI-Powered Lead Scoring",
  heroImg:
    "https://res.cloudinary.com/demlxsf08/image/upload/v1766487795/7ad00c9f-b6b6-4773-8d33-3fbae3039350_rtk4hf.jpg",
  tagline:
    "An AI-powered sales portal that prioritizes the most promising prospects for term deposit subscriptions - helping sales teams focus on high-value leads and boost follow-up efficiency.",
  year: "2025",
  stack: ["Python", "React", "Tailwind", "REST API", "ExpressJS", "Supabase"],
  features: [
    "Auto-ranking leads: automatically sorts prospects by highest subscription probability for term deposits.",
    "Transparent lead scoring: each prospect has a score/probability so sales can prioritize calls data-driven, not randomly.",
    "Concise sales dashboard: KPI overview of total leads, contacted, pending follow-ups, conversion rate, and high-priority prospects.",
    "Quick filter & segmentation: sort by status (contacted/pending), priority, and key attributes (age/job/campaign history).",
    "Actionable lead detail view: displays key prospect information to help sales tailor their approach when reaching out.",
    "Follow-up workflow: contact status updates + activity logging so every prospect's progress is tracked and never missed.",
  ],
  impact: [
    "Helps sales save time by focusing on the most promising prospects based on model predictions, rather than calling randomly.",
    "Increases campaign conversion rates by directing follow-up priority to prospects with the highest probability.",
    "Provides an easy-to-use MVP for daily sales workflow: ranking > contact > update status > monitor results.",
  ],
  links: {
    repo: "https://github.com/zickrian/Predictive-Lead-Scoring-Portal-for-Banking",
  },
};

export default function LeadsUpDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}
