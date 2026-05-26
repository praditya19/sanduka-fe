"use client";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FaEllipsisH,
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
  FaFileInvoiceDollar,
  FaPlusCircle,
  FaHistory,
  FaSearch,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";

const LainLainSection = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    keterangan: "",
    rawProvinsi: "",
    rawKabupaten: "",
    rawCabang: ""
  });

  const [keteranganOptions, setKeteranganOptions] = useState([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulanList, setBulanList] = useState([]);

  const [cabangList, setCabangList] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchCabang = async () => {
    try {
      const res = await GlobalApi.getCabang();
      const dataCabang = res.data || [];

      // --- PROSES URUT ABJAD (A-Z) BERDASARKAN KECAMATAN ---
      const sortedCabang = dataCabang.sort((a, b) => {
        const namaA = (a.kecamatan || "").toUpperCase();
        const namaB = (b.kecamatan || "").toUpperCase();
        return namaA.localeCompare(namaB);
      });

      setCabangList(sortedCabang);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
    fetchBulan();
    fetchCabang();
  }, []);

  const fetchBulan = async () => {
    try {
      const res = await GlobalApi.getBulan();
      setBulanList(res.data || []);
      setSelectedMonth("ALL");
      setSelectedYear("ALL");
    } catch (error) {
      console.error("Error fetching bulan:", error);
    }
  };

  const fetchData = async () => {
    try {
      const res = await GlobalApi.getLainlain();
      setTableData(res || []);
    } catch (error) {
      console.error("Error fetching Lain-lain:", error);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await GlobalApi.getKeteranganLainlain();
      setKeteranganOptions(res || []);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleSave = async () => {
    // Validasi: Wajib ada keterangan dan minimal salah satu nominal terisi
    if (!formData.keterangan || (!formData.rawProvinsi && !formData.rawKabupaten && !formData.rawCabang)) {
      toast.error("Keterangan dan minimal satu nominal wajib diisi!");
      return;
    }

    setLoading(true);
    const now = new Date();

    // Payload mengirim nominal ke masing-masing peruntukan
    const payload = {
      keterangan: formData.keterangan,
      propinsi: parseInt(formData.rawProvinsi) || 0,
      kabupaten: parseInt(formData.rawKabupaten) || 0,
      cabang: parseInt(formData.rawCabang) || 0,
      // Total nominal bisa dijumlahkan jika backend masih membutuhkannya
      jumlahNominal: (parseInt(formData.rawProvinsi) || 0) + (parseInt(formData.rawKabupaten) || 0) + (parseInt(formData.rawCabang) || 0),
      bulan: now.toLocaleString("id-ID", { month: "long" }),
      tahun: now.getFullYear(),
    };

    try {
      if (isEditing) {
        await GlobalApi.updateLainlain(editingId, payload);
        toast.success("Data berhasil diperbarui!");
      } else {
        await GlobalApi.postLainlain(payload);
        toast.success("Data berhasil disimpan!");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Gagal memproses data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await GlobalApi.deleteLainlain(id);
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus data");
    }
  };

  const handleEdit = (item) => {
    // Fungsi bantuan jika data lama masih pakai teks "Provinsi", kita ambil dari jumlahNominal
    const getSafeNominal = (val, fallback) => {
      if (!val) return "";
      if (typeof val === 'string' && val.match(/^[a-zA-Z]+$/)) return fallback?.toString() || "";
      return val.toString();
    };

    setFormData({
      keterangan: item.keterangan || "",
      rawProvinsi: getSafeNominal(item.propinsi, item.jumlahNominal),
      rawKabupaten: getSafeNominal(item.kabupaten, item.jumlahNominal),
      rawCabang: getSafeNominal(item.cabang, item.jumlahNominal)
    });
    setEditingId(item.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ keterangan: "", rawProvinsi: "", rawKabupaten: "", rawCabang: "" });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
    setIsManualInput(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      <div className="bg-slate-700 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <FaEllipsisH className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-black">Lain-Lain</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">Periode: {selectedMonth} {selectedYear}</span>
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <p className="text-slate-300 text-[10px] font-medium uppercase tracking-widest">Pencatatan transaksi keuangan kategori lainnya</p>
            </div>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setIsManualInput(true);
              setFormData({ tipe: "", keterangan: "", nominal: "", rawNominal: "" });
              setIsEditing(false);
              setEditingId(null);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            <FaPlus />
            <span>Tambah Baru</span>
          </button>
        )}
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Top Section: Form Entry (Integrated) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                <FaPlusCircle className="text-base" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">{isEditing ? "Edit Transaksi Lain-Lain" : "Entri Transaksi Baru"}</h3>
                <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">Pencatatan Keuangan Kategori Lainnya</p>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={resetForm}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
              >
                Batalkan Edit
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* KETERANGAN TRANSAKSI FULL WIDTH */}
            <div className="space-y-4 mb-6">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Keterangan Transaksi</label>
              <div className="flex gap-2">
                {!isManualInput ? (
                  <div className="flex-1 relative group">
                    <select
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-slate-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner appearance-none"
                    >
                      <option value="">-- Pilih Keterangan --</option>
                      {keteranganOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                    <button
                      onClick={() => setIsManualInput(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Input Manual
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-slate-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                      placeholder="Ketik keterangan transaksi baru..."
                    />
                    <button
                      onClick={() => setIsManualInput(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Pilih Opsi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3 KOLOM INPUT NOMINAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              {/* Nominal Provinsi */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block px-1">Nominal Provinsi</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={formData.rawProvinsi}
                    onChange={(e) => setFormData({ ...formData, rawProvinsi: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-indigo-50/30 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-indigo-50/50 shadow-inner"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Nominal Kabupaten */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest block px-1">Nominal Kabupaten</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={formData.rawKabupaten}
                    onChange={(e) => setFormData({ ...formData, rawKabupaten: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-amber-50/30 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-amber-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-amber-50/50 shadow-inner"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Nominal Cabang */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block px-1">Nominal Cabang</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={formData.rawCabang}
                    onChange={(e) => setFormData({ ...formData, rawCabang: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-emerald-50/30 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-emerald-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-emerald-50/50 shadow-inner"
                    placeholder="0"
                  />
                </div>
              </div>

            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] font-black shadow-xl shadow-emerald-100 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave className="text-base" />}
              <span className="text-base tracking-tight">{isEditing ? "Perbarui Data Transaksi" : "Simpan Data Transaksi"}</span>
            </button>
          </div>
        </motion.div>

        {/* Bottom Section: Laporan & History */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-sm">
                <FaHistory className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Transaksi</h3>
                <p className="text-slate-400 text-xs font-medium">Monitoring seluruh entri keuangan lain-lain</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative group">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all text-[10px] w-48"
                />
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 text-[10px] appearance-none"
              >
                <option value="ALL">Semua Bulan</option>
                {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 text-[10px] appearance-none"
              >
                <option value="ALL">Semua Tahun</option>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-3 py-3 w-8 text-center"></th>
                    {["Keterangan", "Bulan/Tahun", "Peruntukan Provinsi", "Peruntukan Kabupaten", "Peruntukan Cabang", "Aksi"].map((h, i) => (
                      <th
                        key={i}
                        // Padding dikecilkan ke px-3, teks dikecilkan ke text-[8px]
                        className={`px-3 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 ${h === 'Aksi' ? 'text-center' : h.includes('Peruntukan') ? 'text-right' : 'text-left'
                          } whitespace-nowrap`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(() => {
                    const filteredData = tableData.filter(item => {
                      const matchMonth = selectedMonth === "ALL" || item.bulan === selectedMonth;
                      const matchYear = selectedYear === "ALL" || parseInt(item.tahun) === parseInt(selectedYear);
                      const matchSearch = item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchMonth && matchYear && matchSearch;
                    });

                    return filteredData.length > 0 ? (
                      filteredData.map((item, i) => (
                        <React.Fragment key={i}>
                          {/* BARIS UTAMA (Dibuat Lebih Compact) */}
                          <tr
                            onClick={() => toggleRow(item.id)}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          >
                            <td className="px-3 py-3 text-slate-400 text-center w-8">
                              {expandedRows[item.id] ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                            </td>

                            {/* Keterangan: Dihilangkan whitespace-nowrap agar bisa turun ke bawah, diberi min-w agar tidak terlalu gepeng */}
                            <td className="px-3 py-3 font-black text-slate-800 text-xs min-w-[150px] max-w-[250px] leading-tight">
                              {item.keterangan}
                            </td>

                            <td className="px-3 py-3 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                              {item.bulan} {item.tahun}
                            </td>

                            <td className="px-3 py-3 text-right font-black text-indigo-600 text-xs whitespace-nowrap bg-indigo-50/20">
                              {parseFloat(item.propinsi) > 0 ? formatCurrency(item.propinsi) : <span className="text-slate-300">-</span>}
                            </td>

                            <td className="px-3 py-3 text-right font-black text-amber-600 text-xs whitespace-nowrap bg-amber-50/20">
                              {parseFloat(item.kabupaten) > 0 ? formatCurrency(item.kabupaten) : <span className="text-slate-300">-</span>}
                            </td>

                            <td className="px-3 py-3 text-right font-black text-emerald-600 text-xs whitespace-nowrap bg-emerald-50/20">
                              {parseFloat(item.cabang) > 0 ? formatCurrency(item.cabang) : <span className="text-slate-300">-</span>}
                            </td>

                            <td className="px-3 py-3 w-20">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title="Edit"
                                >
                                  <FaEdit className="text-[10px]" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                  className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                  title="Hapus"
                                >
                                  <FaTrash className="text-[10px]" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* BARIS SUB-TABEL TERSENDIRI */}
                          <AnimatePresence>
                            {expandedRows[item.id] && (
                              <tr className="bg-slate-50/80 border-b border-slate-200">
                                <td colSpan="7" className="p-0 w-full max-w-[1px]">

                                  <div className="p-4 sm:p-6 w-full">
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="bg-white border border-slate-200 rounded-2xl shadow-inner overflow-hidden w-full flex flex-col"
                                    >
                                      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between z-20 relative shrink-0">
                                        <h5 className="text-xs font-black text-white uppercase tracking-widest">
                                          Detail Peruntukan Cabang - {item.keterangan}
                                        </h5>
                                      </div>

                                      <div className="overflow-x-auto overflow-y-auto max-h-[320px] custom-scrollbar w-full">
                                        <table className="w-full text-left border-collapse relative">
                                          <thead className="sticky top-0 z-10 shadow-sm">
                                            <tr className="bg-slate-100 border-b border-slate-200">
                                              {["No", "Cabang/Khusus", "Jumlah", "Peruntukan Provinsi", "Peruntukan Kabupaten", "Peruntukan Cabang", "Tambahan Cabang", "Total Peruntukan Cabang", "Total Tagihan", "Transfer", "Kurang", "Pembayaran I", "Pembayaran II", "Selisih", "Aksi"].map((h, subIdx) => (
                                                <th key={subIdx} className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap border-r border-slate-200 last:border-r-0 text-center bg-slate-100">
                                                  {h}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          
                                          <tbody className="divide-y divide-slate-100">
                                            {cabangList.map((cabang, idx) => (
                                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-xs text-slate-400 font-bold border-r border-slate-100 text-center">{idx + 1}</td>
                                                <td className="px-4 py-3 text-xs font-black text-slate-700 whitespace-nowrap uppercase border-r border-slate-100">{cabang.kecamatan}</td>
                                                
                                                {/* Dummy Data Area */}
                                                <td className="px-4 py-3 text-xs font-bold text-slate-600 text-center border-r border-slate-100">0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-indigo-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-amber-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-emerald-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-emerald-600 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-black text-emerald-700 text-right bg-emerald-50/50 border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-black text-slate-800 text-right bg-slate-50 border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-blue-600 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-rose-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-slate-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-bold text-slate-500 text-right border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-xs font-black text-amber-600 text-right bg-amber-50/30 border-r border-slate-100">Rp 0</td>
                                                <td className="px-4 py-3 text-center">
                                                  <button className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-all">
                                                    <FaEdit size={12} />
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>

                                          <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-slate-300 shadow-[0_-3px_10px_rgba(0,0,0,0.05)] font-black text-[11px] text-slate-800">
                                            <tr>
                                              <td colSpan={2} className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest border-r border-slate-200 bg-slate-100">
                                                TOTAL REKAPITULASI
                                              </td>
                                              
                                              <td className="px-4 py-3 text-center border-r border-slate-200 bg-slate-100">0</td>
                                              
                                              <td className="px-4 py-3 text-right text-indigo-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-amber-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-emerald-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-emerald-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              
                                              <td className="px-4 py-3 text-right text-emerald-700 bg-emerald-100/60 border-r border-slate-200">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-slate-900 bg-slate-200/60 border-r border-slate-200">Rp 0</td>
                                              
                                              <td className="px-4 py-3 text-right text-blue-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-rose-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-200 bg-slate-100">Rp 0</td>
                                              <td className="px-4 py-3 text-right text-amber-700 bg-amber-100/50 border-r border-slate-200">Rp 0</td>
                                              
                                              <td className="bg-slate-100"></td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
                                    </motion.div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                            <FaFileInvoiceDollar className="text-4xl" />
                            <p className="text-xs font-black uppercase tracking-widest">Belum Ada Transaksi</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LainLainSection;