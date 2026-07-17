/** Images just uploaded from the admin exist in the repo but not yet in the
 *  deployed bundle. The admin registers a preview URL here so its live preview
 *  shows them immediately; the public site never populates this map. */
export const assetOverrides = new Map<string, string>();

/** Resolves a "/assets/..." path from site.json against the Vite base URL, so
 *  the same JSON works locally and under the GitHub Pages sub-path. */
export function asset(path: string): string {
  const override = assetOverrides.get(path);
  if (override) return override;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
