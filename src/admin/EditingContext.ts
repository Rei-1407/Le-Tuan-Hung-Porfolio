import { createContext, useContext } from "react";

/* When the admin renders the live page as an editing canvas, this context is
 * provided so page components become click-to-select. On the public site the
 * context is absent and the components behave exactly as normal. */

export type Selection =
  | { kind: "hero" }
  | { kind: "header"; projectId: string }
  | { kind: "block"; projectId: string; index: number }
  | { kind: "soon" };

export interface Editing {
  selected: Selection | null;
  select: (s: Selection) => void;
  addBlock: (projectId: string) => void;
  addProject: () => void;
}

export const EditingContext = createContext<Editing | null>(null);

export const useEditing = () => useContext(EditingContext);

export const sameSelection = (a: Selection | null, b: Selection): boolean => {
  if (!a || a.kind !== b.kind) return false;
  if (a.kind === "header" && b.kind === "header") return a.projectId === b.projectId;
  if (a.kind === "block" && b.kind === "block")
    return a.projectId === b.projectId && a.index === b.index;
  return true;
};
