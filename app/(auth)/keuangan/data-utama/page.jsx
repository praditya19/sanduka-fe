"use client";
import IuranPgri from "../data-utama/iuran-pgri/page";
import Daspen from "../data-utama/daspen/page";
import Derap from "../data-utama/derap/page";
import Kalender from "../data-utama/kalender/page";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

export default function DataUtama() {
  const [activeTab, setActiveTab] = useState("iuran-pgri");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [data, setData] = useState([]);

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let response;

      if (activeTab === "iuran-pgri") {
        const pgriResponse = await GlobalApi.getDefaultIuranById(2);
        const daspenResponse = await GlobalApi.getDefaultIuranById(4);
        const derapResponse = await GlobalApi.getDefaultIuranById(3);
        const kalenderResponse = await GlobalApi.getDefaultIuranById(1);

        sessionStorage.setItem("PGRIData", JSON.stringify(pgriResponse));
        sessionStorage.setItem("daspenData", JSON.stringify(daspenResponse));
        sessionStorage.setItem("derapData", JSON.stringify(derapResponse));
        sessionStorage.setItem(
          "kalenderData",
          JSON.stringify(kalenderResponse)
        );

        response = {
          pgri: pgriResponse,
          daspen: daspenResponse,
          derap: derapResponse,
          kalender: kalenderResponse,
        };
      } else if (activeTab === "lain-lain") {
        // Tambahkan logika pengambilan data untuk tab "Lain-Lain"
        response = await GlobalApi.getLainLainData();
        sessionStorage.setItem("lainLainData", JSON.stringify(response));
      }

      setData(response);
    };

    const storedData = sessionStorage.getItem(`${activeTab}Data`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
    } else {
      fetchData();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 ">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-2"
              />
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="min-h-screen bg-gray-50 py-3 ">
            <nav className="container mt-12">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                <NavItem
                  isActive={activeTab === "iuran-pgri"}
                  onClick={() => handleTabChange("iuran-pgri")}
                >
                  Iuran PGRI
                </NavItem>
                <NavItem
                  isActive={activeTab === "daspen"}
                  onClick={() => handleTabChange("daspen")}
                >
                  Daspen
                </NavItem>
                <NavItem
                  isActive={activeTab === "derap"}
                  onClick={() => handleTabChange("derap")}
                >
                  Derap
                </NavItem>
                <NavItem
                  isActive={activeTab === "kalender"}
                  onClick={() => handleTabChange("kalender")}
                >
                  Kalender
                </NavItem>
                <Link
                  href={"/keuangan/data-utama/lain-lain"}
                  className=""
                >
                  Lain-Lain
                </Link>
              </ul>
            </nav>

            {/* Render components based on active tab */}
            {activeTab === "iuran-pgri" && <IuranPgri data={data} />}
            {activeTab === "daspen" && <Daspen data={data} />}
            {activeTab === "derap" && <Derap data={data} />}
            {activeTab === "kalender" && <Kalender data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ children, isActive, onClick, href }) {
  const activeClass = isActive ? "text-green-700 font-bold" : "";

  if (href) {
    return (
      <li>
        <Link href={href} className={`cursor-pointer ${activeClass}`}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li className={`cursor-pointer ${activeClass}`} onClick={onClick}>
      {children}
    </li>
  );
}
