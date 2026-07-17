import type { Block, Project, Theme, Background } from "../types/content";

/* Layout presets offered by the "Thêm khối" picker. Each one is a bootstrapped
 * block matching a composition that exists in the Figma file, so anything added
 * through the admin stays on-design. The thumb is a tiny wireframe SVG. */

const PLACEHOLDER = "/assets/placeholder.png";
const img = (alt = "Ảnh mới") => ({ src: PLACEHOLDER, alt });

export interface Preset {
  id: string;
  label: string;
  hint: string;
  thumb: string; // inline SVG
  make: () => Block;
}

const box = (x: number, y: number, w: number, h: number, rx = 4) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="currentColor" opacity="0.5"/>`;

const svg = (inner: string) =>
  `<svg viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const PRESETS: Preset[] = [
  {
    id: "grid-2",
    label: "Lưới 2 cột",
    hint: "Như trang e-brochure Con Rồng Cháu Tiên",
    thumb: svg(box(8, 8, 50, 26) + box(62, 8, 50, 26) + box(8, 38, 50, 26) + box(62, 38, 50, 26)),
    make: () => ({
      type: "image-grid",
      mt: 48,
      columns: 2,
      style: "bare",
      inset: 135,
      colGap: 33,
      rowGap: 26,
      cells: [{ images: [img()] }, { images: [img()] }],
    }),
  },
  {
    id: "grid-3-card",
    label: "Lưới 3 cột — thẻ trắng",
    hint: "Như khu Sản phẩm HOTNDOGS",
    thumb: svg(
      box(8, 16, 32, 40) + box(44, 16, 32, 40) + box(80, 16, 32, 40)
    ),
    make: () => ({
      type: "image-grid",
      mt: 48,
      columns: 3,
      style: "card",
      inset: 125,
      colGap: 42,
      rowGap: 33,
      cells: [{ images: [img()] }, { images: [img()] }, { images: [img()] }],
    }),
  },
  {
    id: "grid-4",
    label: "Lưới 4 cột",
    hint: "Như hàng poster game / ảnh giáo viên",
    thumb: svg(
      box(6, 16, 24, 40) + box(34, 16, 24, 40) + box(62, 16, 24, 40) + box(90, 16, 24, 40)
    ),
    make: () => ({
      type: "image-grid",
      mt: 48,
      columns: 4,
      style: "bare",
      inset: 142,
      colGap: 36,
      rowGap: 36,
      cells: [
        { images: [img()] },
        { images: [img()] },
        { images: [img()] },
        { images: [img()] },
      ],
    }),
  },
  {
    id: "banner",
    label: "Banner lớn",
    hint: "Một ảnh trải rộng vùng nội dung",
    thumb: svg(box(8, 20, 104, 32)),
    make: () => ({
      type: "banner",
      mt: 48,
      media: img("Banner"),
      inset: 135,
      w: 1648,
    }),
  },
  {
    id: "avatar-cover",
    label: "Nhỏ trái + rộng phải",
    hint: "Như cặp Avatar / Ảnh bìa A+Math (kèm chú thích)",
    thumb: svg(box(8, 14, 30, 30) + box(44, 14, 68, 30) + box(14, 50, 18, 6, 2) + box(66, 50, 18, 6, 2)),
    make: () => ({
      type: "split",
      mt: 48,
      inset: 142,
      gap: 45,
      cells: [
        { w: 440, h: 440, style: "bare", images: [img()], caption: { vn: "Chú thích", en: "Caption" } },
        { w: 1156, h: 440, style: "bare", images: [img()], caption: { vn: "Chú thích", en: "Caption" } },
      ],
    }),
  },
  {
    id: "pair-caption",
    label: "To trái + đứng phải",
    hint: "Như cặp bài đăng Facebook (chú thích chung ở dưới)",
    thumb: svg(box(8, 10, 66, 44) + box(80, 10, 32, 44) + box(46, 60, 28, 6, 2)),
    make: () => ({
      type: "split",
      mt: 48,
      inset: 137,
      gap: 42,
      cells: [
        { w: 1092, h: 685, style: "bare", images: [img()] },
        { w: 512, h: 682, style: "bare", images: [img()] },
      ],
      caption: { vn: "Chú thích", en: "Caption" },
      captionMt: 41,
    }),
  },
  {
    id: "collage",
    label: "Collage 3 ảnh",
    hint: "1 to trái + 1 dọc phải + 1 ngang dưới",
    thumb: svg(box(8, 8, 62, 26) + box(8, 38, 62, 26) + box(74, 8, 38, 56)),
    make: () => ({
      type: "split",
      mt: 48,
      inset: 282,
      gap: 50,
      cells: [
        {
          w: 809,
          h: 983,
          style: "bare",
          images: [
            { ...img(), pos: { x: 0, y: 0, w: 809, h: 393 } },
            { ...img(), pos: { x: 0, y: 441, w: 809, h: 542 } },
          ],
        },
        { w: 497, h: 983, style: "bare", images: [{ ...img(), pos: { x: 0, y: 0, w: 497, h: 983 } }] },
      ],
    }),
  },
  {
    id: "text",
    label: "Văn bản song ngữ",
    hint: "Dòng tiếng Việt đậm + bản dịch tiếng Anh",
    thumb: svg(box(14, 22, 92, 8, 2) + box(24, 38, 72, 7, 2)),
    make: () => ({
      type: "bilingual-text",
      mt: 48,
      align: "center",
      size: 24,
      text: { vn: "Nội dung tiếng Việt", en: "English content" },
    }),
  },
  {
    id: "section-title",
    label: "Tiêu đề khu vực",
    hint: "Dòng tiêu đề in đậm, căn giữa",
    thumb: svg(box(26, 30, 68, 12, 2)),
    make: () => ({ type: "section-title", mt: 60, text: "TIÊU ĐỀ (TITLE)" }),
  },
  {
    id: "video",
    label: "Video",
    hint: "YouTube hoặc file MP4, kèm ảnh poster",
    thumb: svg(
      box(8, 10, 104, 52) +
        `<path d="M52 26 L74 36 L52 46 Z" fill="currentColor"/>`
    ),
    make: () => ({
      type: "video",
      mt: 48,
      poster: img("Video poster"),
      inset: 135,
      w: 1648,
      h: 927,
    }),
  },
];

export const THEMES: { value: Theme; label: string }[] = [
  { value: "red", label: "Đỏ (HOTNDOGS)" },
  { value: "cream", label: "Kem" },
  { value: "navy", label: "Navy (A+Math)" },
  { value: "green", label: "Xanh lá (Posters)" },
  { value: "dark", label: "Đỏ sẫm (E-brochure)" },
];

export const BACKGROUNDS: { value: Background; label: string }[] = [
  { value: "cream", label: "Kem" },
  { value: "gradient-cream-red", label: "Gradient kem → đỏ" },
  { value: "red-deep", label: "Đỏ trầm" },
  { value: "maroon", label: "Nâu đỏ sẫm" },
  { value: "navy-deep", label: "Navy sẫm" },
  { value: "green-deep", label: "Xanh lá sẫm" },
];

export function makeProject(headerVn: string, headerEn: string, theme: Theme, background: Background): Project {
  return {
    id: `project-${Date.now()}`,
    header: { vn: headerVn, en: headerEn },
    theme,
    background,
    blocks: [],
    pb: 80,
  };
}
