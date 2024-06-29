import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const AuthGuard = ({ children }) => {
  const [isValidToken, setIsValidToken] = useState(null);

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.get(
          "https://screiwo-backend.onrender.com/api/verify-token",
          {
            params: {
              token: token,
            },
          }
        );
        setIsValidToken(response.data.valid);
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsValidToken(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      localStorage.removeItem("token");
      setIsValidToken(false);
    }
  }, []);

  if (isValidToken === null) {
    return <h1>Loading...</h1>
  } else if (isValidToken) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default AuthGuard;
