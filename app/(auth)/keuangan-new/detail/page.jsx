"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUniversity, FaCalendarAlt, FaDownload } from "react-icons/fa";

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
  const [cabangTrans, setCabangTrans] = useState([]);

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
      const [balancingRes, orgRes, iuranRes, rekapIuran, rekapDerap, rekapDaspen, rekapKalender, transaksiCabangRes] = await Promise.all([
        GlobalApi.getTransaksiBankBalancing("", null, selectedYear, selectedMonth, null, null),
        GlobalApi.getPemasukanUmum(),
        GlobalApi.getDefaultIuranById(2),
        GlobalApi.getRekapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDerapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDaspenByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapKalenderByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getTransaksiCabangByBulanTahun(selectedMonth, selectedYear),
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
        if (cat.label === "KALENDER") {
          const rekapKalenderData = Array.isArray(rekapKalender) ? rekapKalender : [];
          const kalenderCabang = rekapKalenderData.find(r => (r.cabang || "").trim().toUpperCase() === cabangKey);
          if (kalenderCabang) {
            const kalTotal = (kalenderCabang.peruntukanProvinsi || 0) + (kalenderCabang.peruntukanKabupaten || 0);
            if (kalTotal > 0) {
              total = kalTotal;
              count = kalenderCabang.jumlah || count;
            }
          }
        }
        subtotal += total;
        return { label: cat.label, count, total };
      });

      // --- TAGIHAN CABANG (from transaksi_cabang table) ---
      const catPosMap = { "IURAN": "Iuran PGRI", "SANDUKA": "Sanduka", "DASPEN": "Daspen", "DERAP": "Derap", "KALENDER": "Kalender" };
      const catPosReverse = Object.fromEntries(Object.entries(catPosMap).map(([k, v]) => [v.toUpperCase(), k]));
      const cabangTransData = Array.isArray(transaksiCabangRes) ? transaksiCabangRes : transaksiCabangRes?.data || [];
      const cabangTrans = cabangTransData.filter(t => t.cabang?.trim().toUpperCase() === cabangKey);

      // Group transaksi_cabang by pos, sum tagihan & pembayaran
      const posGroup = {};
      cabangTrans.forEach(t => {
        const p = t.pos || "Lain-lain";
        if (!posGroup[p]) posGroup[p] = { count: 0, tagihan: 0, pembayaran: 0 };
        posGroup[p].count++;
        posGroup[p].tagihan += Number(t.tagihan || 0);
        posGroup[p].pembayaran += Number(t.pembayaran || 0);
      });

      // Replace rekap values with transaksi_cabang values where available
      // Track keterangan per pos from individual transaksi_cabang items
      const posKeterangan = {};
      cabangTrans.forEach(t => {
        const p = t.pos || "Lain-lain";
        if (t.keterangan && !posKeterangan[p]) {
          posKeterangan[p] = t.keterangan;
        }
      });

      const usedPosLabels = new Set();
      const updatedTagihanRows = tagihanRows.map(row => {
        const matchingPos = Object.keys(catPosMap).find(k => k === row.label);
        if (matchingPos) {
          const tcPos = catPosMap[matchingPos];
          const tcData = posGroup[tcPos];
          if (tcData && tcData.tagihan > 0) {
            usedPosLabels.add(tcPos.toUpperCase());
            subtotal += tcData.tagihan - row.total;
            return { label: row.label, count: row.count, total: tcData.tagihan, keterangan: posKeterangan[tcPos] || "" };
          }
        }
        return row;
      });

      // Add non-overlapping pos as extra tagihan rows (skip Pemasukan Dari Bank — shown in REALISASI)
      const extraTagihanRows = [];
      Object.entries(posGroup).forEach(([pos, vals]) => {
        if (!usedPosLabels.has(pos.toUpperCase())) {
          if (pos.toUpperCase() === "PEMASUKAN DARI BANK") return;
          extraTagihanRows.push({ label: pos.toUpperCase(), count: vals.count, total: vals.tagihan, keterangan: posKeterangan[pos] || "" });
          subtotal += vals.tagihan;
        }
      });

      // Only show KALENDER if there's a matching transaksi_cabang entry
      const hasKalenderTc = Object.keys(posGroup).some(p => p.toUpperCase() === "KALENDER");
      // Custom sort order: PGRI, SANDUKA, DASPEN, DERAP, KALENDER, then others
      const sortOrder = { "IURAN": 1, "SANDUKA": 2, "DASPEN": 3, "DERAP": 4, "KALENDER": 5 };
      const filteredTagihan = [...updatedTagihanRows.filter((r) => {
        if (r.total === 0) return false;
        if (r.label === "KALENDER" && !hasKalenderTc) {
          subtotal -= r.total;
          return false;
        }
        return r.count > 0 || r.total > 0;
      }), ...extraTagihanRows]
        .sort((a, b) => (sortOrder[a.label] || 99) - (sortOrder[b.label] || 99));
      totalAnggota = new Set(cabangData.map((d) => d.npa)).size;
      if (totalAnggota === 0) totalAnggota = cabangData.length;

      // Peruntukan cabang = besaran.cabang * total anggota
      const rateCabang = parseCurrency(iuranRes.cabang);
      const peruntukanCabang = rateCabang * totalAnggota;

      const totalTagihan = subtotal;

      // --- REALISASI ---
      let totalPotBank = 0;
      cabangData.forEach((item) => {
        if (item.keterangan === "Sukses") {
          totalPotBank += parseFloat(item.potongan) || 0;
        }
      });

      const formatDateLocal = (d) => {
        if (!d) return "";
        if (Array.isArray(d)) {
          const [y, m, day] = d;
          return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
        }
        const dt = new Date(d);
        if (isNaN(dt)) return String(d);
        return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
      };

      const trans = [];
      if (totalPotBank > 0) {
        trans.push({ date: `01/${String(selectedMonth).padStart(2, "0")}/${selectedYear}`, desc: "Transfer System Bank", keterangan: "", amount: totalPotBank });
      }

      // Pemasukan Dari Bank items from transaksi_cabang → shown in REALISASI
      cabangTrans.forEach((t) => {
        if ((t.pos || "").toUpperCase() === "PEMASUKAN DARI BANK") {
          const nominal = Number(t.tagihan || 0);
          if (nominal > 0) {
            trans.push({ date: formatDateLocal(t.tanggalTransaksi), desc: t.pos || "Pemasukan Dari Bank", keterangan: t.keterangan || "", amount: nominal });
          }
        }
      });

      // Add pemasukan organisasi for this cabang, filtered by month/year
      if (orgRes && Array.isArray(orgRes)) {
        orgRes.forEach((item) => {
          const cabangValue = typeof item.cabang === "object"
            ? item.cabang?.kecamatan || item.cabang?.cabang || item.cabang?.namaCabang
            : item.cabang;
          const cabangName = cabangValue || item.namaCabang || item.nama_cabang || "";
          if (cabangName.toUpperCase().trim() !== cabang.toUpperCase().trim()) return;

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
      setCabangTrans(cabangTrans);
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

  const exportToPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("receipt-content");
    if (!element) return;
    const opt = {
      margin: 1,
      filename: `Target_Realisasi_${cabang}_${selectedMonth}_${selectedYear}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "avoid-all" },
    };
    html2pdf().from(element).set(opt).save();
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
                    {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
              </div>
              <button onClick={exportToPDF} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <FaDownload /><span>Export PDF</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 animate-pulse space-y-4">
              {Array(6).fill(0).map((_, i) => (<div key={i} className="h-6 bg-slate-100 rounded-full w-full" />))}
            </div>
          ) : (
            <motion.div id="receipt-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] shadow-xl border border-slate-100 max-w-lg mx-auto overflow-hidden">
              {/* Top Accent Bar */}
              <div className="h-2 bg-gradient-to-r from-violet-500 via-emerald-500 to-violet-500" />

              {/* Receipt Header */}
              <div className="px-6 md:px-8 pt-6 pb-5 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl shadow-lg shadow-violet-200 mb-4">
                  <FaUniversity className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Target &amp; Realisasi</h2>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    <FaCalendarAlt className="text-[9px]" />
                    {MONTHS_FULL[selectedMonth]} {selectedYear}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">
                    <FaUniversity className="text-[9px]" />
                    {cabang}
                  </span>
                </div>
                <div className="mt-3 text-[9px] font-mono font-bold text-slate-400 bg-slate-50 inline-block px-4 py-1.5 rounded-full">
                  {(() => { const d = new Date(); return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); })()}
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="border-t-2 border-dashed border-slate-200 mx-6 md:mx-8" />

              {/* TAGIHAN Section */}
              <div className="px-6 md:px-8 pt-5 pb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1 h-4 bg-violet-500 rounded-full" />
                  <h3 className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">Tagihan</h3>
                </div>
                <div className="space-y-0.5">
                  {tagihanData.map((row, i) => (
                    <div key={i} className={`${i % 2 === 0 ? "bg-violet-50/40" : ""} -mx-2 px-2 py-1.5 rounded-lg`}>
                      <div className="grid grid-cols-[1fr_auto] gap-x-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-slate-700 truncate">{row.label}</span>
                          {row.count > 1 && (
                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">{row.count.toLocaleString("id-ID")} org</span>
                          )}
                        </div>
                        <span className="font-black text-violet-600 text-right tabular-nums">{formatCurrency(row.total)}</span>
                      </div>
                      {row.keterangan ? (
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5 ml-1">{row.keterangan}</div>
                      ) : (
                        <div className="text-[9px] text-slate-200 font-medium mt-0.5 ml-1">-</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Tagihan */}
                <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl px-5 py-4 shadow-lg shadow-violet-200">
                  <span className="font-black text-white text-sm uppercase tracking-wider">Total Tagihan</span>
                  <span className="font-black text-white text-lg tabular-nums">{formatCurrency(rekap.totalTagihan)}</span>
                </div>

                {/* Previous Month */}
                {cabangTrans.filter(t => {
                  const prevBulan = selectedMonth === 1 ? 12 : selectedMonth - 1;
                  const prevTahun = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                  return t.setoranBulan === prevBulan && t.setoranTahun === prevTahun;
                }).length > 0 && (
                    <div className="mt-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                          Tagihan bln sebelumnya — {MONTHS_FULL[selectedMonth === 1 ? 12 : selectedMonth - 1]} {selectedMonth === 1 ? selectedYear - 1 : selectedYear}
                        </span>
                      </div>
                      {(() => {
                        const prevBulan = selectedMonth === 1 ? 12 : selectedMonth - 1;
                        const prevTahun = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                        const prevTrans = cabangTrans.filter(t => t.setoranBulan === prevBulan && t.setoranTahun === prevTahun);
                        const prevGroups = {};
                        prevTrans.forEach(t => {
                          const p = t.pos || "Lain-lain";
                          if (!prevGroups[p]) prevGroups[p] = { tagihan: 0, pembayaran: 0 };
                          prevGroups[p].tagihan += Number(t.tagihan || 0);
                          prevGroups[p].pembayaran += Number(t.pembayaran || 0);
                        });
                        return Object.entries(prevGroups).map(([pos, v]) => (
                          <div key={pos} className="flex items-center justify-between text-[11px] bg-white/70 rounded-xl px-3 py-2 border border-amber-100">
                            <span className="font-bold text-amber-800">{pos}</span>
                            <span className="font-black text-rose-600">{formatCurrency(v.tagihan - v.pembayaran)}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
              </div>

              {/* REALISASI Section */}
              <div className="px-6 md:px-8 pt-5 pb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Realisasi</h3>
                </div>
                <div className="space-y-1">
                  {realisasiTrans.length > 0 ? realisasiTrans.map((t, i) => (
                    <div key={i} className={`${i % 2 === 0 ? "bg-emerald-50/40" : ""} -mx-2 px-2 py-2 rounded-lg`}>
                      <div className="flex items-start justify-between text-sm">
                        <div className="min-w-0 mr-4">
                          <div className="flex items-center gap-1.5">
                            {t.date && <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{t.date}</span>}
                            <span className="font-bold text-slate-700">{t.desc}</span>
                          </div>
                          {t.keterangan && <div className="text-[9px] text-slate-400 font-medium mt-0.5 ml-1">{t.keterangan}</div>}
                        </div>
                        <span className="font-black text-emerald-600 tabular-nums text-right shrink-0">{formatCurrency(t.amount)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400 font-bold italic py-2 text-center">Belum ada realisasi</div>
                  )}
                </div>

                {/* Total Realisasi */}
                <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl px-5 py-4 shadow-lg shadow-emerald-200">
                  <span className="font-black text-white text-sm uppercase tracking-wider">Total Realisasi</span>
                  <span className="font-black text-white text-lg tabular-nums">{formatCurrency(rekap.totalRealisasi)}</span>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="px-6 md:px-8 pb-6 pt-3">
                <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target - Realisasi</span>
                    <span className="font-black text-slate-600 text-sm tabular-nums">
                      {formatCurrency(rekap.totalTagihan)} - {formatCurrency(rekap.totalRealisasi)}
                    </span>
                  </div>
                </div>

                {/* Kurang / Sisa */}
                <div className={`mt-3 rounded-2xl px-5 py-4 ${rekap.kekurangan > 0 ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-200" : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-sm uppercase tracking-wider">
                      {rekap.kekurangan > 0 ? "Kurang" : "Sisa"}
                    </span>
                    <span className="font-black text-white text-xl tabular-nums">
                      {rekap.kekurangan > 0 ? "-" + formatCurrency(rekap.kekurangan) : formatCurrency(Math.abs(rekap.kekurangan))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
