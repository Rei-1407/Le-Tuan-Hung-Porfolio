import type { Hero as HeroData } from "../types/content";
import "./Hero.css";

/** Cover: 1920x840 artwork, a flat dark scrim over it, then the title stack.
 *  The name/year row is exactly as wide as the title above it — in Figma both
 *  share the same bounding box on every cover, so the content column simply
 *  shrink-wraps the title and the row spreads across it. */
export default function Hero({ data }: { data: HeroData }) {
  return (
    <header className="hero">
      {data.background && (
        <img className="hero__bg" src={data.background.src} alt={data.background.alt} />
      )}
      <div className="hero__scrim" style={{ opacity: data.overlay }} />
      <div className="hero__inner" data-align={data.align}>
        <div className="hero__content">
          <h1 className="hero__title">{data.title}</h1>
          <div className="hero__row">
            <span>{data.name}</span>
            <span>{data.year}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
