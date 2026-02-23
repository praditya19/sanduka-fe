"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import Link from "next/link";

import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import {
  FaPlusCircle,
  FaMinusCircle,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaCreditCard,
  FaCashRegister,
  FaExchangeAlt,
  FaPlus,
  FaPrint,
  FaSearch,
  FaFileInvoiceDollar,
  FaDatabase,
} from "react-icons/fa";
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

function RekapAnggota() {
  const [data, setData] = useState([]);
  const { token } = useAuth();
  const router = useRouter();
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const namaInputRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [totals, setTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    iuran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [groupedData, setGroupedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchCabang, setSearchCabang] = useState("");
  const [role, setRole] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [saldoAkhir, setSaldoAkhir] = useState("");
  const [pemasukan, setPemasukan] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [saldoAkhirOr, setSaldoAkhirOr] = useState("");
  const [pemasukanOr, setPemasukanOr] = useState("");
  const [pengeluaranOr, setPengeluaranOr] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [nominal, setNominal] = useState("");
  const [dataNpa, setDataNpa] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const profileImageUrl = "/profile.png";
  const [nominalBaruList, setNominalBaruList] = useState([]);
  const [addedCategories, setAddedCategories] = useState([]);
  const [defaultIuran, setDefaultIuran] = useState(null);
  const [newValues, setNewValues] = useState({});
  const [manualInputs, setManualInputs] = useState({});
  const [dataIuran, setDataIuran] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);
  const [idIuran, setIdIuran] = useState(null);
  const [formKetiga, setFormKetiga] = useState({
    iuranAnggota: "",
    iuranSanduka: "",
    iuranDaspen: "",
    iuranDerap: "",
  });
  const [totalIuranWilayah, setTotalIuranWilayah] = useState({
    propinsi: 0,
    kabupaten: 0,
    cabang: 0,
  });
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [daspenValue, setDaspenValue] = useState(null);
  const [nipValue, setNipValue] = useState(null);
  const [namaAnggotaInput, setNamaAnggotaInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [keteranganLainLain, setKeteranganLainLain] = useState([]);
  const [lainLainOptions, setLainLainOptions] = useState([]);
  const [selectedKeterangan, setSelectedKeterangan] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupBackup, setPopupBackup] = useState(false);
  const [popupBackupRekapByNominal, setPopupRekapByNominal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [lastUpdatedMemberNip, setLastUpdatedMemberNip] = useState(null);
  const lastUpdatedMemberRef = useRef(null);
  const [resetKeys, setResetKeys] = useState([]);
  const [progress, setProgress] = useState(0);
  const [notifDaspen, setNotifDaspen] = useState(null);
  const [pesanDaspen, setPesanDaspen] = useState("");
  const [listNoRekening, setListNoRekening] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2025 + 6 },
    (_, i) => 2025 + i
  );

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());

  const filteredMonths = selectedTahun === 2025 ? months.slice(4) : months;

  useEffect(() => {
    // Fetch role from sessionStorage
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
  }, []);

  const fetchSaldoSanduka = async () => {
    try {
      const response = await GlobalApi.getSaldoSanduka();
      setSaldoAkhir(response.saldo_akhir_sanduka);
      setPemasukan(response.total_masuk);
      setPengeluaran(response.total_keluar);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error fetching saldo sanduka:",
        error.message,
        error.config
      );
      setLoading(false);
    }
  };

  // Mengambil data saat komponen pertama kali di-render
  useEffect(() => {
    fetchSaldoSanduka();
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
  }, [unitKerjaList]);

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
    const fetchKeterangan = async () => {
      if (selectedKategori === "lainlain") {
        try {
          const response = await GlobalApi.getKeteranganLainlain();
          setKeteranganLainLain(response);
          setShowPopup(true);
        } catch (err) {
          console.error("Gagal ambil keterangan:", err);
          setKeteranganLainLain([]);
        }
      } else {
        setShowPopup(false);
      }
    };

    fetchKeterangan();
  }, [selectedKategori]);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
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

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
    setSearchCabang(query);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    setSelectedUnitKerja("");
    setUnitKerjaInput("");
    setSearchCabang("");
    setNamaAnggotaInput("");

    try {
      const response = await GlobalApi.getNominalAggregatedData(
        cabang.kecamatan || ""
      );

      const totalRow = response.find(
        (item) => item.cabang === "Total" && !item.unitKerja
      );
      const regularData = response.filter(
        (item) => !(item.cabang === "Total" && !item.unitKerja)
      );

      if (totalRow) {
        setGrandTotals({
          jumlah: parseInt(totalRow.jumlah) || 0,
          pgri: parseFloat(totalRow.pgri) || 0,
          sanduka: parseFloat(totalRow.sanduka) || 0,
          daspen: parseFloat(totalRow.daspen) || 0,
          derap: parseFloat(totalRow.derap) || 0,
          kalnder: parseFloat(totalRow.kalender) || 0,
          daspen: parseFloat(totalRow.daspen) || 0,
          totalIuran: parseFloat(totalRow.totalIuran) || 0,
        });
      }

      setData(regularData);
      setOriginalRekapData(regularData);

      const processed = processData(regularData);
      setGroupedData(processed);

      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase() ===
            (cabang.kecamatan || "").toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  const processData = (rawData) => {
    const uniqueMap = new Map();

    rawData.forEach((item) => {
      const key = `${item.namaAnggota}-${item.npaPgri}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const filteredData = Array.from(uniqueMap.values());

    const grouped = filteredData.reduce((acc, item) => {
      const cabangKey = item.cabang || "Tidak Ada Cabang";

      if (!acc[cabangKey]) {
        acc[cabangKey] = {
          cabang: cabangKey,
          members: [],
          jumlah: 0,
          pgri: 0,
          sanduka: 0,
          daspen: 0,
          derap: 0,
          kalender: 0,
          sumbangan: 0,
          totalIuran: 0,
          nomorRekening: 0,
          lastUpdatedAtIuranAnggota: "",
        };
      }

      acc[cabangKey].members.push({
        namaAnggota: item.namaAnggota,
        npaPgri: item.npaPgri,
        nomorRekening: item.nomorRekening,
        nip: item.nip,
        statusPotongan: item.statusPotongan,
        potongan: item.potongan,
        pgri: parseFloat(item.pgri) || 0,
        sanduka: parseFloat(item.sanduka) || 0,
        daspen: parseFloat(item.daspen) || 0,
        derap: parseFloat(item.derap) || 0,
        kalender: parseFloat(item.kalender) || 0,
        sumbangan: parseFloat(item.sumbangan) || 0,
        totalIuran: parseFloat(item.totalIuran) || 0,
        lastUpdatedAtIuranAnggota: item.lastUpdatedAtIuranAnggota,
      });

      acc[cabangKey].jumlah += 1;
      acc[cabangKey].pgri += parseFloat(item.pgri) || 0;
      acc[cabangKey].sanduka += parseFloat(item.sanduka) || 0;
      acc[cabangKey].daspen += parseFloat(item.daspen) || 0;
      acc[cabangKey].derap += parseFloat(item.derap) || 0;
      acc[cabangKey].kalender += parseFloat(item.kalender) || 0;
      acc[cabangKey].sumbangan += parseFloat(item.sumbangan) || 0;
      acc[cabangKey].totalIuran += parseFloat(item.totalIuran) || 0;

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      const bulan = selectedBulan;
      const tahun = selectedTahun;

      let response;

      if (storedRole === "ADMIN" && storedCabang) {
        setIsAdmin(true);
        setSelectedCabang(storedCabang);
        response = await GlobalApi.getNominalAggregatedData(
          storedCabang,
          null,
          null,
          bulan,
          tahun
        );
      } else {
        response = await GlobalApi.getNominalAggregatedData(
          "",
          null,
          null,
          bulan,
          tahun
        );
      }
      const totalRow = response.find(
        (item) => item.cabang === "Total" && !item.unitKerja
      );
      const regularData = response.filter(
        (item) => !(item.cabang === "Total" && !item.unitKerja)
      );

      if (totalRow) {
        setGrandTotals({
          jumlah: parseInt(totalRow.jumlah) || 0,
          pgri: parseFloat(totalRow.pgri) || 0,
          sanduka: parseFloat(totalRow.sanduka) || 0,
          daspen: parseFloat(totalRow.daspen) || 0,
          derap: parseFloat(totalRow.derap) || 0,
          kalender: parseFloat(totalRow.kalender) || 0,
          lainlain: parseFloat(totalRow.lainlain) || 0,
          totalIuran: parseFloat(totalRow.totalIuran) || 0,
        });
      }

      const processed = processData(regularData);
      setGroupedData(processed);
      setData(regularData);
      setOriginalRekapData(regularData);
      // const allUnits = new Set(
      //   processed.map((group) => group.unitKerja || "Tidak Ada Unit Kerja")
      // );
      // setExpandedRows(allUnits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setLoading(false);
    }
  }, [unitKerjaList, selectedBulan, selectedTahun]);

  useEffect(() => {
    fetchInitialData();
    fetchNoRekening();
  }, [fetchInitialData]);

  const fetchNoRekening = async () => {
    try {
      const data = await GlobalApi.getNoRekening();
      setListNoRekening(data);
    } catch (error) {
      console.error("Gagal ambil daftar nomor rekening:", error);
    }
  };

  useEffect(() => {
    if (lastUpdatedMemberRef.current) {
      lastUpdatedMemberRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [lastUpdatedMemberNip]);

  const handleNamaAnggotaInputChange = (e) => {
    setNamaAnggotaInput(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchQuery(namaAnggotaInput);
    performSearch(namaAnggotaInput);
  };

  const performSearch = (query) => {
    if (query === "") {
      let filteredData = originalRekapData;

      if (selectedCabang) {
        filteredData = filteredData.filter(
          (item) => item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
        );
      }

      if (selectedUnitKerja) {
        filteredData = filteredData.filter(
          (item) =>
            item.unitKerja?.toLowerCase() === selectedUnitKerja.toLowerCase()
        );
      }

      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
      setExpandedRows(new Set());
      // const allUnits = new Set(
      //   processed.map((group) => group.unitKerja || "Tidak Ada Unit Kerja")
      // );
      // setExpandedRows(allUnits);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          (!selectedUnitKerja ||
            item.unitKerja?.toLowerCase() ===
              selectedUnitKerja.toLowerCase()) &&
          item.namaAnggota?.toLowerCase().includes(query.toLowerCase())
      );

      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);

      const unitsWithMatches = new Set(
        filteredData.map((item) => item.unitKerja || "Tidak Ada Unit Kerja")
      );
      setExpandedRows(unitsWithMatches);
    }
  };

  useEffect(() => {
    if (!isPopupVisible && namaInputRef.current) {
      namaInputRef.current.focus();
    }
  }, [isPopupVisible]);

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

  const toggleExpand = (unitKerja) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitKerja)) {
        newSet.delete(unitKerja);
      } else {
        newSet.add(unitKerja);
      }
      return newSet;
    });
  };

  const calculateTotals = (dataArray) => {
    const newTotals = dataArray.reduce(
      (acc, item) => ({
        jumlah: acc.jumlah + (parseInt(item.jumlah) || 0),
        pgri: acc.pgri + (parseFloat(item.pgri) || 0),
        sanduka: acc.sanduka + (parseFloat(item.sanduka) || 0),
        daspen: acc.daspen + (parseFloat(item.daspen) || 0),
        iuran: acc.iuran + (parseFloat(item.totalIuran) || 0),
      }),
      {
        jumlah: 0,
        pgri: 0,
        sanduka: 0,
        daspen: 0,
        iuran: 0,
      }
    );
    setTotals(newTotals);
  };

  const [grandTotals, setGrandTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    derap: 0,
    kalender: 0,
    lainlain: 0,
    totalIuran: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const pgriResponse = await GlobalApi.getDefaultIuranById(2);
      const daspenResponse = await GlobalApi.getDefaultIuranById(4);
      const derapResponse = await GlobalApi.getDefaultIuranById(3);
      const kalenderResponse = await GlobalApi.getDefaultIuranById(1);

      sessionStorage.setItem("PGRIData", JSON.stringify(pgriResponse));
      sessionStorage.setItem("daspenData", JSON.stringify(daspenResponse));
      sessionStorage.setItem("derapData", JSON.stringify(derapResponse));
      sessionStorage.setItem("kalenderData", JSON.stringify(kalenderResponse));

      const response = {
        pgri: pgriResponse,
        daspen: daspenResponse,
        derap: derapResponse,
        kalender: kalenderResponse,
      };

      setDefaultIuran(response);

      const total = {
        propinsi:
          parseInt(kalenderResponse.propinsi || 0) +
          parseInt(derapResponse.propinsi || 0),
        kabupaten:
          parseInt(kalenderResponse.kabupaten || 0) +
          parseInt(derapResponse.kabupaten || 0),
        cabang:
          parseInt(kalenderResponse.cabang || 0) +
          parseInt(derapResponse.cabang || 0),
      };

      setTotalIuranWilayah(total);
      const pgriTotal =
        parseInt(pgriResponse.pb || 0) +
        parseInt(pgriResponse.propinsi || 0) +
        parseInt(pgriResponse.kabupaten || 0) +
        parseInt(pgriResponse.cabang || 0) +
        parseInt(pgriResponse.sanduka || 0);
    };

    const kalenderData = sessionStorage.getItem("kalenderData");
    const derapData = sessionStorage.getItem("derapData");

    if (kalenderData && derapData) {
      const kalender = JSON.parse(kalenderData);
      const derap = JSON.parse(derapData);

      const total = {
        propinsi:
          parseInt(kalender.propinsi || 0) + parseInt(derap.propinsi || 0),
        kabupaten:
          parseInt(kalender.kabupaten || 0) + parseInt(derap.kabupaten || 0),
        cabang: parseInt(kalender.cabang || 0) + parseInt(derap.cabang || 0),
      };

      setTotalIuranWilayah(total);
    } else {
      fetchData();
    }
  }, []);

  const handlePrintClick = async (member) => {
    const daspenFromMember = member.daspen ? parseInt(member.daspen) : 0;
    setDaspenValue(daspenFromMember);
    setIsModalOpen(false);

    try {
      const response = await GlobalApi.cekNpaList([member.npaPgri]);

      setSelectedMember(member);
      setDataNpa(response[0]);

      if (response[0].foto) {
        try {
          const decodedString = atob(response[0].foto);
          setFotoBase64(decodedString);
        } catch (error) {
          console.error("Error decoding Base64:", error);
          setFotoBase64(null);
        }
      }

      try {
        const iuranResponse = await GlobalApi.getIuranAnggota(member.npaPgri);
        setDataIuran(iuranResponse);
      } catch (error) {
        console.error("Gagal mengambil data iuran anggota:", error);

        if (error.response?.status === 500) {
          console.warn(
            "Server error 500: menggunakan nilai default dari sessionStorage"
          );

          const pgriData = JSON.parse(sessionStorage.getItem("PGRIData"));
          const totalIuranPGRI =
            parseInt(pgriData.pb || 0) +
            parseInt(pgriData.propinsi || 0) +
            parseInt(pgriData.kabupaten || 0) +
            parseInt(pgriData.cabang || 0);

          const fallbackData = {
            iuranAnggota: totalIuranPGRI,
            manualIuranAnggota: 0,
            totalIuranAnggota: totalIuranPGRI,
            iuranSanduka: parseInt(pgriData.sanduka || 0),
            manualIuranSanduka: 0,
            totalIuranSanduka: parseInt(pgriData.sanduka || 0),
            iuranDaspen: daspenFromMember,
            manualIuranDaspen: 0,
            totalIuranDaspen: daspenFromMember,
          };

          setDataIuran(fallbackData);
        }
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error saat cek NPA:", error);
      if (error.response?.status === 500) {
        console.warn("Server error 500: data tidak akan ditampilkan.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };
  const closePopup = () => {
    setIsPopupVisible(false);
    setAddedCategories([]);
    setManualInputs([]);
    setResetKeys([]);
    setSelectedKategori([]);
  };
  const handleCloseModal = () => {
    setShowUploadModal(false);
  };

  const [formData, setFormData] = useState({
    file: null,
    namaFile: "",
    tanggalUntuk: "",
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMemberClick = async (member) => {
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

    try {
      const fileResponse = await GlobalApi.getFileByNip(member.nip);
      if (fileResponse?.sumbangan) {
        setDaspenValue(parseInt(fileResponse.sumbangan));
      }
      if (fileResponse?.dataDaspen === true) {
        setNotifDaspen(true);
      } else {
        setNotifDaspen(false);
      }
    } catch (error) {
      console.error("Gagal mengambil file by NIP:", error);
    }

    try {
      const response = await GlobalApi.cekNpaList([member.npaPgri]);
      setSelectedMember(member);
      setDataNpa(response[0]);

      if (response[0].foto) {
        try {
          const decodedString = atob(response[0].foto);
          setFotoBase64(decodedString);
        } catch (error) {
          console.error("Error decoding Base64:", error);
          setFotoBase64(null);
        }
      }

      try {
        const allIuran = await GlobalApi.getIuranAnggotaAll(
          selectedBulan,
          selectedTahun
        );

        const filteredByNpa = allIuran.filter(
          (item) => item.npa === member.npaPgri
        );

        if (filteredByNpa.length > 0) {
          const sortedByDate = filteredByNpa.sort((a, b) => {
            const dateA = new Date(...a.createdAt);
            const dateB = new Date(...b.createdAt);
            return dateB - dateA;
          });

          const latestData = sortedByDate[0];

          setDataIuran(latestData);

          if (latestData?.id) {
            setIdIuran(latestData.id);
          }
          if (latestData?.nomorRekening) {
            setNomorRekening(latestData.nomorRekening);
          }
        } else {
          console.warn("Tidak ditemukan data iuran untuk NPA:", member.npaPgri);
          setDataIuran(null);
          setIdIuran(null);
        }
      } catch (error) {
        console.error("Gagal mengambil data iuran anggota:", error);

        if (error.response?.status === 500) {
          console.warn("Server error 500: menggunakan fallback data");
          const pgriData = JSON.parse(sessionStorage.getItem("PGRIData"));
          const totalIuranPGRI =
            parseInt(pgriData.pb || 0) +
            parseInt(pgriData.propinsi || 0) +
            parseInt(pgriData.kabupaten || 0) +
            parseInt(pgriData.cabang || 0);

          const fallbackData = {
            iuranAnggota: totalIuranPGRI,
            manualIuranAnggota: 0,
            totalIuranAnggota: totalIuranPGRI,
            iuranSanduka: parseInt(pgriData.sanduka || 0),
            manualIuranSanduka: 0,
            totalIuranSanduka: parseInt(pgriData.sanduka || 0),
            iuranDaspen: daspenFromMember,
            manualIuranDaspen: 0,
            totalIuranDaspen: daspenFromMember,
          };

          setDataIuran(fallbackData);
          setIdIuran(null);
        }
      }
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error saat cek NPA:", error);
    }
  };

  const handleTagihanClick = async (member) => {
    const npa = member?.npaPgri?.trim();

    if (!npa) {
      console.error("NPA tidak ditemukan!");
      return;
    }

    try {
      const response = await GlobalApi.cekNpa(npa);

      if (response?.id) {
        sessionStorage.setItem("idTagihan", response.id);
        router.push("/anggota/rekap-anggota/tagihanByAdmin");
      } else {
        console.warn("ID tidak ditemukan dalam respons.");
      }
    } catch (error) {
      console.error("Gagal mendapatkan ID dari NPA:", error);
    }
  };

  const groupIuranData = (dataIuran) => {
    if (!dataIuran) return [];

    const keys = [
      "Anggota",
      "Daspen",
      "Derap",
      "Kalender",
      "Sanduka",
      "Sumbangan",
    ];

    return keys
      .map((key) => {
        const keySuffix = key === "Anggota" ? "Anggota" : key;
        return {
          key,
          iuran: dataIuran[`iuran${keySuffix}`],
          manual: dataIuran[`manualIuran${keySuffix}`],
          total: dataIuran[`totalIuran${keySuffix}`],
        };
      })
      .filter((item) => item.iuran !== undefined);
  };

  useEffect(() => {
    if (dataIuran) {
      const defaultNominalBaru = {};
      const keys = [
        "Anggota",
        "Daspen",
        "Derap",
        "Kalender",
        "Sanduka",
        "Sumbangan",
      ];

      keys.forEach((key) => {
        const suffix = key === "Anggota" ? "Anggota" : key;
        const manualValue = dataIuran[`manualIuran${suffix}`] || 0;
        defaultNominalBaru[key] = manualValue;
      });

      setNominalBaruList(defaultNominalBaru);
    }
  }, [dataIuran]);

  const groupedIuran = dataIuran ? groupIuranData(dataIuran) : [];

  const handleSave = async () => {
    if (selectedKategori) {
      if (!addedCategories.find((cat) => cat.key === selectedKategori)) {
        const labelMap = {
          iuran: "Iuran",
          derap: "Derap",
          kalender: "Kalender",
          lainLain: "Lain-Lain",
          daspen: "Daspen",
        };

        let initialValue = 0;

        if (selectedKategori === "kalender") {
          const kalenderRaw = sessionStorage.getItem("kalenderData");
          if (kalenderRaw) {
            try {
              const kalenderObj = JSON.parse(kalenderRaw);
              const propinsi = parseInt(kalenderObj.propinsi || 0);
              const kabupaten = parseInt(kalenderObj.kabupaten || 0);
              const cabang = parseInt(kalenderObj.cabang || 0);
              initialValue = propinsi + kabupaten + cabang;
            } catch (e) {
              console.error("Error parsing kalenderData:", e);
            }
          }
        }

        if (selectedKategori === "derap") {
          const derapRaw = sessionStorage.getItem("derapData");
          if (derapRaw) {
            try {
              const derapObj = JSON.parse(derapRaw);
              const propinsi = parseInt(derapObj.propinsi || 0);
              const kabupaten = parseInt(derapObj.kabupaten || 0);
              const cabang = parseInt(derapObj.cabang || 0);
              initialValue = propinsi + kabupaten + cabang;
            } catch (e) {
              console.error("Error parsing derapData:", e);
            }
          }
        }

        if (selectedKategori === "lainlain" && selectedKeterangan) {
          try {
            const response = await GlobalApi.getLainlain(selectedKeterangan);

            const matchingItem = response.find(
              (item) =>
                item.keterangan.toLowerCase() ===
                selectedKeterangan.toLowerCase()
            );

            if (matchingItem) {
              const jumlah = parseInt(matchingItem.jumlahNominal || 0);
              initialValue = jumlah;
            } else {
              console.warn(
                "Tidak ditemukan data dengan keterangan:",
                selectedKeterangan
              );
            }
          } catch (error) {
            console.error("Gagal mengambil data lain-lain:", error);
          }
        }

        if (selectedKategori === "daspen") {
          initialValue = parseInt(daspenValue || 0);
        }

        setAddedCategories((prev) => [
          ...prev,
          {
            label: labelMap[selectedKategori],
            key: selectedKategori,
            ...(selectedKategori === "lain-lain" && selectedKeterangan
              ? { keterangan: selectedKeterangan }
              : {}),
          },
        ]);

        setNewValues((prev) => ({
          ...prev,
          [selectedKategori]: initialValue,
        }));

        setFormKetiga((prev) => ({
          ...prev,
          [selectedKategori]: initialValue,
        }));
      }

      setSelectedKategori("");
      setShowDropdown(false);
    }
  };

  const handleSaveClick = async () => {
    if (!dataNpa) return;

    const tempatTanggalLahir = `${dataNpa.tempatLahir}, ${dataNpa.tanggalLahir?.[2]}-${dataNpa.tanggalLahir?.[1]}-${dataNpa.tanggalLahir?.[0]}`;

    let otomatisValueSanduka = 0;
    let otomatisValuePgri = 0;
    let otomatisValueDaspen = 0;

    let manualValueSanduka = 0;
    let manualValuepgri = 0;
    let manualValueDaspen = 0;

    let iuranSanduka = 0;
    let iuranDaspen = 0;
    let iuranAnggota = formKetiga?.iuranAnggota || 0;

    groupedIuran.forEach((item) => {
      const autoValue = parseInt(item.iuran || 0);
      const inputValue = nominalBaruList[item.key] ?? 0;

      if (item.key?.toLowerCase() === "sanduka") {
        otomatisValueSanduka = autoValue;
        manualValueSanduka = inputValue;
        iuranSanduka = autoValue + inputValue;
      }
      if ((item.key || "").toLowerCase() === "anggota") {
        otomatisValuePgri = autoValue;
        manualValuepgri = inputValue;
        iuranAnggota = autoValue + inputValue;
      }
      if ((item.key || "").toLowerCase() === "daspen") {
        otomatisValueDaspen = autoValue;
        manualValueDaspen = inputValue;
        iuranDaspen = autoValue + inputValue;
      }
    });
    let otomatisValueKalender = 0;
    let otomatisValueDerap = 0;
    let otomatisValueLainLain = 0;

    let manualValueKalender = 0;
    let manualValueDerap = 0;
    let manualValueLainLain = 0;

    let totalKalender = 0;
    let iuranDerap = formKetiga?.iuranDerap || 0;
    let totalIuranLainLain = 0;

    const kategoriUtama = ["derap", "kalender"];

    addedCategories.forEach((item) => {
      const keyLower = item.key?.toLowerCase();
      const oldValue = parseInt(newValues[item.key] || 0);
      const inputValue = parseInt(manualInputs[item.key] || 0);
      const totalValue = oldValue + inputValue;

      if (keyLower === "kalender") {
        otomatisValueKalender = oldValue;
        manualValueKalender = inputValue;
        totalKalender = totalValue;
      } else if (keyLower === "derap") {
        otomatisValueDerap = oldValue;
        manualValueDerap = inputValue;
        iuranDerap = totalValue;
      } else {
        otomatisValueLainLain += oldValue;
        manualValueLainLain += inputValue;
        totalIuranLainLain += totalValue;
      }
    });

    const payload = {
      namaAnggota: dataNpa.namaLengkap,
      tempatTanggalLahir: tempatTanggalLahir,
      npa: dataNpa.npaPgri,
      nip: dataNpa.nip || "-",
      nik: dataNpa.nik,
      cabang: dataNpa.cabang,
      unitKerja: dataNpa.unitKerja,
      jabatan: dataNpa.jabatan,
      nomorRekening: nomorRekening,

      iuranAnggota: otomatisValuePgri || 0,
      manualIuranAnggota: manualValuepgri || 0,
      totalIuranAnggota: iuranAnggota || 0,

      iuranSanduka: otomatisValueSanduka || 0,
      manualIuranSanduka: manualValueSanduka || 0,
      totalIuranSanduka: iuranSanduka || 0,

      iuranDaspen: otomatisValueDaspen || 0,
      manualIuranDaspen: manualValueDaspen || 0,
      totalIuranDaspen: iuranDaspen || 0,

      iuranDerap: otomatisValueDerap || 0,
      manualIuranDerap: manualValueDerap || 0,
      totalIuranDerap: iuranDerap || 0,

      iuranKalender: otomatisValueKalender || 0,
      manualIuranKalender: manualValueKalender || 0,
      totalIuranKalender: totalKalender || 0,

      iuranSumbangan: otomatisValueLainLain || 0,
      manualIuranSumbangan: manualValueLainLain || 0,
      totalIuranSumbangan: totalIuranLainLain || 0,

      keuangan: [],
    };

    groupedIuran.forEach((item) => {
      const nominalBaru = parseInt(nominalBaruList[item.key] || 0);
      const nominalLama = parseInt(selectedMember?.[item.key] || 0);

      if (nominalBaru > 0) {
        payload.keuangan.push({
          kategori: item.key,
          nominalLama,
          nominalBaru,
          total: nominalLama + nominalBaru,
        });
      }
    });

    addedCategories.forEach((item) => {
      const nominalBaru = manualInputs[item.key] || 0;
      const nominalLama = newValues[item.key] || 0;

      if (nominalBaru > 0) {
        payload.keuangan.push({
          kategori: item.label,
          nominalLama,
          nominalBaru,
          total: nominalLama + nominalBaru,
        });
      }
    });

    try {
      if (nomorRekening && nomorRekening.trim() !== "") {
        const rekeningBaru = nomorRekening.trim();
        const rekeningLama = selectedMember?.nomorRekening?.trim();

        const rekeningSudahTerdaftar = listNoRekening.includes(rekeningBaru);

        const samaDenganYangLama = rekeningBaru === rekeningLama;

        if (rekeningSudahTerdaftar && !samaDenganYangLama) {
          setNotification({
            type: "error",
            message: "Nomor rekening sudah digunakan oleh anggota lain.",
          });
          return;
        }
      }
      const response = await GlobalApi.postIuranAnggota(payload);
      await fetchInitialData();
      setNotification({
        type: "success",
        message: "Data berhasil disimpan!",
      });

      setIsPopupVisible(false);
      setAddedCategories([]);
      setManualInputs([]);
      setSelectedKategori("");
      setLastUpdatedMemberNip(dataNpa.nip);
    } catch (error) {
      console.error("Gagal simpan:", error);

      setNotification({
        type: "error",
        message: "Gagal menyimpan data. Silakan coba lagi.",
      });
    }
  };

  const handleUpdateClick = async () => {
    if (!dataNpa || !idIuran) return;

    try {
      const rekeningSudahTerdaftar =
        listNoRekening.includes(nomorRekening.trim()) &&
        nomorRekening.trim() !== (dataIuran?.nomorRekening?.trim() || "");

      if (rekeningSudahTerdaftar) {
        setNotification({
          type: "error",
          message: "Nomor rekening sudah digunakan oleh anggota lain.",
        });
        return;
      }

      const payload = {
        namaAnggota: dataNpa.namaLengkap,
        tempatTanggalLahir: `${dataNpa.tempatLahir}, ${dataNpa.tanggalLahir?.[2]}-${dataNpa.tanggalLahir?.[1]}-${dataNpa.tanggalLahir?.[0]}`,
        npa: dataNpa.npaPgri,
        nip: dataNpa.nip,
        nik: dataNpa.nik,
        cabang: dataNpa.cabang,
        unitKerja: dataNpa.unitKerja,
        jabatan: dataNpa.jabatan,
        nomorRekening: nomorRekening || "",
      };

      const capitalizeFirstLetter = (string) =>
        string.charAt(0).toUpperCase() + string.slice(1);

      groupedIuran.forEach((item) => {
        const key = item.key;
        const isReset = resetKeys.includes(key);
        const iuran = isReset ? 0 : parseInt(item.iuran || 0);
        const manual = isReset ? 0 : parseInt(nominalBaruList[key] || 0);
        const total = iuran + manual;

        payload[`iuran${capitalizeFirstLetter(key)}`] = iuran || 0;
        payload[`manualIuran${capitalizeFirstLetter(key)}`] = manual || 0;
        payload[`totalIuran${capitalizeFirstLetter(key)}`] = total || 0;
      });

      addedCategories.forEach((item) => {
        const key = item.key.toLowerCase();
        const oldVal = parseInt(newValues?.[key] || 0);
        const manual = parseInt(manualInputs?.[key] || 0);
        const total = oldVal + manual;

        payload[`iuran${capitalizeFirstLetter(key)}`] = oldVal;
        payload[`manualIuran${capitalizeFirstLetter(key)}`] = manual;
        payload[`totalIuran${capitalizeFirstLetter(key)}`] = total;
      });

      await GlobalApi.putIuranAnggota(idIuran, payload);
      await fetchInitialData();

      setNotification({
        type: "success",
        message: "Data berhasil diupdate!",
      });
      setIsPopupVisible(false);
      setResetKeys([]);
      setAddedCategories([]);
      setManualInputs([]);
      setSelectedKategori("");
      setLastUpdatedMemberNip(dataNpa.nip);
    } catch (error) {
      console.error("Gagal update data:", error);
      setNotification({
        type: "error",
        message: "Gagal update data.",
      });
    }
  };

  const calculateGrandTotal = () => {
    let total = 0;

    groupedIuran.forEach((item) => {
      const oldValue = parseInt(item.iuran || 0);
      const inputValue = nominalBaruList[item.key] || 0;
      total += oldValue + inputValue;
    });

    addedCategories.forEach((item) => {
      const oldValue = newValues[item.key] ?? 0;
      const inputValue = manualInputs[item.key] ?? 0;
      total += oldValue + inputValue;
    });

    return total;
  };

  useEffect(() => {
    setGrandTotal(calculateGrandTotal());
  }, [nominalBaruList, manualInputs, addedCategories, groupedIuran]);

  const handleReset = async () => {
    if (!idIuran) {
      console.warn("ID iuran tidak ditemukan.");
      return;
    }

    try {
      await GlobalApi.deleteIuranAnggota(idIuran);
      await fetchInitialData();

      setNotification({
        type: "success",
        message: "Data berhasil direset!",
      });

      setNominalBaruList(Array(groupedIuran.length).fill(""));
      setManualInputs({});
      setAddedCategories([]);
      setSelectedKategori("");
      setShowDropdown(false);
      setDataIuran(null);
      setIdIuran(null);
      setIsPopupVisible(false);
      setLastUpdatedMemberNip(dataNpa.nip);
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal mereset data. Silakan coba lagi.",
      });
      console.error("Gagal menghapus data iuran:", error);
    }
  };

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

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handlePrint = async () => {
    try {
      if (!groupedData || groupedData.length === 0) {
        console.error("Data kosong, tidak dapat mencetak.");
        return;
      }

      const bulan = selectedBulan || new Date().getMonth() + 1;
      const tahun = selectedTahun || new Date().getFullYear();

      let anggotaAll = [];
      try {
        const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

        const latestPerNpa = Object.values(
          allData.reduce((acc, item) => {
            if (!acc[item.npa]) {
              acc[item.npa] = item;
            } else {
              const existingDate = new Date(...acc[item.npa].createdAt);
              const currentDate = new Date(...item.createdAt);
              if (currentDate > existingDate) {
                acc[item.npa] = item;
              }
            }
            return acc;
          }, {})
        );

        anggotaAll = latestPerNpa;
      } catch (err) {
        console.error("Gagal ambil data anggota untuk nomor rekening:", err);
      }

      const npaToRekeningMap = {};
      anggotaAll.forEach((item) => {
        npaToRekeningMap[item.npa] = item.nomorRekening;
      });

      const titleText = `Rekap By Nominal${
        selectedCabang ? ` Cabang ${selectedCabang}` : ""
      }${selectedUnitKerja ? ` Unit Kerja ${selectedUnitKerja}` : ""}`;

      const htmlContent = `
      <html>
        <head>
          <title>Rekap By Nominal</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #00796b; color: white; }
            .total-row { font-weight: bold; background-color: #f5f5f5; }
            .member-list { text-align: left; padding-left: 20px; }
            @media print {
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              th { color: #00796b; }
              tfoot { display: table-footer-group; }
            }
            @page { margin: 15mm; }
          </style>
        </head>
        <body>
          <div class="title">${titleText}</div>
          <table>
            <thead>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Cabang</th>
                <th rowspan="2">Unit Kerja</th>
                <th rowspan="2">Nama Anggota</th>
                <th rowspan="2">Jumlah Anggota</th>
                <th colspan="6">Jumlah</th>
                <th rowspan="2">Total</th>
              </tr>
              <tr>
                <th>PGRI</th>
                <th>Sanduka</th>
                <th>Daspen</th>
                <th>Derap</th>
                <th>Kalender</th>
                <th>Lain-Lain</th>
              </tr>
            </thead>
            <tbody>
              ${groupedData
                ?.map((group, index) => {
                  const members = group.members || [];
                  return members
                    ?.map((member, memberIndex) => {
                      const nomorRekeningFinal =
                        npaToRekeningMap[member.npaPgri] ||
                        member.nomorRekening ||
                        "-";
                      return `
                          <tr>
                            ${
                              memberIndex === 0
                                ? `
                              <td rowspan="${members.length}">${index + 1}</td>
                              <td rowspan="${members.length}">${
                                    group.cabang
                                  }</td>
                              <td rowspan="${members.length}">${
                                    group.unitKerja
                                  }</td>
                            `
                                : ""
                            }
                            <td class="member-list">
                              <div>${member.namaAnggota}</div>
                              <div>${member.nip || "-"}</div>
                              <div>${nomorRekeningFinal}</div>
                            </td>
                            ${
                              memberIndex === 0
                                ? `<td rowspan="${members.length}">${
                                    group.jumlah || 0
                                  }</td>`
                                : ""
                            }
                            <td>Rp. ${parseInt(member.pgri || 0).toLocaleString(
                              "id-ID"
                            )}</td>
                            <td>Rp. ${parseInt(
                              member.sanduka || 0
                            ).toLocaleString("id-ID")}</td>
                            <td>Rp. ${parseInt(
                              member.daspen || 0
                            ).toLocaleString("id-ID")}</td>
                            <td>Rp. ${parseInt(
                              member.derap || 0
                            ).toLocaleString("id-ID")}</td>
                            <td>Rp. ${parseInt(
                              member.kalender || 0
                            ).toLocaleString("id-ID")}</td>
                            <td>Rp. ${parseInt(
                              member.sumbangan || 0
                            ).toLocaleString("id-ID")}</td>
                            <td>Rp. ${parseInt(
                              member.totalIuran || 0
                            ).toLocaleString("id-ID")}</td>
                          </tr>
                        `;
                    })
                    .join("");
                })
                .join("")}
              <tr class="total-row">
                <td colspan="4" style="text-align: center">Total Keseluruhan :</td>
                <td>
                  ${groupedData.reduce(
                    (sum, group) => sum + parseInt(group.jumlah || 0),
                    0
                  )}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.pgri || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.sanduka || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.daspen || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.derap || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.kalender || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.lainlain || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td>
                  Rp. ${groupedData
                    .flatMap((g) => g.members || [])
                    .reduce((sum, m) => sum + parseInt(m.totalIuran || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.srcdoc = htmlContent;
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        printFrame.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    } catch (error) {
      console.error("Error during print process:", error);
    }
  };

  const exportToExcel = async () => {
    if (!groupedData || groupedData.length === 0) {
      console.error("Data kosong, tidak dapat export ke Excel");
      return;
    }

    const bulan = selectedBulan || new Date().getMonth() + 1;
    const tahun = selectedTahun || new Date().getFullYear();

    let anggotaAll = [];
    try {
      const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

      const latestPerNpa = Object.values(
        allData.reduce((acc, item) => {
          if (!acc[item.npa]) {
            acc[item.npa] = item;
          } else {
            const existingDate = new Date(...acc[item.npa].createdAt);
            const currentDate = new Date(...item.createdAt);
            if (currentDate > existingDate) {
              acc[item.npa] = item;
            }
          }
          return acc;
        }, {})
      );

      anggotaAll = latestPerNpa;
    } catch (err) {
      console.error("Gagal ambil data anggota untuk nomor rekening:", err);
    }

    const npaToRekeningMap = {};
    anggotaAll.forEach((item) => {
      npaToRekeningMap[item.npa] = item.nomorRekening;
    });

    const bulanSekarang = new Date();
    const bulanBerikutnya = new Date(
      bulanSekarang.getFullYear(),
      bulanSekarang.getMonth() + 1
    );
    const namaBulan = bulanBerikutnya.toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

    const excelData = [];

    excelData.push([`Tagihan Untuk Bulan ${namaBulan}`]);
    excelData.push([]);

    excelData.push([
      "No",
      "Cabang",
      "Unit Kerja",
      "Nama Anggota",
      "NIP",
      "Nomor Rekening",
      "PGRI",
      "Sanduka",
      "Daspen",
      "Derap",
      "Kalender",
      "Lain-Lain",
      "Total",
    ]);

    groupedData.forEach((group, index) => {
      if (group.members && group.members.length > 0) {
        group.members.forEach((member, memberIndex) => {
          const nomorRekeningFinal =
            npaToRekeningMap[member.npaPgri] || member.nomorRekening || "-";
          const total = parseInt(member.totalIuran || 0);
          const potongan = parseInt(member.potongan || 0);
          const selisih = total - potongan;
          const tanda = selisih > 0 ? "-" : selisih < 0 ? "+" : "";
          const nilaiSelisih =
            potongan !== 0 ? `${tanda}${Math.abs(selisih)}` : "";

          excelData.push([
            memberIndex === 0 ? index + 1 : "",
            memberIndex === 0 ? group.cabang : "",
            memberIndex === 0 ? group.unitKerja : "",
            member.namaAnggota,
            member.nip || "-",
            nomorRekeningFinal,
            parseInt(member.pgri || 0),
            parseInt(member.sanduka || 0),
            parseInt(member.daspen || 0),
            parseInt(member.derap || 0),
            parseInt(member.kalender || 0),
            parseInt(member.sumbangan || 0),
            total,
          ]);
        });
      }
    });

    const totalPgri = groupedData.reduce(
      (sum, g) => sum + parseInt(g.pgri || 0),
      0
    );
    const totalSanduka = groupedData.reduce(
      (sum, g) => sum + parseInt(g.sanduka || 0),
      0
    );
    const totalDaspen = groupedData.reduce(
      (sum, g) => sum + parseInt(g.daspen || 0),
      0
    );
    const totalDerap = groupedData.reduce(
      (sum, g) => sum + parseInt(g.derap || 0),
      0
    );
    const totalKalender = groupedData.reduce(
      (sum, g) => sum + parseInt(g.kalender || 0),
      0
    );
    const totalLainlain = groupedData.reduce(
      (sum, g) => sum + parseInt(g.lainlain || 0),
      0
    );
    const totalIuran = groupedData.reduce(
      (sum, g) => sum + parseInt(g.totalIuran || 0),
      0
    );

    excelData.push([
      "",
      "",
      "",
      "Total Keseluruhan:",
      "",
      "",
      totalPgri,
      totalSanduka,
      totalDaspen,
      totalDerap,
      totalKalender,
      totalLainlain,
      totalIuran,
      "",
      "",
      "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RekapData");

    const waktuDownload = new Date().toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "medium",
    });

    const safeWaktuDownload = waktuDownload
      .replace(/[/:]/g, "-")
      .replace(/[ ]/g, "_");

    const fileName = `Backupbynominal_${namaBulan}_${safeWaktuDownload}${
      selectedCabang ? `_Cabang_${selectedCabang}` : ""
    }${selectedUnitKerja ? `_Unit_Kerja_${selectedUnitKerja}` : ""}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleBackupData = async () => {
    if (!selectedDate) {
      alert("Silakan pilih bulan tagihan terlebih dahulu.");
      return;
    }

    try {
      const result = await GlobalApi.postToBackup(selectedDate);

      setNotification({
        type: "success",
        message: "Backup berhasil!",
      });
      setPopupBackup(false);
      exportToExcel();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal backup dan export.",
      });
      console.error("Gagal backup dan export:", error);
    }
  };

  const handleBackupByNominal = async () => {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    try {
      const response = await GlobalApi.postToBackupByNominal(tahun, bulan);
      const fullMessage = response || "";
      const shortMessage = fullMessage.split("Detail kegagalan:")[0].trim();
      const formattedMessage = shortMessage.replace(/\\n/g, "\n");

      setNotification({
        type: "success",
        message: formattedMessage,
      });
      setPopupRekapByNominal(false);
      await fetchInitialData();
    } catch (error) {
      let errorMessage =
        error?.response?.data ||
        error?.response?.data?.message ||
        error?.message ||
        "Gagal backup bulan sebelumnya.";

      if (typeof errorMessage === "object") {
        errorMessage = JSON.stringify(errorMessage);
      }
      errorMessage = errorMessage.split("Detail kegagalan:")[0].trim();
      errorMessage = errorMessage.replace(/\\n/g, "\n");

      setNotification({
        type: "error",
        message: errorMessage,
      });
    }
    setPopupRekapByNominal(false);
  };

  const handleRekapClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExport = (type) => {
    if (type === "bank") {
      NorekExcel();
    } else if (type === "mandiri") {
      MandiriExcel();
    }
    setOpen(false);
  };

  const NorekExcel = async () => {
    if (!groupedData || groupedData.length === 0) {
      console.error("Data kosong, tidak dapat export ke Excel");
      return;
    }

    const bulan = selectedBulan || new Date().getMonth() + 1;
    const tahun = selectedTahun || new Date().getFullYear();

    let anggotaAll = [];
    try {
      const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

      const latestPerNpa = Object.values(
        allData.reduce((acc, item) => {
          if (!acc[item.npa]) {
            acc[item.npa] = item;
          } else {
            const existingDate = new Date(...acc[item.npa].createdAt);
            const currentDate = new Date(...item.createdAt);
            if (currentDate > existingDate) {
              acc[item.npa] = item;
            }
          }
          return acc;
        }, {})
      );

      anggotaAll = latestPerNpa;
    } catch (err) {
      console.error("Gagal ambil data anggota untuk nomor rekening:", err);
    }

    const npaToRekeningMap = {};
    anggotaAll.forEach((item) => {
      npaToRekeningMap[item.npa] = item.nomorRekening;
    });

    const excelData = [];
    const today = new Date();
    const bulanNama = today.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    const tanggalDownload = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const semuaCabangUnik = [...new Set(groupedData.map((g) => g.cabang))];
    const namaCabang =
      semuaCabangUnik.length > 1 ? "Semua Cabang" : semuaCabangUnik[0];

    excelData.push(["Rekap Laporan Potongan Bank"]);
    excelData.push([`Cabang: ${namaCabang}`]);
    excelData.push([`Bulan: ${bulanNama}`]);
    excelData.push([`Tanggal Download: ${tanggalDownload}`]);
    excelData.push([]);
    excelData.push(["Pgri Kabupaten Jepara"]);
    excelData.push(["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"]);
    excelData.push([]);
    excelData.push([
      "No",
      "Cabang",
      "Nama",
      "No Rekening",
      "Total Tagihan",
      "Keterangan",
    ]);

    let rowNumber = 1;
    let hasValidData = false;
    let totalTagihanSemua = 0;

    groupedData.forEach((group) => {
      if (group.members && group.members.length > 0) {
        group.members.forEach((member) => {
          const nomorRekeningFinal =
            npaToRekeningMap[member.npaPgri] || member.nomorRekening || "";
          if (nomorRekeningFinal && nomorRekeningFinal.trim() !== "") {
            const tagihan = parseInt(member.totalIuran || 0);
            totalTagihanSemua += tagihan;
            hasValidData = true;
            excelData.push([
              rowNumber++,
              group.cabang,
              member.namaAnggota,
              nomorRekeningFinal,
              tagihan,
              "",
            ]);
          }
        });
      }
    });

    if (!hasValidData) {
      console.warn("Tidak ada data dengan nomor rekening, file tidak dibuat.");
      return;
    }

    excelData.push([]);
    excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
    excelData.push([]);
    excelData.push(["", "", "", "", tanggalDownload]);
    excelData.push(["", "", "", "", "TTD"]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Rekening");

    XLSX.writeFile(wb, "Rekap_Laporan_Potongan_Bank.xlsx");
  };

  const MandiriExcel = () => {
    if (!groupedData || groupedData.length === 0) {
      console.error("Data kosong, tidak dapat export ke Excel");
      return;
    }

    const semuaCabangUnik = [...new Set(groupedData.map((g) => g.cabang))];
    const namaCabang =
      semuaCabangUnik.length > 1 ? "Semua Cabang" : semuaCabangUnik[0];

    const bulanNama = new Date().toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });
    const tanggalDownload = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const excelData = [];

    excelData.push(["Rekap Data Anggota Tanpa No Rekening"]);
    excelData.push([`Cabang: ${namaCabang}`]);
    excelData.push([`Bulan: ${bulanNama}`]);
    excelData.push([`Tanggal Download: ${tanggalDownload}`]);
    excelData.push([]);
    excelData.push(["Pgri Kabupaten Jepara"]);
    excelData.push(["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"]);
    excelData.push([]);
    excelData.push([
      "No",
      "Cabang",
      "Nama",
      "No Rekening",
      "Total Tagihan",
      "Keterangan",
    ]);

    let rowNumber = 1;
    let hasMissingData = false;
    let totalTagihanSemua = 0;

    groupedData.forEach((group) => {
      if (group.members && group.members.length > 0) {
        group.members.forEach((member) => {
          if (!member.nomorRekening || member.nomorRekening.trim() === "") {
            const tagihan = parseInt(member.totalIuran || 0);
            totalTagihanSemua += tagihan;
            hasMissingData = true;
            excelData.push([
              rowNumber++,
              group.cabang,
              member.namaAnggota,
              "",
              tagihan,
              "",
            ]);
          }
        });
      }
    });

    if (!hasMissingData) {
      console.warn("Semua data memiliki nomor rekening, file tidak dibuat.");
      return;
    }

    excelData.push([]);
    excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
    excelData.push([]);
    excelData.push(["", "", "", "", tanggalDownload]);
    excelData.push(["", "", "", "", "TTD"]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Tanpa No Rekening");

    XLSX.writeFile(wb, "Rekap_Laporan_Mandiri.xlsx");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  const getNextPotonganBulan = () => {
    const today = new Date();
    const tanggal = today.getDate();
    let bulan = today.getMonth();
    let tahun = today.getFullYear();

    if (tanggal >= 22) {
      bulan += 1;
      if (bulan > 11) {
        bulan = 0;
        tahun += 1;
      }
    }

    const namaBulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${namaBulan[bulan]} ${tahun}`;
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
          <div className="w-full min-h-screen bg-gray-50 mt-7 -mb-[22%]">
            {!isMobile && (
              <div className="w-full">
                {/* Navbar */}
                {role === "SUPERADMIN" && (
                  <nav className="bg-white shadow px-4 py-3">
                    <ul className="flex flex-wrap gap-4 md:gap-8">
                      <li>
                        <Link
                          href="/keuangan/data-utama"
                          className="text-gray-700 hover:text-teal-600"
                        >
                          Data Utama
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/keuangan/sanduka"
                          className="text-gray-700 hover:text-teal-600"
                        >
                          Sanduka
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/keuangan/organisasi"
                          className="text-gray-700 hover:text-teal-600"
                        >
                          Organisasi
                        </Link>
                      </li>
                    </ul>
                  </nav>
                )}

                {/* Main Content */}
                <main className="w-full bg-white shadow-lg rounded-none md:rounded-lg mt-4 p-6">
                  {role === "SUPERADMIN" && (
                    <>
                      {/* Header */}
                      <div className="text-center mb-8">
                        <h4 className="text-xl md:text-2xl font-extrabold">
                          SALDO
                        </h4>
                        <p className="text-md text-gray-600">{currentDate}</p>
                      </div>

                      {/* Grid 2 kolom full */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 1 */}
                        <div className="flex flex-col items-center">
                          <Image
                            src="/sanduka.png"
                            width={100}
                            height={100}
                            className="w-24 sm:w-28"
                            alt="Sanduka"
                          />
                          {loading ? (
                            <p className="text-sm font-semibold text-gray-800 text-center w-full">
                              Loading...
                            </p>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-gray-800 text-center w-full mt-2">
                                Rp. {saldoAkhir}
                              </p>
                              <div className="mt-3 bg-gray-50 p-4 rounded-lg w-full">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="text-center">
                                    <h6 className="font-bold text-green-700">
                                      PEMASUKAN
                                    </h6>
                                    <p className="text-sm font-semibold text-gray-800">
                                      Rp. {pemasukan}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <h6 className="font-bold text-red-700">
                                      PENGELUARAN
                                    </h6>
                                    <p className="text-sm font-semibold text-gray-800">
                                      Rp. {pengeluaran}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Section 2 */}
                        <div className="flex flex-col items-center">
                          <Image
                            src="/logo.png"
                            width={100}
                            height={100}
                            className="w-20 sm:w-24"
                            alt="Organisasi"
                          />
                          <p className="text-sm font-semibold text-gray-800 mt-2 text-center w-full">
                            Rp. {saldoAkhirOr}
                          </p>
                          <div className="bg-gray-50 p-4 rounded-lg w-full mt-3">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="text-center">
                                <h6 className="font-bold text-green-700">
                                  PEMASUKAN
                                </h6>
                                <p className="text-sm font-semibold text-gray-800">
                                  Rp. {pemasukanOr}
                                </p>
                              </div>
                              <div className="text-center">
                                <h6 className="font-bold text-red-700">
                                  PENGELUARAN
                                </h6>
                                <p className="text-sm font-semibold text-gray-800">
                                  Rp. {pengeluaranOr}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </main>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg mx-4 md:mx-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 w-full">
              {/* Filter Section */}
              <div className="flex flex-wrap gap-4">
                {/* Cabang */}
                <div className="flex flex-col relative w-64" ref={cabangRef}>
                  <p>Cabang</p>
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={!isAdmin ? handleCabangClick : undefined}
                    className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                      isAdmin ? "bg-gray-100" : ""
                    }`}
                    placeholder="Pilih Cabang"
                    disabled={isAdmin}
                  />
                  {!isAdmin && showCabangDropdown && (
                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <Input
                            type="text"
                            value={searchCabang}
                            onChange={(e) => handleCabangSearch(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                            placeholder="Cari Cabang..."
                            autoFocus
                          />
                        </li>
                        <li
                          onClick={() => handleSelectCabang({ kecamatan: "" })}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          Pilih Cabang
                        </li>
                        {filteredCabangList.map((cabang) => (
                          <li
                            key={cabang.id}
                            onClick={() => handleSelectCabang(cabang)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            {cabang.kecamatan}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bulan */}
                <div className="flex flex-col relative w-64">
                  <p>Bulan</p>
                  <select
                    value={selectedBulan}
                    onChange={(e) => setSelectedBulan(Number(e.target.value))}
                    className="p-2 rounded bg-white text-black border"
                  >
                    <option value="">-- Pilih Bulan --</option>
                    {filteredMonths.map((month, index) => {
                      const monthValue =
                        selectedTahun === 2025 ? index + 5 : index + 1;
                      return (
                        <option key={monthValue} value={monthValue}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Tahun */}
                <div className="flex flex-col relative w-64">
                  <p>Tahun</p>
                  <select
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(Number(e.target.value))}
                    className="p-2 rounded bg-white text-black border"
                  >
                    <option value="">-- Pilih Tahun --</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <table className="w-full table-auto bg-white mt-3">
              <thead>
                <tr>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tl-lg">
                    No
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600">
                    Cabang
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 lg:table-cell text-center">
                    Kurang Setor
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 w-36">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...groupedData]
                  .sort((a, b) => a.cabang.localeCompare(b.cabang))
                  .map((group, index) => {
                    return (
                      <tr
                        key={group.cabang}
                        className={index % 2 === 0 ? "bg-white" : "bg-teal-50"}
                      >
                        {/* Nomor */}
                        <td className="p-3 border-b align-top">
                          <div className="flex w-8 h-8 items-start justify-center rounded-full bg-teal-100 text-teal-700 font-semibold">
                            {index + 1}
                          </div>
                        </td>

                        {/* Cabang */}
                        <td className="p-3 border-b align-top text-center">
                          {group.cabang}
                        </td>

                        {/* Pembayaran */}
                        <td className="p-3 border-b text-center">
                          <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-sm">
                            Rp.{" "}
                            {parseInt(group.totalIuran).toLocaleString("id-ID")}
                          </span>
                        </td>

                        {/* Keterangan */}
                        <td className="p-3 border-b text-center align-top">
                          <Link
                            href="/keuangan/home/detail"
                            className="text-blue-500"
                          >
                            <Button>Detail</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;
