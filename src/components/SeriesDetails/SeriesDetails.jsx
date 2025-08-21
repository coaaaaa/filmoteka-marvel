import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMarvelData } from "../../services/request";
import ComicSlider from "../ComicSlider/ComicSlider";
import styles from "./SeriesDetails.module.scss";

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title || "Detalji serije"} | Marvel App`;
  }, [title]);
}

const SeriesDetails = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useDocumentTitle(series?.title);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchSeriesDetails = async () => {
      setLoading(true);
      try {
        const cacheKey = `series_${id}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          if (!active) return;
          const parsedData = JSON.parse(cachedData);
          setSeries(parsedData.series);
          setComics(parsedData.comics);
        } else {
          const [seriesData, comicsData] = await Promise.all([
            getMarvelData(`series/${id}`, {}, { signal: controller.signal }),
            getMarvelData(
              `series/${id}/comics`,
              { limit: 20 },
              { signal: controller.signal }
            ),
          ]);
          if (!active) return;
          const seriesDetails = seriesData.data.results[0];
          const comicResults = comicsData.data.results || [];
          setSeries(seriesDetails);
          setComics(comicResults);
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ series: seriesDetails, comics: comicResults })
            );
          } catch {}
        }
      } catch (error) {
        if (error?.name === "AbortError" || error?.code === "ERR_CANCELED")
          return;
        console.error("Error fetching series details:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSeriesDetails();

    return () => {
      active = false;
      try {
        controller.abort();
      } catch {}
    };
  }, [id]);

  if (loading) {
    return <p>Ucitavanje...</p>;
  }

  if (!series) {
    return <p>Nema detalja o seriji.</p>;
  }

  return (
    <div className={styles.seriesDetails}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Povratak
      </button>
      <div className={styles.seriesContent}>
        <img
          src={`${series.thumbnail.path}.${series.thumbnail.extension}`}
          alt={series.title}
          className={styles.seriesImage}
          loading="lazy"
        />
        <div className={styles.seriesInfo}>
          <h1>{series.title}</h1>
          <p>{series.description || "Nema opisa za ovu seriju."}</p>
          <div className={styles.yearDetails}>
            <p>
              <strong>Godina izdavanja:</strong> {series.startYear}
            </p>
            <p>
              <strong>Poslednja godina:</strong> {series.endYear || "U toku"}
            </p>
          </div>
        </div>
      </div>
      <h2>Stripovi</h2>
      {comics.length > 0 ? (
        <ComicSlider comics={comics} />
      ) : (
        <p>Trenutno nema dostupnih stripova za ovu seriju.</p>
      )}
    </div>
  );
};

export default SeriesDetails;
