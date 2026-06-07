"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaTrash, FaBars, FaTimes, FaCheckCircle, FaExclamationCircle,
  FaDownload, FaUpload, FaSearch, FaSyncAlt, FaUsers, FaIdCard,
  FaLayerGroup, FaCheckDouble, FaTimesCircle, FaHourglassHalf
} from "react-icons/fa";
import { FiGrid, FiList } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faArrowLeft, faSort, faSortUp, faSortDown, faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import Modal from "react-modal";

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
  const s = styles[type] || styles.info;
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center p-4 rounded-lg shadow-lg text-white ${s.bg} animate-slideInRight`}>
      <div className="text-2xl mr-3">{s.icon}</div>
      <div>
        <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200"><FaTimes /></button>
    </div>
  );
};

const StatCard = ({ icon, label, value, loading, color = "teal" }) => {
  const colors = {
    teal: "bg-teal-100 text-teal-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 transition hover:shadow-lg hover:-translate-y-1">
      <div className={`${colors[color] || colors.teal} p-3 rounded-full`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {loading ? (
          <div className="h-6 bg-gray-200 rounded-md w-16 animate-pulse mt-1"></div>
        ) : (
          <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
};

const TableSkeleton = () => (
  <tbody>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded-full w-12 h-6"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded-full w-12 h-6"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded-full w-12 h-6"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="py-4 px-6 hidden md:table-cell"><div className="h-8 bg-gray-200 rounded-full w-8"></div></td>
      </tr>
    ))}
  </tbody>
);

const EmptyState = ({ message = "Data Tidak Ditemukan" }) => (
  <div className="text-center py-16 px-6 bg-white rounded-lg">
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
    <h3 className="mt-4 text-xl font-semibold text-gray-800">{message}</h3>
    <p className="mt-2 text-gray-500">Ubah filter pencarian Anda atau tambahkan data baru.</p>
  </div>
);

const tabs = [
  { key: "all", label: "Semua Data", icon: <FiList size={16} /> },
  { key: "daspen", label: "Upload Daspen", icon: <FaLayerGroup size={16} /> },
  { key: "kta", label: "Upload KTA Digital", icon: <FaIdCard size={16} /> },
];

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
  const [activeTab, setActiveTab] = useState("all");
  const [progress, setProgress] = useState(0);

  useEffect(() => { Modal.setAppElement('body'); }, []);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");
    if (storedRole === "ADMIN" && storedCabang) setSelectedCabang(storedCabang);
  }, []);

  useEffect(() => {
    GlobalApi.getCabang().then(r => { setOriginalCabangList(r.data); setFilteredCabangList(r.data); }).catch(console.error);
    GlobalApi.getUnitKerja().then(r => {
      setUnitKerjaList(r.data);
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");
      if (storedRole === "ADMIN" && storedCabang) {
        setFilteredUnitKerja(r.data.filter(u => u.cabang.toLowerCase() === storedCabang.toLowerCase()));
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    GlobalApi.getAllFiles().then(r => { setData(r); }).catch(console.error).finally(() => setLoading(false));
    GlobalApi.getAllTotalData().then(r => setFilteredTotalFiles(r)).catch(console.error);
  }, []);

  const filterUnitKerjaForCabang = (cabang) => {
    setFilteredUnitKerja(unitKerjaList.filter(u => u.cabang.toLowerCase() === cabang.toLowerCase()));
  };

  useEffect(() => {
    if (selectedCabang) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      filterUnitKerjaForCabang(selectedCabang);
      setCurrentPage(1);
    }
  }, [selectedCabang]);

  useEffect(() => { setCurrentPage(1); }, [selectedCabang, searchNama, selectedUnitKerja, statusKeanggotaan, activeTab]);

  const handleSort = (field) => {
    setSortOrder(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} className="ml-2 text-gray-400" />;
    return <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortUp : faSortDown} className="ml-2" />;
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    result = result.filter(item => {
      const tabMatch = activeTab === "all" ? true
        : activeTab === "daspen" ? item.kategoriDaspen : activeTab === "kta" ? item.dataKtaDigital : true;
      const statusMatch = statusKeanggotaan ? item.statusKeanggotaan?.toLowerCase() === statusKeanggotaan.toLowerCase() : true;
      const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
      const unitKerjaMatch = selectedUnitKerja ? item.unitKerja?.toLowerCase() === selectedUnitKerja?.toLowerCase() : true;
      const namaMatch = searchNama
        ? (item.namaAnggota?.toLowerCase().includes(searchNama) || item.npa?.toLowerCase().includes(searchNama) || item.nip?.toLowerCase().includes(searchNama))
        : true;
      return tabMatch && cabangMatch && unitKerjaMatch && namaMatch && statusMatch;
    });
    if (sortField) {
      result.sort((a, b) => {
        let va = a[sortField] ?? '', vb = b[sortField] ?? '';
        if (typeof va === 'boolean') return sortOrder === 'asc' ? (va === vb ? 0 : va ? 1 : -1) : (va === vb ? 0 : va ? -1 : 1);
        if (!isNaN(Number(va)) && !isNaN(Number(vb))) return sortOrder === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
        return sortOrder === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return result;
  }, [data, activeTab, statusKeanggotaan, selectedCabang, selectedUnitKerja, searchNama, sortField, sortOrder]);

  const daspenData = useMemo(() => data.filter(d => d.kategoriDaspen), [data]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData]);

  useEffect(() => {
    updateVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const updateVisiblePages = (current, total) => {
    if (total <= 5) { setVisiblePages(Array.from({ length: total }, (_, i) => i + 1)); return; }
    if (current <= 3) setVisiblePages([1, 2, 3, 4, '...', total]);
    else if (current >= total - 2) setVisiblePages([1, '...', total - 3, total - 2, total - 1, total]);
    else setVisiblePages([1, '...', current - 1, current, current + 1, '...', total]);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.category) {
      setNotification({ type: 'error', message: 'Harap lengkapi file dan kategori.' }); return;
    }
    setLoader(true); setIsUploading(true);
    const fd = new FormData();
    fd.append("file", formData.file);
    fd.append("category", formData.category);
    try {
      await GlobalApi.uploadFile(fd);
      setNotification({ type: 'success', message: 'File berhasil diunggah!' });
      const result = await GlobalApi.getAllFiles();
      setData(result);
      const totals = await GlobalApi.getAllTotalData();
      setFilteredTotalFiles(totals);
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal mengunggah file.' });
    } finally {
      setLoader(false); setIsUploading(false); setIsUploadModalOpen(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await GlobalApi.deleteFiles(id);
        setNotification({ type: 'success', message: 'Data berhasil dihapus!' });
        setData(data.filter(item => item.id !== id));
        const totals = await GlobalApi.getAllTotalData();
        setFilteredTotalFiles(totals);
      } catch (error) { setNotification({ type: 'error', message: 'Gagal menghapus data.' }); }
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
      case 'Terdaftar di KTA Digital dan Daspen': return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">KTA + Daspen</span>;
      case 'Terdaftar di KTA Digital': return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">KTA Digital</span>;
      case 'Terdaftar di Daspen': return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Daspen</span>;
      case 'Tidak Terdaftar': return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tidak Terdaftar</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{status || 'N/A'}</span>;
    }
  };

  const getBooleanPill = (value) => value
    ? <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Ya</span>
    : <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tidak</span>;

  const getVerificationPill = (value) => {
    if (value === null) return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Belum Dicek</span>;
    return value
      ? <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Sinkron</span>
      : <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Tidak Sinkron</span>;
  };

  const getKatPill = (kat) => {
    if (!kat) return <span className="text-gray-300">-</span>;
    const colors = { I: "bg-blue-100 text-blue-700", II: "bg-amber-100 text-amber-700", III: "bg-purple-100 text-purple-700" };
    return <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${colors[kat.trim()] || "bg-gray-100 text-gray-700"}`}>Kat {kat.trim()}</span>;
  };

  const handleBackClick = () => router.back();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNamaChange = (e) => setSearchNama(e.target.value.toLowerCase());

  const toggleExpandRow = (index) => setExpandedRow(expandedRow === index ? null : index);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center mt-6 gap-2 flex-wrap pb-4">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">First</button>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Prev</button>
        {visiblePages.map((page, index) =>
          page === '...' ? <span key={index} className="px-3 py-1">...</span>
            : <button key={index} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded-md transition ${page === currentPage ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50'}`}>{page}</button>
        )}
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition">Last</button>
      </div>
    );
  };

  const katStats = useMemo(() => {
    const items = activeTab === "all" ? filteredData : filteredData.filter(d => d.kategoriDaspen);
    const totalAnggota = items.length;
    const totalDaspen = items.filter(d => d.kategoriDaspen).length;
    const katI = items.filter(d => d.kategoriDaspen?.trim() === 'I').length;
    const katII = items.filter(d => d.kategoriDaspen?.trim() === 'II').length;
    const katIII = items.filter(d => d.kategoriDaspen?.trim() === 'III').length;
    const sinkron = items.filter(d => d.verifikasi === true).length;
    const tidakSinkron = items.filter(d => d.verifikasi === false).length;
    const belumDicek = items.filter(d => d.verifikasi === null).length;
    const terdaftar = items.filter(d => d.statusKeanggotaan !== 'Tidak Terdaftar').length;
    const tidakTerdaftar = items.filter(d => d.statusKeanggotaan === 'Tidak Terdaftar').length;
    return { totalAnggota, totalDaspen, katI, katII, katIII, sinkron, tidakSinkron, belumDicek, terdaftar, tidakTerdaftar };
  }, [filteredData, activeTab]);

  const ktaStats = useMemo(() => {
    const items = activeTab === "kta" ? filteredData : filteredData.filter(d => d.dataKtaDigital);
    const totalKta = items.length;
    const sinkron = items.filter(d => d.verifikasi === true).length;
    const tidakSinkron = items.filter(d => d.verifikasi === false).length;
    const belumDicek = items.filter(d => d.verifikasi === null).length;
    const terdaftar = items.filter(d => d.statusKeanggotaan !== 'Tidak Terdaftar').length;
    const tidakTerdaftar = items.filter(d => d.statusKeanggotaan === 'Tidak Terdaftar').length;
    return { totalKta, sinkron, tidakSinkron, belumDicek, terdaftar, tidakTerdaftar };
  }, [filteredData, activeTab]);

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && <NotificationToast type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
      {isMobile ? (
        <header className="bg-teal-700 text-white py-4 px-4 shadow-md fixed top-0 left-0 w-full z-50 flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" onClick={handleBackClick} className="cursor-pointer mr-4" />
            <h1 className="text-lg font-bold">Sinkronisasi Data</h1>
          </div>
          <button aria-label="Menu" className="p-2" onClick={() => setShowActions(true)}><FaBars size={22} /></button>
        </header>
      ) : <HeaderMenu />}
      <main className="p-4 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 mt-8">Dashboard Sinkronisasi Data</h1>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-fit">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* STATS CARDS - BEDA PER TAB */}
          {activeTab !== "kta" && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <StatCard icon={<FiList size={20} />} label="Total Anggota" value={katStats.totalAnggota.toLocaleString('id-ID')} color="teal" />
              <StatCard icon={<FaLayerGroup size={20} />} label="Punya Daspen" value={katStats.totalDaspen.toLocaleString('id-ID')} color="blue" />
              <StatCard icon={<FaCheckCircle size={20} />} label="Kat I" value={katStats.katI.toLocaleString('id-ID')} color="blue" />
              <StatCard icon={<FaCheckDouble size={20} />} label="Kat II" value={katStats.katII.toLocaleString('id-ID')} color="amber" />
              <StatCard icon={<FaUsers size={20} />} label="Kat III" value={katStats.katIII.toLocaleString('id-ID')} color="purple" />
              <StatCard icon={<FaCheckCircle size={20} />} label="Sinkron" value={katStats.sinkron.toLocaleString('id-ID')} color="teal" />
              <StatCard icon={<FaExclamationCircle size={20} />} label="Tidak Sinkron" value={katStats.tidakSinkron.toLocaleString('id-ID')} color="rose" />
              <StatCard icon={<FaHourglassHalf size={20} />} label="Belum Dicek" value={katStats.belumDicek.toLocaleString('id-ID')} color="amber" />
            </div>
          )}
          {activeTab === "kta" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<FaIdCard size={20} />} label="Total KTA Digital" value={ktaStats.totalKta.toLocaleString('id-ID')} color="teal" />
              <StatCard icon={<FaCheckCircle size={20} />} label="Sinkron" value={ktaStats.sinkron.toLocaleString('id-ID')} color="teal" />
              <StatCard icon={<FaExclamationCircle size={20} />} label="Tidak Sinkron" value={ktaStats.tidakSinkron.toLocaleString('id-ID')} color="rose" />
              <StatCard icon={<FaHourglassHalf size={20} />} label="Belum Dicek" value={ktaStats.belumDicek.toLocaleString('id-ID')} color="amber" />
            </div>
          )}

          {/* FILTER SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Filter & Pencarian</h2>
              {!isMobile && (
                <button aria-label="Tindakan" className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition" onClick={() => setShowActions(true)}>
                  <FaBars /><span>Tindakan</span>
                </button>
              )}
            </div>
            <div className="border-t my-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative w-full" ref={cabangRef}>
                <Input type="text" value={selectedCabang} readOnly onClick={() => { if (role !== "ADMIN") { setFilteredCabangList(originalCabangList); setShowCabangDropdown(true); } }}
                  className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none ${role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Pilih Cabang" disabled={role === "ADMIN"} />
                {showCabangDropdown && role !== "ADMIN" && (
                  <div className="absolute z-20 border rounded-md bg-white shadow-md mt-2 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="p-2"><Input type="text" onChange={(e) => setFilteredCabangList(originalCabangList.filter(c => c.kecamatan.toLowerCase().includes(e.target.value.toLowerCase())))} placeholder="Cari Cabang..." autoFocus className="block w-full" /></li>
                      <li onClick={() => { setSelectedCabang(""); setShowCabangDropdown(false); }} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Semua Cabang</li>
                      {filteredCabangList.sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, "id")).map(c => (
                        <li key={c.id} onClick={() => { setSelectedCabang(c.kecamatan); setShowCabangDropdown(false); }} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{c.kecamatan}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative w-full" ref={unitKerjaRef}>
                <Input type="text" value={unitKerjaInput} onChange={(e) => { setUnitKerjaInput(e.target.value); setSelectedUnitKerja(e.target.value); if (selectedCabang) { setFilteredUnitKerja(unitKerjaList.filter(u => u.cabang.toLowerCase() === selectedCabang.toLowerCase() && u.unitKerja.toLowerCase().includes(e.target.value.toLowerCase()))); setShowUnitKerjaDropdown(true); } }}
                  onFocus={() => { if (selectedCabang) { filterUnitKerjaForCabang(selectedCabang); setShowUnitKerjaDropdown(true); } }}
                  placeholder="Pilih Unit Kerja" className={`block w-full px-4 py-2 border rounded-md ${!selectedCabang ? "bg-gray-100 cursor-not-allowed" : ""}`} disabled={!selectedCabang} />
                {showUnitKerjaDropdown && (
                  <div className="absolute z-20 border rounded-md bg-white shadow-md mt-2 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li onClick={() => { setSelectedUnitKerja(""); setUnitKerjaInput(""); setShowUnitKerjaDropdown(false); }} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Semua Unit Kerja</li>
                      {filteredUnitKerja.sort((a, b) => a.unitKerja.localeCompare(b.unitKerja, "id")).map(u => (
                        <li key={u.id} onClick={() => { setSelectedUnitKerja(u.unitKerja); setUnitKerjaInput(u.unitKerja); setShowUnitKerjaDropdown(false); setCurrentPage(1); }} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{u.unitKerja}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="w-full">
                <Input type="text" className="block w-full px-4 py-2 border rounded-md" placeholder="Cari Nama / NPA / NIP" onChange={handleNamaChange} />
              </div>
              <div className="w-full">
                <select onChange={(e) => setStatusKeanggotaan(e.target.value)} className="block w-full px-4 py-2 border rounded-md" defaultValue="">
                  <option value="">Semua Status</option>
                  <option value="Terdaftar di KTA Digital dan Daspen">KTA + Daspen</option>
                  <option value="Terdaftar di KTA Digital">KTA Digital</option>
                  <option value="Terdaftar di Daspen">Daspen</option>
                  <option value="Tidak Terdaftar">Tidak Terdaftar</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('id')}>No <SortIcon field="id" /></th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('cabang')}>Cabang <SortIcon field="cabang" /></th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('unitKerja')}>Unit Kerja <SortIcon field="unitKerja" /></th>
                    {!isMobile && (<>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('namaAnggota')}>Nama <SortIcon field="namaAnggota" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('npa')}>NPA <SortIcon field="npa" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('nip')}>NIP <SortIcon field="nip" /></th>
                      {activeTab !== "kta" && <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('kategoriDaspen')}>Kat Daspen <SortIcon field="kategoriDaspen" /></th>}
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataKtaDigital')}>KTA <SortIcon field="dataKtaDigital" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataDaspen')}>Daspen <SortIcon field="dataDaspen" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataSanduka')}>Sanduka <SortIcon field="dataSanduka" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('verifikasi')}>Verifikasi <SortIcon field="verifikasi" /></th>
                      <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('statusKeanggotaan')}>Status <SortIcon field="statusKeanggotaan" /></th>
                    </>)}
                  </tr>
                </thead>
                {loading ? <TableSkeleton /> : (
                  <tbody>
                    {paginatedData.map((item, index) => {
                      const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      const isExpanded = expandedRow === actualIndex;
                      return (
                        <React.Fragment key={item.id || index}>
                          <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center md:justify-start">
                                <span>{actualIndex}</span>
                                {isMobile && <button onClick={() => toggleExpandRow(actualIndex)} className="ml-2 text-teal-500"><FontAwesomeIcon icon={isExpanded ? faMinusCircle : faPlusCircle} size="lg" /></button>}
                              </div>
                            </td>
                            <td className="py-4 px-6">{item.cabang}</td>
                            <td className="py-4 px-6">{item.unitKerja}</td>
                            {!isMobile && (<>
                              <td className="py-4 px-6 font-medium text-slate-800">{item.namaAnggota}</td>
                              <td className="py-4 px-6 text-center">{item.npa || "-"}</td>
                              <td className="py-4 px-6 text-center">{item.nip || "-"}</td>
                              {activeTab !== "kta" && <td className="py-4 px-6 text-center">{getKatPill(item.kategoriDaspen)}</td>}
                              <td className="py-4 px-6 text-center">{getBooleanPill(item.dataKtaDigital)}</td>
                              <td className="py-4 px-6 text-center">{getBooleanPill(item.dataDaspen)}</td>
                              <td className="py-4 px-6 text-center">{getBooleanPill(item.dataSanduka)}</td>
                              <td className="py-4 px-6 text-center">{getVerificationPill(item.verifikasi)}</td>
                              <td className="py-4 px-6 text-center">{getStatusPill(item.statusKeanggotaan)}</td>
                            </>)}
                          </tr>
                          {isMobile && isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm"><span className="font-semibold">Nama</span><span>{item.namaAnggota}</span></div>
                                  <div className="flex justify-between text-sm"><span className="font-semibold">NPA</span><span>{item.npa || "-"}</span></div>
                                  <div className="flex justify-between text-sm"><span className="font-semibold">NIP</span><span>{item.nip || "-"}</span></div>
                                  <div className="border-t my-2"></div>
                                  {activeTab !== "kta" && <div className="flex justify-between items-center text-sm"><span className="font-semibold">Kat Daspen</span>{getKatPill(item.kategoriDaspen)}</div>}
                                  <div className="flex justify-between items-center text-sm"><span className="font-semibold">KTA Digital</span>{getBooleanPill(item.dataKtaDigital)}</div>
                                  <div className="flex justify-between items-center text-sm"><span className="font-semibold">Daspen</span>{getBooleanPill(item.dataDaspen)}</div>
                                  <div className="flex justify-between items-center text-sm"><span className="font-semibold">Sanduka</span>{getBooleanPill(item.dataSanduka)}</div>
                                  <div className="flex justify-between items-center text-sm"><span className="font-semibold">Verifikasi</span>{getVerificationPill(item.verifikasi)}</div>
                                  <div className="flex justify-between items-center text-sm"><span className="font-semibold">Status</span>{getStatusPill(item.statusKeanggotaan)}</div>
                                  <div className="border-t my-2"></div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold">Aksi</span>
                                    <div className="flex items-center gap-4">
                                      <a href={`https://wa.me/${item.nomorHp}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600"><FontAwesomeIcon icon={faWhatsapp} size="2x" /></a>
                                      <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
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

      {/* SIDE PANEL ACTIONS */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-[60] transition-transform duration-300 transform ${showActions ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Menu Tindakan</h2>
          <button aria-label="Tutup" className="text-gray-500 hover:text-red-500" onClick={() => setShowActions(false)}><FaTimes size={24} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setShowTemplateModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"><FaDownload /> Download Template</Button>
          <Button onClick={() => setIsUploadModalOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"><FaUpload /> Upload Data</Button>
          <Button onClick={() => router.push("/singkron-data/cek-data")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"><FaSearch /> Cek Data</Button>
          {role === 'SUPERADMIN' && <Button onClick={handleDownloadRekap} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Rekap Anggota</Button>}
        </div>
      </div>
      {showActions && <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowActions(false)}></div>}

      {/* UPLOAD MODAL */}
      <Modal isOpen={isUploadModalOpen} onRequestClose={() => setIsUploadModalOpen(false)} contentLabel="Upload Data" className="fixed inset-0 flex items-center justify-center p-4 z-[100]" overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-[90]">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Upload Data Anggota</h2>
            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Data</label>
                <select name="category" onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="DASPEN">Daspen</option>
                  <option value="KTA_DIGITAL">KTA Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File Excel</label>
                <Input type="file" name="file" onChange={handleInputChange} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" accept=".xls,.xlsx" />
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
              <Button type="button" onClick={() => setIsUploadModalOpen(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Batal</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={loader}>{loader ? 'Mengunggah...' : 'Submit'}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* TEMPLATE MODAL */}
      <Modal isOpen={showTemplateModal} onRequestClose={() => setShowTemplateModal(false)} contentLabel="Pilih Template" className="fixed inset-0 flex items-center justify-center p-4 z-[100]" overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-[90]">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Download Template</h2>
            <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          </div>
          <div className="flex flex-col gap-4">
            <button className={`w-full p-4 rounded-lg text-left transition ${selectedTemplate === 'daspen' ? 'bg-teal-100 ring-2 ring-teal-500 text-teal-800' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => setSelectedTemplate("daspen")}>
              <p className="font-bold">Template Daspen</p>
              <p className="text-sm">Gunakan ini untuk data iuran Daspen.</p>
            </button>
            <button className={`w-full p-4 rounded-lg text-left transition ${selectedTemplate === 'kta' ? 'bg-teal-100 ring-2 ring-teal-500 text-teal-800' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => setSelectedTemplate("kta")}>
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
