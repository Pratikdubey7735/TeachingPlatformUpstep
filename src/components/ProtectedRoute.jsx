import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = ({ element: Component }) => {
  const { isLoggedIn } = useAuth();
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Render the component if authenticated
  return <Component />;
};

export default ProtectedRoute;
