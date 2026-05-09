"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import { 
  FaCalendarDays, 
  FaPrint, 
  FaFileExcel,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaCircleInfo
} from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const TahunanSection = () => {
  const [loading, setLoading] = useState(false);
  const [pemasukan, setPemasukan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("pemasukan"); // "pemasukan" or "pengeluaran"
  
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchData = useCallback(async () => {
    if (!selectedYear) return;
    setLoading(true);
    try {
      const [resIn, resOut] = await Promise.all([
        GlobalApi.getLaporanPemasukanTahunan(selectedYear),
        GlobalApi.getLaporanPengeluaranTahunan(selectedYear)
      ]);
      setPemasukan(resIn || []);
      setPengeluaran(resOut || []);
    } catch (error) {
      console.error("Error fetching annual reports:", error);
      toast.error("Gagal mengambil data laporan tahunan.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val || 0);
  };

  const currentData = activeSubTab === "pemasukan" ? pemasukan : pengeluaran;

  const exportToExcel = () => {
    const excelData = currentData.map((item, index) => ({
      "No": index + 1,
      "Bulan": item.bulan || item.bulanTransaksi,
      "Nominal": item.nominal || item.totalPengeluaran
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Laporan_${activeSubTab}_Tahunan`);
    XLSX.writeFile(wb, `Laporan_${activeSubTab}_Tahunan_${selectedYear}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      
      {/* Banner */}
      <div className="bg-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaCalendarDays className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Rekap Tahunan</h2>
              <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">Ikhtisar keuangan dalam satu tahun kalender</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={exportToExcel} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Export Excel">
              <FaFileExcel className="text-xl" />
            </button>
            <button onClick={() => window.print()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Cetak Laporan">
              <FaPrint className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Filters and Sub-tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="bg-slate-100 p-1 rounded-xl flex w-full sm:w-auto">
            <button 
              onClick={() => setActiveSubTab("pemasukan")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-black transition-all ${activeSubTab === "pemasukan" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <FaArrowTrendUp className="inline mr-2" /> Pemasukan
            </button>
            <button 
              onClick={() => setActiveSubTab("pengeluaran")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-black transition-all ${activeSubTab === "pengeluaran" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <FaArrowTrendDown className="inline mr-2" /> Pengeluaran
            </button>
          </div>
          
          <div className="w-full sm:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">Tahun Laporan</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Total Summary */}
        <div className={`border p-6 rounded-[32px] flex items-center justify-between ${activeSubTab === "pemasukan" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg ${activeSubTab === "pemasukan" ? "bg-emerald-500" : "bg-rose-500"}`}>
              {activeSubTab === "pemasukan" ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest ${activeSubTab === "pemasukan" ? "text-emerald-800" : "text-rose-800"}`}>Total {activeSubTab} Tahunan</h4>
              <p className={`text-[10px] font-bold ${activeSubTab === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>Tahun Kalender {selectedYear}</p>
            </div>
          </div>
          <span className={`text-3xl font-black ${activeSubTab === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(currentData.reduce((acc, curr) => acc + (parseFloat(curr.nominal?.replace(/[^0-9]/g, '') || curr.totalPengeluaran || 0)), 0))}
          </span>
        </div>

        {/* Table */}
        <div className="border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-5 text-center w-20">No</th>
                  <th className="px-6 py-5">Bulan</th>
                  <th className="px-6 py-5 text-right">Total Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(12).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="3" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : currentData.length > 0 ? (
                  currentData.map((row, i) => (
                    <tr key={i} className={`hover:bg-slate-50 transition-colors group`}>
                      <td className="px-6 py-4 text-center text-slate-400 font-bold text-xs">{i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-700 text-sm block uppercase">{row.bulan || row.bulanTransaksi}</span>
                      </td>
                      <td className={`px-6 py-4 text-right font-black ${activeSubTab === "pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(row.nominal || row.totalPengeluaran)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FaCircleInfo className="text-slate-100 text-6xl mb-4" />
                        <p className="text-slate-400 font-bold">Data tidak tersedia untuk tahun {selectedYear}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TahunanSection;
