import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../api/http";

export function RequireAuth() {
    const token = getAccessToken();
    if (!token) return <Navigate to="/login" replace />;
    return <Outlet />;
}
