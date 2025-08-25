import { useEffect, useRef, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { getSeries } from "@/services/request";

export function useSeriesList() {
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState(""); // "" | "title" | "-title" | "startYear" ...
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const abortRef = useRef(null);
  const debouncedFetchRef = useRef();

  const fetchData = useCallback(
    async ({ reset = false } = {}) => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setErr(null);
      try {
        const data = await getSeries(
          {
            limit,
            offset: reset ? 0 : offset,
            q: query,
            orderBy: orderBy || undefined,
          },
          { signal: ctrl.signal }
        );

        setItems((prev) => (reset ? data : [...prev, ...data]));
        if (reset) setOffset(0);
      } catch (e) {
        if (e.name !== "AbortError") {
          setErr(e?.message || "Greška pri čitanju podataka");
        }
      } finally {
        setLoading(false);
      }
    },
    [limit, offset, orderBy, query]
  );

  useEffect(() => {
    debouncedFetchRef.current = debounce(() => {
      fetchData({ reset: true });
    }, 300);
    return () => debouncedFetchRef.current?.cancel?.();
  }, [fetchData]);

  useEffect(() => {
    debouncedFetchRef.current?.();
  }, [query, orderBy]);

  useEffect(() => {
    fetchData({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (offset === 0) return;
    fetchData();
  }, [offset, fetchData]);

  const loadMore = () => {
    if (loading) return;
    setOffset((prev) => prev + limit);
  };

  return {
    state: { items, loading, err, query, orderBy },
    actions: {
      setQuery,
      setOrderBy,
      loadMore,
      refetch: () => fetchData({ reset: true }),
    },
  };
}
