// src/components/RoleRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function RoleRoute({ children, allowed }) {
  const role = localStorage.getItem("role");
  const location = useLocation();

  // If no role → redirect to login and preserve the intended destination
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role exists but not allowed → redirect to unauthorized or home
  if (!allowed.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Optional: small safety check – in case role is corrupted/invalid
  if (!["user", "provider", "admin"].includes(role)) {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
}