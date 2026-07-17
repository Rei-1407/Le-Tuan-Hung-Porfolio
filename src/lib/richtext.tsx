import type { ReactNode } from "react";

/** Renders the tiny inline markup used in site.json copy:
 *    [[r:HOTNDOGS]] — brand font, brand red (the wordmark inside sentences)
 *    [[b:HOT]]      — brand font, inherits the text colour
 *    \n             — line break
 *  Everything else is plain text. */
export function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  for (const line of text.split("\n")) {
    if (key > 0) out.push(<br key={`br${key++}`} />);
    const re = /\[\[(r|b):(.+?)\]\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index));
      out.push(
        <span key={key++} className={m[1] === "r" ? "u-brand u-red" : "u-brand"}>
          {m[2]}
        </span>
      );
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push(line.slice(last));
    key++;
  }
  return out;
}
