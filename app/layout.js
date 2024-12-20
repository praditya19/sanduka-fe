"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "./AuthContext";
import "./globals.css";
import { MuteProvider } from "./MuteContext";

export default function RootLayout({ children }) {
  const router = useRouter();
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token && router.pathname !== "/") {
      router.push("/sign-in");
    }
  }, [router]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Source Sans Pro",
        }}
      >
        <AuthProvider>
          <MuteProvider>{children}</MuteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
