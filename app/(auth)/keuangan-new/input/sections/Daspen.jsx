"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaHandHoldingHeart, 
  FaUsers, 
  FaSave, 
  FaSearch, 
  FaCog,
  FaCalculator,
  FaShieldAlt,
  FaChartPie
} from "react-icons/fa";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

const DaspenSection = () => {
  // Besaran Daspen State
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  // Target State
  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Lists
  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  
  // Table State
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived Values
  const kat1Val = kuota * katagori1;
  const kat2Val = kuota * katagori2;
  const kat3Val = kuota * katagori3;

  const totalTarget = (kat1Val * kat1) + (kat2Val * kat2) + (kat3Val * kat3);
  const perolehanProvinsi = totalTarget * PROVINSI_PERCENTAGE;
  const perolehanCabang = totalTarget * CABANG_PERCENTAGE;
  const perolehanKabupaten = totalTarget * KABUPATEN_PERCENTAGE;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(4) // Daspen ID = 4
      ]);
      
      setBulanList(resBulan.data || []);
      setCabangList(resCabang.data || []);
      
      if (resIuran) {
        setKuota(parseInt(resIuran.pb) || 700);
        setKatagori1(parseFloat(resIuran.propinsi) || 0);
        setKatagori2(parseFloat(resIuran.kabupaten) || 0);
        setKatagori3(parseFloat(resIuran.cabang) || 0);
      }

      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth]) {
        setSelectedMonth(resBulan.data[currentMonth].namaBulan);
      }
    } catch (error) {
      console.error("Error fetching Daspen data:", error);
    }
  };

  const fetchTableData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const data = await GlobalApi.getTableDaspen(selectedMonth, selectedYear, [], "");
      // Filter out total rows if necessary
      const filtered = data.filter(row => row["Cabang/Khusus"] !== "Jumlah");
      setTableData(filtered);
    } catch (error) {
      console.error("Error fetching Daspen table:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleSaveBesaran = async () => {
    try {
      const payload = {
        propinsi: katagori1,
        kabupaten: katagori2,
        cabang: katagori3,
        pb: kuota,
        sanduka: "",
        iuran: "DASPEN",
      };
      await GlobalApi.updateIuranData(4, payload);
      toast.success("Besaran Daspen diperbarui!");
      setShowConfig(false);
    } catch (error) {
      toast.error("Gagal memperbarui besaran.");
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();
    if (!selectedCabang || !selectedMonth) {
      toast.error("Pilih Cabang dan Bulan!");
      return;
    }
    try {
      const payload = {
        bulan: selectedMonth,
        tahun: selectedYear,
        cabang: selectedCabang,
        kategori1: kat1,
        kategori2: kat2,
        kategori3: kat3,
        perolehanCabang: perolehanCabang,
        perolehanKabupaten: perolehanKabupaten,
        valueKat1: kat1 * kat1Val,
        valueKat2: kat2 * kat2Val,
        valueKat3: kat3 * kat3Val,
      };
      await GlobalApi.createTargetDaspen(payload);
      toast.success(`Berhasil menyimpan Daspen untuk ${selectedCabang}`);
      fetchTableData();
      // Reset inputs
      setKat1(0); setKat2(0); setKat3(0);
    } catch (error) {
      toast.error("Gagal menyimpan data Daspen.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      
      {/* Banner */}
      <div className="bg-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FaHandHoldingHeart className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-black">Dana Sosial Pensiun (Daspen)</h2>
              <p className="text-rose-100 text-xs font-medium">Manajemen kuota dan perolehan per kategori</p>
            </div>
          </div>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all active:scale-95"
          >
            <FaCog className={showConfig ? "rotate-90 transition-transform" : ""} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <AnimatePresence>
          {showConfig && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                    <FaCalculator className="text-rose-500" />
                    <span>Konfigurasi Besaran Daspen</span>
                  </h3>
                  <button 
                    onClick={handleSaveBesaran}
                    className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase mb-1 px-1">Kuota Dasar</label>
                    <input 
                      type="number"
                      value={kuota}
                      onChange={(e) => setKuota(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  {[
                    { label: "Kat I (X)", key: "katagori1", val: kat1Val },
                    { label: "Kat II (X)", key: "katagori2", val: kat2Val },
                    { label: "Kat III (X)", key: "katagori3", val: kat3Val }
                  ].map(cat => (
                    <div key={cat.key}>
                      <label className="text-xs font-black text-slate-500 uppercase mb-1 px-1">{cat.label}</label>
                      <div className="space-y-1">
                        <input 
                          type="number" step="0.01"
                          onChange={(e) => {
                            if(cat.key === "katagori1") setKatagori1(parseFloat(e.target.value) || 0);
                            if(cat.key === "katagori2") setKatagori2(parseFloat(e.target.value) || 0);
                            if(cat.key === "katagori3") setKatagori3(parseFloat(e.target.value) || 0);
                          }}
                          value={cat.key === "katagori1" ? katagori1 : cat.key === "katagori2" ? katagori2 : katagori3}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                        <p className="text-xs text-rose-500 font-bold px-1">= {formatCurrency(cat.val)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">01</span>
              <span>Input Realisasi Per Cabang</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Cabang</label>
                  <select 
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                  >
                    <option value="">-- Pilih Cabang --</option>
                    {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Bulan</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                    {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Tahun</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 rounded-3xl">
                {[
                  { label: "Kategori I", val: kat1, setter: setKat1 },
                  { label: "Kategori II", val: kat2, setter: setKat2 },
                  { label: "Kategori III", val: kat3, setter: setKat3 }
                ].map(cat => (
                  <div key={cat.label}>
                    <label className="text-xs font-black text-slate-500 uppercase mb-1 block">{cat.label}</label>
                    <input 
                      type="number"
                      value={cat.val}
                      onChange={(e) => cat.setter(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-black outline-none focus:bg-white/10"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Total Target</p>
                  <p className="text-lg font-black text-emerald-700">{formatCurrency(totalTarget)}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Porsi Cabang</p>
                  <p className="text-lg font-black text-rose-700">{formatCurrency(perolehanCabang)}</p>
                </div>
              </div>

              <button 
                onClick={handleSubmitTarget}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                Kunci Transaksi Daspen
              </button>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">02</span>
              <span>Proyeksi Distribusi Perolehan</span>
            </h3>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600 uppercase">Setor Provinsi (89.5%)</span>
                </div>
                <span className="font-black text-slate-800">{formatCurrency(perolehanProvinsi)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600 uppercase">Bagian Kabupaten (4.0%)</span>
                </div>
                <span className="font-black text-slate-800">{formatCurrency(perolehanKabupaten)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-bold text-slate-600 uppercase">Bagian Cabang (6.5%)</span>
                </div>
                <span className="font-black text-slate-800">{formatCurrency(perolehanCabang)}</span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between px-2">
                <span className="text-sm font-black text-slate-400 uppercase">Total Akumulasi</span>
                <span className="text-2xl font-black text-rose-500">{formatCurrency(totalTarget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">03</span>
              <span>Rekapitulasi Daspen Per Cabang</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-rose-500/20"
              >
                {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-rose-500/20"
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input 
                  type="text" 
                  placeholder="Cari Cabang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black w-48 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Cabang</th>
                  <th className="px-6 py-4 text-center">Kat I</th>
                  <th className="px-6 py-4 text-center">Kat II</th>
                  <th className="px-6 py-4 text-center">Kat III</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingTable ? (
                   Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                    </tr>
                  ))
                ) : tableData.filter(r => r["Cabang/Khusus"]?.toLowerCase().includes(searchQuery.toLowerCase())).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-700 text-sm">{row["Cabang/Khusus"]}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{row["Anggota Kategori I"]}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{row["Anggota Kategori II"]}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{row["Anggota Kategori III"]}</td>
                    <td className="px-6 py-4 text-right font-black text-rose-500">{formatCurrency(row["Total Target Perolehan"])}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black">TERCATAT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaspenSection;
