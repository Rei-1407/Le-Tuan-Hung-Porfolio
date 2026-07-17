/* One-off: read exact section colours out of the reference screenshots. */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REF = join(dirname(fileURLToPath(import.meta.url)), "ref");

const POINTS = {
  "graphic2d.png": [
    ["brochure-header-a", 300, 950],
    ["brochure-header-b", 1600, 950],
    ["amath-header-a", 300, 4110],
    ["amath-header-b", 960, 4160],
    ["amath-header-c", 1600, 4110],
    ["amath-deco-left", 60, 4060],
    ["green-header-b", 300, 6080],
    ["footer-bg", 300, 6760],
    ["footer-bg2", 960, 6820],
  ],
  "branding.png": [
    ["footer-strip-a", 500, 7250],
    ["footer-strip-b", 960, 7320],
    ["animlogo-b", 500, 6500],
  ],
};

for (const [file, pts] of Object.entries(POINTS)) {
  const img = sharp(join(REF, file));
  const meta = await img.metadata();
  const scale = meta.width / 1920;
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  for (const [name, dx, dy] of pts) {
    const x = Math.min(info.width - 1, Math.round(dx * scale));
    const y = Math.min(info.height - 1, Math.round(dy * scale));
    const i = (y * info.width + x) * info.channels;
    const hex = `#${[data[i], data[i + 1], data[i + 2]]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
    console.log(`${file}  ${name.padEnd(18)} ${hex}`);
  }
}
