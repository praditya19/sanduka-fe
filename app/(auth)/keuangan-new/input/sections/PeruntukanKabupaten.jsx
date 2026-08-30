"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FaSyncAlt,
  FaPrint,
  FaFileExcel,
  FaCoins,
  FaBuilding,
  FaNewspaper,
  FaCalendarAlt,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
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
  return "Rp " + n.toLocaleString("id-ID");
};

const toNumber = (v) => Number(v || 0);

export default function PeruntukanKabupatenSection() {
  const [userRole, setUserRole] = useState(null);
  const [userCabang, setUserCabang] = useState("");
  const isSuperAdmin = userRole === "SUPERADMIN";

  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [mergedData, setMergedData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      const [resCabang, resIuran, resDaspen, resDerap, resKalender] = await Promise.all([
        GlobalApi.getCabang(),
        GlobalApi.getRekapByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapDaspenByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapDerapByPeriode(bulanLabel, selectedYear),
        GlobalApi.getRekapKalenderByPeriode(bulanLabel, selectedYear),
      ]);

      const cabangs = (resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
      setCabangList(cabangs);

      const iuranList = Array.isArray(resIuran) ? resIuran : resIuran?.data || [];
      const daspenList = Array.isArray(resDaspen) ? resDaspen : resDaspen?.data || [];
      const derapList = Array.isArray(resDerap) ? resDerap : resDerap?.data || [];
      const kalenderList = Array.isArray(resKalender) ? resKalender : resKalender?.data || [];

      const normalize = (s) => (s || "").trim().toUpperCase();

      const byCabang = {};
      for (const r of iuranList) {
        const key = normalize(r.cabang);
        if (!byCabang[key]) byCabang[key] = {};
        byCabang[key].iuran = r;
      }
      for (const r of daspenList) {
        const key = normalize(r.cabang);
        if (!byCabang[key]) byCabang[key] = {};
        byCabang[key].daspen = r;
      }
      for (const r of derapList) {
        const key = normalize(r.cabang);
        if (!byCabang[key]) byCabang[key] = {};
        byCabang[key].derap = r;
      }
      for (const r of kalenderList) {
        const key = normalize(r.cabang);
        if (!byCabang[key]) byCabang[key] = {};
        byCabang[key].kalender = r;
      }

      const merged = cabangs.map((c, idx) => {
        const key = normalize(c.kecamatan);
        const d = byCabang[key] || {};

        const anggota = toNumber(d.iuran?.totalAnggota);
        const iuranKabupaten = toNumber(d.iuran?.kabupaten);
        const daspenKabupaten = toNumber(d.daspen?.kabupaten || d.daspen?.peruntukanKabupaten);
        const derapKabupaten = toNumber(d.derap?.peruntukanKabupaten);
        const kalenderKabupaten = toNumber(d.kalender?.peruntukanKabupaten);

        const totalPeruntukan = iuranKabupaten + daspenKabupaten + derapKabupaten + kalenderKabupaten;

        return {
          no: idx + 1,
          cabang: c.kecamatan,
          anggota,
          iuranKabupaten,
          daspenKabupaten,
          derapKabupaten,
          kalenderKabupaten,
          totalPeruntukan,
        };
      });

      setMergedData(merged);
    } catch (error) {
      console.error("Error fetching peruntukan kabupaten data:", error);
      toast.error("Gagal memuat data peruntukan kabupaten.");
    } finally {
      setLoading(false);
    }
  }, [bulanLabel, selectedYear]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter based on search and user role
  const filteredData = useMemo(() => {
    return mergedData.filter((row) => {
      if (!isSuperAdmin && userCabang && userCabang !== "KABUPATEN") {
        if (row.cabang.toUpperCase() !== userCabang) return false;
      }
      if (!searchQuery) return true;
      return row.cabang.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [mergedData, isSuperAdmin, userCabang, searchQuery]);

  // Grand totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, r) => {
        acc.anggota += r.anggota;
        acc.iuranKabupaten += r.iuranKabupaten;
        acc.daspenKabupaten += r.daspenKabupaten;
        acc.derapKabupaten += r.derapKabupaten;
        acc.kalenderKabupaten += r.kalenderKabupaten;
        acc.totalPeruntukan += r.totalPeruntukan;
        return acc;
      },
      {
        anggota: 0,
        iuranKabupaten: 0,
        daspenKabupaten: 0,
        derapKabupaten: 0,
        kalenderKabupaten: 0,
        totalPeruntukan: 0,
      }
    );
  }, [filteredData]);

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const exportRows = filteredData.map((r, i) => ({
        "No": i + 1,
        "Cabang / Ranting Khusus": r.cabang,
        "Jumlah Anggota": r.anggota,
        "Iuran PGRI (Kabupaten)": r.iuranKabupaten,
        "DASPEN (Kabupaten)": r.daspenKabupaten,
        "DERAP Guru (Kabupaten)": r.derapKabupaten,
        "Kalender (Kabupaten)": r.kalenderKabupaten,
        "Total Peruntukan Kabupaten": r.totalPeruntukan,
      }));

      exportRows.push({
        "No": "",
        "Cabang / Ranting Khusus": "TOTAL KESELURUHAN",
        "Jumlah Anggota": totals.anggota,
        "Iuran PGRI (Kabupaten)": totals.iuranKabupaten,
        "DASPEN (Kabupaten)": totals.daspenKabupaten,
        "DERAP Guru (Kabupaten)": totals.derapKabupaten,
        "Kalender (Kabupaten)": totals.kalenderKabupaten,
        "Total Peruntukan Kabupaten": totals.totalPeruntukan,
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peruntukan Kabupaten");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(dataBlob, `Peruntukan_Kabupaten_${bulanLabel}_${selectedYear}.xlsx`);
      toast.success("File Excel berhasil diunduh.");
    } catch (e) {
      toast.error("Gagal mengekspor Excel.");
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Control Bar: Filter & Actions */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Cari cabang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <FaSyncAlt className={`${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg shadow-slate-800/20 transition-all"
          >
            <FaPrint />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Iuran PGRI (Kab)</span>
            <FaCoins className="text-sm" />
          </div>
          <p className="text-base md:text-xl font-extrabold">{formatRp(totals.iuranKabupaten)}</p>
          <p className="text-[10px] text-blue-100 mt-1 font-medium">Alokasi iuran kabupaten</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">DERAP Guru (Kab)</span>
            <FaNewspaper className="text-sm" />
          </div>
          <p className="text-base md:text-xl font-extrabold">{formatRp(totals.derapKabupaten)}</p>
          <p className="text-[10px] text-indigo-100 mt-1 font-medium">Alokasi derap kabupaten</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kalender (Kab)</span>
            <FaCalendarAlt className="text-sm" />
          </div>
          <p className="text-base md:text-xl font-extrabold">{formatRp(totals.kalenderKabupaten)}</p>
          <p className="text-[10px] text-amber-100 mt-1 font-medium">Alokasi kalender kabupaten</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Peruntukan Kab</span>
            <FaBuilding className="text-sm" />
          </div>
          <p className="text-base md:text-xl font-extrabold">{formatRp(totals.totalPeruntukan)}</p>
          <p className="text-[10px] text-emerald-100 mt-1 font-medium">Grand total alokasi kabupaten</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50/40">
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">
              Rincian Peruntukan Pengurus PGRI Kabupaten Jepara
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Periode: {bulanLabel} {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl">
              {filteredData.length} Cabang
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Cabang / Ranting Khusus</th>
                <th className="py-3 px-4 text-center">Anggota</th>
                <th className="py-3 px-4 text-right">Iuran PGRI (Kab)</th>
                <th className="py-3 px-4 text-right">DASPEN (Kab)</th>
                <th className="py-3 px-4 text-right">DERAP (Kab)</th>
                <th className="py-3 px-4 text-right">Kalender (Kab)</th>
                <th className="py-3 px-4 text-right font-extrabold text-blue-700 bg-blue-50/40">
                  Total Peruntukan Kab
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={8} className="py-4 px-4">
                        <div className="h-4 bg-slate-100 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
              ) : filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/70 transition-colors font-medium text-slate-700"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{row.cabang}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                        {row.anggota}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatRp(row.iuranKabupaten)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatRp(row.daspenKabupaten)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatRp(row.derapKabupaten)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatRp(row.kalenderKabupaten)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-600 bg-blue-50/30">
                      {formatRp(row.totalPeruntukan)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    Tidak ada data peruntukan kabupaten untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td colSpan={2} className="py-3 px-4 text-center uppercase tracking-wider">
                    TOTAL KESELURUHAN
                  </td>
                  <td className="py-3 px-4 text-center text-blue-300 font-bold">
                    {totals.anggota}
                  </td>
                  <td className="py-3 px-4 text-right">{formatRp(totals.iuranKabupaten)}</td>
                  <td className="py-3 px-4 text-right">{formatRp(totals.daspenKabupaten)}</td>
                  <td className="py-3 px-4 text-right">{formatRp(totals.derapKabupaten)}</td>
                  <td className="py-3 px-4 text-right">{formatRp(totals.kalenderKabupaten)}</td>
                  <td className="py-3 px-4 text-right font-black text-amber-400 bg-slate-800">
                    {formatRp(totals.totalPeruntukan)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
