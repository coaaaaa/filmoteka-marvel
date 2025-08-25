import { Link } from "react-router-dom";
import styles from "./SeriesItem.module.scss";

function buildImg(series) {
  const { thumbnail, title } = series || {};
  const path = thumbnail?.path || "";
  const ext = thumbnail?.extension || "jpg";

  const isNA = path.includes("image_not_available") || !path;
  const srcBase = isNA ? "/placeholder-portrait" : `${path}`;
  const src = isNA ? `${srcBase}.png` : `${srcBase}/standard_fantastic.${ext}`;
  const srcSet = isNA
    ? undefined
    : [
        `${srcBase}/standard_large.${ext} 1x`,
        `${srcBase}/standard_xlarge.${ext} 2x`,
      ].join(", ");

  return {
    src,
    srcSet,
    alt: title || "Marvel serija",
    sizes: "(max-width: 600px) 45vw, 200px",
    width: 168,
    height: 252,
  };
}

const SeriesItem = ({ series }) => {
  const img = buildImg(series);
  return (
    <article className={styles.item}>
      <Link
        to={`/series/${series.id}`}
        className={styles.linkArea}
        aria-label={`Otvori detalje za ${series.title}`}
      >
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.sizes}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
          className={styles.image}
        />
        <h3 className={styles.title}>{series.title}</h3>
        <span className={styles.detailsButton} role="button" aria-hidden="true">
          Pogledaj detaljno
        </span>
      </Link>
    </article>
  );
};

export default SeriesItem;
