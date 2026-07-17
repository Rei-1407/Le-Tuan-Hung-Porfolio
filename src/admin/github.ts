/* Thin GitHub Contents API client. The admin has no backend: every save is a
 * commit to this repo made with the owner's personal access token, and the
 * Pages workflow redeploys the site from it. */

export const OWNER = "Rei-1407";
export const REPO = "Le-Tuan-Hung-Porfolio";
export const BRANCH = "main";

const API = "https://api.github.com";

async function gh(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** True when the token can push to the portfolio repo. */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const repo = await gh(token, `/repos/${OWNER}/${REPO}`);
    return Boolean(repo.permissions?.push);
  } catch {
    return false;
  }
}

function b64encodeUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64decodeUtf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Reads a text file from the repo. Returns its parsed content and blob sha
 *  (needed to commit an update later). */
export async function getFile(
  token: string,
  path: string
): Promise<{ text: string; sha: string }> {
  const data = await gh(
    token,
    `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`
  );
  return { text: b64decodeUtf8(data.content), sha: data.sha };
}

/** Creates or updates a file. Pass `sha` when updating an existing file. */
export async function putFile(
  token: string,
  path: string,
  base64Content: string,
  message: string,
  sha?: string
): Promise<{ sha: string }> {
  const data = await gh(token, `/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  return { sha: data.content.sha };
}

export function putTextFile(
  token: string,
  path: string,
  text: string,
  message: string,
  sha?: string
) {
  return putFile(token, path, b64encodeUtf8(text), message, sha);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Uploads an image into public/assets/uploads and returns its site path. */
export async function uploadImage(
  token: string,
  file: File
): Promise<string> {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const name = `${Date.now()}-${safe}`;
  const base64 = await fileToBase64(file);
  await putFile(
    token,
    `public/assets/uploads/${name}`,
    base64,
    `content: upload ${name} via admin`
  );
  return `/assets/uploads/${name}`;
}

/** Link to the Actions tab so the owner can watch the redeploy. */
export const ACTIONS_URL = `https://github.com/${OWNER}/${REPO}/actions`;
