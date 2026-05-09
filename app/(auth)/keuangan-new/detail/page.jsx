"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaSearch, 
  FaFilter,
  FaUser,
  FaBuilding,
  FaMoneyCheckAlt,
  FaHandsHelping,
  FaShieldAlt,
  FaNewspaper,
  FaCalendarAlt,
  FaEllipsisH,
  FaChevronDown
} from "react-icons/fa";
import * as XLSX from "xlsx";

export default function KeuanganDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Detail...</div>}>
      <KeuanganDetailContent />
    </Suspense>
  );
}

function KeuanganDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchParam = searchParams.get("cabang");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState(branchParam || "Semua Cabang");
  const [searchQuery, setSearchQuery] = useState("");
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [totals, setTotals] = useState({
    members: 0,
    totalIuran: 0,
    sanduka: 0,
    pgri: 0,
    daspen: 0,
    derap: 0,
    kalender: 0,
    lainlain: 0
  });

  const fetchDetailData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data for details
      const response = await GlobalApi.getNominalAggregatedData("", null, null, selectedMonth, selectedYear);
      
      // Filter out 'Total' row
      const regularData = response.filter(item => item.cabang !== "Total" && item.namaAnggota);
      
      setData(regularData);
    } catch (error) {
      console.error("Error fetching detail data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    fetchDetailData();
  }, [fetchDetailData]);

  // Update totals whenever data or selectedCabang changes
  useEffect(() => {
    const filtered = selectedCabang === "Semua Cabang" 
      ? data 
      : data.filter(item => item.cabang === selectedCabang);

    const t = filtered.reduce((acc, item) => {
      acc.members += 1;
      acc.totalIuran += parseFloat(item.totalIuran) || 0;
      acc.sanduka += parseFloat(item.sanduka) || 0;
      acc.pgri += parseFloat(item.pgri) || 0;
      acc.daspen += parseFloat(item.daspen) || 0;
      acc.derap += parseFloat(item.derap) || 0;
      acc.kalender += parseFloat(item.kalender) || 0;
      acc.lainlain += parseFloat(item.sumbangan) || 0;
      return acc;
    }, { 
      members: 0, totalIuran: 0, sanduka: 0, pgri: 0, 
      daspen: 0, derap: 0, kalender: 0, lainlain: 0 
    });
    
    setTotals(t);
  }, [data, selectedCabang]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail Keuangan");
    XLSX.writeFile(wb, `Detail_Keuangan_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.namaAnggota?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.cabang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.npaPgri?.includes(searchQuery);
    const matchesCabang = selectedCabang === "Semua Cabang" || item.cabang === selectedCabang;
    return matchesSearch && matchesCabang;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

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
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rincian Iuran Anggota</h1>
                <p className="text-slate-400 text-sm font-medium">Monitoring pembayaran per individu</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Premium Period Picker */}
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 text-emerald-600 border-r border-slate-100">
                  <FaCalendarAlt className="text-sm" />
                </div>
                <div className="flex items-center px-1">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <div className="w-[1px] h-4 bg-slate-200" />
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={exportToExcel}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                <FaDownload />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Anggota", value: totals.members, icon: <FaUser />, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "PGRI", value: formatCurrency(totals.pgri), icon: <FaBuilding />, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Sanduka", value: formatCurrency(totals.sanduka), icon: <FaHandsHelping />, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Daspen", value: formatCurrency(totals.daspen), icon: <FaShieldAlt />, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Derap", value: formatCurrency(totals.derap), icon: <FaNewspaper />, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Kalender", value: formatCurrency(totals.kalender), icon: <FaCalendarAlt />, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "Lainnya", value: formatCurrency(totals.lainlain), icon: <FaEllipsisH />, color: "text-slate-600", bg: "bg-slate-50" },
              { label: "TOTAL", value: formatCurrency(totals.totalIuran), icon: <FaMoneyCheckAlt />, color: "text-emerald-700", bg: "bg-emerald-50", isBold: true },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 ${stat.isBold ? 'ring-2 ring-emerald-500 shadow-emerald-100 bg-emerald-50/30' : ''}`}
              >
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} text-xl hidden sm:flex`}>
                  {stat.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1 truncate">{stat.label}</p>
                  <p className={`text-lg font-black truncate ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Table Controls */}
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Static Branch Label */}
              <div className="flex items-center space-x-3 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <FaBuilding className="text-emerald-500 text-lg" />
                <span className="text-sm font-black text-emerald-700 uppercase tracking-wide">
                  {selectedCabang}
                </span>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Cari Nama atau NPA..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 block leading-none mb-1">Hasil Filter</span>
                <span className="text-sm font-black text-slate-700 leading-none">{totals.members} Anggota</span>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-6 py-5">Anggota</th>
                    <th className="px-6 py-5">Wilayah</th>
                    <th className="px-6 py-5 text-center">NPA</th>
                    <th className="px-6 py-5 text-right">Sanduka</th>
                    <th className="px-6 py-5 text-right">PGRI (Org)</th>
                    <th className="px-6 py-5 text-right">Daspen</th>
                    <th className="px-6 py-5 text-right">Lainnya</th>
                    <th className="px-6 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-xl" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 mx-auto rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-100 ml-auto rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-100 ml-auto rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-100 ml-auto rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-100 ml-auto rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 ml-auto rounded" /></td>
                      </tr>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((row, i) => {
                      const sanduka = parseFloat(row.sanduka) || 0;
                      const pgri = parseFloat(row.pgri) || 0;
                      const daspen = parseFloat(row.daspen) || 0;
                      const derap = parseFloat(row.derap) || 0;
                      const kalender = parseFloat(row.kalender) || 0;
                      const sumbangan = parseFloat(row.sumbangan) || 0;
                      const lainlain = derap + kalender + sumbangan;
                      const total = parseFloat(row.totalIuran) || 0;

                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-bold">
                                {row.namaAnggota?.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 block text-sm">{row.namaAnggota}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">{row.nip || 'No NIP'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-500 uppercase">{row.cabang}</span>
                            <span className="text-[10px] text-slate-400 block">{row.unitKerja || '-'}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                              {row.npaPgri}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-amber-600 text-sm">
                            {formatCurrency(sanduka)}
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-indigo-600 text-sm">
                            {formatCurrency(pgri)}
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-rose-600 text-sm">
                            {formatCurrency(daspen)}
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-slate-400 text-sm">
                            {formatCurrency(lainlain)}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="text-sm font-black text-emerald-600">
                              {formatCurrency(total)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-2xl mb-4">
                            <FaSearch />
                          </div>
                          <p className="text-slate-400 font-bold">Data tidak ditemukan</p>
                          <button onClick={() => setSearchQuery("")} className="text-emerald-500 text-xs font-bold mt-2 hover:underline">Reset Pencarian</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
