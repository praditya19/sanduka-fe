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
        {/* Top Section: Configuration (Integrated) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-100">
                <FaCalculator className="text-base" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Konfigurasi Besaran Daspen</h3>
                <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">Parameter Kuota & Kategori</p>
              </div>
            </div>
            <button 
              onClick={() => fetchInitialData()}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
            >
              Reset Default
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Kuota Dasar</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">Rp</span>
                  </div>
                  <input 
                    type="number"
                    value={kuota}
                    onChange={(e) => setKuota(parseInt(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-rose-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                  />
                </div>
              </div>
              {[
                { label: "Kategori I (X)", key: "katagori1", val: kat1Val },
                { label: "Kategori II (X)", key: "katagori2", val: kat2Val },
                { label: "Kategori III (X)", key: "katagori3", val: kat3Val }
              ].map(cat => (
                <div key={cat.key}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">{cat.label}</label>
                  <div className="space-y-2">
                    <input 
                      type="number" step="0.01"
                      value={cat.key === "katagori1" ? katagori1 : cat.key === "katagori2" ? katagori2 : katagori3}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        if(cat.key === "katagori1") setKatagori1(v);
                        if(cat.key === "katagori2") setKatagori2(v);
                        if(cat.key === "katagori3") setKatagori3(v);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-rose-500 outline-none font-black text-slate-700 transition-all text-base hover:bg-slate-100/50 shadow-inner text-center"
                    />
                    <div className="px-4 py-1.5 bg-rose-50 rounded-lg text-center">
                      <p className="text-[10px] text-rose-600 font-black">{formatCurrency(cat.val)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSaveBesaran}
              className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-black shadow-xl shadow-rose-100 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <FaSave className="text-base" />
              <span className="text-base tracking-tight">Simpan Konfigurasi Daspen</span>
            </button>
          </div>
        </motion.div>

        {/* Bottom Section: Laporan & Input */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm">
                <FaHandHoldingHeart className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Input Realisasi & Monitoring</h3>
                <p className="text-slate-400 text-xs font-medium">Pengelolaan Daspen per cabang</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar: Filter & Input */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Filter Data</h4>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pencarian</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input 
                      type="text" 
                      placeholder="Cari Cabang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all text-xs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bulan</label>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 text-[10px] appearance-none"
                    >
                      {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tahun</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 text-[10px] appearance-none"
                    >
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Input Card */}
              <form onSubmit={handleSubmitTarget} className="bg-slate-900 p-6 rounded-[32px] shadow-2xl space-y-5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Entri Transaksi</h4>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Pilih Cabang</label>
                  <select 
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold text-white text-xs focus:bg-white/10"
                  >
                    <option value="" className="text-slate-800">-- Pilih Cabang --</option>
                    {cabangList.map(c => <option key={c.id} value={c.kecamatan} className="text-slate-800">{c.kecamatan}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "KAT I", val: kat1, setter: setKat1 },
                    { label: "KAT II", val: kat2, setter: setKat2 },
                    { label: "KAT III", val: kat3, setter: setKat3 }
                  ].map(cat => (
                    <div key={cat.label}>
                      <label className="text-[8px] font-black text-slate-500 uppercase mb-1 block text-center">{cat.label}</label>
                      <input 
                        type="number"
                        value={cat.val}
                        onChange={(e) => cat.setter(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white font-black text-center outline-none focus:bg-white/10 text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Target</span>
                    <span className="text-sm font-black text-emerald-400">{formatCurrency(totalTarget)}</span>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-900/20 transition-all active:scale-[0.98] text-xs"
                  >
                    Kunci Transaksi
                  </button>
                </div>
              </form>
            </div>

            {/* Main Content: Stats & Table */}
            <div className="lg:col-span-3 space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Setor Provinsi (89.5%)", val: perolehanProvinsi, color: "bg-indigo-600", icon: <FaShieldAlt /> },
                  { label: "Bagian Kabupaten (4%)", val: perolehanKabupaten, color: "bg-amber-500", icon: <FaChartPie /> },
                  { label: "Bagian Cabang (6.5%)", val: perolehanCabang, color: "bg-emerald-500", icon: <FaUsers /> }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} p-5 rounded-[28px] text-white shadow-lg flex items-center justify-between group overflow-hidden relative`}>
                    <div className="relative z-10">
                      <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">{stat.label}</p>
                      <h4 className="text-lg font-black">{formatCurrency(stat.val)}</h4>
                    </div>
                    <div className="text-3xl opacity-10 group-hover:scale-125 transition-transform duration-500">
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <FaHandHoldingHeart className="text-rose-500 text-sm" />
                    <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest text-[10px]">Rekapitulasi Daspen Per Cabang</h4>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        {["No", "Cabang/Khusus", "Kat I", "Kat II", "Kat III", "Total Target", "Status"].map((h, i) => (
                          <th key={i} className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loadingTable ? (
                        Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={7} className="p-6"><div className="h-3 bg-slate-100 rounded-full w-full" /></td></tr>)
                      ) : tableData.filter(r => r["Cabang/Khusus"]?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        tableData.filter(r => r["Cabang/Khusus"]?.toLowerCase().includes(searchQuery.toLowerCase())).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors text-center text-[11px] font-bold text-slate-600">
                            <td className="px-4 py-4 text-slate-400 font-black">{i + 1}</td>
                            <td className="px-4 py-4 font-black text-slate-800 text-left whitespace-nowrap">{row["Cabang/Khusus"]}</td>
                            <td className="px-4 py-4"><span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md">{row["Anggota Kategori I"]}</span></td>
                            <td className="px-4 py-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{row["Anggota Kategori II"]}</span></td>
                            <td className="px-4 py-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">{row["Anggota Kategori III"]}</span></td>
                            <td className="px-4 py-4 text-slate-900 font-black">{formatCurrency(row["Total Target Perolehan"])}</td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black">TERCATAT</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data Kosong</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaspenSection;
