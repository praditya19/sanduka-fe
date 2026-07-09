"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

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
  const bulanParam = searchParams.get("bulan");
  const tahunParam = searchParams.get("tahun");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    bulanParam ? parseInt(bulanParam) : now.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    tahunParam ? parseInt(tahunParam) : now.getFullYear()
  );
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
      const [balancingRes, iuranRes, rekapIuran, rekapDerap, rekapDaspen, rekapKalender, transaksiCabangRes] = await Promise.all([
        GlobalApi.getTransaksiBankBalancing("", null, selectedYear, selectedMonth, null, null),
        GlobalApi.getDefaultIuranById(2),
        GlobalApi.getRekapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDerapByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapDaspenByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getRekapKalenderByPeriode(MONTHS_FULL[selectedMonth], selectedYear),
        GlobalApi.getTransaksiCabangByBulanTahun(selectedMonth, selectedYear),
      ]);

      const safeData = Array.isArray(balancingRes) ? balancingRes : [];

      // Filter by cabang (tidak deduplikasi — jumlahkan semua entry, sama seperti di IuranPgri)
      const cabangData = safeData.filter((item) => item.cabang === cabang);

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
            return { label: row.label, count: row.count, total: tcData.tagihan, bayar: tcData.pembayaran || 0, keterangan: posKeterangan[tcPos] || "" };
          }
        }
        return row;
      });

      // Add non-overlapping pos as extra tagihan rows (skip Pemasukan Dari Bank — shown in REALISASI)
      const extraTagihanRows = [];
      Object.entries(posGroup).forEach(([pos, vals]) => {
        if (!usedPosLabels.has(pos.toUpperCase())) {
          if (pos.toUpperCase() === "PEMASUKAN DARI BANK") return;
          extraTagihanRows.push({ label: pos.toUpperCase(), count: vals.count, total: vals.tagihan, bayar: vals.pembayaran || 0, keterangan: posKeterangan[pos] || "" });
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
        if ((item.keterangan || "").toLowerCase() === "sukses") {
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

  const exportPDF = async () => {
    const el = document.getElementById("receipt-content");
    if (!el) return;
    await document.fonts.ready;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const maxW = pw - margin * 2;
    const maxH = ph - margin * 2;
    const r = Math.min(maxW / canvas.width, maxH / canvas.height);
    const w = canvas.width * r;
    const h = canvas.height * r;
    const x = (pw - w) / 2;
    const y = (ph - h) / 2;

    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(`Target_Realisasi_${cabang}_${selectedMonth}_${selectedYear}.pdf`);
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
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Target dan Realisasi</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 text-emerald-600 border-r border-slate-100"><FaCalendarAlt className="text-sm" /></div>
                <div className="flex items-center px-1">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
                    {MONTHS.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
                  </select>
                  <div className="w-[1px] h-4 bg-slate-200" />
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat">
                    {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
              </div>
              <button onClick={exportPDF} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 animate-pulse space-y-4">
              {Array(6).fill(0).map((_, i) => (<div key={i} className="h-6 bg-slate-100 rounded-full w-full" />))}
            </div>
          ) : (
            <div id="receipt-content" className="bg-white rounded-[32px] shadow-xl border border-slate-100 max-w-xl mx-auto">
              {/* Receipt Header */}
              <div className="px-5 pt-5 pb-3 text-center">
                <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">Target &amp; Realisasi</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-[11px] font-semibold uppercase tracking-wider">
                    <FaCalendarAlt className="text-[9px]" />
                    {MONTHS_FULL[selectedMonth]} {selectedYear}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider">
                    <span className="text-[9px]">#</span>
                    {cabang}
                  </span>
                </div>
                <div className="mt-1.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded-full">
                  {(() => { const d = new Date(); return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); })()}
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="border-t-2 border-dashed border-slate-200 mx-6 md:mx-8" />

              {/* TAGIHAN Section */}
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <div className="w-0.5 h-3 bg-violet-500 rounded-full" />
                  <h3 className="text-xs font-bold text-violet-600 uppercase tracking-[0.1em]">Tagihan</h3>
                </div>
                <div className="space-y-px">
                  {tagihanData.map((row, i) => (
                    <div key={i} className={`${i % 2 === 0 ? "bg-violet-50/40" : ""} -mx-2 px-2 py-1.5 rounded-lg`}>
                      <div className="grid grid-cols-[1fr_auto] gap-x-2 text-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-slate-700 whitespace-nowrap">{row.label}</span>
                          {row.count > 1 && (
                            <span className="text-[10px] font-semibold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded shrink-0 tracking-[0.15em]">{row.count.toLocaleString("id-ID")}</span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(row.total)}</span>
                      </div>
                      {/* Bayar sub-row */}
                      <div className="flex items-center justify-between text-xs ml-1 mt-0.5">
                        <span className="text-slate-400 font-medium">Bayar</span>
                        <span className="font-semibold text-emerald-600 tabular-nums">{formatCurrency(row.bayar || 0)}</span>
                      </div>
                      {row.keterangan ? (
                        <div className="text-[10px] text-slate-400 font-medium mt-px ml-1">{row.keterangan}</div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Total Tagihan */}
                <div className="mt-2.5 flex items-center justify-between bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl px-4 py-3 shadow-md shadow-violet-200">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Tagihan</span>
                  <span className="font-bold text-white text-sm tabular-nums">{formatCurrency(rekap.totalTagihan)}</span>
                </div>

                {/* Total Pembayaran */}
                {(() => {
                  const totalBayar = tagihanData.reduce((s, r) => s + (r.bayar || 0), 0);
                  return (
                    <div className="mt-2 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl px-4 py-3 shadow-md shadow-emerald-200">
                      <span className="font-bold text-white text-xs uppercase tracking-wider">Pembayaran</span>
                      <span className="font-bold text-white text-sm tabular-nums">{formatCurrency(totalBayar)}</span>
                    </div>
                  );
                })()}

                {/* Tagihan - Pembayaran */}
                {(() => {
                  const totalBayar = tagihanData.reduce((s, r) => s + (r.bayar || 0), 0);
                  const sisa = rekap.totalTagihan - totalBayar;
                  return (
                    <div className={`mt-2 rounded-xl px-4 py-3 ${sisa > 0 ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow shadow-rose-200" : "bg-gradient-to-r from-slate-600 to-slate-700 shadow shadow-slate-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs uppercase tracking-wider">
                          Tagihan - Pembayaran
                        </span>
                        <span className="font-bold text-white text-sm tabular-nums">
                          {sisa > 0 ? "-" + formatCurrency(sisa) : formatCurrency(Math.abs(sisa))}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Previous Month */}
                {cabangTrans.filter(t => {
                  const prevBulan = selectedMonth === 1 ? 12 : selectedMonth - 1;
                  const prevTahun = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                  return t.setoranBulan === prevBulan && t.setoranTahun === prevTahun;
                }).length > 0 && (
                    <div className="mt-2 p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
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
                          <div key={pos} className="flex items-center justify-between text-xs bg-white/70 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="font-semibold text-amber-800">{pos}</span>
                            <span className="font-bold text-rose-600">{formatCurrency(v.tagihan - v.pembayaran)}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
              </div>

              {/* REALISASI Section */}
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <div className="w-0.5 h-3 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.1em]">Realisasi</h3>
                </div>
                <div className="space-y-px">
                  {realisasiTrans.length > 0 ? realisasiTrans.map((t, i) => (
                    <div key={i} className={`${i % 2 === 0 ? "bg-emerald-50/40" : ""} -mx-2 px-2 py-1.5 rounded-lg`}>
                      <div className="flex items-start justify-between text-sm">
                        <div className="min-w-0 mr-3">
                          <div className="flex items-center gap-1">
                            {t.date && <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{t.date}</span>}
                            <span className="font-semibold text-slate-700">{t.desc}</span>
                          </div>
                          {t.keterangan && <div className="text-[10px] text-slate-400 font-medium mt-px ml-1">{t.keterangan}</div>}
                        </div>
                        <span className="font-bold text-emerald-600 tabular-nums text-right shrink-0 text-sm">{formatCurrency(t.amount)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400 font-semibold italic py-1.5 text-center">Belum ada realisasi</div>
                  )}
                </div>

                {/* Total Realisasi */}
                <div className="mt-2.5 flex items-center justify-between bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl px-4 py-3 shadow-md shadow-amber-200">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Jumlah Realisasi</span>
                  <span className="font-bold text-white text-sm tabular-nums">{formatCurrency(rekap.totalRealisasi)}</span>
                </div>
              </div>

              {/* Bottom Summary */}
              {(() => {
                const totalBayar = tagihanData.reduce((s, r) => s + (r.bayar || 0), 0);
                const sisa = rekap.totalRealisasi - totalBayar;
                const pengembalianKekurangan = (rekap.totalTagihan - totalBayar) - (rekap.totalRealisasi - totalBayar);
                return (
                  <div className="px-5 pb-5 pt-2 space-y-2">
                    <div className={`rounded-xl px-4 py-3 ${sisa < 0 ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow shadow-rose-200" : "bg-gradient-to-r from-slate-600 to-slate-700 shadow shadow-slate-200"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-[12px] uppercase tracking-wider shrink-0">Realisasi - Pembayaran</span>
                        <span className="font-bold text-white text-[12px] tabular-nums ml-2 text-right shrink-0">
                          {formatCurrency(rekap.totalRealisasi)} - {formatCurrency(totalBayar)} = {sisa < 0 ? "-" + formatCurrency(Math.abs(sisa)) : formatCurrency(sisa)}
                        </span>
                      </div>
                      {sisa >= 0 && (
                        <div className="mt-1.5 text-[10px] font-medium text-white/80 italic">
                          bila nilai lebih bukan minus maka uang dikurangkan, bila minus tidak perlu dikurangkan
                        </div>
                      )}
                    </div>
                    {(() => {
                      // If Realisasi - Pembayaran is negative, use Tagihan - Pembayaran
                      // If Realisasi - Pembayaran is positive, use (Tagihan - Pembayaran) - (Realisasi - Pembayaran) = Tagihan - Realisasi
                      const pengembalian = sisa < 0
                        ? (rekap.totalTagihan - totalBayar)
                        : (rekap.totalTagihan - rekap.totalRealisasi);
                      const isKekurangan = pengembalian > 0;
                      return (
                        <div className={`rounded-xl px-4 py-3 ${isKekurangan ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow shadow-rose-200" : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow shadow-emerald-200"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs uppercase tracking-wider">Pengembalian / Kekurangan</span>
                            <span className="font-bold text-white text-sm tabular-nums">
                              {isKekurangan ? "-" + formatCurrency(pengembalian) : formatCurrency(Math.abs(pengembalian))}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
