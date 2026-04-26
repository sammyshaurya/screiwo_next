"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AuthGuard = ({ children }) => {
  const [isValidToken, setIsValidToken] = useState(null);
  const router = useRouter();

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

  useEffect(() => {
    if (isValidToken === false) {
      router.replace("/");
    }
  }, [isValidToken, router]);

  if (isValidToken === null) {
    return <h1>Loading...</h1>;
  } else if (isValidToken) {
    return children;
  } else {
    return null;
  }
};

export default AuthGuard;
