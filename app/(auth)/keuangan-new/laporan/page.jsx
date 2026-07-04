"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaChartPie, 
  FaArrowTrendUp, 
  FaArrowTrendDown, 
  FaCalendarDays, 
  FaWallet,
  FaChevronRight
} from "react-icons/fa6";

// Import sections
import TargetRealisasiSection from "./sections/TargetRealisasi";
import PemasukanSection from "./sections/Pemasukan";
import PengeluaranSection from "./sections/Pengeluaran";
import TahunanSection from "./sections/Tahunan";
import BackButton from "../components/BackButton";
import SaldoAkhirSection from "./sections/SaldoAkhir";

export default function KeuanganLaporan() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 italic">Memuat Laporan...</div>}>
      <KeuanganLaporanContent />
    </Suspense>
  );
}

function KeuanganLaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "target-realisasi";
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam);

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
    { id: "target-realisasi", label: "Target & Realisasi", icon: <FaChartPie />, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "pemasukan", label: "Laporan Pemasukan", icon: <FaArrowTrendUp />, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "pengeluaran", label: "Laporan Pengeluaran", icon: <FaArrowTrendDown />, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "tahunan", label: "Rekap Tahunan", icon: <FaCalendarDays />, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "saldo-akhir", label: "Saldo Akhir", icon: <FaWallet />, color: "text-amber-500", bg: "bg-amber-50" },
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
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h1>
                <p className="text-slate-400 text-sm font-medium">Analisis transparan data kas & iuran</p>
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
                  {activeTab === "target-realisasi" && <TargetRealisasiSection />}
                  {activeTab === "pemasukan" && <PemasukanSection />}
                  {activeTab === "pengeluaran" && <PengeluaranSection />}
                  {activeTab === "tahunan" && <TahunanSection />}
                  {activeTab === "saldo-akhir" && <SaldoAkhirSection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
