"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUniversity, FaCalendarAlt, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
const MONTHS_FULL = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const cabang = branchParam || "-";

  const [tagihanData, setTagihanData] = useState([]);
  const [realisasiTrans, setRealisasiTrans] = useState([]);
  const [rekap, setRekap] = useState({ anggota: 0, subtotal: 0, peruntukanCabang: 0, totalTagihan: 0, totalRealisasi: 0, kekurangan: 0 });

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

  const parseCurrency = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return parseFloat(val.toString().replace(/[^0-9,-]/g, "").replace(",", ".")) || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balancingRes, orgRes, iuranRes, rekapIuran, rekapDerap, rekapDaspen] = await Promise.all([
        GlobalApi.getTransaksiBankBalancing("", null, selectedYear, selectedMonth, null, null),
        GlobalApi.getPemasukanUmum(),
        GlobalApi.getDefaultIuranById(2),
        GlobalApi.getRekapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDerapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDaspenByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
      ]);

      const safeData = Array.isArray(balancingRes) ? balancingRes : [];

      // Filter unique per NPA for this cabang
      const npaMap = {};
      safeData.forEach((item) => {
        if (item.cabang !== cabang) return;
        const key = `${item.cabang}-${item.unitKerja}-${item.npa}`;
        if (!npaMap[key] || item.id > npaMap[key].id) npaMap[key] = item;
      });
      const cabangData = Object.values(npaMap);

      // Rekapitulasi Iuran — pb + provinsi + kabupaten
      const rekapData = Array.isArray(rekapIuran) ? rekapIuran : [];
      const rekapByCabang = {};
      rekapData.forEach((r) => {
        const key = (r.cabang || "").trim().toUpperCase();
        if (!rekapByCabang[key]) {
          rekapByCabang[key] = { pb: 0, provinsi: 0, kabupaten: 0 };
        }
        rekapByCabang[key].pb += r.pb || 0;
        rekapByCabang[key].provinsi += r.provinsi || 0;
        rekapByCabang[key].kabupaten += r.kabupaten || 0;
      });
      const cabangKey = cabang.trim().toUpperCase();
      const rekapIuranTotal = rekapByCabang[cabangKey]
        ? (rekapByCabang[cabangKey].pb + rekapByCabang[cabangKey].provinsi + rekapByCabang[cabangKey].kabupaten)
        : 0;

      // Rekapitulasi Derap — peruntukan provinsi + peruntukan kabupaten
      const rekapDerapData = Array.isArray(rekapDerap) ? rekapDerap : [];
      const rekapDerapByCabang = {};
      let rekapDerapJumlah = 0;
      rekapDerapData.forEach((r) => {
        const key = (r.cabang || "").trim().toUpperCase();
        if (!rekapDerapByCabang[key]) {
          rekapDerapByCabang[key] = { provinsi: 0, kabupaten: 0, jumlah: 0 };
        }
        rekapDerapByCabang[key].provinsi += r.peruntukanProvinsi || 0;
        rekapDerapByCabang[key].kabupaten += r.peruntukanKabupaten || 0;
        rekapDerapByCabang[key].jumlah += r.jumlah || 0;
      });
      const rekapDerapTotal = rekapDerapByCabang[cabangKey]
        ? (rekapDerapByCabang[cabangKey].provinsi + rekapDerapByCabang[cabangKey].kabupaten)
        : 0;
      rekapDerapJumlah = rekapDerapByCabang[cabangKey]?.jumlah || 0;

      // Rekapitulasi Daspen — tagihan
      const rekapDaspenData = Array.isArray(rekapDaspen) ? rekapDaspen : [];
      const rekapDaspenByCabang = {};
      rekapDaspenData.forEach((r) => {
        const key = (r.cabang || "").trim().toUpperCase();
        if (!rekapDaspenByCabang[key]) {
          rekapDaspenByCabang[key] = { tagihan: 0, totalAnggota: 0 };
        }
        rekapDaspenByCabang[key].tagihan += r.tagihan || 0;
        rekapDaspenByCabang[key].totalAnggota += r.totalAnggota || 0;
      });
      const rekapDaspenTotal = rekapDaspenByCabang[cabangKey]?.tagihan || 0;
      const rekapDaspenAnggota = rekapDaspenByCabang[cabangKey]?.totalAnggota || 0;

      // Per-category breakdown
      const categories = [
        { label: "IURAN", field: "totalIuranAnggota" },
        { label: "SANDUKA", field: "totalIuranSanduka" },
        { label: "DASPEN", field: "totalIuranDaspen" },
        { label: "DERAP", field: "totalIuranDerap" },
        { label: "KALENDER", field: "totalIuranKalender" },
        { label: "LAIN-LAIN", field: "totalIuranSumbangan" },
      ];

      let subtotal = 0;
      let totalAnggota = 0;
      const tagihanRows = categories.map((cat) => {
        let count = 0;
        let total = 0;
        cabangData.forEach((item) => {
          const val = parseFloat(item[cat.field]) || 0;
          if (val > 0) {
            count++;
            total += val;
          }
        });
        if (cat.label === "IURAN" && rekapIuranTotal > 0) {
          total = rekapIuranTotal;
        }
        if (cat.label === "DERAP" && rekapDerapTotal > 0) {
          total = rekapDerapTotal;
          if (rekapDerapJumlah > 0) count = rekapDerapJumlah;
        }
        if (cat.label === "DASPEN" && rekapDaspenTotal > 0) {
          total = rekapDaspenTotal;
          if (rekapDaspenAnggota > 0) count = rekapDaspenAnggota;
        }
        subtotal += total;
        return { label: cat.label, count, total };
      });

      // Only show categories with data
      const filteredTagihan = tagihanRows.filter((r) => r.count > 0 || r.total > 0);
      totalAnggota = new Set(cabangData.map((d) => d.npa)).size;
      if (totalAnggota === 0) totalAnggota = cabangData.length;

      // Peruntukan cabang = besaran.cabang * total anggota
      const rateCabang = parseCurrency(iuranRes.cabang);
      const peruntukanCabang = rateCabang * totalAnggota;

      const totalTagihan = subtotal - peruntukanCabang;

      // --- REALISASI ---
      // Group potongan bank entries by date
      let totalPotBank = 0;
      cabangData.forEach((item) => {
        if (item.keterangan === "Sukses") {
          totalPotBank += parseFloat(item.potongan) || 0;
        }
      });

      const trans = [];
      if (totalPotBank > 0) {
        trans.push({ date: "", desc: "Potongan Bank", amount: totalPotBank });
      }

      // Add pemasukan organisasi for this cabang, filtered by month/year
      if (orgRes && Array.isArray(orgRes)) {
        orgRes.forEach((item) => {
          const cabangValue = typeof item.cabang === "object"
            ? item.cabang?.kecamatan || item.cabang?.cabang || item.cabang?.namaCabang
            : item.cabang;
          const cabangName = cabangValue || item.namaCabang || item.nama_cabang || "";
          if (cabangName.toUpperCase().trim() !== cabang.toUpperCase().trim()) return;

          // Filter by month/year
          const setoranBulan = Number(item.setoranBulan || item.setoran_bulan || 0);
          const setoranTahun = Number(item.setoranTahun || item.setoran_tahun || 0);
          if (setoranBulan !== selectedMonth || setoranTahun !== selectedYear) return;

          const nominal = parseCurrency(item.nominal || item.debet || item.debit);
          if (nominal > 0) {
            const ref = item.kodeBayar || item.nomorReferensi || item.idTransaksi || "";
            const refStr = ref ? ref.toString().slice(0, 8) : "";
            const label = refStr ? `${refStr} Transfer` : "Transfer";
            trans.push({ date: "", desc: label, amount: nominal });
          }
        });
      }

      const totalRealisasi = trans.reduce((s, t) => s + t.amount, 0);
      const kekurangan = totalTagihan - totalRealisasi;

      setTagihanData(filteredTagihan);
      setRealisasiTrans(trans);
      setRekap({ anggota: totalAnggota, subtotal, peruntukanCabang, totalTagihan, totalRealisasi, kekurangan });
    } catch (error) {
      console.error("Error fetching detail data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, cabang]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    fetchData();
  }, [fetchData]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const exportToExcel = () => {
    const rows = [];
    tagihanData.forEach((r) => rows.push({ Keterangan: r.label, Anggota: r.count, Jumlah: r.total }));
    rows.push({ Keterangan: "Subtotal", Jumlah: rekap.subtotal });
    rows.push({ Keterangan: "Peruntukan Cabang", Jumlah: -rekap.peruntukanCabang });
    rows.push({ Keterangan: "Total Tagihan", Jumlah: rekap.totalTagihan });
    rows.push({});
    realisasiTrans.forEach((r) => rows.push({ Keterangan: `${r.date} ${r.desc}`, Jumlah: r.amount }));
    rows.push({ Keterangan: "Total Realisasi", Jumlah: rekap.totalRealisasi });
    rows.push({ Keterangan: "Kekurangan", Jumlah: rekap.kekurangan });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");
    XLSX.writeFile(wb, `Target_Realisasi_${cabang}_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <HeaderMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <HeaderMobile toggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-8 mt-24 md:mt-20 max-w-[95%] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Target dan Realisasi</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 text-emerald-600 border-r border-slate-100"><FaCalendarAlt className="text-sm" /></div>
                <div className="flex items-center px-1">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
                    {MONTHS.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
                  </select>
                  <div className="w-[1px] h-4 bg-slate-200" />
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
                    {[2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
              </div>
              <button onClick={exportToExcel} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <FaDownload /><span>Export Excel</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 animate-pulse space-y-4">
              {Array(6).fill(0).map((_, i) => (<div key={i} className="h-6 bg-slate-100 rounded-full w-full" />))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl border border-slate-100 max-w-3xl mx-auto">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Target dan Realisasi</h2>
                <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
              </div>

              {/* Info */}
              <div className="space-y-1.5 mb-8 text-sm font-bold text-slate-600">
                <div className="flex">
                  <span className="w-28 text-slate-400 font-black uppercase tracking-wider text-[10px]">Bulan</span>
                  <span className="text-slate-800">: {MONTHS_FULL[selectedMonth]} {selectedYear}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-400 font-black uppercase tracking-wider text-[10px]">Cabang</span>
                  <span className="text-slate-800 uppercase font-black">: {cabang}</span>
                </div>
              </div>

              {/* TAGIHAN Section */}
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">TAGIHAN</h3>
                <div className="space-y-2">
                  {tagihanData.map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-700 w-28 md:w-32">{row.label}</span>
                        <span className="text-slate-500 font-bold">{row.count.toLocaleString("id-ID")}</span>
                      </div>
                      <span className="font-black text-slate-800 tabular-nums">{formatCurrency(row.total)}</span>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-sm">
                    <span className="font-black text-slate-600"></span>
                    <span className="font-black text-slate-800 tabular-nums">{formatCurrency(rekap.subtotal)}</span>
                  </div>
                </div>

                {/* Peruntukan Cabang */}
                <div className="mt-4 bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black text-indigo-600">Peruntukan Cabang</span>
                    <span className="font-black text-indigo-600 tabular-nums">({formatCurrency(rekap.peruntukanCabang)})</span>
                  </div>
                  <div className="flex items-center justify-between text-base border-t border-indigo-100 pt-2">
                    <span className="font-black text-slate-800">Total Tagihan</span>
                    <span className="font-black text-slate-900 text-lg tabular-nums">{formatCurrency(rekap.totalTagihan)}</span>
                  </div>
                </div>

                {/* Previous Month */}
                <div className="mt-4 text-xs text-slate-400 font-bold">
                  Tagihan bulan sebelumnya — {MONTHS_FULL[selectedMonth === 1 ? 12 : selectedMonth - 1]} {selectedMonth === 1 ? selectedYear - 1 : selectedYear}
                </div>
              </div>

              {/* REALISASI Section */}
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">REALISASI</h3>
                <div className="space-y-2">
                  {realisasiTrans.length > 0 ? realisasiTrans.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-xs font-bold w-24">{t.date}</span>
                        <span className="font-bold text-slate-600">{t.desc}</span>
                      </div>
                      <span className="font-black text-emerald-600 tabular-nums">{formatCurrency(t.amount)}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400 font-bold italic">Belum ada realisasi</div>
                  )}
                </div>

                {/* Total Realisasi */}
                <div className="mt-4 bg-emerald-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black text-emerald-700">Total Realisasi</span>
                    <span className="font-black text-emerald-700 text-lg tabular-nums">{formatCurrency(rekap.totalRealisasi)}</span>
                  </div>
                </div>

                {/* Kekurangan */}
                <div className={`mt-3 rounded-2xl p-4 ${rekap.kekurangan <= 0 ? "bg-blue-50" : "bg-rose-50"}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-black ${rekap.kekurangan <= 0 ? "text-blue-700" : "text-rose-700"}`}>
                      {rekap.kekurangan <= 0 ? "KELEBIHAN" : "KEKURANGAN"} CABANG
                    </span>
                    <span className={`font-black text-lg tabular-nums ${rekap.kekurangan <= 0 ? "text-blue-700" : "text-rose-700"}`}>
                      {formatCurrency(Math.abs(rekap.kekurangan))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kalender Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-black text-xs uppercase tracking-widest">Kalender</span>
                  <span className="text-amber-500">—</span>
                  <span className="text-amber-600 text-sm font-bold italic">Distribusi belum terisi otomatis</span>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
