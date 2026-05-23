"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  FaHandHoldingHeart,
  FaUsers,
  FaSave,
  FaSearch,
  FaCog,
  FaCalculator,
  FaFileExcel,
  FaUpload,
  FaEdit,
  FaTrash
} from "react-icons/fa";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

const DaspenSection = () => {
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [targetData, setTargetData] = useState([]);
  const [rawAggregatedData, setRawAggregatedData] = useState([]);

  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isUploadingDaspen, setIsUploadingDaspen] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, data: null });

  const kat1Val = kuota * katagori1;
  const kat2Val = kuota * katagori2;
  const kat3Val = kuota * katagori3;
  const totalTarget = (kat1Val * kat1) + (kat2Val * kat2) + (kat3Val * kat3);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(4)
      ]);

      setBulanList(resBulan.data || []);
      const sortedCabang = (resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
      setCabangList(sortedCabang);

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
      const [resTable, resTargets] = await Promise.all([
        GlobalApi.getTableDaspen(selectedMonth, selectedYear, [], ""),
        GlobalApi.getAllTargetDaspen()
      ]);

      const filteredTable = resTable.filter(row => row["Cabang/Khusus"] !== "Jumlah" && row.cabang !== "Jumlah");
      setTableData(filteredTable || []);

      const filteredTargets = resTargets.filter(row =>
        row.bulan?.toUpperCase() === selectedMonth.toUpperCase() &&
        row.tahun?.toString() === selectedYear.toString()
      );
      setTargetData(filteredTargets || []);

      try {
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === selectedMonth.toLowerCase());
        const numericMonth = monthIndex !== -1 ? (monthIndex + 1).toString() : "1"; 

        const resAggregated = await GlobalApi.getNominalAggregatedData("", "", "", numericMonth, selectedYear);
        
        setRawAggregatedData(resAggregated || []);
      } catch (aggError) {
        console.error("Peringatan: API Aggregated gagal (Error 500).", aggError);
        setRawAggregatedData([]);
      }

    } catch (error) {
      console.error("Error fetching combined Daspen data:", error);
      setTableData([]);
      setTargetData([]);
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
        propinsi: katagori1, kabupaten: katagori2, cabang: katagori3,
        pb: kuota, sanduka: "", iuran: "DASPEN",
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
        bulan: selectedMonth, tahun: selectedYear.toString(), cabang: selectedCabang,
        kategori1: kat1, kategori2: kat2, kategori3: kat3,
        perolehanCabang: totalTarget * CABANG_PERCENTAGE,
        perolehanKabupaten: totalTarget * KABUPATEN_PERCENTAGE,
        valueKat1: kat1 * kat1Val, valueKat2: kat2 * kat2Val, valueKat3: kat3 * kat3Val,
        transfer: 0, pembayaran1: 0, pembayaran2: 0,
        jenisData: "SANDUKA"
      };
      await GlobalApi.createTargetDaspen(payload);
      toast.success(`Berhasil menyimpan Daspen untuk ${selectedCabang}`);
      fetchTableData();
      setKat1(0); setKat2(0); setKat3(0);
    } catch (error) {
      toast.error("Gagal menyimpan data Daspen.");
    }
  };

  const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = String(val).replace(/\./g, '');
    return parseFloat(cleanStr) || 0;
  };

  const handleDownloadTemplate = (namaFile) => {
    const headers = [["No", "Cabang/Khusus", "Kat I", "Nominal Kat I", "Kat II", "Nominal Kat II", "Kat III", "Nominal Kat III", "Total Anggota", "Total Nominal", "Transfer", "Selisih", "Status"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Daspen");
    XLSX.writeFile(wb, `${namaFile}.xlsx`);
  };

  const handleExcelUploadProvinsi = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedMonth || !selectedYear) {
      toast.error("Gagal! Pastikan Bulan dan Tahun sudah dipilih.");
      return;
    }
    setIsUploadingDaspen(true);
    const toastId = toast.loading("Menyimpan Data Provinsi (DASPEN)...");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const rows = raw.slice(1).filter(r => r[1]);
        let successCount = 0;

        for (const r of rows) {
          const cabang = String(r[1]).trim();
          const k1 = parseNumber(r[2]); const k2 = parseNumber(r[4]); const k3 = parseNumber(r[6]);
          const transfer = parseNumber(r[10]);
          const vKat1 = k1 * kat1Val; const vKat2 = k2 * kat2Val; const vKat3 = k3 * kat3Val;
          const totalTgt = vKat1 + vKat2 + vKat3;

          const payload = {
            bulan: selectedMonth, tahun: selectedYear.toString(), cabang: cabang,
            kategori1: k1, kategori2: k2, kategori3: k3,
            perolehanCabang: totalTgt * CABANG_PERCENTAGE, perolehanKabupaten: totalTgt * KABUPATEN_PERCENTAGE,
            valueKat1: vKat1, valueKat2: vKat2, valueKat3: vKat3,
            transfer: transfer, pembayaran1: 0, pembayaran2: 0,
            jenisData: "DASPEN"
          };
          await GlobalApi.createTargetDaspen(payload);
          successCount++;
        }
        toast.success(`Selesai! ${successCount} data (DASPEN) tersimpan.`, { id: toastId });
        fetchTableData();
      } catch (err) {
        toast.error(`Gagal memproses Excel DASPEN.`, { id: toastId });
      } finally {
        setIsUploadingDaspen(false); e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data manual ini? Sistem akan kembali ke perhitungan otomatis API.")) {
      try {
        await GlobalApi.deleteTargetDaspen(id);
        toast.success("Data berhasil dihapus!");
        fetchTableData();
      } catch (error) {
        toast.error("Gagal menghapus data.");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, kategori1, kategori2, kategori3, transfer, pembayaran1, pembayaran2, cabang } = editModal.data;

      const k1 = parseInt(kategori1) || 0; const k2 = parseInt(kategori2) || 0; const k3 = parseInt(kategori3) || 0;
      const t = parseFloat(transfer) || 0; const p1 = parseFloat(pembayaran1) || 0; const p2 = parseFloat(pembayaran2) || 0;
      const vKat1 = k1 * kat1Val; const vKat2 = k2 * kat2Val; const vKat3 = k3 * kat3Val;
      const totalTgt = vKat1 + vKat2 + vKat3;

      const payload = {
        ...editModal.data,
        cabang: cabang, bulan: selectedMonth, tahun: selectedYear.toString(),
        kategori1: k1, kategori2: k2, kategori3: k3,
        transfer: t, pembayaran1: p1, pembayaran2: p2,
        valueKat1: vKat1, valueKat2: vKat2, valueKat3: vKat3,
        perolehanCabang: totalTgt * CABANG_PERCENTAGE, perolehanKabupaten: totalTgt * KABUPATEN_PERCENTAGE,
      };

      if (id) {
        await GlobalApi.updateTargetDaspen(id, payload);
      } else {
        await GlobalApi.createTargetDaspen(payload);
      }

      toast.success("Data berhasil disimpan ke database!");
      setEditModal({ show: false, data: null });
      fetchTableData();
    } catch (error) {
      toast.error("Gagal menyimpan data.");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  const CellDouble = ({ top, bottom, topClass = "text-slate-700", bottomClass = "text-teal-500" }) => (
    <div className="flex flex-col justify-center gap-1.5 leading-tight py-1">
      <div className={`text-[11px] font-bold ${topClass}`}>{top !== null && top !== undefined ? top : "-"}</div>
      {bottom !== null && bottom !== undefined && (
        <div className={`text-[11px] font-semibold italic ${bottomClass}`}>{bottom}</div>
      )}
    </div>
  );

  const getUniqueCabangs = () => {
    const allCabs = [
      ...tableData.map(r => r.cabang || r["Cabang/Khusus"]),
      ...targetData.map(r => r.cabang),
      ...rawAggregatedData.map(r => r.cabang)
    ];
    return Array.from(new Set(allCabs.filter(c => c)));
  };
  const uniqueCabangs = getUniqueCabangs();

  return (
    <div className="flex flex-col h-full relative">
      <Toaster position="top-center" />

      {/* MODAL EDIT */}
      {editModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h3 className="font-black text-2xl text-slate-800">Edit Data Cabang</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-slate-500">{editModal.data?.cabang}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${editModal.data?.jenisData === 'DASPEN' ? 'bg-teal-500' : 'bg-rose-500'}`}>
                    {editModal.data?.jenisData || "SANDUKA"} {editModal.data?.isAuto && "(Auto-Generated)"}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditModal({ show: false, data: null })} className="text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={20} className="opacity-0" /></button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {['kategori1', 'kategori2', 'kategori3'].map((kat, idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Jumlah Kat {idx + 1}</label>
                    <input
                      type="number" value={editModal.data[kat] || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, [kat]: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mt-1 font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* BAGIAN PEMBAYARAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Transfer Balancing</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.transfer || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, transfer: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pembayaran 1</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.pembayaran1 || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, pembayaran1: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pembayaran 2</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.pembayaran2 || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, pembayaran2: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setEditModal({ show: false, data: null })} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-colors flex items-center gap-2"><FaSave /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="bg-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaHandHoldingHeart className="text-2xl" /></div>
            <div>
              <h2 className="text-xl font-black">Dana Sosial Pensiun (Daspen)</h2>
              <div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">Periode: {selectedMonth} {selectedYear}</span></div>
            </div>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all">
            <FaCog className={showConfig ? "rotate-90 transition-transform" : ""} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center"><FaCalculator /></div>
              <div><h3 className="text-base font-black text-slate-800">Konfigurasi Besaran Daspen</h3></div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase">Kuota Dasar</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">Rp</span>
                  <input type="number" value={kuota} onChange={(e) => setKuota(parseInt(e.target.value) || 0)} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[16px] font-black outline-none" />
                </div>
              </div>
              {[
                { label: "Kat I", key: "katagori1", val: kat1Val },
                { label: "Kat II", key: "katagori2", val: kat2Val },
                { label: "Kat III", key: "katagori3", val: kat3Val }
              ].map(cat => (
                <div key={cat.key}>
                  <label className="text-[9px] font-black text-slate-400 uppercase">{cat.label}</label>
                  <div className="space-y-2">
                    <input type="number" step="0.01" value={cat.key === "katagori1" ? katagori1 : cat.key === "katagori2" ? katagori2 : katagori3} onChange={(e) => { const v = parseFloat(e.target.value) || 0; if (cat.key === "katagori1") setKatagori1(v); if (cat.key === "katagori2") setKatagori2(v); if (cat.key === "katagori3") setKatagori3(v); }} className="w-full px-4 py-3 bg-slate-50 rounded-[16px] font-black text-center outline-none" />
                    <div className="px-4 py-1.5 bg-rose-50 rounded-lg text-center"><p className="text-[10px] text-rose-600 font-black">{formatCurrency(cat.val)}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSaveBesaran} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-black flex items-center justify-center gap-2">
              <FaSave /> Simpan Konfigurasi
            </button>

            <div className="mt-6 p-5 bg-blue-50 rounded-[24px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center"><FaFileExcel /></div>
                <div><h4 className="text-sm font-black text-blue-800">Upload Data Provinsi (DASPEN)</h4></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => handleDownloadTemplate("Template_Provinsi_Daspen")} className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black"><FaFileExcel /> Download Template</button>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer ${isUploadingDaspen ? 'opacity-50' : ''}`}>
                  {isUploadingDaspen ? "Menyimpan..." : <><FaUpload /> Upload & Simpan Excel Provinsi</>}
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUploadProvinsi} disabled={isUploadingDaspen} />
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-8">
            <form onSubmit={handleSubmitTarget} className="bg-slate-900 p-6 sm:p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col xl:flex-row items-center gap-6">
                <div className="w-full xl:w-1/4 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Pilih Cabang (Manual Override)</label>
                  <select value={selectedCabang} onChange={(e) => setSelectedCabang(e.target.value)} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm">
                    <option value="" className="text-slate-800">-- Pilih Cabang --</option>
                    {cabangList.map(c => <option key={c.id} value={c.kecamatan} className="text-slate-800">{c.kecamatan}</option>)}
                  </select>
                </div>

                <div className="w-full xl:flex-1 grid grid-cols-3 gap-4">
                  {[
                    { label: "KAT I", val: kat1, setter: setKat1, color: "border-rose-500/30" },
                    { label: "KAT II", val: kat2, setter: setKat2, color: "border-blue-500/30" },
                    { label: "KAT III", val: kat3, setter: setKat3, color: "border-emerald-500/30" }
                  ].map(cat => (
                    <div key={cat.label} className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase text-center block">{cat.label}</label>
                      <input type="number" value={cat.val} onChange={(e) => cat.setter(parseInt(e.target.value) || 0)} className={`w-full bg-white/5 border ${cat.color} rounded-2xl px-4 py-4 text-white font-black text-center outline-none`} />
                    </div>
                  ))}
                </div>

                <div className="w-full xl:w-auto flex xl:flex-col items-center justify-between xl:justify-center gap-2 px-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Total Target</span>
                  <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalTarget)}</span>
                </div>

                <div className="w-full xl:w-auto flex flex-col gap-3 min-w-[220px]">
                  <button type="submit" className="w-full px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
                    <FaSave /> Simpan Realisasi
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[18px] bg-rose-50 text-rose-600 flex items-center justify-center"><FaHandHoldingHeart className="text-xl" /></div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800">Rekapitulasi Daspen (Otomatis)</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Data Hitam Digenerate Langsung dari API Balancing</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px]">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" placeholder="Cari Cabang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl outline-none font-bold text-xs" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase">
                      {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase">
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["No", "Cabang/Khusus", "Total Anggota", "Kat I", "Nominal", "Kat II", "Nominal", "Kat III", "Nominal", "Total Nominal", "Transfer", "Selisih", "Pembayaran 1", "Pembayaran 2", "Kurang Setor", "Status", "Aksi"].map((h, i) => (
                        <th key={i} className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center whitespace-nowrap border-r border-slate-200 bg-slate-100/50">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loadingTable ? (
                      Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={17} className="p-6"><div className="h-3 bg-slate-100 rounded-full w-full" /></td></tr>)
                    ) : uniqueCabangs.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                      uniqueCabangs.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map((cabangName, i) => {

                          let autoK1 = 0, autoK2 = 0, autoK3 = 0, autoTransfer = 0;
                          
                          const targetK1 = Math.round(kat1Val);
                          const targetK2 = Math.round(kat2Val);
                          const targetK3 = Math.round(kat3Val);

                          const cabAggregated = rawAggregatedData.filter(r => r.cabang?.toUpperCase() === cabangName.toUpperCase());
                          
                          cabAggregated.forEach(item => {
                            const d = Math.round(parseFloat(item.daspen) || 0);
                            
                            if (d === targetK1 && targetK1 > 0) {
                                autoK1++;
                            } else if (d === targetK2 && targetK2 > 0) {
                                autoK2++;
                            } else if (d === targetK3 && targetK3 > 0) {
                                autoK3++;
                            }
                            
                            autoTransfer += d; 
                          });

                          const sandukaDB = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'SANDUKA');
                          const daspen = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'DASPEN');

                        const k1 = sandukaDB ? parseInt(sandukaDB.kategori1) : autoK1;
                        const k2 = sandukaDB ? parseInt(sandukaDB.kategori2) : autoK2;
                        const k3 = sandukaDB ? parseInt(sandukaDB.kategori3) : autoK3;

                        const nomK1 = sandukaDB ? parseFloat(sandukaDB.valueKat1) : (k1 * kat1Val);
                        const nomK2 = sandukaDB ? parseFloat(sandukaDB.valueKat2) : (k2 * kat2Val);
                        const nomK3 = sandukaDB ? parseFloat(sandukaDB.valueKat3) : (k3 * kat3Val);

                        const totNominal = sandukaDB ? parseFloat(sandukaDB.totalTarget || (nomK1 + nomK2 + nomK3)) : (nomK1 + nomK2 + nomK3);
                        const transfer = sandukaDB ? parseFloat(sandukaDB.transfer || 0) : autoTransfer;
                        const selisih = (totNominal - transfer);

                        const pemb1 = sandukaDB ? parseFloat(sandukaDB.pembayaran1 || 0) : 0;
                        const pemb2 = sandukaDB ? parseFloat(sandukaDB.pembayaran2 || 0) : 0;
                        const kurangSetor = (totNominal - transfer - pemb1 - pemb2);

                        const pk1 = daspen ? parseInt(daspen.kategori1) : null;
                        const pk2 = daspen ? parseInt(daspen.kategori2) : null;
                        const pk3 = daspen ? parseInt(daspen.kategori3) : null;
                        const pNomK1 = daspen ? parseFloat(daspen.valueKat1) : null;
                        const pNomK2 = daspen ? parseFloat(daspen.valueKat2) : null;
                        const pNomK3 = daspen ? parseFloat(daspen.valueKat3) : null;
                        const pTotNominal = daspen ? (pNomK1 + pNomK2 + pNomK3) : null;
                        const pTransfer = daspen ? parseFloat(daspen.transfer || 0) : null;
                        const pSelisih = daspen ? (pTotNominal - pTransfer) : null;

                        const pPemb1 = daspen ? parseFloat(daspen.pembayaran1 || 0) : null;
                        const pPemb2 = daspen ? parseFloat(daspen.pembayaran2 || 0) : null;
                        const pKurangSetor = daspen ? (pTotNominal - pTransfer - pPemb1 - pPemb2) : null;

                          const activeMembers = cabAggregated.length > 0 
                              ? cabAggregated.reduce((sum, item) => sum + (parseInt(item.jumlah) || 1), 0)
                              : 0;

                        return (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors text-[11px] font-bold text-slate-600">
                            <td className="px-3 py-2 text-slate-400 font-black border-r border-slate-200 text-center">{i + 1}</td>
                            <td className="px-3 py-2 font-black text-slate-800 whitespace-nowrap border-r border-slate-200 uppercase">{cabangName}</td>

                            <td className="px-3 py-2 border-r border-slate-200 text-center">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-black">{activeMembers}</span>
                            </td>

                            <td className="px-3 py-2 border-r border-slate-200 text-center"><CellDouble top={k1} bottom={pk1} /></td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(nomK1)} bottom={pNomK1 !== null ? formatCurrency(pNomK1) : null} /></td>

                            <td className="px-3 py-2 border-r border-slate-200 text-center"><CellDouble top={k2} bottom={pk2} /></td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(nomK2)} bottom={pNomK2 !== null ? formatCurrency(pNomK2) : null} /></td>

                            <td className="px-3 py-2 border-r border-slate-200 text-center"><CellDouble top={k3} bottom={pk3} /></td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(nomK3)} bottom={pNomK3 !== null ? formatCurrency(pNomK3) : null} /></td>

                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/50"><CellDouble top={formatCurrency(totNominal)} bottom={pTotNominal !== null ? formatCurrency(pTotNominal) : null} topClass="text-slate-900 font-black" /></td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(transfer)} bottom={pTransfer !== null ? formatCurrency(pTransfer) : null} topClass="text-indigo-600" /></td>

                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap">
                              <CellDouble
                                top={formatCurrency(selisih)} bottom={pSelisih !== null ? formatCurrency(pSelisih) : null}
                                topClass={selisih === 0 ? "text-emerald-600 font-black" : "text-amber-600 font-black"}
                                bottomClass={pSelisih === 0 && daspen ? "text-emerald-500 font-normal italic" : "text-amber-500 font-normal italic"}
                              />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(pemb1)} bottom={pPemb1 !== null ? formatCurrency(pPemb1) : null} topClass="text-slate-700" /></td>
                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellDouble top={formatCurrency(pemb2)} bottom={pPemb2 !== null ? formatCurrency(pPemb2) : null} topClass="text-slate-700" /></td>

                            <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap">
                              <CellDouble
                                top={formatCurrency(kurangSetor)} bottom={pKurangSetor !== null ? formatCurrency(pKurangSetor) : null}
                                topClass={kurangSetor === 0 ? "text-emerald-600 font-black" : "text-rose-600 font-black"}
                                bottomClass={pKurangSetor === 0 && daspen ? "text-emerald-500 font-normal italic" : "text-rose-400 font-normal italic"}
                              />
                            </td>

                            <td className="px-3 py-2 text-center border-r border-slate-200">
                              <div className="flex flex-col gap-1 items-center justify-center">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${kurangSetor === 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                  {kurangSetor === 0 ? "LUNAS" : "TERCATAT"}
                                </span>
                                {daspen && (
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${pKurangSetor === 0 ? "bg-emerald-100 text-emerald-600" : "bg-teal-50 text-teal-600"}`}>
                                    {pKurangSetor === 0 ? "LUNAS" : "PROV"}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-2 text-center w-24">
                              <div className="flex flex-col gap-2 items-center justify-center">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditModal({ show: true, data: sandukaDB || { isAuto: true, cabang: cabangName, jenisData: 'SANDUKA', kategori1: k1, kategori2: k2, kategori3: k3, transfer: transfer, pembayaran1: pemb1, pembayaran2: pemb2 } })}
                                    className="text-slate-400 hover:text-blue-500 transition-colors" title="Edit Sanduka"
                                  ><FaEdit size={14} /></button>

                                  {sandukaDB && (
                                    <button onClick={() => handleDelete(sandukaDB.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Kembalikan ke Auto-API"><FaTrash size={14} /></button>
                                  )}
                                </div>

                                {daspen && (
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditModal({ show: true, data: daspen })} className="text-teal-400 hover:text-teal-600 transition-colors" title="Edit Daspen/Prov"><FaEdit size={14} /></button>
                                    <button onClick={() => handleDelete(daspen.id)} className="text-teal-400 hover:text-red-500 transition-colors" title="Hapus Daspen/Prov"><FaTrash size={14} /></button>
                                  </div>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={17} className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data Kosong</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaspenSection;