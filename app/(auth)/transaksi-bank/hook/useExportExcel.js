import { useState, useEffect, useRef, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const useExportExcel = () => {
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
        "Total Keuangan": item.totalIuran,
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
        "Total Keuangan": item.totalIuran,
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
  const formatTanggal = (tanggalArray) => {
    if (!Array.isArray(tanggalArray) || tanggalArray.length < 3) return "";

    const [year, month, day] = tanggalArray;

    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    return `${dd}/${mm}/${year}`;
  };
  return {
    exportAllToExcel,
    exportToExcel,
    exportBalancingToExcel,
      exportRekapitulasiToExcel,
     formatTanggal,
  };
};

export default useExportExcel;
