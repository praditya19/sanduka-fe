"use client";
import { useState, useEffect, useRef } from "react";
import { faArrowLeft, faChartBar, faChartPie, faFileAlt, faMoneyBillWave, faPrint, faSearch, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { Input } from "@/components/ui/input";
import GlobalApi from "@/app/_utils/GlobalApi";

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
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
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

const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const tahunList = Array.from({ length: 10 }, (_, i) => 2021 + i);

export default function BankTransactionPage() {
    const [activeTab, setActiveTab] = useState("potongan");
    const [branch, setBranch] = useState("Semua Cabang");
    const [month, setMonth] = useState("Mei");
    const [year, setYear] = useState("2025");
    const [searchQuery, setSearchQuery] = useState("");
    const [displayCount, setDisplayCount] = useState(10);
    const [paymentNote, setPaymentNote] = useState("Semua Keterangan");
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const [notification, setNotification] = useState(null);
    const [selectedCabang, setSelectedCabang] = useState("");
    const [showCabangDropdown, setShowCabangDropdown] = useState(false);
    const [filteredCabangList, setFilteredCabangList] = useState([]);
    const [originalCabangList, setOriginalCabangList] = useState([]);
    const [cabangOptions, setCabangOptions] = useState([]);
    const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
    const dropdownRef = useRef(null);
    const [role, setRole] = useState("");

    useEffect(() => {
        fetchCabangData();
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const fetchCabangData = async () => {
        try {
            const cabangResponse = await GlobalApi.getCabang();

            setOriginalCabangList(cabangResponse.data);
            setCabangOptions(cabangResponse.data);
            setFilteredCabangOptions(cabangResponse.data);

            const storedRole = sessionStorage.getItem("role");
            const storedCabang = sessionStorage.getItem("cabang");

            setRole(storedRole || "");
            if (storedRole === "ADMIN" && storedCabang) {
                setSelectedCabang(storedCabang);
            }
        } catch (error) {
            console.error("Error fetching cabang data:", error);
        }
    };

    const handleCabangClick = () => {
        setFilteredCabangList(originalCabangList);
        setShowCabangDropdown(true);
    };

    const handleSelectCabang = async (cabang) => {
        setSelectedCabang(cabang.kecamatan);
        setShowCabangDropdown(false);
    };

    const handleCabangSearch = (query) => {
        const filtered = originalCabangList.filter((cabang) =>
            cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCabangList(filtered);
    };

    const handleBackClick = () => {
        router.back();
    };

    const toggleSidebar = () => {
        const newSidebarState = !isSidebarOpen;
        setIsSidebarOpen(newSidebarState);
        localStorage.setItem("isSidebarOpen", newSidebarState);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-4">
            <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-4 md:px-8 shadow-lg fixed top-0 left-0 w-full z-50 flex items-center">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            size="sm"
                            onClick={handleBackClick}
                            className="cursor-pointer mr-4"
                        />
                        <h1 className="text-base">Transaksi Bank</h1>
                    </div>
                </div>
            </header>

            <div>
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div
                    className={`pt-20 pb-8 px-4 md:px-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
                        }`}
                >
                    {notification && (
                        <NotificationPopup
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification(null)}
                        />
                    )}

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Transaksi Pemotongan Bank</h1>
                        <p className="text-gray-600 mt-2">
                            Kelola dan lihat data transaksi pemotongan bank serta lakukan balancing.
                        </p>
                    </div>

                    <div className="flex mb-6 border-b border-gray-200">
                        <button
                            className={`py-3 px-5 font-medium relative transition-colors duration-200 ${activeTab === "potongan"
                                ? "text-teal-600 border-b-2 border-teal-600"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                            onClick={() => setActiveTab("potongan")}
                        >
                            Potongan Bank
                        </button>
                        <button
                            className={`py-3 px-5 font-medium relative transition-colors duration-200 ${activeTab === "balancing"
                                ? "text-teal-600 border-b-2 border-teal-600"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                            onClick={() => setActiveTab("balancing")}
                        >
                            Balancing Potongan
                        </button>
                        <button
                            className={`py-3 px-5 font-medium relative transition-colors duration-200 ${activeTab === "rekapitulasi"
                                ? "text-teal-600 border-b-2 border-teal-600"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                            onClick={() => setActiveTab("rekapitulasi")}
                        >
                            Rekap Data Keuangan
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Ringkasan Pembayaran Anggota
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Data berdasarkan filter pada tab aktif di bawah.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-white border border-teal-100">
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faUsers} className="text-teal-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-700">Anggota Potongan Bank</h3>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">0 Anggota</p>
                                <p className="text-gray-600 text-sm">Total Nominal: Rp 0</p>
                            </div>

                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-700">Anggota Setor Tunai</h3>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">0 Anggota</p>
                                <p className="text-gray-600 text-sm">Total Nominal: Rp 0</p>
                            </div>

                            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faChartPie} className="text-indigo-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-700">Total Anggota Terfilter</h3>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">0 Anggota</p>
                                <p className="text-gray-600 text-sm">Total Nominal: Rp 0</p>
                            </div>
                        </div>
                    </div>

                    {activeTab === "potongan" && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Data Potongan Bank</h2>
                            </div>

                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cabang
                                        </label>
                                        <div className="flex items-center relative">
                                            <Input
                                                type="text"
                                                value={selectedCabang}
                                                readOnly
                                                disabled={role === "ADMIN"}
                                                onClick={handleCabangClick}
                                                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                                                placeholder="Pilih Cabang"
                                            />
                                            {showCabangDropdown && (
                                                <div
                                                    ref={dropdownRef}
                                                    className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                                                    style={{ top: "100%", left: 0 }}
                                                >
                                                    <ul className="max-h-44 overflow-y-auto">
                                                        <li className="py-2 px-2">
                                                            <Input
                                                                type="text"
                                                                onChange={(e) =>
                                                                    handleCabangSearch(e.target.value)
                                                                }
                                                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                                                                placeholder="Cari atau ketik Cabang..."
                                                                autoFocus
                                                            />
                                                        </li>
                                                        <li
                                                            onClick={() =>
                                                                handleSelectCabang({ kecamatan: "" })
                                                            }
                                                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                                        >
                                                            Pilih Cabang
                                                        </li>
                                                        {[
                                                            ...filteredCabangList,
                                                        ].map((cabang) => (
                                                            <li
                                                                key={cabang.id}
                                                                onClick={() => handleSelectCabang(cabang)}
                                                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                                            >
                                                                {cabang.kecamatan}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan
                                        </label>
                                        <select
                                            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                        >
                                            {bulanList.map((bulan) => (
                                                <option key={bulan} value={bulan}>
                                                    {bulan}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun
                                        </label>
                                        <select
                                            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            {tahunList.map((tahun) => (
                                                <option key={tahun} value={tahun}>
                                                    {tahun}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cari Anggota/Rekening
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full h-10 text-base px-4 pr-12 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                                placeholder="Ketik nama atau rekening"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tampilan
                                        </label>
                                        <select
                                            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={displayCount}
                                            onChange={(e) => setDisplayCount(Number(e.target.value))}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Cabang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rekening</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Nama Anggota</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rekening Kabupaten</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Potongan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Tgl. Potongan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Transaksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500 border-b">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FontAwesomeIcon icon={faSearch} className="text-gray-300 text-4xl mb-3" />
                                                    <p>Tidak ada data transaksi bank yang cocok dengan filter Anda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "balancing" && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Balancing Potongan</h2>
                                <p className="text-gray-600 mt-1">
                                    Rekonsiliasi iuran anggota dengan data potongan bank.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cabang
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                        >
                                            <option>Semua Cabang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan Transaksi
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                        >
                                            <option selected>Mei</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun Transaksi
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            <option selected>2025</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ket. Pembayaran
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={paymentNote}
                                            onChange={(e) => setPaymentNote(e.target.value)}
                                        >
                                            <option>Semua Keterangan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Cabang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Unit Kerja</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rekening</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Iuran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Sanduka</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Daspen</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Dengo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Kalender</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Lain-lain</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Iuran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Potongan Bank</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Selisih</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={15} className="px-6 py-8 text-center text-sm text-gray-500 border-b">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-gray-300 text-4xl mb-3" />
                                                    <p>Tidak ada data balancing potongan yang cocok dengan filter Anda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "rekapitulasi" && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Rekap Data Keuangan</h2>
                                <p className="text-gray-600 mt-1">
                                    Rekonsiliasi iuran anggota dengan data potongan bank.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cabang
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                        >
                                            <option>Semua Cabang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan Transaksi
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                        >
                                            <option selected>Mei</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun Transaksi
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            <option selected>2025</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ket. Pembayaran
                                        </label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={paymentNote}
                                            onChange={(e) => setPaymentNote(e.target.value)}
                                        >
                                            <option>Semua Keterangan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Cabang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Unit Kerja</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Rekening</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Iuran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Sanduka</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Daspen</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Dengo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Kalender</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Lain-lain</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Iuran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Potongan Bank</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Selisih</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={15} className="px-6 py-8 text-center text-sm text-gray-500 border-b">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FontAwesomeIcon icon={faChartBar} className="text-gray-300 text-4xl mb-3" />
                                                    <p>Tidak ada data rekap data keuangan yang cocok dengan filter Anda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="font-medium text-gray-800 mb-2 sm:mb-0">Cetak Rekap Data Keuangan</h3>
                                    <div className="flex items-center">
                                        <label className="block text-sm font-medium text-gray-700 mr-2">
                                            Ket. Pembayaran:
                                        </label>
                                        <select
                                            className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                                            value={paymentNote}
                                            onChange={(e) => setPaymentNote(e.target.value)}
                                        >
                                            <option>Semua Keterangan</option>
                                        </select>
                                        <button className="ml-3 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                                            <FontAwesomeIcon icon={faPrint} className="mr-2" />
                                            Cetak
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
