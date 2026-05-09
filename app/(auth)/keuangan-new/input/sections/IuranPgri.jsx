"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaDollarSign, 
  FaUsers, 
  FaSave, 
  FaUndo, 
  FaSearch, 
  FaPrint, 
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const IuranPgriSection = () => {
  // Besaran Iuran State
  const [besaran, setBesaran] = useState({
    pb: 0,
    propinsi: 0,
    kabupaten: 0,
    cabang: 0,
    sanduka: 0
  });
  const [loadingBesaran, setLoadingBesaran] = useState(false);

  // Target Iuran State
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalAnggotaCabang, setTotalAnggotaCabang] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  
  // Lists
  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  
  // Table State
  const [transactions, setTransactions] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(2)
      ]);
      
      setBulanList(resBulan.data || []);
      setCabangList(resCabang.data || []);
      
      if (resIuran) {
        setBesaran({
          pb: parseInt(resIuran.pb) || 0,
          propinsi: parseInt(resIuran.propinsi) || 0,
          kabupaten: parseInt(resIuran.kabupaten) || 0,
          cabang: parseInt(resIuran.cabang) || 0,
          sanduka: parseInt(resIuran.sanduka) || 0
        });
      }

      // Default month
      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth]) {
        setSelectedMonth(resBulan.data[currentMonth].namaBulan);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Fetch Total Anggota when Cabang changes
  useEffect(() => {
    if (selectedCabang) {
      fetchTotalAnggota();
    }
  }, [selectedCabang]);

  const fetchTotalAnggota = async () => {
    try {
      const res = await GlobalApi.getTotalAnggotaByCabang(selectedCabang);
      setTotalAnggotaCabang(res?.[0]?.totalAnggota || 0);
    } catch (error) {
      console.error("Error fetching total anggota:", error);
    }
  };

  // Fetch Table Data
  const fetchTransactions = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const data = await GlobalApi.getTableIuran(selectedMonth, selectedYear, []);
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handlers
  const handleUpdateBesaran = async () => {
    setLoadingBesaran(true);
    try {
      const payload = {
        pb: besaran.pb,
        propinsi: besaran.propinsi,
        kabupaten: besaran.kabupaten,
        cabang: besaran.cabang,
        sanduka: besaran.sanduka,
        iuran: "IURAN PGRI"
      };
      await GlobalApi.updateIuranData(2, payload);
      toast.success("Besaran iuran berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui besaran iuran.");
    } finally {
      setLoadingBesaran(false);
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
        cabang: selectedCabang,
        jumlah: totalAnggotaCabang,
        bulan: selectedMonth,
        keterangan: keterangan,
        tahun: selectedYear,
      };
      await GlobalApi.createTargetIuaran(payload);
      toast.success(`Berhasil menyimpan data untuk ${selectedCabang}`);
      fetchTransactions();
      setKeterangan("");
    } catch (error) {
      toast.error("Gagal menyimpan data.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const totalIuran = besaran.pb + besaran.propinsi + besaran.kabupaten + besaran.cabang;
  const grandTotal = totalIuran + besaran.sanduka;

  // Pagination Logic
  const filteredTransactions = transactions.filter(t => 
    t[0]?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedData = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      
      {/* Top Banner */}
      <div className="bg-emerald-500 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <FaDollarSign className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-black">Manajemen Iuran PGRI</h2>
            <p className="text-emerald-100 text-xs font-medium">Kelola besaran iuran dan target setoran cabang</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column: Besaran Iuran Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">01</span>
                <span>Besaran Iuran Standar</span>
              </h3>
              <button 
                onClick={() => fetchInitialData()}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
              >
                Reset Default
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Iuran PB", key: "pb" },
                { label: "Iuran Provinsi", key: "propinsi" },
                { label: "Iuran Kabupaten", key: "kabupaten" },
                { label: "Iuran Cabang", key: "cabang" },
                { label: "Sumbangan Sanduka", key: "sanduka", full: true }
              ].map((field) => (
                <div key={field.key} className={field.full ? "col-span-2" : ""}>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                    <input 
                      type="number"
                      value={besaran[field.key]}
                      onChange={(e) => setBesaran({...besaran, [field.key]: parseInt(e.target.value) || 0})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-3xl text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Iuran PGRI</span>
                <span className="font-bold">{formatCurrency(totalIuran)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-xs font-black uppercase text-emerald-400">Grand Total</span>
                <span className="text-xl font-black text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleUpdateBesaran}
              disabled={loadingBesaran}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
            >
              {loadingBesaran ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave />}
              <span>Simpan Besaran Baru</span>
            </button>
          </div>

          {/* Right Column: Input Target Per Cabang */}
          <div className="space-y-6">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">02</span>
              <span>Input Target Setoran Cabang</span>
            </h3>

            <form onSubmit={handleSubmitTarget} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Pilih Cabang</label>
                <select 
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Pilih Cabang --</option>
                  {cabangList.map(c => (
                    <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Bulan</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                  >
                    {bulanList.map(b => (
                      <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Tahun</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <FaUsers />
                  </div>
                  <span className="text-xs font-black text-blue-800 uppercase">Jumlah Anggota</span>
                </div>
                <span className="text-xl font-black text-blue-600">{totalAnggotaCabang} <span className="text-[10px] text-blue-400">Orang</span></span>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Keterangan Selisih (Opsional)</label>
                <textarea 
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Penambahan anggota baru..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-700 h-24 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black shadow-lg transition-all"
              >
                Kunci Target Setoran
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Transaction Table */}
        <div className="pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">03</span>
              <span>History Transaksi Cabang</span>
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
                  <th className="px-6 py-4">Bulan</th>
                  <th className="px-6 py-4 text-center">Anggota</th>
                  <th className="px-6 py-4 text-right">Total Setoran</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingTable ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                    </tr>
                  ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-black text-slate-700 text-sm">{item[0]}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-bold">{item[2]} {item[4]}</td>
                      <td className="px-6 py-4 text-center text-slate-600 font-black">{item[1]}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(parseFloat(item[1]) * grandTotal)}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic max-w-[200px] truncate">{item[3] || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                          TERKUNCI
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold">Tidak ada data transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                Menampilkan <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="text-slate-800">{filteredTransactions.length}</span> Cabang
              </p>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <FaChevronLeft size={10} />
                </button>
                <div className="flex space-x-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IuranPgriSection;
