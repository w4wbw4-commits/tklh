import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { RequireAdmin } from "@/domain/users/guards";

const Admin = lazyWithRetry(() => import("@/pages/Admin.tsx"));

/**
 * Admin console (admin.tklh.sa). `/admin` stays valid on the main domain too.
 * The route passes through the same shared gate as every other protected area
 * (auth → role → RLS) so guard behaviour is identical across the three shells;
 * the page keeps its own check as a second layer, and the database remains the
 * authority.
 */
export const adminRoutes = [
  <Route key="/admin" path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />,
];
