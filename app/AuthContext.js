"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

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
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
