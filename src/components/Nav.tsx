import { NavLink } from "react-router-dom";
import type { Page } from "../types/content";
import "./Nav.css";

/** Top bar: 1920x58 on #b21111, items right-aligned, Montserrat 24px.
 *  The active item is ExtraBold, the rest Regular — matching the source file,
 *  where the current page's label measures wider than the others. */
export default function Nav({ pages }: { pages: Page[] }) {
  return (
    <nav className="nav">
      <ul className="nav__list">
        {pages.map((p) => (
          <li key={p.id}>
            <NavLink
              to={p.slug}
              className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}
            >
              {p.navLabel}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
