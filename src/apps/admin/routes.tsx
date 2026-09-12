import { Route } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Admin = lazyWithRetry(() => import("@/pages/Admin.tsx"));

/** Admin console (admin.tklh.sa). `/admin` stays valid on the main domain too. */
export const adminRoutes = [<Route key="/admin" path="/admin" element={<Admin />} />];
