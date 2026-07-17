import { useEffect, useMemo, useRef, useState } from "react";
import type { Page, Project, Site } from "../types/content";
import PageView from "../components/PageView";
import Nav from "../components/Nav";
import { ACTIONS_URL, getFile, latestRunStatus, putTextFile, verifyToken } from "./github";
import { PRESETS, makeProject } from "./presets";
import { EditingContext, type Selection } from "./EditingContext";
import Inspector from "./Inspector";
import "./Admin.css";

const TOKEN_KEY = "portfolio_admin_token";
const SITE_PATH = "src/data/site.json";
const TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=repo&description=Portfolio%20Admin";

type Publish =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "building" }
  | { state: "done" }
  | { state: "error"; msg: string };

export default function Admin({ initialSite }: { initialSite: Site }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [site, setSite] = useState<Site>(initialSite);
  const [sha, setSha] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [pageId, setPageId] = useState(initialSite.pages[0].id);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [picker, setPicker] = useState<string | null>(null);
  const [publish, setPublish] = useState<Publish>({ state: "idle" });

  const undoStack = useRef<Site[]>([]);
  const redoStack = useRef<Site[]>([]);
  const lastPush = useRef(0);
  const [, forceHistoryRender] = useState(0);

  const page = useMemo(
    () => site.pages.find((p) => p.id === pageId) ?? site.pages[0],
    [site, pageId]
  );

  /* ---- auth, then pull the freshest content from the repo ---- */
  useEffect(() => {
    if (!token || authed) return;
    setChecking(true);
    setLoginError("");
    (async () => {
      if (await verifyToken(token)) {
        localStorage.setItem(TOKEN_KEY, token);
        setAuthed(true);
        try {
          const f = await getFile(token, SITE_PATH);
          setSite(JSON.parse(f.text));
          setSha(f.sha);
        } catch {
          /* fall back to the bundled copy — still editable and savable */
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setLoginError(
          "Token không hợp lệ hoặc không có quyền với repo. Kiểm tra lại bước tạo token nhé."
        );
      }
      setChecking(false);
    })();
  }, [token, authed]);

  /* ---- warn before closing with unsaved edits ---- */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  /* ---- history ---- */
  const update = (fn: (s: Site) => Site) => {
    setSite((prev) => {
      const now = Date.now();
      // Coalesce rapid keystrokes into a single undo step.
      if (now - lastPush.current > 800 || undoStack.current.length === 0) {
        undoStack.current.push(prev);
        if (undoStack.current.length > 80) undoStack.current.shift();
      }
      lastPush.current = now;
      redoStack.current = [];
      return fn(prev);
    });
    setDirty(true);
    forceHistoryRender((n) => n + 1);
  };

  const undo = () => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setSite((cur) => {
      redoStack.current.push(cur);
      return prev;
    });
    setDirty(true);
    forceHistoryRender((n) => n + 1);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    setSite((cur) => {
      undoStack.current.push(cur);
      return next;
    });
    setDirty(true);
    forceHistoryRender((n) => n + 1);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ---- mutations shared with the inspector ---- */
  const updatePage = (fn: (p: Page) => Page) =>
    update((s) => ({ ...s, pages: s.pages.map((p) => (p.id === pageId ? fn(p) : p)) }));

  const updateProject = (projectId: string, fn: (p: Project) => Project | null) =>
    updatePage((p) => ({
      ...p,
      projects: p.projects
        .map((pr) => (pr.id === projectId ? fn(pr) : pr))
        .filter((pr): pr is Project => pr !== null),
    }));

  const moveBlock = (projectId: string, index: number, dir: -1 | 1) => {
    updateProject(projectId, (pr) => {
      const blocks = [...pr.blocks];
      const j = index + dir;
      if (j < 0 || j >= blocks.length) return pr;
      [blocks[index], blocks[j]] = [blocks[j], blocks[index]];
      return { ...pr, blocks };
    });
    setSelected({ kind: "block", projectId, index: index + dir });
  };

  /* ---- publish ---- */
  const save = async () => {
    setPublish({ state: "saving" });
    try {
      const text = JSON.stringify(site, null, 2) + "\n";
      const res = await putTextFile(token, SITE_PATH, text, "content: update via admin", sha);
      setSha(res.sha);
      setDirty(false);
      setPublish({ state: "building" });
      // Follow the Pages build so the owner knows when it's really live.
      const deadline = Date.now() + 5 * 60_000;
      const poll = async () => {
        if (Date.now() > deadline) {
          setPublish({ state: "done" });
          return;
        }
        const run = await latestRunStatus(token);
        if (run?.status === "completed") {
          setPublish(
            run.conclusion === "success"
              ? { state: "done" }
              : { state: "error", msg: "Build thất bại — thử Đăng lại, hoặc báo dev." }
          );
          return;
        }
        setTimeout(poll, 8000);
      };
      setTimeout(poll, 8000);
    } catch (e) {
      setPublish({ state: "error", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  /* ------------------------------------------------------------- login ---- */
  if (!authed) {
    return (
      <div className="ad-login">
        <div className="ad-login__card">
          <h1>🎨 Quản trị portfolio</h1>
          <p>Đăng nhập một lần bằng «chìa khóa» GitHub — trình duyệt sẽ ghi nhớ cho những lần sau.</p>
          <ol>
            <li>
              <a href={TOKEN_URL} target="_blank" rel="noreferrer">
                <b>Bấm vào đây để mở trang tạo chìa khóa</b>
              </a>{" "}
              (đăng nhập GitHub nếu được hỏi)
            </li>
            <li>Kéo xuống cuối trang, bấm nút xanh <b>Generate token</b></li>
            <li>Copy dòng mã hiện ra (bắt đầu bằng <code>ghp_</code>) và dán vào ô dưới</li>
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget).get("token");
              setToken(String(v ?? "").trim());
            }}
          >
            <input name="token" type="password" placeholder="Dán chìa khóa vào đây..." autoFocus />
            <button type="submit" disabled={checking}>
              {checking ? "Đang kiểm tra..." : "Vào quản trị"}
            </button>
          </form>
          {loginError && <p className="ad-error">{loginError}</p>}
          <p className="ad-note" style={{ marginTop: 14 }}>
            Chìa khóa chỉ lưu trong trình duyệt này. Ai không có chìa khóa thì không sửa được gì.
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ editor ---- */
  return (
    <div className="adx">
      <header className="adx-top">
        <div className="adx-top__left">
          <span className="adx-logo">🎨 Quản trị</span>
          <nav className="ad-tabs">
            {site.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                className={p.id === pageId ? "is-active" : ""}
                onClick={() => {
                  setPageId(p.id);
                  setSelected(null);
                }}
              >
                {p.navLabel}
              </button>
            ))}
          </nav>
        </div>
        <div className="adx-top__right">
          <button type="button" className="ad-mini" disabled={undoStack.current.length === 0} onClick={undo} title="Ctrl+Z">
            ↩ Hoàn tác
          </button>
          <button type="button" className="ad-mini" disabled={redoStack.current.length === 0} onClick={redo} title="Ctrl+Shift+Z">
            ↪ Làm lại
          </button>
          <PublishBadge publish={publish} />
          <button
            type="button"
            className="ad-save"
            disabled={!dirty || publish.state === "saving"}
            onClick={save}
          >
            {publish.state === "saving" ? "Đang lưu..." : dirty ? "🚀 Đăng thay đổi" : "✓ Đã lưu hết"}
          </button>
          <button
            type="button"
            className="ad-ghost"
            onClick={() => {
              if (dirty && !confirm("Có thay đổi chưa đăng. Vẫn đăng xuất?")) return;
              localStorage.removeItem(TOKEN_KEY);
              setAuthed(false);
              setToken("");
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="adx-main">
        <div
          className="adx-canvas"
          onClickCapture={(e) => {
            // The canvas is for selecting, not navigating.
            const t = e.target as HTMLElement;
            if (t.closest("a")) e.preventDefault();
          }}
        >
          <EditingContext.Provider
            value={{
              selected,
              select: setSelected,
              addBlock: (projectId) => setPicker(projectId),
              addProject: () => {
                const pr = makeProject("DỰ ÁN MỚI", "NEW PROJECT", "red", "red-deep");
                updatePage((p) => ({ ...p, projects: [...p.projects, pr] }));
                setSelected({ kind: "header", projectId: pr.id });
              },
            }}
          >
            <div className="page">
              <Nav pages={site.pages} />
              <PageView page={page} />
            </div>
          </EditingContext.Provider>
        </div>

        <aside className="adx-side">
          <Inspector
            site={site}
            page={page}
            selected={selected}
            token={token}
            updatePage={updatePage}
            updateProject={updateProject}
            moveBlock={moveBlock}
            clearSelection={() => setSelected(null)}
          />
        </aside>
      </div>

      {picker && (
        <div className="ad-modal" onClick={() => setPicker(null)}>
          <div className="ad-modal__card" onClick={(e) => e.stopPropagation()}>
            <h2>Chọn kiểu layout cho khối mới</h2>
            <div className="ad-presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="ad-preset"
                  onClick={() => {
                    const projectId = picker;
                    updateProject(projectId, (x) => ({ ...x, blocks: [...x.blocks, preset.make()] }));
                    setPicker(null);
                    const pr = page.projects.find((p) => p.id === projectId);
                    setSelected({ kind: "block", projectId, index: pr ? pr.blocks.length : 0 });
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

function PublishBadge({ publish }: { publish: Publish }) {
  if (publish.state === "idle") return null;
  const map = {
    saving: { cls: "busy", text: "Đang lưu..." },
    building: { cls: "busy", text: "⏳ Đang xuất bản (~1-2 phút)..." },
    done: { cls: "ok", text: "✅ Đã lên sóng!" },
    error: { cls: "err", text: "⚠ " + (publish.state === "error" ? publish.msg : "") },
  } as const;
  const m = map[publish.state];
  return (
    <span className={`adx-badge adx-badge--${m.cls}`} title={ACTIONS_URL}>
      {m.text}
    </span>
  );
}
