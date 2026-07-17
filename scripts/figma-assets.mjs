/* Downloads every image the design needs, straight from the Figma source file.
 *
 *   FIGMA_TOKEN=figd_xxx node scripts/figma-assets.mjs
 *
 * Uses the Figma REST API (available on every plan, rate-limited separately
 * from the MCP server). Each manifest entry is a node id read out of the
 * Portfolio file; the API renders that node exactly as it appears on the
 * canvas, so what lands in public/assets is the real artwork.
 *
 * Re-running is safe: existing files are overwritten in place.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FILE_KEY, MANIFEST } from "./manifest.mjs";

const TOKEN = process.env.FIGMA_TOKEN;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");

if (!TOKEN) {
  console.error(
    "\n  FIGMA_TOKEN is not set.\n\n" +
      "  Create one at: Figma -> your avatar -> Settings -> Security ->\n" +
      "  Personal access tokens -> Generate new token (File content: Read).\n\n" +
      "  Then run:\n" +
      "    FIGMA_TOKEN=figd_xxx node scripts/figma-assets.mjs\n"
  );
  process.exit(1);
}

const api = async (path) => {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": TOKEN },
  });
  if (!res.ok) {
    throw new Error(`Figma API ${res.status} ${res.statusText} on ${path}\n${await res.text()}`);
  }
  return res.json();
};

/* The images endpoint takes many ids per call but a single scale, so group by
   export scale first. */
const groups = new Map();
for (const entry of MANIFEST) {
  const scale = entry.scale ?? 2;
  if (!groups.has(scale)) groups.set(scale, []);
  groups.get(scale).push(entry);
}

let done = 0;
let failed = 0;

for (const [scale, entries] of groups) {
  for (let i = 0; i < entries.length; i += 20) {
    const chunk = entries.slice(i, i + 20);
    const ids = chunk.map((e) => e.id).join(",");
    const { images, err } = await api(
      `/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`
    );
    if (err) throw new Error(`Figma render error: ${err}`);

    await Promise.all(
      chunk.map(async (entry) => {
        const url = images[entry.id];
        if (!url) {
          console.warn(`  ! no render returned for ${entry.id} -> ${entry.out}`);
          failed++;
          return;
        }
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`  ! download failed for ${entry.out} (${res.status})`);
          failed++;
          return;
        }
        const dest = join(OUT, entry.out);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, Buffer.from(await res.arrayBuffer()));
        done++;
        console.log(`  ok ${entry.out}`);
      })
    );
  }
}

console.log(`\n  ${done}/${MANIFEST.length} assets written to public/assets`);
if (failed) {
  console.log(`  ${failed} failed — re-run to retry.`);
  process.exit(1);
}
