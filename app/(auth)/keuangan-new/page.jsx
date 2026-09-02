"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { FaCalendarAlt, FaFilter, FaChartBar, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

export default function KeuanganNew() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sanduka: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
    organisasi: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
  });
  const [activeModule, setActiveModule] = useState("sanduka");
  const [insights, setInsights] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [userRole, setUserRole] = useState(null);
  const [userCabang, setUserCabang] = useState("");

  useEffect(() => {
    setUserRole(sessionStorage.getItem("role"));
    setUserCabang((sessionStorage.getItem("cabang") || "").toUpperCase());
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

  const normalizeCabangKey = (value) =>
    (value || "").toString().trim().replace(/\s+/g, " ").toUpperCase();

  const parseCurrency = (value) => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    const cleaned = value.toString().replace(/[^0-9,-]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    fetchFinancialData();
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [selectedMonth, selectedYear]);

  const fetchTableData = useCallback(async () => {
    setTableLoading(true);
    try {
      const [transaksiCabangRes, balancingRes, orgRes] = await Promise.all([
        GlobalApi.getTransaksiCabangByBulanTahun(selectedMonth, selectedYear),
        GlobalApi.getBalancingSummaryPerCabang(selectedMonth, selectedYear),
        GlobalApi.getPemasukanUmum(),
      ]);

      const cabangTransData = Array.isArray(transaksiCabangRes) ? transaksiCabangRes : transaksiCabangRes?.data || [];
      const balancingSummaryData = Array.isArray(balancingRes) ? balancingRes : [];

      // Transaksi cabang: group by cabang (normalized), sum tagihan (excl Pemasukan Dari Bank) and pembayaran
      const tcGrouped = {};
      cabangTransData.forEach((item) => {
        const cabang = (item.cabang || "Lainnya").trim().toUpperCase();
        if (!tcGrouped[cabang]) {
          tcGrouped[cabang] = { cabang: item.cabang || "Lainnya", target: 0, realisasi: 0 };
        }
        if ((item.pos || "").toUpperCase() !== "PEMASUKAN DARI BANK") {
          tcGrouped[cabang].target += Number(item.tagihan || 0);
        }
        tcGrouped[cabang].realisasi += Number(item.pembayaran || 0);
      });

      // Balancing summary per cabang
      const balGrouped = {};
      balancingSummaryData.forEach((item) => {
        const cabang = (item.cabang || "Lainnya").trim().toUpperCase();
        balGrouped[cabang] = {
          target: Number(item.target || 0),
          potBank: Number(item.potBank || 0),
          iuranAnggota: Number(item.iuranAnggota || 0),
          iuranSanduka: Number(item.iuranSanduka || 0),
          iuranDaspen: Number(item.iuranDaspen || 0),
          iuranDerap: Number(item.iuranDerap || 0),
          iuranKalender: Number(item.iuranKalender || 0),
          iuranSumbangan: Number(item.iuranSumbangan || 0),
        };
      });

      // Main categories and their balancing field names
      const normalizePos = (name) => (name || "").toString().trim().replace(/[\s\-_]+/g, "").toUpperCase();
      const mainCategoryConfigs = [
        { balField: "iuranAnggota", aliases: ["IURANPGRI", "IURAN", "IURANANGGOTA"] },
        { balField: "iuranSanduka", aliases: ["SANDUKA", "IURANSANDUKA"] },
        { balField: "iuranDaspen", aliases: ["DASPEN", "IURANDASPEN"] },
        { balField: "iuranDerap", aliases: ["DERAP", "IURANDERAP"] },
        { balField: "iuranKalender", aliases: ["KALENDER", "IURANKALENDER"] },
        { balField: "iuranSumbangan", aliases: ["LAINLAIN", "LAIN", "SUMBANGAN", "IURANSUMBANGAN"] },
      ];

      // Parse pemasukan organisasi for realisasi per cabang
      const orgPayments = {};
      if (orgRes && Array.isArray(orgRes)) {
        orgRes.forEach((item) => {
          const cabangValue =
            typeof item.cabang === "object"
              ? item.cabang?.kecamatan || item.cabang?.cabang || item.cabang?.namaCabang
              : item.cabang;
          const cabangName = cabangValue || item.namaCabang || item.nama_cabang || "";
          const cabangKey = cabangName.trim().toUpperCase();
          if (!cabangKey) return;
          const setoranBulan = Number(item.setoranBulan || item.setoran_bulan || 0);
          const setoranTahun = Number(item.setoranTahun || item.setoran_tahun || 0);
          if (setoranBulan !== selectedMonth || setoranTahun !== selectedYear) return;
          const nominal = parseCurrency(item.nominal || item.debet || item.debit);
          orgPayments[cabangKey] = (orgPayments[cabangKey] || 0) + nominal;
        });
      }

      // Only include cabang with transaksi_cabang data
      const grouped = {};
      Object.keys(tcGrouped).forEach((cabang) => {
        const tc = tcGrouped[cabang];
        const bal = balGrouped[cabang];
        let target = tc.target;
        let realisasi = 0;

        // Add balancing categories not represented in transaksi_cabang
        const branchTcNormalized = cabangTransData
          .filter(t => (t.cabang || "").trim().toUpperCase() === cabang)
          .map(t => normalizePos(t.pos));

        if (bal) {
          mainCategoryConfigs.forEach((cat) => {
            const hasTc = branchTcNormalized.some((tcPos) => cat.aliases.includes(tcPos));
            if (!hasTc) {
              const field = cat.balField;
              if (field && bal[field] > 0) {
                target += bal[field];
              }
            }
          });
        }

        // realisasi = transaksi_cabang pembayaran for Pemasukan Dari Bank + potBank
        const tcRealisasi = cabangTransData
          .filter((t) => (t.cabang || "").trim().toUpperCase() === cabang && (t.pos || "").toUpperCase() === "PEMASUKAN DARI BANK")
          .reduce((s, t) => s + Number(t.pembayaran || 0), 0);
        realisasi = tcRealisasi + (bal?.potBank || 0);

        // Add organisasi payments
        if (orgPayments[cabang]) {
          realisasi += orgPayments[cabang];
        }

        grouped[cabang] = { cabang: tc.cabang, target, realisasi };
      });

      setTableData(Object.values(grouped).sort((a, b) => a.cabang.localeCompare(b.cabang)));
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setTableLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const cleanNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
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
        sanduka: { saldo: sandukaSaldo, pemasukan: sandukaMasuk, pengeluaran: sandukaKeluar },
        organisasi: { saldo: organisasiSaldo, pemasukan: organisasiMasuk, pengeluaran: organisasiKeluar }
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    const currentModule = activeModule === "sanduka" ? "Sanduka" : "Organisasi";
    const currentData = data[activeModule];
    const newInsights = [
      `Saldo ${currentModule} saat ini mencapai ${formatCurrency(currentData.saldo)}.`,
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

  const isSuperAdmin = userRole === "SUPERADMIN";
  const isAdminOrSuperAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN";
  const filteredCabangData = isSuperAdmin
    ? tableData
    : tableData.filter(r => r.cabang.toUpperCase() === userCabang);

  const totalTarget = filteredCabangData.reduce((sum, row) => sum + row.target, 0);
  const totalRealisasi = filteredCabangData.reduce((sum, row) => sum + row.realisasi, 0);

  if (userRole !== null && !isAdminOrSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
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
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                Target <span className="text-emerald-500">&</span> Realisasi{" "}
                <span className="text-blue-500">Keuangan</span>
              </h1>
              <p className="text-slate-500 font-medium">Kelola target dan realisasi iuran</p>
            </motion.div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 text-emerald-600 border-r border-slate-100">
                  <FaCalendarAlt className="text-sm" />
                </div>
                <div className="flex items-center px-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <div className="w-[1px] h-4 bg-slate-200" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map(y => (
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

          {/* Module & View Switcher - only for super admin */}
          {isSuperAdmin && (
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
          )}

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key={activeModule}
            >
              {isSuperAdmin && (
                <SummaryCards
                  saldo={data[activeModule].saldo}
                  pemasukan={data[activeModule].pemasukan}
                  pengeluaran={data[activeModule].pengeluaran}
                  loading={loading}
                  type={activeModule}
                />
              )}

              {isSuperAdmin && <AIInsight insights={insights} loading={loading} />}

              <QuickActions />

              {/* Target & Realisasi Table Section */}
              <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 mt-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Setoran <span className="text-emerald-500">Per Cabang</span></h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Target dan realisasi iuran berdasarkan wilayah</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <th className="pb-5 text-center w-16">No</th>
                        <th className="pb-5">Cabang</th>
                        <th className="pb-5 text-right">Target</th>
                        <th className="pb-5 text-right">Realisasi</th>
                        <th className="pb-5 text-center">Keterangan</th>
                        <th className="pb-5 text-center">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tableLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-6 text-center"><div className="h-4 w-6 bg-slate-100 mx-auto rounded-full" /></td>
                            <td className="py-6"><div className="h-4 w-32 bg-slate-100 rounded-full" /></td>
                            <td className="py-6 text-right"><div className="h-6 w-24 bg-slate-100 ml-auto rounded-full" /></td>
                            <td className="py-6 text-right"><div className="h-6 w-24 bg-slate-100 ml-auto rounded-full" /></td>
                            <td className="py-6 text-center"><div className="h-6 w-20 bg-slate-100 mx-auto rounded-full" /></td>
                            <td className="py-6 text-center"><div className="h-8 w-20 bg-slate-100 mx-auto rounded-xl" /></td>
                          </tr>
                        ))
                      ) : filteredCabangData.length > 0 ? (
                        filteredCabangData.map((row, i) => {
                          const selisih = row.target - row.realisasi;
                          const isLunas = selisih <= 0;
                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="py-6 text-center text-slate-400 font-bold text-xs">{i + 1}</td>
                              <td className="py-6">
                                <span className="font-bold text-slate-700 block uppercase text-sm tracking-tight">{row.cabang}</span>
                              </td>
                              <td className="py-6 text-right">
                                <span className="font-bold text-slate-700 text-sm">{formatCurrency(row.target)}</span>
                              </td>
                              <td className="py-6 text-right">
                                <span className="font-bold text-emerald-600 text-sm">{formatCurrency(row.realisasi)}</span>
                              </td>
                              <td className="py-6 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold border shadow-sm ${isLunas
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                                  }`}>
                                  {isLunas ? (
                                    <><FaCheckCircle className="text-[10px]" /> LUNAS</>
                                  ) : (
                                    <><FaTimesCircle className="text-[10px]" /> KEKURANGAN</>
                                  )}
                                </span>
                              </td>
                              <td className="py-6 text-center">
                                <button
                                  onClick={() => router.push(`/keuangan-new/detail?cabang=${encodeURIComponent(row.cabang)}&bulan=${selectedMonth}&tahun=${selectedYear}`)}
                                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 px-5 py-2 rounded-2xl text-[10px] font-bold transition-all active:scale-95 shadow-sm hover:shadow-lg hover:shadow-emerald-100"
                                >
                                  <FaEye className="text-[10px]" />
                                  DETAIL
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-20 text-center">
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
                    {filteredCabangData.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-bold">
                          <td colSpan="2" className="px-4 py-5 text-[10px] uppercase tracking-widest">Total</td>
                          <td className="px-4 py-5 text-right text-sm">{formatCurrency(totalTarget)}</td>
                          <td className="px-4 py-5 text-right text-sm text-emerald-300">{formatCurrency(totalRealisasi)}</td>
                          <td className="px-4 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold border ${totalTarget - totalRealisasi <= 0
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              }`}>
                              {totalTarget - totalRealisasi <= 0 ? "LUNAS" : "KEKURANGAN"}
                            </span>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        {isSuperAdmin && <AIChat data={data[activeModule]} />}
      </div>
    </div>
  );
}
