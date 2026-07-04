"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider } from "./AuthContext";
import "./globals.css";
import { MuteProvider } from "./MuteContext";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    // Hanya redirect ke sign-in untuk routes tertentu yang memerlukan auth
    // Jangan redirect untuk berita dan halaman publik lainnya
    const protectedRoutes = ["/home", "/pengaturan", "/transaksi"];
    const needsRedirect = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (!token && needsRedirect) {
      router.push("/sign-in");
    }
  }, [router, pathname]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          fontFamily: "Inter, sans-serif",
        }}
      >
        <AuthProvider>
          <MuteProvider>{children}</MuteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
