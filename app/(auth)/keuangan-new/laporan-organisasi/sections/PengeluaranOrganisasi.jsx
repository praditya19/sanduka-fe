"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  FaArrowTrendDown,
  FaPrint,
  FaFileExcel,
  FaCircleInfo,
} from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const PengeluaranOrganisasiSection = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GlobalApi.getPengeluaranUmum();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching pengeluaran organisasi:", error);
      toast.error("Gagal mengambil data pengeluaran");
    } finally {
      setLoading(false);
    }
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

  const filteredData = data.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.keterangan || "").toLowerCase().includes(q) ||
      (item.tujuan || item.penerima || "").toLowerCase().includes(q)
    );
  });

  const exportToExcel = () => {
    const excelData = filteredData.map((item, index) => ({
      No: index + 1,
      Tanggal: formatDate(item.tanggalTransaksi || item.tanggal_transaksi || item.createdAt),
      Keterangan: item.keterangan,
      Tujuan: item.tujuan || item.penerima || "-",
      Nominal: item.nominal || item.kredit || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengeluaran Organisasi");
    XLSX.writeFile(wb, `Pengeluaran_Organisasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      <div className="bg-rose-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaArrowTrendDown className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Pengeluaran Organisasi</h2>
              <p className="text-rose-100 text-xs font-medium uppercase tracking-wider">
                Seluruh transaksi pengeluaran kas organisasi
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
          <div className="flex-1 min-w-[200px] relative">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Cari Transaksi
            </label>
            <FaSearch className="absolute left-4 bottom-4 text-slate-300" />
            <input
              type="text"
              placeholder="Ketik keterangan atau tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
            />
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
                  <th className="px-6 py-4 border-r border-white/10">Tujuan</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
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
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors group">
                      <td className="px-6 py-4 text-center text-slate-400 font-bold text-xs border-r border-slate-50">{i + 1}</td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-bold text-slate-700 text-sm">
                          {formatDate(row.tanggalTransaksi || row.tanggal_transaksi || row.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-medium text-slate-600">{row.keterangan || "-"}</span>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-bold text-slate-700 text-xs uppercase">{row.tujuan || row.penerima || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600 bg-rose-50/20">
                        {formatCurrency(row.nominal || row.kredit || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FaCircleInfo className="text-slate-100 text-6xl mb-4" />
                        <p className="text-slate-400 font-bold">Data pengeluaran tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!loading && filteredData.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                  <tr className="font-black text-slate-800 text-xs">
                    <td colSpan="4" className="px-6 py-4 uppercase">Total Keseluruhan</td>
                    <td className="px-6 py-4 text-right text-rose-700 bg-rose-100/30">
                      {formatCurrency(filteredData.reduce((acc, curr) => acc + (Number(curr.nominal || curr.kredit) || 0), 0))}
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

export default PengeluaranOrganisasiSection;
