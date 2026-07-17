import type {
  BannerBlock,
  BilingualTextBlock,
  Block,
  BrandInfoBlock,
  FreeBlock,
  IconStripBlock,
  ImageGridBlock,
  MascotRowBlock,
  PlacedMedia,
  SectionTitleBlock,
  SplitBlock,
  VideoBlock,
} from "../../types/content";
import { asset } from "../../lib/asset";
import { rich } from "../../lib/richtext";
import Reveal from "../Reveal";
import "./Blocks.css";

const u = (n: number) => `calc(${n} * var(--u))`;

function PlacedImg({ img }: { img: PlacedMedia }) {
  if (!img.pos) {
    return <img className="blk-fill" src={asset(img.src)} alt={img.alt} loading="lazy" />;
  }
  const { x, y, w, h } = img.pos;
  return (
    <img
      className="blk-placed"
      src={asset(img.src)}
      alt={img.alt}
      loading="lazy"
      style={{ left: u(x), top: u(y), width: u(w), height: u(h) }}
    />
  );
}

/* ---------------------------------------------------------------- blocks -- */

function SectionTitle({ b }: { b: SectionTitleBlock }) {
  return (
    <Reveal>
      <h2 className="blk-title">
        {b.text}
        {b.text2 && (
          <>
            <br />
            {b.text2}
          </>
        )}
      </h2>
    </Reveal>
  );
}

function ImageGrid({ b }: { b: ImageGridBlock }) {
  const inset = b.inset ?? 132;
  return (
    <div
      className="blk-grid"
      data-style={b.style}
      style={{
        paddingLeft: u(inset),
        paddingRight: u(inset),
        gridTemplateColumns: `repeat(${b.columns}, 1fr)`,
        columnGap: u(b.colGap ?? 40),
        rowGap: u(b.rowGap ?? 33),
      }}
    >
      {b.cells.map((cell, i) => (
        <Reveal key={i} className="blk-grid__cell" style={{ transitionDelay: `${(i % b.columns) * 90}ms` }}>
          {cell.images.map((img, j) => (
            <PlacedImg key={j} img={img} />
          ))}
        </Reveal>
      ))}
    </div>
  );
}

function Banner({ b }: { b: BannerBlock }) {
  return (
    <Reveal>
      <div className="blk-banner" style={{ marginLeft: u(b.inset), width: u(b.w) }}>
        <img src={asset(b.media.src)} alt={b.media.alt} loading="lazy" />
      </div>
    </Reveal>
  );
}

function BilingualText({ b }: { b: BilingualTextBlock }) {
  const inset = b.inset ?? 132;
  const size = b.size ?? 24;
  return (
    <Reveal>
      <div
        className="blk-text"
        style={{
          paddingLeft: u(inset),
          paddingRight: u(inset),
          fontSize: u(size),
          textAlign: b.align,
        }}
      >
        <p className="blk-text__vn">{rich(b.text.vn)}</p>
        <p className="blk-text__en">{rich(b.text.en)}</p>
      </div>
    </Reveal>
  );
}

function Caption({ c }: { c: { vn: string; en: string } }) {
  return (
    <div className="blk-caption">
      <p className="blk-caption__vn">{c.vn}</p>
      <p className="blk-caption__en">{c.en}</p>
    </div>
  );
}

function Split({ b }: { b: SplitBlock }) {
  return (
    <>
      {/* Only the left inset is padded — cells carry fixed design widths, so a
          right padding would overflow the 1920px canvas and wrap the row. */}
      <div className="blk-split" style={{ paddingLeft: u(b.inset), gap: u(b.gap) }}>
        {b.cells.map((cell, i) => (
          <Reveal key={i} className="blk-split__col" style={{ width: u(cell.w), transitionDelay: `${i * 90}ms` }}>
            <div
              className="blk-split__cell"
              data-style={cell.style}
              style={{ height: u(cell.h) }}
            >
              {cell.images.map((img, j) => (
                <PlacedImg key={j} img={img} />
              ))}
            </div>
            {cell.caption && <Caption c={cell.caption} />}
          </Reveal>
        ))}
      </div>
      {b.caption && (
        /* Rendered after the flex row; Caption brings its own 27px top margin,
           so only the difference is added here. */
        <div style={{ marginTop: u((b.captionMt ?? 40) - 27) }}>
          <Caption c={b.caption} />
        </div>
      )}
    </>
  );
}

function MascotRow({ b }: { b: MascotRowBlock }) {
  return (
    <div className="blk-mascots" style={{ paddingLeft: u(b.inset), paddingRight: u(b.inset) }}>
      {b.items.map((m, i) => (
        <Reveal key={i} style={{ transitionDelay: `${i * 110}ms` }}>
          <img
            className="blk-mascots__img"
            src={asset(m.src)}
            alt={m.alt}
            loading="lazy"
            style={{ width: u(m.w), height: u(m.h) }}
          />
        </Reveal>
      ))}
    </div>
  );
}

function Video({ b }: { b: VideoBlock }) {
  return (
    <Reveal>
      <div className="blk-video" style={{ marginLeft: u(b.inset), width: u(b.w), height: u(b.h) }}>
        {b.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${b.youtubeId}`}
            title={b.poster.alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : b.src ? (
          <video src={asset(b.src)} poster={asset(b.poster.src)} controls />
        ) : (
          <img src={asset(b.poster.src)} alt={b.poster.alt} loading="lazy" />
        )}
      </div>
    </Reveal>
  );
}

function Free({ b }: { b: FreeBlock }) {
  return (
    <div className="blk-free" style={{ height: u(b.height) }}>
      {b.items.map((item, i) => (
        <Reveal
          key={i}
          className="blk-free__item"
          style={{
            left: u(item.x),
            top: u(item.y),
            width: u(item.w),
            height: u(item.h),
            transitionDelay: `${i * 60}ms`,
          }}
        >
          {item.card && <div className="blk-free__card" />}
          {item.media && (
            <img src={asset(item.media.src)} alt={item.media.alt} loading="lazy" />
          )}
        </Reveal>
      ))}
    </div>
  );
}

function IconStrip({ b }: { b: IconStripBlock }) {
  return (
    <div className="blk-iconstrip">
      {Array.from({ length: b.count }, (_, i) => (
        <img key={i} src={asset(b.media.src)} alt="" aria-hidden="true" loading="lazy" />
      ))}
    </div>
  );
}

/* The HOTNDOGS identity board. Geometry is fixed to the source composition
   (band origin 0,1031 on the canvas); every offset below is design px relative
   to the band. Copy and imagery come from the block data. */
function BrandInfo({ b }: { b: BrandInfoBlock }) {
  return (
    <div className="blk-brand">
      <Reveal className="blk-brand__logo">
        <img src={asset(b.logo.src)} alt={b.logo.alt} />
      </Reveal>

      <Reveal className="blk-brand__pill blk-brand__pill--field">
        <span>{b.fieldLabel}</span>
      </Reveal>
      <div className="blk-brand__fieldbody">
        <p className="blk-brand__vn-sm">{rich(b.fieldBody.vn)}</p>
        <p className="blk-brand__en-sm">{rich(b.fieldBody.en)}</p>
      </div>

      <Reveal className="blk-brand__pill blk-brand__pill--meaning">
        <span>{b.meaningLabel}</span>
      </Reveal>
      <p className="blk-brand__meaning-vn">{rich(b.meaningBody.vn)}</p>
      <p className="blk-brand__meaning-en">{rich(b.meaningBody.en)}</p>

      <Reveal className="blk-brand__pill blk-brand__pill--vision">
        <span>{b.visionLabel}</span>
      </Reveal>
      <p className="blk-brand__vision-vn">{rich(b.vision.vn)}</p>
      <p className="blk-brand__vision-en">{rich(b.vision.en)}</p>
      <p className="blk-brand__mission-vn">{rich(b.mission.vn)}</p>
      <p className="blk-brand__mission-en">{rich(b.mission.en)}</p>

      <Reveal className="blk-brand__packaging">
        <img src={asset(b.packaging.src)} alt={b.packaging.alt} />
      </Reveal>

      <a className="blk-brand__cta" href="#explore" onClick={(e) => {
        e.preventDefault();
        const band = (e.currentTarget.closest(".project") as HTMLElement)?.nextElementSibling
          ?? e.currentTarget.closest(".blk-brand")?.parentElement?.nextElementSibling;
        band?.scrollIntoView({ behavior: "smooth" });
      }}>
        <span className="blk-brand__cta-pill">{b.ctaLabel}</span>
        <span className="blk-brand__cta-circle">
          <svg viewBox="0 0 18 10" width="18" height="10">
            <path d="M1 1l8 7 8-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </a>
    </div>
  );
}

/* -------------------------------------------------------------- dispatch -- */

export default function BlockRenderer({ block }: { block: Block }) {
  const style = block.mt !== undefined ? { marginTop: u(block.mt) } : undefined;
  const body = (() => {
    switch (block.type) {
      case "section-title":
        return <SectionTitle b={block} />;
      case "image-grid":
        return <ImageGrid b={block} />;
      case "banner":
        return <Banner b={block} />;
      case "bilingual-text":
        return <BilingualText b={block} />;
      case "split":
        return <Split b={block} />;
      case "mascot-row":
        return <MascotRow b={block} />;
      case "video":
        return <Video b={block} />;
      case "free":
        return <Free b={block} />;
      case "brand-info":
        return <BrandInfo b={block} />;
      case "icon-strip":
        return <IconStrip b={block} />;
    }
  })();
  return <div style={style}>{body}</div>;
}
