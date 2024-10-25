// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Login from "./components/Login.jsx";
import Setup from "./components/setup.jsx";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* Use ProtectedRoute for protected pages */}
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
        <Route path="/setup" element={<ProtectedRoute element={Setup} />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;
