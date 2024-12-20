import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("user") ? true : false;
  });

  const [user, setUser] = useState(() => {
    return localStorage.getItem("user");
  });

  useEffect(() => {
    // When a new tab is opened, increment the active tab count
    let activeTabs = parseInt(localStorage.getItem("activeTabs")) || 0;
    localStorage.setItem("activeTabs", activeTabs + 1);

    // When a tab is closed, decrement the active tab count
    const handleBeforeUnload = () => {
      let activeTabs = parseInt(localStorage.getItem("activeTabs")) || 1;
      localStorage.setItem("activeTabs", activeTabs - 1);

      // If no more active tabs, log out the user
      if (activeTabs <= 1) {
        logout();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const login = (email) => {
    setIsLoggedIn(true);
    setUser(email);
    localStorage.setItem("user", email);
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
