"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaWallet,
  FaBullhorn,
  FaFileInvoice,
  FaReceipt,
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaHistory
} from "react-icons/fa";
import GlobalApi from "@/app/_utils/GlobalApi";
import KasSanduka from "./sections/KasSanduka";

const SandukaHub = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("kas");
  const [loading, setLoading] = useState(true);
  const [saldoData, setSaldoData] = useState({ saldo: 0, masuk: 0, keluar: 0 });

  useEffect(() => {
    fetchSaldo();
  }, []);

  const cleanNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
  };

  const fetchSaldo = async () => {
    setLoading(true);
    try {
      const res = await GlobalApi.getSaldoSanduka();
      setSaldoData({
        saldo: cleanNumber(res.saldo_akhir_sanduka),
        masuk: cleanNumber(res.total_masuk),
        keluar: cleanNumber(res.total_keluar)
      });
    } catch (error) {
      console.error("Error fetching saldo:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(val || 0);

  const menuItems = [
    { id: "kas", label: "Buku Kas Sanduka", icon: <FaWallet />, desc: "Jurnal debit & kredit real-time", color: "bg-emerald-500" },
    { id: "lapor", label: "Laporan & Input", icon: <FaBullhorn />, desc: "Submit & rekap laporan bulanan", color: "bg-blue-500" },
    { id: "history", label: "Arsip Laporan", icon: <FaFileInvoice />, desc: "Riwayat laporan yang tersimpan", color: "bg-purple-500" },
    { id: "kwitansi", label: "Manajemen Kwitansi", icon: <FaReceipt />, desc: "Cetak & kelola bukti transaksi", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-8 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/keuangan-new")}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm"
          >
            <FaArrowLeft />
            <span>Kembali ke Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Akuntansi Sanduka v2.0</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
              Manajemen <span className="text-emerald-500">Kas Sanduka</span>
            </h1>
            <p className="text-slate-500 font-medium">Modul akuntansi terintegrasi untuk pengelolaan dana Sanduka.</p>
          </div>
        </div>
      </div>

      {/* Main Menu Hub */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-white p-6 rounded-[32px] border ${activeTab === item.id ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100'} shadow-xl shadow-slate-200/50 cursor-pointer group transition-all`}
              onClick={() => {
                if (item.id === "lapor") {
                  router.push("/keuangan-new/laporan");
                } else if (item.id === "history") {
                  // Redirect to Input page or similar if appropriate, 
                  // but for now let's keep the tab and show the new Laporan link there too
                  setActiveTab(item.id);
                } else {
                  setActiveTab(item.id);
                }
              }}
            >
              <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:rotate-12 transition-all`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">{item.label}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">{item.desc}</p>
              <div className={`flex items-center text-xs font-black ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-600'} group-hover:translate-x-2 transition-all`}>
                <span>{item.id === "lapor" ? "Buka Modul" : (activeTab === item.id ? 'Sedang Dibuka' : 'Kelola Sekarang')}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="9 5l7 7-7 7"></path></svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="mt-12 print:mt-0">
          {activeTab === "kas" ? (
            <KasSanduka />
          ) : activeTab === "lapor" ? (
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <FaBullhorn className="text-emerald-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Pilih Modul Laporan & Input</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8">Silakan pilih modul yang ingin Anda kelola. Seluruh data telah terintegrasi dengan sistem akuntansi baru.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => router.push("/keuangan-new/laporan")}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  Buka Laporan Keuangan
                </button>
                <button 
                  onClick={() => router.push("/keuangan-new/input")}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Buka Manajemen Input
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FaHistory className="text-slate-300 text-3xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Modul Sedang Dikembangkan</h2>
              <p className="text-slate-400 max-w-md mx-auto">Kami sedang memigrasi modul {menuItems.find(i => i.id === activeTab)?.label} ke tampilan baru. Silakan gunakan modul Laporan atau Buku Kas untuk saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SandukaHub;
