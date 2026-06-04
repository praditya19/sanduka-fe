"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaSearch } from "react-icons/fa";
import {
  FaChartPie,
  FaPrint,
  FaFileExcel,
  FaCircleInfo,
} from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const TargetRealisasiSection = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(
    now.toLocaleString("id-ID", { month: "long" }),
  );
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const monthMap = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
      ]);
      setBulanList(resBulan.data || []);
      setCabangList(resCabang.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedBulan || !selectedYear) return;

    setLoading(true);

    try {
      const bulanAngka = monthMap[selectedBulan];
      const bulanuangmasuk = `${bulanAngka}/${selectedYear}`;

      const [resTargetRealisasi, balancingMap, realisasiMap] =
        await Promise.all([
          GlobalApi.getTableTargetRealisasi(
            selectedYear,
            bulanAngka,
            "",
            bulanuangmasuk,
          ),
          fetchTargetFromBalancing(),
          fetchRealisasiFromKasSanduka(),
        ]);

      const finalData = (resTargetRealisasi || []).map((item) => {
        const key = item.cabang?.trim().toUpperCase();

        const bal = balancingMap[key] || {
          jumlahAnggota: 0,
          totalIuran: 0,
        };

        const realisasiNominal =
          realisasiMap[key]?.totalNominal || item.realisasi || 0;

        const result = {
          ...item,
          jumlahAnggota: bal.jumlahAnggota,
          target: bal.totalIuran,
          realisasi: realisasiNominal,
          selisih: (bal.totalIuran || 0) - realisasiNominal,
        };

        return result;
      });

      setData(finalData);
    } catch (error) {
      console.error("❌ ERROR fetching target realisasi:", error);
      console.error("📋 Error details:", {
        message: error.message,
        stack: error.stack,
      });
      toast.error("Gagal mengambil data target realisasi");
    } finally {
      setLoading(false);
    }
  }, [selectedBulan, selectedYear]);

  const fetchTargetFromBalancing = async () => {
    try {
      const bulanAngka = monthMap[selectedBulan];

      const res = await GlobalApi.getTransaksiBankBalancing(
        "",
        "",
        selectedYear,
        bulanAngka,
        "",
        "",
      );

      const dataBalancing = res || [];

      const grouped = {};

      dataBalancing.forEach((item) => {
        const cabang = item.cabang?.trim().toUpperCase();

        if (!grouped[cabang]) {
          grouped[cabang] = {
            jumlahAnggota: 0,
            totalIuran: 0,
          };
        }

        grouped[cabang].jumlahAnggota += 1;
        grouped[cabang].totalIuran += item.totalIuranSanduka || 0;
      });

      return grouped;
    } catch (error) {
      console.error("❌ Error fetching balancing:", error);
      console.error("📋 Error stack:", error.stack);
      return {};
    }
  };

  const fetchRealisasiFromKasSanduka = async () => {
    try {
      const bulanAngka = monthMap[selectedBulan];

      const realisasiData = await GlobalApi.getRealisasiFromKasSanduka(
        bulanAngka,
        selectedYear,
      );

      return realisasiData;
    } catch (error) {
      console.error("❌ Error fetching realisasi from kas sanduka:", error);
      console.error("📋 Error stack:", error.stack);
      return {};
    }
  };

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
    item.cabang?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const exportToExcel = () => {
    const excelData = filteredData.map((item, index) => ({
      No: index + 1,
      Cabang: item.cabang,
      "Target Anggota": item.jumlahAnggota,
      "Target Nominal": item.target,
      "Realisasi Anggota": item.jumlahAnggotaByAdmin,
      "Realisasi Nominal": item.realisasi,
      Selisih: item.selisih,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Target Realisasi");
    XLSX.writeFile(
      wb,
      `Laporan_Target_Realisasi_${selectedBulan}_${selectedYear}.xlsx`,
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      {/* Banner */}
      <div className="bg-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaChartPie className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Target & Realisasi</h2>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">
                Laporan perbandingan setoran iuran per cabang
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
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Pilih Bulan
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
            >
              {bulanList.map((b) => (
                <option key={b.id} value={b.namaBulan}>
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block px-1">
              Cari Cabang
            </label>
            <FaSearch className="absolute left-4 bottom-4 text-slate-300" />
            <input
              type="text"
              placeholder="Ketik nama cabang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                  <th
                    rowSpan="2"
                    className="px-6 py-4 text-center border-r border-white/10"
                  >
                    No
                  </th>
                  <th
                    rowSpan="2"
                    className="px-6 py-4 border-r border-white/10"
                  >
                    Cabang
                  </th>
                  <th
                    colSpan="2"
                    className="px-6 py-4 text-center border-r border-white/10 border-b border-white/10"
                  >
                    Target Sanduka
                  </th>
                  <th
                    colSpan="2"
                    className="px-6 py-4 text-center border-r border-white/10 border-b border-white/10"
                  >
                    Realisasi
                  </th>
                  <th rowSpan="2" className="px-6 py-4 text-right">
                    Selisih
                  </th>
                </tr>
                <tr className="bg-slate-800 text-white/70 text-[9px] uppercase font-black tracking-widest">
                  <th className="px-6 py-3 text-center border-r border-white/10">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-right border-r border-white/10">
                    Nominal
                  </th>
                  <th className="px-6 py-3 text-center border-r border-white/10">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-right border-r border-white/10">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="h-6 bg-slate-100 rounded-lg w-full" />
                        </td>
                      </tr>
                    ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center text-slate-400 font-bold text-xs border-r border-slate-50">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 border-r border-slate-50">
                        <span className="font-black text-slate-700 text-sm block uppercase">
                          {row.cabang}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600 border-r border-slate-50">
                        {row.jumlahAnggota}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-600 border-r border-slate-50 bg-slate-50/50">
                        {formatCurrency(row.target)}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600 border-r border-slate-50">
                        {row.jumlahAnggota}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 border-r border-slate-50 bg-blue-50/20">
                        {formatCurrency(row.realisasi)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-black ${row.selisih < 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {formatCurrency(row.selisih)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <FaCircleInfo className="text-slate-100 text-6xl mb-4" />
                        <p className="text-slate-400 font-bold">
                          Data laporan tidak ditemukan untuk periode ini
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!loading && filteredData.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                  <tr className="font-black text-slate-800 text-xs">
                    <td colSpan="2" className="px-6 py-4 uppercase">
                      Total Keseluruhan
                    </td>
                    <td className="px-6 py-4 text-center">
                      {filteredData.reduce(
                        (acc, curr) => acc + (Number(curr.jumlahAnggota) || 0),
                        0,
                      )}
                    </td>
                    <td className="px-6 py-4 text-right bg-slate-100/50">
                      {formatCurrency(
                        filteredData.reduce(
                          (acc, curr) => acc + (Number(curr.target) || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-blue-700">
                      {filteredData.reduce(
                        (acc, curr) =>
                          acc + (Number(curr.jumlahAnggotaByAdmin) || 0),
                        0,
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-700 bg-blue-100/30">
                      {formatCurrency(
                        filteredData.reduce(
                          (acc, curr) => acc + (Number(curr.realisasi) || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 text-right ${filteredData.reduce((acc, curr) => acc + (Number(curr.selisih) || 0), 0) < 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {formatCurrency(
                        filteredData.reduce(
                          (acc, curr) => acc + (Number(curr.selisih) || 0),
                          0,
                        ),
                      )}
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

export default TargetRealisasiSection;
