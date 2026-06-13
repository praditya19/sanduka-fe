"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaPrint,
  FaFileExcel,
  FaCheckDouble,
  FaCircleInfo,
  FaVault,
} from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const SaldoAkhirOrganisasiSection = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
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
      const [saldoRes, rekapRes] = await Promise.all([
        GlobalApi.getSaldoOrganisasi(),
        GlobalApi.getTableUmum(selectedMonth, selectedYear),
      ]);

      const saldoAkhir = Number(saldoRes.saldo_akhir_organisasi) || 0;
      const totalMasuk = Number(saldoRes.total_masuk) || 0;
      const totalKeluar = Number(saldoRes.total_keluar) || 0;

      const rekapData = Array.isArray(rekapRes) ? rekapRes : [];

      const rekapTotalDebet = rekapData.reduce((sum, item) => sum + (Number(item.debet) || 0), 0);
      const rekapTotalKredit = rekapData.reduce((sum, item) => sum + (Number(item.kredit) || 0), 0);

      let saldoAwal = 0;
      if (rekapTotalDebet > 0 || rekapTotalKredit > 0) {
        const maret2021 = new Date(2021, 2, 1);
        let tempDate = new Date(selectedYear, selectedMonth - 1, 1);
        tempDate.setMonth(tempDate.getMonth() - 1);

        let allPreviousData = [];
        while (tempDate >= maret2021) {
          const b = tempDate.getMonth() + 1;
          const y = tempDate.getFullYear();
          try {
            const prevData = await GlobalApi.getTableUmum(b, y);
            allPreviousData.push(...(Array.isArray(prevData) ? prevData : []));
          } catch (e) {
            // silent skip
          }
          tempDate.setMonth(tempDate.getMonth() - 1);
        }

        allPreviousData.forEach((item) => {
          saldoAwal += (Number(item.debet) || 0) - (Number(item.kredit) || 0);
        });
      }

      setData({
        saldoAwal,
        totalPemasukan: totalMasuk || rekapTotalDebet,
        totalPengeluaran: totalKeluar || rekapTotalKredit,
        saldoAkhir,
      });
    } catch (error) {
      console.error("Error fetching saldo organisasi:", error);
      setData(null);
      if (error.response?.status !== 404) {
        toast.error("Gagal mengambil data saldo organisasi");
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

  const exportToExcel = () => {
    if (!data) return;
    const excelData = [
      { Keterangan: "Saldo Awal", Nominal: data.saldoAwal },
      { Keterangan: "Total Pemasukan", Nominal: data.totalPemasukan },
      { Keterangan: "Total Pengeluaran", Nominal: data.totalPengeluaran },
      { Keterangan: "Saldo Akhir", Nominal: data.saldoAkhir },
    ];

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Saldo Akhir Organisasi");
    XLSX.writeFile(wb, `Saldo_Akhir_Organisasi_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      <div className="bg-amber-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaWallet className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Saldo Akhir Organisasi</h2>
              <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">
                Rekapitulasi saldo kas organisasi pada akhir periode
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

      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20"
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-100 rounded-[32px]" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-slate-100 rounded-[32px]" />
              <div className="h-32 bg-slate-100 rounded-[32px]" />
            </div>
            <div className="h-32 bg-slate-100 rounded-[32px]" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <FaVault />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                    Saldo Akhir Periode
                  </h3>
                </div>
                <h1 className="text-5xl font-black tracking-tight mb-2">
                  {formatCurrency(data.saldoAkhir)}
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  Status per{" "}
                  {bulanList.find((b) => parseInt(b.id) === selectedMonth)?.namaBulan}{" "}
                  {selectedYear}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Saldo Awal",
                  value: data.saldoAwal,
                  icon: <FaWallet />,
                  color: "text-slate-600",
                  bg: "bg-slate-100",
                },
                {
                  label: "Total Pemasukan",
                  value: data.totalPemasukan,
                  icon: <FaCheckDouble />,
                  color: "text-emerald-600",
                  bg: "bg-emerald-100",
                },
                {
                  label: "Total Pengeluaran",
                  value: data.totalPengeluaran,
                  icon: <FaCircleInfo />,
                  color: "text-rose-600",
                  bg: "bg-rose-100",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <p className={`text-xl font-black ${item.color}`}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[32px] flex items-start space-x-4">
              <div className="p-3 bg-blue-500 text-white rounded-2xl flex-shrink-0">
                <FaCircleInfo className="text-xl" />
              </div>
              <div>
                <h4 className="text-blue-900 font-black text-sm uppercase tracking-tight mb-1">
                  Informasi Transparansi
                </h4>
                <p className="text-blue-700/70 text-xs font-medium leading-relaxed">
                  Saldo akhir organisasi dihitung berdasarkan akumulasi saldo awal
                  ditambah total pemasukan dikurangi total pengeluaran pada periode
                  yang dipilih. Data ini sinkron dengan Buku Kas Organisasi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <FaCircleInfo className="text-slate-100 text-6xl mb-4 mx-auto" />
            <p className="text-slate-400 font-bold">
              Data saldo tidak ditemukan untuk periode ini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaldoAkhirOrganisasiSection;
