import { useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import styles from "./SearchInput.module.scss";

export default function SearchInput({ onSearch, defaultValue = "" }) {
  const debounced = useMemo(
    () => debounce((q) => onSearch(q.trim()), 400),
    [onSearch]
  );

  useEffect(() => {
    return () => debounced.cancel();
  }, [debounced]);

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder="Pretraži serije…"
      aria-label="Pretraga serija"
      onChange={(e) => debounced(e.target.value)}
      className={styles.input}
    />
  );
}
