// authContext.js
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Example state

  // Check if user is logged in (implement your logic)
  const checkLoggedIn = () => {
    // Example: Check if user session exists or token is valid
    const user = localStorage.getItem('user'); // Adjust based on your auth method
    return !!user;
  };

  // Perform login action (example)
  const login = (username, password) => {
    // Example: Authenticate user and set isLoggedIn state
    setIsLoggedIn(true);
    localStorage.setItem('user', username); // Store user session
  };

  // Perform logout action (example)
  const logout = () => {
    // Example: Clear user session
    setIsLoggedIn(false);
    localStorage.removeItem('user'); // Remove user session
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
