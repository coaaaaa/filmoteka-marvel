import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMarvelData } from "../../services/request";
import styles from "./ComicDetails.module.scss";

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title || "Detalji stripa"} | Marvel App`;
  }, [title]);
}

const ComicDetails = () => {
  const { id } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useDocumentTitle(comic?.title);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchComicDetails = async () => {
      setLoading(true);
      try {
        const cacheKey = `comic_${id}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          if (!active) return;
          setComic(JSON.parse(cachedData));
        } else {
          const comicData = await getMarvelData(
            `comics/${id}`,
            {},
            { signal: controller.signal }
          );
          if (!active) return;
          const fetchedComic = comicData.data.results[0];
          try {
            localStorage.setItem(cacheKey, JSON.stringify(fetchedComic));
          } catch {}
          setComic(fetchedComic);
        }
      } catch (error) {
        if (error?.name === "AbortError" || error?.code === "ERR_CANCELED")
          return;
        console.error("Error fetching comic details:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchComicDetails();

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

  if (!comic) {
    return <p>Nema detalja o stripu.</p>;
  }

  return (
    <div className={styles.comicDetails}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Povratak
      </button>
      <div className={styles.gridContainer}>
        <div className={styles.imageContainer}>
          <img
            src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
            alt={comic.title}
            className={styles.comicImage}
            loading="lazy"
          />
        </div>
        <div className={styles.infoContainer}>
          <h1 className={styles.title}>{comic.title}</h1>
          <p className={styles.description}>
            {comic.description || "Nema opisa za ovaj strip."}
          </p>
          <div className={styles.creators}>
            <h2>Autori:</h2>
            <ul className={styles.creatorsList}>
              {comic.creators.items.map((creator) => (
                <li key={creator.resourceURI}>{creator.name}</li>
              ))}
            </ul>
          </div>
          <div className={styles.characters}>
            <h2>Likovi:</h2>
            <ul className={styles.charactersList}>
              {comic.characters.items.slice(0, 10).map((character) => (
                <li key={character.resourceURI}>{character.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetails;
