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
  NotificationsPage,
} from "components";
import { useStore, focusHeading } from "utils";
import { useEffect, useRef } from "react";
import { UserRoles } from "@datasets/shared";

export const AppRoutes = () => {
  const { userIsAdmin, userIsEndUser, userIsReadOnly, userRole } =
    useStore().user ?? {};

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
          element={userIsEndUser ? <Dashboard /> : <AdminDashboard />}
        />
        <Route
          path="/admin"
          element={
            userRole === UserRoles.BOR ? <AdminPage /> : <Navigate to="/403" />
          }
        />
        <Route
          path="/export"
          element={
            userIsAdmin || userIsReadOnly ? (
              <ExportFilesPage />
            ) : (
              <Navigate to="/403" />
            )
          }
        />
        <Route
          path="/datasets"
          element={userIsAdmin ? <ManageDatasets /> : <Navigate to="/403" />}
        />
        <Route
          path="/notifications"
          element={
            userRole === UserRoles.ADMIN || userRole === UserRoles.APPROVER ? (
              <NotificationsPage />
            ) : (
              <Navigate to="/403" />
            )
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};
