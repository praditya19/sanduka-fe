"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
  const tableRef = useRef();
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

  const handlePrint = () => {
    // Ambil elemen tabel
    const tableElement = document.getElementById("printableTable");

    // Buka window baru
    const newWindow = window.open("", "_blank", "width=800,height=600");

    // Masukkan HTML tabel + styling
    newWindow.document.write(`
    <html>
      <head>
        <title>Transaksional</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #009688; color: white; }
        </style>
      </head>
      <body>
        ${tableElement.outerHTML}
      </body>
    </html>
  `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
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
          <div className="mb-6 mx-4 md:mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              {!isMobile && (
                <div className="flex justify-between items-end mt-2 md:mt-0 p-4 w-full">
                  <div className="flex items-center gap-2">
                    <FaExchangeAlt className="text-2xl text-gray-700" />

                    <h1 className="font-semibold text-2xl">Transaksional</h1>
                  </div>
                </div>
              )}
            </div>
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

              {/* Action Section */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrint}
                  className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                  </svg>
                  <span>Cetak</span>
                </button>
              </div>
            </div>

            <table
              id="printableTable"
              className="w-full table-auto bg-white mt-3"
            >
              <thead>
                <tr>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tl-lg">
                    No
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600">
                    Cabang
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Jumlah Anggota
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell text-center"
                    colSpan="2"
                  >
                    Tagihan
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 w-36">
                    Pembayaran
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 w-36 rounded-tr-lg">
                    Keterangan
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

                        {/* Jumlah Anggota */}
                        <td className="p-3 border-b text-center hidden lg:table-cell align-top">
                          {group.jumlah}
                        </td>

                        {/* Tagihan */}
                        <td
                          colSpan={2}
                          className="p-3 border-b text-left hidden lg:table-cell align-top"
                        >
                          <div className="flex justify-between py-1">
                            <span>PGRI:</span>
                            <span>
                              Rp. {parseInt(group.pgri).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Sanduka:</span>
                            <span>
                              Rp.{" "}
                              {parseInt(group.sanduka).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Daspen:</span>
                            <span>
                              Rp.{" "}
                              {parseInt(group.daspen).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Derap:</span>
                            <span>
                              Rp.{" "}
                              {parseInt(group.derap).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Kalender:</span>
                            <span>
                              Rp.{" "}
                              {parseInt(group.kalender).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Lain-lain:</span>
                            <span>
                              Rp.{" "}
                              {parseInt(group.sumbangan).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 font-bold">
                            <span>TOTAL</span>
                            <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full">
                              Rp.{" "}
                              {parseInt(group.totalIuran).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Pembayaran */}
                        <td className="p-3 border-b text-center">
                          <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full">
                            Rp.{" "}
                            {parseInt(group.totalIuran).toLocaleString("id-ID")}
                          </span>
                        </td>

                        {/* Keterangan */}
                        <td className="p-3 border-b text-center ">
                          {group.keterangan || "-"}
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
