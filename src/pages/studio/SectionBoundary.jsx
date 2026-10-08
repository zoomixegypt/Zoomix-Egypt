import { Component } from "react";

export default class SectionBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Studio section failed:", error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const ar = this.props.language === "ar";
    return (
      <section className="csp-panel csp-empty-state" role="alert">
        <strong>{ar ? "تعذر عرض هذا القسم." : "This section could not be displayed."}</strong>
        <p>
          {ar
            ? "بياناتك المحفوظة لم تتغير. يمكنك فتح قسم آخر من القائمة أو إعادة المحاولة."
            : "Saved data has not changed. Open another section or retry."}
        </p>
        <button className="csp-button" onClick={() => this.setState({ failed: false })}>
          {ar ? "إعادة المحاولة" : "Retry"}
        </button>
      </section>
    );
  }
}
