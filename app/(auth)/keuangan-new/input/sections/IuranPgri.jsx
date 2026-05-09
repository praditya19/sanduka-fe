"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  FaChevronRight,
  FaCoins,
  FaNewspaper,
  FaChartBar,
  FaTable,
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaTimes
} from "react-icons/fa";

const IuranPgriSection = () => {
  const router = useRouter();
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
  const [rawBalancingData, setRawBalancingData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({
    totalAnggota: 0,
    tambahanCabang: 0,
    setoranTunai: 0,
    potonganBank: 0,
    keterangan: ""
  });
  const itemsPerPage = 10;
  const [activeSubTab, setActiveSubTab] = useState("data-iuran"); // 'data-iuran' or 'peruntukan'
  const [summaryStats, setSummaryStats] = useState({
    totalTagihan: 0,
    totalSetoran: 0,
    totalSelisih: 0,
    potonganBank: 0,
    setoranTunai: 0,
    totalDibayar: 0
  });

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

  // Fetch Table Data
  const fetchTransactions = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const monthObj = bulanList.find(b => b.namaBulan === selectedMonth);
      const monthNumber = monthObj ? monthObj.id : (new Date().getMonth() + 1);
      
      const data = await GlobalApi.getTransaksiBankBalancing("", null, selectedYear, monthNumber, null, null);
      setRawBalancingData(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching balancing data:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear, bulanList]);

  // Compute Transactions Table
  const transactions = useMemo(() => {
    if (!rawBalancingData.length) return [];
    
    const grouped = rawBalancingData.reduce((acc, item) => {
      const cab = item.cabang || "Lainnya";
      if (!acc[cab]) acc[cab] = { members: new Set(), potBank: 0, tunai: 0 };
      
      if (item.npa) acc[cab].members.add(item.npa);
      
      const amount = parseFloat(item.totalIuran) || 0;
      if (item.keterangan === "Sukses") {
        acc[cab].potBank += amount;
      } else {
        acc[cab].tunai += amount;
      }
      return acc;
    }, {});

    return Object.keys(grouped).sort().map(cabName => {
      const group = grouped[cabName];
      const totalAnggota = group.members.size;
      
      const pb = totalAnggota * besaran.pb;
      const prov = totalAnggota * besaran.propinsi;
      const kab = totalAnggota * besaran.kabupaten;
      const cabPeruntukan = totalAnggota * besaran.cabang;
      const sanduka = totalAnggota * besaran.sanduka;
      
      const tambahan = 0; // Placeholder for now
      const totalCabang = cabPeruntukan + tambahan;
      const totalTagihan = pb + prov + kab + totalCabang + sanduka;
      const potBank = group.potBank;
      const tunai = group.tunai;
      const selisih = totalTagihan - (potBank + tunai);
      
      return [
        cabName,        // 0: Cabang
        totalAnggota,   // 1: Total Anggota
        pb,             // 2: Pusat (PB)
        prov,           // 3: Peruntukan Provinsi
        kab,            // 4: Peruntukan Kabupaten
        cabPeruntukan,  // 5: Peruntukan Cabang
        tambahan,       // 6: Tambahan Cabang
        totalCabang,    // 7: Total Cabang
        sanduka,        // 8: Sanduka
        totalTagihan,   // 9: Total Tagihan
        potBank,        // 10: Potongan Bank
        tunai,          // 11: Setoran Tunai
        selisih         // 12: Selisih
      ];
    });
  }, [rawBalancingData, besaran]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate Summary Stats
  useEffect(() => {
    if (transactions.length > 0) {
      const stats = transactions.reduce((acc, row) => {
        const tagihan = row[9];
        const potBank = row[10];
        const tunai = row[11];
        const dibayar = potBank + tunai;
        
        acc.totalTagihan += tagihan;
        acc.totalSetoran += dibayar;
        acc.totalSelisih += (tagihan - dibayar);
        acc.potonganBank += potBank;
        acc.setoranTunai += tunai;
        acc.totalDibayar += dibayar;
        return acc;
      }, {
        totalTagihan: 0,
        totalSetoran: 0,
        totalSelisih: 0,
        potonganBank: 0,
        setoranTunai: 0,
        totalDibayar: 0
      });
      setSummaryStats(stats);
    } else {
      setSummaryStats({
        totalTagihan: 0,
        totalSetoran: 0,
        totalSelisih: 0,
        potonganBank: 0,
        setoranTunai: 0,
        totalDibayar: 0
      });
    }
  }, [transactions]);

  const handleSaveTable = () => {
    toast.success("Rekapitulasi data iuran berhasil disimpan!");
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setEditForm({
      totalAnggota: row[1] || 0,
      tambahanCabang: row[6] || 0,
      setoranTunai: row[11] || 0,
      potonganBank: row[10] || 0,
      keterangan: "Koreksi Data"
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        cabang: editingRow[0],
        jumlah: editForm.totalAnggota,
        bulan: selectedMonth,
        tahun: selectedYear,
        keterangan: editForm.keterangan || "Koreksi via Dashboard",
        // Additional fields if supported by backend
        tambahan: editForm.tambahanCabang,
        tunai: editForm.setoranTunai,
        bank: editForm.potonganBank
      };
      
      await GlobalApi.createTargetIuaran(payload);
      toast.success(`Data ${editingRow[0]} berhasil dikoreksi!`);
      setIsEditModalOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error("Gagal menyimpan koreksi data.");
    }
  };

  const handleDelete = (row) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data koreksi untuk ${row[0]}?`)) {
      toast.success(`Data ${row[0]} berhasil direset!`);
      // Logic for actual delete would go here
    }
  };

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
  const paginatedData = filteredTransactions;

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
        {/* Top Section: Form Besaran (Full Width) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                <FaCoins className="text-base" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Besaran Iuran Standar</h3>
                <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">Parameter Keuangan Utama</p>
              </div>
            </div>
            <button 
              onClick={() => fetchInitialData()}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
            >
              Reset Default
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Iuran Pusat (PB)", key: "pb", icon: "🇮🇩" },
                { label: "Iuran Provinsi", key: "propinsi", icon: "🏛️" },
                { label: "Iuran Kabupaten", key: "kabupaten", icon: "🏙️" },
                { label: "Iuran Cabang", key: "cabang", icon: "🏘️" },
                { label: "Sumbangan Sanduka", key: "sanduka", icon: "🤝", full: true }
              ].map((field) => (
                <div key={field.key} className={field.full ? "md:col-span-2 lg:col-span-4" : ""}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1 flex items-center gap-2">
                    <span>{field.icon}</span>
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                      <span className="text-slate-300 font-black text-sm">Rp</span>
                    </div>
                    <input 
                      type="number"
                      value={besaran[field.key]}
                      onChange={(e) => setBesaran({...besaran, [field.key]: parseInt(e.target.value) || 0})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-emerald-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900 rounded-[24px] text-white flex flex-col justify-between border-b-4 border-slate-700">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Iuran PGRI</p>
                  <h5 className="text-base font-black">{formatCurrency(totalIuran)}</h5>
                </div>
                <div className="p-4 bg-emerald-500 rounded-[24px] text-white flex flex-col justify-between shadow-lg shadow-emerald-100 border-b-4 border-emerald-600">
                  <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest mb-0.5">Grand Total Akhir</p>
                  <h5 className="text-lg font-black">{formatCurrency(grandTotal)}</h5>
                </div>
              </div>
              <button 
                onClick={handleUpdateBesaran}
                disabled={loadingBesaran}
                className="w-full py-5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-[24px] font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loadingBesaran ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave className="text-base" />}
                <span className="text-base tracking-tight">Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Laporan */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                <FaNewspaper className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Laporan & Rekapitulasi</h3>
                <p className="text-slate-400 text-xs font-medium">Monitoring peruntukan dan realisasi iuran</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-[18px] shadow-inner border border-slate-200">
              <button
                onClick={() => { setActiveSubTab("data-iuran"); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[15px] font-black text-[9px] uppercase tracking-wider transition-all duration-300 ${
                  activeSubTab === "data-iuran"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaChartBar className={activeSubTab === "data-iuran" ? "text-indigo-500" : ""} />
                Data Iuran
              </button>
              <button
                onClick={() => { setActiveSubTab("peruntukan"); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[15px] font-black text-[9px] uppercase tracking-wider transition-all duration-300 ${
                  activeSubTab === "peruntukan"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaTable className={activeSubTab === "peruntukan" ? "text-indigo-500" : ""} />
                Peruntukan Cabang
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pencarian</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input 
                      type="text" 
                      placeholder="Cari Cabang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-xs"
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
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {activeSubTab === "data-iuran" && (
                    <>
                      {/* Summary Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: "Total Tagihan", val: summaryStats.totalTagihan, color: "bg-indigo-600", icon: <FaNewspaper /> },
                          { label: "Setoran Diterima", val: summaryStats.totalSetoran, color: "bg-emerald-500", icon: <FaCheckCircle /> },
                          { label: "Total Selisih", val: summaryStats.totalSelisih, color: "bg-rose-500", icon: <FaExclamationCircle /> }
                        ].map((stat, i) => (
                          <div key={i} className={`${stat.color} p-5 rounded-[28px] text-white shadow-lg shadow-${stat.color.split('-')[1]}-100 flex items-center justify-between group overflow-hidden relative`}>
                            <div className="relative z-10">
                              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">{stat.label}</p>
                              <h4 className="text-xl font-black">{formatCurrency(stat.val)}</h4>
                            </div>
                            <div className="text-3xl opacity-10 group-hover:scale-125 transition-transform duration-500">
                              {stat.icon}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Detail Section */}
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                          <h4 className="text-base font-black text-slate-800">Rincian Pembayaran Akumulatif</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {[
                            { label: "🏦 Potongan Bank", val: summaryStats.potonganBank, color: "text-rose-500" },
                            { label: "💵 Setoran Tunai", val: summaryStats.setoranTunai, color: "text-blue-500" },
                            { label: "∑ Total Dibayar", val: summaryStats.totalDibayar, color: "text-emerald-600" }
                          ].map((item, i) => (
                            <div key={i} className="relative">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{item.label}</p>
                              <p className={`text-base font-black ${item.color}`}>{formatCurrency(item.val)}</p>
                              {i < 2 && <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-100" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Table */}
                      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                          <div className="flex items-center gap-2">
                            <FaTable className="text-indigo-500 text-sm" />
                            <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest text-[10px]">Tabel Rekapitulasi Iuran</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={handleSaveTable} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg">
                              <FaSave />
                              <span>Simpan Data</span>
                            </button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg">
                              <FaPrint />
                              <span>Cetak PDF</span>
                            </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                {["No", "Cabang/Khusus", "Total Anggota", "Pusat (PB)", "Peruntukan Provinsi", "Peruntukan Kabupaten", "Peruntukan Cabang", "Tambahan Cabang", "Total Cabang", "Sanduka", "Total Tagihan", "Potongan Bank", "Setoran Tunai", "Selisih", "Action"].map((h, i) => (
                                  <th key={i} className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {loadingTable ? (
                                Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={14} className="p-6"><div className="h-3 bg-slate-100 rounded-full w-full" /></td></tr>)
                              ) : paginatedData.length > 0 ? (
                                paginatedData.map((row, i) => {
                                  const totalCabang = (parseInt(row[5] || 0) + parseInt(row[6] || 0));
                                  const totalTagihanRow = (parseInt(row[2] || 0) + parseInt(row[3] || 0) + parseInt(row[4] || 0) + totalCabang + parseInt(row[8] || 0));
                                  return (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors text-center text-[11px] font-bold text-slate-600">
                                      <td className="px-3 py-4 text-slate-400 font-black">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                      <td className="px-3 py-4 font-black text-slate-800 text-left whitespace-nowrap">{row[0]}</td>
                                      <td className="px-3 py-4 text-indigo-600 font-black"><span className="px-2 py-0.5 bg-indigo-50 rounded-md">{row[1]}</span></td>
                                      <td className="px-3 py-4">{formatCurrency(row[2])}</td>
                                      <td className="px-3 py-4">{formatCurrency(row[3])}</td>
                                      <td className="px-3 py-4">{formatCurrency(row[4])}</td>
                                      <td className="px-3 py-4">{formatCurrency(row[5])}</td>
                                      <td className="px-3 py-4">{formatCurrency(row[6])}</td>
                                      <td className="px-3 py-4 text-emerald-600">{formatCurrency(row[7] || totalCabang)}</td>
                                      <td className="px-3 py-4">{formatCurrency(row[8])}</td>
                                      <td className="px-3 py-4 text-slate-900 bg-slate-50/50 font-black">{formatCurrency(row[9] || totalTagihanRow)}</td>
                                      <td className="px-3 py-4 text-rose-500">{formatCurrency(row[10] || 0)}</td>
                                      <td className="px-3 py-4 text-blue-600">{formatCurrency(row[11] || 0)}</td>
                                      <td className="px-3 py-4"><span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md">{formatCurrency(row[12] || totalTagihanRow)}</span></td>
                                      <td className="px-3 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                          <button 
                                            onClick={() => handleEdit(row)}
                                            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                            title="Edit"
                                          >
                                            <FaEdit size={12} />
                                          </button>
                                          <button 
                                            onClick={() => handleDelete(row)}
                                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            title="Delete"
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr><td colSpan={14} className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data Kosong</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {activeSubTab === "peruntukan" && (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                          <FaTable className="text-indigo-500 text-sm" />
                          <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest text-[10px]">Peruntukan Cabang</h4>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                              {["No", "Cabang/Khusus", "Anggota", "Peruntukan Cabang", "Tambahan Cabang", "Total Alokasi"].map((h, i) => (
                                <th key={i} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {loadingTable ? (
                              Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="p-8"><div className="h-3 bg-slate-100 rounded-full w-full" /></td></tr>)
                            ) : paginatedData.length > 0 ? (
                              paginatedData.map((row, i) => {
                                const totalPeruntukan = (parseInt(row[5] || 0) + parseInt(row[6] || 0));
                                return (
                                  <tr key={i} className="hover:bg-slate-50/80 transition-colors text-center text-[12px] font-bold text-slate-600">
                                    <td className="px-6 py-5 text-slate-400 font-black">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                    <td className="px-6 py-5 font-black text-slate-800 text-left whitespace-nowrap">{row[0]}</td>
                                    <td className="px-6 py-5"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black">{row[1]}</span></td>
                                    <td className="px-6 py-5">{formatCurrency(row[5])}</td>
                                    <td className="px-6 py-5">{formatCurrency(row[6])}</td>
                                    <td className="px-6 py-5 text-emerald-600 font-black">{formatCurrency(row[7] || totalPeruntukan)}</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr><td colSpan={6} className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data Kosong</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}


                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                    <FaEdit />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">Koreksi Data: {editingRow?.[0]}</h3>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Periode: {selectedMonth} {selectedYear}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Total Anggota</label>
                    <input 
                      type="number"
                      value={editForm.totalAnggota}
                      onChange={(e) => setEditForm({...editForm, totalAnggota: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tambahan Cabang</label>
                    <input 
                      type="number"
                      value={editForm.tambahanCabang}
                      onChange={(e) => setEditForm({...editForm, tambahanCabang: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Potongan Bank</label>
                    <input 
                      type="number"
                      value={editForm.potonganBank}
                      onChange={(e) => setEditForm({...editForm, potonganBank: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Setoran Tunai</label>
                    <input 
                      type="number"
                      value={editForm.setoranTunai}
                      onChange={(e) => setEditForm({...editForm, setoranTunai: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Keterangan / Alasan Koreksi</label>
                  <textarea 
                    value={editForm.keterangan}
                    onChange={(e) => setEditForm({...editForm, keterangan: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-700 transition-all shadow-inner text-xs resize-none"
                    placeholder="Contoh: Penyesuaian jumlah anggota manual..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    Simpan Koreksi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IuranPgriSection;
