import type { Project } from "../types/content";
import BlockRenderer from "./blocks/Blocks";
import SectionHeader from "./SectionHeader";
import { sameSelection, useEditing } from "../admin/EditingContext";
import "./ProjectSection.css";

export default function ProjectSection({ project }: { project: Project }) {
  const editing = useEditing();

  return (
    <section className="project" id={project.id}>
      {project.header && <SectionHeader project={project} />}
      <div className="project__body" data-bg={project.background}>
        {project.blocks.map((block, i) => {
          const rendered = <BlockRenderer key={i} block={block} />;
          if (!editing) return rendered;
          const sel = { kind: "block", projectId: project.id, index: i } as const;
          return (
            <div
              key={i}
              data-edit="true"
              data-selected={sameSelection(editing.selected, sel) ? "true" : undefined}
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editing.select(sel);
              }}
            >
              {rendered}
            </div>
          );
        })}
        {editing && (
          <button
            type="button"
            className="edit-add"
            onClick={() => editing.addBlock(project.id)}
          >
            + Thêm khối nội dung
          </button>
        )}
        {project.pb !== undefined && <div style={{ height: `calc(${project.pb} * var(--u))` }} />}
      </div>
    </section>
  );
}
