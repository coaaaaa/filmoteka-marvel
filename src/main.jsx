import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import styles from "./index.module.scss";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <section className={styles.appContainer}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </section>
    </BrowserRouter>
  </React.StrictMode>
);
