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
    FaPlusCircle,
    FaMinusCircle,
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationCircle,
    FaSave,
    FaUndo,
    FaTrash,
    FaPrint,
    FaFileExcel,
    FaEdit,
    FaCalendarAlt,
    FaChevronDown,
    FaDollarSign,
    FaWallet,
    FaBoxOpen,
    FaFolderOpen,
    FaBuilding,
    FaStickyNote,
    FaMoneyBill,
    FaRegTrashAlt,
    FaBullseye,
    FaDownload,
} from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown, FaSliders } from "react-icons/fa6";
import { LuListFilter } from "react-icons/lu";
import { FiTrash } from "react-icons/fi";
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

function KasUmum() {
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
    const [monthFilter, setMonthFilter] = useState("06");
    const [yearFilter, setYearFilter] = useState("2025");
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const [showSaldoAwalModal, setShowSaldoAwalModal] = useState(false);
    const [formSaldoAwal, setFormSaldoAwal] = useState({
        bulan: "06", // default Juni
        tahun: "2025",
        nominal: 0
    });

    const [showPosPenerimaanModal, setShowPosPenerimaanModal] = useState(false);
    const [newPosPenerimaan, setNewPosPenerimaan] = useState("");
    const [posPenerimaanList, setPosPenerimaanList] = useState([
        "Daspen", "Derap", "Iuran PGRI", "Kalender"
    ]);

    const [showPosPengeluaranModal, setShowPosPengeluaranModal] = useState(false);
    const [newPosPengeluaran, setNewPosPengeluaran] = useState("");
    const [posPengeluaranList, setPosPengeluaranList] = useState([
        "ATK", "Lain-lain", "Listrik", "PDAM"
    ]);
    const saldoSebelumnya = 4037000000;
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

    const handleSaveChanges = (updatedTransaction) => {
        // update di backend atau state
        const updatedList = transactions.map((trx) =>
            trx.id === updatedTransaction.id ? updatedTransaction : trx
        );
        setTransactions(updatedList);
        setShowEditModal(false);

        setNotification({
            type: "success",
            message: `Perubahan berhasil disimpan!`
        });
    };

    const handleConfirmDelete = (id) => {
        const updatedList = transactions.filter((trx) => trx.id !== id);
        setTransactions(updatedList);
        setShowDeleteModal(false);

        // TODO: Tambahkan pemanggilan API untuk hapus di backend jika perlu
    };

    const handleSaldoAwalChange = (e) => {
        const { name, value } = e.target;
        setFormSaldoAwal(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitSaldoAwal = () => {
        // Implementasi submit logic di sini
        console.log('Saldo Awal Data:', formSaldoAwal);

        // Tampilkan notifikasi success
        setNotification({
            type: "success",
            message: `Saldo awal periode ${getMonthName(formSaldoAwal.bulan)} ${formSaldoAwal.tahun} berhasil disimpan!`
        });

        // Tutup modal
        setShowSaldoAwalModal(false);
    };

    const handleTambahPosPenerimaan = () => {
        if (newPosPenerimaan.trim() !== "") {
            setPosPenerimaanList(prev => [...prev, newPosPenerimaan.trim()]);
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
        setPosPenerimaanList(prev => prev.filter((_, i) => i !== index));
        // show success notification
        setNotification({
            type: "success",
            // message: `Saldo awal periode ${getMonthName(formSaldoAwal.bulan)} ${formSaldoAwal.tahun} berhasil disimpan!`
        });
    };

    const handleTambahPosPengeluaran = () => {
        if (newPosPengeluaran.trim() !== "") {
            setPosPengeluaranList(prev => [...prev, newPosPengeluaran.trim()]);
            setNewPosPengeluaran("");
            // show success notification
        }
    };

    const handleHapusPosPengeluaran = (index) => {
        const deletedItem = posPengeluaranList[index];
        setPosPengeluaranList(prev => prev.filter((_, i) => i !== index));
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

    const handleEditClick = (transaction) => {
        setTransactionToEdit(transaction);
        setShowEditModal(true);
    };

    const handleDeleteClick = (transaction) => {
        setTransactionToDelete(transaction);
        setShowDeleteModal(true);
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
            debit: 0,
            kredit: 45000,
            saldo: 255000,
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

    // Add these functions to your KasUmum component

    const handleExportExcel = () => {
        try {
            // Prepare data for Excel export
            const excelData = [
                // Header row
                {
                    'No': '',
                    'Tanggal': '',
                    'No Bukti': '',
                    'Uraian': '',
                    'Debit (Pemasukan)': '',
                    'Kredit (Pengeluaran)': '',
                    'Saldo': ''
                },
                // Title row
                {
                    'No': `BUKU KAS UMUM - ${getMonthName(monthFilter)} ${yearFilter}`,
                    'Tanggal': '',
                    'No Bukti': '',
                    'Uraian': '',
                    'Debit (Pemasukan)': '',
                    'Kredit (Pengeluaran)': '',
                    'Saldo': ''
                },
                // Empty row for spacing
                {
                    'No': '',
                    'Tanggal': '',
                    'No Bukti': '',
                    'Uraian': '',
                    'Debit (Pemasukan)': '',
                    'Kredit (Pengeluaran)': '',
                    'Saldo': ''
                },
                // Column headers
                {
                    'No': 'No',
                    'Tanggal': 'Tanggal',
                    'No Bukti': 'No Bukti',
                    'Uraian': 'Uraian',
                    'Debit (Pemasukan)': 'Debit (Pemasukan)',
                    'Kredit (Pengeluaran)': 'Kredit (Pengeluaran)',
                    'Saldo': 'Saldo'
                }
            ];

            // Add transaction data
            transactions.forEach((transaction, index) => {
                excelData.push({
                    'No': index + 1,
                    'Tanggal': transaction.tanggal,
                    'No Bukti': transaction.noBukti,
                    'Uraian': transaction.uraian,
                    'Debit (Pemasukan)': transaction.debit > 0 ? `Rp ${transaction.debit.toLocaleString('id-ID')}` : '',
                    'Kredit (Pengeluaran)': transaction.kredit > 0 ? `Rp ${transaction.kredit.toLocaleString('id-ID')}` : '',
                    'Saldo': `Rp ${transaction.saldo.toLocaleString('id-ID')}`
                });
            });

            // Add summary rows
            excelData.push(
                // Empty row
                {
                    'No': '',
                    'Tanggal': '',
                    'No Bukti': '',
                    'Uraian': '',
                    'Debit (Pemasukan)': '',
                    'Kredit (Pengeluaran)': '',
                    'Saldo': ''
                },
                // Total row
                {
                    'No': '',
                    'Tanggal': '',
                    'No Bukti': '',
                    'Uraian': 'TOTAL',
                    'Debit (Pemasukan)': `Rp ${totalDebit.toLocaleString('id-ID')}`,
                    'Kredit (Pengeluaran)': `Rp ${totalKredit.toLocaleString('id-ID')}`,
                    'Saldo': `Rp ${saldoAkhir.toLocaleString('id-ID')}`
                }
            );

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
            const wb = XLSX.utils.book_new();

            // Set column widths
            const colWidths = [
                { wch: 5 },   // No
                { wch: 15 },  // Tanggal
                { wch: 30 },  // No Bukti
                { wch: 50 },  // Uraian
                { wch: 20 },  // Debit
                { wch: 20 },  // Kredit
                { wch: 20 }   // Saldo
            ];
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas Umum');

            // Generate filename with current date
            const currentDate = new Date();
            const filename = `Buku_Kas_Umum_${getMonthName(monthFilter)}_${yearFilter}_${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}.xlsx`;

            // Write and download file
            XLSX.writeFile(wb, filename);

            // Show success notification
            setNotification({
                type: "success",
                message: `File Excel berhasil diunduh: ${filename}`
            });

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setNotification({
                type: "error",
                message: "Gagal mengekspor ke Excel. Silakan coba lagi."
            });
        }
    };

    const handlePrint = () => {
        try {
            const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Buku Kas Umum - ${getMonthName(monthFilter)} ${yearFilter}</title>
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
                <p><strong>Saldo Akhir Bulan Sebelumnya (${getMonthName(monthFilter - 1)} ${yearFilter}):</strong> Rp ${saldoSebelumnya.toLocaleString('id-ID')}</p>
                <p>Dicetak pada: ${new Date().toLocaleString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
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
                        <td>Saldo Awal Periode ${getMonthName(monthFilter)} ${yearFilter}</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString('id-ID')}</td>
                        <td class="number">Rp 0</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString('id-ID')}</td>
                    </tr>

                    ${transactions.map((transaction, index) => `
                        <tr>
                            <td class="center">${index + 1}</td>
                            <td class="center">${transaction.tanggal}</td>
                            <td>${transaction.noBukti}</td>
                            <td>${transaction.uraian}</td>
                            <td class="number">${transaction.debit > 0 ? 'Rp ' + transaction.debit.toLocaleString('id-ID') : 'Rp 0'}</td>
                            <td class="number">${transaction.kredit > 0 ? 'Rp ' + transaction.kredit.toLocaleString('id-ID') : 'Rp 0'}</td>
                            <td class="number">Rp ${transaction.saldo.toLocaleString('id-ID')}</td>
                        </tr>
                    `).join('')}

                    <tr class="summary-row">
                        <td colspan="4" class="center">TOTAL TRANSAKSI PERIODE INI</td>
                        <td class="number">Rp ${totalDebit.toLocaleString('id-ID')}</td>
                        <td class="number">Rp ${totalKredit.toLocaleString('id-ID')}</td>
                        <td></td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="6" class="center">SALDO AKHIR PERIODE INI</td>
                        <td class="number">Rp ${saldoAkhir.toLocaleString('id-ID')}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
        `;

            const printWindow = window.open('', '_blank');
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
                message: "Dokumen berhasil disiapkan untuk pencetakan"
            });

        } catch (error) {
            console.error('Error printing:', error);
            setNotification({
                type: "error",
                message: "Gagal mencetak dokumen. Silakan coba lagi."
            });
        }
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
                    className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
                        }`}
                >
                    {/* Konten utama */}
                    {/* Header Buku Kas Umum + Menu Aksi */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 mt-20">
                        <h1 className="text-2xl font-bold text-blue-600">
                            Buku Kas Umum
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            {/* <button
                                onClick={() => setShowSaldoAwalModal(true)}
                                className="px-4 py-2 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition flex items-center gap-2 text-sm font-medium"
                            >
                                <FaWallet className="w-4 h-4" />
                                <span>Set Saldo Awal</span>
                            </button> */}

                            <button
                                onClick={() => setShowPosPenerimaanModal(true)}
                                className="px-4 py-2 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition flex items-center gap-2 text-sm font-medium">
                                <FaSliders className="w-4 h-4" />
                                <span>Kelola Pos Penerimaan</span>
                            </button>

                            <button
                                onClick={() => setShowPosPengeluaranModal(true)}
                                className="px-4 py-2 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition flex items-center gap-2 text-sm font-medium">
                                <FaSliders className="w-4 h-4" />
                                <span>Kelola Pos Pengeluaran</span>
                            </button>
                        </div>
                    </div>

                    {/* Kartu Ringkasan Saldo */}
                    <div className="bg-white rounded-lg shadow-md p-6 mt-2">
                        <div className="border-t-2 border-gray-200 my-4"></div>

                        {/* Ringkasan Saldo */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-blue-700 mb-4">
                                Ringkasan Saldo Periode: Juni 2025
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-gray-600 font-medium mb-1">Saldo Akhir Mei 2025</h3>
                                        <p className="text-xl font-bold text-black">Rp 4.037.000.000</p>
                                    </div>
                                    <FaCalendarAlt className="text-gray-400 w-6 h-6" />
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-gray-600 font-medium mb-1">Total Pemasukan Juni 2025</h3>
                                        <p className="text-xl font-bold text-green-600">Rp 40.300.000</p>
                                    </div>
                                    <FaArrowTrendUp className="text-green-500 w-6 h-6" />
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-gray-600 font-medium mb-1">Total Pengeluaran Juni 2025</h3>
                                        <p className="text-xl font-bold text-red-600">Rp 4.000.000</p>
                                    </div>
                                    <FaArrowTrendDown className="text-red-500 w-6 h-6" />
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-gray-600 font-medium mb-1">Saldo Akhir Juni 2025</h3>
                                        <p className="text-xl font-bold text-blue-600">Rp 4.073.300.000</p>
                                    </div>
                                    <FaDollarSign className="text-blue-500 w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mt-6">
                        <button
                            className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${activeTab === "penerimaan"
                                ? "text-white bg-green-500"
                                : "text-green-700 hover:bg-green-50"
                                }`}
                            onClick={() => setActiveTab("penerimaan")}
                        >
                            <FaArrowTrendUp className="w-4 h-4" />
                            Input Pemasukan Sanduka
                        </button>
                        <button
                            className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${activeTab === "pengeluaran"
                                ? "text-white bg-red-500"
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
                                    Input Pemasukan
                                </div>

                                <div className="space-y-4 p-4 rounded-b">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Tanggal Transaksi */}
                                        <div>
                                            <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <FaCalendarAlt /> Tanggal Transaksi
                                            </label>
                                            <div className="p-2 border border-gray-300 rounded bg-gray-50">
                                                {formatDate(formPenerimaan.tanggal)}
                                            </div>
                                        </div>

                                        {/* Jenis Penerimaan */}
                                        <div>
                                            <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <FaFolderOpen /> Jenis Penerimaan
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

                                        {/* Pos Penerimaan */}
                                        <div>
                                            <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <FaBoxOpen /> Pos Penerimaan
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

                                        {/* Cabang */}
                                        <div>
                                            <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <FaBuilding /> Cabang
                                            </label>
                                            <div className="p-2 border border-gray-300 rounded bg-gray-50">
                                                {formPenerimaan.cabang}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bulan Tahun & Nominal */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                <FaCalendarAlt /> Setoran Untuk Bulan & Tahun
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
                                            <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <FaMoneyBill /> Nominal (Rp)
                                            </label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                value={formPenerimaan.nominal}
                                                onChange={handlePenerimaanChange}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="0"
                                            />
                                            <p className="text-xs mt-1 text-gray-500 italic">Terbilang: nol Rupiah</p>
                                        </div>
                                    </div>

                                    {/* Keterangan */}
                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaStickyNote /> Keterangan
                                        </label>
                                        <textarea
                                            name="keterangan"
                                            value={formPenerimaan.keterangan}
                                            onChange={handlePenerimaanChange}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            rows="3"
                                            placeholder="Keterangan tambahan (mis: Iuran anggota Mei 2024)"
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

                                        <button
                                            // onClick={handleSubmitPenerimaan}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                                        >
                                            <FaSave className="mr-2" />
                                            Simpan Pemasukan
                                        </button>

                                        {/* <button
                                            onClick={resetPenerimaan}
                                            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                            <FaUndo className="mr-2" />
                                            Reset
                                        </button> */}
                                    </div>
                                </div>
                            </>
                        )}
                        {/* Pengeluaran Form */}
                        {activeTab === "pengeluaran" && (
                            <div className="bg-red-100 border border-red-300 rounded-md">
                                <div className="bg-red-100 text-red-800 p-4 text-lg rounded font-semibold flex items-center gap-2">
                                    <FaArrowTrendUp />
                                    Input Pemasukan
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white">
                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaCalendarAlt /> Tanggal Transaksi
                                        </label>
                                        <div className="p-2 border border-gray-300 rounded bg-white">
                                            {formatDate(formPengeluaran.tanggal)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaFolderOpen /> Jenis Pengeluaran
                                        </label>
                                        <select
                                            name="jenisPengeluaran"
                                            value={formPengeluaran.jenisPengeluaran}
                                            onChange={handlePengeluaranChange}
                                            className="w-full p-2 border border-gray-300 rounded bg-white"
                                        >
                                            <option value="">Pilih Jenis</option>
                                            <option value="Rutin">Rutin</option>
                                            <option value="Darurat">Darurat</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaBoxOpen /> Pos Pengeluaran
                                        </label>
                                        <select
                                            name="posPengeluaran"
                                            value={formPengeluaran.posPengeluaran}
                                            onChange={handlePengeluaranChange}
                                            className="w-full p-2 border border-gray-300 rounded bg-white"
                                        >
                                            <option value="">Pilih Pos</option>
                                            <option value="Santunan">Santunan</option>
                                            <option value="Operasional">Operasional</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaBuilding /> Cabang
                                        </label>
                                        <div className="p-2 border border-gray-300 rounded bg-white">
                                            {formPengeluaran.cabang || "Tidak Ada Cabang (Umum)"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <FaCalendarAlt /> Pengeluaran Untuk Bulan & Tahun
                                        </label>
                                        <input
                                            type="month"
                                            name="bulanTahun"
                                            value={formPengeluaran.bulanTahun}
                                            onChange={handlePengeluaranChange}
                                            className="w-full p-2 border border-gray-300 rounded bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaMoneyBill /> Nominal (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            name="nominal"
                                            value={formPengeluaran.nominal}
                                            onChange={handlePengeluaranChange}
                                            className="w-full p-2 border border-gray-300 rounded bg-white"
                                            placeholder="0"
                                        />
                                        <p className="text-xs mt-1 text-gray-500 italic">Terbilang: nol Rupiah</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-1 flex items-center gap-2">
                                            <FaStickyNote /> Keterangan
                                        </label>
                                        <textarea
                                            name="keterangan"
                                            value={formPengeluaran.keterangan}
                                            onChange={handlePengeluaranChange}
                                            className="w-full p-2 border border-gray-300 rounded bg-white"
                                            rows="3"
                                            placeholder="Keterangan tambahan (mis: Biaya ATK rapat bulanan)"
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
                                        <button
                                            // onClick={handleSesuaiTarget}
                                            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 flex items-center"
                                        >
                                            <FaBullseye className="mr-2" />
                                            Sesuai Target
                                        </button>
                                        <button
                                            // onClick={handleSubmitPengeluaran}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                                        >
                                            <FaSave className="mr-2" />
                                            Simpan Pengeluaran
                                        </button>
                                        {/* <button
                                            onClick={resetPengeluaran}
                                            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                            <FaUndo className="mr-2" />
                                            Reset
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <div className="rounded-lg shadow-md p-6 mt-6 bg-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                                    Tabel Transaksi Keuangan
                                </h1>

                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
                                    {/* Label + Month Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">Bulan:</span>
                                        <div className="relative">
                                            <button
                                                className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 w-28"
                                                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                            >
                                                <span>{getMonthName(monthFilter)}</span>
                                                <FaChevronDown className="ml-auto text-sm" />
                                            </button>
                                            {showMonthDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                                                    {months.map((month) => (
                                                        <div
                                                            key={month.value}
                                                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${monthFilter === month.value ? "bg-blue-50 text-blue-600" : ""
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
                                    </div>

                                    {/* Label + Year Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">Tahun:</span>
                                        <div className="relative">
                                            <button
                                                className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 w-24"
                                                onClick={() => setShowYearDropdown(!showYearDropdown)}
                                            >
                                                <span>{yearFilter}</span>
                                                <FaChevronDown className="ml-auto text-sm" />
                                            </button>
                                            {showYearDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                                                    {years.map((year) => (
                                                        <div
                                                            key={year}
                                                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${yearFilter === year ? "bg-blue-50 text-blue-600" : ""
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
                                    </div>

                                    {/* Export & Print Buttons */}
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-800 rounded hover:bg-gray-100 gap-2"
                                    >
                                        <FaDownload />
                                        <span>Export Excel</span>
                                    </button>

                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-800 rounded hover:bg-gray-100 gap-2"
                                    >
                                        <FaPrint />
                                        <span>Cetak Laporan</span>
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-gray-30">
                                    <tr className="text-left text-xs font-medium tracking-wider text-gray-600">
                                        <th className="px-4 py-4">No</th>
                                        <th className="px-4 py-4">Tanggal</th>
                                        <th className="px-4 py-4">No. Bukti</th>
                                        <th className="px-4 py-4">Uraian</th>
                                        <th className="px-4 py-4 text-right">Debet (Rp)</th>
                                        <th className="px-4 py-4 text-right">Kredit (Rp)</th>
                                        <th className="px-4 py-4 text-right">Saldo (Rp)</th>
                                        <th className="px-4 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {/* SALDO AWAL sticky */}
                                    {/* <tr className="font-semibold sticky top-0 z-10">
                                        <td className="p-3 text-center">-</td>
                                        <td className="p-3">01/06/2025</td>
                                        <td className="p-3">SALDO AWAL</td>
                                        <td className="p-3">Saldo Awal Periode Juni 2025</td>
                                        <td className="p-3 text-right">Rp 4.037.000.000</td>
                                        <td className="p-3 text-right">Rp 0</td>
                                        <td className="p-3 text-right">Rp 4.037.000.000</td>
                                        <td className="p-3 text-center">-</td>
                                    </tr> */}

                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="p-3 text-center">{transaction.id}</td>
                                            <td className="p-3">{transaction.tanggal}</td>
                                            <td className="p-3">{transaction.noBukti}</td>
                                            <td className="p-3">{transaction.uraian}</td>
                                            <td className="p-3 text-right">
                                                Rp {transaction.debit.toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-3 text-right">
                                                Rp {transaction.kredit.toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-3 text-right">
                                                Rp {transaction.saldo.toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        className="p-1 rounded hover:bg-blue-100 text-black"
                                                        onClick={() => handleEditClick(transaction)}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="p-1 rounded hover:bg-red-100 text-red-600"
                                                        onClick={() => handleDeleteClick(transaction)}
                                                    >
                                                        <FaRegTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="text-right p-3 font-bold">
                                            TOTAL TRANSAKSI PERIODE INI
                                        </td>
                                        <td className="text-right font-bold">
                                            Rp {totalDebit.toLocaleString("id-ID")}
                                        </td>
                                        <td className="text-right font-bold">
                                            Rp {totalKredit.toLocaleString("id-ID")}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                    <tr className="bg-blue-50 text-blue-800">
                                        <td colSpan={4} className="text-right p-3 font-bold">
                                            SALDO AKHIR PERIODE INI
                                        </td>
                                        <td colSpan={2}></td>
                                        <td className="text-right font-bold text-lg" colSpan={1}>
                                            Rp {saldoAkhir.toLocaleString("id-ID")}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {showSaldoAwalModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setShowSaldoAwalModal(false)}
                    ></div>

                    <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaWallet className="text-blue-600 w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Set Saldo Awal Periode</h3>
                            </div>

                            <button
                                onClick={() => setShowSaldoAwalModal(false)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <FaTimesCircle size={20} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Masukkan saldo awal untuk periode yang dipilih. Ini akan membuat transaksi awal pemasukan "Saldo Awal".
                            </p>

                            <div className="space-y-4">
                                {/* Bulan & Tahun */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan
                                        </label>
                                        <select
                                            name="bulan"
                                            value={formSaldoAwal.bulan}
                                            onChange={handleSaldoAwalChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {months.map((month) => (
                                                <option key={month.value} value={month.value}>
                                                    {month.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun
                                        </label>
                                        <select
                                            name="tahun"
                                            value={formSaldoAwal.tahun}
                                            onChange={handleSaldoAwalChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Nominal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span className="flex items-center gap-1">
                                            <FaDollarSign className="w-3 h-3" />
                                            Nominal Saldo Awal (Rp)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="nominal"
                                        value={formSaldoAwal.nominal}
                                        onChange={handleSaldoAwalChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowSaldoAwalModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmitSaldoAwal}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                            >
                                <FaSave className="w-3 h-3" />
                                Simpan Saldo Awal
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPosPenerimaanModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setShowPosPenerimaanModal(false)}
                    ></div>

                    <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaSliders className="text-blue-600 w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Kelola Pos Penerimaan</h3>
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
                                Tambah atau hapus daftar Pos Penerimaan yang akan digunakan dalam transaksi.
                            </p>

                            {/* Form Tambah Pos Baru */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Pos Penerimaan Baru
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPosPenerimaan}
                                        onChange={(e) => setNewPosPenerimaan(e.target.value)}
                                        className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Contoh: Donasi Penerimaan"
                                        onKeyPress={(e) => e.key === 'Enter' && handleTambahPosPenerimaan()}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Daftar Pos Penerimaan Saat Ini
                                </label>
                                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                    {posPenerimaanList.map((pos, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                            <span className="text-sm text-gray-700">{pos}</span>
                                            <button
                                                onClick={() => handleHapusPosPenerimaan(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Hapus pos penerimaan"
                                            >
                                            </button>
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
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setShowPosPengeluaranModal(false)}
                    >
                    </div>
                    <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaSliders className="text-blue-600 w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Kelola Pos Pengeluaran</h3>
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
                                Tambah atau hapus daftar Pos Pengeluaran yang akan digunakan dalam transaksi.
                            </p>

                            {/* Form Tambah Pos Baru */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Pos Pengeluaran Baru
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPosPengeluaran}
                                        onChange={(e) => setNewPosPengeluaran(e.target.value)}
                                        className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Contoh: Donasi Penerimaan"
                                        onKeyPress={(e) => e.key === 'Enter' && handleTambahPosPengeluaran()}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Daftar Pos Pengeluaran Saat Ini
                                </label>
                                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                    {posPengeluaranList.map((pos, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                            <span className="text-sm text-gray-700">{pos}</span>
                                            <button
                                                onClick={() => handleHapusPosPengeluaran(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Hapus pos pengeluaran"
                                            >
                                            </button>
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

            {showEditModal && transactionToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-w-full p-6">
                        {/* Tombol X (Batal) */}
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimesCircle className="w-5 h-5 hover:text-red-500" />
                        </button>

                        {/* Header Modal */}
                        <h2 className="text-lg font-semibold mb-4">
                            Edit Transaksi - {transactionToEdit.noBukti}
                        </h2>

                        {/* Form Edit */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Tanggal Transaksi</label>
                                <input
                                    type="date"
                                    className="w-full border px-3 py-2 rounded"
                                    value={transactionToEdit.tanggal}
                                    onChange={(e) =>
                                        setTransactionToEdit({ ...transactionToEdit, tanggal: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">No. Bukti</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded bg-gray-100"
                                    value={transactionToEdit.noBukti}
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Uraian</label>
                                <textarea
                                    className="w-full border px-3 py-2 rounded"
                                    value={transactionToEdit.uraian}
                                    onChange={(e) =>
                                        setTransactionToEdit({ ...transactionToEdit, uraian: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Debet (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full border px-3 py-2 rounded"
                                    value={transactionToEdit.debit}
                                    onChange={(e) =>
                                        setTransactionToEdit({ ...transactionToEdit, debit: Number(e.target.value) })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Kredit (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full border px-3 py-2 rounded"
                                    value={transactionToEdit.kredit}
                                    onChange={(e) =>
                                        setTransactionToEdit({ ...transactionToEdit, kredit: Number(e.target.value) })
                                    }
                                />
                            </div>
                        </div>

                        {/* Tombol Simpan & Batal */}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                // onClick={handleUpdateTransaction}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && transactionToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg p-6 w-[500px]">
                        {/* Tombol X */}
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimesCircle className="w-5 h-5 hover:text-red-500" />
                        </button>

                        {/* Konten Modal */}
                        <h2 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h2>
                        <p className="mb-2">
                            Apakah Anda yakin ingin menghapus transaksi{" "}
                            <span className="font-semibold">
                                {transactionToDelete.noBukti}
                            </span>
                            ?
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Uraian: {transactionToDelete.uraian}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(transactionToDelete.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KasUmum;
