import { Navigate, Route, Routes, useLocation } from "react-router";
import {
  AdminPage,
  HelpPage,
  ProfilePage,
  AccessDeniedPage,
  NotFoundPage,
  Dashboard,
  AdminDashboard,
  ExportFilesPage,
  ManageDatasets,
} from "components";
import { useStore, focusHeading } from "utils";
import { useEffect, useRef } from "react";

export const AppRoutes = () => {
  const { userIsAdmin } = useStore().user ?? {};

  const { pathname } = useLocation();
  const firstRouteRender = useRef(true);

  useEffect(() => {
    if (firstRouteRender.current) {
      firstRouteRender.current = false;
      return;
    }

    // Wait for the next paint
    const rafId = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <main id="main-content" tabIndex={-1}>
      <Routes>
        {/* General Routes */}
        <Route
          path="/"
          element={!userIsAdmin ? <Dashboard /> : <AdminDashboard />}
        />
        <Route
          path="/admin"
          element={!userIsAdmin ? <Navigate to="/profile" /> : <AdminPage />}
        />
        <Route path="/export" element={<ExportFilesPage />} />
        <Route path="/data-sets" element={<ManageDatasets />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};
