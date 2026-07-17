import type { Block, PlacedMedia } from "../types/content";
import { BilingualField, ImageField, NumberField, SelectField, TextField } from "./fields";

/* One form per block type. Every editor receives the block and returns a new
 * block through onChange — state lives in the Admin root. */

function ImagesList({
  images,
  onChange,
  token,
  allowAdd,
}: {
  images: PlacedMedia[];
  onChange: (imgs: PlacedMedia[]) => void;
  token: string;
  allowAdd?: boolean;
}) {
  return (
    <div className="ad-images">
      {images.map((im, i) => (
        <div key={i} className="ad-images__item">
          <ImageField
            value={im}
            token={token}
            onChange={(v) => onChange(images.map((x, j) => (j === i ? v : x)))}
          />
          {allowAdd && images.length > 1 && (
            <button
              type="button"
              className="ad-mini ad-mini--danger"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
            >
              Xóa ảnh
            </button>
          )}
        </div>
      ))}
      {allowAdd && (
        <button
          type="button"
          className="ad-mini"
          onClick={() =>
            onChange([...images, { src: "/assets/placeholder.png", alt: "Ảnh mới" }])
          }
        >
          + Thêm ảnh vào ô này
        </button>
      )}
    </div>
  );
}

export default function BlockEditor({
  block,
  onChange,
  token,
}: {
  block: Block;
  onChange: (b: Block) => void;
  token: string;
}) {
  switch (block.type) {
    case "section-title":
      return (
        <>
          <TextField label="Tiêu đề" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <TextField
            label="Dòng 2 (tùy chọn)"
            value={block.text2 ?? ""}
            onChange={(text2) => onChange({ ...block, text2: text2 || undefined })}
          />
        </>
      );

    case "bilingual-text":
      return (
        <>
          <BilingualField label="Nội dung" multiline value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <div className="ad-row">
            <SelectField
              label="Căn lề"
              value={block.align}
              options={[
                { value: "left", label: "Trái" },
                { value: "center", label: "Giữa" },
                { value: "justify", label: "Đều hai bên" },
              ]}
              onChange={(align) => onChange({ ...block, align })}
            />
            <NumberField label="Cỡ chữ" value={block.size ?? 24} onChange={(size) => onChange({ ...block, size })} />
          </div>
        </>
      );

    case "image-grid":
      return (
        <>
          <div className="ad-row">
            <SelectField
              label="Số cột"
              value={String(block.columns) as "2" | "3" | "4"}
              options={[
                { value: "2", label: "2 cột" },
                { value: "3", label: "3 cột" },
                { value: "4", label: "4 cột" },
              ]}
              onChange={(v) => onChange({ ...block, columns: Number(v) as 2 | 3 | 4 })}
            />
            <SelectField
              label="Kiểu ô"
              value={block.style}
              options={[
                { value: "bare", label: "Ảnh trần" },
                { value: "card", label: "Thẻ trắng" },
              ]}
              onChange={(style) => onChange({ ...block, style })}
            />
          </div>
          {block.cells.map((cell, i) => (
            <details key={i} className="ad-cell">
              <summary>
                Ô {i + 1}
                <button
                  type="button"
                  className="ad-mini ad-mini--danger"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange({ ...block, cells: block.cells.filter((_, j) => j !== i) });
                  }}
                >
                  Xóa ô
                </button>
              </summary>
              <ImagesList
                images={cell.images}
                token={token}
                allowAdd
                onChange={(images) =>
                  onChange({
                    ...block,
                    cells: block.cells.map((c, j) => (j === i ? { images } : c)),
                  })
                }
              />
            </details>
          ))}
          <button
            type="button"
            className="ad-mini"
            onClick={() =>
              onChange({
                ...block,
                cells: [...block.cells, { images: [{ src: "/assets/placeholder.png", alt: "Ảnh mới" }] }],
              })
            }
          >
            + Thêm ô
          </button>
        </>
      );

    case "banner":
      return <ImageField label="Ảnh banner" value={block.media} token={token} onChange={(media) => onChange({ ...block, media })} />;

    case "split":
      return (
        <>
          {block.cells.map((cell, i) => (
            <details key={i} className="ad-cell">
              <summary>Ô {i + 1} ({cell.w}×{cell.h})</summary>
              <ImagesList
                images={cell.images}
                token={token}
                onChange={(images) =>
                  onChange({
                    ...block,
                    cells: block.cells.map((c, j) => (j === i ? { ...c, images } : c)),
                  })
                }
              />
              {cell.caption && (
                <BilingualField
                  label="Chú thích"
                  value={cell.caption}
                  onChange={(caption) =>
                    onChange({
                      ...block,
                      cells: block.cells.map((c, j) => (j === i ? { ...c, caption } : c)),
                    })
                  }
                />
              )}
            </details>
          ))}
          {block.caption && (
            <BilingualField label="Chú thích chung" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} />
          )}
        </>
      );

    case "mascot-row":
      return (
        <div className="ad-images">
          {block.items.map((it, i) => (
            <ImageField
              key={i}
              value={it}
              token={token}
              onChange={(v) =>
                onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, ...v } : x)) })
              }
            />
          ))}
        </div>
      );

    case "video":
      return (
        <>
          <TextField
            label="YouTube ID (vd: dQw4w9WgXcQ — để trống nếu chưa có)"
            value={block.youtubeId ?? ""}
            onChange={(v) => onChange({ ...block, youtubeId: v || undefined })}
          />
          <TextField
            label="Hoặc đường dẫn file video trong repo (vd: /assets/videos/clip.mp4)"
            value={block.src ?? ""}
            onChange={(v) => onChange({ ...block, src: v || undefined })}
          />
          <ImageField label="Ảnh poster" value={block.poster} token={token} onChange={(poster) => onChange({ ...block, poster })} />
        </>
      );

    case "free":
      return (
        <div className="ad-images">
          <p className="ad-note">Bố cục tự do — chỉ thay được ảnh, vị trí giữ nguyên theo thiết kế.</p>
          {block.items.map((it, i) =>
            it.media ? (
              <ImageField
                key={i}
                value={it.media}
                token={token}
                onChange={(media) =>
                  onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, media } : x)) })
                }
              />
            ) : null
          )}
        </div>
      );

    case "brand-info":
      return (
        <>
          <ImageField label="Logo chính" value={block.logo} token={token} onChange={(logo) => onChange({ ...block, logo })} />
          <ImageField label="Ảnh bao bì" value={block.packaging} token={token} onChange={(packaging) => onChange({ ...block, packaging })} />
          <TextField label="Nhãn cột 1" value={block.fieldLabel} onChange={(fieldLabel) => onChange({ ...block, fieldLabel })} />
          <BilingualField label="Lĩnh vực" multiline value={block.fieldBody} onChange={(fieldBody) => onChange({ ...block, fieldBody })} />
          <TextField label="Nhãn cột 2" value={block.meaningLabel} onChange={(meaningLabel) => onChange({ ...block, meaningLabel })} />
          <BilingualField label="Ý nghĩa logo" multiline value={block.meaningBody} onChange={(meaningBody) => onChange({ ...block, meaningBody })} />
          <TextField label="Nhãn cột 3" value={block.visionLabel} onChange={(visionLabel) => onChange({ ...block, visionLabel })} />
          <BilingualField label="Tầm nhìn" multiline value={block.vision} onChange={(vision) => onChange({ ...block, vision })} />
          <BilingualField label="Sứ mệnh" multiline value={block.mission} onChange={(mission) => onChange({ ...block, mission })} />
          <TextField label="Nút CTA" value={block.ctaLabel} onChange={(ctaLabel) => onChange({ ...block, ctaLabel })} />
        </>
      );

    case "icon-strip":
      return (
        <>
          <ImageField label="Cụm icon" value={block.media} token={token} onChange={(media) => onChange({ ...block, media })} />
          <NumberField label="Số lần lặp" value={block.count} onChange={(count) => onChange({ ...block, count })} />
        </>
      );
  }
}

export const BLOCK_LABELS: Record<Block["type"], string> = {
  "section-title": "Tiêu đề khu vực",
  "image-grid": "Lưới ảnh",
  banner: "Banner",
  "bilingual-text": "Văn bản song ngữ",
  split: "Hàng ảnh tùy biến",
  "mascot-row": "Hàng mascot",
  video: "Video",
  free: "Bố cục tự do",
  "brand-info": "Bảng nhận diện thương hiệu",
  "icon-strip": "Dải icon",
};
