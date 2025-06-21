"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import {
  FaDollarSign,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaUndo,
  FaTrash,
  FaPrint,
  FaFileExcel,
  FaEdit,
  FaWallet,
  FaChevronDown,
  FaCalendarAlt,
  FaPlusCircle,
  FaFolderOpen,
  FaBoxOpen,
  FaBuilding,
  FaMoneyBill,
  FaStickyNote,
  FaBullseye,
  FaDownload,
} from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown, FaSliders } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import * as XLSX from "xlsx";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2  hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

function KasSanduka() {
  const { token } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("penerimaan");
  const [formPenerimaan, setFormPenerimaan] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    posPenerimaan: "",
    bulanTahun: "",
    jenisPenerimaan: "",
    cabang: "Tidak Ada Cabang (Sanduka Umum)",
    nominal: 0,
    keterangan: "",
  });

  const [formPengeluaran, setFormPengeluaran] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    posPengeluaran: "",
    bulanTahun: "",
    jenisPengeluaran: "",
    cabang: "Tidak Ada Cabang (Sanduka Umum)",
    nominal: 0,
    keterangan: "",
  });
   const [posPenerimaanSanduka, setPosPenerimaanSanduka] = useState([]);
   const [posPengeluaranSanduka, setPosPengeluaranSanduka] = useState([]);
  const [monthFilter, setMonthFilter] = useState("06");
  const [yearFilter, setYearFilter] = useState("2025");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showSaldoAwalModal, setShowSaldoAwalModal] = useState(false);
  const [formSaldoAwal, setFormSaldoAwal] = useState({
    bulan: "06", // default Juni
    tahun: "2025",
    nominal: 0,
  });

  const [showPosPenerimaanModal, setShowPosPenerimaanModal] = useState(false);
  const [newPosPenerimaan, setNewPosPenerimaan] = useState("");
  const [posPenerimaanList, setPosPenerimaanList] = useState([
    "Daspen",
    "Derap",
    "Iuran PGRI",
    "Kalender",
  ]);

  const [showPosPengeluaranModal, setShowPosPengeluaranModal] = useState(false);
  const [newPosPengeluaran, setNewPosPengeluaran] = useState("");
  const [posPengeluaranList, setPosPengeluaranList] = useState([
    "ATK",
    "Lain-lain",
    "Listrik",
    "PDAM",
  ]);
  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const years = ["2025", "2024", "2023", "2022"];

  const getMonthName = (monthValue) => {
    const month = months.find((m) => m.value === monthValue);
    return month ? month.label : "";
  };

    useEffect(() => {
  const fetchData = async () => {
    try {
      const penerimaan = await GlobalApi.getPosPenerimaanSanduka();
      const pengeluaran = await GlobalApi.getPosPengeluaranSanduka();

      setPosPenerimaanSanduka(penerimaan.data);
      setPosPengeluaranSanduka(pengeluaran.data);

      console.log('Penerimaan:', penerimaan);
      console.log('Pengeluaran:', pengeluaran);
    } catch (error) {
      console.error("Gagal mengambil data pos sanduka:", error);
    }
  };

  fetchData();
}, []);
  
    
  const handleSaldoAwalChange = (e) => {
    const { name, value } = e.target;
    setFormSaldoAwal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSaldoAwal = () => {
    // Implementasi submit logic di sini
    console.log("Saldo Awal Data:", formSaldoAwal);

    // Tampilkan notifikasi success
    setNotification({
      type: "success",
      message: `Saldo awal periode ${getMonthName(formSaldoAwal.bulan)} ${
        formSaldoAwal.tahun
      } berhasil disimpan!`,
    });

    // Tutup modal
    setShowSaldoAwalModal(false);
  };

  const handleTambahPosPenerimaan = () => {
    if (newPosPenerimaan.trim() !== "") {
      setPosPenerimaanList((prev) => [...prev, newPosPenerimaan.trim()]);
      setNewPosPenerimaan("");
      // show success notification
      setNotification({
        type: "success",
        // message: `Saldo awal periode ${getMonthName(formSaldoAwal.bulan)} ${formSaldoAwal.tahun} berhasil disimpan!`
      });
    }
  };

  const handleHapusPosPenerimaan = (index) => {
    const deletedItem = posPenerimaanList[index];
    setPosPenerimaanList((prev) => prev.filter((_, i) => i !== index));
    // show success notification
    setNotification({
      type: "success",
      // message: `Saldo awal periode ${getMonthName(formSaldoAwal.bulan)} ${formSaldoAwal.tahun} berhasil disimpan!`
    });
  };

  const handleTambahPosPengeluaran = () => {
    if (newPosPengeluaran.trim() !== "") {
      setPosPengeluaranList((prev) => [...prev, newPosPengeluaran.trim()]);
      setNewPosPengeluaran("");
      // show success notification
    }
  };

  const handleHapusPosPengeluaran = (index) => {
    const deletedItem = posPengeluaranList[index];
    setPosPengeluaranList((prev) => prev.filter((_, i) => i !== index));
    // show success notification
  };
  const handlePenerimaanChange = (e) => {
    const { name, value } = e.target;
    setFormPenerimaan((prev) => ({ ...prev, [name]: value }));
  };

  const handlePengeluaranChange = (e) => {
    const { name, value } = e.target;
    setFormPengeluaran((prev) => ({ ...prev, [name]: value }));
  };

  const resetPenerimaan = () => {
    setFormPenerimaan({
      tanggal: new Date().toISOString().split("T")[0],
      posPenerimaan: "",
      bulanTahun: "",
      jenisPenerimaan: "",
      cabang: "Tidak Ada Cabang (Sanduka Umum)",
      nominal: 0,
      keterangan: "",
    });
  };

  const resetPengeluaran = () => {
    setFormPengeluaran({
      tanggal: new Date().toISOString().split("T")[0],
      posPengeluaran: "",
      bulanTahun: "",
      jenisPengeluaran: "",
      cabang: "Tidak Ada Cabang (Sanduka Umum)",
      nominal: 0,
      keterangan: "",
    });
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const transactions = [
    {
      id: 2,
      tanggal: "15/06/2025",
      noBukti: "PGLSKDK-20250615210333-SANDUKA",
      uraian:
        "Pengeluaran Sanduka Operasional Sanduka (Cash) untuk Juni 2025. Ket: -",
      debit: 350000000,
      kredit: 390000,
      saldo: 349910000,
    },
    // Add more transactions as needed
  ];

  const totalDebit = transactions.reduce((sum, item) => sum + item.debit, 0);
  const totalKredit = transactions.reduce((sum, item) => sum + item.kredit, 0);
  const saldoAkhir =
    transactions.length > 0 ? transactions[transactions.length - 1].saldo : 0;

  //
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleExportExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = [
        // Header row
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        // Title row
        {
          No: `BUKU KAS UMUM - ${getMonthName(monthFilter)} ${yearFilter}`,
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        // Empty row for spacing
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        // Column headers
        {
          No: "No",
          Tanggal: "Tanggal",
          "No Bukti": "No Bukti",
          Uraian: "Uraian",
          "Debit (Pemasukan)": "Debit (Pemasukan)",
          "Kredit (Pengeluaran)": "Kredit (Pengeluaran)",
          Saldo: "Saldo",
        },
      ];

      // Add transaction data
      transactions.forEach((transaction, index) => {
        excelData.push({
          No: index + 1,
          Tanggal: transaction.tanggal,
          "No Bukti": transaction.noBukti,
          Uraian: transaction.uraian,
          "Debit (Pemasukan)":
            transaction.debit > 0
              ? `Rp ${transaction.debit.toLocaleString("id-ID")}`
              : "",
          "Kredit (Pengeluaran)":
            transaction.kredit > 0
              ? `Rp ${transaction.kredit.toLocaleString("id-ID")}`
              : "",
          Saldo: `Rp ${transaction.saldo.toLocaleString("id-ID")}`,
        });
      });

      // Add summary rows
      excelData.push(
        // Empty row
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        // Total row
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "TOTAL",
          "Debit (Pemasukan)": `Rp ${totalDebit.toLocaleString("id-ID")}`,
          "Kredit (Pengeluaran)": `Rp ${totalKredit.toLocaleString("id-ID")}`,
          Saldo: `Rp ${saldoAkhir.toLocaleString("id-ID")}`,
        }
      );

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
      const wb = XLSX.utils.book_new();

      // Set column widths
      const colWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Tanggal
        { wch: 30 }, // No Bukti
        { wch: 50 }, // Uraian
        { wch: 20 }, // Debit
        { wch: 20 }, // Kredit
        { wch: 20 }, // Saldo
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Buku Kas Umum");

      // Generate filename with current date
      const currentDate = new Date();
      const filename = `Buku_Kas_Umum_${getMonthName(
        monthFilter
      )}_${yearFilter}_${currentDate.getDate()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getFullYear()}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      // Show success notification
      setNotification({
        type: "success",
        message: `File Excel berhasil diunduh: ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setNotification({
        type: "error",
        message: "Gagal mengekspor ke Excel. Silakan coba lagi.",
      });
    }
  };
  const handlePrint = () => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Buku Kas Umum - ${getMonthName(
              monthFilter
            )} ${yearFilter}</title>
            <style>
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                }

                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                }

                h1, h2, h3, p {
                    margin: 0;
                    padding: 0;
                }

                .title {
                    text-align: center;
                    margin-bottom: 10px;
                }

                .subtitle {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    font-size: 11px;
                }

                thead th {
                    background-color: #009688 !important;
                    color: white !important;
                    padding: 6px;
                    border: 1px solid #ccc;
                    text-align: center;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                tbody td {
                    border: 1px solid #ccc;
                    padding: 6px;
                    vertical-align: top;
                }

                .number {
                    text-align: right;
                }

                .center {
                    text-align: center;
                }

                .summary-row td {
                    font-weight: bold;
                    background-color: #f5f5f5;
                }
            </style>
        </head>
        <body>
            <div class="title">
                <h2>BUKU KAS UMUM</h2>
                <p>Periode: ${getMonthName(monthFilter)} ${yearFilter}</p>
            </div>

            <div class="subtitle">
                <p><strong>Saldo Akhir Bulan Sebelumnya (${getMonthName(
                  monthFilter - 1
                )} ${yearFilter}):</strong> Rp ${saldoSebelumnya.toLocaleString(
        "id-ID"
      )}</p>
                <p>Dicetak pada: ${new Date().toLocaleString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tgl Transaksi</th>
                        <th>No. Bukti</th>
                        <th>Uraian</th>
                        <th>Debet (Rp)</th>
                        <th>Kredit (Rp)</th>
                        <th>Saldo (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="center">01/06/${yearFilter}</td>
                        <td colspan="2" class="center">SALDO AWAL</td>
                        <td>Saldo Awal Periode ${getMonthName(
                          monthFilter
                        )} ${yearFilter}</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td class="number">Rp 0</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString(
                          "id-ID"
                        )}</td>
                    </tr>

                    ${transactions
                      .map(
                        (transaction, index) => `
                        <tr>
                            <td class="center">${index + 1}</td>
                            <td class="center">${transaction.tanggal}</td>
                            <td>${transaction.noBukti}</td>
                            <td>${transaction.uraian}</td>
                            <td class="number">${
                              transaction.debit > 0
                                ? "Rp " +
                                  transaction.debit.toLocaleString("id-ID")
                                : "Rp 0"
                            }</td>
                            <td class="number">${
                              transaction.kredit > 0
                                ? "Rp " +
                                  transaction.kredit.toLocaleString("id-ID")
                                : "Rp 0"
                            }</td>
                            <td class="number">Rp ${transaction.saldo.toLocaleString(
                              "id-ID"
                            )}</td>
                        </tr>
                    `
                      )
                      .join("")}

                    <tr class="summary-row">
                        <td colspan="4" class="center">TOTAL TRANSAKSI PERIODE INI</td>
                        <td class="number">Rp ${totalDebit.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td class="number">Rp ${totalKredit.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td></td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="6" class="center">SALDO AKHIR PERIODE INI</td>
                        <td class="number">Rp ${saldoAkhir.toLocaleString(
                          "id-ID"
                        )}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
        `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = function () {
          printWindow.close();
        };
      };

      setNotification({
        type: "success",
        message: "Dokumen berhasil disiapkan untuk pencetakan",
      });
    } catch (error) {
      console.error("Error printing:", error);
      setNotification({
        type: "error",
        message: "Gagal mencetak dokumen. Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        {notification && (
          <NotificationPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Konten utama */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            {/* Menu Saldo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                Buku Kas Sanduka
              </h1>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  className="px-4 py-2 rounded border border-black bg-white text-black hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2 text-sm flex-1"
                  onClick={() => setShowPosPenerimaanModal(true)}
                >
                  <FaSliders className="w-4 h-4" />
                  <span>Kelola Pos Penerimaan Sanduka</span>
                </Button>

                <Button
                  className="px-4 py-2 rounded border border-black bg-white text-black hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2 text-sm flex-1"
                  onClick={() => setShowPosPengeluaranModal(true)}
                >
                  <FaSliders className="w-4 h-4" />
                  <span>Kelola Pos Pengeluaran Sanduka</span>
                </Button>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 my-4"></div>

            {/* Ringkasan Saldo */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 ">
                Ringkasan Saldo Sanduka Periode: Juni 2025
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Saldo Akhir Mei 2025
                    </h3>
                    <p className="text-xl font-bold text-black">
                      Rp 4.037.000.000
                    </p>
                  </div>
                  <FaCalendarAlt className="text-gray-400 w-6 h-6" />
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Total Pemasukan Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-green-600">
                      Rp 40.300.000
                    </p>
                  </div>
                  <FaArrowTrendUp className="text-green-500 w-6 h-6" />
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Total Pengeluaran Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-red-600">
                      Rp 4.000.000
                    </p>
                  </div>
                  <FaArrowTrendDown className="text-red-500 w-6 h-6" />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Saldo Akhir Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-blue-600">
                      Rp 4.073.300.000
                    </p>
                  </div>
                  <FaDollarSign className="text-blue-500 w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${
                activeTab === "penerimaan"
                  ? "text-white bg-green-600"
                  : "text-green-700 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("penerimaan")}
            >
              <FaArrowTrendUp className="w-4 h-4" />
              Input Pemasukan Sanduka
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${
                activeTab === "pengeluaran"
                  ? "text-white bg-red-600"
                  : "text-red-700 hover:bg-red-50"
              }`}
              onClick={() => setActiveTab("pengeluaran")}
            >
              <FaArrowTrendDown className="w-4 h-4" />
              Input Pengeluaran Sanduka
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md mt-3">
            {/* Penerimaan Form */}
            {activeTab === "penerimaan" && (
              <>
                <div className="bg-green-100 text-green-800 p-4 text-lg rounded font-semibold flex items-center gap-2">
                  <FaArrowTrendUp />
                  Input Pemasukan Sanduka
                </div>
                <div className="space-y-4 p-4 bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        {" "}
                        <FaCalendarAlt />
                        Tanggal Transaksi
                      </label>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50">
                        {formatDate(formPenerimaan.tanggal)}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaFolderOpen />
                        Jenis Penerimaan
                      </label>
                      <select
                        name="jenisPenerimaan"
                        value={formPenerimaan.jenisPenerimaan}
                        onChange={handlePenerimaanChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Jenis</option>
                        <option value="Reguler">Reguler</option>
                        <option value="Khusus">Khusus</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBoxOpen />
                        Pos Penerimaan
                      </label>
                      <select
                        name="posPenerimaan"
                        value={formPenerimaan.posPenerimaan}
                        onChange={handlePenerimaanChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Pos</option>
                        <option value="Iuran Anggota">Iuran Anggota</option>
                        <option value="Donasi">Donasi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBuilding />
                        Cabang
                      </label>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50">
                        {formPenerimaan.cabang}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Setoran Untuk Bulan & Tahun
                      </label>
                      <input
                        type="month"
                        name="bulanTahun"
                        value={formPenerimaan.bulanTahun}
                        onChange={handlePenerimaanChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaMoneyBill />
                        Nominal (Rp)
                      </label>
                      <input
                        type="number"
                        name="nominal"
                        value={formPenerimaan.nominal}
                        onChange={handlePenerimaanChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                      <p className="text-xs  mt-1">Terbilang: not Rupiah</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaStickyNote />
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      value={formPenerimaan.keterangan}
                      onChange={handlePenerimaanChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                      placeholder="Keterangan tambahan (mis: Iuran Sanduka anggota Mei 2024)"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      // onClick={handleSesuaiTarget}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 flex items-center"
                    >
                      <FaBullseye className="mr-2" />
                      Sesuai Target
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center">
                      <FaSave className="mr-2" />
                      Simpan Pemasukan
                    </button>
                  </div>
                </div>
              </>
            )}
            {/* Pengeluaran Form */}
            {activeTab === "pengeluaran" && (
              <>
                <div className="bg-red-100 text-red-800 p-4 text-lg rounded font-semibold flex items-center gap-2">
                  <FaArrowTrendDown />
                  Input Pengeluaran Sanduka
                </div>
                <div className="space-y-4 p-4 bg-red-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Tanggal Transaksi
                      </label>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50">
                        {formatDate(formPengeluaran.tanggal)}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaFolderOpen />
                        Jenis Pengeluaran
                      </label>
                      <select
                        name="jenisPengeluaran"
                        value={formPengeluaran.jenisPengeluaran}
                        onChange={handlePengeluaranChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Jenis</option>
                        <option value="Rutin">Rutin</option>
                        <option value="Darurat">Darurat</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBoxOpen />
                        Pos Pengeluaran
                      </label>
                      <select
                        name="posPengeluaran"
                        value={formPengeluaran.posPengeluaran}
                        onChange={handlePengeluaranChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Pos</option>
                        <option value="Santunan">Santunan</option>
                        <option value="Operasional">Operasional</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaBuilding />
                        Cabang
                      </label>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50">
                        {formPengeluaran.cabang}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Pengeluaran Untuk Bulan & Tahun
                      </label>
                      <input
                        type="month"
                        name="bulanTahun"
                        value={formPengeluaran.bulanTahun}
                        onChange={handlePengeluaranChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaMoneyBill />
                        Nominal (Rp)
                      </label>
                      <input
                        type="number"
                        name="nominal"
                        value={formPengeluaran.nominal}
                        onChange={handlePengeluaranChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                      <p className="text-xs  mt-1">Terbilang: not Rupiah</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      {" "}
                      <FaStickyNote />
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      value={formPengeluaran.keterangan}
                      onChange={handlePengeluaranChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                      placeholder="Keterangan tambahan (mis: Santunan duka Bpk. Fulan)"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      // onClick={handleSesuaiTarget}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 flex items-center"
                    >
                      <FaBullseye className="mr-2" />
                      Sesuai Target
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center">
                      <FaSave className="mr-2" />
                      Simpan Pengeluaran
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Daftar Transaksi Sanduka - Juni 2025
                </h1>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
                  {/* Month Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 w-24"
                      onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    >
                      <span>{getMonthName(monthFilter)}</span>
                      <FaChevronDown className="ml-7 text-sm" />
                    </button>
                    {showMonthDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                        {months.map((month) => (
                          <div
                            key={month.value}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              monthFilter === month.value
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => {
                              setMonthFilter(month.value);
                              setShowMonthDropdown(false);
                            }}
                          >
                            {month.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Year Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700"
                      onClick={() => setShowYearDropdown(!showYearDropdown)}
                    >
                      <span>{yearFilter}</span>
                      <FaChevronDown className="ml-2 text-sm" />
                    </button>
                    {showYearDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                        {years.map((year) => (
                          <div
                            key={year}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              yearFilter === year
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => {
                              setYearFilter(year);
                              setShowYearDropdown(false);
                            }}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-800 rounded hover:bg-blue-100 gap-2"
                  >
                    <FaDownload />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-800 rounded hover:bg-blue-100 gap-2"
                  >
                    <FaPrint />
                    <span>Cetak Laporan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      NO
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      TGL TRANSAKSI
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      NO. BUKTI
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      URAIAN
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      DEBET (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      KREDIT (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      SALDO (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-300"
                    >
                      <td className="p-3 text-center whitespace-nowrap text-sm">
                        {transaction.id}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {transaction.tanggal}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {transaction.noBukti}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.uraian}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                        {transaction.debit.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                        {transaction.kredit.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                        {transaction.saldo.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <div className="flex space-x-2 justify-center text-base">
                          <button className="text-blue-500 hover:text-blue-700">
                            <FaEdit />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b border-blue-300">
                    <td className="text-right p-3" colSpan={4}>
                      TOTAL TRANSAKSI PERIODE INI
                    </td>
                    <td className="bg-green-50">
                      {" "}
                      <p className=" font-bold text-green-800 text-right">
                        Rp {totalDebit.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="bg-red-50">
                      {" "}
                      <p className="font-bold text-red-800 text-right">
                        Rp {totalKredit.toLocaleString("id-ID")}
                      </p>
                    </td>
                  </tr>
                  <tr className="bg-blue-50 text-blue-800">
                    <td className="text-right p-3 font-bold" colSpan={6}>
                      SALDO AKHIR PERIODE INI
                    </td>

                    <td className="text-right bg-blue-200">
                      {" "}
                      <p className="text-lg font-bold text-blue-800">
                        Rp {saldoAkhir.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showPosPenerimaanModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-80"
            onClick={() => setShowPosPenerimaanModal(false)}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaSliders className="text-blue-600 w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Kelola Pos Penerimaan
                </h3>
              </div>

              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Tambah atau hapus daftar Pos Penerimaan yang akan digunakan
                dalam transaksi.
              </p>

              {/* Form Tambah Pos Baru */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2 font-bold">
                  Nama Pos Penerimaan Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPosPenerimaan}
                    onChange={(e) => setNewPosPenerimaan(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Donasi Penerimaan"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleTambahPosPenerimaan()
                    }
                  />
                  <button
                    onClick={handleTambahPosPenerimaan}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaPlusCircle className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* Daftar Pos Penerimaan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Daftar Pos Penerimaan Sanduka Saat Ini
                </label>
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {posPenerimaanList.map((pos, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{pos}</span>
                      <button
                        onClick={() => handleHapusPosPenerimaan(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus pos penerimaan"
                      ></button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pos bawaan sistem tidak dapat dihapus.
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showPosPengeluaranModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-80"
            onClick={() => setShowPosPengeluaranModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaSliders className="text-blue-600 w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Kelola Pos Pengeluaran
                </h3>
              </div>

              <button
                onClick={() => setShowPosPengeluaranModal(false)}
                className="text-red-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Tambah atau hapus daftar Pos Pengeluaran yang akan digunakan
                dalam transaksi.
              </p>

              {/* Form Tambah Pos Baru */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Pos Pengeluaran Sanduka Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPosPengeluaran}
                    onChange={(e) => setNewPosPengeluaran(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Donasi Penerimaan"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleTambahPosPengeluaran()
                    }
                  />
                  <button
                    onClick={handleTambahPosPengeluaran}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaPlusCircle className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* Daftar Pos Pengeluaran */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Daftar Pos Pengeluaran Sanduka Saat Ini
                </label>
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {posPengeluaranList.map((pos, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{pos}</span>
                      <button
                        onClick={() => handleHapusPosPengeluaran(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus pos pengeluaran"
                      ></button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pos bawaan sistem tidak dapat dihapus.
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KasSanduka;
