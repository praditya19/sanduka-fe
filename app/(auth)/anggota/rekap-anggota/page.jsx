"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi, { BASE_URL } from "@/app/_utils/GlobalApi";

import { FaPrint, FaFileExcel, FaRegClock } from "react-icons/fa";

// Components
import NotificationPopup from "./components/NotificationPopup";
import MemberRow from "./components/MemberRow";
import EditFinanceModal from "./components/EditFinanceModal";
import MemberDetailModal from "./components/MemberDetailModal";
import FilterSection from "./components/FilterSection";
import SummaryBanner from "./components/SummaryBanner";
import BackupConfirmModal from "./components/BackupConfirmModal";
import SummaryStats from "./components/SummaryStats";

// Utils
import { formatTanggal, processApiResponse, processData, getTotalSumbangan } from "./utils/rekapUtils";
import { handlePrintLogic, exportToExcelLogic, exportPotonganBankLogic, exportMandiriLogic } from "./utils/exportUtils";

function RekapAnggota() {
  // --- States ---
  const [data, setData] = useState([]);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [searchCabang, setSearchCabang] = useState("");

  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [searchUnitKerja, setSearchUnitKerja] = useState("");

  const [namaAnggotaInput, setNamaAnggotaInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Progressive Rendering States
  const [displayLimit, setDisplayLimit] = useState(100);
  const loadMoreRef = useRef(null);

  // Modal States
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dataNpa, setDataNpa] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [nomorRekening, setNomorRekening] = useState("");
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  
  const [selectedMonth, setSelectedMonth] = useState(nextMonthDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(nextMonthDate.getFullYear());
  const [nominalBaruList, setNominalBaruList] = useState({});
  const [resetKeys, setResetKeys] = useState([]);
  const [sumbanganList, setSumbanganList] = useState([]);
  const [addedCategories, setAddedCategories] = useState([]);
  const [manualInputs, setManualInputs] = useState({});
  const [newValues, setNewValues] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedKeterangan, setSelectedKeterangan] = useState("");
  const [keteranganLainLain, setKeteranganLainLain] = useState([]);
  const [standardIuranList, setStandardIuranList] = useState([]);
  const [notifDaspen, setNotifDaspen] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataIuran, setDataIuran] = useState(null);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [daspenValue, setDaspenValue] = useState(0);
  const [provDaspenValue, setProvDaspenValue] = useState(0); // Simpan nilai prov untuk sinkronisasi otomatis
  const [nipValue, setNipValue] = useState("");
  const [idIuran, setIdIuran] = useState(null);
  const [statusPegawai, setStatusPegawai] = useState(null);
  const [idByNominal, setIdByNominal] = useState(null);

  // Computed values for Modal
  const groupedIuran = useMemo(() => {
    if (!selectedMember) return [];
    const base = [
      { key: "pgri", iuran: selectedMember.pgri },
      { key: "sanduka", iuran: selectedMember.sanduka },
      { key: "daspen", iuran: daspenValue },
      { key: "derap", iuran: selectedMember.derap },
      { key: "kalender", iuran: selectedMember.kalender },
    ];

    // Ambil detail sumbangan (Lain-Lain) yang sudah ada di database
    const existingSumbangan = (selectedMember.detailSumbangan || []).map(s => ({
      key: s.namaSumbangan,
      label: s.namaSumbangan,
      iuran: s.jumlah,
      isExistingSumbangan: true
    }));

    // Gabungkan dengan kategori yang ditambahkan manual di sesi ini
    const extra = addedCategories.map(cat => ({
      key: cat.key,
      label: cat.label,
      iuran: newValues[cat.key] || 0
    }));

    // Filter duplikat (jika ada yang di addedCategories tapi sudah ada di existing)
    const filteredExtra = extra.filter(e => !existingSumbangan.some(ex => ex.key === e.key));

    return [...base, ...existingSumbangan, ...filteredExtra];
  }, [selectedMember, daspenValue, addedCategories, newValues]);

  useEffect(() => {
    let total = groupedIuran.reduce((sum, item) => {
      const isReset = resetKeys.includes(item.key);
      const val = isReset ? 0 : (parseInt(item.iuran || 0) + (nominalBaruList[item.key] || 0));
      return sum + val;
    }, 0);

    setGrandTotal(total);
  }, [groupedIuran, resetKeys, nominalBaruList]);

  // --- Fetch Keterangan Lain-Lain dari API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Keterangan Lain-Lain
        let responseLain = await GlobalApi.getKeteranganLainlain();
        const actualLain = responseLain?.data || responseLain || [];
        setKeteranganLainLain(actualLain);

        // 2. Fetch Iuran Standar (PGRI, Kalender, Derap, dll)
        let responseStd = await GlobalApi.getIuranByFilter("");
        const actualStd = Array.isArray(responseStd) ? responseStd : (responseStd?.data || []);
        setStandardIuranList(actualStd);
      } catch (error) {
        console.error("❌ Gagal mengambil data inisialisasi:", error);
      }
    };
    fetchData();
  }, []);

  const [filesDataMap, setFilesDataMap] = useState({});
  const [open, setOpen] = useState(false);

  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const namaInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const lastUpdatedMemberRef = useRef(null);
  const [lastUpdatedMemberNip, setLastUpdatedMemberNip] = useState(null);
  const [showRekapDropdown, setShowRekapDropdown] = useState(false);
  const rekapDropdownRef = useRef(null);

  const profileImageUrl = "/profile.png";

  // --- Derived Data ---
  const groupedData = useMemo(() => processData(data), [data]);

  const stats = useMemo(() => {
    const initial = {
      pgri: 0,
      sanduka: 0,
      daspen: 0,
      derap: 0,
      kalender: 0,
      sumbangan: 0,
      total: 0,
      unitKerjaCount: new Set(),
      memberCount: data.length
    };

    data.forEach(item => {
      initial.pgri += parseInt(item.pgri || 0);
      initial.sanduka += parseInt(item.sanduka || 0);
      initial.daspen += parseInt(item.daspen || 0);
      initial.derap += parseInt(item.derap || 0);
      initial.kalender += parseInt(item.kalender || 0);
      initial.sumbangan += parseInt(item.sumbangan || 0);
      initial.total += parseInt(item.totalIuran || 0);
      if (item.unitKerja) initial.unitKerjaCount.add(item.unitKerja);
    });

    return {
      ...initial,
      unitKerjaCount: initial.unitKerjaCount.size
    };
  }, [data]);

  // --- Effects ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rekapDropdownRef.current && !rekapDropdownRef.current.contains(event.target)) {
        setShowRekapDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [cabangRes, unitKerjaRes] = await Promise.all([
          GlobalApi.getCabang(),
          GlobalApi.getUnitKerja()
        ]);
        const sortedCabang = cabangRes.data.sort((a, b) =>
          (a.kecamatan || "").localeCompare(b.kecamatan || "")
        );
        const sortedUnitKerja = unitKerjaRes.data.sort((a, b) =>
          (a.unitKerja || "").localeCompare(b.unitKerja || "")
        );
        setOriginalCabangList(sortedCabang);
        setFilteredCabangList(sortedCabang);
        setUnitKerjaList(sortedUnitKerja);
      } catch (err) {
        console.error("Error fetching base data:", err);
      }
    };
    fetchBaseData();
  }, []);

  const fetchInitialData = useCallback(async () => {
    // Beri jeda singkat untuk memastikan session/token di browser benar-benar siap
    await new Promise(resolve => setTimeout(resolve, 100));

    const currentToken = token || sessionStorage.getItem("authToken");
    if (!currentToken && !sessionStorage.getItem("role")) return;

    setLoading(true);
    try {
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      let response;
      // Kembalikan: Hanya ADMIN yang dibatasi cabangnya secara otomatis
      // SUPERADMIN tetap melihat semua data secara default ("")
      if (storedRole === "ADMIN" && storedCabang) {
        setIsAdmin(true);
        setSelectedCabang(storedCabang);
        response = await GlobalApi.getNominalAggregatedData(storedCabang);
      } else {
        setIsAdmin(storedRole === "ADMIN");
        setSelectedCabang("");
        response = await GlobalApi.getNominalAggregatedData("");
      }

      const apiData = Array.isArray(response) ? response : (response?.data || []);

      // 1. Ambil data file (Daspen prov) lebih awal agar bisa disinkronkan
      let fileMap = {};
      try {
        const filesResponse = await GlobalApi.getAllFiles();
        if (Array.isArray(filesResponse)) {
          filesResponse.forEach(f => { if (f.nip) fileMap[f.nip] = f.sumbangan; });
          setFilesDataMap(fileMap);
        }
      } catch (fileErr) {
        console.warn("Could not fetch secondary files data:", fileErr);
      }

      const processedData = processApiResponse(apiData, null, false);

      // 2. Sinkronkan data daspen dengan data prov (fileMap) secara otomatis
      const syncedData = processedData.map(item => {
        if (item.nip && fileMap[item.nip]) {
          const provValue = parseInt(fileMap[item.nip]);
          const currentValue = parseInt(item.daspen || 0);
          // Hanya sinkronkan jika nilainya bukan 0 (berarti belum dihapus sengaja)
          // dan nilainya berbeda dengan data provinsi
          if (currentValue !== 0 && currentValue !== provValue) {
            const diff = provValue - currentValue;
            return {
              ...item,
              daspen: provValue,
              totalIuran: (parseInt(item.totalIuran || 0) + diff)
            };
          }
        }
        return item;
      });

      const regularData = syncedData.filter(item => !(item.cabang === "Total" && !item.unitKerja));

      setData(regularData);
      setOriginalRekapData(regularData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Hanya ambil data jika AuthContext sudah selesai loading
    if (!authLoading) {
      fetchInitialData();
    }
  }, [fetchInitialData, authLoading, token]);

  // Progressive Rendering Logic
  const memoizedFlattenedMembers = useMemo(() => {
    return [...groupedData]
      .sort((a, b) => a.unitKerja.localeCompare(b.unitKerja))
      .flatMap(group => group.members.map(member => ({
        ...member,
        cabang: group.cabang,
        unitKerja: group.unitKerja,
      })));
  }, [groupedData]);

  useEffect(() => {
    if (displayLimit >= memoizedFlattenedMembers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit(prev => prev + 500);
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); };
  }, [memoizedFlattenedMembers.length, displayLimit]);

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(debouncedSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [debouncedSearchQuery]);

  // --- Handlers ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleCabangSearch = (query) => {
    setSearchCabang(query);
    const filtered = originalCabangList.filter(c => c.kecamatan.toLowerCase().includes(query.toLowerCase()));
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    setSelectedUnitKerja("");
    setUnitKerjaInput("");
    setNamaAnggotaInput("");

    if (!cabang.kecamatan) {
      setData(originalRekapData);
      return;
    }

    try {
      setLoading(true);
      let res = await GlobalApi.getNominalAggregatedData(cabang.kecamatan);
      const apiData = Array.isArray(res) ? res : (res?.data || []);
      const processed = processApiResponse(apiData, null, false);
      const regular = processed.filter(item => !(item.cabang === "Total" && !item.unitKerja));
      setData(regular);

      const filteredUnit = unitKerjaList.filter(u => u.cabang?.toLowerCase() === cabang.kecamatan.toLowerCase());
      setFilteredUnitKerja(filteredUnit);
    } catch (err) {
      console.error("Error selecting cabang:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);
    if (!selectedCabang) return;

    const filtered = unitKerjaList.filter(u =>
      u.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
      u.unitKerja.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredUnitKerja(filtered);
    setShowUnitKerjaDropdown(true);

    const filteredData = originalRekapData.filter(item =>
      item.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
      (input === "" || item.unitKerja?.toLowerCase().includes(input.toLowerCase()))
    );
    setData(filteredData);
  };

  const handleUnitKerjaFocus = () => { if (selectedCabang) setShowUnitKerjaDropdown(true); };

  const handleUnitKerjaClick = () => {
    if (!selectedCabang) return;
    const filtered = unitKerjaList.filter(u => u.cabang?.toLowerCase() === selectedCabang.toLowerCase());
    setFilteredUnitKerja(filtered);
    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const val = unitKerja.unitKerja;
    setSelectedUnitKerja(val);
    setUnitKerjaInput(val);
    setShowUnitKerjaDropdown(false);

    const filteredData = originalRekapData.filter(item =>
      item.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
      (!val || item.unitKerja?.toLowerCase() === val.toLowerCase())
    );
    setData(filteredData);
  };

  const handleUnitKerjaSearch = (query) => {
    setSearchUnitKerja(query);
    const filtered = unitKerjaList.filter(u =>
      u.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
      u.unitKerja.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUnitKerja(filtered);
  };

  const handleNamaAnggotaInputChange = (e) => {
    setNamaAnggotaInput(e.target.value);
    setDebouncedSearchQuery(e.target.value);
  };

  const performSearch = (query) => {
    const filtered = originalRekapData.filter(item => {
      const matchCabang = !selectedCabang || item.cabang?.toLowerCase() === selectedCabang.toLowerCase();
      const matchUnit = !selectedUnitKerja || item.unitKerja?.toLowerCase() === selectedUnitKerja.toLowerCase();
      const matchName = !query || item.namaAnggota?.toLowerCase().includes(query.toLowerCase());
      return matchCabang && matchUnit && matchName;
    });
    setData(filtered);
  };

  const handleSearchClick = useCallback(() => performSearch(namaAnggotaInput), [performSearch, namaAnggotaInput]);

  // Modal Handlers
  const handleMemberClick = useCallback(async (member) => {
    const daspenFromMember = member.daspen ? parseInt(member.daspen) : 0;
    setDaspenValue(daspenFromMember);

    setNipValue(member.nip);
    setSelectedMember(null);
    setDataNpa(null);
    setFotoBase64(null);
    setDataIuran(null);
    setIsPopupVisible(false);
    setIdIuran(null);
    setNotifDaspen(null);
    setNomorRekening("");
    setNominalBaruList({});
    setResetKeys([]);
    setAddedCategories([]);
    setManualInputs({});
    setStatusPegawai(member.statusPegawai || null);

    try {
      const fileResponse = await GlobalApi.getFileByNip(member.nip);
      if (fileResponse?.sumbangan) {
        const nominalProv = parseInt(fileResponse.sumbangan);
        setProvDaspenValue(nominalProv);
        // Jangan set daspenValue dulu di sini agar tetap tersembunyi jika database 0
      }
      setNotifDaspen(fileResponse?.dataDaspen === true);
    } catch (error) {
      console.error("❌ Gagal mengambil file by NIP:", error);
    }

    try {
      const response = await GlobalApi.cekNpaList([member.npaPgri]);
      setDataNpa(response[0] || null);

      if (response[0]?.foto) {
        try {
          const decodedString = atob(response[0].foto);
          setFotoBase64(decodedString);
        } catch (error) {
          console.error("❌ Error decoding Base64:", error);
          setFotoBase64(null);
        }
      }

      const dataIuran = await GlobalApi.getByIdByNominal(member.idByNominal);
      setDataIuran(dataIuran);
      setIdByNominal(member.idByNominal);
      setIdIuran(dataIuran.id || null);
      setNomorRekening(dataIuran.nomorRekening || "");

      const manualValues = {};
      const manualKeys = ["Pgri", "Sanduka", "Daspen", "Derap", "Kalender"];
      manualKeys.forEach((key) => {
        const manualKey = `manual${key}`;
        if (dataIuran[manualKey] && dataIuran[manualKey] > 0) {
          manualValues[key.toLowerCase()] = dataIuran[manualKey];
        }
      });
      setNominalBaruList(manualValues);

      // --- TRIPLE FALLBACK: Pastikan nominal tidak 0 ---
      const profile = response[0] || {};
      const freshMember = {
        ...member,
        pgri: (dataIuran.defaultPgri && parseInt(dataIuran.defaultPgri) > 0) ? parseInt(dataIuran.defaultPgri) : (dataIuran.pgri && parseInt(dataIuran.pgri) > 0) ? (parseInt(dataIuran.pgri) - (parseInt(dataIuran.manualPgri) || 0)) : (member.pgri > 0 ? parseInt(member.pgri) : (parseInt(profile.pgri) || 8000)),
        sanduka: (dataIuran.defaultSanduka && parseInt(dataIuran.defaultSanduka) > 0) ? parseInt(dataIuran.defaultSanduka) : (dataIuran.sanduka && parseInt(dataIuran.sanduka) > 0) ? (parseInt(dataIuran.sanduka) - (parseInt(dataIuran.manualSanduka) || 0)) : (member.sanduka > 0 ? parseInt(member.sanduka) : (parseInt(profile.sanduka) || 3000)),
        daspen: (dataIuran.defaultDaspen && parseInt(dataIuran.defaultDaspen) > 0) ? parseInt(dataIuran.defaultDaspen) : (dataIuran.daspen && parseInt(dataIuran.daspen) > 0) ? (parseInt(dataIuran.daspen) - (parseInt(dataIuran.manualDaspen) || 0)) : (member.daspen > 0 ? parseInt(member.daspen) : (parseInt(profile.daspen) || 0)),
        derap: (dataIuran.defaultDerap && parseInt(dataIuran.defaultDerap) > 0) ? parseInt(dataIuran.defaultDerap) : (dataIuran.derap && parseInt(dataIuran.derap) > 0) ? (parseInt(dataIuran.derap) - (parseInt(dataIuran.manualDerap) || 0)) : (member.derap > 0 ? parseInt(member.derap) : (parseInt(profile.derap) || 0)),
        kalender: (dataIuran.defaultKalender && parseInt(dataIuran.defaultKalender) > 0) ? parseInt(dataIuran.defaultKalender) : (dataIuran.kalender && parseInt(dataIuran.kalender) > 0) ? (parseInt(dataIuran.kalender) - (parseInt(dataIuran.manualKalender) || 0)) : (member.kalender > 0 ? parseInt(member.kalender) : (parseInt(profile.kalender) || 0)),
      };

      // Set data final sekaligus untuk memicu re-render modal yang akurat
      setSelectedMember(freshMember);

      // --- PERBAIKAN: Daspen hanya muncul jika sudah ada di database ---
      // Jika di database 0 (Belum Input), daspenValue diset 0 agar tidak muncul di modal
      // sesuai permintaan: "jika belom input mka pas di edit daspen gk muncul"
      const finalDaspen = (dataIuran.daspen && parseInt(dataIuran.daspen) > 0) ? parseInt(dataIuran.daspen) : 0;
      setDaspenValue(finalDaspen);

      if (dataIuran?.iuranSumbanganList && Array.isArray(dataIuran.iuranSumbanganList)) {
        setSumbanganList(dataIuran.iuranSumbanganList);
      } else {
        setSumbanganList([]);
      }

      setIsPopupVisible(true);
    } catch (error) {
      console.error("❌ Gagal mengambil data iuran anggota:", error);
    }
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupVisible(false);
    setDataNpa(null);
    setFotoBase64(null);
    setNomorRekening("");
    setResetKeys([]);
    setNominalBaruList({});
    setSumbanganList([]);
    setAddedCategories([]);
    setManualInputs({});
    setDaspenValue(0);
    setNipValue("");
    setIdIuran(null);
    setStatusPegawai(null);
    setIdByNominal(null);
  }, []);

  const handleUpdateIuran = async (id, payload) => {
    try {
      // Pastikan ID adalah number untuk endpoint /api/by-nominal/
      const numericId = parseInt(id);
      await GlobalApi.updateByNominal(numericId, payload);
      setNotification({ type: "success", message: "Data berhasil diperbarui!" });
      fetchInitialData();
      return true;
    } catch (err) {
      console.error("Error updating iuran:", err);
      setNotification({ type: "error", message: "Gagal memperbarui data." });
      return false;
    }
  };

  const handleDeleteSumbangan = (jenis) => {
    setSumbanganList(prev => prev.map(s => s.jenis === jenis ? { ...s, jumlah: 0 } : s));
  };

  const handleSave = async () => {
    if (!selectedKategori) return;

    let uniqueKey = selectedKategori;
    let initialValue = 0;

    // 🔧 helper untuk bersihin string
    const cleanText = (text) =>
      text?.toString().replace(/"/g, "").trim().toLowerCase();

    // 1. Handle uniqueKey khusus lainlain
    if (selectedKategori === "lainlain") {
      try {
        const parsed = JSON.parse(selectedKeterangan);
        const rawKey = parsed.keterangan || parsed.nama_iuran || selectedKeterangan;
        uniqueKey = rawKey.toString().replace(/"/g, "").trim();
      } catch (e) {
        uniqueKey = selectedKeterangan?.toString().replace(/"/g, "").trim() || `Lain-Lain-${Date.now()}`;
      }
    }

    // 2. Ambil standard iuran (fallback jika kosong)
    let currentStdList = standardIuranList;

    if (currentStdList.length === 0) {
      try {
        const responseStd = await GlobalApi.getIuranByFilter("");
        currentStdList = Array.isArray(responseStd)
          ? responseStd
          : responseStd?.data || [];
        setStandardIuranList(currentStdList);
      } catch (e) {
        console.error("On-demand fetch failed:", e);
      }
    }

    // =========================
    // 📅 KALENDER / DERAP
    // =========================
    if (selectedKategori === "kalender" || selectedKategori === "derap") {
      const matchName = selectedKategori.trim().toUpperCase();

      let stdItem = currentStdList.find(
        (item) => item.iuran?.trim().toUpperCase() === matchName
      );

      if (!stdItem) {
        try {
          const res = await GlobalApi.getIuranByFilter(matchName);
          stdItem = Array.isArray(res)
            ? res[0]
            : res?.data?.[0] || res;

          if (stdItem) {
            setStandardIuranList((prev) => [...prev, stdItem]);
          }
        } catch (e) {
          console.error("Specific fetch failed:", e);
        }
      }

      if (stdItem) {
        initialValue =
          parseInt(stdItem.propinsi || 0) +
          parseInt(stdItem.kabupaten || 0) +
          parseInt(stdItem.cabang || 0);
      }

      // fallback API cabang
      const cabangId =
        selectedMember?.cabang || selectedMember?.user?.cabang;

      if (initialValue === 0 && cabangId) {
        try {
          const apiFunc =
            selectedKategori === "kalender"
              ? GlobalApi.getTableKalender
              : GlobalApi.getTableDerap;

          const res = await apiFunc(
            selectedMonth,
            selectedYear,
            cabangId
          );

          const data =
            res?.data?.[0] || res?.[0] || res?.data || res;

          if (data) {
            initialValue = Object.entries(data).reduce(
              (acc, [k, v]) => {
                if (
                  ["propinsi", "kabupaten", "cabang", "nominal", "jumlah", "tarif"].some(
                    (key) => k.toLowerCase().includes(key)
                  ) &&
                  !["id", "bulan", "tahun"].includes(k.toLowerCase())
                ) {
                  return acc + (parseInt(v) || 0);
                }
                return acc;
              },
              0
            );
          }
        } catch (e) {
          console.error("API Fallback failed:", e);
        }
      }
    }

    // =========================
    // 📦 LAIN-LAIN (FIXED)
    // =========================
    else if (selectedKategori === "lainlain" && selectedKeterangan) {
      try {
        console.log("🔍 Keterangan dipilih:", selectedKeterangan);

        const response = await GlobalApi.getLainlain(selectedKeterangan);

        const dataList = Array.isArray(response)
          ? response
          : response?.data || [];

        console.log("📋 Data list:", dataList);

        let searchKeterangan = selectedKeterangan;
        try {
          const parsed = JSON.parse(selectedKeterangan);
          const rawKey = parsed.keterangan || parsed.nama_iuran || selectedKeterangan;
          searchKeterangan = rawKey.toString().replace(/"/g, "").trim();
        } catch (e) {
          searchKeterangan = selectedKeterangan?.toString().replace(/"/g, "").trim();
        }

        const matchingItem = dataList.find(
          (item) =>
            cleanText(item.keterangan) ===
            cleanText(searchKeterangan)
        );

        console.log("🎯 Matching item:", matchingItem);

        if (matchingItem) {
          initialValue = parseInt(matchingItem.jumlahNominal || 0);
          console.log("💰 Initial value:", initialValue);
        } else {
          console.warn(
            "⚠️ Tidak ditemukan data dengan keterangan:",
            selectedKeterangan
          );
          initialValue = 0;
        }
      } catch (error) {
        console.error("❌ Gagal mengambil data lain-lain:", error);
      }
    }

    // =========================
    // 🧮 DASPEN
    // =========================
    else if (selectedKategori === "daspen") {
      initialValue = parseInt(provDaspenValue || daspenValue || 0);
    }

    // =========================
    // 👥 PGRI & SANDUKA
    // =========================
    else if (
      selectedKategori === "pgri" ||
      selectedKategori === "sanduka"
    ) {
      let pgriItem = currentStdList.find(
        (item) =>
          item.iuran?.trim().toUpperCase() === "IURAN PGRI"
      );

      if (!pgriItem) {
        try {
          const res = await GlobalApi.getIuranByFilter("IURAN PGRI");
          pgriItem = Array.isArray(res)
            ? res[0]
            : res?.data?.[0] || res;

          if (pgriItem) {
            setStandardIuranList((prev) => [...prev, pgriItem]);
          }
        } catch (e) {
          console.error("PGRI fetch failed:", e);
        }
      }

      if (selectedKategori === "pgri") {
        initialValue = pgriItem
          ? parseInt(pgriItem.pb || 0) +
          parseInt(pgriItem.propinsi || 0) +
          parseInt(pgriItem.kabupaten || 0) +
          parseInt(pgriItem.cabang || 0)
          : 8000;
      } else {
        initialValue = pgriItem?.sanduka
          ? parseInt(pgriItem.sanduka || 0)
          : 3000;
      }
    }

    // =========================
    // 💾 UPDATE STATE
    // =========================
    setNewValues((prev) => ({
      ...prev,
      [uniqueKey]: initialValue,
    }));



    setResetKeys((prev) => prev.filter((k) => k !== uniqueKey));

    if (!addedCategories.some((c) => c.key === uniqueKey)) {
      const labelMap = {
        iuran: "Iuran",
        derap: "Derap",
        kalender: "Kalender",
        lainlain: "Lain-Lain",
        daspen: "Daspen",
        pgri: "PGRI",
        sanduka: "Sanduka",
      };

      setAddedCategories((prev) => [
        ...prev,
        {
          key: uniqueKey,
          label: selectedKategori === "lainlain" ? uniqueKey : (labelMap[selectedKategori] || uniqueKey),
          ...(selectedKategori === "lainlain" && selectedKeterangan
            ? { keterangan: uniqueKey }
            : {}),
        },
      ]);
    }

    // =========================
    // 🔄 RESET
    // =========================
    setShowDropdown(false);
    setSelectedKategori("");
    setSelectedKeterangan("");
  };


  const handleUpdateClick = async () => {
    if (!selectedMember) return;
    setLoadButton(true);
    try {
      const tagihanUntukBulan = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
      const cabangName = selectedMember.cabang || selectedMember.user?.cabang || "";

      // Siapkan payload sesuai format yang diminta
      const payload = {
        nomorRekening,
        tagihanUntukBulan,

        // PGRI: Gunakan nominalBaruList untuk tambahan cabang
        defaultPgri: newValues.pgri ?? selectedMember.pgri ?? 0,
        manualPgri: nominalBaruList.pgri || 0,
        pgri: (newValues.pgri ?? selectedMember.pgri ?? 0) + (nominalBaruList.pgri || 0),

        // SANDUKA
        defaultSanduka: newValues.sanduka ?? selectedMember.sanduka ?? 0,
        manualSanduka: nominalBaruList.sanduka || 0,
        sanduka: (newValues.sanduka ?? selectedMember.sanduka ?? 0) + (nominalBaruList.sanduka || 0),

        // DASPEN
        defaultDaspen: newValues.daspen ?? provDaspenValue ?? daspenValue ?? 0,
        manualDaspen: nominalBaruList.daspen || 0,
        daspen: (newValues.daspen ?? provDaspenValue ?? daspenValue ?? 0) + (nominalBaruList.daspen || 0),

        // DERAP
        defaultDerap: newValues.derap ?? selectedMember.derap ?? 0,
        manualDerap: nominalBaruList.derap || 0,
        derap: (newValues.derap ?? selectedMember.derap ?? 0) + (nominalBaruList.derap || 0),

        // KALENDER
        defaultKalender: newValues.kalender ?? selectedMember.kalender ?? 0,
        manualKalender: nominalBaruList.kalender || 0,
        kalender: (newValues.kalender ?? selectedMember.kalender ?? 0) + (nominalBaruList.kalender || 0),

        // Gabungkan Added Categories & Sumbangan List
        iuranSumbanganList: [
          ...addedCategories.map(c => ({
            jenis: c.label || c.key,
            keterangan: c.keterangan || c.label || c.key,
            namaSumbangan: c.label || c.key,
            namaIuran: c.label || c.key,
            jumlah: resetKeys.includes(c.key) ? 0 : ((newValues[c.key] || 0) + (nominalBaruList[c.key] || 0)),
            cabang: cabangName,
            tagihanUntukBulan
          })),
          ...(selectedMember.detailSumbangan || []).map(s => ({
            jenis: s.namaSumbangan,
            keterangan: s.keterangan || s.namaSumbangan,
            namaSumbangan: s.namaSumbangan,
            namaIuran: s.namaSumbangan,
            jumlah: resetKeys.includes(s.namaSumbangan) ? 0 : (s.jumlah || 0),
            cabang: cabangName,
            tagihanUntukBulan
          }))
        ]
      };

      // Jika ada yang di-reset (Trash icon), paksa jadi 0
      resetKeys.forEach(key => {
        if (payload.hasOwnProperty(key)) payload[key] = 0;
        if (payload.hasOwnProperty(`default${key.charAt(0).toUpperCase() + key.slice(1)}`)) {
          payload[`default${key.charAt(0).toUpperCase() + key.slice(1)}`] = 0;
          payload[`manual${key.charAt(0).toUpperCase() + key.slice(1)}`] = 0;
        }
      });

      const success = await handleUpdateIuran(selectedMember.idByNominal, payload);
      if (success) closePopup();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoadButton(false);
    }
  };

  const handlePrint = useCallback(() => handlePrintLogic(groupedData, selectedMonth, selectedYear), [groupedData, selectedMonth, selectedYear]);
  const exportToExcel = useCallback(() => exportToExcelLogic(selectedCabang, selectedUnitKerja, selectedMonth, selectedYear, namaAnggotaInput, setIsExporting), [selectedCabang, selectedUnitKerja, selectedMonth, selectedYear, namaAnggotaInput]);

  const handleTagihanClick = useCallback((member) => {
    sessionStorage.setItem("idTagihan", member.idByNominal);
    sessionStorage.setItem("npa", member.npaPgri);
    router.push(`/anggota/rekap-anggota/tagihanByAdmin`);
  }, [router]);

  const handleBackupTarget = () => {
    setIsBackupModalVisible(true);
  };

  const confirmBackupTarget = async () => {
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const tagihanUntukBulan = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

    try {
      setIsExporting(true);
      const res = await GlobalApi.postToBackupNew();
      setNotification({
        type: "success",
        message: typeof res === 'string' ? res : "Backup Target berhasil diproses!"
      });
      setIsBackupModalVisible(false);
    } catch (err) {
      console.error("Backup Target error:", err);
      const errorMsg = err.response?.data || err.message || "Gagal memproses Backup Target.";
      setNotification({
        type: "error",
        message: typeof errorMsg === 'string' ? errorMsg : "Gagal memproses Backup Target."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRekap = () => {
    setShowRekapDropdown(!showRekapDropdown);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDataIuran(null);
    setFotoBase64(null);
  };

  // --- Template Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-0">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className={`flex-1 transition-all duration-300 mt-12 px-4 md:px-8 ${isSidebarOpen && !isMobile ? "ml-64" : "ml-0"}`}>
          <main className="w-full py-4 md:py-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-gray-800">
                By Nominal
              </h1>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <button onClick={handlePrint} className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                  <FaPrint /> Cetak
                </button>
                <button onClick={exportToExcel} disabled={isExporting} className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                  <FaFileExcel /> {isExporting ? "Exporting..." : "Excel"}
                </button>

                <div className="relative flex-1 lg:flex-none" ref={rekapDropdownRef}>
                  <button
                    onClick={handleRekap}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <FaRegClock /> Rekap
                  </button>
                  {showRekapDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      <button
                        onClick={() => {
                          exportPotonganBankLogic(groupedData, selectedMonth, selectedYear);
                          setShowRekapDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors text-sm font-medium border-b border-gray-50"
                      >
                        Potongan Bank
                      </button>
                      <button
                        onClick={() => {
                          exportMandiriLogic(groupedData, selectedMonth, selectedYear);
                          setShowRekapDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Potongan Mandiri
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBackupTarget}
                  disabled={isExporting}
                  className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm shadow-sm"
                >
                  Backup Target
                </button>
              </div>
            </div>

            <FilterSection
              isAdmin={isAdmin}
              selectedCabang={selectedCabang}
              handleCabangClick={handleCabangClick}
              cabangRef={cabangRef}
              showCabangDropdown={showCabangDropdown}
              searchCabang={searchCabang}
              handleCabangSearch={handleCabangSearch}
              handleSelectCabang={handleSelectCabang}
              filteredCabangList={filteredCabangList}
              unitKerjaRef={unitKerjaRef}
              unitKerjaInput={unitKerjaInput}
              handleUnitKerjaChange={handleUnitKerjaChange}
              handleUnitKerjaFocus={handleUnitKerjaFocus}
              handleUnitKerjaClick={handleUnitKerjaClick}
              showUnitKerjaDropdown={showUnitKerjaDropdown}
              searchUnitKerja={searchUnitKerja}
              handleUnitKerjaSearch={handleUnitKerjaSearch}
              handleUnitKerjaSelect={handleUnitKerjaSelect}
              filteredUnitKerja={filteredUnitKerja}
              namaAnggotaInput={namaAnggotaInput}
              handleNamaAnggotaInputChange={handleNamaAnggotaInputChange}
              handleSearchClick={handleSearchClick}
            />

            <SummaryStats stats={stats} isLoading={loading} />

            {/* <SummaryBanner
              totalAnggota={groupedData.reduce((sum, g) => sum + parseInt(g.jumlah), 0)}
              unitKerjaCount={groupedData.length}
            /> */}

            <div className="overflow-x-auto bg-white rounded-b-lg shadow-xl border border-teal-100">
              <table className="w-full text-left border-collapse md:min-w-[1200px]">
                <thead className="hidden md:table-header-group bg-teal-600 text-white text-sm uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b border-teal-500 text-center w-12">No</th>
                    <th className="p-3 border-b border-teal-500">Cabang</th>
                    <th className="p-3 border-b border-teal-500">Unit Kerja</th>
                    <th className="p-3 border-b border-teal-500">Nama Anggota</th>
                    <th className="p-3 border-b border-teal-500 text-right">PGRI</th>
                    <th className="p-3 border-b border-teal-500 text-right">Sanduka</th>
                    <th className="p-3 border-b border-teal-500 text-right">Daspen</th>
                    <th className="p-3 border-b border-teal-500 text-right">Derap</th>
                    <th className="p-3 border-b border-teal-500 text-right">Kalender</th>
                    <th className="p-3 border-b border-teal-500 text-right">Lain - Lain</th>
                    <th className="p-3 border-b border-teal-500 text-right">Total</th>
                    <th className="p-3 border-b border-teal-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="p-10 text-center text-teal-600 font-medium">
                        Loading data...
                      </td>
                    </tr>
                  ) : (
                    <>
                      {memoizedFlattenedMembers.slice(0, displayLimit).map((member, rowIndex) => (
                        <MemberRow
                          key={`${member.unitKerja}-${member.npaPgri}`}
                          member={member}
                          rowIndex={rowIndex}
                          filesDataMap={filesDataMap}
                          formatTanggal={formatTanggal}
                          handleMemberClick={handleMemberClick}
                          handlePrintClick={handlePrint}
                          handleTagihanClick={handleTagihanClick}
                        />
                      ))}
                      {displayLimit < memoizedFlattenedMembers.length && (
                        <tr ref={loadMoreRef}>
                          <td colSpan={12} className="p-4 text-center text-gray-400 italic">
                            Memuat lebih banyak ({memoizedFlattenedMembers.length - displayLimit} data lagi)...
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <EditFinanceModal
        isPopupVisible={isPopupVisible}
        closePopup={closePopup}
        dataNpa={dataNpa}
        fotoBase64={fotoBase64}
        profileImageUrl={profileImageUrl}
        nomorRekening={nomorRekening}
        setNomorRekening={setNomorRekening}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        groupedIuran={groupedIuran}
        resetKeys={resetKeys}
        setResetKeys={setResetKeys}
        nominalBaruList={nominalBaruList}
        setNominalBaruList={setNominalBaruList}
        sumbanganList={sumbanganList}
        handleDeleteSumbangan={handleDeleteSumbangan}
        addedCategories={addedCategories}
        setAddedCategories={setAddedCategories}
        manualInputs={manualInputs}
        setManualInputs={setManualInputs}
        newValues={newValues}
        setNewValues={setNewValues}
        grandTotal={grandTotal}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        selectedKategori={selectedKategori}
        setSelectedKategori={setSelectedKategori}
        selectedKeterangan={selectedKeterangan}
        setSelectedKeterangan={setSelectedKeterangan}
        keteranganLainLain={keteranganLainLain}
        notifDaspen={notifDaspen}
        handleSave={handleSave}
        handleUpdateClick={handleUpdateClick}
        loadButton={loadButton}
      />

      <MemberDetailModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        selectedMember={selectedMember}
        dataIuran={dataIuran}
        fotoBase64={fotoBase64}
        profileImageUrl={profileImageUrl}
      />

      <BackupConfirmModal
        isVisible={isBackupModalVisible}
        onClose={() => setIsBackupModalVisible(false)}
        onConfirm={confirmBackupTarget}
        isProcessing={isExporting}
      />
    </div>
  );
}

export default RekapAnggota;
