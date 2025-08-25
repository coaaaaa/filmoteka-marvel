import styles from "./SeriesList.module.scss";
import SeriesItem from "@components/SeriesItem/SeriesItem";
import { useSeriesList } from "@/hooks/useSeriesList";

export default function SeriesList() {
  const {
    state: { items, total, loading, err },
    actions: { loadMore },
  } = useSeriesList();

  return (
    <section aria-labelledby="series-heading" className={styles.wrap}>
      <h2 id="series-heading" className={styles.title}>
        Marvel serije
      </h2>

      {/* aria-live za promjene stanja */}
      <div aria-live="polite" className="sr-only">
        {loading ? "Učitavanje…" : `Prikazano ${items.length} od ${total}`}
      </div>

      {err && (
        <p role="alert" className={styles.error}>
          Greška: {String(err)}
        </p>
      )}

      <ul className={styles.grid}>
        {items.map((s) => (
          <li key={s.id}>
            <SeriesItem id={s.id} title={s.title} thumbnail={s.thumbnail} />
          </li>
        ))}

        {loading &&
          items.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => (
            <li key={`sk-${i}`} className={styles.skel} aria-hidden="true" />
          ))}
      </ul>

      {/* Load more */}
      {items.length < total && (
        <button
          onClick={loadMore}
          className={styles.moreBtn}
          aria-label="Učitaj još rezultata"
          disabled={loading}
        >
          {loading ? "Učitavanje…" : "Učitaj još"}
        </button>
      )}
    </section>
  );
}
