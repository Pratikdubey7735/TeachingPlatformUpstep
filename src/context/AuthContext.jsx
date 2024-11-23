import React, { createContext, useState, useContext, useEffect } from "react";

// Create a context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check sessionStorage for login state when the app initializes
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // Parse stored user data
    }
  }, []);

  const login = (userEmail) => {
    setIsLoggedIn(true);
    setUser(userEmail);
    sessionStorage.setItem("user", JSON.stringify(userEmail)); // Store user data in sessionStorage
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    sessionStorage.removeItem("user"); // Clear user data from sessionStorage
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
