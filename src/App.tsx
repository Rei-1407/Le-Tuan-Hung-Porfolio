import { Component, lazy, Suspense, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import siteData from "./data/site.json";
import type { Site } from "./types/content";
import Nav from "./components/Nav";
import PageView from "./components/PageView";

/* A redeploy renames the hashed admin chunk; a browser holding the previous
   index.html then fails this import. One forced reload fetches the new index
   and resolves it; a second failure falls through to the error screen. */
const Admin = lazy(() =>
  import("./admin/Admin").catch((err) => {
    if (!sessionStorage.getItem("chunk-retry")) {
      sessionStorage.setItem("chunk-retry", "1");
      window.location.reload();
      return new Promise<never>(() => {});
    }
    throw err;
  })
);

class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ color: "#fff", fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: 20 }}>Có lỗi xảy ra khi hiển thị trang</h1>
        <p style={{ opacity: 0.8 }}>{this.state.error.message}</p>
        <button
          style={{ padding: "10px 24px", borderRadius: 8, border: 0, cursor: "pointer", fontWeight: 600 }}
          onClick={() => {
            sessionStorage.removeItem("chunk-retry");
            window.location.reload();
          }}
        >
          Tải lại trang
        </button>
      </div>
    );
  }
}

const site = siteData as Site;

function SiteShell() {
  const location = useLocation();
  const page = site.pages.find((p) => p.slug === location.pathname);

  return (
    <div className="page">
      <Nav pages={site.pages} />
      {page ? <PageView page={page} /> : <Navigate to={site.pages[0].slug} replace />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div style={{ color: "#fff", padding: 40 }}>Đang tải trang quản trị…</div>}>
                <Admin initialSite={site} />
              </Suspense>
            }
          />
          <Route path="*" element={<SiteShell />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
