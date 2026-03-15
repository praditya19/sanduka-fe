"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  faArrowLeft,
  faChartPie,
  faMoneyBillWave,
  faSearch,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
  FaTrash,
  FaSave,
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
        return "text-[#0B131E]";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteBalancing, setShowDeleteBalancing] = useState(false);
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
  const [openCabang, setOpenCabang] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [searchDropCabang, setSearchDropCabang] = useState("");
  const [searchDropUnit, setSearchDropUnit] = useState("");
  const [showImportBalancing, setShowImportBalancing] = useState(false);
  const [fileImport, setFileImport] = useState(null);
  const [tagihanUntukBulan, setTagihanUntukBulan] = useState("");
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [displayCountPotongan, setDisplayCountPotongan] = useState(10);
  const [data, setData] = useState([]);
  const [dataBalancing, setDataBalancing] = useState([]);
  const [dataRekapitulasi, setDataRekapitulasi] = useState([]);
  const [loadingRekapitulasi, setLoadingRekapitulasi] = useState(false);
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const bulanList = [
    { label: "Semua Bulan", value: "all" },
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
  const tahunList = [
    { label: "Semua Tahun", value: "all" },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: (currentYear - 2 + i).toString(),
      value: (currentYear - 2 + i).toString(),
    })),
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [onProses, setOnProses] = useState(true);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    file: null,
    namaFile: "",
    tanggalUntuk: "",
  });
  const [resetData, setResetData] = useState("");
  const [resetUntukBulan, setResetUntukBulan] = useState("");
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [loadingBalancing, setLoadingBalancing] = useState(false);
  const updatedRowRef = useRef(null);
  const [updatedId, setUpdatedId] = useState(null);
  const cekRole = sessionStorage.getItem("role");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [listCabang, setListCabang] = useState([]);
  const [listUnitKerja, setListUnitKerja] = useState([]);
  const [loadingUnitKerja, setLoadingUnitKerja] = useState(false);

  const handleFilter = async () => {
    setData([]);
    setLoadingFilter(true);
    try {
      let result;

      if (displayCountPotongan === "all") {
        const tempResult = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          1,
          0,
        );

        const totalElements = tempResult.totalElements;

        result = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          totalElements,
          0,
        );
      } else {
        result = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          displayCountPotongan,
          currentPage - 1,
        );
      }

      setData(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoadingFilter(false);
    }
  };

  const getBalancingdata = async () => {
    setDataBalancing([]);
    setCurrentPageBalancing(1);
    setLoadingBalancing(true);

    try {
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      let cabangFilter = "";
      if (storedRole === "ADMIN") {
        cabangFilter = storedCabang || "";
      } else {
        cabangFilter = selectedCabang || "";
      }

      const result = await GlobalApi.getTransaksiBankBalancing(
        cabangFilter,
        selectedUnitKerja || null,
        year === "all" ? null : year ? parseInt(year) : null,
        month === "all" ? null : month ? parseInt(month) : null,
        paymentNote || null,
        searchBalancing || null,
      );

      const safeResult = Array.isArray(result) ? result : [];

      const filteredByCabang = safeResult.filter(
        (item) => !cabangFilter || item.cabang === cabangFilter,
      );

      const filteredByUnitKerja = filteredByCabang.filter(
        (item) => !selectedUnitKerja || item.unitKerja === selectedUnitKerja,
      );

      const finalData = filterDataByNPA(filteredByUnitKerja);

      setDataBalancing(finalData);
    } catch (err) {
      console.error("❌ Gagal memuat data:", err);
      setDataBalancing([]);
    } finally {
      setLoadingBalancing(false);
    }
  };

  const filterDataByNPA = (dataToFilter) => {
    const npaMap = {};

    dataToFilter.forEach((item) => {
      const npa = item.npa;

      if (!npaMap[npa] || item.id > npaMap[npa].id) {
        npaMap[npa] = item;
      }
    });

    return Object.values(npaMap);
  };

  const getRekapitulasiData = async () => {
    setDataRekapitulasi([]);
    setLoadingRekapitulasi(true);

    try {
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      let cabangFilter = "";
      if (storedRole === "ADMIN") {
        cabangFilter = storedCabang || "";
      } else {
        cabangFilter = selectedCabang || "";
      }

      const result = await GlobalApi.getTransaksiBankBalancing(
        cabangFilter,
        selectedUnitKerja || null,
        year === "all" ? null : year ? parseInt(year) : null,
        month === "all" ? null : month ? parseInt(month) : null,
        paymentNote || null,
        searchBalancing || null,
      );

      const safeResult = Array.isArray(result) ? result : [];

      const filteredByCabang = safeResult.filter(
        (item) => !cabangFilter || item.cabang === cabangFilter,
      );

      const filteredByUnitKerja = filteredByCabang.filter(
        (item) => !selectedUnitKerja || item.unitKerja === selectedUnitKerja,
      );

      const npaMap = {};
      filteredByUnitKerja.forEach((item) => {
        const key = `${item.cabang}-${item.unitKerja}-${item.npa}`;

        if (!npaMap[key] || item.id > npaMap[key].id) {
          npaMap[key] = item;
        }
      });

      const rekapMap = {};
      Object.values(npaMap).forEach((item) => {
        const key = `${item.cabang}-${item.unitKerja}`;

        if (!rekapMap[key]) {
          rekapMap[key] = {
            cabang: item.cabang,
            unitKerja: item.unitKerja,
            iuran: 0,
            sanduka: 0,
            daspen: 0,
            derap: 0,
            kalender: 0,
            lainLain: 0,
            potonganBank: 0,
            uniqueNPA: new Set(),
          };
        }

        rekapMap[key].iuran += item.totalIuranAnggota || 0;
        rekapMap[key].sanduka += item.totalIuranSanduka || 0;
        rekapMap[key].daspen += item.totalIuranDaspen || 0;
        rekapMap[key].derap += item.totalIuranDerap || 0;
        rekapMap[key].kalender += item.totalIuranKalender || 0;
        rekapMap[key].lainLain += item.totalIuranSumbangan || 0;
        rekapMap[key].potonganBank += item.potongan || 0;
        rekapMap[key].uniqueNPA.add(item.npa);
      });

      const rekapArray = Object.values(rekapMap).map((item, index) => {
        const totalIuran =
          item.iuran +
          item.sanduka +
          item.daspen +
          item.derap +
          item.kalender +
          item.lainLain;
        const selisih = totalIuran - item.potonganBank;

        return {
          id: index,
          cabang: item.cabang,
          unitKerja: item.unitKerja,
          iuran: item.iuran,
          sanduka: item.sanduka,
          daspen: item.daspen,
          derap: item.derap,
          kalender: item.kalender,
          lainLain: item.lainLain,
          totalIuran: totalIuran,
          potonganBank: item.potonganBank,
          selisih: selisih,
          jumlahAnggota: item.uniqueNPA.size,
        };
      });

      setDataRekapitulasi(rekapArray);
    } catch (err) {
      console.error("❌ Gagal memuat rekapitulasi:", err);
      setDataRekapitulasi([]);
    } finally {
      setLoadingRekapitulasi(false);
    }
  };

  useEffect(() => {
    handleFilter();
    getPotonganBank();
    getSetorTunai();
    getAnggotaTerfilter();
  }, [
    month,
    year,
    searchQuery,
    displayCount,
    displayCountPotongan,
    currentPage,
  ]);

  useEffect(() => {
    getBalancingdata();
  }, [
    selectedCabang,
    selectedUnitKerja,
    year,
    month,
    paymentNote,
    searchBalancing,
  ]);

  useEffect(() => {
    if (activeTab === "rekapitulasi") {
      getRekapitulasiData();
    }
  }, [
    activeTab,
    selectedCabang,
    selectedUnitKerja,
    year,
    month,
    paymentNote,
    searchBalancing,
  ]);

  useEffect(() => {
    if (showEditModal) {
      const fetchCabang = async () => {
        try {
          const res = await GlobalApi.getCabang();

          setListCabang(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
          console.error(error);
          setListCabang([]);
        }
      };

      fetchCabang();
    }
  }, [showEditModal]);

  useEffect(() => {
    if (editData?.cabang) {
      fetchUnitKerja(editData.cabang);
    }
  }, [editData?.cabang]);

  const fetchUnitKerja = async (cabang) => {
    try {
      setLoadingUnitKerja(true);
      const res = await GlobalApi.getUnitKerjaByCabang(cabang);

      setListUnitKerja(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("ERROR UNIT KERJA:", error);
      setListUnitKerja([]);
    } finally {
      setLoadingUnitKerja(false);
    }
  };

  const getPotonganBank = async () => {
    setJumlahPotonganBank(0);
    setTotalNominalPotonganBank(0);
    try {
      const data = await GlobalApi.getCountAnggotaPotonganBank(month, year);
      setJumlahPotonganBank(data.jumlahAnggota || 0);
      setTotalNominalPotonganBank(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal mengambil data potongan bank:", error);
    }
  };

  const getSetorTunai = async () => {
    setJumlahSetorTunai(0);
    setTotalNominalSetorTunai(0);
    try {
      const data = await GlobalApi.getCountAnggotaSetorTunai({
        cabang: selectedCabang || null,
        unitKerja: unitKerjaInput || null,
        search: searchBalancing || null,
        bulan: month || null,
        tahun: year || null,
      });

      setJumlahSetorTunai(data.jumlahAnggota || 0);
      setTotalNominalSetorTunai(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal fetch:", error);
    }
  };

  const getAnggotaTerfilter = async () => {
    setTotalTerfilter(0);
    setTotalNominalTerfilter(0);
    try {
      const data = await GlobalApi.getCountAnggotaTerfilter({
        cabang: selectedCabang || null,
        unitKerja: unitKerjaInput || null,
        search: searchBalancing || null,
        bulan: month || null,
        tahun: year || null,
      });

      setTotalTerfilter(data.jumlahAnggota || 0);
      setTotalNominalTerfilter(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal fetch:", error);
    }
  };

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
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase(),
    );

    setFilteredUnitKerja(filteredList);
    setShowUnitKerjaDropdown(true);
  };

  const handleSelectCabang = async (cabang) => {
    setCurrentPage(1);
    setDataBalancing([]);
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase()),
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
        unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase()),
    );

    setShowUnitKerjaDropdown(true);
    setFilteredUnitKerja(filteredList);

    if (input === "") {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true,
      );

      setData(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase().includes(input.toLowerCase()),
      );

      setData(filteredData);
    }
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    setSearchUnitKerja(searchTerm);
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang,
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang,
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
          : true,
      );
      setData(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase() === selectedValue.toLowerCase(),
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
      const fullMessage = response || "";
      const shortMessage = fullMessage.split("Detail kegagalan:")[0].trim();

      const formattedMessage = shortMessage.replace(/\\n/g, "\n");

      setNotification({
        type: "success",
        message: formattedMessage,
      });

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
      }, 300);
      handleFilter();
      getBalancingdata();
    } catch (error) {
      console.error("Upload gagal:", error);
      setLoader(false);
      setNotification({
        type: "error",
        message: "Gagal Upload Data!",
      });
    }
  };
  const handleDeleteUpload = async (e) => {
    e.preventDefault();
    if (!resetData) return alert("Silakan pilih tanggal untuk reset data.");

    setLoader(true);
    setProgress(0);

    try {
      await GlobalApi.deleteTransaksiBank(resetData);
      setProgress(100);

      handleCloseModalDelete();
      setResetData("");

      setNotification({
        type: "success",
        message: "Data berhasil direset!",
      });
      handleFilter();
      getBalancingdata();
    } catch (error) {
      console.error("Gagal reset data:", error);
      setNotification({
        type: "error",
        message: "Gagal hapus data.",
      });
    } finally {
      setLoader(false);
      setProgress(0);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      setLoader(true);
      setProgress(0);

      await GlobalApi.deleteBalancingById(id, {
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total;
          const current = progressEvent.loaded;
          const percentCompleted = Math.round((current / total) * 100);
          setProgress(percentCompleted);
        },
      });

      alert("Data berhasil dihapus!");
      setShowDeletePopup(false);
      await getBalancingdata();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data!");
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!resetUntukBulan) {
      alert("Pilih bulan terlebih dahulu!");
      return;
    }

    try {
      setLoader(true);
      setProgress(0);

      const tagihanUntukBulan = resetUntukBulan.trim();
      await GlobalApi.deleteBalancing(tagihanUntukBulan, {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(percentCompleted);
          }
        },
      });

      setNotification({
        type: "success",
        message: "Data berhasil dihapus!",
      });
      setShowDeleteBalancing(false);
      setResetUntukBulan("");
      getBalancingdata();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      setNotification({
        type: "error",
        message: "Gagal hapus data.",
      });
    } finally {
      setLoader(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setResetData(e.target.value);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
  };
  const handleCloseModalDelete = () => {
    setShowDeleteModal(false);
    setResetData("");
  };

  const formatTanggal = (tanggalArray) => {
    if (!Array.isArray(tanggalArray) || tanggalArray.length < 3) return "";

    const [year, month, day] = tanggalArray;

    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    return `${dd}/${mm}/${year}`;
  };

  const handleEditClick = async (id) => {
    try {
      const data = await GlobalApi.getBalancingById(id);

      setEditData(data);
      setShowEditModal(true);
      await getBalancingdata();
    } catch (err) {
      console.error("Gagal ambil data balancing:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData || !editData.id) {
      alert("Data tidak valid!");
      return;
    }

    try {
      const payload = {
        namaAnggota: editData.namaAnggota,
        nip: editData.nip,
        npa: editData.npa,
        nomorRekening: editData.nomorRekening,
        cabang: editData.cabang,
        unitKerja: editData.unitKerja,
        statusPegawai: editData.statusPegawai,

        defaultPgri: editData.defaultPgri || 0,
        manualPgri: editData.manualPgri || 0,
        pgri: (editData.defaultPgri || 0) + (editData.manualPgri || 0),

        defaultSanduka: editData.defaultSanduka || 0,
        manualSanduka: editData.manualSanduka || 0,
        sanduka: (editData.defaultSanduka || 0) + (editData.manualSanduka || 0),

        defaultDaspen: editData.defaultDaspen || 0,
        manualDaspen: editData.manualDaspen || 0,
        daspen: (editData.defaultDaspen || 0) + (editData.manualDaspen || 0),

        defaultDerap: editData.defaultDerap || 0,
        manualDerap: editData.manualDerap || 0,
        derap: (editData.defaultDerap || 0) + (editData.manualDerap || 0),

        defaultKalender: editData.defaultKalender || 0,
        manualKalender: editData.manualKalender || 0,
        kalender:
          (editData.defaultKalender || 0) + (editData.manualKalender || 0),

        defaultLainLain: editData.defaultLainLain || 0,
        manualLainLain: editData.manualLainLain || 0,
        lainLain:
          (editData.defaultLainLain || 0) + (editData.manualLainLain || 0),

        total:
          (editData.defaultPgri || 0) +
          (editData.manualPgri || 0) +
          (editData.defaultSanduka || 0) +
          (editData.manualSanduka || 0) +
          (editData.defaultDaspen || 0) +
          (editData.manualDaspen || 0) +
          (editData.defaultDerap || 0) +
          (editData.manualDerap || 0) +
          (editData.defaultKalender || 0) +
          (editData.manualKalender || 0) +
          (editData.defaultLainLain || 0) +
          (editData.manualLainLain || 0),

        tagihanUntukBulan: editData.tagihanUntukBulan,
      };

      await GlobalApi.updateBalancing(editData.id, payload);

      setNotification({
        type: "success",
        message: "Data berhasil diperbarui!",
      });

      setShowEditModal(false);
      await getBalancingdata();
    } catch (err) {
      console.error("Gagal update data:", err);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat update data.",
      });
    }
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
          currentPage,
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
          currentPage,
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

  const exportBalancingToExcel = async () => {
    try {
      setIsLoading(true);

      const allData = await GlobalApi.getTransaksiBankBalancing(
        selectedCabang,
        selectedUnitKerja,
        year === "all" ? null : year ? parseInt(year) : null,
        month === "all" ? null : month ? parseInt(month) : null,
        paymentNote,
        searchBalancing,
      );

      if (!Array.isArray(allData) || allData.length === 0) {
        console.warn("Tidak ada data untuk diekspor");
        return;
      }

      const filteredData = filterDataByNPA(allData);

      const rekeningCount = {};
      filteredData.forEach((item) => {
        if (item.rekening) {
          rekeningCount[item.rekening] =
            (rekeningCount[item.rekening] || 0) + 1;
        }
      });

      const formattedData = filteredData.map((item, index) => ({
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
      saveAs(blob, "balancing-potongan-ByFilter.xlsx");
    } catch (err) {
      console.error("Gagal mengekspor data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportRekapitulasiToExcel = async () => {
    try {
      setIsLoading(true);

      const formattedData = dataRekapitulasi.map((item, index) => ({
        No: index + 1,
        Cabang: item.cabang,
        "Unit Kerja": item.unitKerja,
        Iuran: item.iuran,
        Sanduka: item.sanduka,
        Daspen: item.daspen,
        Derap: item.derap,
        Kalender: item.kalender,
        "Lain-lain": item.lainLain,
        "Total Iuran": item.totalIuran,
        "Potongan Bank": item.potonganBank,
        Selisih: item.selisih,
        "Juml. Anggota": item.jumlahAnggota,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Keuangan");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "rekap-data-keuangan.xlsx");
    } catch (err) {
      console.error("Gagal mengekspor rekapitulasi:", err);
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
  const handleImportBalancing = async () => {
  if (!fileImport || !tagihanUntukBulan) {
    alert("File dan tanggal harus diisi");
    return;
  }

  try {
    console.log("Tagihan Untuk Bulan yang dikirim:", tagihanUntukBulan);
    console.log("Tipe data:", typeof tagihanUntukBulan);

    await GlobalApi.importExcelTargetIuran(fileImport, tagihanUntukBulan);

    setNotification({
      type: "success",
      message: "Import Berhasil!",
    });

    setShowImportBalancing(false);
    setFileImport(null);
    setTagihanUntukBulan("");
  } catch (error) {
    console.error("Import gagal:", error);
    setNotification({
      type: "error",
      message: "Terjadi kesalahan saat import data.",
    });
  }
};

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const sortedData = useMemo(() => {
    if (loadingBalancing || !dataBalancing || dataBalancing.length === 0)
      return [];

    return [...dataBalancing].sort((a, b) => a.id - b.id);
  }, [dataBalancing, loadingBalancing]);

  const filteredCabang = listCabang.filter((item) =>
    item.kecamatan.toLowerCase().includes(searchDropCabang.toLowerCase()),
  );

  const filterUnitKerja = listUnitKerja.filter((item) =>
    item.unitKerja.toLowerCase().includes(searchDropUnit.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-1">
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

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Transaksi Pemotongan Bank
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola dan lihat data transaksi pemotongan bank serta lakukan
              balancing.
            </p>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm mb-2 ${
              activeTab === "potongan" ? "w-full" : "w-[1900px]"
            }`}
          >
            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 mt-4">
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
                      className="text-[#0B131E]"
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

          {showDeleteModal && (
            <>
              <div
                className="fixed inset-0 bg-black opacity-50 z-40"
                onClick={handleCloseModalDelete}
              ></div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={handleCloseModalDelete}
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
                  <h2 className="text-xl font-bold mb-4">Reset Data</h2>
                  <form onSubmit={handleDeleteUpload}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Reset Untuk Bulan:
                      </label>
                      <input
                        type="date"
                        name="resetUntukBulan"
                        value={resetData}
                        onChange={handleInputChange}
                        className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCloseModalDelete}
                        className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                        disabled={loader}
                      >
                        {loader ? `Deleting... ${progress}%` : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
          {showDeleteBalancing && (
            <>
              <div
                className="fixed inset-0 bg-black opacity-50 z-40"
                onClick={() => setShowDeleteBalancing(false)}
              ></div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={() => setShowDeleteBalancing(false)}
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
                  <h2 className="text-xl font-bold mb-4">Hapus Data</h2>
                  <form onSubmit={handleDelete}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Hapus Untuk Bulan:
                      </label>
                      <input
                        type="date"
                        name="resetUntukBulan"
                        value={resetUntukBulan}
                        onChange={(e) => setResetUntukBulan(e.target.value)}
                        className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowDeleteBalancing(false)}
                        className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                        disabled={loader}
                      >
                        {loader ? `Deleting... ${progress}%` : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
          {showImportBalancing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Import Balancing</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">File Excel</label>
                    <input
                      type="file"
                      className="w-full border rounded px-3 py-2"
                      onChange={(e) => setFileImport(e.target.files[0])}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Tagihan Untuk Bulan
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={tagihanUntukBulan}
                      onChange={(e) => setTagihanUntukBulan(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    className="px-4 py-2 border rounded"
                    onClick={() => setShowImportBalancing(false)}
                  >
                    Batal
                  </button>

                  <button
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500"
                    onClick={handleImportBalancing}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  {typeof window !== "undefined" &&
                    sessionStorage.getItem("role") === "SUPERADMIN" && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Reset Potongan
                        </button>
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
                        <option key={tahun.value} value={tahun.value}>
                          {tahun.label}
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
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-[#0B131E] via-[#0B131E] to-[#0B131E] shadow-md">
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        No
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Rekening
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Nama Anggota
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Rekening Kabupaten
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Potongan
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Tgl. Potongan
                      </th>
                      <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                        Transaksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingFilter ? (
                      <>
                        <tr>
                          <td colSpan="12" className="p-6 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0s" }}
                                ></div>
                                <div
                                  className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                  className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.4s" }}
                                ></div>
                              </div>
                              <p className="text-gray-600 font-medium text-sm">
                                Data sedang diproses...
                              </p>
                            </div>
                          </td>
                        </tr>

                        {Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={`skeleton-${idx}`} className="bg-white">
                            {Array.from({ length: 12 }).map((_, cellIdx) => (
                              <td
                                key={`skeleton-cell-${cellIdx}`}
                                className="p-3 border-b"
                              >
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    ) : data.length > 0 ? (
                      data.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                        >
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
                  <tfoot>
                    <tr className="bg-[#0B131E] text-white font-semibold border-t border-[#0B131E]">
                      <td colSpan={4} className="px-6 py-4 text-center">
                        Total
                      </td>
                      <td className="px-6 py-4 text-center">
                        {formatRupiah(
                          data.reduce((sum, item) => sum + item.potongan, 0),
                        )}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
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
                          Cetak
                        </>
                      )}
                    </button>

                    {typeof window !== "undefined" &&
                      sessionStorage.getItem("role") === "SUPERADMIN" && (
                        <div className="flex gap-2 ml-auto">
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                            onClick={() => setShowDeleteBalancing(true)}
                          >
                            Delete Balancing
                          </button>

                          <button
                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 transition"
                            onClick={() => setShowImportBalancing(true)}
                          >
                            Import Balancing
                          </button>
                        </div>
                      )}
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
                      Tahun Transaksi
                    </label>
                    <select
                      className="w-full h-10 text-base px-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {tahunList.map((tahun) => (
                        <option key={tahun.value} value={tahun.value}>
                          {tahun.label}
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
                {loadingBalancing ? (
                  <div className="w-full bg-white rounded-lg border border-gray-100 p-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2 mb-4">
                        <div
                          className="h-4 w-4 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0s" }}
                        ></div>
                        <div
                          className="h-4 w-4 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-4 w-4 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <p className="text-gray-600 font-medium text-lg">
                        Data sedang diproses...
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Harap tunggu sebentar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <table
                      key={`table-balancing-${currentPageBalancing}`}
                      className="w-full table-auto"
                    >
                      <thead>
                        <tr className="bg-gradient-to-r from-[#0B131E] via-[#0B131E] to-[#0B131E] shadow-md">
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                            No
                          </th>

                          <th
                            onClick={() => handleSort("cabang")}
                            className="group cursor-pointer px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider
                     text-white border-b border-[#0B131E] hover:bg-[#101c2c] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Cabang</span>
                              <span
                                className={`text-xs transition-all ${
                                  sortConfig.key === "cabang"
                                    ? "opacity-100"
                                    : "opacity-50 group-hover:opacity-80"
                                }`}
                              >
                                {sortConfig.key === "cabang" &&
                                sortConfig.direction === "desc"
                                  ? "▼"
                                  : "▲"}
                              </span>
                            </div>
                          </th>

                          <th
                            onClick={() => handleSort("unitKerja")}
                            className="group cursor-pointer px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider
                 text-white border-b border-[#0B131E] hover:bg-[#101c2c] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Unit Kerja</span>
                              <span
                                className={`text-xs ${
                                  sortConfig.key === "unitKerja"
                                    ? "opacity-100"
                                    : "opacity-50 group-hover:opacity-80"
                                }`}
                              >
                                {sortConfig.key === "unitKerja" &&
                                sortConfig.direction === "desc"
                                  ? "▼"
                                  : "▲"}
                              </span>
                            </div>
                          </th>

                          <th
                            onClick={() => handleSort("nama")}
                            className="group cursor-pointer px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider
                 text-white border-b border-[#0B131E] hover:bg-[#101c2c] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Nama</span>
                              <span
                                className={`text-xs ${
                                  sortConfig.key === "nama"
                                    ? "opacity-100"
                                    : "opacity-50 group-hover:opacity-80"
                                }`}
                              >
                                {sortConfig.key === "nama" &&
                                sortConfig.direction === "desc"
                                  ? "▼"
                                  : "▲"}
                              </span>
                            </div>
                          </th>

                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                            Status Pegawai
                          </th>

                          <th
                            onClick={() => handleSort("rekening")}
                            className="group cursor-pointer px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider
                 text-white border-b border-[#0B131E] hover:bg-[#101c2c] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Rekening</span>
                              <span
                                className={`text-xs ${
                                  sortConfig.key === "rekening"
                                    ? "opacity-100"
                                    : "opacity-50 group-hover:opacity-80"
                                }`}
                              >
                                {sortConfig.key === "rekening" &&
                                sortConfig.direction === "desc"
                                  ? "▼"
                                  : "▲"}
                              </span>
                            </div>
                          </th>

                          {[
                            { key: "totalIuranAnggota", label: "Iuran" },
                            { key: "totalIuranSanduka", label: "Sanduka" },
                            { key: "totalIuranDaspen", label: "Daspen" },
                            { key: "totalIuranDerap", label: "Derap" },
                            { key: "totalIuranKalender", label: "Kalender" },
                            { key: "totalIuranSumbangan", label: "Lain-lain" },
                            { key: "totalIuran", label: "Total Iuran" },
                            { key: "potongan", label: "Potongan Bank" },
                            { key: "selisih", label: "Selisih" },
                            { key: "keterangan", label: "Keterangan" },
                          ].map(({ key, label }) => (
                            <th
                              key={key}
                              onClick={() => handleSort(key)}
                              className="group cursor-pointer px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider
                   text-white border-b border-[#0B131E] hover:bg-[#101c2c] transition-colors"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span>{label}</span>
                                <span
                                  className={`text-xs ${
                                    sortConfig.key === key
                                      ? "opacity-100"
                                      : "opacity-50 group-hover:opacity-80"
                                  }`}
                                >
                                  {sortConfig.key === key &&
                                  sortConfig.direction === "desc"
                                    ? "▼"
                                    : "▲"}
                                </span>
                              </div>
                            </th>
                          ))}

                          {cekRole === "SUPERADMIN" && (
                            <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#0B131E]">
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {sortedData.length > 0 ? (
                          sortedData.map((item, index) => (
                            <tr
                              key={item.id}
                              ref={item.id === updatedId ? updatedRowRef : null}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                {index + 1}
                              </td>
                              <td className="text-center text-sm text-gray-900 whitespace-normal break-words max-w-[90px]">
                                {item.cabang}
                              </td>
                              <td className="text-sm text-gray-900 whitespace-normal break-words max-w-[90px]">
                                {item.unitKerja}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-normal">
                                <div className="font-semibold text-gray-900 leading-tight">
                                  {item.nama}
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                  NPA :{" "}
                                  <span className="text-gray-600">
                                    {item.npa || "-"}
                                  </span>
                                </div>

                                <div className="text-xs text-gray-500">
                                  NIP :{" "}
                                  <span className="text-gray-600">
                                    {item.nip || "-"}
                                  </span>
                                </div>
                              </td>

                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {item.statusPegawai &&
                                item.statusPegawai.trim() !== ""
                                  ? item.statusPegawai
                                  : "-"}
                              </td>

                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {item.rekening}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranAnggota)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranSanduka)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranDaspen)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranDerap)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranKalender)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuranSumbangan)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.totalIuran)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.potongan)}
                              </td>
                              <td className="text-sm text-center text-gray-900 whitespace-normal break-words max-w-[60px]">
                                {formatRupiah(item.selisih)}
                              </td>
                              <td className=" whitespace-nowrap text-sm text-center">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
      ${
        item.keterangan === "Sukses"
          ? "bg-green-200 text-green-800"
          : item.keterangan === "Tunai"
            ? "bg-yellow-200 text-yellow-800"
            : "bg-red-200 text-red-800"
      }`}
                                >
                                  {item.keterangan}
                                </span>
                              </td>
                              <td className="p-3 text-center text-sm">
                                {cekRole === "SUPERADMIN" && (
                                  <div className="flex space-x-2 justify-center text-base">
                                    <button
                                      className="text-blue-500 hover:text-[#0B131E]"
                                      onClick={() => handleEditClick(item.id)}
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        setSelectedId(item.id);
                                        setShowDeletePopup(true);
                                      }}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                )}
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
                      <tfoot>
                        <tr className="bg-[#0B131E] text-white font-semibold">
                          <td colSpan={6} className=" text-center">
                            Total
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranAnggota || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranSanduka || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranDaspen || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranDerap || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranKalender || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) =>
                                  sum + (item.totalIuranSumbangan || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) => sum + (item.totalIuran || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) => sum + (item.potongan || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-normal break-words max-w-[110px]">
                            {formatRupiah(
                              (dataBalancing ?? []).reduce(
                                (sum, item) => sum + (item.selisih || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                    <div className="p-4 border-t"></div>
                  </div>
                )}
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
                    onClick={exportRekapitulasiToExcel}
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
                          <option key={tahun.value} value={tahun.value}>
                            {tahun.label}
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
              {loadingRekapitulasi ? (
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
                    <div className="w-full overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#0B131E] via-[#0B131E] to-[#0B131E] shadow-md">
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              No
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Cabang
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Unit Kerja
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Iuran
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Sanduka
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Daspen
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Derap
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Kalender
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Lain-lain
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Total Iuran
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Potongan Bank
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Selisih
                            </th>
                            <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white border-b border-gray-300">
                              Juml. Anggota
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataRekapitulasi.length > 0 ? (
                            dataRekapitulasi.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 border-b"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-center">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                  {item.cabang}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                  {item.unitKerja}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.iuran)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.sanduka)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.daspen)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.derap)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.kalender)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.lainLain)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900 text-right bg-blue-50">
                                  {formatRupiah(item.totalIuran)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-right">
                                  {formatRupiah(item.potonganBank)}
                                </td>
                                <td
                                  className={`px-4 py-3 whitespace-nowrap text-xs font-semibold text-right ${
                                    item.selisih >= 0
                                      ? "text-green-600 bg-green-50"
                                      : "text-red-600 bg-red-50"
                                  }`}
                                >
                                  {formatRupiah(item.selisih)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 text-center">
                                  {item.jumlahAnggota}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={13}
                                className="px-6 py-8 text-center text-sm text-gray-500 border-b"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <FontAwesomeIcon
                                    icon={faSearch}
                                    className="text-gray-300 text-4xl mb-3"
                                  />
                                  <p>
                                    Tidak ada data rekapitulasi yang cocok
                                    dengan filter Anda.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showEditModal && editData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-w-full p-6 overflow-y-auto max-h-[90vh] mt-16">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle className="w-5 h-5 hover:text-red-500" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Edit Data Balancing</h2>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-6 border">
              <div>
                <p className="text-xs text-gray-500">Nama Anggota</p>
                <p>{editData.namaAnggota}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">NPA</p>
                <p>{editData.npa}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">NIP</p>
                <p>{editData.nip}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Nomor Rekening</p>
                <p>{editData.nomorRekening}</p>
              </div>

              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">
                  Cabang
                </label>

                <button
                  type="button"
                  className="w-full border px-3 py-2 rounded text-left bg-white"
                  onClick={() => setOpenCabang(!openCabang)}
                >
                  {editData.cabang || "-- Pilih Cabang --"}
                </button>

                {openCabang && (
                  <div className="absolute z-50 w-full bg-white border rounded mt-1 shadow-lg">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Cari cabang..."
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={searchDropCabang}
                        onChange={(e) => setSearchDropCabang(e.target.value)}
                      />
                    </div>

                    <ul className="max-h-48 overflow-y-auto text-sm">
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                        onClick={() => {
                          setEditData({
                            ...editData,
                            cabang: "",
                            unitKerja: "",
                          });
                          setOpenCabang(false);
                        }}
                      >
                        -- Pilih Cabang --
                      </li>

                      {filteredCabang.length === 0 && (
                        <li className="px-3 py-2 text-gray-400">
                          Cabang tidak ditemukan
                        </li>
                      )}

                      {filteredCabang.map((item, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setEditData({
                              ...editData,
                              cabang: item.kecamatan,
                              unitKerja: "",
                            });

                            fetchUnitKerja(item.kecamatan);
                            setOpenCabang(false);
                            setSearchDropCabang("");
                          }}
                        >
                          {item.kecamatan}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">
                  Unit Kerja
                </label>

                <button
                  type="button"
                  disabled={!editData.cabang}
                  className="w-full border px-3 py-2 rounded text-left bg-white disabled:bg-gray-100"
                  onClick={() => setOpenUnit(!openUnit)}
                >
                  {editData.unitKerja || "-- Pilih Unit Kerja --"}
                </button>

                {openUnit && (
                  <div className="absolute z-50 w-full bg-white border rounded mt-1 shadow-lg">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Cari unit kerja..."
                        className="w-full border px-2 py-1 rounded text-sm"
                        value={searchDropUnit}
                        onChange={(e) => setSearchDropUnit(e.target.value)}
                      />
                    </div>

                    <ul className="max-h-48 overflow-y-auto text-sm">
                      {loadingUnitKerja && (
                        <li className="px-3 py-2 text-gray-400">
                          Memuat unit kerja...
                        </li>
                      )}

                      {!loadingUnitKerja && filterUnitKerja.length === 0 && (
                        <li className="px-3 py-2 text-gray-400">
                          Unit kerja tidak ditemukan
                        </li>
                      )}

                      {filterUnitKerja.map((item, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setEditData({
                              ...editData,
                              unitKerja: item.unitKerja,
                            });
                            setOpenUnit(false);
                            setSearchDropUnit("");
                          }}
                        >
                          {item.unitKerja}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">
                  Iuran Anggota
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultPgri || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultPgri: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Anggota
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualPgri || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualPgri: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Iuran Sanduka
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultSanduka || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultSanduka: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Sanduka
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualSanduka || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualSanduka: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Iuran Daspen
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultDaspen || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultDaspen: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Daspen
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualDaspen || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualDaspen: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Iuran Derap</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultDerap || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultDerap: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Derap
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualDerap || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualDerap: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Iuran Kalender
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultKalender || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultKalender: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Kalender
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualKalender || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualKalender: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Iuran Sumbangan
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.defaultLainLain || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      defaultLainLain: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Manual Iuran Sumbangan
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={editData.manualLainLain || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manualLainLain: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>

              <button
                className="px-4 py-2 bg-[#0B131E] text-white rounded hover:bg-[#101c2c] flex items-center"
                onClick={handleSaveEdit}
              >
                <FaSave className="mr-2" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus data ini?
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteClick(selectedId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
