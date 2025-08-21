import { Link } from "react-router-dom";
import styles from "./ComicItem.module.scss";

function buildImg(comic) {
  const { thumbnail, title } = comic || {};
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
    alt: title || "Marvel strip",
    sizes: "(max-width: 600px) 45vw, 200px",
    width: 168,
    height: 252,
  };
}

const ComicItem = ({ comic }) => {
  const img = buildImg(comic);

  return (
    <Link
      to={`/comic/${comic.id}`}
      className={styles.comicItem}
      aria-label={`Detalji: ${comic.title || "Nepoznato ime"}`}
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
      <h4 className={styles.title}>{comic.title || "Nepoznato ime"}</h4>
    </Link>
  );
};

export default ComicItem;
