import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import siteData from "./data/site.json";
import type { Site } from "./types/content";
import Nav from "./components/Nav";
import PageView from "./components/PageView";

const Admin = lazy(() => import("./admin/Admin"));

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
    <HashRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div style={{ color: "#fff", padding: 40 }}>Loading admin…</div>}>
              <Admin initialSite={site} />
            </Suspense>
          }
        />
        <Route path="*" element={<SiteShell />} />
      </Routes>
    </HashRouter>
  );
}
