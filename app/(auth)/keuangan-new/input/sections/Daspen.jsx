"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx-js-style';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  FaHandHoldingHeart,
  FaUsers,
  FaSave,
  FaSearch,
  FaCog,
  FaCalculator,
  FaFileExcel,
  FaFilePdf,
  FaUpload,
  FaEdit,
  FaTrash
} from "react-icons/fa";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

const DaspenSection = () => {
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [autoKat1, setAutoKat1] = useState(0);
  const [autoKat2, setAutoKat2] = useState(0);
  const [autoKat3, setAutoKat3] = useState(0);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [targetData, setTargetData] = useState([]);
  const [rawAggregatedData, setRawAggregatedData] = useState([]);

  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown Cabang Standard State
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [searchDropCabang, setSearchDropCabang] = useState("");
  const cabangRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCabangSearch = (query) => {
    setSearchDropCabang(query);
    const filtered = cabangList.filter((cab) =>
      (cab.kecamatan || "").toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = (cabangName) => {
    setSearchQuery(cabangName);
    setShowCabangDropdown(false);
    setSearchDropCabang("");
  };

  const [isUploadingDaspen, setIsUploadingDaspen] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, data: null });

  const kat1Val = kuota * katagori1;
  const kat2Val = kuota * katagori2;
  const kat3Val = kuota * katagori3;
  const totalTarget = (kat1Val * kat1) + (kat2Val * kat2) + (kat3Val * kat3);

  const autoTotalAnggota = autoKat1 + autoKat2 + autoKat3;
  const autoTotalTarget = (autoKat1 * kat1Val) + (autoKat2 * kat2Val) + (autoKat3 * kat3Val);

  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, jenis: "", cabang: "" });

  const tableRef = useRef(null);
  const printRef = useRef(null);

  const handleExportExcel = () => {
    const toastId = toast.loading("Menyiapkan data Excel yang rapi...");
    try {
      const filteredCabangs = uniqueCabangs.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const excelData = [];

      let tAutoAng = 0, tProvAng = 0, tRealAng = 0;
      let tAutoK1 = 0, tProvK1 = 0, tRealK1 = 0;
      let tAutoNomK1 = 0, tProvNomK1 = 0, tRealNomK1 = 0;
      let tAutoK2 = 0, tProvK2 = 0, tRealK2 = 0;
      let tAutoNomK2 = 0, tProvNomK2 = 0, tRealNomK2 = 0;
      let tAutoK3 = 0, tProvK3 = 0, tRealK3 = 0;
      let tAutoNomK3 = 0, tProvNomK3 = 0, tRealNomK3 = 0;
      let tAutoTotNom = 0, tProvTotNom = 0, tRealTotNom = 0;
      let tAutoTrans = 0, tAutoSel = 0, tAutoKurang = 0;

      filteredCabangs.forEach((cabangName, i) => {
                      let autoK1 = 0, autoK2 = 0, autoK3 = 0, autoTransfer = 0, autoTunai = 0;
        const targetK1 = Math.round(kat1Val);
        const targetK2 = Math.round(kat2Val);
        const targetK3 = Math.round(kat3Val);

        const cabAggregated = rawAggregatedData.filter(r => r.cabang?.toUpperCase() === cabangName.toUpperCase());

        cabAggregated.forEach(item => {
          const tagihan = Math.round(parseFloat(item.totalIuranDaspen) || 0);

          if (tagihan === targetK1 && targetK1 > 0) {
            autoK1++;
          } else if (tagihan === targetK2 && targetK2 > 0) {
            autoK2++;
          } else if (tagihan === targetK3 && targetK3 > 0) {
            autoK3++;
          }

          const manualDaspen = parseFloat(item.manualDaspen || item.manual_daspen) || 0;

          if (manualDaspen > 0) {
            autoTransfer += manualDaspen;
          } else if (item.keterangan?.toLowerCase() === "sukses") {
            autoTransfer += tagihan;
          } else if (item.keterangan?.toLowerCase() === "tunai") {
            autoTunai += tagihan;
          }
        });

        const sandukaDB = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'SANDUKA');
        const daspen = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'DASPEN');

        const nomAutoK1 = autoK1 * kat1Val; const nomAutoK2 = autoK2 * kat2Val; const nomAutoK3 = autoK3 * kat3Val;
        const totAutoNominal = nomAutoK1 + nomAutoK2 + nomAutoK3;
        const autoSelisih = totAutoNominal - autoTransfer;
        const autoPerunCabang = totAutoNominal * CABANG_PERCENTAGE;
        const autoPerunKabupaten = totAutoNominal * KABUPATEN_PERCENTAGE;
        const autoTagihan = totAutoNominal - autoPerunCabang;

        const pk1 = daspen ? parseInt(daspen.kategori1) : 0;
        const pk2 = daspen ? parseInt(daspen.kategori2) : 0;
        const pk3 = daspen ? parseInt(daspen.kategori3) : 0;
        const pNomK1 = daspen ? parseFloat(daspen.valueKat1) : 0;
        const pNomK2 = daspen ? parseFloat(daspen.valueKat2) : 0;
        const pNomK3 = daspen ? parseFloat(daspen.valueKat3) : 0;
        const pTotNominal = daspen ? (pNomK1 + pNomK2 + pNomK3) : 0;

        const dbK1 = sandukaDB ? parseInt(sandukaDB.kategori1) : 0;
        const dbK2 = sandukaDB ? parseInt(sandukaDB.kategori2) : 0;
        const dbK3 = sandukaDB ? parseInt(sandukaDB.kategori3) : 0;
        const nomDbK1 = sandukaDB ? parseFloat(sandukaDB.valueKat1) : 0;
        const nomDbK2 = sandukaDB ? parseFloat(sandukaDB.valueKat2) : 0;
        const nomDbK3 = sandukaDB ? parseFloat(sandukaDB.valueKat3) : 0;
        const totDbNominal = sandukaDB ? parseFloat(sandukaDB.totalTarget || (nomDbK1 + nomDbK2 + nomDbK3)) : 0;
        const dbTransfer = sandukaDB ? parseFloat(sandukaDB.transfer || 0) : 0;
        const dbSelisih = sandukaDB ? (totDbNominal - dbTransfer) : 0;
        const dbPemb1 = sandukaDB ? parseFloat(sandukaDB.pembayaran1 || 0) : 0;
        const dbPemb2 = sandukaDB ? parseFloat(sandukaDB.pembayaran2 || 0) : 0;
        const dbKurangSetor = sandukaDB ? (totDbNominal - dbTransfer - dbPemb1 - dbPemb2) : 0;

        const activeTransfer = sandukaDB ? dbTransfer : autoTransfer;
        const activeSelisih = sandukaDB ? dbSelisih : autoSelisih;
        const activePemb1 = sandukaDB ? dbPemb1 : 0;
        const activePemb2 = sandukaDB ? dbPemb2 : 0;
        const activeKurang = sandukaDB ? dbKurangSetor : autoSelisih;

        const activeMembers = cabAggregated.length > 0 ? cabAggregated.reduce((sum, item) => sum + (parseInt(item.jumlah) || 1), 0) : 0;
        const pTotAnggota = daspen ? (pk1 + pk2 + pk3) : 0;
        const dbTotAnggota = sandukaDB ? (dbK1 + dbK2 + dbK3) : 0;

        tAutoAng += activeMembers; tProvAng += pTotAnggota; tRealAng += dbTotAnggota;
        tAutoK1 += autoK1; tProvK1 += pk1; tRealK1 += dbK1;
        tAutoNomK1 += nomAutoK1; tProvNomK1 += pNomK1; tRealNomK1 += nomDbK1;
        tAutoK2 += autoK2; tProvK2 += pk2; tRealK2 += dbK2;
        tAutoNomK2 += nomAutoK2; tProvNomK2 += pNomK2; tRealNomK2 += nomDbK2;
        tAutoK3 += autoK3; tProvK3 += pk3; tRealK3 += dbK3;
        tAutoNomK3 += nomAutoK3; tProvNomK3 += pNomK3; tRealNomK3 += nomDbK3;
        tAutoTotNom += totAutoNominal; tProvTotNom += pTotNominal; tRealTotNom += totDbNominal;
        tAutoTrans += autoTransfer; tAutoSel += autoSelisih; tAutoKurang += autoSelisih;

        excelData.push({
          "No": i + 1,
          "Cabang / Khusus": cabangName,
          "Tipe Data": "AUTO",
          "Total Anggota": activeMembers,
          "Kat I": autoK1, "Nominal I": nomAutoK1,
          "Kat II": autoK2, "Nominal II": nomAutoK2,
          "Kat III": autoK3, "Nominal III": nomAutoK3,
          "Total Nominal": totAutoNominal,
          "Transfer": activeTransfer,
          "Selisih": activeSelisih,
          "Pembayaran 1": activePemb1,
          "Pembayaran 2": activePemb2,
          "Kurang Setor": activeKurang
        });

        excelData.push({
          "No": "",
          "Cabang / Khusus": "",
          "Tipe Data": "DASPEN",
          "Total Anggota": pTotAnggota,
          "Kat I": pk1, "Nominal I": pNomK1,
          "Kat II": pk2, "Nominal II": pNomK2,
          "Kat III": pk3, "Nominal III": pNomK3,
          "Total Nominal": pTotNominal,
          "Transfer": "", "Selisih": "", "Pembayaran 1": "", "Pembayaran 2": "", "Kurang Setor": ""
        });

        excelData.push({
          "No": "",
          "Cabang / Khusus": "",
          "Tipe Data": "REALISASI",
          "Total Anggota": dbTotAnggota,
          "Kat I": dbK1, "Nominal I": nomDbK1,
          "Kat II": dbK2, "Nominal II": nomDbK2,
          "Kat III": dbK3, "Nominal III": nomDbK3,
          "Total Nominal": totDbNominal,
          "Transfer": "", "Selisih": "", "Pembayaran 1": "", "Pembayaran 2": "", "Kurang Setor": ""
        });
      });

      excelData.push({});

      excelData.push({
        "No": "", "Cabang / Khusus": "TOTAL REKAPITULASI", "Tipe Data": "AUTO",
        "Total Anggota": tAutoAng,
        "Kat I": tAutoK1, "Nominal I": tAutoNomK1,
        "Kat II": tAutoK2, "Nominal II": tAutoNomK2,
        "Kat III": tAutoK3, "Nominal III": tAutoNomK3,
        "Total Nominal": tAutoTotNom,
        "Transfer": tAutoTrans, "Selisih": tAutoSel, "Pembayaran 1": 0, "Pembayaran 2": 0, "Kurang Setor": tAutoKurang
      });

      excelData.push({
        "No": "", "Cabang / Khusus": "", "Tipe Data": "DASPEN",
        "Total Anggota": tProvAng,
        "Kat I": tProvK1, "Nominal I": tProvNomK1,
        "Kat II": tProvK2, "Nominal II": tProvNomK2,
        "Kat III": tProvK3, "Nominal III": tProvNomK3,
        "Total Nominal": tProvTotNom,
        "Transfer": "", "Selisih": "", "Pembayaran 1": "", "Pembayaran 2": "", "Kurang Setor": ""
      });

      excelData.push({
        "No": "", "Cabang / Khusus": "", "Tipe Data": "REALISASI",
        "Total Anggota": tRealAng,
        "Kat I": tRealK1, "Nominal I": tRealNomK1,
        "Kat II": tRealK2, "Nominal II": tRealNomK2,
        "Kat III": tRealK3, "Nominal III": tRealNomK3,
        "Total Nominal": tRealTotNom,
        "Transfer": "", "Selisih": "", "Pembayaran 1": "", "Pembayaran 2": "", "Kurang Setor": ""
      });

      const ws = XLSX.utils.json_to_sheet(excelData);

      const range = XLSX.utils.decode_range(ws['!ref']);

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

          if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };

          ws[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: { vertical: "center", horizontal: "right" }
          };

          if (R === 0) {
            ws[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
            ws[cellAddress].s.fill = { fgColor: { rgb: "1E293B" } };
            ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
          }

          if (C <= 2 && R > 0) {
            ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
            ws[cellAddress].s.font = { bold: true };
          }
        }
      }

      ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 },
        { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Daspen");
      XLSX.writeFile(wb, `Rekap_Daspen_${selectedMonth}_${selectedYear}.xlsx`);

      toast.success("File Excel super rapi berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat Excel", { id: toastId });
    }
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    const toastId = toast.loading("Mengunduh dokumen PDF secara utuh...");

    try {
      const tableContainer = element.querySelector('.overflow-x-auto');

      element.classList.remove('overflow-hidden');
      if (tableContainer) {
        tableContainer.classList.remove('overflow-x-auto');
        tableContainer.style.overflow = 'visible';
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY
      });

      element.classList.add('overflow-hidden');
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.style.overflow = '';
      }

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Rekap_Daspen_${selectedMonth}_${selectedYear}.pdf`);

      toast.success("PDF utuh berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error(error);

      element.classList.add('overflow-hidden');
      const tableContainer = element.querySelector('.overflow-x-auto');
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.style.overflow = '';
      }

      toast.error("Gagal membuat PDF", { id: toastId });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(4)
      ]);

      setBulanList(resBulan.data || []);
      const sortedCabang = (resCabang.data || []).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
      setCabangList(sortedCabang);

      if (resIuran) {
        setKuota(parseInt(resIuran.pb) || 700);
        setKatagori1(parseFloat(resIuran.propinsi) || 0);
        setKatagori2(parseFloat(resIuran.kabupaten) || 0);
        setKatagori3(parseFloat(resIuran.cabang) || 0);
      }

      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth]) {
        setSelectedMonth(resBulan.data[currentMonth].namaBulan);
      }
    } catch (error) {
      console.error("Error fetching Daspen data:", error);
    }
  };

  const fetchTableData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    try {
      let [resTable, resTargets] = await Promise.all([
        GlobalApi.getTableDaspen(selectedMonth, selectedYear, [], ""),
        GlobalApi.getAllTargetDaspen()
      ]);

      let filteredTable = resTable.filter(row => row["Cabang/Khusus"] !== "Jumlah" && row.cabang !== "Jumlah");

      let filteredTargets = resTargets.filter(row =>
        row.bulan?.toUpperCase() === selectedMonth.toUpperCase() &&
        row.tahun?.toString() === selectedYear.toString()
      );

      // Isi cabang yg belum punya data dari bulan sebelumnya
      const currentMonthId = monthNames.indexOf(selectedMonth) + 1;

      let prevMonthId = currentMonthId - 1;
      let prevYear = selectedYear;
      if (prevMonthId < 1) { prevMonthId = 12; prevYear = selectedYear - 1; }

      const prevMonthName = monthNames[prevMonthId - 1];

      const [prevTable, prevAllTargets] = await Promise.all([
        GlobalApi.getTableDaspen(prevMonthName, prevYear, [], ""),
        GlobalApi.getAllTargetDaspen()
      ]);

      const prevFilteredTable = prevTable.filter(row => row["Cabang/Khusus"] !== "Jumlah" && row.cabang !== "Jumlah");
      if (prevFilteredTable.length > 0) {
        const existingCabangs = new Set((filteredTable || []).map((r) => r.cabang?.toUpperCase()));
        prevFilteredTable.forEach((row) => {
          if (!existingCabangs.has(row.cabang?.toUpperCase())) {
            filteredTable = [...(filteredTable || []), { ...row, bulan: selectedMonth, tahun: selectedYear }];
          }
        });
      }

      const prevFilteredTargets = prevAllTargets.filter(row =>
        row.bulan?.toUpperCase() === prevMonthName.toUpperCase() &&
        row.tahun?.toString() === prevYear.toString()
      );
      if (prevFilteredTargets.length > 0) {
        const existingTargetKeys = new Set(
          (filteredTargets || []).map((r) => `${r.cabang?.toUpperCase()}|${r.jenisData}`)
        );
        prevFilteredTargets.forEach((row) => {
          const key = `${row.cabang?.toUpperCase()}|${row.jenisData}`;
          if (!existingTargetKeys.has(key)) {
            filteredTargets = [...(filteredTargets || []), { ...row, bulan: selectedMonth, tahun: selectedYear }];
          }
        });
      }

      setTableData(filteredTable || []);
      setTargetData(filteredTargets || []);

      try {
        const numericMonth = monthNames.indexOf(selectedMonth) !== -1
          ? monthNames.indexOf(selectedMonth) + 1
          : null;

        const aggRes = await GlobalApi.getTransaksiBankBalancing(
          null,
          null,
          selectedYear,
          numericMonth
        );

        setRawAggregatedData(aggRes.data || aggRes);
      } catch (aggError) {
        console.error("Peringatan: API Aggregated gagal (Error 500).", aggError);
        setRawAggregatedData([]);
      }

    } catch (error) {
      console.error("Error fetching combined Daspen data:", error);
      setTableData([]);
      setTargetData([]);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  useEffect(() => {
    const targetK1 = Math.round(kat1Val);
    const targetK2 = Math.round(kat2Val);
    const targetK3 = Math.round(kat3Val);

    if (!selectedCabang) {
      const allCabs = [
        ...tableData.map(r => r.cabang || r["Cabang/Khusus"]),
        ...targetData.map(r => r.cabang),
        ...rawAggregatedData.map(r => r.cabang)
      ];
      const uniqueCabs = Array.from(new Set(allCabs.filter(c => c)));

      let tAutoK1 = 0, tAutoK2 = 0, tAutoK3 = 0;
      let tProvK1 = 0, tProvK2 = 0, tProvK3 = 0;

      uniqueCabs.forEach(cabangName => {
        const cabAggregated = rawAggregatedData.filter(
          (r) => r.cabang?.toUpperCase() === cabangName.toUpperCase()
        );

        cabAggregated.forEach((item) => {
          const tagihan = Math.round(parseFloat(item.totalIuranDaspen) || 0);
          if (tagihan === targetK1 && targetK1 > 0) tAutoK1++;
          else if (tagihan === targetK2 && targetK2 > 0) tAutoK2++;
          else if (tagihan === targetK3 && targetK3 > 0) tAutoK3++;
        });

        const daspen = targetData.find(
          (r) => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'DASPEN'
        );

        if (daspen) {
          tProvK1 += parseInt(daspen.kategori1, 10) || 0;
          tProvK2 += parseInt(daspen.kategori2, 10) || 0;
          tProvK3 += parseInt(daspen.kategori3, 10) || 0;
        }
      });

      setAutoKat1(tAutoK1);
      setAutoKat2(tAutoK2);
      setAutoKat3(tAutoK3);

      setKat1(tProvK1);
      setKat2(tProvK2);
      setKat3(tProvK3);

      return;
    }

    const cabAggregated = rawAggregatedData.filter(
      (r) => r.cabang?.toUpperCase() === selectedCabang.toUpperCase()
    );

    let calcAutoK1 = 0, calcAutoK2 = 0, calcAutoK3 = 0;

    cabAggregated.forEach((item) => {
      const tagihan = Math.round(parseFloat(item.totalIuranDaspen) || 0);
      if (tagihan === targetK1 && targetK1 > 0) calcAutoK1++;
      else if (tagihan === targetK2 && targetK2 > 0) calcAutoK2++;
      else if (tagihan === targetK3 && targetK3 > 0) calcAutoK3++;
    });

    setAutoKat1(calcAutoK1);
    setAutoKat2(calcAutoK2);
    setAutoKat3(calcAutoK3);

    const daspenUploaded = targetData.find(
      (r) => r.cabang?.toUpperCase() === selectedCabang.toUpperCase() && r.jenisData === 'DASPEN'
    );

    if (daspenUploaded) {
      setKat1(parseInt(daspenUploaded.kategori1, 10) || 0);
      setKat2(parseInt(daspenUploaded.kategori2, 10) || 0);
      setKat3(parseInt(daspenUploaded.kategori3, 10) || 0);
    } else {
      setKat1(calcAutoK1);
      setKat2(calcAutoK2);
      setKat3(calcAutoK3);
    }
  }, [selectedCabang, targetData, rawAggregatedData, tableData, kat1Val, kat2Val, kat3Val]);

  const handleSaveBesaran = async () => {
    try {
      const payload = {
        propinsi: katagori1, kabupaten: katagori2, cabang: katagori3,
        pb: kuota, sanduka: "", iuran: "DASPEN",
      };
      await GlobalApi.updateIuranData(4, payload);
      toast.success("Besaran Daspen diperbarui!");
      setShowConfig(false);
    } catch (error) {
      toast.error("Gagal memperbarui besaran.");
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();
    if (!selectedCabang || !selectedMonth) {
      toast.error("Pilih Cabang dan Bulan!");
      return;
    }
    try {
      const payload = {
        bulan: selectedMonth, tahun: selectedYear.toString(), cabang: selectedCabang,
        kategori1: kat1, kategori2: kat2, kategori3: kat3,
        perolehanCabang: totalTarget * CABANG_PERCENTAGE,
        perolehanKabupaten: totalTarget * KABUPATEN_PERCENTAGE,
        valueKat1: kat1 * kat1Val, valueKat2: kat2 * kat2Val, valueKat3: kat3 * kat3Val,
        transfer: 0, pembayaran1: 0, pembayaran2: 0,
        jenisData: "SANDUKA"
      };
      await GlobalApi.createTargetDaspen(payload);
      toast.success(`Berhasil menyimpan Daspen untuk ${selectedCabang}`);
      fetchTableData();
      setKat1(0); setKat2(0); setKat3(0);
    } catch (error) {
      toast.error("Gagal menyimpan data Daspen.");
    }
  };

  const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = String(val).replace(/\./g, '');
    return parseFloat(cleanStr) || 0;
  };

  const handleDownloadTemplate = (namaFile) => {
    const headers = [["No", "Cabang/Khusus", "Kat I", "Nominal Kat I", "Kat II", "Nominal Kat II", "Kat III", "Nominal Kat III", "Total Anggota", "Total Nominal", "Transfer", "Selisih", "Status"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Daspen");
    XLSX.writeFile(wb, `${namaFile}.xlsx`);
  };

  const handleExcelUploadProvinsi = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedMonth || !selectedYear) {
      toast.error("Gagal! Pastikan Bulan dan Tahun sudah dipilih.");
      return;
    }
    setIsUploadingDaspen(true);
    const toastId = toast.loading("Menyimpan Data Provinsi (DASPEN)...");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const rows = raw.slice(1).filter(r => r[1]);
        let successCount = 0;

        for (const r of rows) {
          const cabang = String(r[1]).trim();
          const k1 = parseNumber(r[2]); const k2 = parseNumber(r[4]); const k3 = parseNumber(r[6]);
          const transfer = parseNumber(r[10]);
          const vKat1 = k1 * kat1Val; const vKat2 = k2 * kat2Val; const vKat3 = k3 * kat3Val;
          const totalTgt = vKat1 + vKat2 + vKat3;

          const payload = {
            bulan: selectedMonth, tahun: selectedYear.toString(), cabang: cabang,
            kategori1: k1, kategori2: k2, kategori3: k3,
            perolehanCabang: totalTgt * CABANG_PERCENTAGE, perolehanKabupaten: totalTgt * KABUPATEN_PERCENTAGE,
            valueKat1: vKat1, valueKat2: vKat2, valueKat3: vKat3,
            transfer: transfer, pembayaran1: 0, pembayaran2: 0,
            jenisData: "DASPEN"
          };
          await GlobalApi.createTargetDaspen(payload);
          successCount++;
        }
        toast.success(`Selesai! ${successCount} data (DASPEN) tersimpan.`, { id: toastId });
        fetchTableData();
      } catch (err) {
        toast.error(`Gagal memproses Excel DASPEN.`, { id: toastId });
      } finally {
        setIsUploadingDaspen(false); e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = (id, jenis, cabang, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ show: true, id: id, jenis: jenis, cabang: cabang });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await GlobalApi.deleteTargetDaspen(deleteModal.id);
      toast.success(`Data ${deleteModal.jenis} berhasil dihapus!`);
      fetchTableData();
    } catch (error) {
      toast.error("Gagal menghapus data.");
    } finally {
      setDeleteModal({ show: false, id: null, jenis: "", cabang: "" });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, kategori1, kategori2, kategori3, transfer, pembayaran1, pembayaran2, cabang } = editModal.data;

      const k1 = parseInt(kategori1) || 0; const k2 = parseInt(kategori2) || 0; const k3 = parseInt(kategori3) || 0;
      const t = parseFloat(transfer) || 0; const p1 = parseFloat(pembayaran1) || 0; const p2 = parseFloat(pembayaran2) || 0;
      const vKat1 = k1 * kat1Val; const vKat2 = k2 * kat2Val; const vKat3 = k3 * kat3Val;
      const totalTgt = vKat1 + vKat2 + vKat3;

      const payload = {
        ...editModal.data,
        cabang: cabang, bulan: selectedMonth, tahun: selectedYear.toString(),
        kategori1: k1, kategori2: k2, kategori3: k3,
        transfer: t, pembayaran1: p1, pembayaran2: p2,
        valueKat1: vKat1, valueKat2: vKat2, valueKat3: vKat3,
        perolehanCabang: totalTgt * CABANG_PERCENTAGE, perolehanKabupaten: totalTgt * KABUPATEN_PERCENTAGE,
      };

      if (id) {
        await GlobalApi.updateTargetDaspen(id, payload);
      } else {
        await GlobalApi.createTargetDaspen(payload);
      }

      toast.success("Data berhasil disimpan ke database!");
      setEditModal({ show: false, data: null });
      fetchTableData();
    } catch (error) {
      toast.error("Gagal menyimpan data.");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  const CellDouble = ({ top, bottom, topClass = "text-slate-700", bottomClass = "text-teal-500" }) => (
    <div className="flex flex-col justify-center gap-1.5 leading-tight py-1">
      <div className={`text-[11px] font-bold ${topClass}`}>{top !== null && top !== undefined ? top : "-"}</div>
      {bottom !== null && bottom !== undefined && (
        <div className={`text-[11px] font-semibold italic ${bottomClass}`}>{bottom}</div>
      )}
    </div>
  );

  const CellTriple = ({ top, middle, bottom, topClass = "text-slate-700", middleClass = "text-teal-500" }) => (
    <div className="flex flex-col justify-center gap-1 leading-tight py-1">
      <div className={`text-[11px] font-bold ${topClass}`}>{top !== null && top !== undefined ? top : "-"}</div>
      {middle !== null && middle !== undefined && (
        <div className={`text-[11px] font-semibold italic ${middleClass}`}>{middle}</div>
      )}
    </div>
  );

  const getUniqueCabangs = () => {
    const allCabs = [
      ...tableData.map(r => r.cabang || r["Cabang/Khusus"]),
      ...targetData.map(r => r.cabang),
      ...rawAggregatedData.map(r => r.cabang)
    ];
    return Array.from(new Set(allCabs.filter(c => c)));
  };
  const uniqueCabangs = getUniqueCabangs();

  return (
    <div className="flex flex-col h-full relative">
      <Toaster position="top-center" />

      {/* MODAL EDIT */}
      {editModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h3 className="font-black text-2xl text-slate-800">Edit Data Cabang</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-slate-500">{editModal.data?.cabang}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${editModal.data?.jenisData === 'DASPEN' ? 'bg-teal-500' : 'bg-rose-500'}`}>
                    {editModal.data?.jenisData || "SANDUKA"} {editModal.data?.isAuto && "(Auto-Generated)"}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditModal({ show: false, data: null })} className="text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={20} className="opacity-0" /></button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {['kategori1', 'kategori2', 'kategori3'].map((kat, idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Jumlah Kat {idx + 1}</label>
                    <input
                      type="number" value={editModal.data[kat] || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, [kat]: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mt-1 font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* BAGIAN PEMBAYARAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Transfer Balancing</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.transfer || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, transfer: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pembayaran 1</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.pembayaran1 || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, pembayaran1: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pembayaran 2</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number" value={editModal.data.pembayaran2 || 0}
                      onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, pembayaran2: e.target.value } }))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setEditModal({ show: false, data: null })} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-colors flex items-center gap-2"><FaSave /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border-[6px] border-rose-100">
                <FaTrash className="text-3xl text-rose-500" />
              </div>

              <h3 className="font-black text-2xl text-slate-800 mb-2">Hapus Data?</h3>
              <p className="text-xs text-slate-500 font-bold mb-4 leading-relaxed">
                Anda akan menghapus data ini secara permanen:
              </p>

              {/* INFO DATA YANG DITARGETKAN (SANGAT PENTING) */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Cabang</span>
                    <span className="text-xs font-black text-slate-700">{deleteModal.cabang}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipe Data</span>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-black ${deleteModal.jenis.includes('Realisasi') ? 'bg-red-100 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                      {deleteModal.jenis}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null, jenis: "", cabang: "" })}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black transition-colors shadow-lg shadow-rose-500/30"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <div className="bg-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaHandHoldingHeart className="text-2xl" /></div>
            <div>
              <h2 className="text-xl font-black">Dana Sosial Pensiun (Daspen)</h2>
              <div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">Periode: {selectedMonth} {selectedYear}</span></div>
            </div>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all">
            <FaCog className={showConfig ? "rotate-90 transition-transform" : ""} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-slate-50/50 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center"><FaCalculator /></div>
              <div><h3 className="text-base font-black text-slate-800">Konfigurasi Besaran Daspen</h3></div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase">Kuota Dasar</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">Rp</span>
                  <input type="number" value={kuota} onChange={(e) => setKuota(parseInt(e.target.value) || 0)} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[16px] font-black outline-none" />
                </div>
              </div>
              {[
                { label: "Kat I", key: "katagori1", val: kat1Val },
                { label: "Kat II", key: "katagori2", val: kat2Val },
                { label: "Kat III", key: "katagori3", val: kat3Val }
              ].map(cat => (
                <div key={cat.key}>
                  <label className="text-[9px] font-black text-slate-400 uppercase">{cat.label}</label>
                  <div className="space-y-2">
                    <input type="number" step="0.01" value={cat.key === "katagori1" ? katagori1 : cat.key === "katagori2" ? katagori2 : katagori3} onChange={(e) => { const v = parseFloat(e.target.value) || 0; if (cat.key === "katagori1") setKatagori1(v); if (cat.key === "katagori2") setKatagori2(v); if (cat.key === "katagori3") setKatagori3(v); }} className="w-full px-4 py-3 bg-slate-50 rounded-[16px] font-black text-center outline-none" />
                    <div className="px-4 py-1.5 bg-rose-50 rounded-lg text-center"><p className="text-[10px] text-rose-600 font-black">{formatCurrency(cat.val)}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSaveBesaran} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-black flex items-center justify-center gap-2">
              <FaSave /> Simpan Konfigurasi
            </button>

            <div className="mt-6 p-5 bg-blue-50 rounded-[24px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center"><FaFileExcel /></div>
                <div><h4 className="text-sm font-black text-blue-800">Upload Data Provinsi (DASPEN)</h4></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => handleDownloadTemplate("Template_Provinsi_Daspen")} className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black"><FaFileExcel /> Download Template</button>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer ${isUploadingDaspen ? 'opacity-50' : ''}`}>
                  {isUploadingDaspen ? "Menyimpan..." : <><FaUpload /> Upload & Simpan Excel Provinsi</>}
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUploadProvinsi} disabled={isUploadingDaspen} />
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-8">

            <style dangerouslySetInnerHTML={{
              __html: `
              .hover-spinner::-webkit-inner-spin-button,
              .hover-spinner::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              .hover-spinner:hover::-webkit-inner-spin-button,
              .hover-spinner:hover::-webkit-outer-spin-button {
                -webkit-appearance: inner-spin-button;
                opacity: 1;
              }
              .hover-spinner {
                -moz-appearance: textfield;
              }
              .hover-spinner:hover {
                -moz-appearance: number-input;
              }
            `}} />
            <form onSubmit={handleSubmitTarget} className="bg-[#0f172a] rounded-[2rem] p-5 sm:p-6 shadow-2xl border border-slate-800 w-full">
              {/* KITA HAPUS xl:flex-nowrap AGAR BISA TURUN KE BAWAH JIKA LAYAR SEMPIT */}
              {/* PANEL DASHBOARD PEMBANDING DATA (VIEW ONLY) */}
              <div className="bg-[#0f172a] rounded-[2rem] p-5 sm:p-6 shadow-2xl border border-slate-800 w-full mb-8">
                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-5 sm:gap-6 w-full">

                  {/* 1. BAGIAN PILIH CABANG */}
                  <div className="flex flex-col gap-2 w-full md:w-auto md:flex-1 min-w-[180px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      Data Pembanding <br className="hidden md:block" />
                      <span className="text-slate-500 font-bold text-[9px] md:ml-1">(Pilih Cabang)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCabang}
                        onChange={(e) => setSelectedCabang(e.target.value)}
                        className="w-full pl-4 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all hover:bg-white/10"
                      >
                        <option value="" className="text-slate-800">-- Semua Cabang (Total) --</option>
                        {cabangList.map(c => <option key={c.id} value={c.kecamatan} className="text-slate-800">{c.kecamatan}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </div>

                  {/* 2. BAGIAN KATEGORI (VIEW ONLY - Tidak bisa diedit) */}
                  <div className="flex items-start justify-center gap-3 sm:gap-4 w-full md:w-auto shrink-0">

                    {/* KAT I */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAT I</label>
                      <div className="w-[72px] h-14 sm:h-16 flex items-center justify-center bg-transparent border-2 border-slate-600 rounded-xl">
                        <span className="text-xl sm:text-2xl font-black text-teal-400">{kat1}</span>
                      </div>
                      {/* LABEL DATA ASLI */}
                      <div className="bg-slate-800 border border-slate-700 w-full py-1.5 rounded-lg text-center shadow-inner">
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Data Asli</span>
                        <span className="text-sm font-black text-white">{autoKat1}</span>
                      </div>
                    </div>

                    {/* KAT II */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAT II</label>
                      <div className="w-[72px] h-14 sm:h-16 flex items-center justify-center bg-transparent border-2 border-slate-600 rounded-xl">
                        <span className="text-xl sm:text-2xl font-black text-teal-400">{kat2}</span>
                      </div>
                      {/* LABEL DATA ASLI */}
                      <div className="bg-slate-800 border border-slate-700 w-full py-1.5 rounded-lg text-center shadow-inner">
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Data Asli</span>
                        <span className="text-sm font-black text-white">{autoKat2}</span>
                      </div>
                    </div>

                    {/* KAT III */}
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAT III</label>
                      <div className="w-[72px] h-14 sm:h-16 flex items-center justify-center bg-transparent border-2 border-slate-600 rounded-xl">
                        <span className="text-xl sm:text-2xl font-black text-teal-400">{kat3}</span>
                      </div>
                      {/* LABEL DATA ASLI */}
                      <div className="bg-slate-800 border border-slate-700 w-full py-1.5 rounded-lg text-center shadow-inner">
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Data Asli</span>
                        <span className="text-sm font-black text-white">{autoKat3}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BAGIAN PREVIEW DATA (Dilengkapi Pembanding) */}
                  <div className="flex flex-row items-start justify-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto shrink-0 h-full">
                    <div className="text-center flex flex-col justify-between h-full">
                      <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tot. Daspen</div>
                        <div className="text-xl font-black text-teal-400 mt-1 leading-none">
                          {kat1 + kat2 + kat3} <span className="text-[10px] text-slate-500 font-bold uppercase">Org</span>
                        </div>
                      </div>
                      <div className="mt-3 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 inline-block mx-auto">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Data Asli: </span>
                        <span className="text-[11px] text-white font-black">{autoTotalAnggota}</span>
                      </div>
                    </div>

                    <div className="w-px h-16 bg-white/10 self-center"></div> {/* Garis pembatas */}

                    <div className="text-center flex flex-col justify-between h-full">
                      <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Target</div>
                        <div className="text-xl font-black text-teal-400 mt-1 leading-none">{formatCurrency(totalTarget)}</div>
                      </div>
                      <div className="mt-3 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 inline-block mx-auto">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Data Asli: </span>
                        <span className="text-[11px] text-white font-black">{formatCurrency(autoTotalTarget)}</span>
                      </div>
                    </div>
                  </div>

                  {/* (Bagian Tombol Simpan Sengaja Dihilangkan karena ini View Only) */}
                </div>
              </div>
            </form>

            {/* TAMBAHKAN ref={printRef} DI SINI */}
            <div ref={printRef} className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 p-2">

              <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[18px] bg-rose-50 text-rose-600 flex items-center justify-center"><FaHandHoldingHeart className="text-xl" /></div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800">Rekapitulasi Daspen</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Data Hitam Digenerate Langsung dari API Balancing</p>
                  </div>
                </div>

                {/* ABAIKAN BAGIAN INI SAAT JADI PDF MENGGUNAKAN data-html2canvas-ignore */}
                <div data-html2canvas-ignore="true" className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px]" ref={cabangRef}>
                    <div className="relative group">
                      <Input
                        type="text"
                        value={searchQuery || "Semua Cabang"}
                        readOnly
                        onClick={() => {
                          setShowCabangDropdown(!showCabangDropdown);
                          setFilteredCabangList(cabangList);
                        }}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20 transition-all text-xs cursor-pointer hover:border-rose-300 shadow-sm"
                        placeholder="Pilih Cabang"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px] transition-transform duration-300 group-hover:text-rose-500">
                        {showCabangDropdown ? "▲" : "▼"}
                      </div>
                    </div>
                    {showCabangDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-[100] border border-slate-100 rounded-xl bg-white shadow-2xl mt-2 w-full max-h-72 overflow-hidden flex flex-col ring-1 ring-black/5"
                      >
                        <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
                            <Input
                              type="text"
                              value={searchDropCabang}
                              onChange={(e) => handleCabangSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-[10px] font-bold border-slate-200 rounded-lg focus:ring-rose-500 bg-white"
                              placeholder="Ketik nama cabang..."
                              autoFocus
                            />
                          </div>
                        </div>
                        <ul className="overflow-y-auto py-2 custom-scrollbar">
                          <li
                            onClick={() => handleSelectCabang("")}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 border-l-2 ${
                              !searchQuery
                                ? "bg-rose-50 text-rose-600 border-rose-500"
                                : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
                            }`}
                          >
                            Semua Cabang
                          </li>
                          {[...filteredCabangList]
                            .sort((a, b) =>
                              (a.kecamatan || "").localeCompare(
                                b.kecamatan || "",
                              ),
                            )
                            .map((cab, idx) => (
                              <li
                                key={idx}
                                onClick={() => handleSelectCabang(cab.kecamatan)}
                                className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 border-l-2 ${
                                  searchQuery === cab.kecamatan
                                    ? "bg-rose-50 text-rose-600 border-rose-500"
                                    : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
                                }`}
                              >
                                {cab.kecamatan}
                              </li>
                            ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent px-4 py-2.5 outline-none font-black text-slate-600 text-xs uppercase tracking-widest cursor-pointer">
                      {bulanList.map(b => <option key={b.id} value={b.namaBulan}>{b.namaBulan}</option>)}
                    </select>
                    <div className="w-[1px] h-5 bg-slate-200" />
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent px-4 py-2.5 outline-none font-black text-slate-600 text-xs uppercase tracking-widest cursor-pointer">
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ABAIKAN TOMBOL EXCEL & PDF SAAT JADI PDF */}
              <div data-html2canvas-ignore="true" className="flex justify-end gap-3 px-6 pt-4">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <FaFileExcel className="text-sm" /> Export Excel
                </button>
                <button
                  onClick={handleDownloadPDF} /* <-- Panggil fungsi baru di sini */
                  className="flex items-center gap-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  <FaFilePdf className="text-sm" /> Cetak PDF
                </button>
              </div>

              <div className="overflow-x-auto p-6 pt-4">
                {(() => {
                  const filteredCabangs = uniqueCabangs.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

                  let tAutoAng = 0, tProvAng = 0, tRealAng = 0;
                  let tAutoK1 = 0, tProvK1 = 0, tRealK1 = 0;
                  let tAutoNomK1 = 0, tProvNomK1 = 0, tRealNomK1 = 0;
                  let tAutoK2 = 0, tProvK2 = 0, tRealK2 = 0;
                  let tAutoNomK2 = 0, tProvNomK2 = 0, tRealNomK2 = 0;
                  let tAutoK3 = 0, tProvK3 = 0, tRealK3 = 0;
                  let tAutoNomK3 = 0, tProvNomK3 = 0, tRealNomK3 = 0;
                  let tAutoTotNom = 0, tProvTotNom = 0, tRealTotNom = 0;
                  let tAutoTrans = 0, tProvTrans = 0, tRealTrans = 0;
                  let tAutoTunai = 0, tProvTunai = 0, tRealTunai = 0;
                  let tAutoKurang = 0, tProvKurang = 0, tRealKurang = 0;
                  let tAutoPerunCabang = 0, tProvPerunCabang = 0, tRealPerunCabang = 0;
                  let tAutoPerunKabupaten = 0, tProvPerunKabupaten = 0, tRealPerunKabupaten = 0;
                  let tAutoTagihan = 0, tProvTagihan = 0, tRealTagihan = 0;

                  const renderedRows = loadingTable ? (
                    Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={18} className="p-6"><div className="h-3 bg-slate-100 rounded-full w-full" /></td></tr>)
                  ) : filteredCabangs.length > 0 ? (
                    filteredCabangs.map((cabangName, i) => {
        let autoK1 = 0, autoK2 = 0, autoK3 = 0, autoTransfer = 0, autoTunai = 0;
                      const targetK1 = Math.round(kat1Val);
                      const targetK2 = Math.round(kat2Val);
                      const targetK3 = Math.round(kat3Val);

                      const cabAggregated = rawAggregatedData.filter(r => r.cabang?.toUpperCase() === cabangName.toUpperCase());

                      cabAggregated.forEach(item => {
                        const tagihan = Math.round(parseFloat(item.totalIuranDaspen) || 0);

                        if (tagihan === targetK1 && targetK1 > 0) {
                          autoK1++;
                        } else if (tagihan === targetK2 && targetK2 > 0) {
                          autoK2++;
                        } else if (tagihan === targetK3 && targetK3 > 0) {
                          autoK3++;
                        }

                        const manualDaspen = parseFloat(item.manualDaspen || item.manual_daspen) || 0;

                        if (manualDaspen > 0) {
                          autoTransfer += manualDaspen;
                        } else if (item.keterangan?.toLowerCase() === "sukses") {
                          autoTransfer += tagihan;
                        } else if (item.keterangan?.toLowerCase() === "tunai") {
                          autoTunai += tagihan;
                        }
                      });

                      const sandukaDB = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'SANDUKA');
                      const daspen = targetData.find(r => r.cabang?.toUpperCase() === cabangName.toUpperCase() && r.jenisData === 'DASPEN');

                      const nomAutoK1 = autoK1 * kat1Val; const nomAutoK2 = autoK2 * kat2Val; const nomAutoK3 = autoK3 * kat3Val;
                      const totAutoNominal = nomAutoK1 + nomAutoK2 + nomAutoK3;
                      const autoSelisih = totAutoNominal - autoTransfer;
                      const autoPerunCabang = totAutoNominal * CABANG_PERCENTAGE;
                      const autoPerunKabupaten = totAutoNominal * KABUPATEN_PERCENTAGE;
                      const autoTagihan = totAutoNominal - autoPerunCabang;

                      const pk1 = daspen ? parseInt(daspen.kategori1) : null;
                      const pk2 = daspen ? parseInt(daspen.kategori2) : null;
                      const pk3 = daspen ? parseInt(daspen.kategori3) : null;
                      const pNomK1 = daspen ? parseFloat(daspen.valueKat1) : null;
                      const pNomK2 = daspen ? parseFloat(daspen.valueKat2) : null;
                      const pNomK3 = daspen ? parseFloat(daspen.valueKat3) : null;
                      const pTotNominal = daspen ? (pNomK1 + pNomK2 + pNomK3) : null;
                      const pTransfer = daspen ? parseFloat(daspen.transfer || 0) : null;
                      const pSelisih = daspen ? (pTotNominal - pTransfer) : null;
                      const pPemb1 = daspen ? parseFloat(daspen.pembayaran1 || 0) : null;
                      const pPemb2 = daspen ? parseFloat(daspen.pembayaran2 || 0) : null;
                      const pKurangSetor = daspen ? (pTotNominal - pTransfer - pPemb1 - pPemb2) : null;
                      const pPerunCabang = daspen ? (pTotNominal * CABANG_PERCENTAGE) : null;
                      const pPerunKabupaten = daspen ? (pTotNominal * KABUPATEN_PERCENTAGE) : null;
                      const pTagihan = daspen ? (pTotNominal - pPerunCabang) : null;

                      const activeMembers = cabAggregated.length > 0 ? cabAggregated.reduce((sum, item) => sum + (parseInt(item.jumlah) || 1), 0) : 0;
                      const pTotAnggota = daspen ? (pk1 + pk2 + pk3) : null;

                      /* REALISASI (merah): fallback ke AUTO jika belum disimpan manual */
                      const dbK1 = sandukaDB ? parseInt(sandukaDB.kategori1) : autoK1;
                      const dbK2 = sandukaDB ? parseInt(sandukaDB.kategori2) : autoK2;
                      const dbK3 = sandukaDB ? parseInt(sandukaDB.kategori3) : autoK3;
                      const nomDbK1 = sandukaDB ? parseFloat(sandukaDB.valueKat1) : nomAutoK1;
                      const nomDbK2 = sandukaDB ? parseFloat(sandukaDB.valueKat2) : nomAutoK2;
                      const nomDbK3 = sandukaDB ? parseFloat(sandukaDB.valueKat3) : nomAutoK3;
                      const totDbNominal = sandukaDB ? parseFloat(sandukaDB.totalTarget || (nomDbK1 + nomDbK2 + nomDbK3)) : totAutoNominal;
                      const dbTransfer = sandukaDB ? parseFloat(sandukaDB.transfer || 0) : autoTransfer;
                      const dbSelisih = sandukaDB ? (totDbNominal - dbTransfer) : autoSelisih;
                      const dbPemb1 = sandukaDB ? parseFloat(sandukaDB.pembayaran1 || 0) : 0;
                      const dbPemb2 = sandukaDB ? parseFloat(sandukaDB.pembayaran2 || 0) : 0;
                      const dbKurangSetor = sandukaDB ? (totDbNominal - dbTransfer - dbPemb1 - dbPemb2) : autoSelisih;
                      const dbPerunCabang = totDbNominal * CABANG_PERCENTAGE;
                      const dbPerunKabupaten = totDbNominal * KABUPATEN_PERCENTAGE;
                      const dbTagihan = totDbNominal - dbPerunCabang;
                      const dbTotAnggota = dbK1 + dbK2 + dbK3;

                      tAutoAng += activeMembers; tProvAng += (pTotAnggota || 0); tRealAng += (dbTotAnggota || 0);

                      tAutoK1 += autoK1; tProvK1 += (pk1 || 0); tRealK1 += (dbK1 || 0);
                      tAutoNomK1 += nomAutoK1; tProvNomK1 += (pNomK1 || 0); tRealNomK1 += (nomDbK1 || 0);

                      tAutoK2 += autoK2; tProvK2 += (pk2 || 0); tRealK2 += (dbK2 || 0);
                      tAutoNomK2 += nomAutoK2; tProvNomK2 += (pNomK2 || 0); tRealNomK2 += (nomDbK2 || 0);

                      tAutoK3 += autoK3; tProvK3 += (pk3 || 0); tRealK3 += (dbK3 || 0);
                      tAutoNomK3 += nomAutoK3; tProvNomK3 += (pNomK3 || 0); tRealNomK3 += (nomDbK3 || 0);

                      tAutoTotNom += totAutoNominal; tProvTotNom += (pTotNominal || 0); tRealTotNom += (totDbNominal || 0);
                      tAutoTrans += autoTransfer; tProvTrans += (pTransfer || 0); tRealTrans += (dbTransfer || 0);
                      tAutoTunai += autoTunai; tProvTunai += (0); tRealTunai += (dbPemb1 || 0);

                      tAutoKurang += autoSelisih; tProvKurang += (0); tRealKurang += (dbSelisih || 0);

                      tAutoPerunCabang += autoPerunCabang; tProvPerunCabang += (pPerunCabang || 0); tRealPerunCabang += (dbPerunCabang || 0);
                      tAutoPerunKabupaten += autoPerunKabupaten; tProvPerunKabupaten += (pPerunKabupaten || 0); tRealPerunKabupaten += (dbPerunKabupaten || 0);
                      tAutoTagihan += autoTagihan; tProvTagihan += (pTagihan || 0); tRealTagihan += (dbTagihan || 0);

                      const activeTransfer = sandukaDB ? parseFloat(sandukaDB.transfer || 0) : autoTransfer;
                      const activeSelisih = sandukaDB ? (totDbNominal - activeTransfer) : autoSelisih;
                      const activePemb1 = sandukaDB ? parseFloat(sandukaDB.pembayaran1 || 0) : 0;
                      const activePemb2 = sandukaDB ? parseFloat(sandukaDB.pembayaran2 || 0) : 0;
                      const activeKurang = sandukaDB ? (totDbNominal - activeTransfer - activePemb1 - activePemb2) : autoSelisih;

                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors text-[11px] font-bold text-slate-600">
                          <td className="px-3 py-2 text-slate-400 font-black border-r border-slate-200 text-center">{i + 1}</td>
                          <td className="px-3 py-2 font-black text-slate-800 whitespace-nowrap border-r border-slate-200 uppercase">{cabangName}</td>

                          <td className="px-3 py-2 border-r border-slate-200 text-center"><CellTriple top={activeMembers} middle={pTotAnggota} bottom={dbTotAnggota} /></td>

                          <td className="px-3 py-2 border-r border-slate-200 text-center"><CellTriple top={autoK1} middle={pk1} bottom={dbK1} /></td>
                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellTriple top={formatCurrency(nomAutoK1)} middle={pNomK1 !== null ? formatCurrency(pNomK1) : null} bottom={nomDbK1 !== null ? formatCurrency(nomDbK1) : null} /></td>

                          <td className="px-3 py-2 border-r border-slate-200 text-center"><CellTriple top={autoK2} middle={pk2} bottom={dbK2} /></td>
                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellTriple top={formatCurrency(nomAutoK2)} middle={pNomK2 !== null ? formatCurrency(pNomK2) : null} bottom={nomDbK2 !== null ? formatCurrency(nomDbK2) : null} /></td>

                          <td className="px-3 py-2 border-r border-slate-200 text-center"><CellTriple top={autoK3} middle={pk3} bottom={dbK3} /></td>
                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap"><CellTriple top={formatCurrency(nomAutoK3)} middle={pNomK3 !== null ? formatCurrency(pNomK3) : null} bottom={nomDbK3 !== null ? formatCurrency(nomDbK3) : null} /></td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/50"><CellTriple top={formatCurrency(totAutoNominal)} middle={pTotNominal !== null ? formatCurrency(pTotNominal) : null} bottom={totDbNominal !== null ? formatCurrency(totDbNominal) : null} topClass="text-slate-900 font-black" /></td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            <CellTriple top={formatCurrency(autoTransfer)} middle={pTransfer !== null ? formatCurrency(pTransfer) : null} bottom={dbTransfer !== null ? formatCurrency(dbTransfer) : null} />
                          </td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            {/* Tunai = transaksi Tunai */}
                            <CellTriple top={formatCurrency(autoTunai)} middle={null} bottom={dbPemb1 !== null ? formatCurrency(dbPemb1) : null} />
                          </td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            {/* selisih kurang = total - Transfer */}
                            <CellTriple top={formatCurrency(autoSelisih)} middle={null} bottom={dbSelisih !== null ? formatCurrency(dbSelisih) : null} />
                          </td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            <CellTriple top={formatCurrency(autoPerunCabang)} middle={pPerunCabang !== null ? formatCurrency(pPerunCabang) : null} bottom={formatCurrency(dbPerunCabang)} />
                          </td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            <CellTriple top={formatCurrency(autoPerunKabupaten)} middle={pPerunKabupaten !== null ? formatCurrency(pPerunKabupaten) : null} bottom={formatCurrency(dbPerunKabupaten)} />
                          </td>

                          <td className="px-3 py-2 border-r border-slate-200 text-right whitespace-nowrap bg-slate-50/30">
                            <CellTriple top={formatCurrency(autoTagihan)} middle={pTagihan !== null ? formatCurrency(pTagihan) : null} bottom={formatCurrency(dbTagihan)} />
                          </td>
                          <td className="px-3 py-2 text-center border-r border-slate-200">
                            <div className="flex flex-col gap-1 items-center justify-center">
                              <span className="text-[9px] font-black text-slate-500">AUTO</span>
                              {daspen && <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-teal-50 text-teal-600">DASPEN</span>}
                            </div>
                          </td>

                          {/* ABAIKAN KOLOM AKSI INI SAAT JADI PDF */}
                          <td data-html2canvas-ignore="true" className="px-3 py-2 text-center w-24">
                            <div className="flex flex-col gap-1.5 items-center justify-center py-1">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditModal({ show: true, data: { isAuto: true, cabang: cabangName, jenisData: 'SANDUKA', kategori1: autoK1, kategori2: autoK2, kategori3: autoK3, transfer: autoTransfer, pembayaran1: 0, pembayaran2: 0 } })}
                                  className="text-slate-400 hover:text-slate-700 transition-colors"
                                  title="Gunakan & Simpan Data Auto"
                                >
                                  <FaEdit size={14} />
                                </button>
                              </div>

                              {daspen && (
                                <div className="flex gap-2">
                                  <button onClick={() => setEditModal({ show: true, data: daspen })} className="text-teal-400 hover:text-teal-600 transition-colors" title="Edit Daspen/Prov"><FaEdit size={14} /></button>
                                  <button onClick={(e) => handleDelete(daspen.id, "Upload Provinsi", cabangName, e)} className="text-teal-400 hover:text-red-500 transition-colors" title="Hapus Daspen/Prov"><FaTrash size={14} /></button>
                                </div>
                              )}

                              {sandukaDB && (
                                <div className="flex gap-2">
                                  <button onClick={() => setEditModal({ show: true, data: sandukaDB })} className="text-red-500 hover:text-red-700 transition-colors" title="Edit Simpan Realisasi"><FaEdit size={14} /></button>
                                  <button onClick={(e) => handleDelete(sandukaDB.id, "Realisasi / Manual", cabangName, e)} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus Data Simpan Realisasi"><FaTrash size={14} /></button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={18} className="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Data Kosong</td></tr>
                  );

                  return (
                    <table ref={tableRef} className="w-full text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {/* MAPPING HEADER, JIKA H === 'Aksi', TAMBAHKAN data-html2canvas-ignore */}
                          {["No", "Cabang/Khusus", "Total Anggota", "Kat I", "Nominal", "Kat II", "Nominal", "Kat III", "Nominal", "Total Nominal", "Transfer", "Tunai", "selisih kurang", "Peruntukan cabang", "Peruntukan Kabupaten", "TAGIHAN", "Status", "Aksi"].map((h, i) => (
                            <th
                              key={i}
                              data-html2canvas-ignore={h === 'Aksi' ? "true" : undefined}
                              className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center whitespace-nowrap border-r border-slate-200 bg-slate-100/50"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {renderedRows}
                      </tbody>

                      {!loadingTable && filteredCabangs.length > 0 && (
                        <tfoot className="bg-slate-100/80 border-t-4 border-slate-300 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                          <tr className="text-[11px] font-black text-slate-800">
                            <td colSpan={2} className="px-3 py-4 text-center text-xs uppercase tracking-widest border-r border-slate-300">TOTAL REKAPITULASI</td>
                            <td className="px-3 py-2 border-r border-slate-300 text-center"><CellTriple top={tAutoAng} middle={tProvAng} bottom={tRealAng} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-center"><CellTriple top={tAutoK1} middle={tProvK1} bottom={tRealK1} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right"><CellTriple top={formatCurrency(tAutoNomK1)} middle={formatCurrency(tProvNomK1)} bottom={formatCurrency(tRealNomK1)} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-center"><CellTriple top={tAutoK2} middle={tProvK2} bottom={tRealK2} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right"><CellTriple top={formatCurrency(tAutoNomK2)} middle={formatCurrency(tProvNomK2)} bottom={formatCurrency(tRealNomK2)} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-center"><CellTriple top={tAutoK3} middle={tProvK3} bottom={tRealK3} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right"><CellTriple top={formatCurrency(tAutoNomK3)} middle={formatCurrency(tProvNomK3)} bottom={formatCurrency(tRealNomK3)} /></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right bg-slate-200/50"><CellTriple top={formatCurrency(tAutoTotNom)} middle={formatCurrency(tProvTotNom)} bottom={formatCurrency(tRealTotNom)} topClass="text-slate-900" /></td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoTrans)} middle={formatCurrency(tProvTrans)} bottom={formatCurrency(tRealTrans)} />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoTunai)} middle={formatCurrency(tProvTunai)} bottom={formatCurrency(tRealTunai)} />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoKurang)} middle={formatCurrency(tProvKurang)} bottom={formatCurrency(tRealKurang)} />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoPerunCabang)} middle={formatCurrency(tProvPerunCabang)} bottom={formatCurrency(tRealPerunCabang)} />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoPerunKabupaten)} middle={formatCurrency(tProvPerunKabupaten)} bottom={formatCurrency(tRealPerunKabupaten)} />
                            </td>

                            <td className="px-3 py-2 border-r border-slate-300 text-right">
                              <CellTriple top={formatCurrency(tAutoTagihan)} middle={formatCurrency(tProvTagihan)} bottom={formatCurrency(tRealTagihan)} />
                            </td>
                            {/* ABAIKAN JUGA DI FOOTER */}
                            <td data-html2canvas-ignore="true" colSpan={2} className="px-3 py-2 border-r border-slate-300 bg-slate-200/30"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaspenSection;