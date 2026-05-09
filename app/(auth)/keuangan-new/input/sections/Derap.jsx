"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaNewspaper, 
  FaSave, 
  FaSearch, 
  FaCog,
  FaCalculator,
  FaShoppingCart,
  FaChartLine
} from "react-icons/fa";

const DerapSection = () => {
  const [besaran, setBesaran] = useState({ provinsi: 0, kabupaten: 0, cabang: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const [loadingBesaran, setLoadingBesaran] = useState(false);

  const [selectedCabang, setSelectedCabang] = useState("");
  const [jumlahPesanan, setJumlahPesanan] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPerUnit = besaran.provinsi + besaran.kabupaten + besaran.cabang;
  const totalAkhir = totalPerUnit * jumlahPesanan;
  const setorProvinsi = besaran.provinsi * jumlahPesanan;
  const bagianKabupaten = besaran.kabupaten * jumlahPesanan;
  const bagianCabang = besaran.cabang * jumlahPesanan;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(3) // Derap ID = 3
      ]);
      setBulanList(resBulan.data || []);
      setCabangList(resCabang.data || []);
      if (resIuran) {
        setBesaran({
          provinsi: parseInt(resIuran.propinsi) || 0,
          kabupaten: parseInt(resIuran.kabupaten) || 0,
          cabang: parseInt(resIuran.cabang) || 0
        });
      }
      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth]) setSelectedMonth(resBulan.data[currentMonth].namaBulan);
    } catch (error) {
      console.error("Error fetching Derap data:", error);
    }
  };

  const fetchTableData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const data = await GlobalApi.getTableDerap(selectedMonth, selectedYear, []);
      setTableData(data || []);
    } catch (error) {
      console.error("Error fetching Derap table:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleSaveBesaran = async () => {
    setLoadingBesaran(true);
    try {
      const payload = {
        pb: "",
        propinsi: besaran.provinsi,
        kabupaten: besaran.kabupaten,
        cabang: besaran.cabang,
        sanduka: "",
        iuran: "DERAP"
      };
      await GlobalApi.updateIuranData(3, payload);
      toast.success("Besaran Derap diperbarui!");
      setShowConfig(false);
    } catch (error) {
      toast.error("Gagal memperbarui besaran.");
    } finally {
      setLoadingBesaran(false);
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();
    if (!selectedCabang || !jumlahPesanan) {
      toast.error("Pilih Cabang dan Jumlah Pesanan!");
      return;
    }
    try {
      const payload = {
        cabang: selectedCabang,
        jumlah: jumlahPesanan,
        bulan: selectedMonth,
        tahun: selectedYear,
        perolehanKabupaten: bagianKabupaten,
        perolehanCabang: bagianCabang,
      };
      await GlobalApi.createTargetDerap(payload);
      toast.success(`Derap ${selectedCabang} berhasil disimpan!`);
      fetchTableData();
      setJumlahPesanan(0);
    } catch (error) {
      toast.error("Gagal menyimpan data Derap.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      <div className="bg-indigo-500 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <FaNewspaper className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-black">Publikasi Derap</h2>
            <p className="text-indigo-100 text-xs font-medium">Manajemen pesanan dan distribusi majalah Derap</p>
          </div>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all active:scale-95">
          <FaCog />
        </button>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <AnimatePresence>
          {showConfig && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 overflow-hidden"
            >
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
              <FaCalculator className="text-indigo-500" />
              <span>Konfigurasi Harga Per Unit</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Porsi Provinsi", key: "provinsi" },
                { label: "Porsi Kabupaten", key: "kabupaten" },
                { label: "Porsi Cabang", key: "cabang" }
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1 block">{field.label}</label>
                  <input 
                    type="number"
                    value={besaran[field.key]}
                    onChange={(e) => setBesaran({...besaran, [field.key]: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveBesaran} disabled={loadingBesaran} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">
              Simpan Konfigurasi
            </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
             <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">01</span>
              <span>Input Pesanan Derap</span>
            </h3>
            <form onSubmit={handleSubmitTarget} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Cabang</label>
                <select value={selectedCabang} onChange={(e) => setSelectedCabang(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                  <option value="">-- Pilih Cabang --</option>
                  {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="p-4 bg-slate-900 rounded-3xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 text-white rounded-lg">
                    <FaShoppingCart />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Jumlah Eksemplar</span>
                </div>
                <input 
                  type="number" 
                  value={jumlahPesanan}
                  onChange={(e) => setJumlahPesanan(parseInt(e.target.value) || 0)}
                  className="w-24 bg-transparent border-b-2 border-white/20 focus:border-indigo-400 outline-none text-xl font-black text-white text-center"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg">
                Kunci Pesanan Derap
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">02</span>
              <span>Proyeksi Distribusi Derap</span>
            </h3>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Setor Provinsi</span>
                <span className="font-black text-slate-800">{formatCurrency(setorProvinsi)}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Bagian Kabupaten</span>
                <span className="font-black text-slate-800">{formatCurrency(bagianKabupaten)}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Bagian Cabang</span>
                <span className="font-black text-slate-800">{formatCurrency(bagianCabang)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between px-2">
                <span className="text-sm font-black text-slate-400 uppercase">Total Tagihan</span>
                <span className="text-2xl font-black text-indigo-600">{formatCurrency(totalAkhir)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">03</span>
              <span>Riwayat Distribusi Derap</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-indigo-500/20"
              >
                {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-indigo-500/20"
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
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black w-48 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                <tr className="bg-slate-50/50 text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Cabang</th>
                  <th className="px-6 py-4 text-center">Jumlah</th>
                  <th className="px-6 py-4 text-right">Tagihan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loadingTable ? <tr><td colSpan="4" className="p-8 text-center animate-pulse">Memuat data...</td></tr> : 
                   tableData.filter(r => r.cabang?.toLowerCase().includes(searchQuery.toLowerCase())).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-700 text-sm">{row.cabang}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600">{row.jumlah} Eks</td>
                      <td className="px-6 py-4 text-right font-black text-indigo-500">{formatCurrency(row.total)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">Terkirim</span>
                      </td>
                    </tr>
                  ))
                 }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DerapSection;
