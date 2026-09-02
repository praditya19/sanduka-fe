"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FaSyncAlt, FaPrint, FaFileExcel, FaCoins, FaHandHoldingHeart, FaNewspaper, FaCalendarAlt, FaChartBar, FaStar, FaGift } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const MONTHS = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
  { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

const formatRp = (v) => {
  const n = Number(v || 0);
  return "Rp" + n.toLocaleString("id-ID");
};

const toNumber = (v) => Number(v || 0);

export default function RekapitulasiSection() {
  const [userRole, setUserRole] = useState(null);
  const [userCabang, setUserCabang] = useState("");
  const isSuperAdmin = userRole === "SUPERADMIN";

  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [mergedData, setMergedData] = useState([]);
  const [cabangList, setCabangList] = useState([]);

  // Read role from session
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const cabang = (sessionStorage.getItem("cabang") || "").toUpperCase();
    setUserRole(role);
    setUserCabang(cabang);
  }, []);

  const bulanLabel = MONTHS.find(m => m.value === selectedMonth)?.label || "";

  const fetchAll = useCallback(async () => {
    if (!bulanLabel) return;
    setLoading(true);
    try {
      const [resCabang, resIuran, resDaspen, resDerap, resKalender, resAnggota, resHut, resTargetLain, resPos] = await Promise.all([
        GlobalApi.getCabang(),
        GlobalApi.getRekapByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapDaspenByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapDerapByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapKalenderByPeriode(bulanLabel, selectedYear),
        GlobalApi.getIuranAnggotaAll(bulanLabel, selectedYear).catch(() => ({ data: [] })),
        GlobalApi.getTotalIuranSumbanganHut(selectedYear, selectedMonth).catch(() => ({ data: [] })),
        GlobalApi.getTableTargetLainLain(bulanLabel, selectedYear, "").catch(() => ({ data: [] })),
        GlobalApi.getPosLainLain().catch(() => ({ data: [] })),
      ]);

      const cabangs = (resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
      setCabangList(cabangs);

      const iuranList = Array.isArray(resIuran) ? resIuran : resIuran?.data || [];
      const daspenList = Array.isArray(resDaspen) ? resDaspen : resDaspen?.data || [];
      const derapList = Array.isArray(resDerap) ? resDerap : resDerap?.data || [];
      const kalenderList = Array.isArray(resKalender) ? resKalender : resKalender?.data || [];
      const anggotaList = Array.isArray(resAnggota) ? resAnggota : resAnggota?.data || [];
      const hutList = Array.isArray(resHut) ? resHut : resHut?.data || [];
      const targetLainList = Array.isArray(resTargetLain) ? resTargetLain : resTargetLain?.data || [];
      const posList = Array.isArray(resPos) ? resPos : resPos?.data || [];

      const matchedPos = posList.find((p) => {
        const pBulan = (p.bulan || "").trim().toLowerCase();
        const pTahun = String(p.tahun || "").trim();
        return (
          (!pBulan || pBulan === bulanLabel.toLowerCase()) &&
          (!pTahun || pTahun === String(selectedYear))
        );
      }) || posList[0];
      const posNominal = toNumber(matchedPos?.nominal || 0);

      const normalize = (s) => (s || "").trim().toUpperCase();

      const byCabang = {};
      for (const r of iuranList) { const key = normalize(r.cabang); if (!byCabang[key]) byCabang[key] = {}; byCabang[key].iuran = r; }
      for (const r of daspenList) { const key = normalize(r.cabang); if (!byCabang[key]) byCabang[key] = {}; byCabang[key].daspen = r; }
      for (const r of derapList) { const key = normalize(r.cabang); if (!byCabang[key]) byCabang[key] = {}; byCabang[key].derap = r; }
      for (const r of kalenderList) { const key = normalize(r.cabang); if (!byCabang[key]) byCabang[key] = {}; byCabang[key].kalender = r; }
      for (const r of targetLainList) { const key = normalize(r.cabang); if (!byCabang[key]) byCabang[key] = {}; byCabang[key].targetLain = r; }

      const lainByCabang = {};
      for (const r of anggotaList) {
        const key = normalize(r.cabang);
        if (!lainByCabang[key]) lainByCabang[key] = 0;
        lainByCabang[key] += toNumber(r.totalIuranSumbangan);
      }

      const hutByCabang = {};
      for (const r of hutList) {
        const key = normalize(r.cabang);
        hutByCabang[key] = toNumber(r.totalHut || r.nominal || 0);
      }

      const merged = cabangs.map((c, idx) => {
        const key = normalize(c.kecamatan);
        const d = byCabang[key] || {};

        const anggota = toNumber(d.iuran?.totalAnggota);
        const iuranDefault = toNumber(d.iuran?.cabangIuran);
        const iuranTambahan = toNumber(d.iuran?.tambahanCabang);
        const iuranTotal = iuranDefault + iuranTambahan;

        const daspenDefault = toNumber(d.daspen?.tagihan);
        const daspenTambahan = 0;
        const daspenTotal = daspenDefault + daspenTambahan;

        const derapDefault = toNumber(d.derap?.peruntukanProvinsi) + toNumber(d.derap?.peruntukanKabupaten);
        const derapTambahan = toNumber(d.derap?.tambahanCabang);
        const derapTotal = derapDefault + derapTambahan;

        const kalenderDefault = toNumber(d.kalender?.peruntukanProvinsi) + toNumber(d.kalender?.peruntukanKabupaten);
        const kalenderTambahan = toNumber(d.kalender?.tambahanCabang);
        const kalenderTotal = kalenderDefault + kalenderTambahan;

        // HUT calculation from iuran_sumbangan_hut or target_lain_lain or pos rate fallback
        let hutDefault = toNumber(hutByCabang[key]);
        if (hutDefault === 0 && d.targetLain) {
          const tJumlah = toNumber(d.targetLain.jumlah || 0);
          const tNom = posNominal || toNumber(d.targetLain.nominal || 0) || 10000;
          hutDefault = toNumber(d.targetLain.total) || toNumber(d.targetLain.perolehanKabupaten) || (tJumlah * tNom);
        }
        if (hutDefault === 0 && posNominal > 0 && anggota > 0) {
          hutDefault = posNominal * anggota;
        }
        const hutTambahan = 0;

        const lainDefault = toNumber(lainByCabang[key]);
        const lainTambahan = 0;

        const totalDefault = iuranDefault + daspenDefault + derapDefault + kalenderDefault + hutDefault + lainDefault;
        const totalTambahan = iuranTambahan + daspenTambahan + derapTambahan + kalenderTambahan;

        return {
          no: idx + 1,
          cabang: c.kecamatan,
          iuranDefault, iuranTambahan, iuranTotal,
          daspenDefault, daspenTambahan, daspenTotal,
          derapDefault, derapTambahan, derapTotal,
          kalenderDefault, kalenderTambahan, kalenderTotal,
          hutDefault, hutTambahan,
          lainDefault, lainTambahan,
          totalDefault, totalTambahan,
        };
      });

      setMergedData(merged);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
      toast.error("Gagal memuat data rekap.");
    } finally {
      setLoading(false);
    }
  }, [bulanLabel, selectedYear]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const grandTotal = useMemo(() => {
    const zero = () => ({ iuranDefault: 0, iuranTambahan: 0, iuranTotal: 0, daspenDefault: 0, daspenTambahan: 0, daspenTotal: 0, derapDefault: 0, derapTambahan: 0, derapTotal: 0, kalenderDefault: 0, kalenderTambahan: 0, kalenderTotal: 0, hutDefault: 0, hutTambahan: 0, lainDefault: 0, lainTambahan: 0, totalDefault: 0, totalTambahan: 0 });
    return mergedData.reduce((acc, r) => ({
      iuranDefault: acc.iuranDefault + r.iuranDefault,
      iuranTambahan: acc.iuranTambahan + r.iuranTambahan,
      iuranTotal: acc.iuranTotal + r.iuranTotal,
      daspenDefault: acc.daspenDefault + r.daspenDefault,
      daspenTambahan: acc.daspenTambahan + r.daspenTambahan,
      daspenTotal: acc.daspenTotal + r.daspenTotal,
      derapDefault: acc.derapDefault + r.derapDefault,
      derapTambahan: acc.derapTambahan + r.derapTambahan,
      derapTotal: acc.derapTotal + r.derapTotal,
      kalenderDefault: acc.kalenderDefault + r.kalenderDefault,
      kalenderTambahan: acc.kalenderTambahan + r.kalenderTambahan,
      kalenderTotal: acc.kalenderTotal + r.kalenderTotal,
      hutDefault: acc.hutDefault + r.hutDefault,
      hutTambahan: acc.hutTambahan + r.hutTambahan,
      lainDefault: acc.lainDefault + r.lainDefault,
      lainTambahan: acc.lainTambahan + r.lainTambahan,
      totalDefault: acc.totalDefault + r.totalDefault,
      totalTambahan: acc.totalTambahan + r.totalTambahan,
    }), zero());
  }, [mergedData]);

  const totalKeseluruhan = grandTotal.totalDefault + grandTotal.totalTambahan;

  // Filter data for non-superadmin to only show their cabang
  const filteredMergedData = useMemo(() => {
    if (isSuperAdmin) return mergedData;
    if (!userCabang) return mergedData;
    return mergedData.filter(r => r.cabang.toUpperCase() === userCabang);
  }, [mergedData, isSuperAdmin, userCabang]);

  const filteredGrandTotal = useMemo(() => {
    const zero = () => ({ iuranDefault: 0, iuranTambahan: 0, iuranTotal: 0, daspenDefault: 0, daspenTambahan: 0, daspenTotal: 0, derapDefault: 0, derapTambahan: 0, derapTotal: 0, kalenderDefault: 0, kalenderTambahan: 0, kalenderTotal: 0, hutDefault: 0, hutTambahan: 0, lainDefault: 0, lainTambahan: 0, totalDefault: 0, totalTambahan: 0 });
    return filteredMergedData.reduce((acc, r) => ({
      iuranDefault: acc.iuranDefault + r.iuranDefault,
      iuranTambahan: acc.iuranTambahan + r.iuranTambahan,
      iuranTotal: acc.iuranTotal + r.iuranTotal,
      daspenDefault: acc.daspenDefault + r.daspenDefault,
      daspenTambahan: acc.daspenTambahan + r.daspenTambahan,
      daspenTotal: acc.daspenTotal + r.daspenTotal,
      derapDefault: acc.derapDefault + r.derapDefault,
      derapTambahan: acc.derapTambahan + r.derapTambahan,
      derapTotal: acc.derapTotal + r.derapTotal,
      kalenderDefault: acc.kalenderDefault + r.kalenderDefault,
      kalenderTambahan: acc.kalenderTambahan + r.kalenderTambahan,
      kalenderTotal: acc.kalenderTotal + r.kalenderTotal,
      hutDefault: acc.hutDefault + r.hutDefault,
      hutTambahan: acc.hutTambahan + r.hutTambahan,
      lainDefault: acc.lainDefault + r.lainDefault,
      lainTambahan: acc.lainTambahan + r.lainTambahan,
      totalDefault: acc.totalDefault + r.totalDefault,
      totalTambahan: acc.totalTambahan + r.totalTambahan,
    }), zero());
  }, [filteredMergedData]);

  const filteredTotalKeseluruhan = filteredGrandTotal.totalDefault + filteredGrandTotal.totalTambahan;

  const handlePrint = () => window.print();

  const handleExport = () => {
    try {
      const wsData = [
        ["REKAPITULASI PERUNTUKAN CABANG"],
        [`Periode: ${bulanLabel} ${selectedYear}`],
        [],
        ["NO", "CABANG", "IURAN", "", "", "DASPEN", "", "", "DERAP", "", "", "KALENDER", "", "", "HUT", "", "", "LAIN-LAIN", "", "", "TOTAL", "", ""],
        ["", "", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total", "DEFAULT", "TAMBAHAN", "Total"],
        ...mergedData.map(r => [
          r.no, r.cabang,
          r.iuranDefault, r.iuranTambahan, r.iuranTotal,
          r.daspenDefault, r.daspenTambahan, r.daspenTotal,
          r.derapDefault, r.derapTambahan, r.derapTotal,
          r.kalenderDefault, r.kalenderTambahan, r.kalenderTotal,
          r.hutDefault, r.hutTambahan, r.hutDefault + r.hutTambahan,
          r.lainDefault, r.lainTambahan, r.lainDefault + r.lainTambahan,
          r.totalDefault, r.totalTambahan, r.totalDefault + r.totalTambahan,
        ]),
        [],
        ["", "TOTAL",
          grandTotal.iuranDefault, grandTotal.iuranTambahan, grandTotal.iuranTotal,
          grandTotal.daspenDefault, grandTotal.daspenTambahan, grandTotal.daspenTotal,
          grandTotal.derapDefault, grandTotal.derapTambahan, grandTotal.derapTotal,
          grandTotal.kalenderDefault, grandTotal.kalenderTambahan, grandTotal.kalenderTotal,
          grandTotal.hutDefault, grandTotal.hutTambahan, grandTotal.hutDefault + grandTotal.hutTambahan,
          grandTotal.lainDefault, grandTotal.lainTambahan, grandTotal.lainDefault + grandTotal.lainTambahan,
          grandTotal.totalDefault, grandTotal.totalTambahan, grandTotal.totalDefault + grandTotal.totalTambahan,
        ],
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Peruntukan");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Rekapitulasi_Peruntukan_${bulanLabel}_${selectedYear}.xlsx`);
      toast.success("Berhasil di-export!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export Excel.");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-700">
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-700">
          {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button onClick={fetchAll} disabled={loading}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50">
          <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} /> Muat
        </button>
        <button onClick={handlePrint}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
          <FaPrint /> PDF
        </button>
        <button onClick={handleExport}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <FaFileExcel /> Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 text-sm"><FaCoins /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Iuran PGRI</p>
          <p className="text-xl font-bold text-emerald-600">{formatRp(grandTotal.iuranTotal)}</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-3 text-sm"><FaHandHoldingHeart /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Daspen</p>
          <p className="text-xl font-bold text-rose-600">{formatRp(grandTotal.daspenTotal)}</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-3 text-sm"><FaNewspaper /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Derap</p>
          <p className="text-xl font-bold text-indigo-600">{formatRp(grandTotal.derapTotal)}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 text-sm"><FaCalendarAlt /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Kalender</p>
          <p className="text-xl font-bold text-amber-600">{formatRp(grandTotal.kalenderTotal)}</p>
        </div>
        <div className="bg-cyan-50 rounded-2xl p-5 border border-cyan-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center mb-3 text-sm"><FaStar /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">HUT PGRI</p>
          <p className="text-xl font-bold text-cyan-600">{formatRp(grandTotal.hutDefault)}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-3 text-sm"><FaGift /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">LAIN-LAIN</p>
          <p className="text-xl font-bold text-orange-600">{formatRp(grandTotal.lainDefault)}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-3 text-sm"><FaChartBar /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">TOTAL KESELURUHAN</p>
          <p className="text-xl font-bold text-purple-600">{formatRp(totalKeseluruhan)}</p>
        </div>
      </div>

      {/* Table */}
      <motion.div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Rekapitulasi Peruntukan Cabang <span className="text-emerald-500">{bulanLabel} {selectedYear}</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th rowSpan={2} className="px-2 py-3 text-center font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100">NO</th>
                <th rowSpan={2} className="px-3 py-3 text-left font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100">CABANG</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-emerald-600 uppercase tracking-widest border-r border-slate-100">IURAN</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-rose-600 uppercase tracking-widest border-r border-slate-100">DASPEN</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-indigo-600 uppercase tracking-widest border-r border-slate-100">DERAP</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-amber-600 uppercase tracking-widest border-r border-slate-100">KALENDER</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-cyan-600 uppercase tracking-widest border-r border-slate-100">HUT</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-orange-600 uppercase tracking-widest border-r border-slate-100">LAIN-LAIN</th>
                <th colSpan={3} className="px-2 py-3 text-center font-bold text-slate-900 uppercase tracking-widest">TOTAL</th>
              </tr>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-100">Total</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">DEFAULT</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">TAMBAHAN</th>
                <th className="px-2 py-2 text-center font-bold text-slate-500 text-[8px] uppercase border-r border-slate-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(23).fill(0).map((_, j) => (
                      <td key={j} className="px-2 py-3"><div className="h-2.5 bg-slate-100 rounded-full w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredMergedData.length > 0 ? (
                filteredMergedData.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-2 py-3 text-center font-bold text-slate-300">{r.no}</td>
                    <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">{r.cabang}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.iuranDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.iuranTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-emerald-50/30">{formatRp(r.iuranTotal)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.daspenDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.daspenTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-rose-50/30">{formatRp(r.daspenTotal)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.derapDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.derapTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-indigo-50/30">{formatRp(r.derapTotal)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.kalenderDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.kalenderTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-amber-50/30">{formatRp(r.kalenderTotal)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.hutDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.hutTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-cyan-50/30">{formatRp(r.hutDefault + r.hutTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.lainDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-600">{formatRp(r.lainTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-orange-50/30">{formatRp(r.lainDefault + r.lainTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-slate-100/50">{formatRp(r.totalDefault)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-slate-100/50">{formatRp(r.totalTambahan)}</td>
                    <td className="px-2 py-3 text-center font-bold text-slate-900 bg-slate-200/50">{formatRp(r.totalDefault + r.totalTambahan)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={23} className="py-16 text-center text-slate-300 font-bold uppercase tracking-widest">
                    Data Kosong
                  </td>
                </tr>
              )}
            </tbody>
            {filteredMergedData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-[10px]">
                  <td className="px-2 py-4 text-center border-r border-slate-800" colSpan={2}>TOTAL</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.iuranDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.iuranTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-emerald-500/20">{formatRp(filteredGrandTotal.iuranTotal)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.daspenDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.daspenTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-rose-500/20">{formatRp(filteredGrandTotal.daspenTotal)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.derapDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.derapTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-indigo-500/20">{formatRp(filteredGrandTotal.derapTotal)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.kalenderDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.kalenderTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-amber-500/20">{formatRp(filteredGrandTotal.kalenderTotal)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.hutDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.hutTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-cyan-500/20">{formatRp(filteredGrandTotal.hutDefault + filteredGrandTotal.hutTambahan)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.lainDefault)}</td>
                  <td className="px-2 py-4 text-center">{formatRp(filteredGrandTotal.lainTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-orange-500/20">{formatRp(filteredGrandTotal.lainDefault + filteredGrandTotal.lainTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-amber-500/20">{formatRp(filteredGrandTotal.totalDefault)}</td>
                  <td className="px-2 py-4 text-center bg-amber-500/20">{formatRp(filteredGrandTotal.totalTambahan)}</td>
                  <td className="px-2 py-4 text-center bg-amber-500/20 font-bold">{formatRp(filteredGrandTotal.totalDefault + filteredGrandTotal.totalTambahan)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>
    </div>
  );
}
