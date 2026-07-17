import { useEffect } from "react";
import type { Page } from "../types/content";
import { asset } from "../lib/asset";
import Hero from "./Hero";
import ProjectSection from "./ProjectSection";
import "./PageView.css";

export default function PageView({ page }: { page: Page }) {
  useEffect(() => {
    window.scrollTo(0, 0);
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
        <section className="pageview__soon">
          <p className="pageview__soon-vn">{page.comingSoon.vn}</p>
          <p className="pageview__soon-en">{page.comingSoon.en}</p>
        </section>
      )}
    </main>
  );
}
