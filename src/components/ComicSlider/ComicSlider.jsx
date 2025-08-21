import { useState } from "react";
import ComicItem from "../ComicItem/ComicItem";
import styles from "./ComicSlider.module.scss";

const ComicSlider = ({ comics }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextComics = () => {
    if (currentIndex + 5 < comics.length) {
      setCurrentIndex(currentIndex + 5);
    }
  };

  const prevComics = () => {
    if (currentIndex - 5 >= 0) {
      setCurrentIndex(currentIndex - 5);
    }
  };

  return (
    <div className={styles.slider}>
      <button
        onClick={prevComics}
        className={`${styles.arrowButton} ${styles.prev}`}
        disabled={currentIndex === 0}
      >
        &lt;
      </button>
      <div className={styles.comics}>
        {comics.slice(currentIndex, currentIndex + 5).map((comic) => (
          <ComicItem key={comic.id || comic.resourceURI} comic={comic} />
        ))}
      </div>
      <button
        onClick={nextComics}
        className={`${styles.arrowButton} ${styles.next}`}
        disabled={currentIndex + 5 >= comics.length}
      >
        &gt;
      </button>
    </div>
  );
};

export default ComicSlider;
