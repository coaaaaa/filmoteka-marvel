import { Link } from "react-router-dom";
import SearchInput from "../SearchInput/SearchInput";
import logo from "../../assets/logo.svg";
import styles from "./Header.module.scss";

const Header = ({ onSearch }) => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoLink}>
        <img src={logo} alt="Marvel Series" className={styles.logo} />
      </Link>
      <div className={styles.searchContainer}>
        <SearchInput onSearch={onSearch} />
      </div>
    </header>
  );
};

export default Header;
