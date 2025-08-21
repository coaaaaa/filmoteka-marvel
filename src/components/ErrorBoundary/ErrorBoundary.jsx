import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <section
          style={{
            padding: 24,
            maxWidth: 720,
            margin: "40px auto",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>
            Nešto je pošlo naopako
          </h1>
          <p style={{ opacity: 0.8, marginBottom: 16 }}>
            Aplikacija je naišla na neočekivanu grešku. Pokušaj ponovo.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Osvježi stranicu
          </button>
          {import.meta.env.NODE_ENV !== "production" && this.state.error ? (
            <pre style={{ textAlign: "left", marginTop: 16, overflow: "auto" }}>
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          ) : null}
        </section>
      );
    }
    return this.props.children;
  }
}
