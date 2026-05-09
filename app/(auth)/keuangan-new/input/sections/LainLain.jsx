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
  FaSearch
} from "react-icons/fa";

const LainLainSection = () => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    tipe: "",
    keterangan: "",
    nominal: "",
    rawNominal: ""
  });

  const [keteranganOptions, setKeteranganOptions] = useState([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulanList, setBulanList] = useState([]);

  useEffect(() => {
    fetchData();
    fetchOptions();
    fetchBulan();
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
    if (!formData.tipe || !formData.keterangan || !formData.rawNominal) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    setLoading(true);
    const now = new Date();
    const payload = {
      propinsi: formData.tipe === "Provinsi" ? "Provinsi" : "",
      kabupaten: formData.tipe === "Kabupaten" ? "Kabupaten" : "",
      cabang: formData.tipe === "Cabang" ? "Cabang" : "",
      keterangan: formData.keterangan,
      jumlahNominal: formData.rawNominal,
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
    if(!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await GlobalApi.deleteLainlain(id);
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus data");
    }
  };

  const handleEdit = (item) => {
    const tipe = item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang";
    setFormData({
      tipe,
      keterangan: item.keterangan,
      rawNominal: item.jumlahNominal?.toString() || "",
      nominal: formatCurrency(item.jumlahNominal)
    });
    setEditingId(item.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ tipe: "", keterangan: "", nominal: "", rawNominal: "" });
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
            <p className="text-slate-300 text-xs font-medium">Pencatatan transaksi keuangan kategori lainnya</p>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            <FaPlus />
            <span>Tambah Baru</span>
          </button>
        )}
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center space-x-2">
                  <FaPlusCircle className="text-emerald-500" />
                  <span>{isEditing ? "Edit Transaksi" : "Transaksi Baru"}</span>
                </h3>
                <button onClick={resetForm} className="text-xs font-black text-rose-500 uppercase tracking-widest hover:underline">Batalkan</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Tipe Kategori</label>
                    <div className="flex space-x-2">
                      {["Provinsi", "Kabupaten", "Cabang"].map(t => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, tipe: t})}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.tipe === t ? "bg-slate-800 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Keterangan</label>
                    {!isManualInput ? (
                      <div className="flex space-x-2">
                        <select 
                          value={formData.keterangan}
                          onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20"
                        >
                          <option value="">-- Pilih Keterangan --</option>
                          {keteranganOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                        <button 
                          onClick={() => setIsManualInput(true)}
                          className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100"
                        >
                          Ketik Manual
                        </button>
                      </div>
                    ) : (
                      <input 
                        type="text"
                        value={formData.keterangan}
                        onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20"
                        placeholder="Contoh: Pembelian Atribut..."
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="text-xs font-black text-slate-500 uppercase mb-1.5 block px-1">Nominal Transaksi</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                      <input 
                        type="number"
                        value={formData.rawNominal}
                        onChange={(e) => setFormData({...formData, rawNominal: e.target.value, nominal: formatCurrency(e.target.value)})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 rounded-2xl outline-none font-black text-emerald-400 text-xl"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                     <button 
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center space-x-2"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave />}
                      <span>{isEditing ? "Perbarui Transaksi" : "Simpan Transaksi"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-black text-slate-800 flex items-center space-x-2">
              <FaHistory className="text-slate-400" />
              <span>Rekapitulasi Transaksi</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="ALL">Semua Bulan</option>
                {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="ALL">Semua Tahun</option>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input 
                  type="text" 
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-black w-40 focus:ring-2 focus:ring-slate-500/20"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableData.filter(item => {
                  const matchMonth = selectedMonth === "ALL" || item.bulan === selectedMonth;
                  const matchYear = selectedYear === "ALL" || parseInt(item.tahun) === parseInt(selectedYear);
                  const matchSearch = item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchMonth && matchYear && matchSearch;
                }).length > 0 ? tableData.filter(item => {
                  const matchMonth = selectedMonth === "ALL" || item.bulan === selectedMonth;
                  const matchYear = selectedYear === "ALL" || parseInt(item.tahun) === parseInt(selectedYear);
                  const matchSearch = item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchMonth && matchYear && matchSearch;
                }).map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${item.propinsi ? "bg-indigo-50 text-indigo-600" : item.kabupaten ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{item.keterangan}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{formatCurrency(item.jumlahNominal)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold">Belum ada transaksi lain-lain</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LainLainSection;
