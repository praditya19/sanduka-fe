"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaBuilding,
  FaSearch,
  FaArrowUp,
  FaCheckDouble,
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaPrint,
  FaFileExcel,
  FaCog,
  FaTag
} from "react-icons/fa";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const TagihanForm = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const [summary, setSummary] = useState({
    totalTagihan: 0,
    totalPembayaran: 0,
    sisa: 0
  });

  const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);

  const monthValueToLabel = Object.fromEntries(months.map(m => [m.value, m.label]));

  // Modal States
  const [showModalCabang, setShowModalCabang] = useState(false);
  const [showModalPos, setShowModalPos] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger",
    isLoading: false
  });

  const [transaksiSuksesTotal, setTransaksiSuksesTotal] = useState(0);

  // Data Lists
  const [posPenerimaanList, setPosPenerimaanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Cabang
  const [formCabang, setFormCabang] = useState({
    cabang: "",
    tanggalTransaksi: new Date().toISOString().split('T')[0],
    jenisPenerimaan: "Transfer",
    setoranBulan: months[new Date().getMonth()].value,
    setoranTahun: new Date().getFullYear(),
    items: [
      { pos: "", tagihan: "", pembayaran: "", keterangan: "" }
    ]
  });

  const formatCurrency = (val) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(val || 0);

  const fetchAuxData = async () => {
    try {
      const [resPosIn, resCabang] = await Promise.all([
        GlobalApi.getPosPenerimaanUmum(),
        GlobalApi.getCabang()
      ]);
      setPosPenerimaanList((resPosIn || []).sort((a, b) => a.namaPosPenerimaan.localeCompare(b.namaPosPenerimaan)));
      setCabangList((resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan)));
    } catch (error) {
      console.error("Error fetching aux data:", error);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GlobalApi.getTransaksiCabangByBulanTahun(Number(monthFilter), Number(yearFilter));
      const rawList = Array.isArray(data) ? data : data?.data || [];

      let totalTagihan = 0;
      let totalPembayaran = 0;

      const processed = rawList.map(item => {
        const t = Number(item.tagihan || 0);
        const p = Number(item.pembayaran || 0);
        totalTagihan += t;
        totalPembayaran += p;
        return {
          ...item,
          tagihan: t,
          pembayaran: p,
          sisa: t - p,
          formattedDate: Array.isArray(item.tanggalTransaksi)
            ? `${String(item.tanggalTransaksi[2]).padStart(2, '0')}-${String(item.tanggalTransaksi[1]).padStart(2, '0')}-${item.tanggalTransaksi[0]}`
            : new Date(item.tanggalTransaksi).toLocaleDateString("id-ID")
        };
      });

      setTransactions(processed);
      setSummary({ totalTagihan, totalPembayaran, sisa: totalTagihan - totalPembayaran });
    } catch (error) {
      console.error("Error fetching cabang transactions:", error);
      toast.error("Gagal memuat data tagihan cabang.");
    } finally {
      setLoading(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchData();
    fetchAuxData();
  }, [fetchData]);

  const filteredTransactions = transactions.filter(t =>
    t.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cabang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pos?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = () => {
    try {
      const excelData = [
        ["No", "Tanggal", "Cabang", "Pos", "Tagihan", "Pembayaran", "Sisa"]
      ];
      transactions.forEach((t, i) => {
        excelData.push([
          i + 1,
          t.formattedDate,
          t.cabang || "-",
          t.pos || "-",
          t.tagihan,
          t.pembayaran,
          t.sisa
        ]);
      });
      excelData.push([]);
      excelData.push(["", "", "", "", "TOTAL", summary.totalTagihan, summary.totalPembayaran, summary.sisa]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tagihan Cabang");
      XLSX.writeFile(wb, `Tagihan_Cabang_${monthFilter}_${yearFilter}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleDeleteTransaksi = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Transaksi",
      message: "Apakah Anda yakin ingin menghapus transaksi cabang ini?",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await GlobalApi.deleteTransaksiCabang(id);
          toast.success("Transaksi berhasil dihapus!");
          fetchData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          toast.error("Gagal menghapus transaksi.");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    tanggalTransaksi: "",
    pos: "",
    cabang: "",
    setoranBulan: "",
    setoranTahun: "",
    jenisTransaksi: "PEMASUKAN",
    jenisPenerimaan: "Transfer",
    tagihan: 0,
    pembayaran: 0,
    transaksiSukses: 0,
    totalTagihan: 0,
    totalPembayaran: 0,
    totalAkhir: 0,
    keterangan: ""
  });

  const handleEditClick = (item) => {
    const tanggal = Array.isArray(item.tanggalTransaksi)
      ? `${item.tanggalTransaksi[0]}-${String(item.tanggalTransaksi[1]).padStart(2, "0")}-${String(item.tanggalTransaksi[2]).padStart(2, "0")}`
      : item.tanggalTransaksi.slice(0, 10);
    setEditForm({
      id: item.id,
      tanggalTransaksi: tanggal,
      pos: item.pos,
      cabang: item.cabang,
      setoranBulan: item.setoranBulan || "",
      setoranTahun: item.setoranTahun || "",
      jenisTransaksi: item.jenisTransaksi || "PEMASUKAN",
      jenisPenerimaan: item.jenisPenerimaan || "Transfer",
      tagihan: item.tagihan || 0,
      pembayaran: item.pembayaran || 0,
      transaksiSukses: item.transaksiSukses || 0,
      totalTagihan: item.totalTagihan || 0,
      totalPembayaran: item.totalPembayaran || 0,
      totalAkhir: item.totalAkhir || 0,
      keterangan: item.keterangan || ""
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await GlobalApi.updateTransaksiCabang(editForm.id, {
        tanggalTransaksi: editForm.tanggalTransaksi,
        jenisTransaksi: editForm.jenisTransaksi,
        pos: editForm.pos,
        cabang: editForm.cabang,
        setoranBulan: Number(editForm.setoranBulan),
        setoranTahun: Number(editForm.setoranTahun),
        jenisPenerimaan: editForm.jenisPenerimaan,
        tagihan: Number(editForm.tagihan),
        pembayaran: Number(editForm.pembayaran),
        transaksiSukses: Number(editForm.transaksiSukses),
        totalTagihan: Number(editForm.totalTagihan),
        totalPembayaran: Number(editForm.totalPembayaran),
        totalAkhir: Number(editForm.totalAkhir),
        keterangan: editForm.keterangan
      });
      toast.success("Transaksi berhasil diperbarui!");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating transaksi cabang:", error);
      toast.error("Gagal memperbarui transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Form functions
  const terbilangAngka = (n) => {
    if (n === 0 || !n) return "";
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (n < 12) return " " + bilangan[n];
    if (n < 20) return terbilangAngka(n - 10) + " Belas";
    if (n < 100) return terbilangAngka(Math.floor(n / 10)) + " Puluh" + terbilangAngka(n % 10);
    if (n < 200) return " Seratus" + terbilangAngka(n - 100);
    if (n < 1000) return terbilangAngka(Math.floor(n / 100)) + " Ratus" + terbilangAngka(n % 100);
    if (n < 2000) return " Seribu" + terbilangAngka(n - 1000);
    if (n < 1000000) return terbilangAngka(Math.floor(n / 1000)) + " Ribu" + terbilangAngka(n % 1000);
    if (n < 1000000000) return terbilangAngka(Math.floor(n / 1000000)) + " Juta" + terbilangAngka(n % 1000000);
    return terbilangAngka(Math.floor(n / 1000000000)) + " Miliar" + terbilangAngka(n % 1000000000);
  };

  const terbilang = (n) => {
    if (n === 0 || !n) return "Tidak ada nominal";
    return terbilangAngka(n).trim() + " Rupiah";
  };

  const PERUNTUKAN_CONFIG = {
    "Iuran PGRI": { api: GlobalApi.getRekapByPeriode, tagihanField: null, bankField: "potonganBank" },
    "Daspen": { api: GlobalApi.getRekapDaspenByPeriode, tagihanField: "tagihan", bankField: "transfer" },
    "Derap": { api: GlobalApi.getRekapDerapByPeriode, tagihanField: "peruntukanCabang", bankField: "transfer" },
    "Kalender": { api: GlobalApi.getRekapKalenderByPeriode, tagihanField: "peruntukanCabang", bankField: "transfer" },
    "Sanduka": { api: GlobalApi.getRekapByPeriode, tagihanField: "sanduka", bankField: null },
  };

  const fetchAllBankValues = async (cabang, bulanVal, tahun) => {
    const namaBulan = monthValueToLabel[bulanVal];
    if (!namaBulan || !cabang) return 0;
    const cabangNormalized = cabang.trim().toUpperCase();
    let total = 0;
    const cfg = PERUNTUKAN_CONFIG["Iuran PGRI"];
    try {
      const data = await cfg.api(namaBulan, tahun);
      const records = Array.isArray(data) ? data : data?.data || [];
      const match = records.find(r => r.cabang?.trim().toUpperCase() === cabangNormalized);
      if (match) {
        total = Number(match[cfg.bankField] || 0);
      }
    } catch (e) {
      console.error("Error fetching bank value:", e);
    }
    setTransaksiSuksesTotal(total);
    return total;
  };

  const fetchPeruntukanCabang = async (cabang, bulanVal, tahun, itemIndex, pos) => {
    const cfg = PERUNTUKAN_CONFIG[pos];
    if (!cfg || !cabang || !bulanVal || !tahun) return;
    try {
      const namaBulan = monthValueToLabel[bulanVal];
      if (!namaBulan) return;
      const data = await cfg.api(namaBulan, tahun);
      const records = Array.isArray(data) ? data : data?.data || [];
      const cabangNormalized = cabang.trim().toUpperCase();
      const match = records.find(item => item.cabang?.trim().toUpperCase() === cabangNormalized);
      if (match) {
        let tagihanVal;
        if (pos === "Iuran PGRI") {
          tagihanVal = Number(match.pb || 0) + Number(match.provinsi || 0) + Number(match.kabupaten || 0);
        } else {
          tagihanVal = cfg.calc ? cfg.calc(match) : match[cfg.tagihanField];
        }
        if (tagihanVal !== null && tagihanVal !== undefined) {
          setFormCabang(prev => {
            const newItems = [...prev.items];
            newItems[itemIndex] = { ...newItems[itemIndex], tagihan: tagihanVal > 0 ? Number(tagihanVal) : "" };
            return { ...prev, items: newItems };
          });
        }
      } else if (records.length > 0) {
        toast("Data peruntukan untuk cabang ini belum tersedia", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Error fetching peruntukan:", error);
    }
  };

  const handleItemPosChange = (itemIndex, selectedPos) => {
    setFormCabang(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex] = { ...newItems[itemIndex], pos: selectedPos };
      return { ...prev, items: newItems };
    });
    if (selectedPos) {
      fetchPeruntukanCabang(formCabang.cabang, formCabang.setoranBulan, formCabang.setoranTahun, itemIndex, selectedPos);
    }
  };

  const addCabangItem = () => {
    setFormCabang(prev => ({
      ...prev,
      items: [...prev.items, { pos: "", tagihan: "", pembayaran: "", keterangan: "" }]
    }));
  };

  const removeCabangItem = (itemIndex) => {
    setFormCabang(prev => {
      const newItems = prev.items.filter((_, i) => i !== itemIndex);
      return { ...prev, items: newItems.length > 0 ? newItems : [{ pos: "", tagihan: "", pembayaran: "", keterangan: "" }] };
    });
  };

  const updateCabangItem = (itemIndex, field, value) => {
    setFormCabang(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCabang.cabang || !formCabang.setoranBulan || !formCabang.setoranTahun) {
      toast.error("Harap isi Cabang, Bulan, dan Tahun Pembayaran!");
      return;
    }
    const validItems = formCabang.items.filter(item => item.pos);
    if (validItems.length === 0) {
      toast.error("Minimal satu Pos harus dipilih!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = validItems.map(item => ({
        tanggalTransaksi: formCabang.tanggalTransaksi,
        jenisTransaksi: "PEMASUKAN",
        pos: item.pos,
        cabang: formCabang.cabang,
        setoranBulan: Number(formCabang.setoranBulan),
        setoranTahun: Number(formCabang.setoranTahun),
        jenisPenerimaan: formCabang.jenisPenerimaan,
        keterangan: item.keterangan,
        tagihan: item.tagihan ? Number(item.tagihan) : null,
        pembayaran: item.pembayaran ? Number(item.pembayaran) : null,
        transaksiSukses: transaksiSuksesTotal || null,
        totalTagihan: formCabang.items.reduce((s, i) => s + (Number(i.tagihan) || 0), 0),
        totalPembayaran: formCabang.items.reduce((s, i) => s + (Number(i.pembayaran) || 0), 0),
        totalAkhir: Math.max(0, transaksiSuksesTotal - formCabang.items.reduce((s, i) => s + (Number(i.pembayaran) || 0), 0)),
      }));
      await GlobalApi.createTransaksiCabangBatch(payload);
      toast.success(`${validItems.length} transaksi cabang berhasil dicatat!`);
      setShowModalCabang(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error post transaksi cabang batch:", error);
      toast.error("Gagal mencatat transaksi cabang.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormCabang({
      cabang: "",
      tanggalTransaksi: new Date().toISOString().split('T')[0],
      jenisPenerimaan: "Transfer",
      setoranBulan: months[new Date().getMonth()].value,
      setoranTahun: new Date().getFullYear(),
      items: [{ pos: "", tagihan: "", pembayaran: "", keterangan: "" }]
    });
    setTransaksiSuksesTotal(0);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tagihan Cabang</h1>
          <p className="text-slate-400 text-sm font-medium italic">Kelola tagihan dan pembayaran cabang</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {[
          { label: "Total Tagihan", value: summary.totalTagihan, color: "text-violet-600", icon: <FaTag /> },
          { label: "Total Pembayaran", value: summary.totalPembayaran, color: "text-emerald-600", icon: <FaArrowUp /> },
          { label: "Sisa Tagihan", value: summary.sisa, color: "text-rose-600", icon: <FaCheckDouble /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className={`text-base ${item.color} opacity-50`}>{item.icon}</span>
            </div>
            <p className={`text-xl font-black ${item.color}`}>
              {loading ? "..." : formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-transparent text-sm font-black px-3 py-2 outline-none text-slate-600"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="bg-transparent text-sm font-black px-3 py-2 outline-none text-slate-600"
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-black w-48 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowModalPos(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
            >
              <FaCog /> <span>Kelola Pos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entry Button */}
      <div className="print:hidden">
        <button
          onClick={() => setShowModalCabang(true)}
          className="w-full flex items-center justify-center space-x-3 p-6 bg-white border-2 border-violet-100 rounded-[32px] hover:border-violet-500 hover:bg-violet-50 transition-all group"
        >
          <div className="w-12 h-12 bg-violet-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-all">
            <FaPlus />
          </div>
          <div className="text-left">
            <h4 className="text-base font-black text-slate-800 uppercase">Input Keuangan Cabang</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">Catat tagihan dan pembayaran cabang</p>
          </div>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 print:pb-2">
          <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center space-x-2">
            <FaBuilding className="text-violet-500 no-print" />
            <span>Data Tagihan Cabang - {months.find(m => m.value === monthFilter)?.label} {yearFilter}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase tracking-wider"
            >
              <FaFileExcel /> <span>Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 uppercase tracking-wider"
            >
              <FaPrint /> <span>Cetak</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] sm:text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-3 sm:px-6 py-4 text-center">No</th>
                <th className="px-3 sm:px-6 py-4">Tgl Transaksi</th>
                <th className="px-3 sm:px-6 py-4">Cabang</th>
                <th className="px-3 sm:px-6 py-4">Pos</th>
                <th className="px-3 sm:px-6 py-4 text-right">Tagihan (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Pembayaran (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Sisa (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t, i) => (
                  <tr key={t.id || i} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-500 text-center">{i + 1}</td>
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-500">{t.formattedDate}</td>
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-600">{t.cabang}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="inline-block px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-[9px] sm:text-[10px] font-black">{t.pos}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-violet-600">
                      {formatCurrency(t.tagihan)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-emerald-600">
                      {t.pembayaran > 0 ? formatCurrency(t.pembayaran) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-rose-600">
                      {t.sisa > 0 ? formatCurrency(t.sisa) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <button onClick={() => handleEditClick(t)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all text-xs" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteTransaksi(t.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all text-xs" title="Hapus">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                    <FaInfoCircle className="text-slate-100 text-6xl mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Data tagihan tidak ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
            {!loading && filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-800 text-white">
                <tr className="font-black text-[10px] sm:text-sm">
                  <td colSpan="4" className="px-3 sm:px-6 py-5 uppercase tracking-wider">Total Tagihan Cabang</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.totalTagihan)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.totalPembayaran)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right bg-blue-600">{formatCurrency(summary.sisa)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal: Input Keuangan Cabang */}
      <AnimatePresence>
        {showModalCabang && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalCabang(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 bg-violet-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md"><FaBuilding /></div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Keuangan Cabang</h3>
                    <p className="text-violet-100 text-xs font-bold">Catat transaksi keuangan cabang</p>
                  </div>
                </div>
                <button onClick={() => setShowModalCabang(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                {/* Cabang */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                  <select required value={formCabang.cabang} onChange={(e) => {
                    const cabangVal = e.target.value;
                    setFormCabang(prev => ({ ...prev, cabang: cabangVal }));
                    formCabang.items.forEach((_, idx) => fetchPeruntukanCabang(cabangVal, formCabang.setoranBulan, formCabang.setoranTahun, idx));
                    fetchAllBankValues(cabangVal, formCabang.setoranBulan, formCabang.setoranTahun);
                  }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                    <option value="">Pilih Cabang</option>
                    {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                  </select>
                </div>

                {/* Tanggal & Metode */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                    <input type="date" required value={formCabang.tanggalTransaksi} onChange={(e) => setFormCabang({ ...formCabang, tanggalTransaksi: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Metode</label>
                    <select required value={formCabang.jenisPenerimaan} onChange={(e) => setFormCabang({ ...formCabang, jenisPenerimaan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="Transfer">Transfer</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>
                </div>

                {/* Bulan & Tahun */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Bulan Pembayaran</label>
                    <select required value={formCabang.setoranBulan} onChange={(e) => {
                      const bulanVal = e.target.value;
                      setFormCabang(prev => ({ ...prev, setoranBulan: bulanVal }));
                      formCabang.items.forEach((_, idx) => fetchPeruntukanCabang(formCabang.cabang, bulanVal, formCabang.setoranTahun, idx));
                      fetchAllBankValues(formCabang.cabang, bulanVal, formCabang.setoranTahun);
                    }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {months.map((month) => (<option key={month.value} value={month.value}>{month.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tahun Pembayaran</label>
                    <select required value={formCabang.setoranTahun} onChange={(e) => {
                      const tahunVal = Number(e.target.value);
                      setFormCabang(prev => ({ ...prev, setoranTahun: tahunVal }));
                      formCabang.items.forEach((_, idx) => fetchPeruntukanCabang(formCabang.cabang, formCabang.setoranBulan, tahunVal, idx));
                      fetchAllBankValues(formCabang.cabang, formCabang.setoranBulan, tahunVal);
                    }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {yearOptions.map((year) => (<option key={year} value={year}>{year}</option>))}
                    </select>
                  </div>
                </div>

                {/* Transaksi Sukses Total */}
                <div>
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block px-1">Transaksi Sukses</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-blue-400">Rp</span>
                    <input type="text" readOnly value={transaksiSuksesTotal.toLocaleString("id-ID")} placeholder="0" className="w-full pl-14 pr-5 py-5 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none font-black text-2xl text-blue-600" />
                  </div>
                </div>

                {/* Dynamic Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pos & Keterangan</label>
                    <button type="button" onClick={addCabangItem} disabled={!formCabang.cabang} className="flex items-center space-x-1 px-3 py-1.5 bg-violet-100 text-violet-600 rounded-xl text-[10px] font-black hover:bg-violet-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <FaPlus size={10} /> <span>Tambah</span>
                    </button>
                  </div>
                  {formCabang.items.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-violet-50/50 border border-violet-100 rounded-[24px] space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Pos</label>
                              <select disabled={!formCabang.cabang} required={idx === 0} value={item.pos} onChange={(e) => handleItemPosChange(idx, e.target.value)} className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-bold text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                <option value="">{formCabang.cabang ? "Pilih Pos" : "Pilih Cabang dulu"}</option>
                                {posPenerimaanList.map(p => <option key={p.id} value={p.namaPosPenerimaan}>{p.namaPosPenerimaan}</option>)}
                              </select>
                            </div>
                            {item.pos && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Tagihan</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp</span>
                                    <input type="text" value={item.tagihan ? Number(item.tagihan).toLocaleString("id-ID") : ""} onChange={(e) => updateCabangItem(idx, "tagihan", e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="w-full pl-9 pr-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-black text-sm text-violet-600" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Pembayaran</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp</span>
                                    <input type="text" value={item.pembayaran ? Number(item.pembayaran).toLocaleString("id-ID") : ""} onChange={(e) => updateCabangItem(idx, "pembayaran", e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="w-full pl-9 pr-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-black text-sm text-violet-600" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {item.tagihan > 0 && (
                            <p className="text-[9px] text-slate-400 font-medium italic px-1">
                              {terbilang(Number(item.tagihan))}
                            </p>
                          )}
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Keterangan</label>
                            <input type="text" value={item.keterangan} onChange={(e) => updateCabangItem(idx, "keterangan", e.target.value)} placeholder="Keterangan..." className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" />
                          </div>
                        </div>
                        {formCabang.items.length > 1 && (
                          <button type="button" onClick={() => removeCabangItem(idx)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-6">
                            <FaTimes size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Totals */}
                {formCabang.items.some(i => i.pos) && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-[32px] space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                      <span className="text-lg font-black text-violet-600">Rp {formCabang.items.reduce((s, i) => s + (Number(i.tagihan) || 0), 0).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</span>
                      <span className="text-lg font-black text-emerald-600">Rp {formCabang.items.reduce((s, i) => s + (Number(i.pembayaran) || 0), 0).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Akhir</span>
                      <span className="text-xl font-black text-blue-600">Rp {(transaksiSuksesTotal - formCabang.items.reduce((s, i) => s + (Number(i.pembayaran) || 0), 0)).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowModalCabang(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-violet-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-violet-100">
                    {submitting ? "Menyimpan..." : `Simpan (${formCabang.items.filter(i => i.pos).length || 0})`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Kelola Pos */}
      <AnimatePresence>
        {showModalPos && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalPos(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-tight">Daftar Pos Penerimaan</h3>
                <button onClick={() => setShowModalPos(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                {posPenerimaanList.length === 0 ? (
                  <p className="text-slate-400 font-bold text-center py-8">Belum ada pos penerimaan</p>
                ) : (
                  posPenerimaanList.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                      <span className="font-bold text-sm text-slate-700">{p.namaPosPenerimaan}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-lg font-black text-slate-800 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase">Batal</button>
                <button onClick={confirmModal.onConfirm} disabled={confirmModal.isLoading} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase">
                  {confirmModal.isLoading ? "Memproses..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 bg-blue-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md"><FaEdit /></div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Edit Transaksi Cabang</h3>
                    <p className="text-blue-100 text-xs font-bold">{editForm.cabang} - {editForm.pos}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                    <input type="date" required value={editForm.tanggalTransaksi} onChange={(e) => setEditForm({ ...editForm, tanggalTransaksi: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Metode</label>
                    <select required value={editForm.jenisPenerimaan} onChange={(e) => setEditForm({ ...editForm, jenisPenerimaan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="Transfer">Transfer</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block px-1">Transaksi Sukses</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-blue-400">Rp</span>
                    <input type="text" readOnly value={Number(editForm.transaksiSukses).toLocaleString("id-ID")} className="w-full pl-10 pr-4 py-3.5 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-black text-lg text-blue-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tagihan</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
                      <input type="text" required value={Number(editForm.tagihan).toLocaleString("id-ID")} onChange={(e) => setEditForm({ ...editForm, tagihan: e.target.value.replace(/[^0-9]/g, '') })} className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-lg text-violet-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pembayaran</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
                      <input type="text" value={Number(editForm.pembayaran).toLocaleString("id-ID")} onChange={(e) => setEditForm({ ...editForm, pembayaran: e.target.value.replace(/[^0-9]/g, '') })} className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-lg text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Keterangan</label>
                  <textarea value={editForm.keterangan} onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })} placeholder="Keterangan..." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 h-24 resize-none" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-100">
                    {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagihanForm;
