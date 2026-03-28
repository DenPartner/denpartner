import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}