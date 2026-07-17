import { Component, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import siteData from "./data/site.json";
import type { Site } from "./types/content";
import Nav from "./components/Nav";
import PageView from "./components/PageView";
/* Bundled statically on purpose: a code-split admin chunk gets orphaned when a
   redeploy renames it while a browser still holds the previous index.html,
   which surfaced as a blank /#/admin. One bundle = nothing to go stale. */
import Admin from "./admin/Admin";

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
          onClick={() => window.location.reload()}
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
          <Route path="/admin/*" element={<Admin initialSite={site} />} />
          <Route path="*" element={<SiteShell />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
