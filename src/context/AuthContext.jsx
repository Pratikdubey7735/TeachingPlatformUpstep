import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize logged-in state from localStorage
    return !!localStorage.getItem("user");
  });

  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    return localStorage.getItem("user");
  });

  useEffect(() => {
    // Increment the active tab count when the tab is opened
    let activeTabs = parseInt(localStorage.getItem("activeTabs")) || 0;
    localStorage.setItem("activeTabs", activeTabs + 1);

    const handleBeforeUnload = () => {
      // Decrement the active tab count when the tab is closed
      let activeTabs = parseInt(localStorage.getItem("activeTabs")) || 1;
      localStorage.setItem("activeTabs", activeTabs - 1);

      // Log out the user if no active tabs remain
      if (activeTabs <= 1) {
        logout();
      }
    };

    // Add the event listener for tab closing
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const login = (email) => {
    setIsLoggedIn(true);
    setUser(email);
    localStorage.setItem("user", email); // Save the user in localStorage
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("activeTabs");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
