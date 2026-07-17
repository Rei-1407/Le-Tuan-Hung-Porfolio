import { useRef, useState } from "react";
import type { Bilingual, Media, PlacedMedia } from "../types/content";
import { asset, assetOverrides } from "../lib/asset";
import { uploadImage } from "./github";

/* Small reusable form controls for the admin editors. */

export function TextField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="ad-field ad-field--num">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BilingualField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Bilingual;
  onChange: (v: Bilingual) => void;
  multiline?: boolean;
}) {
  return (
    <div className="ad-bilingual">
      <TextField
        label={`${label} (VN)`}
        value={value.vn}
        multiline={multiline}
        onChange={(vn) => onChange({ ...value, vn })}
      />
      <TextField
        label={`${label} (EN)`}
        value={value.en}
        multiline={multiline}
        onChange={(en) => onChange({ ...value, en })}
      />
    </div>
  );
}

/** Image thumbnail + replace-by-upload. The file is committed to the repo the
 *  moment it is picked; the preview map makes it visible instantly. */
export function ImageField<T extends Media | PlacedMedia>({
  label,
  value,
  onChange,
  token,
}: {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  token: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const path = await uploadImage(token, file);
      assetOverrides.set(path, URL.createObjectURL(file));
      onChange({ ...value, src: path });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ad-image">
      {label && <span className="ad-image__label">{label}</span>}
      <div
        className="ad-image__row"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith("image/")) pick(f);
        }}
      >
        <img
          src={asset(value.src)}
          alt={value.alt}
          title="Bấm hoặc kéo-thả ảnh mới vào đây"
          onClick={() => fileRef.current?.click()}
        />
        <div className="ad-image__meta">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "⏳ Đang tải lên..." : "🖼 Thay ảnh này"}
          </button>
          <input
            type="text"
            value={value.alt}
            placeholder="Ghi chú ảnh (không bắt buộc)"
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          {error && <p className="ad-error">{error}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
