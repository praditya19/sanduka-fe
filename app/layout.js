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
