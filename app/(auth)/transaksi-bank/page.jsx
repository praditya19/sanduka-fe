"use client";
import { useState, useEffect, useRef } from "react";
import {
  faArrowLeft,
  faChartBar,
  faChartPie,
  faFileAlt,
  faMoneyBillWave,
  faPrint,
  faSearch,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { Input } from "@/components/ui/input";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

export default function BankTransactionPage() {
  const [activeTab, setActiveTab] = useState("potongan");
  const [branch, setBranch] = useState("Semua Cabang");
  const [paymentNote, setPaymentNote] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [role, setRole] = useState("");
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [data, setData] = useState([]);
  const [dataBalancing, setDataBalancing] = useState([]);
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const bulanList = [
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
  ];
  const tahunList = Array.from({ length: 6 }, (_, i) =>
    (currentYear + i).toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [onProses, setOnProses] = useState(true);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    file: null,
    namaFile: "",
    tanggalUntuk: "",
  });
  const [jumlahPotonganBank, setJumlahPotonganBank] = useState(0);
  const [totalNominalPotonganBank, setTotalNominalPotonganBank] = useState(0);
  const [jumlahSetorTunai, setJumlahSetorTunai] = useState(0);
  const [totalNominalSetorTunai, setTotalNominalSetorTunai] = useState(0);
  const [totalTerfilter, setTotalTerfilter] = useState(0);
  const [totalNominalTerfilter, setTotalNominalTerfilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageBalancing, setCurrentPageBalancing] = useState(1);
  const [totalPagesBalancing, setTotalPagesBalancing] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchBalancing, setSearchBalancing] = useState("");

  const handleFilter = async () => {
    try {
      const result = await GlobalApi.getTransaksiBank(
        month,
        year,
        searchQuery,
        displayCount,
        currentPage - 1
      );
      setData(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  const getBalancingdata = async () => {
    try {
      let result;

      if (displayCount === "all") {
        // Pertama ambil totalElements dulu (misalnya dari halaman pertama)
        const tempResult = await GlobalApi.getTransaksiBankBalancing(
          selectedCabang,
          selectedUnitKerja,
          year,
          month,
          paymentNote,
          searchBalancing,
          1,
          0
        );

        const totalElements = tempResult.totalElements;

        // Lalu ambil semua data
        result = await GlobalApi.getTransaksiBankBalancing(
          selectedCabang,
          selectedUnitKerja,
          year,
          month,
          paymentNote,
          searchBalancing,
          totalElements,
          0
        );
      } else {
        result = await GlobalApi.getTransaksiBankBalancing(
          selectedCabang,
          selectedUnitKerja,
          year,
          month,
          paymentNote,
          searchBalancing,
          displayCount,
          currentPageBalancing - 1
        );
      }

      setDataBalancing(result.content);
      setTotalPagesBalancing(result.totalPages);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };
  useEffect(() => {
    handleFilter();
    getBalancingdata();
  }, [
    month,
    year,
    searchQuery,
    displayCount,
    paymentNote,
    searchBalancing,
    selectedCabang,
    selectedUnitKerja,
    currentPage,
    currentPageBalancing,
  ]);

  const getTotalBalancing = async () => {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    const cabang = selectedCabang || "";
    const unitKerja = unitKerjaInput || "";

    try {
      const data = await GlobalApi.getCountBalancing(
        bulan,
        tahun,
        cabang,
        unitKerja
      );
      setJumlahPotonganBank(data.jumlahPotonganBank || 0);
      setTotalNominalPotonganBank(data.totalNominalPotonganBank || 0);
      setJumlahSetorTunai(data.jumlahSetorTunai || 0);
      setTotalNominalSetorTunai(data.totalNominalSetorTunai || 0);
      setTotalTerfilter(data.totalTerfilter || 0);
      setTotalNominalTerfilter(data.totalNominalTerfilter || 0);
    } catch (error) {
      console.error("❌ Gagal mengambil data balancing:", error);
    }
  };

  useEffect(() => {
    getTotalBalancing();
  }, [selectedCabang, unitKerjaInput]);

  const formatRupiah = (angka) => {
    const parsed = Number(angka);
    if (isNaN(parsed)) return "Rp 0";
    return parsed.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    fetchCabangData();
    fetchUnitKerjaData();
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

  const fetchUnitKerjaData = async () => {
    try {
      const response = await GlobalApi.getUnitKerja();
      setUnitKerjaList(response.data);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };
  const handleUnitKerjaClick = () => {
    if (!selectedCabang) return;
    const filteredList = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase()
    );

    setFilteredUnitKerja(filteredList);
    setShowUnitKerjaDropdown(true);
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

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);

    if (!selectedCabang) return;

    const filteredList = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(true);
    setFilteredUnitKerja(filteredList);

    if (input === "") {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true
      );

      setData(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase().includes(input.toLowerCase())
      );

      setData(filteredData);
    }
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    setSearchUnitKerja(searchTerm);
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const selectedValue = unitKerja.unitKerja;
    setSelectedUnitKerja(selectedValue);
    setUnitKerjaInput(selectedValue);
    setShowUnitKerjaDropdown(false);
    setSearchUnitKerja("");

    if (!selectedValue) {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true
      );
      setData(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase() === selectedValue.toLowerCase()
      );

      setData(filteredData);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    setLoader(true);

    const uploadData = new FormData();
    uploadData.append("file", formData.file);
    uploadData.append("namaFile", formData.namaFile);
    uploadData.append("tanggalUntuk", formData.tanggalUntuk);

    try {
      const response = await GlobalApi.uploadSinkronBank(uploadData);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoader(false);
            setShowUploadModal(false);
            setProgress(0);
            return 100;
          }
          return prev + 10;
        });
        setNotification({
          type: "success",
          message: `Data Berhasil Terupload!`,
        });
      }, 300);
    } catch (error) {
      console.error("Upload gagal:", error);
      setLoader(false);
      setNotification({
        type: "error",
        message: `Gagal Upload Data!`,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
  };

  const formatTanggal = (tanggalArray) => {
    if (!Array.isArray(tanggalArray) || tanggalArray.length < 3) return "";

    const [year, month, day] = tanggalArray;

    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    return `${dd}/${mm}/${year}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const exportAllToExcel = async () => {
    try {
      setIsLoading(true);
      const allData = [];
      let currentPage = 0;
      const pageSize = 100;
      let totalPages = 1;

      while (currentPage < totalPages) {
        const result = await GlobalApi.getTransaksiBank(
          null,
          null,
          null,
          pageSize,
          currentPage
        );

        allData.push(...result.content);
        totalPages = result.totalPages;
        currentPage++;
      }

      const formattedData = allData.map((item, index) => ({
        No: index + 1,
        Rekening: item.rekening,
        "Nama Anggota": item.namaAnggota,
        "Rekening Kabupaten": item.rekeningKabupaten,
        Potongan: item.potongan,
        "Tgl. Potongan": formatTanggal(item.tanggalPemotongan),
        Transaksi: item.transaksi,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Potongan Bank");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "potongan-bank.xlsx");
    } catch (error) {
      console.error("Gagal mengekspor data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      const allData = [];
      let currentPage = 0;
      const pageSize = 100;

      let totalPages = 1;

      while (currentPage < totalPages) {
        const result = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          pageSize,
          currentPage
        );

        allData.push(...result.content);
        totalPages = result.totalPages;
        currentPage++;
      }

      const formattedData = allData.map((item, index) => ({
        No: index + 1,
        Rekening: item.rekening,
        "Nama Anggota": item.namaAnggota,
        "Rekening Kabupaten": item.rekeningKabupaten,
        Potongan: item.potongan,
        "Tgl. Potongan": formatTanggal(item.tanggalPemotongan),
        Transaksi: item.transaksi,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        header: [
          "No",
          "Rekening",
          "Nama Anggota",
          "Rekening Kabupaten",
          "Potongan",
          "Tgl. Potongan",
          "Transaksi",
        ],
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "potonganbnk");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "potongan-bank.xlsx");
    } catch (error) {
      console.error("Gagal mengekspor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAllBalancingToExcel = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let currentPage = 0;
      const pageSize = 100;
      let totalPages = 1;

      const firstResult = await GlobalApi.getTransaksiBankBalancing(
        null,
        null,
        null,
        null,
        null,
        pageSize,
        currentPage
      );

      allData = [...allData, ...firstResult.content];
      totalPages = firstResult.totalPages;
      currentPage++;

      while (currentPage < totalPages) {
        const result = await GlobalApi.getTransaksiBankBalancing(
          null,
          null,
          null,
          null,
          null,
          pageSize,
          currentPage
        );

        allData = [...allData, ...result.content];
        currentPage++;
      }

      const rekeningCount = {};
      allData.forEach((item) => {
        if (item.rekening) {
          rekeningCount[item.rekening] =
            (rekeningCount[item.rekening] || 0) + 1;
        }
      });

      const formattedData = allData.map((item, index) => ({
        No: index + 1,
        Cabang: item.cabang,
        "Unit Kerja": item.unitKerja,
        Nama: item.nama,
        Rekening: item.rekening,
        Iuran: item.totalIuranAnggota,
        Sanduka: item.totalIuranSanduka,
        Daspen: item.totalIuranDaspen,
        Derap: item.totalIuranDerap,
        Kalender: item.totalIuranKalender,
        "Lain-lain": item.totalIuranSumbangan,
        "Total Iuran": item.totalIuran,
        "Potongan Bank": item.potongan,
        Selisih: item.selisih,
        Keterangan: item.keterangan,
        "Cek Duplicate":
          item.rekening && rekeningCount[item.rekening] > 1 ? "Duplicate" : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Balancing Potongan");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "balancing-potongan-semua.xlsx");
    } catch (err) {
      console.error("Gagal mengekspor data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const exportBalancingToExcel = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let currentPage = 0;
      let isLastPage = false;
      const pageSize = 100;

      while (currentPage < totalPages) {
        const result = await GlobalApi.getTransaksiBankBalancing(
          selectedCabang,
          selectedUnitKerja,
          year,
          month,
          paymentNote,
          pageSize,
          currentPage
        );

        allData = [...allData, ...result.content];
        isLastPage = result.last;
        currentPage++;
      }

      const rekeningCount = {};
      allData.forEach((item) => {
        rekeningCount[item.rekening] = (rekeningCount[item.rekening] || 0) + 1;
      });

      const formattedData = allData.map((item, index) => ({
        No: index + 1,
        Cabang: item.cabang,
        "Unit Kerja": item.unitKerja,
        Nama: item.nama,
        Rekening: item.rekening,
        Iuran: item.totalIuranAnggota,
        Sanduka: item.totalIuranSanduka,
        Daspen: item.totalIuranDaspen,
        Derap: item.totalIuranDerap,
        Kalender: item.totalIuranKalender,
        "Lain-lain": item.totalIuranSumbangan,
        "Total Iuran": item.totalIuran,
        "Potongan Bank": item.potongan,
        Selisih: item.selisih,
        Keterangan: item.keterangan,
        "Cek Duplicate": rekeningCount[item.rekening] > 1 ? "Duplicate" : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Balancing Potongan");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "balancing-potongan-semua.xlsx");
    } catch (err) {
      console.error("Gagal mengekspor data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxPagesToShow - 1, totalPages);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(end - maxPagesToShow + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };
  // Balancing
  const handlePageClickBalancing = (page) => {
    setCurrentPageBalancing(page);
  };

  const handlePreviousPageBalancing = () => {
    setCurrentPageBalancing((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPageBalancing = () => {
    setCurrentPageBalancing((prev) => Math.min(prev + 1, totalPagesBalancing));
  };

  const getVisiblePagesBalancing = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(currentPageBalancing - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPagesBalancing);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };
  const startIndex =
    displayCount === "all" ? 0 : (currentPageBalancing - 1) * displayCount;

  const endIndex =
    displayCount === "all" ? dataBalancing.length : startIndex + displayCount;

  const pageData =
    displayCount === "all"
      ? dataBalancing
      : dataBalancing.slice(startIndex, endIndex);

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
          className={`pt-20 pb-8 px-4 md:px-8 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
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
            <h1 className="text-2xl font-bold text-gray-800">
              Transaksi Pemotongan Bank
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola dan lihat data transaksi pemotongan bank serta lakukan
              balancing.
            </p>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm mb-8 ${
              activeTab === "potongan" ? "w-full" : "w-[1900px]"
            }`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Ringkasan Pembayaran Anggota
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Data berdasarkan filter pada tab aktif di bawah.
                  </p>
                </div>
                {typeof window !== "undefined" &&
                  sessionStorage.getItem("role") === "SUPER ADMIN" && (
                    <div>
                      <button
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 transition"
                        onClick={() => setShowUploadModal(true)}
                      >
                        Upload Data
                      </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-white border border-teal-100">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faUsers} className="text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-700">
                    Anggota Potongan Bank
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {" "}
                  {jumlahPotonganBank} Anggota
                </p>
                <p className="text-gray-600 text-sm">
                  Total Nominal: {formatRupiah(totalNominalPotonganBank)}{" "}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-blue-600"
                    />
                  </div>
                  <h3 className="font-medium text-gray-700">
                    Anggota Setor Tunai
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {jumlahSetorTunai} Anggota
                </p>
                <p className="text-gray-600 text-sm">
                  Total Nominal: {formatRupiah(totalNominalSetorTunai)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon
                      icon={faChartPie}
                      className="text-indigo-600"
                    />
                  </div>
                  <h3 className="font-medium text-gray-700">
                    Total Anggota Terfilter
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {totalTerfilter} Anggota
                </p>
                <p className="text-gray-600 text-sm">
                  Total Nominal: {formatRupiah(totalNominalTerfilter)}
                </p>
              </div>
            </div>
          </div>

          {showUploadModal && (
            <>
              <div
                className="fixed inset-0 bg-black opacity-50 z-40"
                onClick={handleCloseModal}
              ></div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={handleCloseModal}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold mb-4">Upload Data</h2>
                  <form onSubmit={handleSubmitUpload}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Upload File
                      </label>
                      <input
                        type="file"
                        name="file"
                        onChange={handleInputChange}
                        className="block w-full mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nama File
                      </label>
                      <input
                        type="text"
                        name="namaFile"
                        onChange={handleInputChange}
                        className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                        placeholder="Contoh: Potongan Bank Bulan Mei"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tanggal Untuk
                      </label>
                      <input
                        type="date"
                        name="tanggalUntuk"
                        onChange={handleInputChange}
                        className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                        disabled={loader}
                      >
                        {loader ? `Uploading... ${progress}%` : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

          <div
            className={`flex mb-6 border-b border-gray-200 ${
              activeTab === "potongan" ? "w-full" : "w-[1900px]"
            }`}
          >
            {["potongan", "balancing", "rekapitulasi"].map((tab) => (
              <button
                key={tab}
                className={`w-full text-center py-3 px-5 font-medium transition-colors duration-200 
        ${
          activeTab === tab
            ? "bg-teal-100 text-teal-700 border-b-2 border-teal-600"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "potongan"
                  ? "Potongan Bank"
                  : tab === "balancing"
                  ? "Balancing Potongan"
                  : "Rekap Data Keuangan"}
              </button>
            ))}
          </div>

          {activeTab === "potongan" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Data Potongan Bank
                </h2>
                <div className="flex gap-3">
                  <button
                    className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                      isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={exportAllToExcel}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="hover:text-white transition"
                        >
                          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                        </svg>
                        Cetak Seluruh Potongan
                      </>
                    )}
                  </button>
                  <button
                    className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                      isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={exportToExcel}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="hover:text-white transition"
                        >
                          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                        </svg>
                        Cetak Potongan
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <option key={bulan.value} value={bulan.value}>
                          {bulan.label}
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        No
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Rekening
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Nama Anggota
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Rekening Kabupaten
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Potongan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Tgl. Potongan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Transaksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.length > 0 ? (
                      data.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {(currentPage - 1) * displayCount + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.rekening}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.namaAnggota}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.rekeningKabupaten}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.potongan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatTanggal(item.tanggalPemotongan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.transaksi}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-sm text-gray-500 border-b"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="text-gray-300 text-4xl mb-3"
                            />
                            <p>
                              Tidak ada data transaksi bank yang cocok dengan
                              filter Anda.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="p-4 border-t">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handlePageClick(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                      First
                    </button>
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Prev
                    </button>

                    {getVisiblePages().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          page === currentPage
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {totalPages > 3 && currentPage < totalPages - 3 && (
                      <span className="px-2 py-1">...</span>
                    )}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageClick(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      Last
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "balancing" && (
            <div className="bg-white rounded-xl shadow-sm w-[1900px]">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Balancing Potongan
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Rekonsiliasi iuran anggota dengan data potongan bank.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                        isLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      onClick={exportAllBalancingToExcel}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-black"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="hover:text-white transition"
                          >
                            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                          </svg>
                          Cetak Seluruh Balancing
                        </>
                      )}
                    </button>
                    <button
                      className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                        isLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      onClick={exportBalancingToExcel}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-black"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="hover:text-white transition"
                          >
                            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                          </svg>
                          Cetak Balancing Potongan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cabang
                    </label>
                    <div className="flex items-center relative" ref={cabangRef}>
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
                            {[...filteredCabangList].map((cabang) => (
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
                  <div className="flex flex-col relative" ref={unitKerjaRef}>
                    <p>Unit Kerja</p>
                    <Input
                      type="text"
                      value={unitKerjaInput}
                      onChange={handleUnitKerjaChange}
                      placeholder="Pilih Unit Kerja"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                      disabled={!selectedCabang}
                      onClick={handleUnitKerjaClick}
                    />
                    {showUnitKerjaDropdown && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchUnitKerja}
                              onChange={(e) =>
                                handleUnitKerjaSearch(e.target.value)
                              }
                              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                              placeholder="Cari Unit Kerja..."
                              autoFocus
                            />
                          </li>
                          <li
                            onClick={() =>
                              handleUnitKerjaSelect({ unitKerja: "" })
                            }
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          >
                            Pilih Unit Kerja
                          </li>
                          {filteredUnitKerja.map((unitKerja) => (
                            <li
                              key={unitKerja.id}
                              onClick={() => handleUnitKerjaSelect(unitKerja)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {unitKerja.unitKerja}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulan Transaksi
                    </label>
                    <select
                      className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {bulanList.map((bulan) => (
                        <option key={bulan.value} value={bulan.value}>
                          {bulan.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Transaksi
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
                      Tampilan
                    </label>
                    <select
                      className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                      value={displayCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDisplayCount(
                          value === "all" ? "all" : Number(value)
                        );
                        setCurrentPageBalancing(1); // reset page
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cari Anggota/Rekening
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchBalancing}
                        onChange={(e) => setSearchBalancing(e.target.value)}
                        className="w-full h-10 text-base px-4 pr-12 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                        placeholder="Ketik nama atau rekening"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ket. Pembayaran
                    </label>
                    <select
                      className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                    >
                      <option value="">Pilih Keterangan</option>
                      <option value="Sukses">Sukses</option>
                      <option value="Gagal">Gagal</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        No
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Cabang
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Unit Kerja
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Rekening
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Iuran
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Sanduka
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Daspen
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Derap
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Kalender
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Lain-lain
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Total Iuran
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Potongan Bank
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Selisih
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataBalancing.length > 0 ? (
                      dataBalancing.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {displayCount === "all"
                              ? index + 1
                              : (currentPageBalancing - 1) * displayCount +
                                index +
                                1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.cabang}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.unitKerja}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.rekening}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranAnggota)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranSanduka)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranDaspen)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranDerap)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranKalender)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuranKalender)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.totalIuran)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.potongan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatRupiah(item.selisih)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {item.keterangan}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={15}
                          className="px-6 py-8 text-center text-sm text-gray-500 border-b"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="text-gray-300 text-4xl mb-3"
                            />
                            <p>
                              Tidak ada data transaksi bank yang cocok dengan
                              filter Anda.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td colSpan={5} className="px-6 py-4 text-center">
                        Total
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranAnggota,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranSanduka,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranDaspen,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranDerap,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranKalender,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuranKalender,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.totalIuran,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.potongan,
                            0
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          dataBalancing.reduce(
                            (sum, item) => sum + item.selisih,
                            0
                          )
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="p-4 border-t">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handlePageClickBalancing(1)}
                      disabled={currentPageBalancing === 1}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                      First
                    </button>

                    <button
                      onClick={handlePreviousPageBalancing}
                      disabled={currentPageBalancing === 1}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Prev
                    </button>

                    {getVisiblePagesBalancing().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClickBalancing(page)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          page === currentPageBalancing
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {totalPagesBalancing > 3 &&
                      currentPageBalancing < totalPagesBalancing - 3 && (
                        <span className="px-2 py-1">...</span>
                      )}

                    <button
                      onClick={handleNextPageBalancing}
                      disabled={currentPageBalancing === totalPagesBalancing}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        handlePageClickBalancing(totalPagesBalancing)
                      }
                      disabled={currentPageBalancing === totalPagesBalancing}
                      className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                    >
                      Last
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rekapitulasi" && (
            <div className="bg-white rounded-xl shadow-sm w-[1900px]">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Rekap Data Keuangan
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Rekonsiliasi iuran anggota dengan data potongan bank.
                    </p>
                  </div>
                  <button
                    className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                      isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={exportAllBalancingToExcel}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="hover:text-white transition"
                        >
                          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                        </svg>
                        Cetak Rekap Data Keuangan
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cabang
                      </label>
                      <div
                        className="flex items-center relative"
                        ref={cabangRef}
                      >
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
                              {[...filteredCabangList].map((cabang) => (
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
                        Bulan Transaksi
                      </label>
                      <select
                        className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      >
                        {bulanList.map((bulan) => (
                          <option key={bulan.value} value={bulan.value}>
                            {bulan.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Transaksi
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
                        Ket. Pembayaran
                      </label>
                      <select
                        className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                      >
                        <option value="">Pilih Keterangan</option>
                        <option value="Sukses">Sukses</option>
                        <option value="Gagal">Gagal</option>
                        <option value="Tunai">Tunai</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {onProses ? (
                <div className="text-center animate-slide-up mt-28">
                  <p className="text-gray-600 text-2xl font-medium">
                    Sedang Proses
                    <span className="inline-block dot-animation ml-1">.</span>
                    <span
                      className="inline-block dot-animation ml-0.5"
                      style={{ animationDelay: "0.2s" }}
                    >
                      .
                    </span>
                    <span
                      className="inline-block dot-animation ml-0.5"
                      style={{ animationDelay: "0.4s" }}
                    >
                      .
                    </span>
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          Rekap Data Keuangan
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Rekonsiliasi iuran anggota dengan data potongan bank.
                        </p>
                      </div>
                      <button
                        className={`px-4 py-2 rounded border border-black hover:bg-teal-500 hover:text-white transition flex items-center gap-2 text-sm ${
                          isLoading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        onClick={exportAllBalancingToExcel}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-black"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              className="hover:text-white transition"
                            >
                              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                            </svg>
                            Cetak Rekap Data Keuangan
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cabang
                          </label>
                          <div
                            className="flex items-center relative"
                            ref={cabangRef}
                          >
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
                                  {[...filteredCabangList].map((cabang) => (
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
                            Bulan Transaksi
                          </label>
                          <select
                            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                          >
                            {bulanList.map((bulan) => (
                              <option key={bulan.value} value={bulan.value}>
                                {bulan.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tahun Transaksi
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
                            Ket. Pembayaran
                          </label>
                          <select
                            className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                          >
                            <option value="">Pilih Keterangan</option>
                            <option value="Sukses">Sukses</option>
                            <option value="Gagal">Gagal</option>
                            <option value="Tunai">Tunai</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              No
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Cabang
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Unit Kerja
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Nama
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Rekening
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Iuran
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Sanduka
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Daspen
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Derap
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Kalender
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Lain-lain
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Total Iuran
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Potongan Bank
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Selisih
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Keterangan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataBalancing.length > 0 ? (
                            dataBalancing.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {(currentPageBalancing - 1) * displayCount +
                                    index +
                                    1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.cabang}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.unitKerja}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.nama}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.rekening}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranAnggota}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranSanduka}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranDaspen}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranDerap}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranKalender}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuranKalender}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.totalIuran}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.potongan}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.selisih}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {item.keterangan}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={15}
                                className="px-6 py-8 text-center text-sm text-gray-500 border-b"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <FontAwesomeIcon
                                    icon={faSearch}
                                    className="text-gray-300 text-4xl mb-3"
                                  />
                                  <p>
                                    Tidak ada data transaksi bank yang cocok
                                    dengan filter Anda.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="p-4 border-t">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => handlePageClickBalancing(1)}
                            disabled={currentPageBalancing === 1}
                            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                              />
                            </svg>
                            First
                          </button>

                          <button
                            onClick={handlePreviousPageBalancing}
                            disabled={currentPageBalancing === 1}
                            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            Prev
                          </button>

                          {getVisiblePagesBalancing().map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageClickBalancing(page)}
                              className={`px-3 py-1 border rounded-md text-sm ${
                                page === currentPageBalancing
                                  ? "bg-teal-600 text-white border-teal-600"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          {totalPagesBalancing > 3 &&
                            currentPageBalancing < totalPagesBalancing - 3 && (
                              <span className="px-2 py-1">...</span>
                            )}

                          <button
                            onClick={handleNextPageBalancing}
                            disabled={
                              currentPageBalancing === totalPagesBalancing
                            }
                            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                          >
                            Next
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              handlePageClickBalancing(totalPagesBalancing)
                            }
                            disabled={
                              currentPageBalancing === totalPagesBalancing
                            }
                            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                          >
                            Last
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
