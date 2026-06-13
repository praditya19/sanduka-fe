"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  FaCalendarDays,
  FaPrint,
  FaFileExcel,
  FaCircleInfo,
} from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const RekapTransaksiSection = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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
      const res = await GlobalApi.getTableUmum(selectedMonth, selectedYear);
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching rekap transaksi:", error);
      setData([]);
      if (error.response?.status !== 404) {
        toast.error("Gagal mengambil data rekap transaksi");
      }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const exportToExcel = () => {
    const excelData = data.map((item, index) => ({
      No: index + 1,
      Tanggal: formatDate(item.tanggal),
      Keterangan: item.keterangan,
      Pemasukan: item.debet || 0,
      Pengeluaran: item.kredit || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Transaksi");
    XLSX.writeFile(wb, `Rekap_Transaksi_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const totalDebet = data.reduce((sum, item) => sum + (Number(item.debet) || 0), 0);
  const totalKredit = data.reduce((sum, item) => sum + (Number(item.kredit) || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      <div className="bg-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaCalendarDays className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Rekap Transaksi Organisasi</h2>
              <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">
                Ringkasan transaksi per periode
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
        <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
            >
              {bulanList.map((b) => (
                <option key={b.id} value={parseInt(b.id)}>
                  {b.namaBulan}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-4 text-center border-r border-white/10">No</th>
                  <th className="px-6 py-4 border-r border-white/10">Tanggal</th>
                  <th className="px-6 py-4 border-r border-white/10">Keterangan</th>
                  <th className="px-6 py-4 text-right border-r border-white/10">Pemasukan</th>
                  <th className="px-6 py-4 text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="h-6 bg-slate-100 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((row, i) => (
                    <tr key={i} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-4 text-center text-slate-400 font-bold text-xs border-r border-slate-50">{i + 1}</td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-bold text-slate-700 text-sm">{formatDate(row.tanggal)}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-medium text-slate-600">{row.keterangan || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 border-r border-slate-50 bg-emerald-50/20">
                        {row.debet ? formatCurrency(row.debet) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600 bg-rose-50/20">
                        {row.kredit ? formatCurrency(row.kredit) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FaCircleInfo className="text-slate-100 text-6xl mb-4" />
                        <p className="text-slate-400 font-bold">Data rekap tidak ditemukan untuk periode ini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!loading && data.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                  <tr className="font-black text-slate-800 text-xs">
                    <td colSpan="3" className="px-6 py-4 uppercase">Total Keseluruhan</td>
                    <td className="px-6 py-4 text-right text-emerald-700 bg-emerald-100/30">
                      {formatCurrency(totalDebet)}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-700 bg-rose-100/30">
                      {formatCurrency(totalKredit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RekapTransaksiSection;
