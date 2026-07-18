/* Rebuilds the 12 branding assets that need REAL transparency (white icons on
 * the red band, mascots on cream, both logos, the 10%-opacity packaging art).
 *
 * Why this exists: the Figma MCP `download_assets` export FLATTENS alpha onto
 * white, so those nodes cannot be taken from the rendered export. Instead we
 * use the *raw source images* (`rawImages` in the download_assets response —
 * these keep their alpha) plus the white backing vectors behind the mascots
 * (asset URLs from `get_design_context`), and recompose them here. All the
 * geometry (rotations, flips, crops, offsets) is transcribed from the node
 * metadata / design context of file cOlXV8ARFTUoFnxj8gWwm7.
 *
 * To rerun: re-fetch the raw images into a folder (names used below:
 * r1243-1, r1248, r1249, r1250, r1258-1, r12110-1, r21106-1, r21107-1,
 * r21108-1, r21112-1, vec21098, vecA21102, vecA21104, vecA21110) and point
 * SRC at it:  SRC=path node scripts/rebuild-transparent.mjs
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const S = process.env.SRC ?? "./figma-raw";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "branding");
const T = { r: 0, g: 0, b: 0, alpha: 0 };

const buf = (p) => sharp(join(S, p));
const canvas = (w, h) => sharp({ create: { width: w, height: h, channels: 4, background: T } });

// resize (+optional flip/flop) in pass 1, rotate in pass 2 so the order
// matches the CSS transform (scale first, then rotate)
async function piece(file, w, h, { flop = false, flip = false, rotate = 0, fit = "fill", position = "centre" } = {}) {
  let s = buf(file).resize(w, h, { fit, position });
  if (flop) s = s.flop();
  if (flip) s = s.flip();
  let b = await s.png().toBuffer();
  if (rotate) b = await sharp(b).rotate(rotate, { background: T }).png().toBuffer();
  return b;
}

async function save(name, w, h, pieces) {
  const comp = [];
  for (const p of pieces) {
    const meta = await sharp(p.buf).metadata();
    comp.push({ input: p.buf, left: Math.min(p.left, w - meta.width < 0 ? p.left : w - meta.width), top: p.top });
  }
  await canvas(w, h).composite(comp).png().toFile(join(OUT, name));
  const m = await sharp(join(OUT, name)).metadata();
  console.log("ok", name, m.width + "x" + m.height);
}

const run = async () => {
  // --- hero header icons (scale 4). Same composition as footer Group 7:
  // fries flipped horizontally, hotdog rotated -26.45deg, burger flipY+150deg
  await save("header-icon-1.png", 224, 284, [
    { buf: await piece("r1248.png", 224, 284, { flop: true }), left: 0, top: 0 },
  ]);
  await save("header-icon-2.png", 370, 338, [
    { buf: await piece("r1249.png", 300, 228, { rotate: -26.45 }), left: 0, top: 0 },
  ]);
  await save("header-icon-3.png", 339, 339, [
    { buf: await piece("r1250.png", 248, 248, { flip: true, rotate: 150 }), left: 0, top: 0 },
  ]);

  // --- logos: raw artwork already carries its white fills
  await buf("r1243-1.png").resize(512, 513).png().toFile(join(OUT, "logo-mark.png"));
  console.log("ok logo-mark.png 512x513");
  await buf("r1258-1.png").png().toFile(join(OUT, "logo-main.png"));
  console.log("ok logo-main.png 1557x1128");

  // --- packaging: clip right 22 design px (node 474 -> visible 452), then
  // bake the design's 10% opacity into the alpha channel
  {
    const raw = buf("r12110-1.png"); // 1326x1364 == 474 design px wide
    const clipped = await raw.extract({ left: 0, top: 0, width: 1264, height: 1364 }).png().toBuffer();
    const alpha = await sharp(clipped).extractChannel(3).linear(0.1, 0).toBuffer();
    await sharp(clipped).removeAlpha().joinChannel(alpha).png().toFile(join(OUT, "packaging.png"));
    console.log("ok packaging.png 1264x1364 (opacity 0.1 baked)");
  }

  // --- mascots (scale 2): white backing vector underneath, line art on top
  await save("mascot-1.png", 485, 605, [
    { buf: await piece("vec21098.png", 350, 598), left: 59, top: 2 },
    { buf: await piece("r21108-1.png", 485, 605, { fit: "cover", position: "top" }), left: 0, top: 0 },
  ]);
  await save("mascot-2.png", 577, 603, [
    { buf: await piece("vecA21102.png", 569, 597), left: 6, top: 6 },
    { buf: await piece("r21107-1.png", 577, 602, { fit: "cover", position: "top" }), left: 0, top: 0 },
  ]);
  await save("mascot-3.png", 499, 488, [
    { buf: await piece("vecA21110.png", 491, 482), left: 6, top: 5 },
    { buf: await piece("r21112-1.png", 499, 488, { fit: "cover", position: "top" }), left: 0, top: 0 },
  ]);
  await save("mascot-4.png", 817, 605, [
    { buf: await piece("vecA21104.png", 556, 323), left: 6, top: 165 },
    { buf: await piece("r21106-1.png", 817, 605, { fit: "cover", position: "top" }), left: 0, top: 0 },
  ]);

  // --- footer icon strip, Group 7 geometry at scale 3 (canvas 277.69x84.69)
  await save("footer-icon-group.png", 833, 254, [
    { buf: await piece("r1248.png", 168, 213, { flop: true }), left: 0, top: 0 },
    { buf: await piece("r1249.png", 225, 171, { rotate: -26.45 }), left: 249, top: 0 },
    { buf: await piece("r1250.png", 186, 186, { flip: true, rotate: 150 }), left: 579, top: 0 },
  ]);

  // --- comm logo lockups, Group 13 geometry at scale 2 (canvas 491.82x150)
  const lockup = [
    { buf: await piece("r1248.png", 198, 252, { flop: true }), left: 0, top: 0 },
    { buf: await piece("r1249.png", 265, 202, { rotate: -26.45 }), left: 294, top: 0 },
    { buf: await piece("r1250.png", 219, 219, { flip: true, rotate: 150 }), left: 683, top: 0 },
  ];
  await save("logo-group-1.png", 984, 300, lockup);
  await save("logo-group-2.png", 984, 300, lockup);
};

run().catch((e) => { console.error(e); process.exit(1); });
