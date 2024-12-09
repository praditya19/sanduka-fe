"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";

const page = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
    
      useEffect(() => {
        const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
        setIsSidebarOpen(sidebarState);
      }, []);
      const toggleSidebar = () => {
        const newSidebarState = !isSidebarOpen;
        setIsSidebarOpen(newSidebarState);
        localStorage.setItem("isSidebarOpen", newSidebarState);
      };
  return (
    <div>
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};

export default page;
