"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import {
  FaArrowTrendDown,
  FaPrint,
  FaFileExcel,
  FaCircleInfo,
} from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const PengeluaranSection = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInitialData = async () => {
    try {
      const resBulan = await GlobalApi.getBulan();
      setBulanList(resBulan.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;

    setLoading(true);
    try {
      const res = await GlobalApi.getTableKasSanduka(
        selectedMonth,
        selectedYear,
      );

      const dataResult = Array.isArray(res) ? res : res?.data || [];

      const mappedData = dataResult
        .filter((item) => item.jenis === "PENGELUARAN")
        .map((item) => {
          const tanggal = Array.isArray(item.tanggalTransaksi)
            ? `${item.tanggalTransaksi[2].toString().padStart(2, "0")}-${item.tanggalTransaksi[1]
                .toString()
                .padStart(2, "0")}-${item.tanggalTransaksi[0]}`
            : item.tanggalTransaksi;

          return {
            tanggalTransaksi: tanggal,
            uraian: item.keterangan,
            nominal: item.kredit || 0,
          };
        });

      setData(mappedData);
    } catch (error) {
      console.error("❌ Error fetching kas sanduka:", error);
      toast.error("Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredData = data.filter((item) =>
    item.uraian?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const exportToExcel = () => {
    const excelData = filteredData.map((item, index) => ({
      No: index + 1,
      Tanggal: item.tanggalTransaksi,
      Uraian: item.uraian,
      Nominal: item.nominal,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengeluaran");
    XLSX.writeFile(
      wb,
      `Laporan_Pengeluaran_${selectedMonth}_${selectedYear}.xlsx`,
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      {/* Banner */}
      <div className="bg-rose-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaArrowTrendDown className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Laporan Pengeluaran</h2>
              <p className="text-rose-100 text-xs font-medium uppercase tracking-wider">
                Detail seluruh biaya & dana keluar Sanduka
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title="Export Excel"
            >
              <FaFileExcel className="text-xl" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title="Cetak Laporan"
            >
              <FaPrint className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Filters */}
        <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
            >
              {bulanList.map((b) => (
                <option key={b.id} value={String(b.id).padStart(2, "0")}>
                  {b.namaBulan}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block px-1">
              Cari Keterangan
            </label>
            <FaSearch className="absolute left-4 bottom-4 text-slate-300" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[32px] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              <FaArrowTrendDown />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest">
                Total Pengeluaran
              </h4>
              <p className="text-[10px] text-rose-600 font-bold">
                Periode{" "}
                {bulanList.find((b) => b.id === selectedMonth)?.namaBulan}{" "}
                {selectedYear}
              </p>
            </div>
          </div>
          <span className="text-3xl font-bold text-rose-600">
            {formatCurrency(
              filteredData.reduce((acc, curr) => acc + (curr.nominal || 0), 0),
            )}
          </span>
        </div>

        {/* Table */}
        <div className="border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-5 text-center w-20">No</th>
                  <th className="px-6 py-5">Tanggal Transaksi</th>
                  <th className="px-6 py-5">Uraian / Keterangan</th>
                  <th className="px-6 py-5 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="4" className="px-6 py-6">
                          <div className="h-4 bg-slate-100 rounded-lg w-full" />
                        </td>
                      </tr>
                    ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center text-slate-400 font-bold text-xs">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold text-sm">
                        {row.tanggalTransaksi}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm block">
                          {row.uraian}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600 bg-rose-50/10">
                        {row.nominal}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FaCircleInfo className="text-slate-100 text-6xl mb-4" />
                        <p className="text-slate-400 font-bold">
                          Data tidak tersedia untuk periode ini
                        </p>
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

export default PengeluaranSection;
