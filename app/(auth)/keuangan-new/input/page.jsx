"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaCoins, 
  FaHandHoldingHeart, 
  FaNewspaper, 
  FaCalendarAlt, 
  FaEllipsisH,
  FaChevronRight
} from "react-icons/fa";

// Import sections (we will create these next)
import IuranPgriSection from "./sections/IuranPgri";
import DaspenSection from "./sections/Daspen";
import DerapSection from "./sections/Derap";
import KalenderSection from "./sections/Kalender";
import LainLainSection from "./sections/LainLain";

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

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const tabs = [
    { id: "iuran-pgri", label: "Iuran PGRI", icon: <FaCoins />, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "daspen", label: "Daspen", icon: <FaHandHoldingHeart />, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "derap", label: "Derap", icon: <FaNewspaper />, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "kalender", label: "Kalender", icon: <FaCalendarAlt />, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "lain-lain", label: "Lain-Lain", icon: <FaEllipsisH />, color: "text-slate-500", bg: "bg-slate-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <HeaderMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <HeaderMobile toggleSidebar={toggleSidebar} />

        <main className="px-4 md:px-6 py-8 mt-24 md:mt-20 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 px-2">
            <div className="flex items-center space-x-5">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-emerald-500 transition-all active:scale-90"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Input Keuangan</h1>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Administrasi Iuran & Pendapatan Organisasi</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Navigation Tabs (Sidebar-like but integrated) */}
            <div className="xl:col-span-2 space-y-3">
              <div className="bg-white/40 backdrop-blur-sm p-2 rounded-[32px] border border-white/60 shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-[24px] transition-all duration-500 group ${
                      activeTab === tab.id 
                      ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2" 
                      : "text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-lg hover:shadow-slate-200/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      activeTab === tab.id 
                      ? "bg-white/10 text-white" 
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                    }`}>
                      {tab.icon}
                    </div>
                    <span className={`font-black text-[11px] uppercase tracking-wider ${activeTab === tab.id ? "opacity-100" : "opacity-60"}`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden min-h-[700px]"
                >
                  {activeTab === "iuran-pgri" && <IuranPgriSection />}
                  {activeTab === "daspen" && <DaspenSection />}
                  {activeTab === "derap" && <DerapSection />}
                  {activeTab === "kalender" && <KalenderSection />}
                  {activeTab === "lain-lain" && <LainLainSection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
