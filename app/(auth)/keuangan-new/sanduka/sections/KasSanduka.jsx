"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaFileExport,
  FaFileExcel,
  FaPrint,
  FaCog,
  FaCheckDouble,
  FaTrash,
  FaEdit,
  FaInfoCircle,
  FaWallet,
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTag,
  FaBuilding,
  FaAlignLeft,
  FaUndo
} from "react-icons/fa";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const KasSanduka = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const [summary, setSummary] = useState({
    saldoAwal: 0,
    masuk: 0,
    keluar: 0,
    saldoAkhir: 0
  });

  const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ];

  // Modal States
  const [showModalIn, setShowModalIn] = useState(false);
  const [showModalOut, setShowModalOut] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
    isLoading: false
  });
  const [posPenerimaanList, setPosPenerimaanList] = useState([]);
  const [posPengeluaranList, setPosPengeluaranList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Kelola Pos States
  const [showModalPos, setShowModalPos] = useState(false);
  const [posTab, setPosTab] = useState("penerimaan"); // "penerimaan" or "pengeluaran"
  const [newPosName, setNewPosName] = useState("");

  // Form States
  const [formIn, setFormIn] = useState({
    tanggalTransaksi: new Date().toISOString().split('T')[0],
    jenisPenerimaan: "Transfer",
    posPenerimaan: "",
    cabang: "",
    setoranBulan: months[new Date().getMonth()].label,
    setoranTahun: new Date().getFullYear(),
    nominal: 0,
    keterangan: ""
  });

  const [formOut, setFormOut] = useState({
    tanggalTransaksi: new Date().toISOString().split('T')[0],
    jenisPengeluaran: "Tunai",
    posPengeluaran: "",
    cabang: "",
    pengeluaranBulan: months[new Date().getMonth()].label,
    pengeluaranTahun: new Date().getFullYear(),
    nominal: 0,
    keterangan: ""
  });

  useEffect(() => {
    fetchData();
    fetchAuxData();
  }, [monthFilter, yearFilter]);

  const fetchAuxData = async () => {
    try {
      const [resPosIn, resPosOut, resCabang] = await Promise.all([
        GlobalApi.getPosPenerimaanSanduka(),
        GlobalApi.getPosPengeluaranSanduka(),
        GlobalApi.getCabang()
      ]);
      setPosPenerimaanList(resPosIn || []);
      setPosPengeluaranList(resPosOut || []);
      setCabangList(resCabang.data || []);
    } catch (error) {
      console.error("Error fetching aux data:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const targetBulan = Number(monthFilter);
      const targetTahun = Number(yearFilter);

      // 1. Fetch current month data
      const currentMonthData = await GlobalApi.getTableKasSanduka(targetBulan, targetTahun);
      
      // 2. Legacy Manual Calculation: Loop back to March 2021 to get Saldo Awal
      const maret2021 = new Date(2021, 2, 1);
      let tempDate = new Date(targetTahun, targetBulan - 1, 1);
      tempDate.setMonth(tempDate.getMonth() - 1);

      let allPreviousData = [];
      while (tempDate >= maret2021) {
        const b = tempDate.getMonth() + 1;
        const y = tempDate.getFullYear();
        try {
          const data = await GlobalApi.getTableKasSanduka(b, y);
          allPreviousData.push(...(Array.isArray(data) ? data : []));
        } catch (e) {
          console.warn(`Failed to fetch legacy data for ${b}-${y}`);
        }
        tempDate.setMonth(tempDate.getMonth() - 1);
      }

      let saldoAwalManual = 0;
      allPreviousData.forEach(item => {
        saldoAwalManual += (item.debet || 0) - (item.kredit || 0);
      });

      // 3. Replicate Saldo Awal row logic
      const hasSaldoAwal = currentMonthData.some(item => 
        String(item.nomorBukti || "").toLowerCase().includes("saldo awal sanduka")
      );

      let processed = [...currentMonthData];
      if (!hasSaldoAwal) {
        processed = [{
          id: "virtual-saldo-awal",
          tanggalTransaksi: [targetTahun, targetBulan, 1],
          nomorBukti: "SALDO AWAL SANDUKA",
          keterangan: `Saldo Sanduka Periode ${monthFilter}-${targetTahun}`,
          debet: saldoAwalManual,
          kredit: 0,
          isVirtual: true
        }, ...currentMonthData];
      }

      // 4. Calculate running balance and totals for summary
      let currentBalance = 0;
      let totalMasuk = 0;
      let totalKeluar = 0;

      const transactionsWithBalance = processed.map(item => {
        const d = item.debet || 0;
        const k = item.kredit || 0;
        
        if (!item.isVirtual) {
          totalMasuk += d;
          totalKeluar += k;
        }

        currentBalance += (d - k);
        return {
          ...item,
          runningBalance: currentBalance,
          formattedDate: Array.isArray(item.tanggalTransaksi) 
            ? `${String(item.tanggalTransaksi[2]).padStart(2, '0')}-${String(item.tanggalTransaksi[1]).padStart(2, '0')}-${item.tanggalTransaksi[0]}`
            : new Date(item.tanggalTransaksi).toLocaleDateString("id-ID")
        };
      });

      setTransactions(transactionsWithBalance);
      setSummary({
        saldoAwal: saldoAwalManual,
        masuk: totalMasuk,
        keluar: totalKeluar,
        saldoAkhir: currentBalance
      });

    } catch (error) {
      console.error("Error fetching ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPos = async () => {
    if (!newPosName) {
      toast.error("Nama pos tidak boleh kosong!");
      return;
    }
    setSubmitting(true);
    try {
      if (posTab === "penerimaan") {
        await GlobalApi.postPosPenerimaanSanduka({ namaPosPenerimaan: newPosName });
      } else {
        await GlobalApi.postPosPengeluaranSanduka({ namaPosPengeluaran: newPosName });
      }
      toast.success("Pos berhasil ditambahkan!");
      setNewPosName("");
      fetchAuxData();
    } catch (error) {
      console.error("Error add pos:", error);
      toast.error("Gagal menambahkan pos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePos = async (id, type) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Kategori",
      message: "Apakah Anda yakin ingin menghapus pos ini? Tindakan ini tidak dapat dibatalkan.",
      type: "danger",
      onConfirm: async () => {
        try {
          if (type === "penerimaan") {
            await GlobalApi.deletePosPenerimaanSanduka(id);
          } else {
            await GlobalApi.deletePosPengeluaranSanduka(id);
          }
          toast.success("Pos berhasil dihapus!");
          fetchAuxData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Error delete pos:", error);
          toast.error("Gagal menghapus pos. Pos sistem tidak bisa dihapus.");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const terbilang = (n) => {
    if (n === 0 || !n) return "Tidak ada nominal";
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let temp = "";
    if (n < 12) temp = " " + bilangan[n];
    else if (n < 20) temp = terbilang(n - 10) + " Belas";
    else if (n < 100) temp = terbilang(Math.floor(n / 10)) + " Puluh" + terbilang(n % 10);
    else if (n < 200) temp = " Seratus" + terbilang(n - 100);
    else if (n < 1000) temp = terbilang(Math.floor(n / 100)) + " Ratus" + terbilang(n % 100);
    else if (n < 2000) temp = " Seribu" + terbilang(n - 1000);
    else if (n < 1000000) temp = terbilang(Math.floor(n / 1000)) + " Ribu" + terbilang(n % 1000);
    else if (n < 1000000000) temp = terbilang(Math.floor(n / 1000000)) + " Juta" + terbilang(n % 1000000);
    else if (n < 1000000000000) temp = terbilang(Math.floor(n / 1000000000)) + " Miliar" + terbilang(n % 1000000000);
    return temp.trim();
  };

  const formatCurrency = (val) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(val || 0);

  const filteredTransactions = transactions.filter(t =>
    t.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nomorBukti?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = () => {
    try {
      const excelData = [
        ["No", "Tanggal", "Nomor Bukti", "Keterangan", "Debet", "Kredit", "Saldo"]
      ];

      transactions.forEach((t, i) => {
        excelData.push([
          i + 1,
          t.formattedDate,
          t.nomorBukti || "-",
          t.keterangan || "-",
          t.debet,
          t.kredit,
          t.runningBalance
        ]);
      });

      excelData.push([]);
      excelData.push(["", "", "", "TOTAL", summary.masuk, summary.keluar, summary.saldoAkhir]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Buku Kas");
      XLSX.writeFile(wb, `Buku_Kas_Sanduka_${monthFilter}_${yearFilter}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const printLedger = () => {
    window.print();
  };

  const handleSesuaiTarget = async () => {
    const targetDate = showModalIn ? formIn.tanggalTransaksi : new Date().toISOString().split('T')[0];

    setConfirmModal({
      isOpen: true,
      title: "Generate Sesuai Target",
      message: `Apakah Anda yakin ingin men-generate data setoran sesuai target untuk tanggal ${targetDate}? Semua cabang akan tercatat secara otomatis.`,
      type: "info",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setSubmitting(true);
        try {
          await GlobalApi.postSesuaiTargetSanduka(targetDate);
          toast.success("Data sesuai target berhasil dibuat!");
          if (showModalIn) setShowModalIn(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (error) {
          console.error("Error generating target:", error);
          toast.error("Gagal men-generate data. Coba lagi nanti.");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } finally {
          setSubmitting(false);
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const handleSubmitIn = async (e) => {
    e.preventDefault();
    if (!formIn.posPenerimaan || !formIn.cabang || formIn.nominal <= 0) {
      toast.error("Harap isi semua field yang wajib!");
      return;
    }
    setSubmitting(true);
    try {
      await GlobalApi.postPemasukanSanduka(formIn);
      toast.success("Pemasukan kas berhasil dicatat!");
      setShowModalIn(false);
      setFormIn({
        tanggalTransaksi: new Date().toISOString().split('T')[0],
        jenisPenerimaan: "Transfer",
        posPenerimaan: "",
        cabang: "",
        setoranBulan: months[new Date().getMonth()].label,
        setoranTahun: new Date().getFullYear(),
        nominal: 0,
        keterangan: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error post pemasukan:", error);
      toast.error("Gagal mencatat pemasukan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOut = async (e) => {
    e.preventDefault();
    if (!formOut.posPengeluaran || !formOut.cabang || formOut.nominal <= 0) {
      toast.error("Harap isi semua field yang wajib!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        tanggalTransaksi: formOut.tanggalTransaksi,
        posPengeluaran: formOut.posPengeluaran,
        jenisPengeluaran: formOut.jenisPengeluaran,
        cabang: formOut.cabang,
        pengeluaranBulan: formOut.pengeluaranBulan,
        pengeluaranTahun: formOut.pengeluaranTahun,
        nominal: formOut.nominal,
        keterangan: formOut.keterangan
      };
      await GlobalApi.postPengeluaranSanduka(payload);
      toast.success("Pengeluaran kas berhasil dicatat!");
      setShowModalOut(false);
      setFormOut({
        tanggalTransaksi: new Date().toISOString().split('T')[0],
        jenisPengeluaran: "Tunai",
        posPengeluaran: "",
        cabang: "",
        pengeluaranBulan: months[new Date().getMonth()].label,
        pengeluaranTahun: new Date().getFullYear(),
        nominal: 0,
        keterangan: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error post pengeluaran:", error);
      toast.error("Gagal mencatat pengeluaran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      {/* Period Summary Cards - Integrated */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {[
          { label: `Saldo Awal ${months.find(m => m.value === monthFilter)?.label}`, value: summary.saldoAwal, color: "text-slate-600", icon: <FaWallet /> },
          { label: "Pemasukan", value: summary.masuk, color: "text-emerald-600", icon: <FaArrowUp /> },
          { label: "Pengeluaran", value: summary.keluar, color: "text-rose-600", icon: <FaArrowDown /> },
          { label: "Saldo Akhir", value: summary.saldoAkhir, color: "text-blue-600", icon: <FaCheckDouble /> },
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

      {/* Advanced Action Bar */}
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
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-black w-48 focus:ring-2 focus:ring-emerald-500/20"
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

      {/* Entry Buttons (Large) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        <button
          onClick={() => setShowModalIn(true)}
          className="flex items-center justify-center space-x-3 p-6 bg-white border-2 border-emerald-100 rounded-[32px] hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-all">
            <FaPlus />
          </div>
          <div className="text-left">
            <h4 className="text-base font-black text-slate-800 uppercase">Input Pemasukan</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">Catat penerimaan dana kas</p>
          </div>
        </button>
        <button
          onClick={() => setShowModalOut(true)}
          className="flex items-center justify-center space-x-3 p-6 bg-white border-2 border-rose-100 rounded-[32px] hover:border-rose-500 hover:bg-rose-50 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-all">
            <FaMinus />
          </div>
          <div className="text-left">
            <h4 className="text-base font-black text-slate-800 uppercase">Input Pengeluaran</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">Catat biaya & pengeluaran kas</p>
          </div>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 print:pb-2">
          <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center space-x-2">
            <FaFileExport className="text-emerald-500 no-print" />
            <span>Jurnal Transaksi - {months.find(m => m.value === monthFilter)?.label} {yearFilter}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase tracking-wider"
            >
              <FaFileExcel /> <span>Excel</span>
            </button>
            <button
              onClick={printLedger}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 uppercase tracking-wider"
            >
              <FaPrint /> <span>Cetak</span>
            </button>
            <div className="hidden sm:block w-px h-4 bg-slate-200 mx-1"></div>
            <span className="text-[9px] sm:text-[10px] font-black px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-400 uppercase tracking-widest">
              {filteredTransactions.length} Baris Data
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] sm:text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-3 sm:px-6 py-4">Tgl Transaksi</th>
                <th className="px-3 sm:px-6 py-4">No. Bukti / Keterangan</th>
                <th className="px-3 sm:px-6 py-4 text-right">Debet (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Kredit (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Saldo (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t, i) => (
                  <tr key={t.id || i} className={`hover:bg-slate-50/50 transition-all group ${t.isVirtual ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-500">{t.formattedDate}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className={`text-[10px] sm:text-sm font-black ${t.isVirtual ? 'text-amber-600' : 'text-slate-700'}`}>{t.nomorBukti || "-"}</div>
                      <div className="text-[9px] sm:text-xs text-slate-400 font-medium truncate max-w-[100px] sm:max-w-md">{t.keterangan}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-emerald-600">
                      {t.debet > 0 ? formatCurrency(t.debet) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-rose-600">
                      {t.kredit > 0 ? formatCurrency(t.kredit) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-black text-slate-800 bg-slate-50/30">
                      {formatCurrency(t.runningBalance)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center print:hidden">
                      {!t.isVirtual && (
                        <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><FaEdit size={14} /></button>
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><FaTrash size={14} /></button>
                        </div>
                      )}
                      {t.isVirtual && <span className="text-[10px] font-black text-amber-500 uppercase">System</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <FaInfoCircle className="text-slate-100 text-6xl mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Data transaksi tidak ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer - Total */}
            {!loading && filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-800 text-white">
                <tr className="font-black text-[10px] sm:text-sm">
                  <td colSpan="2" className="px-3 sm:px-6 py-5 uppercase tracking-wider">Total Transaksi Periode Ini</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.masuk)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.keluar)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right bg-emerald-600">{formatCurrency(summary.saldoAkhir)}</td>
                  <td className="print:hidden px-3 sm:px-6"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Input Pemasukan */}
      <AnimatePresence>
        {showModalIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModalIn(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-[95%] sm:w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 bg-emerald-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl backdrop-blur-md">
                    <FaPlus />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Input Pemasukan</h3>
                    <p className="text-emerald-100 text-[10px] sm:text-xs font-bold">Catat penerimaan dana kas baru</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModalIn(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitIn} className="p-6 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6">
                {/* Quick Action: Sesuai Target */}
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[32px] flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                      <FaCheckDouble />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-blue-800 uppercase tracking-tight">Generate Sesuai Target</h4>
                      <p className="text-[10px] text-blue-600 font-bold opacity-75">Otomatis buat setoran semua cabang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSesuaiTarget}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-md shadow-blue-100 uppercase tracking-widest"
                  >
                    Eksekusi
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal Transaksi</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="date"
                        required
                        value={formIn.tanggalTransaksi}
                        onChange={(e) => setFormIn({ ...formIn, tanggalTransaksi: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Jenis Penerimaan</label>
                    <div className="relative">
                      <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <select
                        required
                        value={formIn.jenisPenerimaan}
                        onChange={(e) => setFormIn({ ...formIn, jenisPenerimaan: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="Transfer">Transfer</option>
                        <option value="Tunai">Tunai</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pos Penerimaan</label>
                    <div className="relative">
                      <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <select
                        required
                        value={formIn.posPenerimaan}
                        onChange={(e) => setFormIn({ ...formIn, posPenerimaan: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="">Pilih Pos</option>
                        {posPenerimaanList.map(p => (
                          <option key={p.id} value={p.namaPosPenerimaan}>{p.namaPosPenerimaan}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                    <div className="relative">
                      <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <select
                        required
                        value={formIn.cabang}
                        onChange={(e) => setFormIn({ ...formIn, cabang: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="">Pilih Cabang</option>
                        {cabangList.map(c => (
                          <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Setoran Untuk Bulan</label>
                    <select
                      required
                      value={formIn.setoranBulan}
                      onChange={(e) => setFormIn({ ...formIn, setoranBulan: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all"
                    >
                      {months.map(m => <option key={m.value} value={m.label}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Setoran Untuk Tahun</label>
                    <select
                      required
                      value={formIn.setoranTahun}
                      onChange={(e) => setFormIn({ ...formIn, setoranTahun: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all"
                    >
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Nominal (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formIn.nominal}
                      onChange={(e) => setFormIn({ ...formIn, nominal: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-black text-xl text-emerald-600 transition-all"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
                    Terbilang: <span className="text-slate-600 uppercase">{terbilang(formIn.nominal)} {formIn.nominal > 0 ? "Rupiah" : ""}</span>
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Keterangan</label>
                  <div className="relative">
                    <FaAlignLeft className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      value={formIn.keterangan}
                      onChange={(e) => setFormIn({ ...formIn, keterangan: e.target.value })}
                      placeholder="Keterangan tambahan (mis: Iuran Sanduka anggota Mei 2024)"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium text-slate-700 h-24 resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalIn(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
                  >
                    <FaUndo /> <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center space-x-2 disabled:bg-slate-300"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaSave /> <span>Simpan Pemasukan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Input Pengeluaran */}
      <AnimatePresence>
        {showModalOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModalOut(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-[95%] sm:w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 bg-rose-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl backdrop-blur-md">
                    <FaMinus />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Input Pengeluaran</h3>
                    <p className="text-rose-100 text-[10px] sm:text-xs font-bold">Catat biaya & pengeluaran kas baru</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModalOut(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitOut} className="p-6 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal Transaksi</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                      <input
                        type="date"
                        required
                        value={formOut.tanggalTransaksi}
                        onChange={(e) => setFormOut({ ...formOut, tanggalTransaksi: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Jenis Pengeluaran</label>
                    <div className="relative">
                      <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                      <select
                        required
                        value={formOut.jenisPengeluaran}
                        onChange={(e) => setFormOut({ ...formOut, jenisPengeluaran: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="Tunai">Tunai</option>
                        <option value="Transfer">Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pos Pengeluaran</label>
                    <div className="relative">
                      <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                      <select
                        required
                        value={formOut.posPengeluaran}
                        onChange={(e) => setFormOut({ ...formOut, posPengeluaran: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="">Pilih Pos</option>
                        {posPengeluaranList.map(p => (
                          <option key={p.id} value={p.namaPosPengeluaran}>{p.namaPosPengeluaran}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                    <div className="relative">
                      <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                      <select
                        required
                        value={formOut.cabang}
                        onChange={(e) => setFormOut({ ...formOut, cabang: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                      >
                        <option value="">Pilih Cabang</option>
                        {cabangList.map(c => (
                          <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pengeluaran Untuk Bulan</label>
                    <select
                      required
                      value={formOut.pengeluaranBulan}
                      onChange={(e) => setFormOut({ ...formOut, pengeluaranBulan: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 transition-all"
                    >
                      {months.map(m => <option key={m.value} value={m.label}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pengeluaran Untuk Tahun</label>
                    <select
                      required
                      value={formOut.pengeluaranTahun}
                      onChange={(e) => setFormOut({ ...formOut, pengeluaranTahun: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold text-slate-700 transition-all"
                    >
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Nominal (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formOut.nominal}
                      onChange={(e) => setFormOut({ ...formOut, nominal: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-black text-xl text-rose-600 transition-all"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
                    Terbilang: <span className="text-slate-600 uppercase">{terbilang(formOut.nominal)} {formOut.nominal > 0 ? "Rupiah" : ""}</span>
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Keterangan</label>
                  <div className="relative">
                    <FaAlignLeft className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      value={formOut.keterangan}
                      onChange={(e) => setFormOut({ ...formOut, keterangan: e.target.value })}
                      placeholder="Keterangan tambahan (mis: Santunan duka Bpk. Fulan)"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-medium text-slate-700 h-24 resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalOut(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
                  >
                    <FaUndo /> <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all flex items-center justify-center space-x-2 disabled:bg-slate-300"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaSave /> <span>Simpan Pengeluaran</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Kelola Pos */}
      <AnimatePresence>
        {showModalPos && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModalPos(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-[95%] sm:w-full max-w-lg rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 sm:p-10 bg-slate-800 text-white relative">
                <h2 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 tracking-tighter uppercase">Kelola Pos Sanduka</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest opacity-80">Konfigurasi Kategori Transaksi</p>
                <button onClick={() => setShowModalPos(false)} className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2 hover:bg-white/10 rounded-full transition-all"><FaTimes /></button>
              </div>

              {/* Tabs */}
              <div className="px-4 sm:px-8 bg-slate-800 pb-6 sm:pb-10">
                <div className="p-1 sm:p-2 bg-slate-900/50 rounded-[24px] sm:rounded-[28px] flex items-center border border-white/10">
                  <button
                    onClick={() => setPosTab('penerimaan')}
                    className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[22px] text-[10px] sm:text-xs font-black transition-all ${posTab === 'penerimaan' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    <FaArrowUp /> <span>POS PENERIMAAN</span>
                  </button>
                  <button
                    onClick={() => setPosTab('pengeluaran')}
                    className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[22px] text-[10px] sm:text-xs font-black transition-all ${posTab === 'pengeluaran' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <FaArrowDown /> <span>POS PENGELUARAN</span>
                  </button>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block px-1">
                  Nama Pos {posTab === "penerimaan" ? "Penerimaan" : "Pengeluaran"} Baru
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <FaTag className={`absolute left-4 top-1/2 -translate-y-1/2 ${posTab === "penerimaan" ? 'text-emerald-500' : 'text-rose-500'}`} />
                    <input
                      type="text"
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      placeholder={`Contoh: ${posTab === "penerimaan" ? 'Donasi Penerimaan' : 'Biaya Perbaikan'}`}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    onClick={handleAddPos}
                    disabled={submitting || !newPosName}
                    className={`px-8 rounded-2xl font-black text-xs text-white transition-all shadow-lg disabled:opacity-50 disabled:shadow-none ${posTab === "penerimaan" ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'}`}
                  >
                    {submitting ? '...' : 'TAMBAH'}
                  </button>
                </div>
              </div>

              {/* List Section */}
              <div className="p-8 overflow-y-auto flex-1 space-y-3 bg-white">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Daftar Pos {posTab === "penerimaan" ? "Penerimaan" : "Pengeluaran"} Saat Ini</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                    {(posTab === "penerimaan" ? posPenerimaanList : posPengeluaranList).length} Total
                  </span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {(posTab === "penerimaan" ? posPenerimaanList : posPengeluaranList).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-slate-300 hover:bg-white transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${posTab === "penerimaan" ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className="font-bold text-slate-700">{item.namaPosPenerimaan || item.namaPosPengeluaran}</span>
                      </div>
                      {!item.isSystem && (
                        <button
                          onClick={() => handleDeletePos(item.id, posTab)}
                          className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {(posTab === "penerimaan" ? posPenerimaanList : posPengeluaranList).length === 0 && (
                    <div className="py-12 text-center">
                      <FaInfoCircle className="mx-auto text-slate-200 text-3xl mb-2" />
                      <p className="text-xs font-bold text-slate-400">Belum ada data pos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-500">
                  <FaInfoCircle size={12} />
                  <p className="text-[10px] font-bold italic tracking-tight uppercase">Pos bawaan sistem tidak dapat dihapus.</p>
                </div>
                <button
                  onClick={() => setShowModalPos(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-slate-300 transition-all uppercase tracking-widest"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !confirmModal.isLoading && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl ${confirmModal.type === 'danger' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-blue-500 text-white shadow-blue-200'}`}>
                {confirmModal.type === 'danger' ? <FaTrash /> : <FaCheckDouble />}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{confirmModal.title}</h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed mb-8">{confirmModal.message}</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmModal.onConfirm}
                  disabled={confirmModal.isLoading}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-2 ${confirmModal.type === 'danger' ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
                >
                  {confirmModal.isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Konfirmasi</span>
                  )}
                </button>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={confirmModal.isLoading}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KasSanduka;
