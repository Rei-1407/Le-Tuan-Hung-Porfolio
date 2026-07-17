import { useEffect, useMemo, useState } from "react";
import type { Block, Page, Project, Site } from "../types/content";
import PageView from "../components/PageView";
import Nav from "../components/Nav";
import { ACTIONS_URL, getFile, putTextFile, verifyToken } from "./github";
import { BACKGROUNDS, PRESETS, THEMES, makeProject } from "./presets";
import BlockEditor, { BLOCK_LABELS } from "./BlockEditor";
import { BilingualField, ImageField, SelectField, TextField } from "./fields";
import "./Admin.css";

const TOKEN_KEY = "portfolio_admin_token";
const SITE_PATH = "src/data/site.json";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "ok"; msg: string }
  | { kind: "error"; msg: string };

export default function Admin({ initialSite }: { initialSite: Site }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);

  const [site, setSite] = useState<Site>(initialSite);
  const [sha, setSha] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [pageId, setPageId] = useState(initialSite.pages[0].id);
  const [preview, setPreview] = useState(false);
  const [picker, setPicker] = useState<string | null>(null); // project id awaiting a new block
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const page = useMemo(() => site.pages.find((p) => p.id === pageId)!, [site, pageId]);

  /* ---- auth + fresh content from the repo (the repo is the source of truth,
         the bundled JSON may be one deploy behind) ---- */
  useEffect(() => {
    if (!token || authed) return;
    setChecking(true);
    (async () => {
      if (await verifyToken(token)) {
        localStorage.setItem(TOKEN_KEY, token);
        setAuthed(true);
        try {
          const { text, sha } = await getFile(token, SITE_PATH);
          setSite(JSON.parse(text));
          setSha(sha);
        } catch {
          setStatus({ kind: "error", msg: "Không đọc được site.json mới nhất — đang dùng bản đóng gói." });
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setStatus({ kind: "error", msg: "Token không hợp lệ hoặc không có quyền push vào repo." });
      }
      setChecking(false);
    })();
  }, [token, authed]);

  const update = (fn: (s: Site) => Site) => {
    setSite(fn);
    setDirty(true);
  };

  const updatePage = (fn: (p: Page) => Page) =>
    update((s) => ({ ...s, pages: s.pages.map((p) => (p.id === pageId ? fn(p) : p)) }));

  const updateProject = (projectId: string, fn: (p: Project) => Project | null) =>
    updatePage((p) => ({
      ...p,
      projects: p.projects
        .map((pr) => (pr.id === projectId ? fn(pr) : pr))
        .filter((pr): pr is Project => pr !== null),
    }));

  const moveBlock = (projectId: string, index: number, dir: -1 | 1) =>
    updateProject(projectId, (pr) => {
      const blocks = [...pr.blocks];
      const j = index + dir;
      if (j < 0 || j >= blocks.length) return pr;
      [blocks[index], blocks[j]] = [blocks[j], blocks[index]];
      return { ...pr, blocks };
    });

  const save = async () => {
    setStatus({ kind: "busy", msg: "Đang lưu lên GitHub..." });
    try {
      const text = JSON.stringify(site, null, 2) + "\n";
      const res = await putTextFile(token, SITE_PATH, text, "content: update via admin", sha);
      setSha(res.sha);
      setDirty(false);
      setStatus({
        kind: "ok",
        msg: "Đã lưu! Site sẽ tự cập nhật sau 1–2 phút.",
      });
    } catch (e) {
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  /* ------------------------------------------------------------- login ---- */
  if (!authed) {
    return (
      <div className="ad-login">
        <div className="ad-login__card">
          <h1>Quản trị portfolio</h1>
          <p>
            Dán GitHub Personal Access Token có quyền <b>Contents: Read &amp; write</b> trên repo{" "}
            <code>Rei-1407/Le-Tuan-Hung-Porfolio</code>.
          </p>
          <ol>
            <li>GitHub → Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b></li>
            <li>Generate new token → Repository access: chọn repo này</li>
            <li>Permissions → Contents → <b>Read and write</b> → Generate</li>
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget).get("token");
              setToken(String(v ?? "").trim());
            }}
          >
            <input name="token" type="password" placeholder="github_pat_..." defaultValue={token} />
            <button type="submit" disabled={checking}>
              {checking ? "Đang kiểm tra..." : "Đăng nhập"}
            </button>
          </form>
          {status.kind === "error" && <p className="ad-error">{status.msg}</p>}
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------- preview ---- */
  if (preview) {
    return (
      <div className="ad-preview">
        <div className="ad-preview__bar">
          <span>Xem trước — {page.navLabel}</span>
          <button type="button" onClick={() => setPreview(false)}>← Quay lại chỉnh sửa</button>
        </div>
        <div className="page">
          <Nav pages={site.pages} />
          <PageView page={page} />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ editor ---- */
  return (
    <div className="ad">
      <header className="ad-top">
        <h1>Quản trị portfolio</h1>
        <div className="ad-top__actions">
          <button type="button" onClick={() => setPreview(true)}>Xem trước</button>
          <button type="button" className="ad-save" disabled={!dirty || status.kind === "busy"} onClick={save}>
            {status.kind === "busy" ? "Đang lưu..." : dirty ? "Đăng thay đổi" : "Đã lưu"}
          </button>
          <button
            type="button"
            className="ad-ghost"
            onClick={() => {
              localStorage.removeItem(TOKEN_KEY);
              setAuthed(false);
              setToken("");
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {status.kind !== "idle" && status.kind !== "busy" && (
        <p className={`ad-status ad-status--${status.kind}`}>
          {status.msg}{" "}
          {status.kind === "ok" && (
            <a href={ACTIONS_URL} target="_blank" rel="noreferrer">Theo dõi deploy →</a>
          )}
        </p>
      )}

      <nav className="ad-tabs">
        {site.pages.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === pageId ? "is-active" : ""}
            onClick={() => setPageId(p.id)}
          >
            {p.navLabel}
          </button>
        ))}
      </nav>

      <section className="ad-panel">
        <h2>Bìa trang (Hero)</h2>
        <div className="ad-row">
          <TextField label="Tiêu đề" value={page.hero.title} onChange={(title) => updatePage((p) => ({ ...p, hero: { ...p.hero, title } }))} />
          <TextField label="Tên" value={page.hero.name} onChange={(name) => updatePage((p) => ({ ...p, hero: { ...p.hero, name } }))} />
          <TextField label="Năm" value={page.hero.year} onChange={(year) => updatePage((p) => ({ ...p, hero: { ...p.hero, year } }))} />
        </div>
        {page.hero.background && (
          <ImageField
            label="Ảnh nền bìa"
            value={page.hero.background}
            token={token}
            onChange={(background) => updatePage((p) => ({ ...p, hero: { ...p.hero, background } }))}
          />
        )}
      </section>

      {page.comingSoon && (
        <section className="ad-panel">
          <h2>Thông báo "đang cập nhật"</h2>
          <BilingualField label="Nội dung" value={page.comingSoon} onChange={(comingSoon) => updatePage((p) => ({ ...p, comingSoon }))} />
        </section>
      )}

      {page.projects.map((pr) => (
        <section key={pr.id} className="ad-panel">
          <header className="ad-panel__head">
            <h2>{pr.header?.vn || pr.id}</h2>
            <button
              type="button"
              className="ad-mini ad-mini--danger"
              onClick={() => {
                if (confirm("Xóa cả dự án này khỏi trang?")) updateProject(pr.id, () => null);
              }}
            >
              Xóa dự án
            </button>
          </header>

          {pr.header && (
            <BilingualField label="Tiêu đề dải" value={pr.header} onChange={(header) => updateProject(pr.id, (x) => ({ ...x, header }))} />
          )}
          <div className="ad-row">
            <SelectField label="Màu dải tiêu đề" value={pr.theme} options={THEMES} onChange={(theme) => updateProject(pr.id, (x) => ({ ...x, theme }))} />
            <SelectField label="Màu nền" value={pr.background} options={BACKGROUNDS} onChange={(background) => updateProject(pr.id, (x) => ({ ...x, background }))} />
          </div>

          <div className="ad-blocks">
            {pr.blocks.map((block, i) => (
              <details key={i} className="ad-block">
                <summary>
                  <span className="ad-block__type">{BLOCK_LABELS[block.type]}</span>
                  <span className="ad-block__tools">
                    <button type="button" className="ad-mini" disabled={i === 0} onClick={(e) => { e.preventDefault(); moveBlock(pr.id, i, -1); }}>↑</button>
                    <button type="button" className="ad-mini" disabled={i === pr.blocks.length - 1} onClick={(e) => { e.preventDefault(); moveBlock(pr.id, i, 1); }}>↓</button>
                    <button
                      type="button"
                      className="ad-mini ad-mini--danger"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm("Xóa khối này?"))
                          updateProject(pr.id, (x) => ({ ...x, blocks: x.blocks.filter((_, j) => j !== i) }));
                      }}
                    >
                      Xóa
                    </button>
                  </span>
                </summary>
                <div className="ad-block__body">
                  <BlockEditor
                    block={block}
                    token={token}
                    onChange={(b: Block) =>
                      updateProject(pr.id, (x) => ({ ...x, blocks: x.blocks.map((bb, j) => (j === i ? b : bb)) }))
                    }
                  />
                </div>
              </details>
            ))}
          </div>

          <button type="button" className="ad-add" onClick={() => setPicker(pr.id)}>
            + Thêm khối nội dung
          </button>
        </section>
      ))}

      <section className="ad-panel ad-panel--new">
        <h2>Thêm dự án mới vào trang này</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const pr = makeProject(
              String(fd.get("vn") || "DỰ ÁN MỚI"),
              String(fd.get("en") || "NEW PROJECT"),
              (fd.get("theme") as Project["theme"]) || "red",
              (fd.get("bg") as Project["background"]) || "red-deep"
            );
            updatePage((p) => ({ ...p, projects: [...p.projects, pr] }));
            e.currentTarget.reset();
          }}
        >
          <div className="ad-row">
            <label className="ad-field"><span>Tên (VN)</span><input name="vn" type="text" placeholder="TÊN DỰ ÁN" /></label>
            <label className="ad-field"><span>Tên (EN)</span><input name="en" type="text" placeholder="PROJECT NAME" /></label>
            <label className="ad-field"><span>Màu dải</span><select name="theme">{THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
            <label className="ad-field"><span>Màu nền</span><select name="bg">{BACKGROUNDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></label>
          </div>
          <button type="submit" className="ad-add">+ Tạo dự án</button>
        </form>
      </section>

      {picker && (
        <div className="ad-modal" onClick={() => setPicker(null)}>
          <div className="ad-modal__card" onClick={(e) => e.stopPropagation()}>
            <h2>Chọn kiểu layout</h2>
            <div className="ad-presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="ad-preset"
                  onClick={() => {
                    updateProject(picker, (x) => ({ ...x, blocks: [...x.blocks, preset.make()] }));
                    setPicker(null);
                  }}
                >
                  <span className="ad-preset__thumb" dangerouslySetInnerHTML={{ __html: preset.thumb }} />
                  <span className="ad-preset__label">{preset.label}</span>
                  <span className="ad-preset__hint">{preset.hint}</span>
                </button>
              ))}
            </div>
            <button type="button" className="ad-ghost" onClick={() => setPicker(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
