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

        <main className="p-4 md:p-8 mt-24 md:mt-20 max-w-[95%] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Input Data Utama</h1>
                <p className="text-slate-400 text-sm font-medium">Pengelolaan iuran dan sumbangan periodik</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id 
                    ? "bg-white shadow-md border-l-4 border-l-emerald-500 translate-x-2" 
                    : "hover:bg-white/50 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl ${activeTab === tab.id ? tab.bg + " " + tab.color : "bg-slate-100 text-slate-400"}`}>
                      {tab.icon}
                    </div>
                    <span className={`font-bold text-sm ${activeTab === tab.id ? "text-slate-800" : ""}`}>
                      {tab.label}
                    </span>
                  </div>
                  <FaChevronRight className={`text-[10px] transition-transform ${activeTab === tab.id ? "rotate-90 text-emerald-500" : "opacity-0"}`} />
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[600px] overflow-hidden"
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
