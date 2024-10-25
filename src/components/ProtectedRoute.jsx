// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element: Component }) => {
  const { isLoggedIn } = useAuth(); // Updated here

  // If the user is not authenticated, redirect to login
  if (!isLoggedIn) { // Updated here
    return <Navigate to="/login" replace />;
  }
  // Otherwise, render the component
  return <Component />;
};

export default ProtectedRoute;
