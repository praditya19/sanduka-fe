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

  const [summaryData, setSummaryData] = useState([]);

  const fetchDetailData = useCallback(async () => {
    setLoading(true);
    try {
      // Menggunakan data balancing sesuai permintaan user
      const response = await GlobalApi.getTransaksiBankBalancing(
        "",
        null,
        selectedYear,
        selectedMonth,
        null,
        null
      );

      const safeData = Array.isArray(response) ? response : [];

      // Filter untuk memastikan hanya mengambil record terbaru per NPA
      const npaMap = {};
      safeData.forEach((item) => {
        const key = `${item.cabang}-${item.unitKerja}-${item.npa}`;
        if (!npaMap[key] || item.id > npaMap[key].id) {
          npaMap[key] = item;
        }
      });

      setData(Object.values(npaMap));
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
      acc.sanduka += parseFloat(item.totalIuranSanduka) || 0;
      acc.pgri += parseFloat(item.totalIuranAnggota) || 0;
      acc.daspen += parseFloat(item.totalIuranDaspen) || 0;
      acc.derap += parseFloat(item.totalIuranDerap) || 0;
      acc.kalender += parseFloat(item.totalIuranKalender) || 0;
      acc.lainlain += parseFloat(item.totalIuranSumbangan) || 0;
      return acc;
    }, {
      members: 0, totalIuran: 0, sanduka: 0, pgri: 0,
      daspen: 0, derap: 0, kalender: 0, lainlain: 0
    });

    setTotals(t);

    // Calculate summary per category (Excel-style)
    const categories = [
      { id: 'pgri', label: 'PGRI', field: 'totalIuranAnggota' },
      { id: 'sanduka', label: 'Sanduka', field: 'totalIuranSanduka' },
      { id: 'daspen', label: 'Daspen', field: 'totalIuranDaspen' },
      { id: 'derap', label: 'Derap', field: 'totalIuranDerap' },
      { id: 'kalender', label: 'Kalender', field: 'totalIuranKalender' },
      { id: 'sumbangan', label: 'Lain-lain', field: 'totalIuranSumbangan' },
    ];

    const summary = categories.map(cat => {
      let count = 0;
      let nominal = 0;
      let bank = 0;

      filtered.forEach(item => {
        const val = parseFloat(item[cat.field]) || 0;
        if (val > 0) {
          count++;
          nominal += val;
          // Anggap Sukses/Tunai sebagai pembayaran yang sudah dilakukan
          if (item.keterangan === "Sukses") {
            bank += val;
          }
        }
      });

      const kurang = nominal - bank;
      const bayar = kurang; // Mengikuti pola di excel di mana bayar = kurang (pelunasan tunai)

      return {
        label: cat.label,
        count,
        nominal,
        bank,
        kurang,
        bayar
      };
    });

    setSummaryData(summary);
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
    const matchesSearch = item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cabang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.npa?.includes(searchQuery);
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
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rincian Keuangan</h1>
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

          {/* Rekapitulasi Cabang Section (Excel Style) */}
          <div className="bg-white rounded-[32px] md:rounded-[40px] p-4 md:p-8 shadow-xl border border-slate-100 mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <FaMoneyCheckAlt />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Rekapitulasi <span className="text-blue-600">Cabang</span></h2>
                  <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Laporan Alokasi Tagihan & Realisasi Pembayaran</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0 rounded-[20px] md:rounded-[24px] border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-3 py-3 md:px-6 md:py-4">No</th>
                    <th className="px-3 py-3 md:px-6 md:py-4">Tagihan</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-center">Jumlah</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-right">Nominal</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-right text-rose-500">Kurang</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-right text-emerald-500">Bayar</th>
                    <th className="px-3 py-3 md:px-6 md:py-4 text-center">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {summaryData.length > 0 ? (
                    summaryData.map((row, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-3 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-slate-400">{i + 1}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 font-black text-slate-700 text-[11px] md:text-sm uppercase tracking-tight">{row.label}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-center font-bold text-slate-600 text-[11px] md:text-sm">{row.count}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-right font-black text-slate-700 text-[11px] md:text-sm">{formatCurrency(row.nominal)}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-right font-bold text-rose-500 text-[11px] md:text-sm">{formatCurrency(row.kurang)}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-right font-bold text-emerald-600 text-[11px] md:text-sm">{formatCurrency(row.bayar)}</td>
                          <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                            <span className={`whitespace-nowrap px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black border shadow-sm ${
                              row.kurang <= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {row.kurang <= 0 ? 'LUNAS' : 'BELUM LUNAS'}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-50/40">
                          <td className="px-3 py-2 md:px-6"></td>
                          <td className="px-3 py-2 md:px-6 text-[8px] md:text-[10px] font-black text-emerald-500 italic uppercase tracking-widest">Bank</td>
                          <td className="px-3 py-2 md:px-6"></td>
                          <td className="px-3 py-2 md:px-6 text-right text-[8px] md:text-[10px] font-black text-emerald-500 italic">{formatCurrency(row.bank)}</td>
                          <td className="px-3 py-2 md:px-6"></td>
                          <td className="px-3 py-2 md:px-6"></td>
                          <td className="px-3 py-2 md:px-6"></td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400 font-bold">Menghitung data rekapitulasi...</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-black text-[10px] md:text-xs">
                  <tr>
                    <td colSpan="3" className="px-3 py-4 md:px-6 md:py-5 uppercase tracking-widest">Total</td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-right">{formatCurrency(summaryData.reduce((acc, curr) => acc + curr.nominal, 0))}</td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-right text-rose-300">{formatCurrency(summaryData.reduce((acc, curr) => acc + curr.kurang, 0))}</td>
                    <td className="px-3 py-4 md:px-6 md:py-5 text-right text-emerald-300">{formatCurrency(summaryData.reduce((acc, curr) => acc + curr.bayar, 0))}</td>
                    <td className="px-3 py-4 md:px-6 md:py-5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
