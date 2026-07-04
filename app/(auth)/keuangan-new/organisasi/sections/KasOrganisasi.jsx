"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  FaAlignLeft,
  FaUndo,
  FaUniversity,
  FaFileInvoice
} from "react-icons/fa";
import BackButton from "../../components/BackButton";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const KasOrganisasi = () => {
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
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i);

  // Modal States
  const [showModalIn, setShowModalIn] = useState(false);
  const [showModalOut, setShowModalOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editJenis, setEditJenis] = useState("");
  const [editForm, setEditForm] = useState({
    id: null,
    tanggalTransaksi: "",
    nomorBukti: "",
    jenisPenerimaan: "Transfer",
    jenisPegeluaran: "Tunai",
    posPenerimaan: "",
    posPengeluaran: "",
    cabang: "",
    setoranBulan: "",
    setoranTahun: new Date().getFullYear(),
    nominal: 0,
    keterangan: ""
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
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
    setoranBulan: months[new Date().getMonth()].value,
    setoranTahun: new Date().getFullYear(),
    nominal: 0,
    keterangan: ""
  });

  const [formOut, setFormOut] = useState({
    tanggalTransaksi: new Date().toISOString().split('T')[0],
    jenisPengeluaran: "Tunai",
    posPengeluaran: "",
    cabang: "",
    setoranBulan: months[new Date().getMonth()].value,
    setoranTahun: new Date().getFullYear(),
    nominal: 0,
    keterangan: ""
  });

  const fetchAuxData = async () => {
    try {
      const [resPosIn, resPosOut, resCabang] = await Promise.all([
        GlobalApi.getPosPenerimaanUmum(),
        GlobalApi.getPosPengeluaranUmum(),
        GlobalApi.getCabang()
      ]);
      setPosPenerimaanList((resPosIn || []).sort((a, b) => a.namaPosPenerimaan.localeCompare(b.namaPosPenerimaan)));
      setPosPengeluaranList((resPosOut || []).sort((a, b) => a.namaPosPengeluaran.localeCompare(b.namaPosPengeluaran)));
      setCabangList((resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan)));
    } catch (error) {
      console.error("Error fetching aux data:", error);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const targetBulan = Number(monthFilter);
      const targetTahun = Number(yearFilter);

      // 1. Fetch current month data
      const currentMonthData = await GlobalApi.getTableUmum(targetBulan, targetTahun);

      // Backend already includes SALDO AWAL with opening balance as first entry
      let processed = [...currentMonthData];

      // 2. Ensure Saldo Awal is always the first row
      processed.sort((a, b) => {
        const aIsSaldo = String(a.nomorBukti || "").toLowerCase().includes("saldo awal");
        const bIsSaldo = String(b.nomorBukti || "").toLowerCase().includes("saldo awal");
        if (aIsSaldo && !bIsSaldo) return -1;
        if (!aIsSaldo && bIsSaldo) return 1;
        return 0;
      });

      // 3. Calculate totals for summary (skip saldo awal)
      let totalMasuk = 0;
      let totalKeluar = 0;

      const transactionsWithBalance = processed.map(item => {
        const d = item.debet || 0;
        const k = item.kredit || 0;
        const isSaldoAwal = String(item.nomorBukti || "").toLowerCase().includes("saldo awal");

        if (!isSaldoAwal) {
          totalMasuk += d;
          totalKeluar += k;
        }

        return {
          ...item,
          isVirtual: isSaldoAwal && !item.id,
          runningBalance: item.saldo || 0,
          formattedDate: Array.isArray(item.tanggalTransaksi)
            ? `${String(item.tanggalTransaksi[2]).padStart(2, '0')}-${String(item.tanggalTransaksi[1]).padStart(2, '0')}-${item.tanggalTransaksi[0]}`
            : new Date(item.tanggalTransaksi).toLocaleDateString("id-ID")
        };
      });

      const saldoAwal = processed.length > 0 ? (processed[0].saldo || 0) : 0;
      const saldoAkhir = transactionsWithBalance.length > 0
        ? (transactionsWithBalance[transactionsWithBalance.length - 1].runningBalance || 0)
        : 0;

      setTransactions(transactionsWithBalance);
      setSummary({
        saldoAwal,
        masuk: totalMasuk,
        keluar: totalKeluar,
        saldoAkhir
      });

    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Gagal memuat data buku kas.");
    } finally {
      setLoading(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchData();
    fetchAuxData();
  }, [fetchData]);

  const handleAddPos = async () => {
    if (!newPosName) {
      toast.error("Nama pos tidak boleh kosong!");
      return;
    }
    setSubmitting(true);
    try {
      if (posTab === "penerimaan") {
        await GlobalApi.createPosPenerimaanUmum({ namaPosPenerimaan: newPosName });
      } else {
        await GlobalApi.createPosPengeluaranUmum({ namaPosPengeluaran: newPosName });
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
            await GlobalApi.deletePosPenerimaanUmum(id);
          } else {
            await GlobalApi.deletePosPengeluaranUmum(id);
          }
          toast.success("Pos berhasil dihapus!");
          fetchAuxData();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Error delete pos:", error);
          toast.error(error.message || "Gagal menghapus pos.");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteTransaksi = async (id, jenis) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Transaksi",
      message: "Apakah Anda yakin ingin menghapus transaksi ini?",
      type: "danger",
      onConfirm: async () => {
        try {
          if (jenis === "PEMASUKAN") {
            await GlobalApi.deletePemasukanUmum(id);
          } else {
            await GlobalApi.deletePengeluaranUmum(id);
          }
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

  const handleEditClick = async (id, jenis, rowData) => {
    try {
      const isSaldoAwal = String(rowData?.nomorBukti || "").toLowerCase().includes("saldo awal");
      const effectiveJenis = isSaldoAwal ? "PEMASUKAN" : jenis;
      setEditJenis(effectiveJenis);
      let data;
      if (id && !isSaldoAwal) {
        if (jenis === "PEMASUKAN") {
          data = await GlobalApi.getPemasukanUmumById(id);
        } else {
          data = await GlobalApi.getPengeluaranUmumById(id);
        }
      }
      const tanggal = data
        ? (Array.isArray(data.tanggalTransaksi)
          ? `${data.tanggalTransaksi[0]}-${String(data.tanggalTransaksi[1]).padStart(2, "0")}-${String(data.tanggalTransaksi[2]).padStart(2, "0")}`
          : data.tanggalTransaksi.slice(0, 10))
        : `${yearFilter}-${monthFilter}-01`;

      setEditForm({
        id: id,
        tanggalTransaksi: tanggal,
        nomorBukti: data?.nomorBukti || rowData?.nomorBukti || "",
        jenisPenerimaan: data?.jenisPenerimaan || "Transfer",
        jenisPegeluaran: data?.jenisPegeluaran || "Tunai",
        posPenerimaan: data?.posPenerimaan || "",
        posPengeluaran: data?.posPengeluaran || "",
        cabang: data?.cabang || "",
        setoranBulan: data?.setoranBulan || Number(monthFilter),
        setoranTahun: data?.setoranTahun || Number(yearFilter),
        nominal: data?.nominal || rowData?.debet || 0,
        keterangan: data?.keterangan || rowData?.keterangan || ""
      });
      setShowEditModal(true);
    } catch (error) {
      toast.error("Gagal memuat data transaksi.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editForm.id) {
        if (editJenis === "PEMASUKAN") {
          await GlobalApi.updatePemasukanUmum(editForm.id, {
            tanggalTransaksi: editForm.tanggalTransaksi,
            posPenerimaan: editForm.posPenerimaan,
            setoranBulan: Number(editForm.setoranBulan),
            setoranTahun: Number(editForm.setoranTahun),
            jenisPenerimaan: editForm.jenisPenerimaan,
            cabang: editForm.cabang,
            nominal: Number(editForm.nominal),
            keterangan: editForm.keterangan,
          });
        } else {
          await GlobalApi.updatePengeluaranUmum(editForm.id, {
            tanggalTransaksi: editForm.tanggalTransaksi,
            posPengeluaran: editForm.posPengeluaran,
            setoranBulan: Number(editForm.setoranBulan),
            setoranTahun: Number(editForm.setoranTahun),
            jenisPegeluaran: editForm.jenisPegeluaran,
            cabang: editForm.cabang,
            nominal: Number(editForm.nominal),
            keterangan: editForm.keterangan,
          });
        }
        toast.success("Transaksi berhasil diperbarui!");
      } else {
        await GlobalApi.createPemasukanUmum({
          tanggalTransaksi: editForm.tanggalTransaksi,
          posPenerimaan: editForm.posPenerimaan || "Lainnya",
          setoranBulan: Number(editForm.setoranBulan),
          setoranTahun: Number(editForm.setoranTahun),
          jenisPenerimaan: editForm.jenisPenerimaan,
          cabang: editForm.cabang || "Umum",
          nominal: Number(editForm.nominal),
          keterangan: editForm.keterangan,
          nomorBukti: "SALDO AWAL ORGANISASI",
        });
        toast.success("Saldo awal berhasil disimpan!");
      }
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

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
      XLSX.utils.book_append_sheet(wb, ws, "Buku Kas Organisasi");
      XLSX.writeFile(wb, `Buku_Kas_Organisasi_${monthFilter}_${yearFilter}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleSesuaiTarget = async () => {
    const targetDate = showModalIn ? formIn.tanggalTransaksi : new Date().toISOString().split('T')[0];

    setConfirmModal({
      isOpen: true,
      title: "Generate Sesuai Target",
      message: `Apakah Anda yakin ingin men-generate data setoran sesuai target untuk tanggal ${targetDate}? Semua cabang akan tercatat secara otomatis ke Kas Organisasi.`,
      type: "info",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setSubmitting(true);
        try {
          await GlobalApi.postSesuaiTargetUmum(targetDate);
          toast.success("Data sesuai target berhasil dibuat!");
          if (showModalIn) setShowModalIn(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (error) {
          console.error("Error generating target:", error);
          toast.error("Gagal men-generate data.");
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
    if (!formIn.posPenerimaan || !formIn.setoranBulan || !formIn.setoranTahun || formIn.nominal <= 0) {
      toast.error("Harap isi semua field yang wajib!");
      return;
    }
    setSubmitting(true);
    try {
      await GlobalApi.createPemasukanUmum({
        ...formIn,
        setoranBulan: Number(formIn.setoranBulan),
        setoranTahun: Number(formIn.setoranTahun),
        nominal: Number(formIn.nominal),
      });
      toast.success("Pemasukan kas berhasil dicatat!");
      setShowModalIn(false);
      resetFormIn();
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
    if (!formOut.posPengeluaran || !formOut.setoranBulan || !formOut.setoranTahun || formOut.nominal <= 0) {
      toast.error("Harap isi semua field yang wajib!");
      return;
    }
    setSubmitting(true);
    try {
      await GlobalApi.createPengeluaranUmum({
        tanggalTransaksi: formOut.tanggalTransaksi,
        posPengeluaran: formOut.posPengeluaran,
        setoranBulan: Number(formOut.setoranBulan),
        setoranTahun: Number(formOut.setoranTahun),
        jenisPegeluaran: formOut.jenisPengeluaran,
        cabang: formOut.cabang,
        nominal: Number(formOut.nominal),
        keterangan: formOut.keterangan,
      });
      toast.success("Pengeluaran kas berhasil dicatat!");
      setShowModalOut(false);
      resetFormOut();
      fetchData();
    } catch (error) {
      console.error("Error post pengeluaran:", error);
      toast.error("Gagal mencatat pengeluaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormIn = () => {
    setFormIn({
      tanggalTransaksi: new Date().toISOString().split('T')[0],
      jenisPenerimaan: "Transfer",
      posPenerimaan: "",
      cabang: "",
      setoranBulan: months[new Date().getMonth()].value,
      setoranTahun: new Date().getFullYear(),
      nominal: 0,
      keterangan: ""
    });
  };

  const resetFormOut = () => {
    setFormOut({
      tanggalTransaksi: new Date().toISOString().split('T')[0],
      jenisPengeluaran: "Tunai",
      posPengeluaran: "",
      cabang: "",
      setoranBulan: months[new Date().getMonth()].value,
      setoranTahun: new Date().getFullYear(),
      nominal: 0,
      keterangan: ""
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Page Title & Module Info */}
      <div className="flex items-center gap-3 mb-2">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buku Kas Organisasi (Umum)</h1>
          <p className="text-slate-400 text-sm font-medium italic">Kelola arus kas operasional organisasi</p>
        </div>
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {[
          { label: `Saldo Awal ${months.find(m => m.value === monthFilter)?.label}`, value: summary.saldoAwal, color: "text-slate-600", icon: <FaWallet /> },
          { label: "Pemasukan", value: summary.masuk, color: "text-emerald-600", icon: <FaArrowUp /> },
          { label: "Pengeluaran", value: summary.keluar, color: "text-rose-600", icon: <FaArrowDown /> },
          { label: "Saldo Akhir", value: summary.saldoAkhir, color: "text-blue-600", icon: <FaCheckDouble /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className={`text-base ${item.color} opacity-50`}>{item.icon}</span>
            </div>
            <p className={`text-xl font-bold ${item.color}`}>
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
                className="bg-transparent text-sm font-bold px-3 py-2 outline-none text-slate-600"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="bg-transparent text-sm font-bold px-3 py-2 outline-none text-slate-600"
              >
                {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold w-48 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowModalPos(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
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
            <h4 className="text-base font-bold text-slate-800 uppercase">Input Pemasukan Umum</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">Catat penerimaan organisasi</p>
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
            <h4 className="text-base font-bold text-slate-800 uppercase">Input Pengeluaran Umum</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">Catat pengeluaran organisasi</p>
          </div>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0">
        <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30 print:pb-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center space-x-2">
            <FaUniversity className="text-blue-500 no-print" />
            <span>Jurnal Transaksi Organisasi - {months.find(m => m.value === monthFilter)?.label} {yearFilter}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] sm:text-[10px] font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase tracking-wider"
            >
              <FaFileExcel /> <span>Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] sm:text-[10px] font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 uppercase tracking-wider"
            >
              <FaPrint /> <span>Cetak</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-3 sm:px-6 py-4 text-center">No</th>
                <th className="px-3 sm:px-6 py-4">Tgl Transaksi</th>
                <th className="px-3 sm:px-6 py-4">No. Bukti</th>
                <th className="px-3 sm:px-6 py-4">Keterangan</th>
                <th className="px-3 sm:px-6 py-4 text-right">Debet (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Kredit (Rp)</th>
                <th className="px-3 sm:px-6 py-4 text-right">Saldo (Rp)</th>
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
                  <tr key={t.id || i} className={`hover:bg-slate-50/50 transition-all group ${t.isVirtual ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-500 text-center">{i + 1}</td>
                    <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm font-bold text-slate-500">{t.formattedDate}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className={`text-[10px] sm:text-sm font-bold ${t.isVirtual ? 'text-amber-600' : 'text-slate-700'}`}>{t.nomorBukti || "-"}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-[9px] sm:text-xs text-slate-400 font-medium truncate max-w-[100px] sm:max-w-md">{t.keterangan}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-bold text-emerald-600">
                      {t.debet > 0 ? formatCurrency(t.debet) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-bold text-rose-600">
                      {t.kredit > 0 ? formatCurrency(t.kredit) : "0"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right text-[10px] sm:text-sm font-bold text-slate-800 bg-slate-50/30">
                      {formatCurrency(t.runningBalance)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => handleEditClick(t.id, t.jenis, t)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all text-xs" title="Edit"><FaEdit /></button>
                        {t.id && <button onClick={() => handleDeleteTransaksi(t.id, t.jenis)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all text-xs" title="Hapus"><FaTrash /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <FaInfoCircle className="text-slate-100 text-6xl mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Data transaksi tidak ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
            {!loading && filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-800 text-white">
                <tr className="font-bold text-[10px] sm:text-sm">
                  <td colSpan="5" className="px-3 sm:px-6 py-5 uppercase tracking-wider">Total Transaksi Organisasi</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.masuk)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right">{formatCurrency(summary.keluar)}</td>
                  <td className="px-3 sm:px-6 py-5 text-right bg-blue-600">{formatCurrency(summary.saldoAkhir)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modals are omitted here for brevity but should follow same pattern as KasSanduka */}
      {/* For now, focus on the main UI as requested */}
      <AnimatePresence>
        {showModalIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalIn(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 bg-emerald-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md"><FaPlus /></div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Pemasukan Organisasi</h3>
                    <p className="text-emerald-100 text-xs font-bold">Catat penerimaan dana operasional</p>
                  </div>
                </div>
                <button onClick={() => setShowModalIn(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmitIn} className="p-8 overflow-y-auto space-y-6">
                {/* Quick Action */}
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[32px] flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-200"><FaCheckDouble /></div>
                    <div><h4 className="text-xs font-bold text-blue-800 uppercase tracking-tight">Setoran Cabang</h4><p className="text-[10px] text-blue-600 font-bold opacity-75">Generate otomatis dari target iuran</p></div>
                  </div>
                  <button type="button" onClick={handleSesuaiTarget} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold hover:bg-blue-700 transition-all shadow-md uppercase tracking-widest">Generate</button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                    <input type="date" required value={formIn.tanggalTransaksi} onChange={(e) => setFormIn({ ...formIn, tanggalTransaksi: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Metode</label>
                    <select required value={formIn.jenisPenerimaan} onChange={(e) => setFormIn({ ...formIn, jenisPenerimaan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="Transfer">Transfer</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Bulan Pembayaran</label>
                    <select required value={formIn.setoranBulan} onChange={(e) => setFormIn({ ...formIn, setoranBulan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tahun Pembayaran</label>
                    <select required value={formIn.setoranTahun} onChange={(e) => setFormIn({ ...formIn, setoranTahun: Number(e.target.value) })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Pos</label>
                    <select required value={formIn.posPenerimaan} onChange={(e) => setFormIn({ ...formIn, posPenerimaan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Pos</option>
                      {posPenerimaanList.map(p => <option key={p.id} value={p.namaPosPenerimaan}>{p.namaPosPenerimaan}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                    <select value={formIn.cabang} onChange={(e) => setFormIn({ ...formIn, cabang: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Cabang</option>
                      {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Nominal</label>
                  <input type="number" required value={formIn.nominal} onChange={(e) => setFormIn({ ...formIn, nominal: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl text-emerald-600" />
                </div>
                <textarea value={formIn.keterangan} onChange={(e) => setFormIn({ ...formIn, keterangan: e.target.value })} placeholder="Keterangan..." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 h-24 resize-none" />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowModalIn(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-emerald-100">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModalOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalOut(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 bg-rose-500 text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md"><FaMinus /></div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Pengeluaran Organisasi</h3>
                    <p className="text-rose-100 text-xs font-bold">Catat biaya operasional baru</p>
                  </div>
                </div>
                <button onClick={() => setShowModalOut(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmitOut} className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                    <input type="date" required value={formOut.tanggalTransaksi} onChange={(e) => setFormOut({ ...formOut, tanggalTransaksi: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Metode</label>
                    <select required value={formOut.jenisPengeluaran} onChange={(e) => setFormOut({ ...formOut, jenisPengeluaran: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="Tunai">Tunai</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Bulan Pembayaran</label>
                    <select required value={formOut.setoranBulan} onChange={(e) => setFormOut({ ...formOut, setoranBulan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tahun Pembayaran</label>
                    <select required value={formOut.setoranTahun} onChange={(e) => setFormOut({ ...formOut, setoranTahun: Number(e.target.value) })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Pos</label>
                    <select required value={formOut.posPengeluaran} onChange={(e) => setFormOut({ ...formOut, posPengeluaran: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Pos</option>
                      {posPengeluaranList.map(p => <option key={p.id} value={p.namaPosPengeluaran}>{p.namaPosPengeluaran}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                    <select value={formOut.cabang} onChange={(e) => setFormOut({ ...formOut, cabang: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Cabang</option>
                      {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Nominal</label>
                  <input type="number" required value={formOut.nominal} onChange={(e) => setFormOut({ ...formOut, nominal: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl text-rose-600" />
                </div>
                <textarea value={formOut.keterangan} onChange={(e) => setFormOut({ ...formOut, keterangan: e.target.value })} placeholder="Keterangan..." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 h-24 resize-none" />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowModalOut(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-rose-100">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className={`p-8 text-white flex justify-between items-center ${editJenis === "PEMASUKAN" ? "bg-emerald-500" : "bg-rose-500"}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md"><FaEdit /></div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{editForm.id ? "Edit " : "Tambah "}{editJenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}</h3>
                    <p className="text-white/70 text-xs font-bold">{editForm.nomorBukti ? "No. Bukti: " + editForm.nomorBukti : "Saldo Awal Organisasi"}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><FaTimes /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                    <input type="date" required value={editForm.tanggalTransaksi} onChange={(e) => setEditForm({ ...editForm, tanggalTransaksi: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Metode</label>
                    <select value={editJenis === "PEMASUKAN" ? editForm.jenisPenerimaan : editForm.jenisPegeluaran} onChange={(e) => {
                      if (editJenis === "PEMASUKAN") setEditForm({ ...editForm, jenisPenerimaan: e.target.value });
                      else setEditForm({ ...editForm, jenisPegeluaran: e.target.value });
                    }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="Transfer">Transfer</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Bulan Pembayaran</label>
                    <select required value={editForm.setoranBulan} onChange={(e) => setEditForm({ ...editForm, setoranBulan: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Tahun Pembayaran</label>
                    <select required value={editForm.setoranTahun} onChange={(e) => setEditForm({ ...editForm, setoranTahun: Number(e.target.value) })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      {yearOptions.map((y) => (<option key={y} value={y}>{y}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Pos</label>
                    <select required value={editJenis === "PEMASUKAN" ? editForm.posPenerimaan : editForm.posPengeluaran} onChange={(e) => {
                      if (editJenis === "PEMASUKAN") setEditForm({ ...editForm, posPenerimaan: e.target.value });
                      else setEditForm({ ...editForm, posPengeluaran: e.target.value });
                    }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Pos</option>
                      {(editJenis === "PEMASUKAN" ? posPenerimaanList : posPengeluaranList).map(p => (
                        <option key={p.id} value={p.namaPosPenerimaan || p.namaPosPengeluaran}>{p.namaPosPenerimaan || p.namaPosPengeluaran}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Cabang</label>
                    <select value={editForm.cabang} onChange={(e) => setEditForm({ ...editForm, cabang: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Pilih Cabang</option>
                      {cabangList.map(c => <option key={c.id} value={c.kecamatan}>{c.kecamatan}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Nominal</label>
                  <input type="number" required value={editForm.nominal} onChange={(e) => setEditForm({ ...editForm, nominal: Number(e.target.value) })} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl text-slate-700" />
                </div>
                <textarea value={editForm.keterangan} onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })} placeholder="Keterangan..." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 h-24 resize-none" />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-blue-100">Simpan Perubahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      <AnimatePresence>
        {showModalPos && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModalPos(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-tight">Kelola Kategori Pos</h3>
                <button onClick={() => setShowModalPos(false)}><FaTimes /></button>
              </div>
              <div className="flex p-4 bg-slate-100 space-x-2">
                <button onClick={() => setPosTab("penerimaan")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${posTab === "penerimaan" ? "bg-emerald-500 text-white" : "text-slate-400"}`}>Penerimaan</button>
                <button onClick={() => setPosTab("pengeluaran")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${posTab === "pengeluaran" ? "bg-rose-500 text-white" : "text-slate-400"}`}>Pengeluaran</button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="flex gap-2">
                  <input type="text" placeholder="Nama pos baru..." value={newPosName} onChange={(e) => setNewPosName(e.target.value)} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold" />
                  <button onClick={handleAddPos} disabled={submitting} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold">Tambah</button>
                </div>
                <div className="space-y-2">
                  {(posTab === "penerimaan" ? posPenerimaanList : posPengeluaranList).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{p.namaPosPenerimaan || p.namaPosPengeluaran}</span>
                      <button onClick={() => handleDeletePos(p.id, posTab)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"><FaTrash size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center">
              <div className={`w-16 h-16 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl ${confirmModal.type === "danger" ? "bg-rose-100 text-rose-500" : "bg-blue-100 text-blue-500"}`}>
                <FaInfoCircle />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase">{confirmModal.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs">Batal</button>
                <button onClick={confirmModal.onConfirm} disabled={confirmModal.isLoading} className={`flex-1 py-3 rounded-2xl font-bold uppercase text-xs text-white shadow-lg ${confirmModal.type === "danger" ? "bg-rose-500 shadow-rose-100" : "bg-blue-500 shadow-blue-100"}`}>
                  {confirmModal.isLoading ? "Loading..." : "Ya, Lanjutkan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KasOrganisasi;
