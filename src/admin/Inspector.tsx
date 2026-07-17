import type { Background, Page, Project, Site, Theme } from "../types/content";
import type { Selection } from "./EditingContext";
import BlockEditor, { BLOCK_LABELS } from "./BlockEditor";
import { BilingualField, ImageField, NumberField, TextField } from "./fields";

/* The right-hand panel: shows the editor for whatever is selected on the
 * canvas. All mutations flow through the callbacks owned by Admin. */

const THEME_SWATCHES: { value: Theme; label: string; color: string }[] = [
  { value: "red", label: "Đỏ", color: "#f90808" },
  { value: "cream", label: "Kem", color: "#ffd481" },
  { value: "navy", label: "Navy", color: "#1a2a72" },
  { value: "green", label: "Xanh lá", color: "#00af26" },
  { value: "dark", label: "Đỏ sẫm", color: "#510608" },
];

const BG_SWATCHES: { value: Background; label: string; css: string }[] = [
  { value: "cream", label: "Kem", css: "#ffd481" },
  { value: "gradient-cream-red", label: "Kem → đỏ", css: "linear-gradient(to bottom,#ffd381,#bc272d)" },
  { value: "red-deep", label: "Đỏ trầm", css: "#bc272d" },
  { value: "maroon", label: "Nâu sẫm", css: "#2f1010" },
  { value: "navy-deep", label: "Navy sẫm", css: "#0f183c" },
  { value: "green-deep", label: "Xanh sẫm", css: "#1a5627" },
];

function Swatches<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; css?: string; color?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="ad-field">
      <span>{label}</span>
      <div className="adx-swatches">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            title={o.label}
            className={"adx-swatch" + (o.value === value ? " is-active" : "")}
            style={{ background: o.css ?? o.color }}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

export interface InspectorProps {
  site: Site;
  page: Page;
  selected: Selection | null;
  token: string;
  updatePage: (fn: (p: Page) => Page) => void;
  updateProject: (projectId: string, fn: (p: Project) => Project | null) => void;
  moveBlock: (projectId: string, index: number, dir: -1 | 1) => void;
  clearSelection: () => void;
}

export default function Inspector(props: InspectorProps) {
  const { site, page, selected, token, updatePage, updateProject, moveBlock, clearSelection } = props;

  /* ---- nothing selected: page settings + how-to ---- */
  if (!selected) {
    return (
      <div className="adx-inspector">
        <h2>Trang: {page.navLabel}</h2>
        <TextField
          label="Tên hiển thị trên thanh menu"
          value={page.navLabel}
          onChange={(navLabel) => updatePage((p) => ({ ...p, navLabel }))}
        />
        <div className="adx-hint">
          <p><b>👈 Bấm vào bất kỳ phần nào</b> trên trang bên trái để sửa phần đó:</p>
          <ul>
            <li>Ảnh bìa và tiêu đề lớn</li>
            <li>Dải tiêu đề màu của từng dự án</li>
            <li>Từng khối ảnh / chữ / video</li>
          </ul>
          <p>Nút <b>«+ Thêm khối nội dung»</b> nằm cuối mỗi dự án, <b>«+ Thêm dự án mới»</b> nằm cuối trang.</p>
          <p>Sửa xong nhớ bấm <b>Đăng thay đổi</b> ở góc phải trên.</p>
        </div>
      </div>
    );
  }

  /* ---- hero ---- */
  if (selected.kind === "hero") {
    const hero = page.hero;
    const set = (patch: Partial<Page["hero"]>) =>
      updatePage((p) => ({ ...p, hero: { ...p.hero, ...patch } }));
    return (
      <div className="adx-inspector">
        <InspectorHead title="Ảnh bìa trang" onClose={clearSelection} />
        <TextField label="Tiêu đề lớn" value={hero.title} onChange={(title) => set({ title })} />
        <div className="ad-row">
          <TextField label="Tên" value={hero.name} onChange={(name) => set({ name })} />
          <TextField label="Năm" value={hero.year} onChange={(year) => set({ year })} />
        </div>
        {hero.background && (
          <ImageField
            label="Ảnh nền"
            value={hero.background}
            token={token}
            onChange={(background) => set({ background })}
          />
        )}
        <label className="ad-field">
          <span>Độ tối lớp phủ: {(hero.overlay * 100).toFixed(0)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={hero.overlay * 100}
            onChange={(e) => set({ overlay: Number(e.target.value) / 100 })}
          />
        </label>
        <Swatches
          label="Căn tiêu đề"
          value={hero.align}
          options={[
            { value: "center" as const, label: "Giữa", css: "#3a4048" },
            { value: "left" as const, label: "Trái", css: "#3a4048" },
          ]}
          onChange={(align) => set({ align })}
        />
        <p className="ad-note">Căn hiện tại: {hero.align === "center" ? "giữa" : "trái"}</p>
      </div>
    );
  }

  /* ---- coming soon ---- */
  if (selected.kind === "soon") {
    if (!page.comingSoon) return null;
    return (
      <div className="adx-inspector">
        <InspectorHead title="Thông báo «đang cập nhật»" onClose={clearSelection} />
        <BilingualField
          label="Nội dung"
          value={page.comingSoon}
          onChange={(comingSoon) => updatePage((p) => ({ ...p, comingSoon }))}
        />
      </div>
    );
  }

  const project = page.projects.find((p) => p.id === selected.projectId);
  if (!project) return null;

  /* ---- project header strip ---- */
  if (selected.kind === "header") {
    return (
      <div className="adx-inspector">
        <InspectorHead title="Dải tiêu đề dự án" onClose={clearSelection} />
        {project.header && (
          <BilingualField
            label="Tiêu đề"
            value={project.header}
            onChange={(header) => updateProject(project.id, (x) => ({ ...x, header }))}
          />
        )}
        <Swatches
          label="Màu dải tiêu đề"
          value={project.theme}
          options={THEME_SWATCHES}
          onChange={(theme) => updateProject(project.id, (x) => ({ ...x, theme }))}
        />
        <Swatches
          label="Màu nền cả khu dự án"
          value={project.background}
          options={BG_SWATCHES}
          onChange={(background) => updateProject(project.id, (x) => ({ ...x, background }))}
        />
        <hr className="adx-hr" />
        <button
          type="button"
          className="ad-mini ad-mini--danger"
          onClick={() => {
            if (confirm(`Xóa toàn bộ dự án «${project.header?.vn ?? project.id}» khỏi trang?`)) {
              clearSelection();
              updateProject(project.id, () => null);
            }
          }}
        >
          🗑 Xóa cả dự án này
        </button>
      </div>
    );
  }

  /* ---- block ---- */
  const block = project.blocks[selected.index];
  if (!block) return null;

  return (
    <div className="adx-inspector">
      <InspectorHead title={BLOCK_LABELS[block.type]} onClose={clearSelection} />
      <div className="adx-toolbar">
        <button
          type="button"
          className="ad-mini"
          disabled={selected.index === 0}
          onClick={() => moveBlock(project.id, selected.index, -1)}
        >
          ↑ Chuyển lên
        </button>
        <button
          type="button"
          className="ad-mini"
          disabled={selected.index === project.blocks.length - 1}
          onClick={() => moveBlock(project.id, selected.index, 1)}
        >
          ↓ Chuyển xuống
        </button>
        <button
          type="button"
          className="ad-mini ad-mini--danger"
          onClick={() => {
            if (confirm("Xóa khối này?")) {
              clearSelection();
              updateProject(project.id, (x) => ({
                ...x,
                blocks: x.blocks.filter((_, j) => j !== selected.index),
              }));
            }
          }}
        >
          🗑 Xóa khối
        </button>
      </div>
      <NumberField
        label="Khoảng cách phía trên (px thiết kế)"
        value={block.mt ?? 0}
        onChange={(mt) =>
          updateProject(project.id, (x) => ({
            ...x,
            blocks: x.blocks.map((b, j) => (j === selected.index ? { ...b, mt } : b)),
          }))
        }
      />
      <hr className="adx-hr" />
      <BlockEditor
        block={block}
        token={token}
        onChange={(b) =>
          updateProject(project.id, (x) => ({
            ...x,
            blocks: x.blocks.map((bb, j) => (j === selected.index ? b : bb)),
          }))
        }
      />
      <p className="ad-note">Trang: {site.pages.findIndex((p) => p.id === page.id) + 1} / {site.pages.length}</p>
    </div>
  );
}

function InspectorHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="adx-inspector__head">
      <h2>{title}</h2>
      <button type="button" className="ad-mini" onClick={onClose}>✕ Bỏ chọn</button>
    </div>
  );
}
