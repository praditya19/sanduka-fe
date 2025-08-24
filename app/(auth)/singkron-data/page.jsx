"use client";
import React, { useState, useEffect, useRef } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faMinusCircle, faPlusCircle, faArrowLeft, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FaTrash, FaBars, FaTimes, FaCheckCircle, FaExclamationCircle, FaDownload, FaUpload, FaSearch, FaFilter } from "react-icons/fa";
import { FiGrid, FiList } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import Modal from "react-modal";

// --- Sub-component: Notification Toast ---
const NotificationToast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: 'bg-green-500', icon: <FaCheckCircle /> },
    error: { bg: 'bg-red-500', icon: <FaExclamationCircle /> },
    info: { bg: 'bg-blue-500', icon: <FaExclamationCircle /> },
  };

  const selectedStyle = styles[type] || styles.info;

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center p-4 rounded-lg shadow-lg text-white ${selectedStyle.bg} transform transition-all duration-300 ease-in-out animate-slideInRight`}>
      <div className="text-2xl mr-3">{selectedStyle.icon}</div>
      <div>
        <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <FaTimes />
      </button>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({ icon, label, value, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition hover:shadow-lg hover:-translate-y-1">
    <div className="bg-teal-100 text-teal-700 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {loading ? (
        <div className="h-6 bg-gray-200 rounded-md w-16 animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);


// --- Sub-component: Skeleton Loader for Table ---
const TableSkeleton = () => (
  <tbody>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded-full w-12 h-6"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded-full w-12 h-6"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-8 bg-gray-200 rounded-full w-8"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-8 bg-gray-200 rounded-md w-8"></div></td>
      </tr>
    ))}
  </tbody>
);

// --- Sub-component: Empty State for Table ---
const EmptyState = () => (
  <div className="text-center py-16 px-6 bg-white rounded-lg">
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
    <h3 className="mt-4 text-xl font-semibold text-gray-800">Data Tidak Ditemukan</h3>
    <p className="mt-2 text-gray-500">Ubah filter pencarian Anda atau tambahkan data baru.</p>
  </div>
);


// --- Main Component: SyncData ---
const SyncData = () => {
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ file: null, category: "" });
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [visiblePages, setVisiblePages] = useState([]);
  const [role, setRole] = useState("");
  const [filteredTotalFiles, setFilteredTotalFiles] = useState({ totalDaspen: 0, totalKtaDigital: 0 });
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchNama, setSearchNama] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState(null);
  const [notification, setNotification] = useState(null);
  const [statusKeanggotaan, setStatusKeanggotaan] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Atur app element untuk react-modal (penting untuk aksesibilitas)
  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");

    if (storedRole === "ADMIN" && storedCabang) {
      setSelectedCabang(storedCabang);
      filterUnitKerjaForCabang(storedCabang);
    }
  }, []);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await GlobalApi.getAllFiles();
        setData(result);
      } catch (error) {
        console.error("Error fetching files:", error);
        setNotification({ type: 'error', message: 'Gagal memuat data utama.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTotalFiles = async () => {
      try {
        const result = await GlobalApi.getAllTotalData();
        setFilteredTotalFiles(result);
      } catch (error) {
        console.error("Error fetching total files:", error);
      }
    };
    fetchTotalFiles();
  }, []);

  const filterUnitKerjaForCabang = (cabang) => {
    const filtered = unitKerjaList.filter(
      (unitKerja) => unitKerja.cabang.toLowerCase() === cabang.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  useEffect(() => {
    updateVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const updateVisiblePages = (current, total) => {
    if (total <= 5) {
      setVisiblePages(Array.from({ length: total }, (_, i) => i + 1));
      return;
    }
    if (current <= 3) {
      setVisiblePages([1, 2, 3, 4, '...', total]);
    } else if (current >= total - 2) {
      setVisiblePages([1, '...', total - 3, total - 2, total - 1, total]);
    } else {
      setVisiblePages([1, '...', current - 1, current, current + 1, '...', total]);
    }
  };

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      filterUnitKerjaForCabang(selectedCabang);
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    if (role !== "ADMIN") {
      setFilteredCabangList(originalCabangList);
      setShowCabangDropdown(true);
    }
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);

    if (selectedCabang) {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
          unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
      setShowUnitKerjaDropdown(true);
    }
  };

  useEffect(() => {
    if (selectedCabang) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      filterUnitKerjaForCabang(selectedCabang);
      setCurrentPage(1);
    }
  }, [selectedCabang]);

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) setShowCabangDropdown(false);
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target)) setShowUnitKerjaDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} className="ml-2 text-gray-400" />;
    if (sortOrder === 'asc') return <FontAwesomeIcon icon={faSortUp} className="ml-2" />;
    return <FontAwesomeIcon icon={faSortDown} className="ml-2" />;
  };

  const sortedAndFilteredData = React.useMemo(() => {
    let result = [...data];

    // Filter
    result = result.filter((item) => {
      const statusMatch = statusKeanggotaan ? item.statusKeanggotaan?.toLowerCase() === statusKeanggotaan.toLowerCase() : true;
      const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
      const unitKerjaMatch = selectedUnitKerja ? item.unitKerja?.toLowerCase() === selectedUnitKerja?.toLowerCase() : true;
      const namaMatch = searchNama ? (
        item.namaAnggota?.toLowerCase().includes(searchNama) ||
        item.npa?.toLowerCase().includes(searchNama) ||
        item.nip?.toLowerCase().includes(searchNama)
      ) : true;
      return cabangMatch && unitKerjaMatch && namaMatch && statusMatch;
    });

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField] ?? '';
        let valB = b[sortField] ?? '';
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return sortOrder === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
        }
        if (!isNaN(valA) && !isNaN(valB)) {
          return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }
        return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }
    return result;
  }, [data, statusKeanggotaan, selectedCabang, selectedUnitKerja, searchNama, sortField, sortOrder]);


  const paginatedData = paginateData(sortedAndFilteredData);

  useEffect(() => {
    setTotalPages(Math.ceil(sortedAndFilteredData.length / itemsPerPage));
  }, [sortedAndFilteredData, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCabang, searchNama, selectedUnitKerja, statusKeanggotaan]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.category) {
      setNotification({ type: 'error', message: 'Harap lengkapi file dan kategori.' });
      return;
    }
    setLoader(true);
    setProgress(0);
    setIsUploading(true);

    const dataToSend = new FormData();
    dataToSend.append("file", formData.file);
    dataToSend.append("category", formData.category);

    try {
      await GlobalApi.uploadFile(dataToSend);
      setNotification({ type: 'success', message: 'File berhasil diunggah!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal mengunggah file.' });
      console.error("Error submitting data:", error.response?.data || error.message);
    } finally {
      setLoader(false);
      setIsUploading(false);
      setIsUploadModalOpen(false);
    }
  };

  const handleBackClick = () => router.back();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNamaChange = (e) => setSearchNama(e.target.value.toLowerCase());

  const toggleExpandRow = (index) => setExpandedRow(expandedRow === index ? null : index);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center mt-6 gap-2 flex-wrap mb-5">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">First</button>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Prev</button>
        {visiblePages.map((page, index) =>
          page === '...' ? (
            <span key={index} className="px-3 py-1">...</span>
          ) : (
            <button key={index} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded-md transition ${page === currentPage ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50'}`}>{page}</button>
          )
        )}
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Last</button>
      </div>
    );
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await GlobalApi.deleteFiles(id);
        setNotification({ type: 'success', message: 'Data berhasil dihapus!' });
        setData(data.filter(item => item.id !== id));
      } catch (error) {
        setNotification({ type: 'error', message: 'Gagal menghapus data.' });
      }
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedTemplate) return;
    const urls = {
      daspen: "https://docs.google.com/spreadsheets/d/19YgMVfGCOq4iK4vNzGTpr3ezPVrsKROb/edit?usp=sharing&ouid=104657245264175519758&rtpof=true&sd=true",
      kta: "https://docs.google.com/spreadsheets/d/1WGxbFRHjtAGxhSC77OEdyXTYAs8R98F6/edit?usp=sharing&ouid=104657245264175519758&rtpof=true&sd=true",
    };
    window.open(urls[selectedTemplate], "_blank");
    setShowTemplateModal(false);
  };

  const handleDownloadRekap = () => GlobalApi.exportTidakTerdaftarToExcel(selectedCabang, selectedUnitKerja);

  const getStatusPill = (status) => {
    switch (status) {
      case 'Terdaftar': return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Terdaftar</span>;
      case 'Tidak Terdaftar': return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tidak Terdaftar</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const getBooleanPill = (value) => value ?
    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">YES</span> :
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">NO</span>;

  const getVerificationPill = (value) => {
    if (value === null) return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Belum Dicek</span>;
    return value ?
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Sinkron</span> :
      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tidak Sinkron</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && <NotificationToast type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

      {isMobile ? (
        <header className="bg-teal-700 text-white py-4 px-4 shadow-md fixed top-0 left-0 w-full z-50 flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" onClick={handleBackClick} className="cursor-pointer mr-4" />
            <h1 className="text-xl font-bold">Sinkronisasi Data</h1>
          </div>
          <button aria-label="Tampilkan menu aksi" className="p-2" onClick={() => setShowActions(true)}>
            <FaBars size={22} />
          </button>
        </header>
      ) : (
        <HeaderMenu />
      )}

      <main className="p-4 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 mt-10">
            <StatCard icon={<FiList size={24} />} label="Total Data Daspen" value={filteredTotalFiles.totalDaspen.toLocaleString('id-ID')} loading={!filteredTotalFiles.totalDaspen && loading} />
            <StatCard icon={<FiGrid size={24} />} label="Total Data KTA Digital" value={filteredTotalFiles.totalKtaDigital.toLocaleString('id-ID')} loading={!filteredTotalFiles.totalKtaDigital && loading} />
            <StatCard
              icon={<FaFilter size={24} />}
              label="Data Tampil"
              value={(filteredTotalFiles.totalDaspen + filteredTotalFiles.totalKtaDigital).toLocaleString('id-ID')}
              loading={(!filteredTotalFiles.totalDaspen && !filteredTotalFiles.totalKtaDigital && loading)}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Filter & Pencarian</h2>
              {!isMobile && (
                <div className="relative">
                  <button aria-label="Tampilkan menu aksi" className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition" onClick={() => setShowActions(true)}>
                    <FaBars />
                    <span>Tindakan</span>
                  </button>
                </div>
              )}
            </div>
            <div className="border-t my-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative w-full" ref={cabangRef}>
                <Input type="text" value={selectedCabang} readOnly onClick={handleCabangClick} className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition duration-150 ${role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="Pilih Cabang" disabled={role === "ADMIN"} />
                {showCabangDropdown && role !== "ADMIN" && (
                  <div className="absolute z-20 border rounded-md bg-white shadow-md mt-2 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="p-2"><Input type="text" onChange={(e) => handleCabangSearch(e.target.value)} className="block w-full" placeholder="Cari Cabang..." autoFocus /></li>
                      <li onClick={() => handleSelectCabang({ kecamatan: "" })} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Pilih Cabang</li>
                      {filteredCabangList.map((cabang) => (
                        <li key={cabang.id} onClick={() => handleSelectCabang(cabang)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{cabang.kecamatan}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative w-full" ref={unitKerjaRef}>
                <Input type="text" value={unitKerjaInput} onChange={handleUnitKerjaChange} onFocus={handleUnitKerjaFocus} placeholder="Pilih Unit Kerja" className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition ${!selectedCabang ? "bg-gray-100 cursor-not-allowed" : ""}`} disabled={!selectedCabang} />
                {showUnitKerjaDropdown && (
                  <div className="absolute z-20 border rounded-md bg-white shadow-md mt-2 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="p-2"><Input type="text" value={unitKerjaInput} onChange={handleUnitKerjaChange} placeholder="Cari Unit Kerja..." autoFocus className="block w-full" /></li>
                      <li onClick={() => handleUnitKerjaSelect({ unitKerja: "" })} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Pilih Unit Kerja</li>
                      {filteredUnitKerja.length > 0 ? (
                        filteredUnitKerja.map((unitKerja) => (
                          <li key={unitKerja.id} onClick={() => handleUnitKerjaSelect(unitKerja)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{unitKerja.unitKerja}</li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500">Tidak ada hasil</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="w-full">
                <Input type="text" className="block w-full px-4 py-2 border rounded-md" placeholder="Cari Nama / NPA / NIP" onChange={handleNamaChange} />
              </div>
              <div className="w-full">
                <select onChange={(e) => setStatusKeanggotaan(e.target.value)} className="block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none" defaultValue="">
                  <option value="">Semua Status</option>
                  <option value="Terdaftar di KTA Digital dan Daspen">Terdaftar di KTA Digital dan Daspen</option>
                  <option value="Terdaftar di KTA Digital">Terdaftar di KTA Digital</option>
                  <option value="Terdaftar di Daspen">Terdaftar di Daspen</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('id')}>No <SortIcon field="id" /></th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('cabang')}>Cabang <SortIcon field="cabang" /></th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('unitKerja')}>Unit Kerja <SortIcon field="unitKerja" /></th>
                    {!isMobile && (
                      <>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('namaAnggota')}>Nama <SortIcon field="namaAnggota" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('npa')}>NPA <SortIcon field="npa" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('nip')}>NIP <SortIcon field="nip" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataKtaDigital')}>KTA Digital <SortIcon field="dataKtaDigital" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataDaspen')}>Daspen <SortIcon field="dataDaspen" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('verifikasi')}>Verifikasi <SortIcon field="verifikasi" /></th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('statusKeanggotaan')}>Status <SortIcon field="statusKeanggotaan" /></th>
                        <th scope="col" className="py-3 px-6">Kontak</th>
                        <th scope="col" className="py-3 px-6">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                {loading ? <TableSkeleton /> : (
                  <tbody className="text-center">
                    {paginatedData.map((item, index) => {
                      const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <React.Fragment key={item.id || index}>
                          <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-between">
                                <span>{actualIndex}</span>
                                {isMobile && <FontAwesomeIcon icon={expandedRow === actualIndex ? faMinusCircle : faPlusCircle} className="text-teal-500 cursor-pointer" size="lg" onClick={() => toggleExpandRow(actualIndex)} />}
                              </div>
                            </td>
                            <td className="py-4 px-6">{item.cabang}</td>
                            <td className="py-4 px-6">{item.unitKerja}</td>
                            {!isMobile && (
                              <>
                                <td className="py-4 px-6 text-left">{item.namaAnggota}</td>
                                <td className="py-4 px-6">{item.npa || "-"}</td>
                                <td className="py-4 px-6">{item.nip}</td>
                                <td className="py-4 px-6">{getBooleanPill(item.dataKtaDigital)}</td>
                                <td className="py-4 px-6">{getBooleanPill(item.dataDaspen)}</td>
                                <td className="py-4 px-6">{getVerificationPill(item.verifikasi)}</td>
                                <td className="py-4 px-6">{getStatusPill(item.statusKeanggotaan)}</td>
                                <td className="py-4 px-6"><a href={`https://wa.me/${item.nomorHp}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600"><FontAwesomeIcon icon={faWhatsapp} size="2x" /></a></td>
                                <td className="py-4 px-6"><button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button></td>
                              </>
                            )}
                          </tr>
                          {/* Mobile expanded row content can be added here */}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                )}
              </table>
              {!loading && paginatedData.length === 0 && <EmptyState />}
            </div>
            {renderPagination()}
          </div>
        </div>
      </main>

      {/* Action Menu (Slide-in Panel) */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-[60] transition-transform duration-300 transform ${showActions ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Menu Tindakan</h2>
          <button aria-label="Tutup menu aksi" className="text-gray-500 hover:text-red-500" onClick={() => setShowActions(false)}><FaTimes size={24} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setShowTemplateModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"><FaDownload /> Download Template</Button>
          <Button onClick={() => setIsUploadModalOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"><FaUpload /> Upload Data</Button>
          <Button onClick={() => router.push("/singkron-data/cek-data")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"><FaSearch /> Cek Data</Button>
          {role === 'SUPER ADMIN' && <Button onClick={handleDownloadRekap} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Rekap Anggota</Button>}
        </div>
      </div>
      {showActions && <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowActions(false)}></div>}

      {/* MODAL UNTUK UPLOAD DATA */}
      <Modal
        isOpen={isUploadModalOpen}
        onRequestClose={() => setIsUploadModalOpen(false)}
        contentLabel="Upload Data"
        className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-[90]"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Upload Data Anggota</h2>
            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-gray-800">
              <FaTimes size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Data</label>
                <select
                  name="category"
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="DASPEN">Daspen</option>
                  <option value="KTA_DIGITAL">KTA Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File Excel</label>
                <Input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  accept=".xls,.xlsx"
                />
              </div>
              {isUploading && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-1">{`Uploading... ${progress}%`}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" onClick={() => setIsUploadModalOpen(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                Batal
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={loader}>
                {loader ? 'Mengunggah...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL UNTUK DOWNLOAD TEMPLATE */}
      <Modal
        isOpen={showTemplateModal}
        onRequestClose={() => setShowTemplateModal(false)}
        contentLabel="Pilih Template"
        className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-[90]"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Download Template</h2>
            <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-800">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <button
              className={`w-full p-4 rounded-lg text-left transition ${selectedTemplate === 'daspen' ? 'bg-teal-100 ring-2 ring-teal-500 text-teal-800' : 'bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => setSelectedTemplate("daspen")}
            >
              <p className="font-bold">Template Daspen</p>
              <p className="text-sm">Gunakan ini untuk data iuran Daspen.</p>
            </button>
            <button
              className={`w-full p-4 rounded-lg text-left transition ${selectedTemplate === 'kta' ? 'bg-teal-100 ring-2 ring-teal-500 text-teal-800' : 'bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => setSelectedTemplate("kta")}
            >
              <p className="font-bold">Template KTA Digital</p>
              <p className="text-sm">Gunakan ini untuk data KTA Digital.</p>
            </button>
          </div>
          {selectedTemplate && (
            <div className="mt-6">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={handleDownloadTemplate}>
                Download Template {selectedTemplate === 'daspen' ? 'Daspen' : 'KTA Digital'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SyncData;