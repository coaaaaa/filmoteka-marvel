import { useState, Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";

const Home = lazy(() => import("./pages/Home/Home"));
const SeriesDetails = lazy(() =>
  import("./components/SeriesDetails/SeriesDetails")
);
const ComicDetails = lazy(() =>
  import("./components/ComicDetails/ComicDetails")
);

function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Marvel App`;
    }
  }, [title]);
}

function TitleWrapper({ title, children }) {
  useDocumentTitle(title);
  return children;
}

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => setSearchQuery(query);

  return (
    <section>
      <Header onSearch={handleSearch} />

      <Suspense
        fallback={
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Učitavanje…
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <TitleWrapper title="Početna">
                <Home searchQuery={searchQuery} />
              </TitleWrapper>
            }
          />
          <Route
            path="/series/:id"
            element={
              <TitleWrapper title="Detalji serije">
                <SeriesDetails />
              </TitleWrapper>
            }
          />
          <Route
            path="/comic/:id"
            element={
              <TitleWrapper title="Detalji stripa">
                <ComicDetails />
              </TitleWrapper>
            }
          />
        </Routes>
      </Suspense>
    </section>
  );
};

export default App;
