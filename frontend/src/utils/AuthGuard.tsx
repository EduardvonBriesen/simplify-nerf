import { Navigate, Outlet } from "react-router-dom";
import authService from "./auth";

function AuthGuard() {
  const authUser = authService.getAuthUser();
  return authUser ? <Outlet /> : <Navigate to="/login" />;
}

export default AuthGuard;
