import { useEffect } from "react";
import type { Page } from "../types/content";
import { asset } from "../lib/asset";
import { sameSelection, useEditing } from "../admin/EditingContext";
import Hero from "./Hero";
import ProjectSection from "./ProjectSection";
import "./PageView.css";

export default function PageView({ page }: { page: Page }) {
  const editing = useEditing();

  useEffect(() => {
    if (!editing) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  return (
    <main className="pageview" key={page.id}>
      <Hero
        data={{
          ...page.hero,
          background: page.hero.background
            ? { ...page.hero.background, src: asset(page.hero.background.src) }
            : undefined,
        }}
      />
      {page.projects.map((p) => (
        <ProjectSection key={p.id} project={p} />
      ))}
      {page.comingSoon && (
        <section
          className="pageview__soon"
          data-edit={editing ? "true" : undefined}
          data-selected={editing && sameSelection(editing.selected, { kind: "soon" }) ? "true" : undefined}
          onClickCapture={editing ? (e) => { e.preventDefault(); editing.select({ kind: "soon" }); } : undefined}
        >
          <p className="pageview__soon-vn">{page.comingSoon.vn}</p>
          <p className="pageview__soon-en">{page.comingSoon.en}</p>
        </section>
      )}
      {editing && (
        <button type="button" className="edit-add edit-add--project" onClick={() => editing.addProject()}>
          + Thêm dự án mới vào trang này
        </button>
      )}
    </main>
  );
}
