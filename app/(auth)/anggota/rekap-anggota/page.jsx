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
  FaPlus,
  FaPrint,
} from "react-icons/fa";
import { FiTrash } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import * as XLSX from 'xlsx';

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
  const [daspenValue, setDaspenValue] = useState(null);

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

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
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
      const processed = processData(cabangData);
      setGroupedData(processed);
      setData(cabangData);
      calculateTotals(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase().includes(input.toLowerCase())
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
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
      const processed = processData(cabangData);
      setGroupedData(processed);
      setData(cabangData);
      calculateTotals(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase() === selectedValue.toLowerCase()
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
  };

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

  const processData = (rawData) => {
    const grouped = rawData.reduce((acc, item) => {
      const unitKey = item.unitKerja || "Tidak Ada Unit Kerja";
      const cabangKey = item.cabang || "Tidak Ada Cabang";

      if (!acc[unitKey]) {
        acc[unitKey] = {
          unitKerja: unitKey,
          cabang: cabangKey,
          members: [],
          jumlah: 0,
          pgri: 0,
          sanduka: 0,
          daspen: 0,
          derap: 0,
          kalender: 0,
          totalIuran: 0,
        };        
      }
      acc[unitKey].members.push({
        namaAnggota: item.namaAnggota,
        npaPgri: item.npaPgri,
        nip: item.nip,
        pgri: parseFloat(item.pgri) || 0,
        sanduka: parseFloat(item.sanduka) || 0,
        daspen: parseFloat(item.daspen) || 0,
        derap: parseFloat(item.derap) || 0,
        kalender: parseFloat(item.kalender) || 0,
        totalIuran: parseFloat(item.totalIuran) || 0,
      });
      acc[unitKey].jumlah += 1;
      acc[unitKey].pgri += parseFloat(item.pgri) || 0;
      acc[unitKey].sanduka += parseFloat(item.sanduka) || 0;
      acc[unitKey].daspen += parseFloat(item.daspen) || 0;
      acc[unitKey].derap += parseFloat(item.derap) || 0;
      acc[unitKey].kalender += parseFloat(item.kalender) || 0;
      acc[unitKey].totalIuran += parseFloat(item.totalIuran) || 0;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedRole = sessionStorage.getItem("role");
        const storedCabang = sessionStorage.getItem("cabang");

        if (storedRole === "ADMIN" && storedCabang) {
          setIsAdmin(true);
          setSelectedCabang(storedCabang);
          const response = await GlobalApi.getNominalAggregatedData(
            storedCabang
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
              kalender: parseFloat(totalRow.kalender) || 0,
              totalIuran: parseFloat(totalRow.totalIuran) || 0,
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          setData(regularData);
          setOriginalRekapData(regularData);
        } else {
          const response = await GlobalApi.getNominalAggregatedData("");

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
              totalIuran: parseFloat(totalRow.totalIuran) || 0,
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          console.log("proses",processed)
          // console.log("reguler",regularData)
          setData(regularData);
          setOriginalRekapData(regularData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [unitKerjaList]);

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

  const handleMemberClick = async (member) => {
    setSelectedMember(null);
    setDataNpa(null);
    setFotoBase64(null);
    setDataIuran(null);
    setIsPopupVisible(false);
    setIdIuran(null);

    try {
      const response = await GlobalApi.cekNpaList([member.npaPgri]);

      setSelectedMember(member);
      setDataNpa(response[0]);

      if (member.daspen) {
        setDaspenValue(member.daspen);
      }

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
        // console.log(iuranResponse);
        if (iuranResponse?.id) {
          setIdIuran(iuranResponse.id);
        }
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
          };

          setDataIuran(fallbackData);
          setIdIuran(null);
        }
      }

      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error saat cek NPA:", error);
      if (error.response?.status === 500) {
        console.warn("Server error 500: data tidak akan ditampilkan.");
      }
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

  const handleSave = () => {
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

        if (selectedKategori === "daspen") {
          initialValue = daspenValue;
        }

        setAddedCategories((prev) => [
          ...prev,
          { label: labelMap[selectedKategori], key: selectedKategori },
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

    let manualValueSanduka = 0;
    let manualValuepgri = 0;

    let iuranSanduka = 0;
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
    });
    let otomatisValueKalender = 0;
    let otomatisValueDerap = 0;

    let manualValueKalender = 0;
    let manualValueDerap = 0;
    let manualValueDaspen = 0;

    let totalKalender = 0;
    let iuranDerap = formKetiga?.iuranDerap || 0;
    let iuranDaspen = 0;

    addedCategories.forEach((item) => {
      const oldValue = newValues[item.key] ?? 0;
      const inputValue = manualInputs[item.key] ?? 0;
      const totalValue = oldValue + inputValue;

      if (item.label?.toLowerCase() === "kalender") {
        otomatisValueKalender = oldValue;
        manualValueKalender = inputValue;
        totalKalender = totalValue;
      }
      if (item.label?.toLowerCase() === "derap") {
        otomatisValueDerap = oldValue;
        manualValueDerap = inputValue;
        iuranDerap = totalValue;
      }

      if (item.label?.toLowerCase() === "daspen") {
        manualValueDaspen = inputValue;
        iuranDaspen = totalValue;
      }
    });

    const payload = {
      namaAnggota: dataNpa.namaLengkap,
      tempatTanggalLahir: tempatTanggalLahir,
      npa: dataNpa.npaPgri,
      nip: dataNpa.nip,
      nik: dataNpa.nik,
      cabang: dataNpa.cabang,
      unitKerja: dataNpa.unitKerja,
      jabatan: dataNpa.jabatan,

      iuranAnggota: otomatisValuePgri || 0,
      manualIuranAnggota: manualValuepgri || 0,
      totalIuranAnggota: iuranAnggota || 0,

      iuranSanduka: otomatisValueSanduka || 0,
      manualIuranSanduka: manualValueSanduka || 0,
      totalIuranSanduka: iuranSanduka || 0,

      iuranDaspen: 0,
      manualIuranDaspen: manualValueDaspen || 0,
      totalIuranDaspen: iuranDaspen || 0,

      iuranDerap: otomatisValueDerap || 0,
      manualIuranDerap: manualValueDerap || 0,
      totalIuranDerap: iuranDerap || 0,

      iuranKalender: otomatisValueKalender || 0,
      manualIuranKalender: manualValueKalender || 0,
      totalIuranKalender: totalKalender || 0,

      iuranSumbangan: 0,
      manualIuranSumbangan: 0,
      totalIuranSumbangan: formKetiga?.iuranSumbangan || 0,

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
      const response = await GlobalApi.postIuranAnggota(payload);

      setNotification({
        type: "success",
        message: "Data berhasil disimpan!",
      });

      setIsPopupVisible(false);
      setAddedCategories([]);
      setManualInputs([]);
      setSelectedKategori("");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

    const payload = {
      namaAnggota: dataNpa.namaLengkap,
      tempatTanggalLahir: `${dataNpa.tempatLahir}, ${dataNpa.tanggalLahir?.[2]}-${dataNpa.tanggalLahir?.[1]}-${dataNpa.tanggalLahir?.[0]}`,
      npa: dataNpa.npaPgri,
      nip: dataNpa.nip,
      nik: dataNpa.nik,
      cabang: dataNpa.cabang,
      unitKerja: dataNpa.unitKerja,
      jabatan: dataNpa.jabatan,
    };

    const capitalizeFirstLetter = (string) =>
      string.charAt(0).toUpperCase() + string.slice(1);

    groupedIuran.forEach((item) => {
      const key = item.key;
      const iuran = parseInt(item.iuran || 0);
      const manual = parseInt(nominalBaruList[key] || 0);
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

    // console.log("Data yang akan diupdate:", payload);

    try {
      await GlobalApi.putIuranAnggota(idIuran, payload);
      setNotification({
        type: "success",
        message: "Data berhasil diupdate!",
      });
      setIsPopupVisible(false);
      setAddedCategories([]);
      setManualInputs([]);
      setSelectedKategori(""); setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Gagal update data:", error);
      setNotification({
        type: "error",
        message: "Gagal update data. Silakan cek console.",
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
      // Hapus data iuran by ID
      await GlobalApi.deleteIuranAnggota(idIuran);

      setNotification({
        type: "success",
        message: "Data berhasil direset!",
      });

      // Reset semua form setelah penghapusan
      setNominalBaruList(Array(groupedIuran.length).fill(""));
      setManualInputs({});
      setAddedCategories([]);
      setSelectedKategori("");
      setShowDropdown(false);
      setDataIuran(null);
      setIdIuran(null);
      setIsPopupVisible(false);
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
                      ?.map(
                        (member, memberIndex) => `
                    <tr>
                      ${
                        memberIndex === 0
                          ? `
                        <td rowspan="${members.length}">${index + 1}</td>
                        <td rowspan="${members.length}">${group.cabang}</td>
                        <td rowspan="${members.length}">${group.unitKerja}</td>
                      `
                          : ""
                      }
                      <td class="member-list">${member.namaAnggota}</td>
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
                      <td>Rp. ${parseInt(member.sanduka || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.daspen || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.derap || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.kalender || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.lainlain || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.totalIuran || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                    </tr>
                  `
                      )
                      .join("");
                  })
                  .join("")}
                <tr class="total-row">
                  <td colspan="4" style="text-align: center">Total Keseluruhan :</td>
                  <td>${grandTotals?.jumlah || 0}</td>
                  <td>Rp. ${parseInt(grandTotals?.pgri || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.sanduka || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.daspen || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.derap || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.kalender || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.lainlain || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(
                    grandTotals?.totalIuran || 0
                  ).toLocaleString("id-ID")}</td>
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

  const exportToExcel = () => {
    if (!groupedData || groupedData.length === 0) {
      console.error("Data kosong, tidak dapat export ke Excel");
      return;
    }
  
    // Prepare the data for Excel
    const excelData = [];
    
    // Add headers
    excelData.push([
      'No',
      'Cabang',
      'Unit Kerja',
      'Nama Anggota',
      'Jumlah Anggota',
      'PGRI',
      'Sanduka',
      'Daspen',
      'Derap',
      'Kalender',
      'Lain-Lain',
      'Total'
    ]);
  
    // Add data rows
    groupedData.forEach((group, index) => {
      if (group.members && group.members.length > 0) {
        group.members.forEach((member, memberIndex) => {
          excelData.push([
            memberIndex === 0 ? index + 1 : '',
            memberIndex === 0 ? group.cabang : '',
            memberIndex === 0 ? group.unitKerja : '',
            member.namaAnggota,
            memberIndex === 0 ? group.jumlah : '',
            parseInt(member.pgri || 0),
            parseInt(member.sanduka || 0),
            parseInt(member.daspen || 0),
            parseInt(member.derap || 0),
            parseInt(member.kalender || 0),
            parseInt(member.lainlain || 0),
            parseInt(member.totalIuran || 0)
          ]);
        });
      }
    });
  
    // Add totals row
    excelData.push([
      '', '', '', 'Total Keseluruhan:',
      grandTotals?.jumlah || 0,
      parseInt(grandTotals?.pgri || 0),
      parseInt(grandTotals?.sanduka || 0),
      parseInt(grandTotals?.daspen || 0),
      parseInt(grandTotals?.derap || 0),
      parseInt(grandTotals?.kalender || 0),
      parseInt(grandTotals?.lainlain || 0),
      parseInt(grandTotals?.totalIuran || 0)
    ]);
  
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RekapData");
  
    // Generate file name
    const fileName = `Rekap_By_Nominal${
      selectedCabang ? `_Cabang_${selectedCabang}` : ""
    }${selectedUnitKerja ? `_Unit_Kerja_${selectedUnitKerja}` : ""}.xlsx`;
  
    // Export to Excel
    XLSX.writeFile(wb, fileName);
  };

  const renderCabangInput = () => {
    return (
      <div className="flex flex-col relative w-64" ref={cabangRef}>
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
          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
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
    );
  };

  const renderUnitKerjaInput = () => (
    <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
      <Input
        type="text"
        value={unitKerjaInput}
        onChange={handleUnitKerjaChange}
        onFocus={handleUnitKerjaFocus}
        placeholder="Pilih Unit Kerja"
        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
        disabled={!selectedCabang}
      />
      {showUnitKerjaDropdown && (
        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
          <ul className="max-h-44 overflow-y-auto">
            <li className="py-2 px-2">
              <Input
                type="text"
                value={searchUnitKerja}
                onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                placeholder="Cari Unit Kerja..."
                autoFocus
              />
            </li>
            <li
              onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
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
  );

  const FilterSection = ({
    renderCabangInput,
    renderUnitKerjaInput,
    isMobile,
  }) => {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block mb-2 text-sm">Cabang</label>
              {renderCabangInput()}
            </div>
            <div>
              <label className="block mb-2 text-sm">Unit Kerja</label>
              {renderUnitKerjaInput()}
            </div>
          </div>
          {isMobile && (
            <Button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              Cetak
            </Button>
          )}
        </div>
      </div>
    );
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
              <div className="flex flex-wrap items-center space-x-2">
                <FilterSection
                  renderCabangInput={renderCabangInput}
                  renderUnitKerjaInput={renderUnitKerjaInput}
                  isMobile={isMobile}
                />
              </div>
              {!isMobile && (
                <div className="flex items-end mt-2 md:mt-0 gap-4">
                  <button
                    onClick={handlePrint}
                    className="p-2 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <span>Cetak</span>
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
                  </button>
                  <button
  className="p-2 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
  onClick={exportToExcel}
  title="Export to Excel"
                  >
                    <span>Excel</span>
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
</button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg mx-4 md:mx-12">
            <div className="bg-teal-700 p-4 rounded-t-lg">
              <h2 className="text-white text-xl font-semibold">
                Laporan Tagihan
              </h2>
              <p className="text-teal-100 text-sm">
                Daftar iuran anggota per unit kerja
              </p>
            </div>

            <table className="w-full table-auto bg-white">
              <thead>
                <tr>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tl-lg"
                    rowSpan="2"
                  >
                    No
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Cabang
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Unit Kerja
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Nama Anggota
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell"
                    rowSpan="2"
                  >
                    Jumlah Anggota
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell text-center"
                    colSpan="6"
                  >
                    Jumlah
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600  w-36"
                    rowSpan="2"
                  >
                    Total
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 w-28 rounded-tr-lg"
                    rowSpan="2"
                  >
                    Action
                  </th>
                </tr>
                <tr>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    PGRI
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Sanduka
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Daspen
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Derap
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Kalender
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Lain-Lain
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((group, index) => {
                  const isExpanded = expandedRows.has(group.unitKerja);
                  const rowSpanCount = isExpanded
                    ? group.members.length + 1
                    : 1;

                  return (
                    <React.Fragment key={group.unitKerja}>
                      <tr
                        className={index % 2 === 0 ? "bg-white" : "bg-teal-50"}
                      >
                        <td
                          className="p-3 border-b text-center"
                          rowSpan={rowSpanCount}
                        >
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3 border-b" rowSpan={rowSpanCount}>
                          {group.cabang}
                        </td>
                        <td
                          className="p-3 border-b font-medium"
                          rowSpan={rowSpanCount}
                        >
                          {group.unitKerja}
                        </td>
                        <td className="p-3 border-b text-center">
                          <Button
                            className="text-teal-600 bg-transparent hover:bg-teal-50 hover:text-teal-700 rounded-full p-2 transition-all duration-200"
                            onClick={() => toggleExpand(group.unitKerja)}
                          >
                            {isExpanded ? (
                              <span className="flex items-center gap-1">
                                <FaMinusCircle />{" "}
                                <span className="text-sm">Tutup</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FaPlusCircle />{" "}
                                <span className="text-sm">Detail</span>
                              </span>
                            )}
                          </Button>
                        </td>
                        <td
                          className="p-3 border-b text-center hidden lg:table-cell font-medium"
                          rowSpan={rowSpanCount}
                        >
                          {group.jumlah}
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.pgri).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp.{" "}
                            {parseInt(group.sanduka).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.daspen).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.derap).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.kalender).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. 0
                          </span>
                        </td>
                        <td className="p-3 border-b text-center font-semibold">
                          <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full">
                            Rp.{" "}
                            {parseInt(group.totalIuran).toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>

                      {isExpanded &&
                        group.members.map((member, idx) => (
                          <tr
                            key={`${group.unitKerja}-member-${idx}`}
                            className="bg-teal-50/30 hover:bg-teal-50"
                          >
                            <td
                              className="p-3 border-b"
                              colSpan={isMobile ? 5 : 1}
                            >
                              <div className="flex flex-col lg:flex-row">
                                <div className="font-medium mb-2 lg:mb-0 flex items-center">
                                  <span className="w-6 h-6 flex items-center justify-center bg-teal-200 text-teal-800 rounded-full mr-2 text-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-teal-700">
                                    {member.namaAnggota}
                                    <div className="text-sm text-teal-700 italic">{member.nip}</div>
                                  </span>
                                </div>
                                <div className="lg:hidden space-y-2 mt-2 bg-white p-3 rounded-lg shadow-sm">
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      PGRI:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.pgri).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      Sanduka:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.sanduka).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      Daspen:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.daspen).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4 font-medium bg-teal-100 p-2 rounded-lg">
                                    <span className="text-teal-800">
                                      Total:
                                    </span>
                                    <span className="text-teal-800">
                                      Rp.{" "}
                                      {parseInt(
                                        member.totalIuran
                                      ).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.pgri).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.sanduka).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.daspen).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.derap).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.kalender).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                             0
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              <span className="bg-teal-100 text-teal-800 py-1 px-2 rounded-full text-sm">
                                Rp.{" "}
                                {parseInt(member.totalIuran).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </td>
                            <td className="p-3 border-b text-center space-x-2">
                              <button
                                className="text-teal-600 hover:text-teal-800"
                                onClick={() => handleMemberClick(member)}
                              >
                                <FaPlus />
                              </button>
                              <button
                                className="text-teal-600 hover:text-teal-800"
                                onClick={() => handlePrintClick(member)}
                              >
                                <FaPrint />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
              {isPopupVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative space-y-6 max-h-screen overflow-y-auto">
                    {/* Tombol Tutup */}
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
                      onClick={() => {
                        setIsPopupVisible(false);
                        setAddedCategories([]);
                        setManualInputs([]);
                      }}
                    >
                      ✕
                    </button>

                    {/* Judul Form */}
                    <h2 className="text-center text-2xl font-bold text-white bg-red-700 py-2 rounded">
                      Form Keuangan
                    </h2>

                    {/* Bagian Data Diri & Sinkronisasi */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* Kiri: Foto + Data Diri */}
                      <div className="flex gap-4 w-full md:w-2/3">
                        <Image
                          src={
                            fotoBase64
                              ? `data:image/jpeg;base64,${fotoBase64}`
                              : profileImageUrl
                          }
                          width={100}
                          height={100}
                          alt="Foto User"
                          className="w-24 h-28 object-cover rounded-lg border"
                          unoptimized={true}
                        />

                        <div className="text-sm space-y-1">
                          {dataNpa ? (
                            <>
                              <p>
                                <strong>{dataNpa.namaLengkap}</strong>
                              </p>
                              <p>
                                Tempat, Tanggal Lahir: {dataNpa.tempatLahir},
                                {dataNpa.tanggalLahir?.[2]}-
                                {dataNpa.tanggalLahir?.[1]}-
                                {dataNpa.tanggalLahir?.[0]}
                              </p>
                              <p>Nomor Anggota PGRI: {dataNpa.npaPgri}</p>
                              <p>Nomor Induk Pegawai: {dataNpa.nip}</p>
                              <p>Nomor Induk Kependudukan: {dataNpa.nik}</p>
                            </>
                          ) : (
                            <p>Loading data anggota...</p>
                          )}
                        </div>
                      </div>

                      {/* Kanan: Info Singkat */}
                      <div className="w-full md:w-1/3 text-sm">
                        {dataNpa && (
                          <>
                            <p>
                              <strong>{dataNpa.cabang}</strong>,{" "}
                            </p>
                            <p>{dataNpa.jabatan}</p>
                            <p>{dataNpa.unitKerja}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Form Keuangan */}
                    <div className="gap-6">
                      {/* Kiri: Daftar Kategori */}
                      <div className="space-y-2">
                        {groupedIuran
                          .filter(
                            (item) =>
                              parseInt(item.iuran || 0) +
                                parseInt(item.manual || 0) >
                              0
                          )
                          .map((item, idx) => {
                            const oldValue = parseInt(item.iuran || 0);
                            const inputValue = nominalBaruList[item.key] || 0;
                            const totalValue = oldValue + inputValue;

                            return (
                              <div
                                key={idx}
                                className="space-y-1 px-3 py-2 rounded-md"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {item.key}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {/* Iuran Sekarang */}
                                  <input
                                    type="text"
                                    readOnly
                                    value={`Rp. ${oldValue.toLocaleString(
                                      "id-ID"
                                    )}`}
                                    className="border px-2 py-1 rounded bg-gray-200 text-center"
                                  />

                                  {/* Form 2: Input manual */}
                                  <input
                                    type="text"
                                    placeholder="Tambahan cabang"
                                    value={
                                      inputValue === 0
                                        ? ""
                                        : `Rp. ${inputValue.toLocaleString(
                                            "id-ID"
                                          )}`
                                    }
                                    onChange={(e) => {
                                      const angka =
                                        parseInt(
                                          e.target.value.replace(/[^\d]/g, "")
                                        ) || 0;
                                      setNominalBaruList((prev) => ({
                                        ...prev,
                                        [item.key]: angka,
                                      }));
                                    }}
                                    className="border px-2 py-1 rounded text-center"
                                  />

                                  {/* Total */}
                                  <input
                                    type="text"
                                    readOnly
                                    value={`Rp. ${totalValue.toLocaleString(
                                      "id-ID"
                                    )}`}
                                    className="border px-2 py-1 rounded bg-gray-200 text-center"
                                  />
                                </div>
                              </div>
                            );
                          })}

                        {addedCategories.map((item, idx) => {
                          const oldValue = newValues[item.key] ?? 0;
                          const inputValue = manualInputs[item.key] ?? 0;
                          const totalValue = oldValue + inputValue;

                          return (
                            <div
                              key={`added-${idx}`}
                              className="space-y-1 px-3 py-2 rounded-md relative"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {item.label}
                                </span>

                                {/* Icon Sampah */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedCategories =
                                      addedCategories.filter(
                                        (_, i) => i !== idx
                                      );
                                    setAddedCategories(updatedCategories);
                                    setManualInputs((prev) => {
                                      const newInputs = { ...prev };
                                      delete newInputs[item.key];
                                      return newInputs;
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash />
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mt-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={`Rp. ${oldValue.toLocaleString(
                                    "id-ID"
                                  )}`}
                                  className="border px-2 py-1 rounded bg-gray-200 text-center"
                                />

                                <input
                                  type="text"
                                  placeholder="Tambahan cabang"
                                  value={
                                    inputValue === 0
                                      ? ""
                                      : `Rp. ${inputValue.toLocaleString(
                                          "id-ID"
                                        )}`
                                  }
                                  onChange={(e) => {
                                    const angka =
                                      parseInt(
                                        e.target.value.replace(/[^\d]/g, "")
                                      ) || 0;
                                    setManualInputs((prev) => ({
                                      ...prev,
                                      [item.key]: angka,
                                    }));
                                  }}
                                  className="border px-2 py-1 rounded text-center"
                                />

                                <input
                                  type="text"
                                  readOnly
                                  value={`Rp. ${totalValue.toLocaleString(
                                    "id-ID"
                                  )}`}
                                  className="border px-2 py-1 rounded bg-gray-200 text-center"
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* Total */}
                        <div className="flex items-center justify-between bg-purple-200 px-3 py-2 rounded-md font-bold">
                          <span>Total</span>
                          <span>Rp. {grandTotal.toLocaleString("id-ID")}</span>
                        </div>

                        {/* Pindahan: Tambah Kategori */}
                        <div className="bg-gray-100 rounded-md p-4 mt-4">
                          <h3 className="text-lg font-semibold text-purple-800 mb-3">
                            Tambah Keuangan
                          </h3>

                          <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center text-teal-600 hover:text-teal-800 mb-3"
                          >
                            <span className="text-xl mr-2">➕</span> Tambah
                            Kategori
                          </button>

                          {showDropdown && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium">
                                  Pilih Kategori Tambahan
                                </label>
                                <select
                                  className="w-full border rounded px-3 py-2"
                                  value={selectedKategori}
                                  onChange={(e) =>
                                    setSelectedKategori(e.target.value)
                                  }
                                >
                                  <option value="">-- Pilih --</option>
                                  <option value="daspen">Daspen</option>
                                  <option value="sumbangan">Sumbangan</option>
                                  <option value="kalender">Kalender</option>
                                  <option value="derap">Derap</option>
                                  <option value="lain-lain">Lain-Lain</option>
                                </select>
                              </div>

                              {selectedKategori && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={handleSave}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
                                  >
                                    Simpan
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={idIuran ? handleUpdateClick : handleSaveClick}
                      >
                        {idIuran ? "Update" : "Save"}
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-md"
                        onClick={handleReset}
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isModalOpen && selectedMember && dataIuran && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg w-[800px] relative shadow-lg">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
                      onClick={closeModal}
                    >
                      ✕
                    </button>

                    <div className="bg-blue-100 p-5 rounded-lg">
                      <h2 className="text-center text-blue-900 font-bold text-xl mb-3">
                        Data KEUANGAN ANGGOTA
                      </h2>

                      <div className="flex gap-4">
                        <Image
                          src={
                            fotoBase64
                              ? `data:image/jpeg;base64,${fotoBase64}`
                              : profileImageUrl
                          }
                          width={100}
                          height={100}
                          alt="Foto User"
                          className="w-24 h-28 object-cover rounded-lg border"
                          unoptimized={true}
                        />
                        <div className="flex-1 text-sm">
                          <p>
                            <span className="font-bold text-green-800 text-lg uppercase">
                              {dataIuran.namaAnggota}
                            </span>
                          </p>
                          <p>
                            Tempat, Tanggal Lahir:{" "}
                            {dataIuran.tempatTanggalLahir}
                          </p>
                          <p>
                            Nomor Anggota PGRI: <strong>{dataIuran.npa}</strong>
                          </p>
                          <p>
                            Nomor Induk Pegawai: <em>{dataIuran.nip}</em>
                          </p>
                          <p>
                            Nomor Induk Kependudukan: <em>{dataIuran.nik}</em>
                          </p>
                        </div>
                        <div className="text-sm text-left">
                          <p>{dataIuran.cabang}</p>
                          <p>{dataIuran.jabatan}</p>
                          <p>{dataIuran.unitKerja}</p>
                        </div>
                      </div>

                      <div className="mt-5 text-sm">
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Iuran Anggota
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranAnggota || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Sanduka
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranSanduka || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Daspen
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranDaspen || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Derap
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranDerap || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Kalender
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranKalender || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                        <p>
                          <span className="inline-block min-w-[140px]">
                            Sumbangan
                          </span>
                          : Rp.{" "}
                          {(dataIuran.totalIuranSumbangan || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>

                        <hr className="my-2 border-t-2 border-gray-300" />

                        <p className="font-bold mt-2">
                          <span className="inline-block min-w-[140px]">
                            Total Keseluruhan
                          </span>
                          : Rp.{" "}
                          {(
                            (dataIuran.totalIuranAnggota || 0) +
                            (dataIuran.totalIuranSanduka || 0) +
                            (dataIuran.totalIuranDaspen || 0) +
                            (dataIuran.totalIuranDerap || 0) +
                            (dataIuran.totalIuranKalender || 0) +
                            (dataIuran.totalIuranSumbangan || 0)
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <tfoot>
                <tr className="bg-teal-700 text-white font-bold">
                  <td
                    colSpan={isMobile ? 3 : 4}
                    className="p-3 border-t-2 border-teal-800 text-center rounded-bl-lg"
                  >
                    Total Keseluruhan:
                  </td>
                  <td className="p-3 border-t-2 border-teal-800 text-center">
                    {grandTotals.jumlah}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp. {parseInt(grandTotals.pgri).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp.{" "}
                        {parseInt(grandTotals.sanduka).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp.{" "}
                        {parseInt(grandTotals.daspen).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}
                  <td className="p-3 border-t-2 border-teal-800 text-center rounded-br-lg">
                    Rp.{" "}
                    {parseInt(grandTotals.totalIuran).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-white p-4 rounded-b-lg border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <div>Menampilkan {groupedData.length} unit kerja</div>
              <div>Total anggota: {grandTotals.jumlah}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;