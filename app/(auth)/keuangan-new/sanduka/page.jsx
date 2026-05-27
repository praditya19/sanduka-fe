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
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 lg:p-8">
      {/* Header Area */}
      <div className="max-w-[1400px] mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/keuangan-new")}
            className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Dashboard Utama</span>
          </button>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sanduka Ecosystem v2.0</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
              Manajemen <span className="text-emerald-500">Sanduka</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium">Modul pengelolaan dana sosial terintegrasi</p>
          </div>
        </div>
      </div>

      {/* Main Menu Hub */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className={`bg-white p-3.5 rounded-[24px] border ${activeTab === item.id ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-100'} shadow-xl shadow-slate-200/40 cursor-pointer group transition-all`}
              onClick={() => {
                if (item.id === "lapor") {
                  router.push("/keuangan-new/laporan");
                } else if (item.id === "history") {
                  setActiveTab(item.id);
                } else {
                  setActiveTab(item.id);
                }
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${item.color} text-white rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:rotate-12 transition-all`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-[12px] font-black text-slate-800 leading-tight">{item.label}</h3>
                  <div className={`mt-0.5 text-[8px] font-black uppercase tracking-widest ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {activeTab === item.id ? 'Aktif' : 'Tersedia'}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-tight mb-2 line-clamp-1">{item.desc}</p>
              <div className={`flex items-center justify-between pt-2 border-t border-slate-50 text-[9px] font-black ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-500'}`}>
                <span className="uppercase tracking-widest">{item.id === "lapor" ? "Buka Modul" : "Kelola"}</span>
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="9 5l7 7-7 7"></path></svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="mt-8 print:mt-0">
          {activeTab === "kas" ? (
            <KasSanduka />
          ) : activeTab === "lapor" ? (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-16 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <FaBullhorn className="text-emerald-500 text-2xl" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Pilih Modul Laporan</h2>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-8 font-medium">Silakan pilih modul yang ingin Anda kelola. Seluruh data telah terintegrasi.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => router.push("/keuangan-new/laporan")}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  Laporan Keuangan
                </button>
                <button 
                  onClick={() => router.push("/keuangan-new/input")}
                  className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  Manajemen Input
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50 min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <FaHistory className="text-slate-300 text-2xl" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">Modul Pengembangan</h2>
              <p className="text-slate-400 text-xs max-w-xs mx-auto font-medium">Migrasi modul {menuItems.find(i => i.id === activeTab)?.label} ke tampilan v2 sedang diproses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SandukaHub;
