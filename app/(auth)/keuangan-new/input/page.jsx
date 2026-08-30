"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCoins,
  FaHandHoldingHeart,
  FaNewspaper,
  FaCalendarAlt,
  FaEllipsisH,
  FaChevronRight,
  FaChartBar,
  FaBuilding,
} from "react-icons/fa";

// Import sections
import IuranPgriSection from "./sections/IuranPgri";
import DaspenSection from "./sections/Daspen";
import DerapSection from "./sections/Derap";
import KalenderSection from "./sections/Kalender";
import BackButton from "../components/BackButton";
import LainLainSection from "./sections/LainLain";
import RekapitulasiSection from "./sections/Rekapitulasi";
import PeruntukanKabupatenSection from "./sections/PeruntukanKabupaten";

export default function KeuanganInput() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Input...</div>}>
      <KeuanganInputContent />
    </Suspense>
  );
}

function KeuanganInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "iuran-pgri";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    setUserRole(sessionStorage.getItem("role"));
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const isAdminOrSuperAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN";

  if (userRole !== null && !isAdminOrSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <HeaderMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <HeaderMobile toggleSidebar={toggleSidebar} />
          <main className="p-4 md:p-8 mt-24 md:mt-20 max-w-[95%] mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-slate-400 font-bold text-lg">Anda tidak memiliki akses ke halaman ini.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "iuran-pgri", label: "Iuran PGRI", icon: <FaCoins />, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "daspen", label: "Daspen", icon: <FaHandHoldingHeart />, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "derap", label: "Derap", icon: <FaNewspaper />, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "kalender", label: "Kalender", icon: <FaCalendarAlt />, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "lain-lain", label: "Lain-Lain", icon: <FaEllipsisH />, color: "text-slate-500", bg: "bg-slate-50" },
    { id: "rekap", label: "Rekapitulasi", icon: <FaChartBar />, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "peruntukan-kabupaten", label: "Peruntukan Kabupaten", icon: <FaBuilding />, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <HeaderMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <HeaderMobile toggleSidebar={toggleSidebar} />

        <main className="px-4 md:px-6 py-8 mt-24 md:mt-20">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <div className="flex items-center space-x-3 md:space-x-5 mb-6 md:mb-8 px-2">
              <BackButton />
              <div>
                <h1 className="text-lg md:text-3xl font-bold text-slate-800 tracking-tight">Manajemen Input Keuangan</h1>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-medium uppercase tracking-widest">Administrasi Iuran & Pendapatan Organisasi</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="mb-6 md:mb-10 overflow-x-auto -mx-2 px-2">
              <div className="flex items-center justify-center md:justify-start gap-1 md:gap-0 w-full md:max-w-3xl md:mx-auto">
                {tabs.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  const isComplete = tabs.findIndex(t => t.id === activeTab) > idx;
                  return (
                    <div key={tab.id} className="flex items-center flex-none">
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-1 group transition-all ${isActive ? "scale-105" : "opacity-50 hover:opacity-80"
                          }`}
                      >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-bold transition-all ${isActive
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30"
                          : isComplete
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400"
                          }`}>
                          {isComplete ? "✓" : tab.icon}
                        </div>
                        <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-wider md:tracking-widest whitespace-nowrap ${isActive ? "text-slate-800" : "text-slate-400"
                          }`}>
                          {tab.label}
                        </span>
                      </button>
                      {idx < tabs.length - 1 && (
                        <div className={`hidden md:block h-px w-8 lg:w-12 mx-2 lg:mx-3 mt-[-1.5rem] ${isComplete ? "bg-emerald-400" : "bg-slate-200"
                          }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {activeTab === "iuran-pgri" && <IuranPgriSection />}
                  {activeTab === "daspen" && <DaspenSection />}
                  {activeTab === "derap" && <DerapSection />}
                  {activeTab === "kalender" && <KalenderSection />}
                  {activeTab === "lain-lain" && <LainLainSection />}
                  {activeTab === "rekap" && <RekapitulasiSection />}
                  {activeTab === "peruntukan-kabupaten" && <PeruntukanKabupatenSection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
