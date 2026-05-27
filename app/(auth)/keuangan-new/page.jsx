"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import SummaryCards from "./components/SummaryCards";
import AIInsight from "./components/AIInsight";
import QuickActions from "./components/QuickActions";
import AIChat from "./components/AIChat";
import { FaCalendarAlt, FaFilter, FaChartBar } from "react-icons/fa";

export default function KeuanganNew() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sanduka: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
    organisasi: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
  });
  const [activeModule, setActiveModule] = useState("sanduka"); // 'sanduka' or 'organisasi'
  const [insights, setInsights] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    fetchFinancialData();
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [selectedMonth, selectedYear]);


  const fetchTableData = async () => {
    setTableLoading(true);
    try {
      // Mengambil data dari balancing total iuran sesuai permintaan user
      const response = await GlobalApi.getTransaksiBankBalancing(
        "", 
        null, 
        selectedYear, 
        selectedMonth, 
        null, 
        null
      );

      const safeData = Array.isArray(response) ? response : [];

      // Filter untuk memastikan hanya mengambil record terbaru per NPA (menghindari duplikasi)
      const npaMap = {};
      safeData.forEach((item) => {
        const key = `${item.cabang}-${item.unitKerja}-${item.npa}`;
        if (!npaMap[key] || item.id > npaMap[key].id) {
          npaMap[key] = item;
        }
      });

      // Group by Cabang
      const grouped = Object.values(npaMap).reduce((acc, item) => {
        const key = item.cabang || "Lainnya";
        if (!acc[key]) {
          acc[key] = { 
            cabang: key, 
            target: 0, 
            realisasi: 0 
          };
        }
        
        // Target adalah total semua iuran (Anggota, Sanduka, Daspen, Derap, Kalender, Sumbangan)
        const itemTarget = (item.totalIuranAnggota || 0) +
                           (item.totalIuranSanduka || 0) +
                           (item.totalIuranDaspen || 0) +
                           (item.totalIuranDerap || 0) +
                           (item.totalIuranKalender || 0) +
                           (item.totalIuranSumbangan || 0);
        
        acc[key].target += itemTarget;
        acc[key].realisasi += (item.potongan || 0);
        
        return acc;
      }, {});

      setTableData(Object.values(grouped).sort((a, b) => a.cabang.localeCompare(b.cabang)));
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const cleanNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remove everything except digits
    const cleaned = val.toString().replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Fetch both Sanduka and Organisasi data
      const [responseSanduka, responseOrganisasi] = await Promise.all([
        GlobalApi.getSaldoSanduka(),
        GlobalApi.getSaldoOrganisasi(),
      ]);

      const sandukaSaldo = cleanNumber(responseSanduka.saldo_akhir_sanduka);
      const sandukaMasuk = cleanNumber(responseSanduka.total_masuk);
      const sandukaKeluar = cleanNumber(responseSanduka.total_keluar);

      const organisasiSaldo = cleanNumber(responseOrganisasi.saldo_akhir_organisasi);
      const organisasiMasuk = cleanNumber(responseOrganisasi.total_masuk);
      const organisasiKeluar = cleanNumber(responseOrganisasi.total_keluar);

      setData({
        sanduka: {
          saldo: sandukaSaldo,
          pemasukan: sandukaMasuk,
          pengeluaran: sandukaKeluar
        },
        organisasi: {
          saldo: organisasiSaldo,
          pemasukan: organisasiMasuk,
          pengeluaran: organisasiKeluar
        }
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update insights when activeModule or data changes
  useEffect(() => {
    if (loading) return;

    const currentModule = activeModule === "sanduka" ? "Sanduka" : "Organisasi";
    const currentData = data[activeModule];

    const newInsights = [
      `Saldo ${currentModule} saat ini mencapai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentData.saldo)}.`,
      `Tren pemasukan ${currentModule} bulan ini menunjukkan kenaikan positif dari sektor iuran.`,
      `Disarankan untuk meninjau kembali laporan ${currentModule} secara berkala untuk menjaga transparansi.`,
    ];
    setInsights(newInsights);
  }, [activeModule, data, loading]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <HeaderMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <HeaderMobile toggleSidebar={toggleSidebar} />

        <main className="p-4 md:p-8 mt-24 md:mt-20 max-w-[95%] mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Dashboard Keuangan <span className="text-emerald-500">New</span>
              </h1>
              <p className="text-slate-500 font-medium">Selamat datang kembali, Admin</p>
            </motion.div>

            <div className="flex items-center space-x-3">
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
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all cursor-pointer group">
                <FaFilter className="group-hover:rotate-180 transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* Module & View Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shadow-inner">
              <button
                onClick={() => setActiveModule("sanduka")}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeModule === "sanduka"
                    ? "bg-white text-emerald-600 shadow-md scale-100"
                    : "text-slate-400 hover:text-slate-600 scale-95"
                  }`}
              >
                Sanduka
              </button>
              <button
                onClick={() => setActiveModule("organisasi")}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeModule === "organisasi"
                    ? "bg-white text-blue-600 shadow-md scale-100"
                    : "text-slate-400 hover:text-slate-600 scale-95"
                  }`}
              >
                Organisasi
              </button>
            </div>

            <div></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key={activeModule} // Re-animate when module changes
            >
              <SummaryCards
                saldo={data[activeModule].saldo}
                pemasukan={data[activeModule].pemasukan}
                pengeluaran={data[activeModule].pengeluaran}
                loading={loading}
                type={activeModule}
              />

              <AIInsight insights={insights} loading={loading} />

              <QuickActions />

              {/* Arrears Table Section */}
              <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 mt-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Setoran <span className="text-emerald-500">Per Cabang</span></h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Status pembayaran iuran anggota berdasarkan wilayah</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="pb-5 text-center w-16">No</th>
                        <th className="pb-5">Cabang</th>
                        <th className="pb-5 text-center">Total Iuran</th>
                        <th className="pb-5 text-right">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tableLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-6 text-center"><div className="h-4 w-6 bg-slate-100 mx-auto rounded-full" /></td>
                            <td className="py-6"><div className="h-4 w-32 bg-slate-100 rounded-full" /></td>
                            <td className="py-6 text-center"><div className="h-6 w-24 bg-slate-100 mx-auto rounded-full" /></td>
                            <td className="py-6 text-right"><div className="h-8 w-20 bg-slate-100 ml-auto rounded-xl" /></td>
                          </tr>
                        ))
                      ) : tableData.length > 0 ? (
                        tableData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-6 text-center text-slate-400 font-bold text-xs">{i + 1}</td>
                            <td className="py-6">
                              <span className="font-black text-slate-700 block uppercase text-sm tracking-tight">{row.cabang}</span>
                            </td>
                            <td className="py-6 text-center">
                              <span className="bg-emerald-50 text-emerald-600 font-black px-4 py-1.5 rounded-full text-[10px] border border-emerald-100 shadow-sm shadow-emerald-50">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(row.target)}
                              </span>
                            </td>
                            <td className="py-6 text-right">
                              <button
                                onClick={() => router.push(`/keuangan-new/detail?cabang=${encodeURIComponent(row.cabang)}`)}
                                className="bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 px-5 py-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-sm hover:shadow-lg hover:shadow-emerald-100"
                              >
                                LIHAT DETAIL
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <FaChartBar className="text-slate-300" />
                              </div>
                              <p className="text-slate-400 font-bold">Tidak ada data setoran untuk periode ini</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        <AIChat data={data[activeModule]} />
      </div>
    </div>
  );
}
