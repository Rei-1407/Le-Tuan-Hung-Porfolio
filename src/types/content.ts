/* Content schema.
 *
 * Everything the site renders comes from src/data/site.json, which follows
 * these types. The admin panel writes the same shape back to the repo, so a
 * block added from the browser and a block written by hand are identical.
 *
 * All geometry values (x, y, w, h, gaps, insets, margins) are in design
 * pixels on the 1920px Figma canvas; the CSS `--u` unit scales them.
 *
 * Adding a new layout = add a variant here + a renderer in components/blocks +
 * a preset in admin/presets.ts. Nothing else needs to change.
 */

export type Theme = "red" | "cream" | "navy" | "green" | "dark";

export type Background =
  | "cream"
  | "gradient-cream-red"
  | "red-deep"
  | "maroon"
  | "navy-deep"
  | "green-deep";

export interface Bilingual {
  vn: string;
  en: string;
}

export interface Media {
  /** Path under public/, e.g. "/assets/branding/product-burger.png" */
  src: string;
  alt: string;
}

/** An image inside a grid cell / split cell / free canvas. When `pos` is set
 *  the image is placed at those design-pixel offsets relative to its cell;
 *  otherwise it fills the cell. */
export interface PlacedMedia extends Media {
  pos?: { x: number; y: number; w: number; h: number };
}

/* ---------------------------------------------------------------- blocks -- */

interface BlockBase {
  /** Margin above this block, design px. May be negative for overlaps. */
  mt?: number;
}

/** Centred floating heading, e.g. "SẢN PHẨM (PRODUCT)". */
export interface SectionTitleBlock extends BlockBase {
  type: "section-title";
  text: string;
  /** Optional second line. */
  text2?: string;
}

/** Uniform grid. "card" wraps each cell in a white rounded panel (square),
 *  "bare" lets the images themselves fill the cells. */
export interface ImageGridBlock extends BlockBase {
  type: "image-grid";
  columns: 2 | 3 | 4;
  style: "card" | "bare";
  inset?: number;
  colGap?: number;
  rowGap?: number;
  cells: { images: PlacedMedia[] }[];
}

/** One image, `w` wide, `inset` from the left. */
export interface BannerBlock extends BlockBase {
  type: "banner";
  media: Media;
  inset: number;
  w: number;
}

/** Vietnamese line(s) over the English translation.
 *  `[[r:...]]` renders in the brand font in red, `[[b:...]]` in the brand font
 *  in the current text colour. `\n` breaks lines. */
export interface BilingualTextBlock extends BlockBase {
  type: "bilingual-text";
  text: Bilingual;
  align: "left" | "center" | "justify";
  size?: number;
  inset?: number;
}

/** A row of differently-sized cells — covers the avatar/cover pair, the
 *  standee+banner pair, the Facebook post pair, the white guideline cards
 *  (single wide cell with positioned images), and the logo lockup row. */
export interface SplitBlock extends BlockBase {
  type: "split";
  inset: number;
  gap: number;
  cells: {
    w: number;
    h: number;
    style: "card" | "bare";
    images: PlacedMedia[];
    caption?: Bilingual;
  }[];
  /** Caption centred under the whole row (the FB posts pair). */
  caption?: Bilingual;
  captionMt?: number;
}

/** Bottom-aligned run of cut-out illustrations (the mascot row). */
export interface MascotRowBlock extends BlockBase {
  type: "mascot-row";
  inset: number;
  items: (Media & { w: number; h: number })[];
}

export interface VideoBlock extends BlockBase {
  type: "video";
  poster: Media;
  /** YouTube id, or a path under public/ for a self-hosted file. */
  youtubeId?: string;
  src?: string;
  inset: number;
  w: number;
  h: number;
}

/** Absolutely-positioned composition for the few sections that stagger cards
 *  and images outside any grid. `card: true` draws the white rounded panel. */
export interface FreeBlock extends BlockBase {
  type: "free";
  height: number;
  items: {
    media?: Media;
    card?: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
}

/** The HOTNDOGS identity board: fixed composition, editable content. */
export interface BrandInfoBlock extends BlockBase {
  type: "brand-info";
  logo: Media;
  packaging: Media;
  fieldLabel: string;
  fieldBody: Bilingual;
  meaningLabel: string;
  meaningBody: Bilingual;
  visionLabel: string;
  vision: Bilingual;
  mission: Bilingual;
  ctaLabel: string;
}

/** Footer strip that repeats one icon lockup across the width. */
export interface IconStripBlock extends BlockBase {
  type: "icon-strip";
  media: Media;
  count: number;
}

export type Block =
  | SectionTitleBlock
  | ImageGridBlock
  | BannerBlock
  | BilingualTextBlock
  | SplitBlock
  | MascotRowBlock
  | VideoBlock
  | FreeBlock
  | BrandInfoBlock
  | IconStripBlock;

export type BlockType = Block["type"];

/* ----------------------------------------------------------------- pages -- */

/** Artwork drawn over a header strip at fixed design-pixel offsets
 *  (the HOTNDOGS snack icons, the A+Math corner wedges). Decorative only. */
export interface Decoration {
  media: Media;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A run of blocks on a shared background, optionally opened by the
 *  1920x135 themed title strip. */
export interface Project {
  id: string;
  header?: Bilingual;
  theme: Theme;
  headerLogo?: Media;
  headerWordmark?: string;
  headerDecorations?: Decoration[];
  background: Background;
  blocks: Block[];
  /** Padding under the last block, design px. */
  pb?: number;
}

export interface Hero {
  title: string;
  name: string;
  year: string;
  background?: Media;
  /** Scrim opacity 0–1. The source covers use 0.7. */
  overlay: number;
  align: "center" | "left";
}

export interface Page {
  id: string;
  slug: string;
  navLabel: string;
  hero: Hero;
  projects: Project[];
  /** Shown after the projects (or alone) while the page has no content. */
  comingSoon?: Bilingual;
}

export interface Site {
  siteName: string;
  pages: Page[];
}
