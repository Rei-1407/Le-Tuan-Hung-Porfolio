/* Generates temporary stand-in images by cropping the low-resolution frame
 * screenshots in scripts/ref. They are real crops of the actual design — just
 * soft, because the references are ~28% scale. Running figma-assets.mjs with a
 * FIGMA_TOKEN overwrites all of them with crisp originals.
 *
 *   node scripts/gen-placeholders.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMES, MANIFEST } from "./manifest.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REF = join(ROOT, "scripts", "ref");
const OUT = join(ROOT, "public", "assets");

const refs = {};
for (const [name, frame] of Object.entries(FRAMES)) {
  const img = sharp(join(REF, frame.ref));
  const meta = await img.metadata();
  refs[name] = { img: join(REF, frame.ref), scale: meta.width / frame.w, meta };
}

let done = 0;
for (const entry of MANIFEST) {
  const ref = refs[entry.frame];
  const s = ref.scale;
  const left = Math.max(0, Math.round(entry.x * s));
  const top = Math.max(0, Math.round(entry.y * s));
  const width = Math.min(ref.meta.width - left, Math.max(1, Math.round(entry.w * s)));
  const height = Math.min(ref.meta.height - top, Math.max(1, Math.round(entry.h * s)));

  const dest = join(OUT, entry.out);
  await mkdir(dirname(dest), { recursive: true });
  await sharp(ref.img)
    .extract({ left, top, width, height })
    .resize(Math.round(entry.w), Math.round(entry.h), { fit: "fill" })
    .png()
    .toFile(dest);
  done++;
}

console.log(`${done}/${MANIFEST.length} placeholder assets written to public/assets`);
