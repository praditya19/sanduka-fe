// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useCallback } from "react";
// import HeaderMenu from "@/app/_components/HeaderMenu";
// import HeaderMobile from "@/app/_components/HeaderMobile";
// import Sidebar from "@/app/_components/Sidebar";
// import { useAuth } from "@/app/AuthContext";
// import GlobalApi from "@/app/_utils/GlobalApi";
// import { Input } from "@/components/ui/input";
// import {
//   FaPlusCircle,
//   FaMinusCircle,
//   FaTimesCircle,
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaEdit,
//   FaPrint,
//   FaSearch,
//   FaFileInvoiceDollar,
//   FaDatabase,
// } from "react-icons/fa";
// import { FiPlus, FiSave, FiTrash } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import { ClipLoader } from "react-spinners";
// import Image from "next/image";
// import * as XLSX from "xlsx";

// const NotificationPopup = ({ type, message, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const getBgColor = () => {
//     switch (type) {
//       case "success":
//         return "bg-green-100";
//       case "error":
//         return "bg-red-100";
//       default:
//         return "bg-blue-100";
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "success":
//         return <FaCheckCircle className="text-green-500 text-3xl" />;
//       case "error":
//         return <FaExclamationCircle className="text-red-500 text-3xl" />;
//       default:
//         return null;
//     }
//   };

//   const getTextColor = () => {
//     switch (type) {
//       case "success":
//         return "text-green-800";
//       case "error":
//         return "text-red-800";
//       default:
//         return "text-blue-800";
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div
//         className="absolute inset-0 bg-black opacity-50"
//         onClick={onClose}
//       ></div>
//       <div
//         className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
//           aria-label="Close"
//         >
//           <FaTimesCircle size={24} />
//         </button>

//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-bounce">{getIcon()}</div>

//           <h3 className={`text-xl font-bold ${getTextColor()}`}>
//             {type === "success" ? "Berhasil!" : "Gagal!"}
//           </h3>

//           <div className={`${getTextColor()} text-center`}>{message}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// function RekapAnggota() {
//   const [data, setData] = useState([]);
//   const { token } = useAuth();
//   const router = useRouter();
//   const [originalCabangList, setOriginalCabangList] = useState([]);
//   const [filteredCabangList, setFilteredCabangList] = useState([]);
//   const [selectedCabang, setSelectedCabang] = useState("");
//   const [showCabangDropdown, setShowCabangDropdown] = useState(false);
//   const [unitKerjaList, setUnitKerjaList] = useState([]);
//   const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
//   const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
//   const [unitKerjaInput, setUnitKerjaInput] = useState("");
//   const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
//   const cabangRef = useRef(null);
//   const unitKerjaRef = useRef(null);
//   const namaInputRef = useRef(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [originalRekapData, setOriginalRekapData] = useState([]);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [totals, setTotals] = useState({
//     jumlah: 0,
//     pgri: 0,
//     sanduka: 0,
//     daspen: 0,
//     iuran: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [loadButton, setLoadButton] = useState(false);
//   const [groupedData, setGroupedData] = useState([]);
//   const [expandedRows, setExpandedRows] = useState(new Set());
//   const [searchCabang, setSearchCabang] = useState("");
//   const [searchUnitKerja, setSearchUnitKerja] = useState("");
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [isPopupVisible, setIsPopupVisible] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedKategori, setSelectedKategori] = useState("");
//   const [dataNpa, setDataNpa] = useState(null);
//   const [statusPegawai, setStatusPegawai] = useState(null);
//   const [fotoBase64, setFotoBase64] = useState(null);
//   const profileImageUrl = "/profile.png";
//   const [nominalBaruList, setNominalBaruList] = useState([]);
//   const [addedCategories, setAddedCategories] = useState([]);
//   const [defaultIuran, setDefaultIuran] = useState(null);
//   const [newValues, setNewValues] = useState({});
//   const [manualInputs, setManualInputs] = useState({});
//   const [dataIuran, setDataIuran] = useState(null);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [idIuran, setIdIuran] = useState(null);
//   const [formKetiga, setFormKetiga] = useState({
//     iuranAnggota: "",
//     iuranSanduka: "",
//     iuranDaspen: "",
//     iuranDerap: "",
//   });
//   const [totalIuranWilayah, setTotalIuranWilayah] = useState({
//     propinsi: 0,
//     kabupaten: 0,
//     cabang: 0,
//   });
//   const [notification, setNotification] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [loader, setLoader] = useState(false);
//   const [daspenValue, setDaspenValue] = useState(null);
//   const [nipValue, setNipValue] = useState(null);
//   const [namaAnggotaInput, setNamaAnggotaInput] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [nomorRekening, setNomorRekening] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const [keteranganLainLain, setKeteranganLainLain] = useState([]);
//   const [selectedKeterangan, setSelectedKeterangan] = useState("");
//   const [popupBackup, setPopupBackup] = useState(false);
//   const [popupBackupRekapByNominal, setPopupRekapByNominal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [lastUpdatedMemberNip, setLastUpdatedMemberNip] = useState(null);
//   const lastUpdatedMemberRef = useRef(null);
//   const [resetKeys, setResetKeys] = useState([]);
//   const [progress, setProgress] = useState(0);
//   const [notifDaspen, setNotifDaspen] = useState(null);
//   const [listNoRekening, setListNoRekening] = useState([]);
//   const [sumbanganList, setSumbanganList] = useState([]);
//   const [isExporting, setIsExporting] = useState(false);
//   const currentYear = new Date().getFullYear();
//   const years = Array.from(
//     { length: currentYear - 2025 + 6 },
//     (_, i) => 2025 + i
//   );

//   const months = [
//     "Januari",
//     "Februari",
//     "Maret",
//     "April",
//     "Mei",
//     "Juni",
//     "Juli",
//     "Agustus",
//     "September",
//     "Oktober",
//     "November",
//     "Desember",
//   ];

//   const [selectedBulan, setSelectedBulan] = useState("");
//   const [selectedTahun, setSelectedTahun] = useState("");
//   // const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());
//   const filteredMonths = selectedTahun === 2025 ? months.slice(4) : months;
//   // otomatis bulan
//   // useEffect(() => {
//   // const now = new Date();
//   // const currentMonth = now.getMonth() + 1;

//   // if (selectedTahun === 2025) {
//   //   setSelectedBulan(currentMonth < 5 ? 5 : currentMonth);
//   // } else {
//   //   setSelectedBulan(currentMonth);
//   // }
//   // }, [selectedTahun]);
//   //
//   // State untuk tagihan bulan
//   const getNextMonthYear = () => {
//     const now = new Date();
//     const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

//     return {
//       month: nextMonthDate.getMonth() + 1,
//       year: nextMonthDate.getFullYear(),
//     };
//   };

//   const [selectedMonth, setSelectedMonth] = useState(
//     () => getNextMonthYear().month
//   );
//   const [selectedYear, setSelectedYear] = useState(
//     () => getNextMonthYear().year
//   );

//   useEffect(() => {
//     const fetchCabangData = async () => {
//       try {
//         const response = await GlobalApi.getCabang();
//         setOriginalCabangList(response.data);
//         setFilteredCabangList(response.data);
//       } catch (error) {
//         console.error("Error fetching cabang data:", error);
//       }
//     };
//     fetchCabangData();
//   }, [unitKerjaList]);

//   useEffect(() => {
//     const fetchUnitKerjaData = async () => {
//       try {
//         const response = await GlobalApi.getUnitKerja();
//         setUnitKerjaList(response.data);
//       } catch (error) {
//         console.error("Error fetching unit kerja data:", error);
//       }
//     };
//     fetchUnitKerjaData();
//   }, []);

//   useEffect(() => {
//     const fetchKeterangan = async () => {
//       if (selectedKategori === "lainlain") {
//         try {
//           const response = await GlobalApi.getKeteranganLainlain();
//           setKeteranganLainLain(response);
//           setShowPopup(true);
//         } catch (err) {
//           console.error("Gagal ambil keterangan:", err);
//           setKeteranganLainLain([]);
//         }
//       } else {
//         setShowPopup(false);
//       }
//     };

//     fetchKeterangan();
//   }, [selectedKategori]);

//   const handleUnitKerjaFocus = () => {
//     if (selectedCabang) {
//       setShowUnitKerjaDropdown(true);
//     }
//   };

//   const handleUnitKerjaClick = () => {
//     if (!selectedCabang) return;
//     const filteredList = unitKerjaList.filter(
//       (unitKerja) =>
//         unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase()
//     );

//     setFilteredUnitKerja(filteredList);
//     setShowUnitKerjaDropdown(true);
//   };

//   const handleCabangClick = () => {
//     setFilteredCabangList(originalCabangList);
//     setShowCabangDropdown(true);
//   };

//   /**
//    * Helper function untuk memproses API response dan mengambil data terbaru
//    * Bisa berdasarkan lastUpdatedAtIuran atau idByNominal terbesar
//    * Optional: filter berdasarkan npaPgri tertentu
//    */
//   const processApiResponse = (
//     apiData,
//     filterByNpa = null,
//     useLatestDate = true
//   ) => {
//     if (!apiData || !Array.isArray(apiData)) {
//       return apiData;
//     }

//     // Filter berdasarkan npaPgri jika diperlukan
//     let filteredData = apiData;
//     if (filterByNpa) {
//       filteredData = apiData.filter((item) => item.npaPgri === filterByNpa);
//     }

//     // Kelompokkan berdasarkan npaPgri untuk mengambil data terbaru per anggota
//     const groupedByNpa = {};

//     filteredData.forEach((item) => {
//       const npa = item.npaPgri;

//       if (!groupedByNpa[npa]) {
//         groupedByNpa[npa] = item;
//       } else {
//         const shouldReplace = useLatestDate
//           ? // Bandingkan berdasarkan lastUpdatedAtIuran (data terbaru)
//             new Date(item.lastUpdatedAtIuran || 0) >
//             new Date(groupedByNpa[npa].lastUpdatedAtIuran || 0)
//           : // Atau bandingkan berdasarkan idByNominal (ID terbesar)
//             (item.idByNominal || 0) > (groupedByNpa[npa].idByNominal || 0);

//         if (shouldReplace) {
//           groupedByNpa[npa] = item;
//         }
//       }
//     });

//     // Kembalikan hasil sebagai array, dengan menambahkan info tentang pemrosesan
//     const result = Object.values(groupedByNpa);
//     return result;
//   };

//   const handleUnitKerjaChange = (e) => {
//     const input = e.target.value;
//     setUnitKerjaInput(input);
//     setSelectedUnitKerja(input);

//     if (!selectedCabang) return;

//     const filteredList = unitKerjaList.filter(
//       (unitKerja) =>
//         unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
//         unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
//     );

//     setShowUnitKerjaDropdown(true);
//     setFilteredUnitKerja(filteredList);

//     if (input === "") {
//       const cabangData = originalRekapData.filter((item) =>
//         selectedCabang
//           ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
//           : true
//       );
//       const processed = processData(cabangData);
//       setGroupedData(processed);
//       setData(cabangData);
//       calculateTotals(cabangData);
//     } else {
//       const filteredData = originalRekapData.filter(
//         (item) =>
//           (!selectedCabang ||
//             item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
//           item.unitKerja?.toLowerCase().includes(input.toLowerCase())
//       );
//       const processed = processData(filteredData);
//       setGroupedData(processed);
//       setData(filteredData);
//       calculateTotals(filteredData);
//     }
//   };

//   const handleCabangSearch = (query) => {
//     const filtered = originalCabangList.filter((cabang) =>
//       cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
//     );
//     setFilteredCabangList(filtered);
//     setSearchCabang(query);
//   };

//   const handleUnitKerjaSearch = (searchTerm) => {
//     setSearchUnitKerja(searchTerm);
//     if (searchTerm === "") {
//       const allFiltered = unitKerjaList.filter(
//         (unitKerja) => unitKerja.cabang === selectedCabang
//       );
//       setFilteredUnitKerja(allFiltered);
//     } else {
//       const filtered = unitKerjaList.filter(
//         (unitKerja) =>
//           unitKerja.unitKerja
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) &&
//           unitKerja.cabang === selectedCabang
//       );
//       setFilteredUnitKerja(filtered);
//     }
//   };

//   const handleSelectCabang = async (cabang) => {
//     setSelectedCabang(cabang.kecamatan);
//     setShowCabangDropdown(false);
//     setSelectedUnitKerja("");
//     setUnitKerjaInput("");
//     setSearchCabang("");
//     setNamaAnggotaInput("");

//     try {
//       let response = await GlobalApi.getNominalAggregatedData(
//         cabang.kecamatan || ""
//       );

//       // 📌 Proses data untuk mengambil yang terbaru per npaPgri
//       // Opsional: ganti null dengan npaPgri spesifik contoh "33200806435"
//       // Ganti true dengan false jika ingin berdasarkan idByNominal terbesar
//       response = processApiResponse(response, null, true);

//       const totalRow = response.find(
//         (item) => item.cabang === "Total" && !item.unitKerja
//       );
//       const regularData = response.filter(
//         (item) => !(item.cabang === "Total" && !item.unitKerja)
//       );

//       if (totalRow) {
//         setGrandTotals({
//           jumlah: parseInt(totalRow.jumlah) || 0,
//           pgri: parseFloat(totalRow.pgri) || 0,
//           sanduka: parseFloat(totalRow.sanduka) || 0,
//           daspen: parseFloat(totalRow.daspen) || 0,
//           derap: parseFloat(totalRow.derap) || 0,
//           kalnder: parseFloat(totalRow.kalender) || 0,
//           daspen: parseFloat(totalRow.daspen) || 0,
//           totalIuran: parseFloat(totalRow.totalIuran) || 0,
//         });
//       }

//       setData(regularData);
//       setOriginalRekapData(regularData);

//       const processed = processData(regularData);
//       setGroupedData(processed);

//       const filtered = unitKerjaList.filter(
//         (unitKerja) =>
//           unitKerja.cabang &&
//           unitKerja.cabang.toLowerCase() ===
//             (cabang.kecamatan || "").toLowerCase()
//       );
//       setFilteredUnitKerja(filtered);
//     } catch (error) {
//       console.error("Error fetching rekap data:", error);
//     }
//   };

//   const handleUnitKerjaSelect = (unitKerja) => {
//     const selectedValue = unitKerja.unitKerja;
//     setSelectedUnitKerja(selectedValue);
//     setUnitKerjaInput(selectedValue);
//     setShowUnitKerjaDropdown(false);
//     setSearchUnitKerja("");
//     setNamaAnggotaInput("");

//     if (!selectedValue) {
//       const cabangData = originalRekapData.filter((item) =>
//         selectedCabang
//           ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
//           : true
//       );
//       const processed = processData(cabangData);
//       setGroupedData(processed);
//       setData(cabangData);
//       calculateTotals(cabangData);
//     } else {
//       const filteredData = originalRekapData.filter(
//         (item) =>
//           (!selectedCabang ||
//             item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
//           item.unitKerja?.toLowerCase() === selectedValue.toLowerCase()
//       );
//       const processed = processData(filteredData);
//       setGroupedData(processed);
//       setData(filteredData);
//       calculateTotals(filteredData);
//     }
//   };

//   const processData = (rawData) => {
//     const uniqueMap = new Map();

//     rawData.forEach((item) => {
//       const key = `${item.namaAnggota}-${item.npaPgri}`;
//       if (!uniqueMap.has(key)) {
//         uniqueMap.set(key, item);
//       }
//     });

//     const filteredData = Array.from(uniqueMap.values());

//     const grouped = filteredData.reduce((acc, item) => {
//       const unitKey = item.unitKerja || "Tidak Ada Unit Kerja";
//       const cabangKey = item.cabang || "Tidak Ada Cabang";

//       if (!acc[unitKey]) {
//         acc[unitKey] = {
//           unitKerja: unitKey,
//           cabang: cabangKey,
//           members: [],
//           jumlah: 0,
//           pgri: 0,
//           sanduka: 0,
//           daspen: 0,
//           derap: 0,
//           kalender: 0,
//           sumbangan: 0,
//           totalIuran: 0,
//           nomorRekening: 0,
//           lastUpdatedAtIuranAnggota: "",
//           sumbanganDetail: {
//             "Cetak Kartu Biasa": 25000,
//             "IURAN HUT 80 PGRI": 30000,
//           },
//         };
//       }

//       acc[unitKey].members.push({
//         namaAnggota: item.namaAnggota,
//         npaPgri: item.npaPgri,
//         nomorRekening: item.nomorRekening,
//         nip: item.nip,
//         statusPegawai: item.statusPegawai,
//         idByNominal: item.idByNominal,
//         statusPotongan: item.statusPotongan,
//         potongan: item.potongan,
//         pgri: parseFloat(item.pgri) || 0,
//         sanduka: parseFloat(item.sanduka) || 0,
//         daspen: parseFloat(item.daspen) || 0,
//         derap: parseFloat(item.derap) || 0,
//         kalender: parseFloat(item.kalender) || 0,
//         sumbangan: parseFloat(item.lainLain) || 0,
//         totalIuran: parseFloat(item.totalIuran) || 0,
//         lastUpdatedAtIuranAnggota: item.lastUpdatedAtIuranAnggota,
//       });

//       acc[unitKey].jumlah += 1;
//       acc[unitKey].pgri += parseFloat(item.pgri) || 0;
//       acc[unitKey].sanduka += parseFloat(item.sanduka) || 0;
//       acc[unitKey].daspen += parseFloat(item.daspen) || 0;
//       acc[unitKey].derap += parseFloat(item.derap) || 0;
//       acc[unitKey].kalender += parseFloat(item.kalender) || 0;
//       acc[unitKey].sumbangan += parseFloat(item.lainLain) || 0;
//       acc[unitKey].totalIuran += parseFloat(item.totalIuran) || 0;

//       if (Array.isArray(item.iuranSumbanganList)) {
//         item.iuranSumbanganList.forEach((s) => {
//           if (!acc[unitKey].sumbanganDetail[s.jenis]) {
//             acc[unitKey].sumbanganDetail[s.jenis] = 0;
//           }
//           acc[unitKey].sumbanganDetail[s.jenis] += s.jumlah;
//         });
//       }

//       return acc;
//     }, {});

//     return Object.values(grouped);
//   };

//   const fetchInitialData = useCallback(async () => {
//     try {
//       const storedRole = sessionStorage.getItem("role");
//       const storedCabang = sessionStorage.getItem("cabang");

//       const bulan = selectedBulan;
//       const tahun = selectedTahun;

//       let response;

//       if (storedRole === "ADMIN" && storedCabang) {
//         setIsAdmin(true);
//         setSelectedCabang(storedCabang);
//         response = await GlobalApi.getNominalAggregatedData(
//           storedCabang,
//           null,
//           null,
//           bulan,
//           tahun
//         );
//       } else {
//         response = await GlobalApi.getNominalAggregatedData(
//           "",
//           null,
//           null,
//           bulan,
//           tahun
//         );
//       }

//       // 📌 Proses data untuk mengambil yang terbaru per npaPgri
//       // Opsional: ganti null dengan npaPgri spesifik contoh "33200806435"
//       // Ganti true dengan false jika ingin berdasarkan idByNominal terbesar
//       response = processApiResponse(response, null, true);

//       const totalRow = response.find(
//         (item) => item.cabang === "Total" && !item.unitKerja
//       );
//       const regularData = response.filter(
//         (item) => !(item.cabang === "Total" && !item.unitKerja)
//       );

//       if (totalRow) {
//         setGrandTotals({
//           jumlah: parseInt(totalRow.jumlah) || 0,
//           pgri: parseFloat(totalRow.pgri) || 0,
//           sanduka: parseFloat(totalRow.sanduka) || 0,
//           daspen: parseFloat(totalRow.daspen) || 0,
//           derap: parseFloat(totalRow.derap) || 0,
//           kalender: parseFloat(totalRow.kalender) || 0,
//           lainlain: parseFloat(totalRow.lainlain) || 0,
//           totalIuran: parseFloat(totalRow.totalIuran) || 0,
//         });
//       }

//       const processed = processData(regularData);
//       setGroupedData(processed);
//       setData(regularData);
//       setOriginalRekapData(regularData);
//       // const allUnits = new Set(
//       //   processed.map((group) => group.unitKerja || "Tidak Ada Unit Kerja")
//       // );
//       // setExpandedRows(allUnits);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching initial data:", error);
//       setLoading(false);
//     }
//   }, [unitKerjaList, selectedBulan, selectedTahun]);

//   useEffect(() => {
//     fetchInitialData();
//     fetchNoRekening();
//   }, [fetchInitialData]);

//   const fetchNoRekening = async () => {
//     try {
//       const data = await GlobalApi.getNoRekening();
//       setListNoRekening(data);
//     } catch (error) {
//       console.error("Gagal ambil daftar nomor rekening:", error);
//     }
//   };

//   useEffect(() => {
//     if (lastUpdatedMemberRef.current) {
//       lastUpdatedMemberRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }
//   }, [lastUpdatedMemberNip]);

//   const handleNamaAnggotaInputChange = (e) => {
//     setNamaAnggotaInput(e.target.value);
//   };

//   const handleSearchClick = () => {
//     setSearchQuery(namaAnggotaInput);
//     performSearch(namaAnggotaInput);
//   };

//   const performSearch = (query) => {
//     if (query === "") {
//       let filteredData = originalRekapData;

//       if (selectedCabang) {
//         filteredData = filteredData.filter(
//           (item) => item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
//         );
//       }

//       if (selectedUnitKerja) {
//         filteredData = filteredData.filter(
//           (item) =>
//             item.unitKerja?.toLowerCase() === selectedUnitKerja.toLowerCase()
//         );
//       }

//       const processed = processData(filteredData);
//       setGroupedData(processed);
//       setData(filteredData);
//       calculateTotals(filteredData);
//       setExpandedRows(new Set());
//       // const allUnits = new Set(
//       //   processed.map((group) => group.unitKerja || "Tidak Ada Unit Kerja")
//       // );
//       // setExpandedRows(allUnits);
//     } else {
//       const filteredData = originalRekapData.filter(
//         (item) =>
//           (!selectedCabang ||
//             item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
//           (!selectedUnitKerja ||
//             item.unitKerja?.toLowerCase() ===
//               selectedUnitKerja.toLowerCase()) &&
//           item.namaAnggota?.toLowerCase().includes(query.toLowerCase())
//       );

//       const processed = processData(filteredData);
//       setGroupedData(processed);
//       setData(filteredData);
//       calculateTotals(filteredData);

//       const unitsWithMatches = new Set(
//         filteredData.map((item) => item.unitKerja || "Tidak Ada Unit Kerja")
//       );
//       setExpandedRows(unitsWithMatches);
//     }
//   };

//   useEffect(() => {
//     if (!isPopupVisible && namaInputRef.current) {
//       namaInputRef.current.focus();
//     }
//   }, [isPopupVisible]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (cabangRef.current && !cabangRef.current.contains(event.target)) {
//         setShowCabangDropdown(false);
//       }
//       if (
//         unitKerjaRef.current &&
//         !unitKerjaRef.current.contains(event.target)
//       ) {
//         setShowUnitKerjaDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         unitKerjaRef.current &&
//         !unitKerjaRef.current.contains(event.target)
//       ) {
//         setShowUnitKerjaDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const toggleExpand = (unitKerja) => {
//     setExpandedRows((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(unitKerja)) {
//         newSet.delete(unitKerja);
//       } else {
//         newSet.add(unitKerja);
//       }
//       return newSet;
//     });
//   };

//   const calculateTotals = (dataArray) => {
//     const newTotals = dataArray.reduce(
//       (acc, item) => ({
//         jumlah: acc.jumlah + (parseInt(item.jumlah) || 0),
//         pgri: acc.pgri + (parseFloat(item.pgri) || 0),
//         sanduka: acc.sanduka + (parseFloat(item.sanduka) || 0),
//         daspen: acc.daspen + (parseFloat(item.daspen) || 0),
//         iuran: acc.iuran + (parseFloat(item.totalIuran) || 0),
//       }),
//       {
//         jumlah: 0,
//         pgri: 0,
//         sanduka: 0,
//         daspen: 0,
//         iuran: 0,
//       }
//     );
//     setTotals(newTotals);
//   };

//   const [grandTotals, setGrandTotals] = useState({
//     jumlah: 0,
//     pgri: 0,
//     sanduka: 0,
//     daspen: 0,
//     derap: 0,
//     kalender: 0,
//     lainlain: 0,
//     totalIuran: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       const pgriResponse = await GlobalApi.getDefaultIuranById(2);
//       const daspenResponse = await GlobalApi.getDefaultIuranById(4);
//       const derapResponse = await GlobalApi.getDefaultIuranById(3);
//       const kalenderResponse = await GlobalApi.getDefaultIuranById(1);

//       sessionStorage.setItem("PGRIData", JSON.stringify(pgriResponse));
//       sessionStorage.setItem("daspenData", JSON.stringify(daspenResponse));
//       sessionStorage.setItem("derapData", JSON.stringify(derapResponse));
//       sessionStorage.setItem("kalenderData", JSON.stringify(kalenderResponse));

//       const response = {
//         pgri: pgriResponse,
//         daspen: daspenResponse,
//         derap: derapResponse,
//         kalender: kalenderResponse,
//       };

//       setDefaultIuran(response);

//       const total = {
//         propinsi:
//           parseInt(kalenderResponse.propinsi || 0) +
//           parseInt(derapResponse.propinsi || 0),
//         kabupaten:
//           parseInt(kalenderResponse.kabupaten || 0) +
//           parseInt(derapResponse.kabupaten || 0),
//         cabang:
//           parseInt(kalenderResponse.cabang || 0) +
//           parseInt(derapResponse.cabang || 0),
//       };

//       setTotalIuranWilayah(total);
//       const pgriTotal =
//         parseInt(pgriResponse.pb || 0) +
//         parseInt(pgriResponse.propinsi || 0) +
//         parseInt(pgriResponse.kabupaten || 0) +
//         parseInt(pgriResponse.cabang || 0) +
//         parseInt(pgriResponse.sanduka || 0);
//     };

//     const kalenderData = sessionStorage.getItem("kalenderData");
//     const derapData = sessionStorage.getItem("derapData");

//     if (kalenderData && derapData) {
//       const kalender = JSON.parse(kalenderData);
//       const derap = JSON.parse(derapData);

//       const total = {
//         propinsi:
//           parseInt(kalender.propinsi || 0) + parseInt(derap.propinsi || 0),
//         kabupaten:
//           parseInt(kalender.kabupaten || 0) + parseInt(derap.kabupaten || 0),
//         cabang: parseInt(kalender.cabang || 0) + parseInt(derap.cabang || 0),
//       };

//       setTotalIuranWilayah(total);
//     } else {
//       fetchData();
//     }
//   }, []);

//   const handlePrintClick = async (member) => {
//     const daspenFromMember = member.daspen ? parseInt(member.daspen) : 0;
//     setDaspenValue(daspenFromMember);
//     setIsModalOpen(false);

//     try {
//       const response = await GlobalApi.cekNpaList([member.npaPgri]);

//       setSelectedMember(member);
//       setDataNpa(response[0]);

//       if (response[0].foto) {
//         try {
//           const decodedString = atob(response[0].foto);
//           setFotoBase64(decodedString);
//         } catch (error) {
//           console.error("Error decoding Base64:", error);
//           setFotoBase64(null);
//         }
//       }

//       try {
//         const iuranResponse = await GlobalApi.getIuranAnggota(member.npaPgri);
//         setDataIuran(iuranResponse);
//       } catch (error) {
//         console.error("Gagal mengambil data iuran anggota:", error);

//         if (error.response?.status === 500) {
//           console.warn(
//             "Server error 500: menggunakan nilai default dari sessionStorage"
//           );

//           const pgriData = JSON.parse(sessionStorage.getItem("PGRIData"));
//           const totalIuranPGRI =
//             parseInt(pgriData.pb || 0) +
//             parseInt(pgriData.propinsi || 0) +
//             parseInt(pgriData.kabupaten || 0) +
//             parseInt(pgriData.cabang || 0);

//           const fallbackData = {
//             iuranAnggota: totalIuranPGRI,
//             manualIuranAnggota: 0,
//             totalIuranAnggota: totalIuranPGRI,
//             iuranSanduka: parseInt(pgriData.sanduka || 0),
//             manualIuranSanduka: 0,
//             totalIuranSanduka: parseInt(pgriData.sanduka || 0),
//             iuranDaspen: daspenFromMember,
//             manualIuranDaspen: 0,
//             totalIuranDaspen: daspenFromMember,
//           };

//           setDataIuran(fallbackData);
//         }
//       }

//       setIsModalOpen(true);
//     } catch (error) {
//       console.error("Error saat cek NPA:", error);
//       if (error.response?.status === 500) {
//         console.warn("Server error 500: data tidak akan ditampilkan.");
//       }
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedMember(null);
//   };
//   const closePopup = () => {
//     setIsPopupVisible(false);
//     setAddedCategories([]);
//     setManualInputs([]);
//     setResetKeys([]);
//     setSelectedKategori([]);
//   };
//   const handleCloseModal = () => {
//     setShowUploadModal(false);
//   };

//   const [formData, setFormData] = useState({
//     file: null,
//     namaFile: "",
//     tanggalUntuk: "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "file") {
//       setFormData((prev) => ({ ...prev, file: files[0] }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleMemberClick = async (member) => {
//     const daspenFromMember = member.daspen ? parseInt(member.daspen) : 0;
//     setDaspenValue(daspenFromMember);

//     setNipValue(member.nip);
//     setSelectedMember(null);
//     setDataNpa(null);
//     setFotoBase64(null);
//     setDataIuran(null);
//     setIsPopupVisible(false);
//     setIdIuran(null);
//     setNotifDaspen(null);
//     setNomorRekening("");
//     setNominalBaruList({});
//     setResetKeys([]);
//     setAddedCategories([]);
//     setManualInputs({});
//     setStatusPegawai(member.statusPegawai || null);
// console.log("📌 Member clicked:", member);
//     try {
//       const fileResponse = await GlobalApi.getFileByNip(member.nip);
//       if (fileResponse?.sumbangan) {
//         setDaspenValue(parseInt(fileResponse.sumbangan));
//       }
//       setNotifDaspen(fileResponse?.dataDaspen === true);
//     } catch (error) {
//       console.error("❌ Gagal mengambil file by NIP:", error);
//     }

//     try {
//       const response = await GlobalApi.cekNpaList([member.npaPgri]);
//       setSelectedMember(member);
//       setDataNpa(response[0]);

//       if (response[0]?.foto) {
//         try {
//           const decodedString = atob(response[0].foto);
//           setFotoBase64(decodedString);
//         } catch (error) {
//           console.error("❌ Error decoding Base64:", error);
//           setFotoBase64(null);
//         }
//       }

//       const dataIuran = await GlobalApi.getByIdByNominal(member.idByNominal);
//       console.log("📦 Data Iuran by NPA:", dataIuran);

//       setDataIuran(dataIuran);
//       setIdIuran(dataIuran.id || null);
//       setNomorRekening(dataIuran.nomorRekening || "");

//       const manualValues = {};
//       const manualKeys = [
//         "Pgri",
//         "Sanduka",
//         "Daspen",
//         "Derap",
//         "Kalender",
//         "LainLain",
//       ];

//       manualKeys.forEach((key) => {
//         const manualKey = `manual${key}`;
//         if (dataIuran[manualKey] && dataIuran[manualKey] > 0) {
//           manualValues[`manual${key.toLowerCase()}`] =
//             dataIuran[manualKey] || 0;
//         }
//       });

//       setNominalBaruList(manualValues);

//       if (
//         dataIuran?.iuranSumbanganList &&
//         Array.isArray(dataIuran.iuranSumbanganList)
//       ) {
//         setSumbanganList(dataIuran.iuranSumbanganList);
//       } else {
//         setSumbanganList([]);
//       }

//       setIsPopupVisible(true);
//     } catch (error) {
//       console.error("❌ Gagal mengambil data iuran anggota:", error);
//     }
//   };

//   const handleTagihanClick = async (member) => {
//     const npa = member?.npaPgri?.trim();

//     if (!npa) {
//       console.error("NPA tidak ditemukan!");
//       return;
//     }

//     try {
//       const response = await GlobalApi.cekNpa(npa);

//       if (response?.id) {
//         sessionStorage.setItem("idTagihan", response.id);
//         router.push("/anggota/rekap-anggota/tagihanByAdmin");
//       } else {
//         console.warn("ID tidak ditemukan dalam respons.");
//       }
//     } catch (error) {
//       console.error("Gagal mendapatkan ID dari NPA:", error);
//     }
//   };

//   const groupIuranData = (dataIuran) => {
//     if (!dataIuran) return [];

//     const keyMap = [
//       { key: "anggota", apiKey: "Pgri" },
//       { key: "sanduka", apiKey: "Sanduka" },
//       { key: "daspen", apiKey: "Daspen" },
//       { key: "derap", apiKey: "Derap" },
//       { key: "kalender", apiKey: "Kalender" },
//       { key: "lainlain", apiKey: "LainLain" },
//     ];

//     let result = keyMap
//       .map(({ key, apiKey }) => {
//         return {
//           key,
//           iuran: dataIuran[`default${apiKey}`] || 0,
//           manual: dataIuran[`manual${apiKey}`] || 0,
//           total: dataIuran[`${apiKey.toLowerCase()}`] || 0,
//         };
//       })
//       .filter(
//         (item) =>
//           item.iuran !== undefined && (item.iuran > 0 || item.manual > 0)
//       );

//     if (Array.isArray(dataIuran.iuranSumbanganList)) {
//       const sumbanganItems = dataIuran.iuranSumbanganList.map((sumb) => ({
//         key: sumb.jenis,
//         iuran: sumb.jumlah,
//         manual: 0,
//         total: sumb.jumlah,
//         isSumbanganDetail: true,
//       }));

//       result = [...result, ...sumbanganItems];
//     }

//     return result;
//   };

//   useEffect(() => {
//     if (dataIuran) {
//       const defaultNominalBaru = {};

//       const keyMap = [
//         { frontendKey: "anggota", apiKey: "Pgri" },
//         { frontendKey: "sanduka", apiKey: "Sanduka" },
//         { frontendKey: "daspen", apiKey: "Daspen" },
//         { frontendKey: "derap", apiKey: "Derap" },
//         { frontendKey: "kalender", apiKey: "Kalender" },
//         { frontendKey: "lainlain", apiKey: "LainLain" },
//       ];

//       keyMap.forEach(({ frontendKey, apiKey }) => {
//         const manualValue = dataIuran[`manual${apiKey}`] || 0;
//         defaultNominalBaru[frontendKey] = manualValue;
//       });

//       setNominalBaruList(defaultNominalBaru);
//     }
//   }, [dataIuran]);

//   const groupedIuran = dataIuran ? groupIuranData(dataIuran) : [];

//   const handleSave = async () => {
//     if (selectedKategori) {
//       const uniqueKey =
//         selectedKategori === "lainlain" && selectedKeterangan
//           ? `${selectedKeterangan}`
//           : selectedKategori === "pgri"
//           ? "anggota"
//           : selectedKategori;

//       if (!addedCategories.find((cat) => cat.key === uniqueKey)) {
//         const labelMap = {
//           iuran: "Iuran",
//           derap: "Derap",
//           kalender: "Kalender",
//           lainlain: "Lain-Lain",
//           daspen: "Daspen",
//           pgri: "Anggota",
//           sanduka: "Sanduka",
//         };

//         let initialValue = 0;

//         if (selectedKategori === "kalender") {
//           const kalenderRaw = sessionStorage.getItem("kalenderData");
//           if (kalenderRaw) {
//             try {
//               const kalenderObj = JSON.parse(kalenderRaw);
//               const propinsi = parseInt(kalenderObj.propinsi || 0);
//               const kabupaten = parseInt(kalenderObj.kabupaten || 0);
//               const cabang = parseInt(kalenderObj.cabang || 0);
//               initialValue = propinsi + kabupaten + cabang;
//             } catch (e) {
//               console.error("Error parsing kalenderData:", e);
//             }
//           }
//         }

//         if (selectedKategori === "derap") {
//           const derapRaw = sessionStorage.getItem("derapData");
//           if (derapRaw) {
//             try {
//               const derapObj = JSON.parse(derapRaw);
//               const propinsi = parseInt(derapObj.propinsi || 0);
//               const kabupaten = parseInt(derapObj.kabupaten || 0);
//               const cabang = parseInt(derapObj.cabang || 0);
//               initialValue = propinsi + kabupaten + cabang;
//             } catch (e) {
//               console.error("Error parsing derapData:", e);
//             }
//           }
//         }

//         if (selectedKategori === "lainlain" && selectedKeterangan) {
//           try {
//             const response = await GlobalApi.getLainlain(selectedKeterangan);

//             const matchingItem = response.find(
//               (item) =>
//                 item.keterangan.toLowerCase() ===
//                 selectedKeterangan.toLowerCase()
//             );

//             if (matchingItem) {
//               const jumlah = parseInt(matchingItem.jumlahNominal || 0);
//               initialValue = jumlah;
//             } else {
//               console.warn(
//                 "Tidak ditemukan data dengan keterangan:",
//                 selectedKeterangan
//               );
//             }
//           } catch (error) {
//             console.error("Gagal mengambil data lain-lain:", error);
//           }
//         }

//         if (selectedKategori === "daspen") {
//           initialValue = parseInt(daspenValue || 0);
//         }
//         if (selectedKategori === "pgri") {
//           initialValue = 8000;
//         }

//         if (selectedKategori === "sanduka") {
//           initialValue = 3000;
//         }
//         setAddedCategories((prev) => [
//           ...prev,
//           {
//             label: labelMap[selectedKategori],
//             key: uniqueKey,
//             ...(selectedKategori === "lainlain" && selectedKeterangan
//               ? { keterangan: selectedKeterangan }
//               : {}),
//           },
//         ]);

//         setNewValues((prev) => ({
//           ...prev,
//           [uniqueKey]: initialValue,
//         }));

//         setFormKetiga((prev) => ({
//           ...prev,
//           [uniqueKey]: initialValue,
//         }));
//       }

//       setSelectedKategori("");
//       setSelectedKeterangan("");
//       setShowDropdown(false);
//     }
//   };

//   const handleDeleteSumbangan = (sumbanganJenis) => {
//     setSumbanganList((prev) =>
//       prev.map((item) =>
//         item.jenis === sumbanganJenis ? { ...item, jumlah: 0 } : item
//       )
//     );
//   };

//   const handleSaveClick = async () => {
//     if (!dataNpa) return;

//     const tempatTanggalLahir = `${dataNpa.tempatLahir}, ${dataNpa.tanggalLahir?.[2]}-${dataNpa.tanggalLahir?.[1]}-${dataNpa.tanggalLahir?.[0]}`;

//     let otomatisValueSanduka = 0;
//     let otomatisValuePgri = 0;
//     let otomatisValueDaspen = 0;

//     let manualValueSanduka = 0;
//     let manualValuepgri = 0;
//     let manualValueDaspen = 0;

//     let iuranSanduka = 0;
//     let iuranDaspen = 0;
//     let iuranAnggota = formKetiga?.iuranAnggota || 0;

//     groupedIuran.forEach((item) => {
//       const autoValue = parseInt(item.iuran || 0);
//       const inputValue = nominalBaruList[item.key] ?? 0;

//       if ((item.key || "").toLowerCase() === "sanduka") {
//         otomatisValueSanduka = autoValue;
//         manualValueSanduka = inputValue;
//         iuranSanduka = autoValue + inputValue;
//       }
//       if ((item.key || "").toLowerCase() === "anggota") {
//         otomatisValuePgri = autoValue;
//         manualValuepgri = inputValue;
//         iuranAnggota = autoValue + inputValue;
//       }
//       if ((item.key || "").toLowerCase() === "daspen") {
//         otomatisValueDaspen = autoValue;
//         manualValueDaspen = inputValue;
//         iuranDaspen = autoValue + inputValue;
//       }
//     });

//     let otomatisValueKalender = 0;
//     let otomatisValueDerap = 0;

//     let manualValueKalender = 0;
//     let manualValueDerap = 0;

//     let totalKalender = 0;
//     let iuranDerap = formKetiga?.iuranDerap || 0;

//     let iuranSumbanganList = [];
//     let manualValueLainLain = 0;
//     let totalIuranLainLain = 0;

//     if (dataIuran?.iuranSumbanganList?.length > 0) {
//       iuranSumbanganList = dataIuran.iuranSumbanganList.map((item) => ({
//         jenis: item.jenis,
//         jumlah: item.jumlah,
//       }));
//       totalIuranLainLain = dataIuran.totalIuranSumbangan || 0;
//     }

//     addedCategories.forEach((item) => {
//       const keyLower = item.key?.toLowerCase();
//       const oldValue = parseInt(newValues[item.key] || 0);
//       const inputValue = parseInt(manualInputs[item.key] || 0);
//       const totalValue = oldValue + inputValue;

//       if (totalValue <= 0) return;

//       if (keyLower === "kalender") {
//         otomatisValueKalender = oldValue;
//         manualValueKalender = inputValue;
//         totalKalender = totalValue;
//       } else if (keyLower === "derap") {
//         otomatisValueDerap = oldValue;
//         manualValueDerap = inputValue;
//         iuranDerap = totalValue;
//       } else if (keyLower === "sanduka") {
//         if (iuranSanduka === 0) {
//           otomatisValueSanduka = oldValue;
//           manualValueSanduka = inputValue;
//           iuranSanduka = totalValue;
//         }
//       } else if (keyLower === "anggota") {
//         if (iuranAnggota === 0) {
//           otomatisValuePgri = oldValue;
//           manualValuepgri = inputValue;
//           iuranAnggota = totalValue;
//         }
//       } else if (keyLower === "daspen") {
//         if (iuranDaspen === 0) {
//           otomatisValueDaspen = oldValue;
//           manualValueDaspen = inputValue;
//           iuranDaspen = totalValue;
//         }
//       } else {
//         iuranSumbanganList.push({
//           jenis: item.keterangan || item.label,
//           jumlah: totalValue,
//         });
//         manualValueLainLain += inputValue;
//         totalIuranLainLain += totalValue;
//       }
//     });

//     const payload = {
//       namaAnggota: dataNpa.namaLengkap,
//       tempatTanggalLahir: tempatTanggalLahir,
//       npa: dataNpa.npa,
//       nip: dataNpa.nip || "-",
//       nik: dataNpa.nik,
//       cabang: dataNpa.cabang,
//       unitKerja: dataNpa.unitKerja,
//       jabatan: dataNpa.jabatan,
//       nomorRekening: nomorRekening,

//       iuranAnggota: otomatisValuePgri || 0,
//       manualIuranAnggota: manualValuepgri || 0,
//       totalIuranAnggota: iuranAnggota || 0,

//       iuranSanduka: otomatisValueSanduka || 0,
//       manualIuranSanduka: manualValueSanduka || 0,
//       totalIuranSanduka: iuranSanduka || 0,

//       iuranDaspen: otomatisValueDaspen || 0,
//       manualIuranDaspen: manualValueDaspen || 0,
//       totalIuranDaspen: iuranDaspen || 0,

//       iuranDerap: otomatisValueDerap || 0,
//       manualIuranDerap: manualValueDerap || 0,
//       totalIuranDerap: iuranDerap || 0,

//       iuranKalender: otomatisValueKalender || 0,
//       manualIuranKalender: manualValueKalender || 0,
//       totalIuranKalender: totalKalender || 0,

//       iuranSumbanganList: iuranSumbanganList,
//       manualIuranSumbangan: manualValueLainLain || 0,
//       totalIuranSumbangan: totalIuranLainLain || 0,
//     };

//     try {
//       if (nomorRekening && nomorRekening.trim() !== "") {
//         const rekeningBaru = nomorRekening.trim();
//         const rekeningLama = selectedMember?.nomorRekening?.trim();

//         const rekeningSudahTerdaftar = listNoRekening.includes(rekeningBaru);
//         const samaDenganYangLama = rekeningBaru === rekeningLama;

//         if (rekeningSudahTerdaftar && !samaDenganYangLama) {
//           setNotification({
//             type: "error",
//             message: "Nomor rekening sudah digunakan oleh anggota lain.",
//           });
//           return;
//         }
//       }
//       const response = await GlobalApi.postIuranAnggota(payload);
//       await fetchInitialData();
//       setNotification({
//         type: "success",
//         message: "Data berhasil disimpan!",
//       });

//       setIsPopupVisible(false);
//       setAddedCategories([]);
//       setManualInputs([]);
//       setSelectedKategori("");
//       setLastUpdatedMemberNip(dataNpa.nip);
//     } catch (error) {
//       console.error("Gagal simpan:", error);

//       setNotification({
//         type: "error",
//         message: "Gagal menyimpan data. Silakan coba lagi.",
//       });
//     }
//   };

//   const handleUpdateClick = async () => {
//     if (!dataNpa) return;

//     try {
//       const tagihanUntukBulan = `${selectedYear}-${selectedMonth
//         .toString()
//         .padStart(2, "0")}-01`;

//       const payload = {
//         namaAnggota: dataNpa.namaLengkap,
//         nip: dataNpa.nip,
//         npa: dataNpa.npaPgri,
//         nomorRekening: nomorRekening ? parseInt(nomorRekening) : null,
//         cabang: dataNpa.cabang,
//         unitKerja: dataNpa.unitKerja,
//         statusPegawai: statusPegawai,

//         iuranAnggota: 0,
//         manualIuranAnggota: 0,
//         totalIuranAnggota: 0,

//         iuranSanduka: 0,
//         manualIuranSanduka: 0,
//         totalIuranSanduka: 0,

//         iuranDaspen: 0,
//         manualIuranDaspen: 0,
//         totalIuranDaspen: 0,

//         iuranDerap: 0,
//         manualIuranDerap: 0,
//         totalIuranDerap: 0,

//         iuranKalender: 0,
//         manualIuranKalender: 0,
//         totalIuranKalender: 0,

//         manualIuranSumbangan: 0,
//         iuranSumbanganList: [],
//       };

//       groupedIuran.forEach((item) => {
//         const key = item.key;
//         const isReset = resetKeys.includes(key);
//         const iuran = isReset ? 0 : parseInt(item.iuran || 0);
//         const manual = isReset
//           ? 0
//           : parseInt(
//               nominalBaruList[`manual${key}`] || nominalBaruList[key] || 0
//             );
//         const total = iuran + manual;

//         if (key === "pgri" || key === "anggota") {
//           payload.iuranAnggota = iuran;
//           payload.manualIuranAnggota = manual;
//           payload.totalIuranAnggota = total;
//         } else if (key === "sanduka") {
//           payload.iuranSanduka = iuran;
//           payload.manualIuranSanduka = manual;
//           payload.totalIuranSanduka = total;
//         } else if (key === "daspen") {
//           payload.iuranDaspen = iuran;
//           payload.manualIuranDaspen = manual;
//           payload.totalIuranDaspen = total;
//         } else if (key === "derap") {
//           payload.iuranDerap = iuran;
//           payload.manualIuranDerap = manual;
//           payload.totalIuranDerap = total;
//         } else if (key === "kalender") {
//           payload.iuranKalender = iuran;
//           payload.manualIuranKalender = manual;
//           payload.totalIuranKalender = total;
//         }
//       });

//       let manualSumbanganTotal = 0;
//       const updatedSumbanganList = [];

//       if (sumbanganList && Array.isArray(sumbanganList)) {
//         sumbanganList.forEach((sumbangan) => {
//           if (sumbangan.jenis) {
//             updatedSumbanganList.push({
//               jenis: sumbangan.jenis,
//               jumlah: parseInt(sumbangan.jumlah || 0),
//             });
//           }
//         });
//       }

//       addedCategories.forEach((category) => {
//         const oldValue = parseInt(newValues[category.key] || 0);
//         const manualValue = parseInt(manualInputs[category.key] || 0);
//         const totalValue = oldValue + manualValue;

//         let jenis = "";

//         if (category.keterangan) {
//           jenis = category.keterangan;
//         } else if (category.label) {
//           jenis = category.label;
//         } else {
//           jenis = category.key;
//         }

//         const isRegularIuran = [
//           "pgri",
//           "anggota",
//           "sanduka",
//           "daspen",
//           "derap",
//           "kalender",
//         ].includes(category.key);

//         // ✅ PERBAIKAN: Proses iuran reguler (derap, kalender, dll)
//         if (isRegularIuran) {
//           if (category.key === "pgri" || category.key === "anggota") {
//             payload.iuranAnggota = oldValue;
//             payload.manualIuranAnggota = manualValue;
//             payload.totalIuranAnggota = totalValue;
//           } else if (category.key === "sanduka") {
//             payload.iuranSanduka = oldValue;
//             payload.manualIuranSanduka = manualValue;
//             payload.totalIuranSanduka = totalValue;
//           } else if (category.key === "daspen") {
//             payload.iuranDaspen = oldValue;
//             payload.manualIuranDaspen = manualValue;
//             payload.totalIuranDaspen = totalValue;
//           } else if (category.key === "derap") {
//             payload.iuranDerap = oldValue;
//             payload.manualIuranDerap = manualValue;
//             payload.totalIuranDerap = totalValue;
//           } else if (category.key === "kalender") {
//             payload.iuranKalender = oldValue;
//             payload.manualIuranKalender = manualValue;
//             payload.totalIuranKalender = totalValue;
//           }
//         }
//         // ✅ Proses yang bukan iuran reguler (sumbangan)
//         else if (jenis) {
//           const existingIndex = updatedSumbanganList.findIndex(
//             (item) => item.jenis === jenis
//           );

//           if (existingIndex === -1) {
//             updatedSumbanganList.push({
//               jenis: jenis,
//               jumlah: totalValue,
//                cabang: payload.cabang,
//               tagihanUntukBulan: tagihanUntukBulan,
//             });
//           } else {
//             updatedSumbanganList[existingIndex].jumlah = totalValue;
//           }

//           manualSumbanganTotal += manualValue;
//         }
//       });

//       Object.keys(nominalBaruList).forEach((key) => {
//         const nominalValue = parseInt(nominalBaruList[key] || 0);

//         if (
//           ![
//             "pgri",
//             "sanduka",
//             "daspen",
//             "derap",
//             "kalender",
//             "anggota",
//           ].includes(key) &&
//           !key.startsWith("manualpgri") &&
//           !key.startsWith("manualsanduka") &&
//           !key.startsWith("manualdaspen") &&
//           !key.startsWith("manualderap") &&
//           !key.startsWith("manualkalender") &&
//           !key.startsWith("manualanggota")
//         ) {
//           const category = addedCategories.find((cat) => cat.key === key);
//           if (category) {
//             let jenis = "";

//             if (category.keterangan) {
//               jenis = category.keterangan;
//             } else if (category.label) {
//               jenis = category.label;
//             } else {
//               jenis = category.key;
//             }

//             if (jenis) {
//               const existingIndex = updatedSumbanganList.findIndex(
//                 (item) => item.jenis === jenis
//               );

//               if (existingIndex === -1) {
//                 updatedSumbanganList.push({
//                   jenis: jenis,
//                   jumlah: nominalValue,
//                    cabang: payload.cabang,
//                   tagihanUntukBulan: tagihanUntukBulan,
//                 });
//               } else {
//                 updatedSumbanganList[existingIndex].jumlah = nominalValue;
//               }

//               manualSumbanganTotal += nominalValue;
//             }
//           }
//         }
//       });

//       payload.manualIuranSumbangan = manualSumbanganTotal;

//       payload.iuranSumbanganList = updatedSumbanganList.filter(
//         (item) => item.jumlah > 0
//       );

//       // console.log(statusPegawai);
//       console.log("Payload Lengkap:", JSON.parse(JSON.stringify(payload)));
      
//       if (idIuran) {
//         await GlobalApi.updateByNominalByBulan(
//           dataNpa.nip,
//           tagihanUntukBulan,
//           payload
//         );
//       } else {
//         await GlobalApi.createByNominal(payload);
//       }

//       // Optimistic update - update state lokal tanpa fetch ulang semua data
//       const updatedMemberData = {
//         namaAnggota: payload.namaAnggota,
//         nip: payload.nip,
//         npaPgri: payload.npa,
//         nomorRekening: payload.nomorRekening,
//         cabang: payload.cabang,
//         unitKerja: payload.unitKerja,
//         statusPegawai: payload.statusPegawai,
//         pgri: payload.totalIuranAnggota,
//         sanduka: payload.totalIuranSanduka,
//         daspen: payload.totalIuranDaspen,
//         derap: payload.totalIuranDerap,
//         kalender: payload.totalIuranKalender,
//         lainLain: payload.manualIuranSumbangan,
//         totalIuran:
//           payload.totalIuranAnggota +
//           payload.totalIuranSanduka +
//           payload.totalIuranDaspen +
//           payload.totalIuranDerap +
//           payload.totalIuranKalender +
//           payload.manualIuranSumbangan,
//         iuranSumbanganList: payload.iuranSumbanganList,
//         lastUpdatedAtIuranAnggota: new Date().toISOString(),
//       };

//       // Update originalRekapData
//       setOriginalRekapData((prevData) => {
//         const newData = prevData.map((item) =>
//           item.nip === dataNpa.nip ? { ...item, ...updatedMemberData } : item
//         );
//         // Jika data baru (create), tambahkan ke array
//         if (!idIuran && !prevData.find((item) => item.nip === dataNpa.nip)) {
//           newData.push(updatedMemberData);
//         }
//         return newData;
//       });

//       // Update data dan groupedData
//       setData((prevData) => {
//         const newData = prevData.map((item) =>
//           item.nip === dataNpa.nip ? { ...item, ...updatedMemberData } : item
//         );
//         if (!idIuran && !prevData.find((item) => item.nip === dataNpa.nip)) {
//           newData.push(updatedMemberData);
//         }
//         // Update groupedData berdasarkan data baru
//         const processed = processData(newData);
//         setGroupedData(processed);
//         return newData;
//       });

//       setNotification({
//         type: "success",
//         message: `Data berhasil diupdate untuk periode ${selectedMonth
//           .toString()
//           .padStart(2, "0")}-${selectedYear}!`,
//       });

//       setIsPopupVisible(false);
//       setResetKeys([]);
//       setAddedCategories([]);
//       setNewValues({});
//       setManualInputs({});
//       setNominalBaruList({});
//       setSelectedKategori("");
//       setSelectedKeterangan("");
//       setLastUpdatedMemberNip(dataNpa.nip);
//     } catch (error) {
//       console.error("Gagal update data:", error);
//       console.error("Error details:", error.response?.data);
//       setNotification({
//         type: "error",
//         message: "Gagal update data. Silakan coba lagi.",
//       });
//     }
//   };

//   // const handleUpdateClick = async () => {
//   //   if (!dataNpa || !idIuran) return;

//   //   try {
//   //     const rekeningSudahTerdaftar =
//   //       listNoRekening.includes(nomorRekening.trim()) &&
//   //       nomorRekening.trim() !== (dataIuran?.nomorRekening?.trim() || "");

//   //     if (rekeningSudahTerdaftar) {
//   //       setNotification({
//   //         type: "error",
//   //         message: "Nomor rekening sudah digunakan oleh anggota lain.",
//   //       });
//   //       return;
//   //     }

//   //     const payload = {
//   //       namaAnggota: dataNpa.namaLengkap,
//   //       tempatTanggalLahir: `${dataNpa.tempatLahir}, ${dataNpa.tanggalLahir?.[2]}-${dataNpa.tanggalLahir?.[1]}-${dataNpa.tanggalLahir?.[0]}`,
//   //       npa: dataNpa.npaPgri,
//   //       nip: dataNpa.nip,
//   //       nik: dataNpa.nik,
//   //       cabang: dataNpa.cabang,
//   //       unitKerja: dataNpa.unitKerja,
//   //       jabatan: dataNpa.jabatan,
//   //       nomorRekening: nomorRekening || "",
//   //     };

//   //     const capitalizeFirstLetter = (string) =>
//   //       string.charAt(0).toUpperCase() + string.slice(1);

//   //     groupedIuran.forEach((item) => {
//   //       const key = item.key;
//   //       const isReset = resetKeys.includes(key);
//   //       const iuran = isReset ? 0 : parseInt(item.iuran || 0);
//   //       const manual = isReset ? 0 : parseInt(nominalBaruList[key] || 0);
//   //       const total = iuran + manual;

//   //       payload[`iuran${capitalizeFirstLetter(key)}`] = iuran || 0;
//   //       payload[`manualIuran${capitalizeFirstLetter(key)}`] = manual || 0;
//   //       payload[`totalIuran${capitalizeFirstLetter(key)}`] = total || 0;
//   //     });

//   //     addedCategories.forEach((item) => {
//   //       const key = item.key.toLowerCase();
//   //       const oldVal = parseInt(newValues?.[key] || 0);
//   //       const manual = parseInt(manualInputs?.[key] || 0);
//   //       const total = oldVal + manual;

//   //       payload[`iuran${capitalizeFirstLetter(key)}`] = oldVal;
//   //       payload[`manualIuran${capitalizeFirstLetter(key)}`] = manual;
//   //       payload[`totalIuran${capitalizeFirstLetter(key)}`] = total;
//   //     });

//   //     await GlobalApi.putIuranAnggota(idIuran, payload);
//   //     await fetchInitialData();

//   //     setNotification({
//   //       type: "success",
//   //       message: "Data berhasil diupdate!",
//   //     });
//   //     setIsPopupVisible(false);
//   //     setResetKeys([]);
//   //     setAddedCategories([]);
//   //     setManualInputs([]);
//   //     setSelectedKategori("");
//   //     setLastUpdatedMemberNip(dataNpa.nip);
//   //   } catch (error) {
//   //     console.error("Gagal update data:", error);
//   //     setNotification({
//   //       type: "error",
//   //       message: "Gagal update data.",
//   //     });
//   //   }
//   // };

//   const calculateGrandTotal = () => {
//     let total = 0;

//     groupedIuran.forEach((item) => {
//       const oldValue = parseInt(item.iuran || 0);
//       const inputValue = nominalBaruList[item.key] || 0;
//       total += oldValue + inputValue;
//     });

//     addedCategories.forEach((item) => {
//       const oldValue = newValues[item.key] ?? 0;
//       const inputValue = manualInputs[item.key] ?? 0;
//       total += oldValue + inputValue;
//     });

//     return total;
//   };

//   useEffect(() => {
//     setGrandTotal(calculateGrandTotal());
//   }, [nominalBaruList, manualInputs, addedCategories, groupedIuran]);

//   const handleReset = async () => {
//     if (!idIuran) {
//       console.warn("ID iuran tidak ditemukan.");
//       return;
//     }

//     try {
//       await GlobalApi.deleteIuranAnggota(idIuran);
//       await fetchInitialData();

//       setNotification({
//         type: "success",
//         message: "Data berhasil direset!",
//       });

//       setNominalBaruList(Array(groupedIuran.length).fill(""));
//       setManualInputs({});
//       setAddedCategories([]);
//       setSelectedKategori("");
//       setShowDropdown(false);
//       setDataIuran(null);
//       setIdIuran(null);
//       setIsPopupVisible(false);
//       setLastUpdatedMemberNip(dataNpa.nip);
//     } catch (error) {
//       setNotification({
//         type: "error",
//         message: "Gagal mereset data. Silakan coba lagi.",
//       });
//       console.error("Gagal menghapus data iuran:", error);
//     }
//   };

//   useEffect(() => {
//     if (!token) {
//       router.push("/sign-in");
//     }
//   }, [token, router]);

//   useEffect(() => {
//     const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
//     setIsSidebarOpen(sidebarState);
//   }, []);

//   const [isMobile, setIsMobile] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     const newSidebarState = !isSidebarOpen;
//     setIsSidebarOpen(newSidebarState);
//     localStorage.setItem("isSidebarOpen", newSidebarState);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const handleExpand = (index) => {
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   const handlePrint = async () => {
//     try {
//       if (!groupedData || groupedData.length === 0) {
//         console.error("Data kosong, tidak dapat mencetak.");
//         return;
//       }

//       const bulan = selectedBulan || new Date().getMonth() + 1;
//       const tahun = selectedTahun || new Date().getFullYear();

//       let anggotaAll = [];
//       try {
//         const allData = await GlobalApi.getAllByNominal("", bulan, tahun);

//         const latestPerNpa = Object.values(
//           allData.reduce((acc, item) => {
//             if (!acc[item.npa]) {
//               acc[item.npa] = item;
//             } else {
//               const existingDate = new Date(...acc[item.npa].createdAt);
//               const currentDate = new Date(...item.createdAt);
//               if (currentDate > existingDate) {
//                 acc[item.npa] = item;
//               }
//             }
//             return acc;
//           }, {})
//         );

//         anggotaAll = latestPerNpa;
//       } catch (err) {
//         console.error("Gagal ambil data anggota untuk nomor rekening:", err);
//       }

//       const npaToRekeningMap = {};
//       anggotaAll.forEach((item) => {
//         npaToRekeningMap[item.npa] = item.nomorRekening;
//       });

//       const titleText = `Rekap By Nominal${
//         selectedCabang ? ` Cabang ${selectedCabang}` : ""
//       }${selectedUnitKerja ? ` Unit Kerja ${selectedUnitKerja}` : ""}`;

//       const htmlContent = `
//       <html>
//         <head>
//           <title>Rekap By Nominal</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//             th, td { border: 1px solid #000; padding: 8px; text-align: center; }
//             th { background-color: #00796b; color: white; }
//             .total-row { font-weight: bold; background-color: #f5f5f5; }
//             .member-list { text-align: left; padding-left: 20px; }
//             @media print {
//               .no-print { display: none; }
//               table { page-break-inside: auto; }
//               tr { page-break-inside: avoid; page-break-after: auto; }
//               thead { display: table-header-group; }
//               th { color: #00796b; }
//               tfoot { display: table-footer-group; }
//             }
//             @page { margin: 15mm; }
//           </style>
//         </head>
//         <body>
//           <div class="title">${titleText}</div>
//           <table>
//             <thead>
//               <tr>
//                 <th rowspan="2">No</th>
//                 <th rowspan="2">Cabang</th>
//                 <th rowspan="2">Unit Kerja</th>
//                 <th rowspan="2">Nama Anggota</th>
//                 <th rowspan="2">Jumlah Anggota</th>
//                 <th colspan="6">Jumlah</th>
//                 <th rowspan="2">Total</th>
//               </tr>
//               <tr>
//                 <th>PGRI</th>
//                 <th>Sanduka</th>
//                 <th>Daspen</th>
//                 <th>Derap</th>
//                 <th>Kalender</th>
//                 <th>Lain-Lain</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${groupedData
//                 ?.map((group, index) => {
//                   const members = group.members || [];
//                   return members
//                     ?.map((member, memberIndex) => {
//                       const nomorRekeningFinal =
//                         npaToRekeningMap[member.npa] ||
//                         member.nomorRekening ||
//                         "-";
//                       return `
//                           <tr>
//                             ${
//                               memberIndex === 0
//                                 ? `
//                               <td rowspan="${members.length}">${index + 1}</td>
//                               <td rowspan="${members.length}">${
//                                     group.cabang
//                                   }</td>
//                               <td rowspan="${members.length}">${
//                                     group.unitKerja
//                                   }</td>
//                             `
//                                 : ""
//                             }
//                             <td class="member-list">
//                               <div>${member.namaAnggota}</div>
//                               <div>${member.nip || "-"}</div>
//                               <div>${nomorRekeningFinal}</div>
//                             </td>
//                             ${
//                               memberIndex === 0
//                                 ? `<td rowspan="${members.length}">${
//                                     group.jumlah || 0
//                                   }</td>`
//                                 : ""
//                             }
//                             <td>Rp. ${parseInt(member.pgri || 0).toLocaleString(
//                               "id-ID"
//                             )}</td>
//                             <td>Rp. ${parseInt(
//                               member.sanduka || 0
//                             ).toLocaleString("id-ID")}</td>
//                             <td>Rp. ${parseInt(
//                               member.daspen || 0
//                             ).toLocaleString("id-ID")}</td>
//                             <td>Rp. ${parseInt(
//                               member.derap || 0
//                             ).toLocaleString("id-ID")}</td>
//                             <td>Rp. ${parseInt(
//                               member.kalender || 0
//                             ).toLocaleString("id-ID")}</td>
//                             <td>Rp. ${parseInt(
//                               member.lainLain || 0
//                             ).toLocaleString("id-ID")}</td>
//                             <td>Rp. ${parseInt(
//                               member.total || 0
//                             ).toLocaleString("id-ID")}</td>
//                           </tr>
//                         `;
//                     })
//                     .join("");
//                 })
//                 .join("")}
//               <tr class="total-row">
//                 <td colspan="4" style="text-align: center">Total Keseluruhan :</td>
//                 <td>
//                   ${groupedData.reduce(
//                     (sum, group) => sum + parseInt(group.jumlah || 0),
//                     0
//                   )}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.pgri || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.sanduka || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.daspen || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.derap || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.kalender || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.lainLain || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//                 <td>
//                   Rp. ${groupedData
//                     .flatMap((g) => g.members || [])
//                     .reduce((sum, m) => sum + parseInt(m.total || 0), 0)
//                     .toLocaleString("id-ID")}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </body>
//       </html>
//     `;

//       const printFrame = document.createElement("iframe");
//       printFrame.style.display = "none";
//       printFrame.srcdoc = htmlContent;
//       document.body.appendChild(printFrame);

//       printFrame.onload = () => {
//         printFrame.contentWindow.print();
//         setTimeout(() => {
//           document.body.removeChild(printFrame);
//         }, 1000);
//       };
//     } catch (error) {
//       console.error("Error during print process:", error);
//     }
//   };

//   //   const exportToExcel = async () => {
//   //   if (!groupedData || groupedData.length === 0) {
//   //     console.error("Data kosong, tidak dapat export ke Excel");
//   //     return;
//   //   }

//   //   const bulan = selectedBulan || new Date().getMonth() + 1;
//   //   const tahun = selectedTahun || new Date().getFullYear();

//   //   let anggotaAll = [];
//   //   try {
//   //     const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

//   //     // ambil data terbaru per NPA + hitung totalSumbangan
//   //     const latestPerNpa = Object.values(
//   //       allData.reduce((acc, item) => {
//   //         if (!acc[item.npa]) {
//   //           acc[item.npa] = item;
//   //         } else {
//   //           const existingDate = new Date(...acc[item.npa].createdAt);
//   //           const currentDate = new Date(...item.createdAt);
//   //           if (currentDate > existingDate) {
//   //             acc[item.npa] = item;
//   //           }
//   //         }

//   //         // tambahkan field totalSumbangan
//   //         acc[item.npa].totalSumbangan = (item.iuranSumbanganList || []).reduce(
//   //           (sum, s) => sum + (s.jumlah || 0),
//   //           0
//   //         );

//   //         return acc;
//   //       }, {})
//   //     );

//   //     anggotaAll = latestPerNpa;
//   //   } catch (err) {
//   //     console.error("Gagal ambil data anggota untuk nomor rekening:", err);
//   //   }

//   //   const npaToRekeningMap = {};
//   //   const npaToSumbanganMap = {};
//   //   anggotaAll.forEach((item) => {
//   //     npaToRekeningMap[item.npa] = item.nomorRekening;
//   //     npaToSumbanganMap[item.npa] = item.totalSumbangan || 0;
//   //   });

//   //   const bulanSekarang = new Date();
//   //   const bulanBerikutnya = new Date(
//   //     bulanSekarang.getFullYear(),
//   //     bulanSekarang.getMonth() + 1
//   //   );
//   //   const namaBulan = bulanBerikutnya.toLocaleString("id-ID", {
//   //     month: "long",
//   //     year: "numeric",
//   //   });

//   //   const excelData = [];

//   //   excelData.push([`Tagihan Untuk Bulan ${namaBulan}`]);
//   //   excelData.push([]);

//   //   excelData.push([
//   //     "No",
//   //     "Cabang",
//   //     "Unit Kerja",
//   //     "Nama Anggota",
//   //     "NIP",
//   //     "Nomor Rekening",
//   //     "PGRI",
//   //     "Sanduka",
//   //     "Daspen",
//   //     "Derap",
//   //     "Kalender",
//   //     "Lain-Lain",
//   //     "Total",
//   //   ]);

//   //   groupedData.forEach((group, index) => {
//   //     if (group.members && group.members.length > 0) {
//   //       group.members.forEach((member, memberIndex) => {
//   //         const nomorRekeningFinal =
//   //           npaToRekeningMap[member.npaPgri] || member.nomorRekening || "-";

//   //         const lainLain =
//   //           npaToSumbanganMap[member.npaPgri] ||
//   //           (member.iuranSumbanganList
//   //             ? member.iuranSumbanganList.reduce(
//   //                 (sum, s) => sum + (s.jumlah || 0),
//   //                 0
//   //               )
//   //             : 0);

//   //         const total = parseInt(member.totalIuran || 0);

//   //         excelData.push([
//   //           memberIndex === 0 ? index + 1 : "",
//   //           memberIndex === 0 ? group.cabang : "",
//   //           memberIndex === 0 ? group.unitKerja : "",
//   //           member.namaAnggota,
//   //           member.nip || "-",
//   //           nomorRekeningFinal,
//   //           parseInt(member.pgri || 0),
//   //           parseInt(member.sanduka || 0),
//   //           parseInt(member.daspen || 0),
//   //           parseInt(member.derap || 0),
//   //           parseInt(member.kalender || 0),
//   //           lainLain,
//   //           total,
//   //         ]);
//   //       });
//   //     }
//   //   });

//   //   const totalPgri = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.pgri || 0),
//   //     0
//   //   );
//   //   const totalSanduka = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.sanduka || 0),
//   //     0
//   //   );
//   //   const totalDaspen = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.daspen || 0),
//   //     0
//   //   );
//   //   const totalDerap = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.derap || 0),
//   //     0
//   //   );
//   //   const totalKalender = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.kalender || 0),
//   //     0
//   //   );

//   //   // total lain-lain dari semua anggota (pakai map yang sudah dibuat)
//   //   const totalLainlain = Object.values(npaToSumbanganMap).reduce(
//   //     (sum, val) => sum + val,
//   //     0
//   //   );

//   //   const totalIuran = groupedData.reduce(
//   //     (sum, g) => sum + parseInt(g.totalIuran || 0),
//   //     0
//   //   );

//   //   excelData.push([
//   //     "",
//   //     "",
//   //     "",
//   //     "Total Keseluruhan:",
//   //     "",
//   //     "",
//   //     totalPgri,
//   //     totalSanduka,
//   //     totalDaspen,
//   //     totalDerap,
//   //     totalKalender,
//   //     totalLainlain,
//   //     totalIuran,
//   //     "",
//   //     "",
//   //     "",
//   //   ]);

//   //   const ws = XLSX.utils.aoa_to_sheet(excelData);
//   //   const wb = XLSX.utils.book_new();
//   //   XLSX.utils.book_append_sheet(wb, ws, "RekapData");

//   //   const waktuDownload = new Date().toLocaleString("id-ID", {
//   //     dateStyle: "short",
//   //     timeStyle: "medium",
//   //   });

//   //   const safeWaktuDownload = waktuDownload
//   //     .replace(/[/:]/g, "-")
//   //     .replace(/[ ]/g, "_");

//   //   const fileName = `Backupbynominal_${namaBulan}_${safeWaktuDownload}${
//   //     selectedCabang ? `_Cabang_${selectedCabang}` : ""
//   //   }${selectedUnitKerja ? `_Unit_Kerja_${selectedUnitKerja}` : ""}.xlsx`;

//   //   XLSX.writeFile(wb, fileName);
//   // };

//   // berantakan tapi benar
//   const exportToExcel = async () => {
//     try {
//       setIsExporting(true);
//       const cabangParam = selectedCabang?.kecamatan || "";
//       const unitKerjaParam = selectedUnitKerja?.unitKerja || "";
//       const bulanParam = selectedBulan || null;
//       const tahunParam = selectedTahun || null;

//       let allData = await GlobalApi.getNominalAggregatedData(
//         cabangParam,
//         unitKerjaParam,
//         null,
//         bulanParam,
//         tahunParam
//       );

//       // 📌 Proses data untuk mengambil yang terbaru per npaPgri
//       // Opsional: ganti null dengan npaPgri spesifik contoh "33200806435"
//       // Ganti true dengan false jika ingin berdasarkan idByNominal terbesar
//       allData = processApiResponse(allData, null, true);

//       // console.log(`📊 Jumlah data yang didapat: ${allData?.length || 0} data`);

//       if (!allData || allData.length === 0) {
//         alert("Tidak ada data anggota ditemukan untuk tahun ini.");
//         return;
//       }

//       // --- FILTER DATA BERDASARKAN INPUT ---
//       let filteredData = allData;

//       if (selectedCabang && selectedCabang.trim() !== "") {
//         filteredData = filteredData.filter(
//           (item) =>
//             item.cabang &&
//             item.cabang.toLowerCase().includes(selectedCabang.toLowerCase())
//         );
//       }

//       if (selectedUnitKerja && selectedUnitKerja.trim() !== "") {
//         filteredData = filteredData.filter(
//           (item) =>
//             item.unitKerja &&
//             item.unitKerja
//               .toLowerCase()
//               .includes(selectedUnitKerja.toLowerCase())
//         );
//       }

//       if (namaAnggotaInput && namaAnggotaInput.trim() !== "") {
//         filteredData = filteredData.filter(
//           (item) =>
//             item.namaAnggota &&
//             item.namaAnggota
//               .toLowerCase()
//               .includes(namaAnggotaInput.toLowerCase())
//         );
//       }

//       if (filteredData.length === 0) {
//         alert("Tidak ada data sesuai dengan filter yang dipilih.");
//         return;
//       }

//       // console.log(`🔍 Jumlah data setelah filter: ${filteredData.length} data`);

//       // --- Ambil data terbaru per NPA berdasarkan lastUpdatedAtIuran ---
//       const latestPerNpa = Object.values(
//         filteredData.reduce((acc, item) => {
//           const npa = item.npaPgri; // Menggunakan npaPgri dari response baru
//           if (!npa) return acc;

//           // Jika belum ada data untuk NPA ini, langsung simpan
//           if (!acc[npa]) {
//             acc[npa] = item;
//           } else {
//             // Bandingkan lastUpdatedAtIuran untuk mengambil yang terbaru
//             const currentDate = item.lastUpdatedAtIuran
//               ? new Date(item.lastUpdatedAtIuran)
//               : new Date(0);
//             const existingDate = acc[npa].lastUpdatedAtIuran
//               ? new Date(acc[npa].lastUpdatedAtIuran)
//               : new Date(0);

//             if (currentDate > existingDate) {
//               acc[npa] = item;
//             }
//           }
//           return acc;
//         }, {})
//       );

//       // console.log(
//       //   `✅ Jumlah data unik setelah ambil terbaru: ${latestPerNpa.length} data`
//       // );


//       const bulanSekarang = new Date();
//       const bulanBerikutnya = new Date(
//         bulanSekarang.getFullYear(),
//         bulanSekarang.getMonth() + 1
//       );
//       const namaBulan = bulanBerikutnya.toLocaleString("id-ID", {
//         month: "long",
//         year: "numeric",
//       });

//       const excelData = [];
//       excelData.push([`Tagihan Untuk Bulan ${namaBulan}`]);
//       excelData.push([]);

//       excelData.push([
//         "No",
//         "Cabang",
//         "Unit Kerja",
//         "Nama Anggota",
//         "NIP",
//         "NPA",
//         "Nomor Rekening",
//         "PGRI",
//         "Sanduka",
//         "Daspen",
//         "Derap",
//         "Kalender",
//         "Lain-Lain",
//         "Total",
//       ]);

//       let no = 1;
//       latestPerNpa.forEach((item) => {
//         const pgri = parseInt(item.pgri || 0);
//         const sanduka = parseInt(item.sanduka || 0);
//         const daspen = parseInt(item.daspen || 0);
//         const derap = parseInt(item.derap || 0);
//         const kalender = parseInt(item.kalender || 0);
//         const lainLain = parseInt(item.lainLain || 0);
//         const total = parseInt(item.totalIuran || 0);

//         excelData.push([
//           no++,
//           item.cabang || "-",
//           item.unitKerja || "-",
//           item.namaAnggota,
//           item.nip || "-",
//           item.npaPgri || "-",
//           item.nomorRekening || "-",
//           pgri,
//           sanduka,
//           daspen,
//           derap,
//           kalender,
//           lainLain,
//           total,
//         ]);
//       });

//       const totalPgri = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.pgri || 0),
//         0
//       );
//       const totalSanduka = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.sanduka || 0),
//         0
//       );
//       const totalDaspen = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.daspen || 0),
//         0
//       );
//       const totalDerap = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.derap || 0),
//         0
//       );
//       const totalKalender = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.kalender || 0),
//         0
//       );
//       const totalLainLain = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.lainLain || 0),
//         0
//       );
//       const totalIuran = latestPerNpa.reduce(
//         (sum, g) => sum + parseInt(g.totalIuran || 0),
//         0
//       );

//       excelData.push([]);
//       excelData.push([
//         "",
//         "",
//         "",
//         "Total Keseluruhan:",
//         "",
//         "",
//         "",
//         totalPgri,
//         totalSanduka,
//         totalDaspen,
//         totalDerap,
//         totalKalender,
//         totalLainLain,
//         totalIuran,
//       ]);


//       const ws = XLSX.utils.aoa_to_sheet(excelData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "RekapData");

//       const waktuDownload = new Date().toLocaleString("id-ID", {
//         dateStyle: "short",
//         timeStyle: "medium",
//       });

//       const safeWaktuDownload = waktuDownload
//         .replace(/[/:]/g, "-")
//         .replace(/[ ]/g, "_");

//       const fileName = `Backupbynominal_${namaBulan}_${safeWaktuDownload}${
//         selectedCabang ? `_Cabang_${selectedCabang}` : ""
//       }${selectedUnitKerja ? `_Unit_Kerja_${selectedUnitKerja}` : ""}.xlsx`;

//       XLSX.writeFile(wb, fileName);

      
//     } catch (error) {
//       console.error("❌ Gagal ekspor data:", error);
//       alert("Terjadi kesalahan saat mengekspor data ke Excel.");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   // rapi tapi salah
//   // const exportToExcel = async () => {
//   //   if (!groupedData || groupedData.length === 0) {
//   //     console.error("❌ Data tabel kosong, tidak dapat export ke Excel");
//   //     return;
//   //   }

//   //   const bulan = selectedBulan || new Date().getMonth() + 1;
//   //   const tahun = selectedTahun || new Date().getFullYear();

//   //   let anggotaAll = [];
//   //   try {
//   //     const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

//   //     // filter hanya data sesuai bulan & tahun
//   //     const filteredData = allData.filter((item) => {
//   //       const d = new Date(item.createdAt);
//   //       return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
//   //     });

//   //     // ambil data terbaru per NPA (berdasarkan createdAt)
//   //     const latestPerNpa = Object.values(
//   //       filteredData.reduce((acc, item) => {
//   //         if (!acc[item.npa]) {
//   //           acc[item.npa] = item;
//   //         } else {
//   //           const existingDate = new Date(acc[item.npa].createdAt);
//   //           const currentDate = new Date(item.createdAt);
//   //           if (currentDate > existingDate) {
//   //             acc[item.npa] = item;
//   //           }
//   //         }

//   //         // hitung total sumbangan
//   //         acc[item.npa].totalSumbangan = (item.iuranSumbanganList || []).reduce(
//   //           (sum, s) => sum + (s.jumlah || 0),
//   //           0
//   //         );

//   //         return acc;
//   //       }, {})
//   //     );

//   //     anggotaAll = latestPerNpa;
//   //     // console.log("📌 Data dari API (anggotaAll):", anggotaAll);
//   //   } catch (err) {
//   //     console.error("❌ Gagal ambil data anggota dari API:", err);
//   //   }

//   //   // 👉 loop masuk ke group.members lalu match berdasarkan npaPgri
//   //   let hasilFinal = [];
//   //   groupedData.forEach((group) => {
//   //     if (group.members && group.members.length > 0) {
//   //       group.members.forEach((member) => {
//   //         const match = anggotaAll.find((d) => d.npa === member.npaPgri);
//   //         if (match) {
//   //           // console.log(
//   //           //   `✅ Match ditemukan untuk NPA ${member.npaPgri}:`,
//   //           //   match
//   //           // );
//   //           hasilFinal.push({
//   //             ...member,
//   //             cabang: group.cabang,
//   //             unitKerja: group.unitKerja,
//   //             ...match,
//   //           });
//   //         } else {
//   //           console.warn(
//   //             `⚠️ Tidak ada match di API untuk NPA ${member.npaPgri}`
//   //           );
//   //           hasilFinal.push({
//   //             ...member,
//   //             cabang: group.cabang,
//   //             unitKerja: group.unitKerja,
//   //           });
//   //         }
//   //       });
//   //     }
//   //   });

//   //   // console.log("📌 Hasil gabungan (hasilFinal):", hasilFinal);

//   //   if (hasilFinal.length === 0) {
//   //     alert(
//   //       "Tidak ada data yang cocok antara tabel dan API (NPA tidak match)."
//   //     );
//   //     return;
//   //   }

//   //   // judul bulan depan
//   //   const bulanSekarang = new Date();
//   //   const bulanBerikutnya = new Date(
//   //     bulanSekarang.getFullYear(),
//   //     bulanSekarang.getMonth() + 1
//   //   );
//   //   const namaBulan = bulanBerikutnya.toLocaleString("id-ID", {
//   //     month: "long",
//   //     year: "numeric",
//   //   });

//   //   const excelData = [];
//   //   excelData.push([`Tagihan Untuk Bulan ${namaBulan}`]);
//   //   excelData.push([]);

//   //   excelData.push([
//   //     "No",
//   //     "Cabang",
//   //     "Unit Kerja",
//   //     "Nama Anggota",
//   //     "NIP",
//   //     "Nomor Rekening",
//   //     "PGRI",
//   //     "Sanduka",
//   //     "Daspen",
//   //     "Derap",
//   //     "Kalender",
//   //     "Lain-Lain",
//   //     "Total",
//   //   ]);

//   //   let no = 1;
//   //   hasilFinal.forEach((item) => {
//   //     const pgri = parseInt(
//   //       item.pgri || item.totalIuranAnggota || item.iuranAnggota || 0
//   //     );
//   //     const sanduka = parseInt(
//   //       item.sanduka || item.totalIuranSanduka || item.iuranSanduka || 0
//   //     );
//   //     const daspen = parseInt(
//   //       item.daspen || item.totalIuranDaspen || item.iuranDaspen || 0
//   //     );
//   //     const derap = parseInt(
//   //       item.derap || item.totalIuranDerap || item.iuranDerap || 0
//   //     );
//   //     const kalender = parseInt(
//   //       item.kalender || item.totalIuranKalender || item.iuranKalender || 0
//   //     );
//   //     const lain = parseInt(item.sumbangan || item.totalSumbangan || 0);
//   //     const total = pgri + sanduka + daspen + derap + kalender + lain;

//   //     excelData.push([
//   //       no++,
//   //       item.cabang,
//   //       item.unitKerja,
//   //       item.namaAnggota,
//   //       item.nip,
//   //       item.nomorRekening || "-",
//   //       pgri,
//   //       sanduka,
//   //       daspen,
//   //       derap,
//   //       kalender,
//   //       lain,
//   //       total,
//   //     ]);
//   //   });

//   //   // total keseluruhan
//   //   const totalPgri = hasilFinal.reduce(
//   //     (sum, g) =>
//   //       sum + parseInt(g.pgri || g.totalIuranAnggota || g.iuranAnggota || 0),
//   //     0
//   //   );
//   //   const totalSanduka = hasilFinal.reduce(
//   //     (sum, g) =>
//   //       sum + parseInt(g.sanduka || g.totalIuranSanduka || g.iuranSanduka || 0),
//   //     0
//   //   );
//   //   const totalDaspen = hasilFinal.reduce(
//   //     (sum, g) =>
//   //       sum + parseInt(g.daspen || g.totalIuranDaspen || g.iuranDaspen || 0),
//   //     0
//   //   );
//   //   const totalDerap = hasilFinal.reduce(
//   //     (sum, g) =>
//   //       sum + parseInt(g.derap || g.totalIuranDerap || g.iuranDerap || 0),
//   //     0
//   //   );
//   //   const totalKalender = hasilFinal.reduce(
//   //     (sum, g) =>
//   //       sum +
//   //       parseInt(g.kalender || g.totalIuranKalender || g.iuranKalender || 0),
//   //     0
//   //   );
//   //   const totalLainlain = hasilFinal.reduce(
//   //     (sum, g) => sum + parseInt(g.sumbangan || g.totalSumbangan || 0),
//   //     0
//   //   );
//   //   const totalIuran =
//   //     totalPgri +
//   //     totalSanduka +
//   //     totalDaspen +
//   //     totalDerap +
//   //     totalKalender +
//   //     totalLainlain;

//   //   excelData.push([]);
//   //   excelData.push([
//   //     "",
//   //     "",
//   //     "",
//   //     "Total Keseluruhan:",
//   //     "",
//   //     "",
//   //     totalPgri,
//   //     totalSanduka,
//   //     totalDaspen,
//   //     totalDerap,
//   //     totalKalender,
//   //     totalLainlain,
//   //     totalIuran,
//   //   ]);

//   //   // buat file Excel
//   //   const ws = XLSX.utils.aoa_to_sheet(excelData);
//   //   const wb = XLSX.utils.book_new();
//   //   XLSX.utils.book_append_sheet(wb, ws, "RekapData");

//   //   const waktuDownload = new Date().toLocaleString("id-ID", {
//   //     dateStyle: "short",
//   //     timeStyle: "medium",
//   //   });

//   //   const safeWaktuDownload = waktuDownload
//   //     .replace(/[/:]/g, "-")
//   //     .replace(/[ ]/g, "_");

//   //   const fileName = `Backupbynominal_${namaBulan}_${safeWaktuDownload}${
//   //     selectedCabang ? `_Cabang_${selectedCabang}` : ""
//   //   }${selectedUnitKerja ? `_Unit_Kerja_${selectedUnitKerja}` : ""}.xlsx`;

//   //   XLSX.writeFile(wb, fileName);
//   // };

//   const handleBackupData = async () => {
//     if (!selectedDate) {
//       alert("Silakan pilih bulan tagihan terlebih dahulu.");
//       return;
//     }

//     try {
//       const result = await GlobalApi.postToBackup(selectedDate);

//       setNotification({
//         type: "success",
//         message: "Backup berhasil!",
//       });
//       setPopupBackup(false);
//       exportToExcel();
//     } catch (error) {
//       setNotification({
//         type: "error",
//         message: "Gagal backup dan export.",
//       });
//       console.error("Gagal backup dan export:", error);
//     }
//   };

//   const handleBackupByNominal = async () => {
//     if (!selectedDate) {
//       setNotification({
//         type: "error",
//         message: "Silakan pilih bulan terlebih dahulu.",
//       });
//       return;
//     }

//     try {
//       // Format date: 2025-12 → 2025-12-01
//       const formattedDate = `${selectedDate}-01`;

//       await GlobalApi.postToBackupNew(formattedDate);

//       setNotification({
//         type: "success",
//         message: "Backup berhasil!",
//       });

//       setPopupRekapByNominal(false);
//       await fetchInitialData();
//     } catch (error) {
//       setNotification({
//         type: "error",
//         message: "Gagal melakukan backup.",
//       });
//       console.error("Backup error:", error);
//     }
//   };

//   const handleRekapClick = () => {
//     setOpen((prev) => !prev);
//   };

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleExport = (type) => {
//     if (type === "bank") {
//       NorekExcel();
//     } else if (type === "mandiri") {
//       MandiriExcel();
//     }
//     setOpen(false);
//   };

//   const NorekExcel = async () => {
//     if (!groupedData || groupedData.length === 0) {
//       console.error("Data kosong, tidak dapat export ke Excel");
//       return;
//     }

//     const bulan = selectedBulan || new Date().getMonth() + 1;
//     const tahun = selectedTahun || new Date().getFullYear();

//     let anggotaAll = [];
//     try {
//       const allData = await GlobalApi.getIuranAnggotaAll(bulan, tahun);

//       const latestPerNpa = Object.values(
//         allData.reduce((acc, item) => {
//           if (!acc[item.npa]) {
//             acc[item.npa] = item;
//           } else {
//             const existingDate = new Date(...acc[item.npa].createdAt);
//             const currentDate = new Date(...item.createdAt);
//             if (currentDate > existingDate) {
//               acc[item.npa] = item;
//             }
//           }
//           return acc;
//         }, {})
//       );

//       anggotaAll = latestPerNpa;
//     } catch (err) {
//       console.error("Gagal ambil data anggota untuk nomor rekening:", err);
//     }

//     const npaToRekeningMap = {};
//     anggotaAll.forEach((item) => {
//       npaToRekeningMap[item.npa] = item.nomorRekening;
//     });

//     const excelData = [];
//     const today = new Date();
//     const bulanNama = today.toLocaleDateString("id-ID", {
//       month: "long",
//       year: "numeric",
//     });
//     const tanggalDownload = today.toLocaleDateString("id-ID", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//     const semuaCabangUnik = [...new Set(groupedData.map((g) => g.cabang))];
//     const namaCabang =
//       semuaCabangUnik.length > 1 ? "Semua Cabang" : semuaCabangUnik[0];

//     excelData.push(["Rekap Laporan Potongan Bank"]);
//     excelData.push([`Cabang: ${namaCabang}`]);
//     excelData.push([`Bulan: ${bulanNama}`]);
//     excelData.push([`Tanggal Download: ${tanggalDownload}`]);
//     excelData.push([]);
//     excelData.push(["Pgri Kabupaten Jepara"]);
//     excelData.push(["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"]);
//     excelData.push([]);
//     excelData.push([
//       "No",
//       "Cabang",
//       "Nama",
//       "No Rekening",
//       "Total Tagihan",
//       "Keterangan",
//     ]);

//     let rowNumber = 1;
//     let hasValidData = false;
//     let totalTagihanSemua = 0;

//     groupedData.forEach((group) => {
//       if (group.members && group.members.length > 0) {
//         group.members.forEach((member) => {
//           const nomorRekeningFinal =
//             npaToRekeningMap[member.npa] || member.nomorRekening || "";
//           if (nomorRekeningFinal && nomorRekeningFinal.trim() !== "") {
//             const tagihan = parseInt(member.totalIuran || 0);
//             totalTagihanSemua += tagihan;
//             hasValidData = true;
//             excelData.push([
//               rowNumber++,
//               group.cabang,
//               member.namaAnggota,
//               nomorRekeningFinal,
//               tagihan,
//               "",
//             ]);
//           }
//         });
//       }
//     });

//     if (!hasValidData) {
//       console.warn("Tidak ada data dengan nomor rekening, file tidak dibuat.");
//       return;
//     }

//     excelData.push([]);
//     excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
//     excelData.push([]);
//     excelData.push(["", "", "", "", tanggalDownload]);
//     excelData.push(["", "", "", "", "TTD"]);

//     const ws = XLSX.utils.aoa_to_sheet(excelData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Laporan Rekening");

//     XLSX.writeFile(wb, "Rekap_Laporan_Potongan_Bank.xlsx");
//   };

//   const MandiriExcel = () => {
//     if (!groupedData || groupedData.length === 0) {
//       console.error("Data kosong, tidak dapat export ke Excel");
//       return;
//     }

//     const semuaCabangUnik = [...new Set(groupedData.map((g) => g.cabang))];
//     const namaCabang =
//       semuaCabangUnik.length > 1 ? "Semua Cabang" : semuaCabangUnik[0];

//     const bulanNama = new Date().toLocaleString("id-ID", {
//       month: "long",
//       year: "numeric",
//     });
//     const tanggalDownload = new Date().toLocaleDateString("id-ID", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//     const excelData = [];

//     excelData.push(["Rekap Data Anggota Tanpa No Rekening"]);
//     excelData.push([`Cabang: ${namaCabang}`]);
//     excelData.push([`Bulan: ${bulanNama}`]);
//     excelData.push([`Tanggal Download: ${tanggalDownload}`]);
//     excelData.push([]);
//     excelData.push(["Pgri Kabupaten Jepara"]);
//     excelData.push(["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"]);
//     excelData.push([]);
//     excelData.push([
//       "No",
//       "Cabang",
//       "Nama",
//       "No Rekening",
//       "Total Tagihan",
//       "Keterangan",
//     ]);

//     let rowNumber = 1;
//     let hasMissingData = false;
//     let totalTagihanSemua = 0;

//     groupedData.forEach((group) => {
//       if (group.members && group.members.length > 0) {
//         group.members.forEach((member) => {
//           if (!member.nomorRekening || member.nomorRekening.trim() === "") {
//             const tagihan = parseInt(member.totalIuran || 0);
//             totalTagihanSemua += tagihan;
//             hasMissingData = true;
//             excelData.push([
//               rowNumber++,
//               group.cabang,
//               member.namaAnggota,
//               "",
//               tagihan,
//               "",
//             ]);
//           }
//         });
//       }
//     });

//     if (!hasMissingData) {
//       console.warn("Semua data memiliki nomor rekening, file tidak dibuat.");
//       return;
//     }

//     excelData.push([]);
//     excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
//     excelData.push([]);
//     excelData.push(["", "", "", "", tanggalDownload]);
//     excelData.push(["", "", "", "", "TTD"]);

//     const ws = XLSX.utils.aoa_to_sheet(excelData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Data Tanpa No Rekening");

//     XLSX.writeFile(wb, "Rekap_Laporan_Mandiri.xlsx");
//   };

//   // Loading state dipindahkan ke dalam tabel, bukan di layar penuh

//   const getNextPotonganBulan = () => {
//     const today = new Date();
//     let bulan = today.getMonth() + 1;
//     let tahun = today.getFullYear();

//     if (bulan > 11) {
//       bulan = 0;
//       tahun += 1;
//     }

//     const namaBulan = [
//       "Januari",
//       "Februari",
//       "Maret",
//       "April",
//       "Mei",
//       "Juni",
//       "Juli",
//       "Agustus",
//       "September",
//       "Oktober",
//       "November",
//       "Desember",
//     ];

//     return `${namaBulan[bulan]} ${tahun}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-2 md:p-4 w-[110%]">
//       {isMobile ? <HeaderMobile /> : <HeaderMenu />}
//       <div>
//         <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//         {notification && (
//           <NotificationPopup
//             type={notification.type}
//             message={notification.message}
//             onClose={() => setNotification(null)}
//           />
//         )}
//         <div className="mt-8"></div>
//         <div
//           className={`flex-1 transition-all duration-300 ease-in-out ${
//             isSidebarOpen ? "ml-64" : "ml-0"
//           }`}
//         >
//           <div className="mb-6 mx-4 md:mx-4">
//             <div className="flex flex-wrap items-start mt-8 justify-between">
//               {!isMobile && (
//                 <div className="flex justify-between items-end mt-2 md:mt-2 p-4 w-full">
//                   <div className="flex items-center gap-2">
//                     <FaDatabase className="text-2xl text-gray-700" />
//                     <h1 className="font-semibold text-2xl">By Nominal</h1>
//                   </div>

//                   <div className="flex gap-4">
//                     <button
//                       onClick={handlePrint}
//                       className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="16"
//                         height="16"
//                         fill="currentColor"
//                         viewBox="0 0 16 16"
//                       >
//                         <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
//                         <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
//                       </svg>
//                       <span>Cetak</span>
//                     </button>

//                     <button
//                       className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 disabled:bg-teal-400 disabled:cursor-not-allowed"
//                       onClick={exportToExcel}
//                       disabled={isExporting}
//                       title={
//                         isExporting ? "Sedang mengekspor..." : "Export to Excel"
//                       }
//                     >
//                       {isExporting ? (
//                         // Loading spinner
//                         <svg
//                           className="animate-spin h-4 w-4 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           ></circle>
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           ></path>
//                         </svg>
//                       ) : (
//                         // Excel icon
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="M4 2h10a2 2 0 0 1 2 2v4h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h16V10h-6a2 2 0 0 1-2-2V4H4zm5.5 5 1.7 2.5L9.5 12l1.7 2.5H9.5L8 13.3 6.5 14.5H5.8l1.7-2.5L5.8 9.5h.7L8 10.7 9.5 9H10.2z" />
//                         </svg>
//                       )}

//                       <span>{isExporting ? "Exporting..." : "Excel"}</span>
//                     </button>

//                     {sessionStorage.getItem("role") === "SUPER ADMIN" && (
//                       <button
//                         className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3"
//                         onClick={() => setPopupBackup(true)}
//                       >
//                         <span>Potongan Gaji</span>
//                       </button>
//                     )}

//                     <div
//                       className="relative inline-block text-left"
//                       ref={dropdownRef}
//                     >
//                       <button
//                         className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
//                         onClick={handleRekapClick}
//                         title="Rekap Data"
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           fill="currentColor"
//                           viewBox="0 0 16 16"
//                         >
//                           <path d="M8 3.5a.5.5 0 0 1 .5.5v4h3a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
//                           <path d="M8 16A8 8 0 1 1 16 8a8 8 0 0 1-8 8zm0-1A7 7 0 1 0 1 8a7 7 0 0 0 7 7z" />
//                         </svg>
//                         <span>Rekap</span>
//                       </button>

//                       {open && (
//                         <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
//                           <button
//                             className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                             onClick={() => handleExport("bank")}
//                           >
//                             Potongan Bank
//                           </button>
//                           <button
//                             className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                             onClick={() => handleExport("mandiri")}
//                           >
//                             Potongan Mandiri
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                     {sessionStorage.getItem("role") === "SUPER ADMIN" && (
//                       <button
//                         className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3"
//                         onClick={() => setPopupRekapByNominal(true)}
//                       >
//                         <span>Backup Target</span>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="rounded-lg shadow-lg mx-4 md:mx-0">
//             <div className="flex gap-4">
//               <div className="flex flex-col relative w-64" ref={cabangRef}>
//                 <p>Cabang</p>
//                 <Input
//                   type="text"
//                   value={selectedCabang}
//                   readOnly
//                   onClick={!isAdmin ? handleCabangClick : undefined}
//                   className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
//                     isAdmin ? "bg-gray-100" : ""
//                   }`}
//                   placeholder="Pilih Cabang"
//                   disabled={isAdmin}
//                 />
//                 {!isAdmin && showCabangDropdown && (
//                   <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
//                     <ul className="max-h-44 overflow-y-auto">
//                       <li className="py-2 px-2">
//                         <Input
//                           type="text"
//                           value={searchCabang}
//                           onChange={(e) => handleCabangSearch(e.target.value)}
//                           className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
//                           placeholder="Cari Cabang..."
//                           autoFocus
//                         />
//                       </li>
//                       <li
//                         onClick={() => handleSelectCabang({ kecamatan: "" })}
//                         className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                       >
//                         Pilih Cabang
//                       </li>
//                       {filteredCabangList.map((cabang) => (
//                         <li
//                           key={cabang.id}
//                           onClick={() => handleSelectCabang(cabang)}
//                           className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                         >
//                           {cabang.kecamatan}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//               <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
//                 <p>Unit Kerja</p>
//                 <Input
//                   type="text"
//                   value={unitKerjaInput}
//                   onChange={handleUnitKerjaChange}
//                   onFocus={handleUnitKerjaFocus}
//                   placeholder="Pilih Unit Kerja"
//                   className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
//                   disabled={!selectedCabang}
//                   onClick={handleUnitKerjaClick}
//                 />
//                 {showUnitKerjaDropdown && (
//                   <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
//                     <ul className="max-h-44 overflow-y-auto">
//                       <li className="py-2 px-2">
//                         <Input
//                           type="text"
//                           value={searchUnitKerja}
//                           onChange={(e) =>
//                             handleUnitKerjaSearch(e.target.value)
//                           }
//                           className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
//                           placeholder="Cari Unit Kerja..."
//                           autoFocus
//                         />
//                       </li>
//                       <li
//                         onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
//                         className="px-4 py-2 cursor-pointer hover:bg-gray-200"
//                       >
//                         Pilih Unit Kerja
//                       </li>
//                       {filteredUnitKerja.map((unitKerja) => (
//                         <li
//                           key={unitKerja.id}
//                           onClick={() => handleUnitKerjaSelect(unitKerja)}
//                           className="px-4 py-2 cursor-pointer hover:bg-gray-200"
//                         >
//                           {unitKerja.unitKerja}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//               <div className="flex flex-col relative w-64">
//                 <div className="relative">
//                   <p>Nama Anggota</p>
//                   <Input
//                     type="text"
//                     value={namaAnggotaInput}
//                     onChange={handleNamaAnggotaInputChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border pr-10"
//                     placeholder="Nama anggota..."
//                   />
//                   <button
//                     onClick={handleSearchClick}
//                     className="absolute right-2 top-12 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
//                   >
//                     <FaSearch />
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-teal-700 p-4 rounded-t-lg mt-2">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-white text-xl font-semibold">
//                     Laporan Tagihan
//                   </h2>
//                   <p className="text-teal-100 text-sm">
//                     Daftar iuran anggota per unit kerja
//                   </p>
//                 </div>
//                 {/* <div className="flex gap-2 items-center">
//                   <select
//                     value={selectedBulan}
//                     onChange={(e) => setSelectedBulan(Number(e.target.value))}
//                     className="p-2 rounded bg-white text-black border"
//                   >
//                     <option value="">-- Pilih Bulan --</option>
//                     {filteredMonths.map((month, index) => {
//                       const monthValue =
//                         selectedTahun === 2025 ? index + 5 : index + 1;
//                       return (
//                         <option key={monthValue} value={monthValue}>
//                           {month}
//                         </option>
//                       );
//                     })}
//                   </select>

//                   <select
//                     value={selectedTahun}
//                     onChange={(e) => setSelectedTahun(Number(e.target.value))}
//                     className="p-2 rounded bg-white text-black border"
//                   >
//                     <option value="">-- Pilih Tahun --</option>
//                     {years.map((year) => (
//                       <option key={year} value={year}>
//                         {year}
//                       </option>
//                     ))}
//                   </select>
//                 </div> */}
//               </div>
//             </div>
//             {popupBackup && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                 <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//                   <h2 className="text-lg font-semibold mb-4">
//                     Pilih Bulan Tagihan Untuk Potongan Gaji
//                   </h2>

//                   <input
//                     type="month"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="w-full mb-4 p-2 border border-gray-300 rounded"
//                   />

//                   <div className="flex justify-end gap-2">
//                     <button
//                       onClick={() => setPopupBackup(false)}
//                       className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
//                     >
//                       Batal
//                     </button>
//                     <button
//                       onClick={handleBackupData}
//                       className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
//                     >
//                       Konfirmasi
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {popupBackupRekapByNominal && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                 <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//                   <h2 className="text-lg font-semibold mb-4">
//                     Pilih Bulan Tagihan Untuk Backup Target
//                   </h2>

//                   <input
//                     type="month"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="w-full mb-4 p-2 border border-gray-300 rounded"
//                   />

//                   <div className="flex justify-end gap-2">
//                     <button
//                       onClick={() => setPopupRekapByNominal(false)}
//                       className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
//                     >
//                       Batal
//                     </button>
//                     <button
//                       onClick={handleBackupByNominal}
//                       className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
//                     >
//                       Konfirmasi
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//               //   <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//               //     <h2 className="text-lg font-semibold mb-4 text-center">
//               //       Apakah anda ingin membackup data di bulan sebelumnya?
//               //     </h2>
//               //     <div className="flex justify-center gap-4 mt-6">
//               //       <button
//               //         className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded"
//               //         onClick={() => setPopupRekapByNominal(false)}
//               //       >
//               //         Tidak
//               //       </button>
//               //       <button
//               //         className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded"
//               //         onClick={handleBackupByNominal}
//               //       >
//               //         Ya
//               //       </button>
//               //     </div>
//               //   </div>
//               // </div>
//             )}
//             <table className="w-full table-auto bg-white">
//               <thead>
//                 <tr>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tl-lg">
//                     No
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600">
//                     Cabang
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600">
//                     Unit Kerja
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600">
//                     Nama Anggota
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     PGRI
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Sanduka
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Daspen
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Derap
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Kalender
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Lain-lain
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 text-center">
//                     Total
//                   </th>
//                   <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tr-lg w-28 text-center">
//                     Aksi
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <>
//                     {/* Loading message */}
//                     <tr>
//                       <td colSpan="12" className="p-6 text-center">
//                         <div className="flex flex-col items-center justify-center space-y-3">
//                           <div className="flex items-center space-x-2">
//                             <div
//                               className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
//                               style={{ animationDelay: "0s" }}
//                             ></div>
//                             <div
//                               className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
//                               style={{ animationDelay: "0.2s" }}
//                             ></div>
//                             <div
//                               className="h-3 w-3 bg-teal-500 rounded-full animate-bounce"
//                               style={{ animationDelay: "0.4s" }}
//                             ></div>
//                           </div>
//                           <p className="text-gray-600 font-medium text-sm">
//                             Data sedang diproses...
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                     {/* Loading skeleton rows */}
//                     {Array.from({ length: 4 }).map((_, idx) => (
//                       <tr key={`skeleton-${idx}`} className="bg-white">
//                         {Array.from({ length: 12 }).map((_, cellIdx) => (
//                           <td
//                             key={`skeleton-cell-${cellIdx}`}
//                             className="p-3 border-b"
//                           >
//                             <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </>
//                 ) : (
//                   [...groupedData]
//                     .sort((a, b) => a.unitKerja.localeCompare(b.unitKerja))
//                     .flatMap((group) =>
//                       group.members.map((member) => ({
//                         ...member,
//                         cabang: group.cabang,
//                         unitKerja: group.unitKerja,
//                       }))
//                     )
//                     .map((member, rowIndex) => (
//                       <tr
//                         key={`${member.unitKerja}-${member.npaPgri}-${member.namaAnggota}`}
//                         className={
//                           rowIndex % 2 === 0 ? "bg-white" : "bg-teal-50"
//                         }
//                         ref={
//                           member.nip === lastUpdatedMemberNip
//                             ? lastUpdatedMemberRef
//                             : null
//                         }
//                       >
//                         <td className="p-3 border-b text-center">
//                           <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
//                             {rowIndex + 1}
//                           </div>
//                         </td>
//                         <td className="p-3 border-b">{member.cabang}</td>
//                         <td className="p-3 border-b font-medium">
//                           {member.unitKerja}
//                         </td>
//                         <td className="p-3 border-b text-sm">
//                           <div className="font-medium">
//                             {member.namaAnggota}
//                           </div>
//                           <div className="text-xs text-gray-600">
//                             {member.nip}
//                           </div>
//                           <div className="text-xs text-gray-600">
//                             {member.nomorRekening}
//                           </div>
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           Rp.{" "}
//                           {parseInt(member.pgri || 0).toLocaleString("id-ID")}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           Rp.{" "}
//                           {parseInt(member.sanduka || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           {parseInt(member.daspen || 0) === 0 ? (
//                             <span className=" text-red-800 py-1 px-2 rounded text-xs font-medium">
//                               Belum Input
//                             </span>
//                           ) : (
//                             `Rp. ${parseInt(member.daspen || 0).toLocaleString(
//                               "id-ID"
//                             )}`
//                           )}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           Rp.{" "}
//                           {parseInt(member.derap || 0).toLocaleString("id-ID")}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           Rp.{" "}
//                           {parseInt(member.kalender || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm">
//                           Rp.{" "}
//                           {parseInt(member.sumbangan || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </td>
//                         <td className="p-3 border-b text-right text-sm text-teal-800 font-semibold">
//                           Rp.{" "}
//                           {parseInt(member.totalIuran || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </td>
//                         <td className="p-3 border-b text-center">
//                           <div className="flex justify-center gap-2">
//                             <button
//                               className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
//                               onClick={() => handleMemberClick(member)}
//                               title="Edit Iuran"
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
//                               onClick={() => handlePrintClick(member)}
//                               title="Cetak Kartu Iuran"
//                             >
//                               <FaPrint />
//                             </button>
//                             <button
//                               className="text-teal-600 hover:text-teal-800 text-lg p-1 hover:bg-teal-50 rounded transition-colors"
//                               onClick={() => handleTagihanClick(member)}
//                               title="Lihat Tagihan"
//                             >
//                               <FaFileInvoiceDollar />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                 )}
//               </tbody>
//               {isPopupVisible && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
//                   <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative space-y-6  overflow-y-auto  max-h-screen">
//                     <button
//                       type="button"
//                       className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
//                       onClick={closePopup}
//                     >
//                       ✕
//                     </button>
//                     <h2 className="text-center text-2xl font-bold text-white bg-red-700 py-2 rounded">
//                       Form Keuangan
//                     </h2>

//                     <div className="flex flex-col md:flex-row gap-4 items-start">
//                       <div className="flex gap-4 w-full md:w-2/3">
//                         <Image
//                           src={
//                             fotoBase64
//                               ? `data:image/jpeg;base64,${fotoBase64}`
//                               : profileImageUrl
//                           }
//                           width={100}
//                           height={100}
//                           alt="Foto User"
//                           className="w-24 h-28 object-cover rounded-lg border"
//                           unoptimized={true}
//                         />

//                         <div className="text-sm space-y-1">
//                           {dataNpa ? (
//                             <>
//                               <p>
//                                 <strong>{dataNpa.namaLengkap}</strong>
//                               </p>
//                               <p>
//                                 Tempat, Tanggal Lahir: {dataNpa.tempatLahir},
//                                 {dataNpa.tanggalLahir?.[2]}-
//                                 {dataNpa.tanggalLahir?.[1]}-
//                                 {dataNpa.tanggalLahir?.[0]}
//                               </p>
//                               <p>Nomor Anggota PGRI: {dataNpa.npaPgri}</p>
//                               <p>Nomor Induk Pegawai: {dataNpa.nip}</p>
//                               <p>Nomor Induk Kependudukan: {dataNpa.nik}</p>
//                             </>
//                           ) : (
//                             <p>Loading data anggota...</p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="w-full md:w-1/3 text-sm">
//                         {dataNpa && (
//                           <>
//                             <p>
//                               <strong>{dataNpa.cabang}</strong>,{" "}
//                             </p>
//                             <p>{dataNpa.jabatan}</p>
//                             <p>{dataNpa.unitKerja}</p>
//                           </>
//                         )}
//                       </div>
//                     </div>

//                     {/* Form Input Data */}
//                     <div className="gap-6">
//                       {/* Nomor Rekening */}
//                       <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Nomor Rekening
//                         </label>
//                         <input
//                           type="text"
//                           placeholder="Masukkan Nomor Rekening"
//                           value={nomorRekening}
//                           onChange={(e) => setNomorRekening(e.target.value)}
//                           className="w-full border border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
//                         />
//                       </div>

//                       {/* Tagihan Untuk Bulan */}
//                       <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//                         <label className="block text-sm font-medium text-gray-700 mb-3">
//                           Tagihan Untuk Bulan
//                         </label>
//                         <div className="flex gap-4">
//                           {/* Select Bulan */}
//                           <div className="flex-1">
//                             <label className="block text-xs text-gray-600 mb-1">
//                               Bulan
//                             </label>
//                             <select
//                               value={selectedMonth}
//                               onChange={(e) =>
//                                 setSelectedMonth(parseInt(e.target.value))
//                               }
//                               className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
//                             >
//                               <option value={1}>Januari</option>
//                               <option value={2}>Februari</option>
//                               <option value={3}>Maret</option>
//                               <option value={4}>April</option>
//                               <option value={5}>Mei</option>
//                               <option value={6}>Juni</option>
//                               <option value={7}>Juli</option>
//                               <option value={8}>Agustus</option>
//                               <option value={9}>September</option>
//                               <option value={10}>Oktober</option>
//                               <option value={11}>November</option>
//                               <option value={12}>Desember</option>
//                             </select>
//                           </div>

//                           {/* Select Tahun */}
//                           <div className="flex-1">
//                             <label className="block text-xs text-gray-600 mb-1">
//                               Tahun
//                             </label>
//                             <select
//                               value={selectedYear}
//                               onChange={(e) =>
//                                 setSelectedYear(parseInt(e.target.value))
//                               }
//                               className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
//                             >
//                               {Array.from({ length: 10 }, (_, i) => {
//                                 const year = new Date().getFullYear() + i - 5;
//                                 return (
//                                   <option key={year} value={year}>
//                                     {year}
//                                   </option>
//                                 );
//                               })}
//                             </select>
//                           </div>

//                           {/* Display Current Selection */}
//                           <div className="flex-1">
//                             <label className="block text-xs text-gray-600 mb-1">
//                               Dipilih
//                             </label>
//                             <div className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-sm font-medium">
//                               {selectedMonth.toString().padStart(2, "0")}-
//                               {selectedYear}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Informasi */}
//                         <p className="text-xs text-gray-500 mt-2">
//                           Data akan diupdate untuk bulan dan tahun yang dipilih
//                         </p>
//                       </div>

//                       <div className="space-y-2">
//                         {groupedIuran
//                           .filter(
//                             (item) =>
//                               parseInt(item.iuran || 0) +
//                                 parseInt(item.manual || 0) >
//                                 0 && !item.isSumbanganDetail
//                           )
//                           .map((item, idx) => {
//                             const isReset = resetKeys.includes(item.key);
//                             const oldValue = isReset
//                               ? 0
//                               : parseInt(item.iuran || 0);
//                             const inputValue = isReset
//                               ? 0
//                               : nominalBaruList[item.key] || 0;
//                             const totalValue = oldValue + inputValue;

//                             return (
//                               <div
//                                 key={idx}
//                                 className="space-y-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
//                               >
//                                 <div className="flex items-center justify-between">
//                                   <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
//                                     {item.key}
//                                   </span>
//                                   <button
//                                     type="button"
//                                     className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
//                                     onClick={() => {
//                                       setResetKeys((prev) => [
//                                         ...prev,
//                                         item.key,
//                                       ]);
//                                       setNominalBaruList((prev) => ({
//                                         ...prev,
//                                         [item.key]: 0,
//                                       }));
//                                     }}
//                                   >
//                                     <FiTrash size={16} />
//                                   </button>
//                                 </div>

//                                 <div className="grid grid-cols-3 gap-3">
//                                   <div>
//                                     <label className="block text-xs text-gray-500 mb-1">
//                                       Default
//                                     </label>
//                                     <input
//                                       type="text"
//                                       readOnly
//                                       value={`Rp. ${oldValue.toLocaleString(
//                                         "id-ID"
//                                       )}`}
//                                       className="w-full border border-gray-300 px-3 py-2 rounded text-center bg-gray-50 text-gray-700 font-medium"
//                                     />
//                                   </div>

//                                   <div>
//                                     <label className="block text-xs text-gray-500 mb-1">
//                                       Tambahan Cabang
//                                     </label>
//                                     <input
//                                       type="text"
//                                       placeholder="Rp. 0"
//                                       value={
//                                         inputValue === 0
//                                           ? ""
//                                           : `Rp. ${inputValue.toLocaleString(
//                                               "id-ID"
//                                             )}`
//                                       }
//                                       onChange={(e) => {
//                                         const angka =
//                                           parseInt(
//                                             e.target.value.replace(/[^\d]/g, "")
//                                           ) || 0;
//                                         setNominalBaruList((prev) => ({
//                                           ...prev,
//                                           [item.key]: angka,
//                                         }));
//                                       }}
//                                       className="w-full border border-blue-300 px-3 py-2 rounded text-center bg-white text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                   </div>

//                                   <div>
//                                     <label className="block text-xs text-gray-500 mb-1">
//                                       Total
//                                     </label>
//                                     <input
//                                       type="text"
//                                       readOnly
//                                       value={`Rp. ${totalValue.toLocaleString(
//                                         "id-ID"
//                                       )}`}
//                                       className="w-full border border-green-300 px-3 py-2 rounded text-center bg-green-50 text-green-700 font-medium"
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}

//                         {/* Tampilkan iuranSumbanganList dari API */}
//                         {sumbanganList.length > 0 && (
//                           <div className="mt-4">
//                             <h4 className="font-semibold text-purple-700 mb-2">
//                               Sumbangan Lainnya:
//                             </h4>
//                             {sumbanganList.map((sumbangan, index) => {
//                               const jumlahValue = parseInt(
//                                 sumbangan.jumlah || 0
//                               );
//                               const isDeleted = jumlahValue === 0;

//                               return (
//                                 <div
//                                   key={index}
//                                   className={`space-y-1 px-3 py-2 rounded-md border-l-4 mb-2 ${
//                                     isDeleted
//                                       ? "bg-gray-100 border-gray-400 opacity-60"
//                                       : "bg-purple-50 border-purple-400"
//                                   }`}
//                                 >
//                                   <div className="flex items-center justify-between">
//                                     <span
//                                       className={`font-medium ${
//                                         isDeleted
//                                           ? "text-gray-500"
//                                           : "text-purple-800"
//                                       }`}
//                                     >
//                                       {sumbangan.jenis}
//                                       {isDeleted && (
//                                         <span className="text-red-500 ml-2 text-sm">
//                                           (Dihapus)
//                                         </span>
//                                       )}
//                                     </span>

//                                     {/* Tombol Trash - selalu tampil, bahkan untuk yang sudah di-delete */}
//                                     <button
//                                       type="button"
//                                       className={`p-1 rounded-full transition-colors ${
//                                         isDeleted
//                                           ? "text-gray-400 cursor-not-allowed"
//                                           : "text-red-500 hover:text-red-700 hover:bg-red-50"
//                                       }`}
//                                       onClick={() =>
//                                         !isDeleted &&
//                                         handleDeleteSumbangan(sumbangan.jenis)
//                                       }
//                                       disabled={isDeleted}
//                                       title={
//                                         isDeleted
//                                           ? "Sudah dihapus"
//                                           : "Hapus item"
//                                       }
//                                     >
//                                       <FiTrash size={16} />
//                                     </button>
//                                   </div>

//                                   <div className="grid grid-cols-3 gap-2 mt-2">
//                                     <div>
//                                       <label className="block text-xs text-gray-500 mb-1">
//                                         Nilai Sumbangan
//                                       </label>
//                                       <input
//                                         type="text"
//                                         readOnly
//                                         value={`Rp. ${jumlahValue.toLocaleString(
//                                           "id-ID"
//                                         )}`}
//                                         className={`w-full border px-2 py-1 rounded text-center font-medium ${
//                                           isDeleted
//                                             ? "bg-gray-200 text-gray-500"
//                                             : "bg-purple-100 text-purple-700"
//                                         }`}
//                                       />
//                                     </div>

//                                     <div>
//                                       <label className="block text-xs text-gray-500 mb-1">
//                                         Tambahan Cabang
//                                       </label>
//                                       <input
//                                         type="text"
//                                         readOnly
//                                         value={
//                                           isDeleted
//                                             ? "Dihapus"
//                                             : "Tidak bisa diubah"
//                                         }
//                                         className={`w-full border px-2 py-1 rounded text-center ${
//                                           isDeleted
//                                             ? "bg-gray-200 text-gray-500"
//                                             : "bg-gray-100 text-gray-500"
//                                         }`}
//                                       />
//                                     </div>

//                                     <div>
//                                       <label className="block text-xs text-gray-500 mb-1">
//                                         Total
//                                       </label>
//                                       <input
//                                         type="text"
//                                         readOnly
//                                         value={`Rp. ${jumlahValue.toLocaleString(
//                                           "id-ID"
//                                         )}`}
//                                         className={`w-full border px-2 py-1 rounded text-center font-medium ${
//                                           isDeleted
//                                             ? "bg-gray-200 text-gray-500"
//                                             : "bg-purple-100 text-purple-700"
//                                         }`}
//                                       />
//                                     </div>
//                                   </div>

//                                   {/* Informasi tambahan jika ada */}
//                                   {sumbangan.keterangan && (
//                                     <p
//                                       className={`text-xs mt-1 ${
//                                         isDeleted
//                                           ? "text-gray-400"
//                                           : "text-gray-600"
//                                       }`}
//                                     >
//                                       Keterangan: {sumbangan.keterangan}
//                                     </p>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}

//                         {/* 🔹 Tambahan kategori manual */}
//                         {addedCategories.map((item, idx) => {
//                           const oldValue = newValues[item.key] ?? 0;
//                           const inputValue = manualInputs[item.key] ?? 0;
//                           const totalValue = oldValue + inputValue;

//                           // Tentukan display name
//                           const displayName =
//                             item.keterangan || item.label || item.key;

//                           return (
//                             <div
//                               key={`added-${idx}`}
//                               className="space-y-2 p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 hover:border-yellow-500 transition-colors"
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span className="font-semibold text-yellow-800">
//                                   {displayName}
//                                 </span>
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     const updatedCategories =
//                                       addedCategories.filter(
//                                         (_, i) => i !== idx
//                                       );
//                                     setAddedCategories(updatedCategories);
//                                     setManualInputs((prev) => {
//                                       const newInputs = { ...prev };
//                                       delete newInputs[item.key];
//                                       return newInputs;
//                                     });
//                                     setNewValues((prev) => {
//                                       const newValues = { ...prev };
//                                       delete newValues[item.key];
//                                       return newValues;
//                                     });
//                                   }}
//                                   className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
//                                 >
//                                   <FiTrash size={16} />
//                                 </button>
//                               </div>

//                               <div className="grid grid-cols-3 gap-3">
//                                 <div>
//                                   <label className="block text-xs text-yellow-600 mb-1">
//                                     Default
//                                   </label>
//                                   <input
//                                     type="text"
//                                     readOnly
//                                     value={`Rp. ${oldValue.toLocaleString(
//                                       "id-ID"
//                                     )}`}
//                                     className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-yellow-100 text-yellow-700 font-medium"
//                                   />
//                                 </div>

//                                 <div>
//                                   <label className="block text-xs text-yellow-600 mb-1">
//                                     Tambahan
//                                   </label>
//                                   <input
//                                     type="text"
//                                     placeholder="Rp. 0"
//                                     value={
//                                       inputValue === 0
//                                         ? ""
//                                         : `Rp. ${inputValue.toLocaleString(
//                                             "id-ID"
//                                           )}`
//                                     }
//                                     onChange={(e) => {
//                                       const angka =
//                                         parseInt(
//                                           e.target.value.replace(/[^\d]/g, "")
//                                         ) || 0;
//                                       setManualInputs((prev) => ({
//                                         ...prev,
//                                         [item.key]: angka,
//                                       }));
//                                     }}
//                                     className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-white text-yellow-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                                   />
//                                 </div>

//                                 <div>
//                                   <label className="block text-xs text-yellow-600 mb-1">
//                                     Total
//                                   </label>
//                                   <input
//                                     type="text"
//                                     readOnly
//                                     value={`Rp. ${totalValue.toLocaleString(
//                                       "id-ID"
//                                     )}`}
//                                     className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-yellow-100 text-yellow-700 font-medium"
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}

//                         {/* Total */}
//                         <div className="flex items-center justify-between bg-purple-200 px-3 py-2 rounded-md font-bold mt-4">
//                           <span>Total</span>
//                           <span>Rp. {grandTotal.toLocaleString("id-ID")}</span>
//                         </div>

//                         {/* Form Tambah Kategori */}
//                         <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-300 p-4 mt-6">
//                           <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
//                             <span className="bg-purple-600 text-white p-2 rounded-full mr-3">
//                               <FiPlus size={18} />
//                             </span>
//                             Tambah Keuangan
//                           </h3>

//                           <button
//                             onClick={() => setShowDropdown(!showDropdown)}
//                             className="flex items-center text-blue-600 hover:text-blue-800 mb-4 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors w-full"
//                           >
//                             <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
//                               <FiPlus size={16} />
//                             </span>
//                             <span className="font-medium">
//                               Tambah Kategori Baru
//                             </span>
//                           </button>

//                           {showDropdown && (
//                             <div className="space-y-4 bg-white p-4 rounded-lg border border-blue-200">
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                   Pilih Kategori Tambahan
//                                 </label>
//                                 <select
//                                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                   value={selectedKategori}
//                                   onChange={(e) =>
//                                     setSelectedKategori(e.target.value)
//                                   }
//                                 >
//                                   <option value="">-- Pilih Kategori --</option>
//                                   <option value="pgri">PGRI</option>
//                                   <option value="sanduka">Sanduka</option>
//                                   <option value="daspen">
//                                     Daspen{" "}
//                                     {notifDaspen === true
//                                       ? " (✓ Sinkron)"
//                                       : notifDaspen === false
//                                       ? " (× Tidak Sinkron)"
//                                       : " (× Tidak Sinkron)"}
//                                   </option>
//                                   <option value="kalender">Kalender</option>
//                                   <option value="derap">Derap</option>
//                                   <option value="lainlain">Lain-Lain</option>
//                                 </select>
//                               </div>

//                               {selectedKategori === "lainlain" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Pilih Keterangan
//                                   </label>
//                                   <select
//                                     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                                     value={selectedKeterangan}
//                                     onChange={(e) =>
//                                       setSelectedKeterangan(e.target.value)
//                                     }
//                                   >
//                                     <option value="">
//                                       -- Pilih Keterangan --
//                                     </option>
//                                     {Array.isArray(keteranganLainLain) &&
//                                     keteranganLainLain.length > 0 ? (
//                                       keteranganLainLain.map((item, index) => (
//                                         <option key={index} value={item}>
//                                           {item}
//                                         </option>
//                                       ))
//                                     ) : (
//                                       <option disabled>
//                                         Tidak ada data keterangan
//                                       </option>
//                                     )}
//                                   </select>
//                                 </div>
//                               )}

//                               {selectedKategori && (
//                                 <div className="flex justify-end space-x-3 pt-2">
//                                   <button
//                                     onClick={() => setShowDropdown(false)}
//                                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                   >
//                                     Batal
//                                   </button>
//                                   <button
//                                     onClick={handleSave}
//                                     className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
//                                   >
//                                     <FiSave className="mr-2" size={16} />
//                                     Simpan Kategori
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-4 pt-4">
//                       <button
//                         className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//                         onClick={closePopup}
//                       >
//                         Batal
//                       </button>
//                       <button
//                         type="button"
//                         className={`flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded ${
//                           loadButton
//                             ? "opacity-60 cursor-not-allowed"
//                             : "hover:bg-blue-700"
//                         }`}
//                         onClick={async () => {
//                           if (loadButton) return;
//                           setLoadButton(true);
//                           try {
//                             await handleUpdateClick();
//                           } finally {
//                             setLoadButton(false);
//                           }
//                         }}
//                         disabled={loadButton}
//                       >
//                         {loadButton ? (
//                           <>
//                             <svg
//                               className="animate-spin h-5 w-5 mr-2"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               />
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                               />
//                             </svg>
//                             Loading...
//                           </>
//                         ) : (
//                           "Update"
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {isModalOpen && selectedMember && dataIuran && (
//                 <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//                   <div className="bg-white p-6 rounded-lg w-[800px] relative shadow-lg">
//                     <button
//                       className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
//                       onClick={closeModal}
//                     >
//                       ✕
//                     </button>

//                     <div className="bg-blue-100 p-5 rounded-lg">
//                       <h2 className="text-center text-blue-900 font-bold text-xl mb-3">
//                         Data KEUANGAN ANGGOTA
//                       </h2>

//                       <div className="flex gap-4">
//                         <Image
//                           src={
//                             fotoBase64
//                               ? `data:image/jpeg;base64,${fotoBase64}`
//                               : profileImageUrl
//                           }
//                           width={100}
//                           height={100}
//                           alt="Foto User"
//                           className="w-24 h-28 object-cover rounded-lg border"
//                           unoptimized={true}
//                         />
//                         <div className="flex-1 text-sm">
//                           <p>
//                             <span className="font-bold text-green-800 text-lg uppercase">
//                               {dataIuran.namaAnggota}
//                             </span>
//                           </p>
//                           <p>
//                             Tempat, Tanggal Lahir:{" "}
//                             {dataIuran.tempatTanggalLahir}
//                           </p>
//                           <p>
//                             Nomor Anggota PGRI: <strong>{dataIuran.npa}</strong>
//                           </p>
//                           <p>
//                             Nomor Induk Pegawai: <em>{dataIuran.nip}</em>
//                           </p>
//                           <p>
//                             Nomor Induk Kependudukan: <em>{dataIuran.nik}</em>
//                           </p>
//                         </div>
//                         <div className="text-sm text-left">
//                           <p>{dataIuran.cabang}</p>
//                           <p>{dataIuran.jabatan}</p>
//                           <p>{dataIuran.unitKerja}</p>
//                         </div>
//                       </div>

//                       <div className="mt-5 text-sm">
//                         <p>
//                           Nomor Rekening: <em>{dataIuran.nomorRekening}</em>
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Iuran Anggota
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.totalIuranAnggota || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Sanduka
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.totalIuranSanduka || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Daspen
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.totalIuranDaspen || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Derap
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.totalIuranDerap || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Kalender
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.totalIuranKalender || 0).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                         <p>
//                           <span className="inline-block min-w-[140px]">
//                             Sumbangan
//                           </span>
//                           : Rp.{" "}
//                           {(dataIuran.lainLain || 0).toLocaleString("id-ID")}
//                         </p>

//                         <hr className="my-2 border-t-2 border-gray-300" />

//                         <p className="font-bold mt-2">
//                           <span className="inline-block min-w-[140px]">
//                             Total Keseluruhan
//                           </span>
//                           : Rp.{" "}
//                           {(
//                             (dataIuran.totalIuranAnggota || 0) +
//                             (dataIuran.totalIuranSanduka || 0) +
//                             (dataIuran.totalIuranDaspen || 0) +
//                             (dataIuran.totalIuranDerap || 0) +
//                             (dataIuran.totalIuranKalender || 0) +
//                             (dataIuran.lainLain || 0)
//                           ).toLocaleString("id-ID")}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {showUploadModal && (
//                 <>
//                   <div
//                     className="fixed inset-0 bg-black opacity-50 z-40"
//                     onClick={handleCloseModal}
//                   ></div>
//                   <div className="fixed inset-0 flex items-center justify-center z-50">
//                     <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
//                       <button
//                         className="absolute top-2 right-2 text-gray-500"
//                         onClick={handleCloseModal}
//                       >
//                         <svg
//                           className="w-6 h-6"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                       <h2 className="text-xl font-bold mb-4">Upload Data</h2>
//                       <form onSubmit={handleSubmitUpload}>
//                         <div className="mb-4">
//                           <label className="block text-gray-700 text-sm font-bold mb-2">
//                             Upload File
//                           </label>
//                           <input
//                             type="file"
//                             name="file"
//                             onChange={handleInputChange}
//                             className="block w-full mt-1"
//                           />
//                         </div>
//                         <div className="mb-4">
//                           <label className="block text-gray-700 text-sm font-bold mb-2">
//                             Nama File
//                           </label>
//                           <input
//                             type="text"
//                             name="namaFile"
//                             onChange={handleInputChange}
//                             className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                             placeholder="Contoh: Potongan Bank Bulan Mei"
//                           />
//                         </div>
//                         <div className="mb-4">
//                           <label className="block text-gray-700 text-sm font-bold mb-2">
//                             Tanggal Untuk
//                           </label>
//                           <input
//                             type="date"
//                             name="tanggalUntuk"
//                             onChange={handleInputChange}
//                             className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                           />
//                         </div>
//                         <div className="flex justify-end">
//                           <button
//                             type="button"
//                             onClick={handleCloseModal}
//                             className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
//                           >
//                             Cancel
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
//                             disabled={loader}
//                           >
//                             {loader ? `Uploading... ${progress}%` : "Submit"}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 </>
//               )}
//               <tfoot>
//                 <tr className="bg-teal-700 text-white font-bold">
//                   <td colSpan={2} className="p-3 text-center">
//                     Total Keseluruhan:
//                   </td>
//                   <td className="p-3 text-center"></td>
//                   <td className="p-3 text-center"></td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.pgri || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.sanduka || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.daspen || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.derap || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.kalender || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.sumbangan || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-right text-sm font-bold">
//                     Rp.{" "}
//                     {groupedData
//                       .flatMap((g) => g.members || [])
//                       .reduce((sum, m) => sum + parseInt(m.totalIuran || 0), 0)
//                       .toLocaleString("id-ID")}
//                   </td>
//                   <td className="p-3 text-center"></td>
//                 </tr>
//               </tfoot>
//             </table>

//             <div className="bg-white p-4 rounded-b-lg border-t border-gray-200 text-sm text-gray-500 flex justify-between">
//               <div>Menampilkan {groupedData.length} unit kerja</div>
//               <div>
//                 Total anggota:{" "}
//                 {groupedData.reduce((sum, g) => sum + parseInt(g.jumlah), 0)}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RekapAnggota;

"use client";
import React from "react";
import Image from "next/image";
import { FaTools } from "react-icons/fa";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-6 animate-bounce">
          <FaTools className="text-6xl text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Situs Sedang Dalam Perbaikan
        </h1>
        <p className="text-gray-600 mb-6">
          Kami sedang melakukan perawatan sistem untuk meningkatkan layanan.
          <br />
          Silakan kembali lagi nanti.
        </p>
      </div>
      <p className="mt-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Sanduka. Semua Hak Dilindungi.
      </p>
    </div>
  );
}
