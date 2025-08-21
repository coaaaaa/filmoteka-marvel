import styles from "./SeriesList.module.scss";
import SeriesItem from "../SeriesItem/SeriesItem";

const SeriesList = ({ series, onSort, sortOption }) => {
  return (
    <div>
      <div className={styles.controls}>
        <select
          onChange={onSort}
          value={sortOption}
          className={styles.sortSelect}
        >
          <option value="" disabled hidden>
            Filtriraj:
          </option>
          <option value="title">Po nazivu</option>
          <option value="startYear">Po godini</option>
        </select>
      </div>
      <div className={styles.grid}>
        {series.map((serie) => (
          <SeriesItem key={serie.id} series={serie} />
        ))}
      </div>
    </div>
  );
};

export default SeriesList;
