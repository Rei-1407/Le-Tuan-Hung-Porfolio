import type { Project } from "../types/content";
import { asset } from "../lib/asset";
import { rich } from "../lib/richtext";
import "./SectionHeader.css";

/** The 1920x135 title strip that opens every project.
 *  Figma puts the Vietnamese line 39px down and the English line 68px down on
 *  every instance of this bar, so the geometry is shared and only the theme,
 *  copy and ornaments change. */
export default function SectionHeader({ project }: { project: Project }) {
  const { header, theme, headerLogo, headerWordmark, headerDecorations } = project;

  return (
    <div className="sheader" data-theme={theme}>
      {headerLogo && (
        <div className="sheader__brand">
          <img className="sheader__logo" src={asset(headerLogo.src)} alt={headerLogo.alt} />
          {headerWordmark && <span className="sheader__wordmark u-brand">{headerWordmark}</span>}
        </div>
      )}

      <div className="sheader__titles">
        <p className="sheader__vn">{header && rich(header.vn)}</p>
        <p className="sheader__en">{header && rich(header.en)}</p>
      </div>

      {headerDecorations?.map((d, i) => (
        <img
          key={i}
          className="sheader__deco"
          src={asset(d.media.src)}
          alt=""
          aria-hidden="true"
          style={{
            left: `calc(${d.x} * var(--u))`,
            top: `calc(${d.y} * var(--u))`,
            width: `calc(${d.w} * var(--u))`,
            height: `calc(${d.h} * var(--u))`,
          }}
        />
      ))}
    </div>
  );
}
