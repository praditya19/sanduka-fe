"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FaCalendarAlt,
  FaSave,
  FaSearch,
  FaCog,
  FaCalculator,
  FaCalendarCheck,
  FaBoxOpen,
  FaUsers,
  FaEdit,
  FaTrash,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";

const KalenderSection = () => {
  const [besaran, setBesaran] = useState({
    provinsi: 0,
    kabupaten: 0,
    cabang: 0,
  });
  const [showConfig, setShowConfig] = useState(false);
  const [loadingBesaran, setLoadingBesaran] = useState(false);

  const [selectedCabang, setSelectedCabang] = useState("");
  const [jumlahPesanan, setJumlahPesanan] = useState("0");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({
    cabang: "",
    jumlah: 0,
    bulan: "",
    tahun: new Date().getFullYear(),
  });
  const [loadingAction, setLoadingAction] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const totalPerUnit = besaran.provinsi + besaran.kabupaten + besaran.cabang;
  const totalAkhir = totalPerUnit * jumlahPesanan;
  const setorProvinsi = besaran.provinsi * jumlahPesanan;
  const bagianKabupaten = besaran.kabupaten * jumlahPesanan;
  const bagianCabang = besaran.cabang * jumlahPesanan;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(1), // Kalender ID = 1
      ]);
      setBulanList(resBulan.data || []);
      setCabangList((resCabang.data || []).sort((a, b) => (a.kecamatan || "").localeCompare(b.kecamatan || "")));
      if (resIuran) {
        setBesaran({
          provinsi: parseInt(resIuran.propinsi) || 0,
          kabupaten: parseInt(resIuran.kabupaten) || 0,
          cabang: parseInt(resIuran.cabang) || 0,
        });
      }
      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth])
        setSelectedMonth(resBulan.data[currentMonth].namaBulan);
    } catch (error) {
      console.error("Error fetching Kalender data:", error);
    }
  };

  const fetchTableData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const data = await GlobalApi.getTableKalender(
        selectedMonth,
        selectedYear,
        [],
      );

      const bulanObj = bulanList.find((b) => b.namaBulan === selectedMonth);
      const monthNumber = bulanObj ? bulanObj.id : new Date().getMonth() + 1;

      const balancingData = await GlobalApi.getTransaksiBankBalancing(
        "",
        null,
        selectedYear,
        monthNumber,
        null,
        null,
      );

      const getTransferCabang = (cabangName, balancingData) => {
        const parseCurrency = (val) => {
          if (!val) return 0;
          const cleaned = val
            .toString()
            .replace(/[^0-9,-]/g, "")
            .replace(",", ".");
          return parseFloat(cleaned) || 0;
        };

        return balancingData.reduce((total, item) => {
          const cabangMatch =
            (item.cabang || "").toLowerCase() === cabangName.toLowerCase();

          const isSukses = item.keterangan === "Sukses";

          if (cabangMatch && isSukses) {
            return total + parseCurrency(item.potongan);
          }

          return total;
        }, 0);
      };

      const mappedData = (data || []).map((item) => {
        const jumlah = parseInt(item.jumlah) || 0;

        const peruntukanProvinsi = jumlah * (besaran.provinsi || 0);
        const peruntukanKabupaten = jumlah * (besaran.kabupaten || 0);
        const peruntukanCabang = jumlah * (besaran.cabang || 0);

        const tambahanCabang = getTambahanCabang(item.cabang, balancingData);

        const totalCabang = peruntukanCabang + tambahanCabang;

        const transfer = getTransferCabang(item.cabang, balancingData);

        const kurang = totalCabang - transfer;

        return {
          ...item,
          peruntukanProvinsi,
          peruntukanKabupaten,
          peruntukanCabang,
          tambahanCabang,
          totalCabang,
          transfer,
          kurang,
        };
      });

      setTableData(mappedData);
    } catch (error) {
      console.error("Error fetching Kalender table:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear, besaran, bulanList]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const getTambahanCabang = (cabangName, balancingData) => {
    const group = { manualByNpa: {} };

    const parseCurrency = (val) => {
      if (!val) return 0;
      const cleaned = val
        .toString()
        .replace(/[^0-9,-]/g, "")
        .replace(",", ".");
      return parseFloat(cleaned) || 0;
    };

    const bulanObj = bulanList.find((b) => b.namaBulan === selectedMonth);
    const selectedPeriod = `${selectedYear}-${String(bulanObj?.id || "").padStart(2, "0")}`;

    balancingData.forEach((item) => {
      if ((item.cabang || "").toLowerCase() !== cabangName.toLowerCase())
        return;
      if (!item.npa) return;

      let itemDate = item.tagihanUntukBulan || item.tagihan_untuk_bulan || "";
      if (Array.isArray(itemDate) && itemDate.length >= 2) {
        itemDate = `${itemDate[0]}-${String(itemDate[1]).padStart(2, "0")}`;
      }

      if (itemDate && !itemDate.toString().includes(selectedPeriod)) return;

      const mKalender = parseCurrency(
        item.manualKalender || item.manual_Kalender,
      );

      const currentManual = mKalender;

      if (
        !group.manualByNpa[item.npa] ||
        currentManual > group.manualByNpa[item.npa]
      ) {
        group.manualByNpa[item.npa] = currentManual;
      }
    });

    return Object.values(group.manualByNpa).reduce((sum, val) => sum + val, 0);
  };

  const handleSaveBesaran = async () => {
    setLoadingBesaran(true);
    try {
      const payload = {
        pb: "",
        propinsi: besaran.provinsi,
        kabupaten: besaran.kabupaten,
        cabang: besaran.cabang,
        sanduka: "",
        iuran: "KALENDER",
      };
      await GlobalApi.updateIuranData(1, payload);
      toast.success("Besaran Kalender diperbarui!");
      setShowConfig(false);
    } catch (error) {
      toast.error("Gagal memperbarui besaran.");
    } finally {
      setLoadingBesaran(false);
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();

    const jumlah = parseInt(jumlahPesanan, 10) || 0;

    if (!selectedCabang || !jumlahPesanan) {
      toast.error("Pilih Cabang dan Jumlah Pesanan!");
      return;
    }
    try {
      const payload = {
        cabang: selectedCabang,
        jumlah: jumlahPesanan,
        bulan: selectedMonth,
        tahun: selectedYear,
        perolehanKabupaten: bagianKabupaten,
        perolehanCabang: bagianCabang,
      };
      await GlobalApi.createTargetKalender(payload);
      toast.success(`Kalender ${selectedCabang} berhasil disimpan!`);
      fetchTableData();
      setJumlahPesanan("0");
    } catch (error) {
      toast.error("Gagal menyimpan data Kalender.");
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row.id);
    setEditData({
      cabang: row.cabang,
      jumlah: row.jumlah,
      bulan: row.bulan,
      tahun: row.tahun,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (
      !editData.cabang ||
      !editData.jumlah ||
      !editData.bulan ||
      !editData.tahun
    ) {
      toast.error("Semua field harus diisi!");
      return;
    }
    setLoadingAction(true);
    try {
      const payload = {
        cabang: editData.cabang,
        jumlah: editData.jumlah,
        bulan: editData.bulan,
        tahun: editData.tahun,
      };
      await GlobalApi.updateKalender(editingRow, payload);
      toast.success("Data Kalender berhasil diperbarui!");
      fetchTableData();
      setShowEditModal(false);
      setEditingRow(null);
      setEditData({
        cabang: "",
        jumlah: 0,
        bulan: "",
        tahun: new Date().getFullYear(),
      });
    } catch (error) {
      toast.error("Gagal memperbarui data Kalender.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    setLoadingAction(true);
    try {
      await GlobalApi.deleteKalender(id);
      toast.success("Data Kalender berhasil dihapus!");
      fetchTableData();
    } catch (error) {
      toast.error("Gagal menghapus data Kalender.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownloadExcel = () => {
    try {
      const filteredData = tableData.filter((r) =>
        r.cabang?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filteredData.length === 0) {
        toast.error("Tidak ada data untuk diunduh!");
        return;
      }

      const excelData = filteredData.map((row, index) => ({
        No: index + 1,
        "Cabang/Khusus": row.cabang,
        "Total Pesanan": row.jumlah,
        "Peruntukan Provinsi": row.peruntukanProvinsi,
        "Peruntukan Kabupaten": row.peruntukanKabupaten,
        "Peruntukan Cabang": row.peruntukanCabang,
        "Tambahan Cabang": row.tambahanCabang,
        "Total Cabang": row.totalCabang,
        Transfer: row.transfer,
        Kurang: row.kurang,
        "Setoran Tunai": "-",
        Selisih: "-",
      }));

      import("xlsx").then((XLSX) => {
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kalender");
        worksheet["!cols"] = [
          { wch: 5 },
          { wch: 20 },
          { wch: 15 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 16 },
          { wch: 15 },
          { wch: 12 },
          { wch: 12 },
          { wch: 15 },
          { wch: 12 },
        ];

        XLSX.writeFile(
          workbook,
          `Kalender_${selectedMonth}_${selectedYear}.xlsx`,
        );
        toast.success("File Excel berhasil diunduh!");
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Gagal mengunduh file Excel.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const filteredData = tableData.filter((r) =>
        r.cabang?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filteredData.length === 0) {
        toast.error("Tidak ada data untuk diunduh!");
        return;
      }

      const jsPDFModule = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDFModule.jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.text("Laporan Distribusi Kalender", pageWidth / 2, 15, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.text(`Periode: ${selectedMonth} ${selectedYear}`, pageWidth / 2, 25, {
        align: "center",
      });

      const tableBody = filteredData.map((row, index) => [
        index + 1,
        row.cabang,
        row.jumlah,
        formatCurrency(row.peruntukanProvinsi),
        formatCurrency(row.peruntukanKabupaten),
        formatCurrency(row.peruntukanCabang),
        formatCurrency(row.tambahanCabang),
        formatCurrency(row.totalCabang),
        formatCurrency(row.transfer),
        formatCurrency(row.kurang),
      ]);

      autoTable(doc, {
        head: [
          [
            "No",
            "Cabang",
            "Total",
            "Provinsi",
            "Kabupaten",
            "Cabang",
            "Tambahan",
            "Total Cab",
            "Transfer",
            "Kurang",
          ],
        ],

        body: tableBody,

        startY: 35,

        theme: "grid",

        styles: {
          fontSize: 7,
          cellPadding: 2,
          valign: "middle",
        },

        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          halign: "center",
          fontStyle: "bold",
        },

        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "left", cellWidth: 30 },
          2: { halign: "center", cellWidth: 18 },

          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
          7: { halign: "right" },
          8: { halign: "right" },
          9: { halign: "right" },
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },

        didParseCell: function (data) {
          data.cell.styles.overflow = "linebreak";
        },
      });

      doc.save(`Kalender_${selectedMonth}_${selectedYear}.pdf`);
      toast.success("File PDF berhasil diunduh!");
    } catch (error) {
      console.error("Error PDF:", error);
      toast.error("Gagal membuat PDF");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />
      <div className="bg-amber-500 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-black">Distribusi Kalender</h2>
            <p className="text-amber-100 text-xs font-medium">
              Manajemen stok dan perolehan kalender tahunan
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all active:scale-95"
        >
          <FaCog />
        </button>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Top Section: Configuration (Integrated) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                <FaCalculator className="text-base" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  Konfigurasi Harga Kalender
                </h3>
                <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest">
                  Parameter Harga Per Unit
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchInitialData()}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm"
            >
              Reset Default
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Porsi Provinsi", key: "provinsi" },
                { label: "Porsi Kabupaten", key: "kabupaten" },
                { label: "Porsi Cabang", key: "cabang" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                      <span className="text-slate-300 font-black text-sm">
                        Rp
                      </span>
                    </div>
                    <input
                      type="number"
                      value={besaran[field.key]}
                      onChange={(e) =>
                        setBesaran({
                          ...besaran,
                          [field.key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-amber-500 outline-none font-black text-slate-700 transition-all text-base group-hover:bg-slate-100/50 shadow-inner"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Card Total - kiri */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 px-4 py-3 rounded-2xl border border-amber-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
                    Total Konfigurasi Kalender
                  </p>
                  <span className="text-xl font-bold text-amber-600">
                    {formatCurrency(totalPerUnit)}
                  </span>
                </div>

                {/* Tombol Simpan - kanan */}
                <button
                  onClick={handleSaveBesaran}
                  disabled={loadingBesaran}
                  className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
                >
                  {loadingBesaran ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaSave className="text-xs" />
                  )}
                  <span className="text-base font-semibold tracking-tight">
                    Simpan Konfigurasi
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Laporan & Input */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  Distribusi & Monitoring
                </h3>
                <p className="text-slate-400 text-xs font-medium">
                  Manajemen distribusi kalender tahunan
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Summary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Setor Provinsi",
                  val: setorProvinsi,
                  color: "bg-amber-600",
                  icon: <FaCalendarAlt />,
                },
                {
                  label: "Bagian Kabupaten",
                  val: bagianKabupaten,
                  color: "bg-amber-500",
                  icon: <FaCalendarCheck />,
                },
                {
                  label: "Bagian Cabang",
                  val: bagianCabang,
                  color: "bg-emerald-500",
                  icon: <FaUsers />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`${stat.color} p-5 rounded-[28px] text-white shadow-lg flex items-center justify-between group overflow-hidden relative`}
                >
                  <div className="relative z-10">
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">
                      {stat.label}
                    </p>
                    <h4 className="text-lg font-black">
                      {formatCurrency(stat.val)}
                    </h4>
                  </div>
                  <div className="text-3xl opacity-10 group-hover:scale-125 transition-transform duration-500">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Horizontal Entry Form */}
            <form
              onSubmit={handleSubmitTarget}
              className="bg-slate-900 p-6 sm:p-8 rounded-[40px] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FaCalendarAlt className="text-8xl text-white -rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col xl:flex-row items-end gap-6">
                <div className="w-full xl:w-1/3 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">
                    Pilih Cabang
                  </label>
                  <select
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white text-sm focus:bg-white/10 focus:border-amber-500 transition-all appearance-none"
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
                    Jumlah Kalender
                  </label>
                  <div className="relative">
                    <FaBoxOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type="number"
                      value={jumlahPesanan}
                      onFocus={() => {
                        if (jumlahPesanan === "0") setJumlahPesanan("");
                      }}
                      onBlur={() => {
                        if (jumlahPesanan === "") setJumlahPesanan("0");
                      }}
                      onChange={(e) => {
                        setJumlahPesanan(e.target.value);
                      }}
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-white text-base focus:bg-white/10 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="w-full xl:flex-1 flex xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-2 px-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-amber-400 tracking-tight">
                    {formatCurrency(totalAkhir)}
                  </span>
                </div>

                <div className="w-full xl:w-auto">
                  <button
                    type="submit"
                    className="w-full px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-900/40 transition-all active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Kunci Pesanan
                  </button>
                </div>
              </div>
            </form>

            {/* Table Card */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[18px] bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 tracking-tight">
                      Data Distribusi Kalender
                    </h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      Periode: {selectedMonth} {selectedYear}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px] flex-1 md:flex-none">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input
                      type="text"
                      placeholder="Cari Cabang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      {bulanList.map((b) => (
                        <option
                          key={b.id}
                          value={b.namaBulan}
                          className="font-sans normal-case"
                        >
                          {b.namaBulan}
                        </option>
                      ))}
                    </select>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="bg-transparent px-3 py-1.5 outline-none font-black text-slate-600 text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option
                          key={y}
                          value={y}
                          className="font-sans normal-case"
                        >
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadExcel}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-sm transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
                      title="Unduh Excel"
                    >
                      <FaFileExcel className="text-sm" />
                      Excel
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black shadow-sm transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
                      title="Unduh PDF"
                    >
                      <FaFilePdf className="text-sm" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {[
                        "No",
                        "Cabang/Khusus",
                        "Total Pesanan",
                        "Peruntukan Provinsi",
                        "Peruntukan Kabupaten",
                        "Peruntukan Cabang",
                        "Tambahan Cabang",
                        "Total Cabang",
                        "Tranfer",
                        "Kurang",
                        "Setoran Tunai",
                        "Selisih",
                        "Action",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loadingTable ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={13} className="p-6">
                              <div className="h-3 bg-slate-100 rounded-full w-full" />
                            </td>
                          </tr>
                        ))
                    ) : tableData.filter((r) =>
                      r.cabang
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    ).length > 0 ? (
                      tableData
                        .filter((r) =>
                          r.cabang
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        )
                        .map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50/80 transition-colors text-center text-[11px] font-bold text-slate-600"
                          >
                            <td className="px-4 py-4 text-slate-400 font-black">
                              {i + 1}
                            </td>
                            <td className="px-4 py-4 font-black text-slate-800 text-left whitespace-nowrap">
                              {row.cabang}
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md">
                                {row.jumlah}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {formatCurrency(row.peruntukanProvinsi)}
                            </td>
                            <td className="px-4 py-4">
                              {formatCurrency(row.peruntukanKabupaten)}
                            </td>
                            <td className="px-4 py-4">
                              {formatCurrency(row.peruntukanCabang)}
                            </td>
                            <td className="px-4 py-4 text-emerald-600">
                              {formatCurrency(row.tambahanCabang)}
                            </td>
                            <td className="px-4 py-4 text-indigo-600 font-black">
                              {formatCurrency(row.totalCabang)}
                            </td>
                            <td className="px-4 py-4 text-emerald-600 font-bold">
                              {formatCurrency(row.transfer)}
                            </td>
                            <td className="px-4 py-4 text-orange-600 font-bold">
                              {formatCurrency(row.kurang)}
                            </td>
                            <td className="px-4 py-4 text-slate-400">-</td>
                            <td className="px-4 py-4 text-slate-400">-</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditClick(row)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <FaEdit className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  disabled={loadingAction}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
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
                        <td
                          colSpan={13}
                          className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs"
                        >
                          Data Kosong
                        </td>
                      </tr>
                    )}

                    {tableData.filter((r) =>
                      r.cabang
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    ).length > 0 && (
                        <tr className="bg-amber-50 border-t-2 border-amber-200 font-black text-center text-[11px]">
                          <td
                            colSpan={2}
                            className="px-4 py-4 text-amber-700 font-black text-right"
                          >
                            TOTAL REKAP
                          </td>
                          <td className="px-4 py-4 text-amber-600">
                            {tableData
                              .filter((r) =>
                                r.cabang
                                  ?.toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                              )
                              .reduce(
                                (sum, row) => sum + (parseInt(row.jumlah) || 0),
                                0,
                              )}
                          </td>
                          <td className="px-4 py-4 text-amber-600">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum + (parseInt(row.peruntukanProvinsi) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-amber-600">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum +
                                    (parseInt(row.peruntukanKabupaten) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-amber-600">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum + (parseInt(row.peruntukanCabang) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-emerald-600 font-black">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum + (parseInt(row.tambahanCabang) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-amber-600 font-black">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum + (parseInt(row.totalCabang) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-emerald-600 font-black">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) =>
                                    sum + (parseInt(row.transfer) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-orange-600 font-black">
                            {formatCurrency(
                              tableData
                                .filter((r) =>
                                  r.cabang
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                )
                                .reduce(
                                  (sum, row) => sum + (parseInt(row.kurang) || 0),
                                  0,
                                ),
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-400">-</td>
                          <td className="px-4 py-4 text-slate-400">-</td>
                          <td className="px-4 py-4 text-slate-400">-</td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-amber-500 p-6 text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FaEdit className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Edit Data Kalender</h3>
                  <p className="text-amber-100 text-xs">
                    Perbarui informasi distribusi
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Cabang */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                    Cabang
                  </label>
                  <select
                    value={editData.cabang}
                    onChange={(e) =>
                      setEditData({ ...editData, cabang: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all text-sm"
                  >
                    <option value="">-- Pilih Cabang --</option>
                    {cabangList.map((c) => (
                      <option key={c.id} value={c.kecamatan}>
                        {c.kecamatan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jumlah */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                    Jumlah Kalender
                  </label>
                  <input
                    type="number"
                    value={editData.jumlah}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        jumlah: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all text-sm"
                  />
                </div>

                {/* Bulan */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                    Bulan
                  </label>
                  <select
                    value={editData.bulan}
                    onChange={(e) =>
                      setEditData({ ...editData, bulan: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all text-sm"
                  >
                    <option value="">-- Pilih Bulan --</option>
                    {bulanList.map((b) => (
                      <option key={b.id} value={b.namaBulan}>
                        {b.namaBulan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                    Tahun
                  </label>
                  <select
                    value={editData.tahun}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        tahun: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all text-sm"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loadingAction}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loadingAction ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KalenderSection;
