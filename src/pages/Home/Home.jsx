import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getSeries } from "../../services/request";
import SeriesList from "../../components/SeriesList/SeriesList";
import styles from "./Home.module.scss";

const LIMIT = 20;

const Home = ({ searchQuery = "" }) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const controllerRef = useRef(null);

  const sortedSeries = useMemo(() => {
    const list = [...series];
    if (sortOption === "title") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOption === "startYear") {
      return list.sort((a, b) => (a.startYear || 0) - (b.startYear || 0));
    }
    return list;
  }, [series, sortOption]);

  const handleSort = (e) => setSortOption(e.target.value);

  const startNewController = useCallback(() => {
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {}
    }
    const c = new AbortController();
    controllerRef.current = c;
    return c;
  }, []);

  const fetchPage = useCallback(
    async (query = "", pageOffset = 0, { append = false } = {}) => {
      const controller = startNewController();

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const results = await getSeries(
          {
            limit: LIMIT,
            offset: pageOffset,
            q: query?.trim() || "",
          },
          { signal: controller.signal }
        );

        if (controllerRef.current !== controller) return;

        setHasMore((results?.length || 0) === LIMIT);

        if (append) {
          setSeries((prev) => [...prev, ...(results || [])]);
        } else {
          setSeries(results || []);
        }
      } catch (err) {
        const aborted =
          err?.name === "AbortError" || err?.code === "ERR_CANCELED";
        if (controllerRef.current !== controller || aborted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Došlo je do greške prilikom učitavanja."
        );
        if (!append) setSeries([]);
      } finally {
        if (controllerRef.current === controller) {
          if (append) setLoadingMore(false);
          else setLoading(false);
        }
      }
    },
    [startNewController]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(false);
    fetchPage(searchQuery, 0, { append: false });
    return () => {
      try {
        controllerRef.current?.abort();
      } catch {}
    };
  }, [searchQuery, fetchPage]);

  const loadMore = () => {
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchPage(searchQuery, nextOffset, { append: true });
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Marvel serije</h1>
          <p className={styles.subtitle}>
            Pretraži i pregledaj Marvel serije. Klikni na seriju za detalje.
          </p>
        </div>
        <div className={styles.headerRight}>
          <label className={styles.sortLabel}>
            Sortiraj:
            <select
              onChange={handleSort}
              value={sortOption}
              className={styles.sortSelect}
              aria-label="Sortiranje"
            >
              <option value="">Bez sortiranja</option>
              <option value="title">Po nazivu</option>
              <option value="startYear">Po godini</option>
            </select>
          </label>
        </div>
      </header>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
      )}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <div>{error}</div>
          <button
            className={styles.retryBtn}
            onClick={() => fetchPage(searchQuery, offset, { append: false })}
          >
            Pokušaj ponovo
          </button>
        </div>
      )}

      {!loading && !error && sortedSeries.length === 0 && (
        <div className={styles.empty}>
          Nema rezultata
          {searchQuery ? (
            <>
              {" "}
              za <strong>“{searchQuery}”</strong>
            </>
          ) : (
            ""
          )}
          .
        </div>
      )}

      {!loading && !error && sortedSeries.length > 0 && (
        <>
          <SeriesList
            series={sortedSeries}
            onSort={handleSort}
            sortOption={sortOption}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 16 }}
          >
            {hasMore && (
              <button
                onClick={loadMore}
                className={styles.retryBtn}
                disabled={loadingMore}
              >
                {loadingMore ? "Učitavam…" : "Učitaj još"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default Home;
