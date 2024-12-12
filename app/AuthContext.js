"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem("authToken", newToken);
    } else {
      sessionStorage.removeItem("authToken");
    }
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("authToken");
    if (savedToken) {
      setTokenState(savedToken);
    } else {
      router.push("/sign-in");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
