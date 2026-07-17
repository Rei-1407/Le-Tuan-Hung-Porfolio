import type { Project } from "../types/content";
import BlockRenderer from "./blocks/Blocks";
import SectionHeader from "./SectionHeader";
import "./ProjectSection.css";

export default function ProjectSection({ project }: { project: Project }) {
  return (
    <section className="project" id={project.id}>
      {project.header && <SectionHeader project={project} />}
      <div className="project__body" data-bg={project.background}>
        {project.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
        {project.pb !== undefined && <div style={{ height: `calc(${project.pb} * var(--u))` }} />}
      </div>
    </section>
  );
}
