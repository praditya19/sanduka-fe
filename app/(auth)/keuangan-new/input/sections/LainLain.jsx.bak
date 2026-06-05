"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx-js-style";
import {
  FaChartLine,
  FaEdit,
  FaEllipsisH,
  FaFileInvoiceDollar,
  FaHistory,
  FaMoneyBillWave,
  FaPlusCircle,
  FaSave,
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaUsers,
  FaFileExcel,
  FaFilePdf
} from "react-icons/fa";

const LainLainSection = () => {
  const defaultConfigId = 5;
  const [besaran, setBesaran] = useState({
    provinsi: 0,
    kabupaten: 0,
    cabang: 0,
  });
  const [configId, setConfigId] = useState(defaultConfigId);
  const [loadingBesaran, setLoadingBesaran] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tipe: "",
    keterangan: "",
    rawNominal: "",
  });

  const [keteranganOptions, setKeteranganOptions] = useState([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [jumlahPesanan, setJumlahPesanan] = useState("0");
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulanList, setBulanList] = useState([]);
  const [targetTableData, setTargetTableData] = useState([]);
  const [loadingTargetTable, setLoadingTargetTable] = useState(false);
  const [editingTargetRow, setEditingTargetRow] = useState(null);
  const [editTargetData, setEditTargetData] = useState({ cabang: "", jumlah: 0, bulan: "", tahun: new Date().getFullYear() });
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [selectedTargetKeterangan, setSelectedTargetKeterangan] = useState("");
  const [targetKeterangan, setTargetKeterangan] = useState("");
  const printTargetRef = useRef(null);
  const totalPerUnit = besaran.kabupaten;
  const totalAkhir = totalPerUnit * (parseInt(jumlahPesanan, 10) || 0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTargetTable();
  }, [selectedMonth, selectedYear, selectedCabang]);

  const fetchInitialData = async () => {
    try {
      const [bulanRes, cabangRes, lainLainRes, keteranganRes, iuranRes] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getLainlain(),
        GlobalApi.getKeteranganLainlain(),
        fetchDefaultConfig(),
      ]);

      const bulan = bulanRes.data || [];
      setBulanList(bulan);
      setCabangList((cabangRes.data || []).sort((a, b) => (a.kecamatan || "").localeCompare(b.kecamatan || "")));
      setTableData(lainLainRes || []);
      setKeteranganOptions(keteranganRes || []);
      applyDefaultConfig(iuranRes);

      const currentMonth = new Date().getMonth();
      if (bulan[currentMonth]) {
        setSelectedMonth(bulan[currentMonth].namaBulan);
      }
    } catch (error) {
      console.error("Error fetching Lain-lain data:", error);
    }
  };

  const fetchDefaultConfig = async () => {
    try {
      const filtered = await GlobalApi.getIuranByFilter("LAIN-LAIN");
      const lainLainConfig = Array.isArray(filtered) ? filtered[0] : filtered;
      if (lainLainConfig) return lainLainConfig;

      return await GlobalApi.getDefaultIuranById(defaultConfigId);
    } catch (error) {
      console.error("Error fetching default Lain-lain config:", error);
      return null;
    }
  };

  const applyDefaultConfig = (config) => {
    if (!config) return;
    setConfigId(config.id || defaultConfigId);
    setBesaran({
      provinsi: 0,
      kabupaten: parseInt(config.kabupaten, 10) || 0,
      cabang: 0,
    });
  };

  const fetchData = async () => {
    try {
      const res = await GlobalApi.getLainlain();
      setTableData(res || []);
    } catch (error) {
      console.error("Error fetching Lain-lain:", error);
    }
  };

  const fetchTargetTable = async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTargetTable(true);
    try {
      const data = await GlobalApi.getTableTargetLainLain(
        selectedMonth,
        selectedYear,
        selectedCabang || "",
      );
      setTargetTableData(data || []);
    } catch (error) {
      console.error("Error fetching target lain-lain table:", error);
    } finally {
      setLoadingTargetTable(false);
    }
  };

  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const kategori = item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang";
      const keyword = searchQuery.toLowerCase();
      const matchMonth = !selectedMonth || item.bulan === selectedMonth;
      const matchYear = parseInt(item.tahun, 10) === parseInt(selectedYear, 10);
      const matchSearch =
        item.keterangan?.toLowerCase().includes(keyword) ||
        kategori.toLowerCase().includes(keyword);

      return matchMonth && matchYear && matchSearch;
    });
  }, [tableData, selectedMonth, selectedYear, searchQuery]);

  const totalProvinsi = filteredData.reduce(
    (sum, item) => sum + (item.propinsi ? parseInt(item.jumlahNominal, 10) || 0 : 0),
    0,
  );
  const totalKabupaten = filteredData.reduce(
    (sum, item) => sum + (item.kabupaten ? parseInt(item.jumlahNominal, 10) || 0 : 0),
    0,
  );
  const totalCabang = filteredData.reduce(
    (sum, item) => sum + (item.cabang === "Cabang" ? parseInt(item.jumlahNominal, 10) || 0 : 0),
    0,
  );
  const totalNominal = totalProvinsi + totalKabupaten + totalCabang;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const resetForm = () => {
    setFormData({ tipe: "", keterangan: "", rawNominal: "" });
    setIsEditing(false);
    setEditingId(null);
    setIsManualInput(false);
  };

  const handleResetDefault = async () => {
    const config = await fetchDefaultConfig();
    applyDefaultConfig(config);
  };

  const handleSaveBesaran = async () => {
    setLoadingBesaran(true);
    try {
      const payload = {
        pb: "",
        propinsi: "",
        kabupaten: besaran.kabupaten,
        cabang: "",
        sanduka: "",
        iuran: "LAIN-LAIN",
      };
      await GlobalApi.updateIuranData(configId, payload);
      toast.success("Besaran Lain-lain diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui besaran Lain-lain.");
    } finally {
      setLoadingBesaran(false);
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();

    const jumlah = parseInt(jumlahPesanan, 10) || 0;
    if (!selectedCabang || !targetKeterangan || jumlah <= 0) {
      toast.error("Pilih Cabang, Keterangan, dan Jumlah Lain-lain!");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error("Pilih periode bulan dan tahun!");
      return;
    }

    setLoadingTarget(true);
    try {
      const payload = {
        cabang: selectedCabang,
        keterangan: targetKeterangan,
        jumlah: String(jumlah),
        bulan: selectedMonth,
        tahun: String(selectedYear),
        perolehanKabupaten: totalAkhir,
      };

      await GlobalApi.createTargetLainLain(payload);
      toast.success(`Target Lain-lain ${selectedCabang} berhasil dikunci!`);
      setJumlahPesanan("0");
      setTargetKeterangan("");
      fetchTargetTable();
    } catch (error) {
      toast.error("Gagal menyimpan target Lain-lain.");
    } finally {
      setLoadingTarget(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.tipe || !formData.keterangan || !formData.rawNominal) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error("Pilih periode bulan dan tahun!");
      return;
    }

    setLoading(true);
    const payload = {
      propinsi: formData.tipe === "Provinsi" ? "Provinsi" : "",
      kabupaten: formData.tipe === "Kabupaten" ? "Kabupaten" : "",
      cabang: formData.tipe === "Cabang" ? "Cabang" : "",
      keterangan: formData.keterangan,
      jumlahNominal: formData.rawNominal,
      bulan: selectedMonth,
      tahun: selectedYear,
    };

    try {
      if (isEditing) {
        await GlobalApi.updateLainlain(editingId, payload);
        toast.success("Data Lain-lain berhasil diperbarui!");
      } else {
        await GlobalApi.postLainlain(payload);
        toast.success("Data Lain-lain berhasil disimpan!");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Gagal memproses data Lain-lain.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const tipe = item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang";
    setFormData({
      tipe,
      keterangan: item.keterangan || "",
      rawNominal: item.jumlahNominal?.toString() || "",
    });
    setSelectedMonth(item.bulan || selectedMonth);
    setSelectedYear(item.tahun || selectedYear);
    setEditingId(item.id);
    setIsEditing(true);
    setIsManualInput(!keteranganOptions.includes(item.keterangan));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      await GlobalApi.deleteLainlain(id);
      toast.success("Data Lain-lain berhasil dihapus!");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus data Lain-lain.");
    }
  };

  const handleDeleteTarget = async (id) => {
    if (!id || id === 0) return;
    if (!window.confirm("Hapus data target lain-lain ini?")) return;
    try {
      await GlobalApi.deleteTargetLainLain(id);
      toast.success("Target Lain-lain berhasil dihapus!");
      fetchTargetTable();
    } catch (error) {
      toast.error("Gagal menghapus target Lain-lain.");
    }
  };

  const handleEditTarget = (item) => {
    setEditingTargetRow(item.id);
    setEditTargetData({
      cabang: item.cabang,
      jumlah: parseInt(item.jumlah, 10) || 0,
      bulan: item.bulan,
      tahun: parseInt(item.tahun, 10) || selectedYear,
    });
    setShowEditTargetModal(true);
  };

  const handleUpdateTarget = async () => {
    try {
      await GlobalApi.updateTargetLainLain(editingTargetRow, {
        cabang: editTargetData.cabang,
        jumlah: String(editTargetData.jumlah),
        bulan: editTargetData.bulan,
        tahun: String(editTargetData.tahun),
        perolehanKabupaten: editTargetData.jumlah * besaran.kabupaten,
      });
      toast.success("Target Lain-lain berhasil diperbarui!");
      setShowEditTargetModal(false);
      fetchTargetTable();
    } catch (error) {
      toast.error("Gagal memperbarui target Lain-lain.");
    }
  };

  const availableKeteranganList = useMemo(() => {
    const currentMonthData = tableData.filter(item => {
      const matchMonth = selectedMonth === "ALL" || !selectedMonth || item.bulan === selectedMonth;
      const matchYear = selectedYear === "ALL" || !selectedYear || parseInt(item.tahun, 10) === parseInt(selectedYear, 10);
      return matchMonth && matchYear;
    });

    return [...new Set(currentMonthData.map(item => item.keterangan).filter(Boolean))];
  }, [tableData, selectedMonth, selectedYear]);

  const filteredTargetData = useMemo(() => {
    if (!selectedTargetKeterangan) return targetTableData;
    return targetTableData.filter(item => item.keterangan === selectedTargetKeterangan);
  }, [targetTableData, selectedTargetKeterangan]);

  const handleExportExcelTarget = () => {
    if (filteredTargetData.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    const toastId = toast.loading("Menyiapkan file Excel...");

    try {
      const excelData = filteredTargetData.map((item, index) => ({
        "No": index + 1,
        "Cabang": item.cabang,
        "Total Anggota": parseInt(item.totalAnggota, 10) || 0,
        "Jumlah": parseInt(item.jumlah, 10) || 0,
        "Peruntukan Kabupaten": item.perolehanKabupaten || 0,
        "Peruntukan Cabang": item.perolehanCabang || 0,
        "Total": (item.perolehanKabupaten || 0) + (item.perolehanCabang || 0),
        "Transfer": item.transfer || 0,
        "Pembayaran": item.pembayaran || 0,
        "Selisih": item.selisih || 0
      }));

      excelData.push({});
      excelData.push({
        "No": "", "Cabang": "TOTAL",
        "Total Anggota": filteredTargetData.reduce((s, i) => s + (parseInt(i.totalAnggota, 10) || 0), 0),
        "Jumlah": filteredTargetData.reduce((s, i) => s + (parseInt(i.jumlah, 10) || 0), 0),
        "Peruntukan Kabupaten": filteredTargetData.reduce((s, i) => s + (i.perolehanKabupaten || 0), 0),
        "Peruntukan Cabang": filteredTargetData.reduce((s, i) => s + (i.perolehanCabang || 0), 0),
        "Total": filteredTargetData.reduce((s, i) => s + (i.perolehanKabupaten || 0) + (i.perolehanCabang || 0), 0),
        "Transfer": filteredTargetData.reduce((s, i) => s + (i.transfer || 0), 0),
        "Pembayaran": filteredTargetData.reduce((s, i) => s + (i.pembayaran || 0), 0),
        "Selisih": filteredTargetData.reduce((s, i) => s + (i.selisih || 0), 0)
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const range = XLSX.utils.decode_range(ws['!ref']);

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };

          ws[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: { vertical: "center", horizontal: C >= 3 ? "right" : "center" }
          };

          if (R === 0) {
            ws[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
            ws[cellAddress].s.fill = { fgColor: { rgb: "1E293B" } };
            ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
          }
        }
      }

      ws['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Target Lain-Lain");
      XLSX.writeFile(wb, `Target_LainLain_${selectedMonth}_${selectedYear}.xlsx`);
      toast.success("Excel berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat Excel", { id: toastId });
    }
  };

  const handleDownloadPDFTarget = async () => {
    if (filteredTargetData.length === 0) {
      toast.error("Tidak ada data untuk dicetak");
      return;
    }
    const element = printTargetRef.current;
    if (!element) return;

    const toastId = toast.loading("Memproses dokumen PDF...");

    try {
      const tableContainer = element.querySelector('.overflow-x-auto');
      element.classList.remove('overflow-hidden');
      if (tableContainer) {
        tableContainer.classList.remove('overflow-x-auto');
        tableContainer.style.overflow = 'visible';
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY
      });

      element.classList.add('overflow-hidden');
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.style.overflow = '';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Target_LainLain_${selectedMonth}_${selectedYear}.pdf`);
      toast.success("PDF berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error(error);
      element.classList.add('overflow-hidden');
      const tableContainer = element.querySelector('.overflow-x-auto');
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.style.overflow = '';
      }
      toast.error("Gagal membuat PDF", { id: toastId });
    }
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
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">
                Periode: {selectedMonth} {selectedYear}
              </span>
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <p className="text-slate-300 text-[10px] font-medium uppercase tracking-widest">
                Manajemen transaksi keuangan kategori lainnya
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/40 p-4"
        >
          <div className="flex flex-col xl:flex-row xl:items-end gap-4">
            <div className="flex items-center gap-3 xl:w-64">
              <div className="w-10 h-10 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                <FaMoneyBillWave className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight">
                  Konfigurasi Harga
                </h3>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                  Lain-Lain
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_minmax(180px,0.7fr)_auto_auto] gap-3 items-end">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                  Porsi Kabupaten
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-300 font-black text-sm">
                      Rp
                    </span>
                  </div>
                  <input
                    type="number"
                    value={besaran.kabupaten}
                    onChange={(e) =>
                      setBesaran({
                        provinsi: 0,
                        kabupaten: parseInt(e.target.value, 10) || 0,
                        cabang: 0,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-slate-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Total
                </p>
                <span className="text-base font-black text-slate-700">
                  {formatCurrency(totalPerUnit)}
                </span>
              </div>

              <button
                onClick={handleResetDefault}
                className="h-[50px] px-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm"
              >
                Reset
              </button>

              <button
                onClick={handleSaveBesaran}
                disabled={loadingBesaran}
                className="h-[50px] px-5 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
              >
                {loadingBesaran ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSave className="text-xs" />
                )}
                <span className="text-xs font-black uppercase tracking-widest">
                  Simpan
                </span>
              </button>
            </div>
          </div>
        </motion.div>

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
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {isEditing ? "Edit Transaksi Lain-Lain" : "Entri Transaksi Lain-Lain"}
                </h3>
                <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">
                  Input berdasarkan periode aktif
                </p>
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

          <form onSubmit={handleSave} className="bg-slate-900 p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaEllipsisH className="text-8xl text-white -rotate-12" />
            </div>

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-5 items-end">
              <div className="xl:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                  Tipe Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Provinsi", "Kabupaten", "Cabang"].map((tipe) => (
                    <button
                      type="button"
                      key={tipe}
                      onClick={() => setFormData({ ...formData, tipe })}
                      className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${formData.tipe === tipe
                        ? "bg-white text-slate-900 border-white shadow-lg"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                  Pos Lain-lain
                </label>
                {!isManualInput ? (
                  <div className="relative">
                    <select
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm focus:bg-white/10 focus:border-slate-400 transition-all appearance-none"
                    >
                      <option value="" className="text-slate-800">
                        -- Pilih Pos Lain-lain --
                      </option>
                      {keteranganOptions.map((opt, index) => (
                        <option key={index} value={opt} className="text-slate-800">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsManualInput(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/10 border border-white/10 rounded-lg text-[8px] font-black text-slate-300 uppercase hover:bg-white/20"
                    >
                      Manual
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm focus:bg-white/10 focus:border-slate-400 transition-all"
                      placeholder="Ketik keterangan..."
                    />
                    <button
                      type="button"
                      onClick={() => setIsManualInput(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/10 border border-white/10 rounded-lg text-[8px] font-black text-slate-300 uppercase hover:bg-white/20"
                    >
                      Opsi
                    </button>
                  </div>
                )}
              </div>

              <div className="xl:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                  Nominal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.rawNominal}
                    onChange={(e) => setFormData({ ...formData, rawNominal: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-white text-base focus:bg-white/10 focus:border-slate-400 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                    Bulan
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-white text-[10px] uppercase tracking-widest focus:bg-white/10 focus:border-slate-400 transition-all"
                  >
                    {bulanList.map((b) => (
                      <option key={b.id} value={b.namaBulan} className="text-slate-800 normal-case">
                        {b.namaBulan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                    Tahun
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-white text-[10px] uppercase tracking-widest focus:bg-white/10 focus:border-slate-400 transition-all"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year} className="text-slate-800 normal-case">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="xl:col-span-2 w-full px-8 py-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black shadow-xl shadow-emerald-900/30 transition-all active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSave />
                )}
                {isEditing ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </form>
        </motion.div>

        <form
          onSubmit={handleSubmitTarget}
          className="bg-slate-900 p-6 sm:p-8 rounded-[40px] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FaEllipsisH className="text-8xl text-white -rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row items-end gap-4 xl:gap-6">

            <div className="w-full xl:w-1/4 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                Pilih Cabang
              </label>
              <select
                value={selectedCabang}
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm focus:bg-white/10 focus:border-slate-500 transition-all appearance-none"
              >
                <option value="" className="text-slate-800">
                  -- Pilih Cabang --
                </option>
                {cabangList.map((c) => (
                  <option
                    key={c.id}
                    value={c.kecamatan}
                    className="text-slate-800"
                  >
                    {c.kecamatan}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full xl:w-1/4 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                Pos Lain-lain
              </label>
              <select
                value={targetKeterangan}
                onChange={(e) => setTargetKeterangan(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm focus:bg-white/10 focus:border-slate-500 transition-all appearance-none"
              >
                <option value="" className="text-slate-800">
                  -- Pilih Pos Lain-lain --
                </option>
                {keteranganOptions.map((opt, idx) => (
                  <option key={idx} value={opt} className="text-slate-800">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full xl:w-1/4 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                Jumlah Lain-Lain
              </label>
              <div className="relative">
                <FaShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="number"
                  value={jumlahPesanan}
                  onFocus={() => {
                    if (jumlahPesanan === "0") setJumlahPesanan("");
                  }}
                  onBlur={() => {
                    if (jumlahPesanan === "") setJumlahPesanan("0");
                  }}
                  onChange={(e) => setJumlahPesanan(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-white text-base focus:bg-white/10 focus:border-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="w-full xl:flex-1 flex xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-1 px-2 mb-2 xl:mb-0">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Grand Total
              </span>
              <span className="text-xl font-black text-slate-200 tracking-tight whitespace-nowrap">
                {formatCurrency(totalAkhir)}
              </span>
            </div>

            <div className="w-full xl:w-auto">
              <button
                type="submit"
                disabled={loadingTarget}
                className="w-full px-6 py-5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black shadow-xl shadow-slate-950/40 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loadingTarget ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSave className="text-sm" />
                )}
                Kunci Pesanan
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-8">
          {/* Target Lain-Lain Table */}
          <div ref={printTargetRef} className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden p-2">
            <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[18px] bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                  <FaChartLine className="text-xl" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">
                    Target Lain-Lain
                  </h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Per Cabang — {selectedMonth} {selectedYear}
                  </p>
                </div>
              </div>

              <div data-html2canvas-ignore="true" className="flex items-center gap-2 flex-wrap">

                {keteranganOptions.length > 0 && (
                  <select
                    value={selectedTargetKeterangan}
                    onChange={(e) => setSelectedTargetKeterangan(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-slate-600 text-[10px] uppercase tracking-widest cursor-pointer shadow-sm transition-all focus:border-slate-400"
                  >
                    <option value="" className="normal-case font-sans">-- Semua Pos Lain-lain --</option>
                    {keteranganOptions.map((ket, idx) => (
                      <option key={idx} value={ket} className="normal-case font-sans">
                        {ket}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleExportExcelTarget}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                >
                  <FaFileExcel className="text-xs" /> Excel
                </button>
                <button
                  onClick={handleDownloadPDFTarget}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                >
                  <FaFilePdf className="text-xs" /> PDF
                </button>
                <button
                  onClick={fetchTargetTable}
                  disabled={loadingTargetTable}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                >
                  {loadingTargetTable ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaSearch className="text-xs" />
                  )}
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-4 pt-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {["No", "Cabang", "Total Anggota", "Jumlah", "Peruntukan Kabupaten", "Peruntukan Cabang", "Total", "Transfer", "Pembayaran", "Selisih", "Action"].map((h, i) => (
                      <th
                        key={i}
                        data-html2canvas-ignore={h === 'Action' ? "true" : undefined}
                        className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingTargetTable ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                          <span className="text-xs font-black uppercase tracking-widest">Memuat...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTargetData.length > 0 ? (
                    filteredTargetData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors text-center text-[11px] font-bold text-slate-600">
                        <td className="px-4 py-4 text-slate-400 font-black">{index + 1}</td>
                        <td className="px-4 py-4 font-black text-slate-800 text-left whitespace-nowrap">{item.cabang}</td>
                        <td className="px-4 py-4">{item.totalAnggota ?? "-"}</td>
                        <td className="px-4 py-4">{parseInt(item.jumlah, 10) || 0}</td>
                        <td className="px-4 py-4 text-right font-black text-amber-600 whitespace-nowrap">{formatCurrency(item.perolehanKabupaten)}</td>
                        <td className="px-4 py-4 text-right font-black text-emerald-600 whitespace-nowrap">{formatCurrency(item.perolehanCabang || 0)}</td>
                        <td className="px-4 py-4 text-right font-black text-slate-900 bg-slate-50/50 whitespace-nowrap">{formatCurrency((item.perolehanKabupaten || 0) + (item.perolehanCabang || 0))}</td>
                        <td className="px-4 py-4 text-right font-black text-blue-600 whitespace-nowrap">{formatCurrency(item.transfer || 0)}</td>
                        <td className="px-4 py-4 text-right font-black text-slate-600 whitespace-nowrap">{formatCurrency(item.pembayaran || 0)}</td>
                        <td className="px-4 py-4 text-right font-black text-rose-600 whitespace-nowrap">{formatCurrency(item.selisih || 0)}</td>

                        <td data-html2canvas-ignore="true" className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditTarget(item)}
                              disabled={!item.id || item.id === 0}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDeleteTarget(item.id)}
                              disabled={!item.id || item.id === 0}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Hapus"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-300">
                          <FaChartLine className="text-4xl" />
                          <p className="text-xs font-black uppercase tracking-widest">Belum ada target</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredTargetData.length > 0 && (
                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-black text-center text-[11px]">
                      <td colSpan={2} className="px-4 py-4 text-slate-700 font-black text-right uppercase tracking-widest">TOTAL</td>
                      <td className="px-4 py-4 text-slate-700 font-black">
                        {filteredTargetData.reduce((s, i) => s + (parseInt(i.totalAnggota, 10) || 0), 0)}
                      </td>
                      <td className="px-4 py-4 text-slate-700 font-black">
                        {filteredTargetData.reduce((s, i) => s + (parseInt(i.jumlah, 10) || 0), 0)}
                      </td>
                      <td className="px-4 py-4 text-amber-600 font-black text-right whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.perolehanKabupaten || 0), 0))}
                      </td>
                      <td className="px-4 py-4 text-emerald-600 font-black text-right whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.perolehanCabang || 0), 0))}
                      </td>
                      <td className="px-4 py-4 text-slate-900 font-black text-right bg-slate-100 whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.perolehanKabupaten || 0) + (i.perolehanCabang || 0), 0))}
                      </td>
                      <td className="px-4 py-4 text-blue-600 font-black text-right whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.transfer || 0), 0))}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-black text-right whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.pembayaran || 0), 0))}
                      </td>
                      <td className="px-4 py-4 text-rose-600 font-black text-right whitespace-nowrap">
                        {formatCurrency(filteredTargetData.reduce((s, i) => s + (i.selisih || 0), 0))}
                      </td>
                      <td data-html2canvas-ignore="true" className="px-4 py-4 text-slate-400 text-center">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Target Modal */}
          {showEditTargetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-md mx-4">
                <h3 className="text-lg font-black text-slate-800 mb-6">Edit Target Lain-Lain</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cabang</label>
                    <input
                      type="text"
                      value={editTargetData.cabang}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Jumlah</label>
                    <input
                      type="number"
                      value={editTargetData.jumlah}
                      onChange={(e) => setEditTargetData({ ...editTargetData, jumlah: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bulan</label>
                      <select
                        value={editTargetData.bulan}
                        onChange={(e) => setEditTargetData({ ...editTargetData, bulan: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:border-slate-500"
                      >
                        {bulanList.map((b) => (
                          <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tahun</label>
                      <select
                        value={editTargetData.tahun}
                        onChange={(e) => setEditTargetData({ ...editTargetData, tahun: parseInt(e.target.value, 10) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:border-slate-500"
                      >
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditTargetModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateTarget}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Provinsi", val: totalProvinsi, color: "bg-indigo-600", icon: <FaMoneyBillWave /> },
              { label: "Total Kabupaten", val: totalKabupaten, color: "bg-amber-500", icon: <FaChartLine /> },
              { label: "Total Cabang", val: totalCabang, color: "bg-emerald-500", icon: <FaUsers /> },
              { label: "Total Lain-Lain", val: totalNominal, color: "bg-slate-700", icon: <FaEllipsisH /> },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.color} p-5 rounded-[28px] text-white shadow-lg flex items-center justify-between group overflow-hidden relative`}
              >
                <div className="relative z-10">
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">
                    {stat.label}
                  </p>
                  <h4 className="text-lg font-black">{formatCurrency(stat.val)}</h4>
                </div>
                <div className="text-3xl opacity-10 group-hover:scale-125 transition-transform duration-500">
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[18px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-sm">
                  <FaHistory className="text-xl" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">
                    Riwayat Transaksi
                  </h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Lain-Lain - {selectedMonth} {selectedYear}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1 md:flex-none">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase tracking-widest cursor-pointer"
                  >
                    {bulanList.map((b) => (
                      <option key={b.id} value={b.namaBulan} className="font-sans normal-case">
                        {b.namaBulan}
                      </option>
                    ))}
                  </select>
                  <div className="w-[1px] h-4 bg-slate-200" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase tracking-widest cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year} className="font-sans normal-case">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {["No", "Kategori", "Keterangan", "Bulan/Tahun", "Nominal", "Action"].map((heading, index) => (
                      <th
                        key={index}
                        className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const kategori = item.propinsi ? "Provinsi" : item.kabupaten ? "Kabupaten" : "Cabang";

                      return (
                        <tr
                          key={item.id || index}
                          className="hover:bg-slate-50/80 transition-colors text-center text-[11px] font-bold text-slate-600"
                        >
                          <td className="px-4 py-4 text-slate-400 font-black">{index + 1}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${item.propinsi
                                ? "bg-indigo-50 text-indigo-600"
                                : item.kabupaten
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                                }`}
                            >
                              {kategori}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-black text-slate-800 text-left whitespace-nowrap">
                            {item.keterangan}
                          </td>
                          <td className="px-4 py-4 text-slate-400">
                            {item.bulan} {item.tahun}
                          </td>
                          <td className="px-4 py-4 text-slate-900 font-black text-right">
                            {formatCurrency(item.jumlahNominal)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Hapus"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-300">
                          <FaFileInvoiceDollar className="text-4xl" />
                          <p className="text-xs font-black uppercase tracking-widest">Data Kosong</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filteredData.length > 0 && (
                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-black text-center text-[11px]">
                      <td colSpan={4} className="px-4 py-4 text-slate-700 font-black text-right">
                        TOTAL REKAP
                      </td>
                      <td className="px-4 py-4 text-slate-700 font-black text-right">
                        {formatCurrency(totalNominal)}
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-center">-</td>
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
