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
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">Periode: {selectedMonth} {selectedYear}</span>
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <p className="text-slate-300 text-[10px] font-medium uppercase tracking-widest">Pencatatan transaksi keuangan kategori lainnya</p>
            </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Tipe Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Provinsi", "Kabupaten", "Cabang"].map(t => (
                    <button
                      key={t}
                      onClick={() => setFormData({...formData, tipe: t})}
                      className={`py-3 rounded-[16px] text-[10px] font-black transition-all border-2 ${formData.tipe === t ? "bg-slate-800 border-slate-800 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Keterangan Transaksi</label>
                <div className="flex gap-2">
                  {!isManualInput ? (
                    <div className="flex-1 relative group">
                      <select 
                        value={formData.keterangan}
                        onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-slate-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner appearance-none"
                      >
                        <option value="">-- Pilih --</option>
                        {keteranganOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                      <button 
                        onClick={() => setIsManualInput(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-slate-400 uppercase hover:text-slate-800"
                      >
                        Manual
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 relative group">
                      <input 
                        type="text"
                        value={formData.keterangan}
                        onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-slate-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                        placeholder="Ketik keterangan..."
                      />
                      <button 
                        onClick={() => setIsManualInput(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-slate-400 uppercase hover:text-slate-800"
                      >
                        Opsi
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Nominal Transaksi</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">Rp</span>
                  </div>
                  <input 
                    type="number"
                    value={formData.rawNominal}
                    onChange={(e) => setFormData({...formData, rawNominal: e.target.value, nominal: formatCurrency(e.target.value)})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-emerald-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
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
                    {["Tipe", "Keterangan", "Bulan/Tahun", "Nominal", "Aksi"].map((h, i) => (
                      <th key={i} className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 ${h === 'Aksi' ? 'text-center' : h === 'Nominal' ? 'text-right' : 'text-left'} whitespace-nowrap`}>
                        {h}
                      </th>
                    ))}
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
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${item.propinsi ? "bg-indigo-50 text-indigo-600" : item.kabupaten ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 text-sm">{item.keterangan}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.bulan} {item.tahun}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(item.jumlahNominal)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                          <FaFileInvoiceDollar className="text-4xl" />
                          <p className="text-xs font-black uppercase tracking-widest">Belum Ada Transaksi</p>
                        </div>
                      </td>
                    </tr>
                  )}
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
