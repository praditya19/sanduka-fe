import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const useExportExcel = () => {
  const formatTanggal = (tanggalArray) => {
    if (!Array.isArray(tanggalArray) || tanggalArray.length < 3) return "";
    const [year, month, day] = tanggalArray;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  };

  const exportAllToExcel = async ({ setLoading }) => {
    try {
      setLoading(true);

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

      const blob = new Blob(
        [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" },
      );

      saveAs(blob, "potongan-bank-all.xlsx");
    } catch (err) {
      console.error("Export all error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async ({ month, year, searchQuery, setLoading }) => {
    try {
      setLoading(true);

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

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Potongan Filter");

      const blob = new Blob(
        [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" },
      );

      saveAs(blob, "potongan-bank-filter.xlsx");
    } catch (err) {
      console.error("Export filter error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportBalancingToExcel = async ({
    selectedCabang,
    selectedUnitKerja,
    month,
    year,
    paymentNote,
    searchBalancing,
    setLoading,
  }) => {
    try {
      setLoading(true);

      const allData = await GlobalApi.getTransaksiBankBalancing(
        selectedCabang || null,
        selectedUnitKerja || null,
        year === "all" ? null : year ? parseInt(year) : null,
        month === "all" ? null : month ? parseInt(month) : null,
        paymentNote || null,
        searchBalancing || null,
      );

      if (!Array.isArray(allData) || allData.length === 0) {
        console.warn("Tidak ada data untuk diekspor");
        return;
      }

      // ✅ filter NPA (dipindah ke sini)
      const map = new Map();
      allData.forEach((item) => {
        if (!map.has(item.npa) || item.id > map.get(item.npa).id) {
          map.set(item.npa, item);
        }
      });
      const filteredData = Array.from(map.values());

      // ✅ cek duplicate rekening
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Balancing");

      const blob = new Blob(
        [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
        { type: "application/octet-stream" },
      );

      saveAs(blob, "balancing-potongan.xlsx");
    } catch (err) {
      console.error("Export balancing error:", err);
    } finally {
      setLoading(false);
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
  const exportBalancingToPDF = async ({
    selectedCabang,
    selectedUnitKerja,
    month,
    year,
    paymentNote,
    searchBalancing,
    setLoading,
  }) => {
    try {
      setLoading(true);

      const allData = await GlobalApi.getTransaksiBankBalancing(
        selectedCabang || null,
        selectedUnitKerja || null,
        year === "all" ? null : year ? parseInt(year) : null,
        month === "all" ? null : month ? parseInt(month) : null,
        paymentNote || null,
        searchBalancing || null,
      );

      if (!Array.isArray(allData) || allData.length === 0) {
        console.warn("Tidak ada data untuk PDF");
        return;
      }

      // filter NPA
      const map = new Map();
      allData.forEach((item) => {
        if (!map.has(item.npa) || item.id > map.get(item.npa).id) {
          map.set(item.npa, item);
        }
      });
      const data = Array.from(map.values());

      const doc = new jsPDF("l", "mm", "a4"); // landscape biar muat banyak kolom

      doc.setFontSize(14);
      doc.text("Laporan Balancing Potongan", 14, 10);

      const tableColumn = [
        "No",
        "Cabang",
        "Unit",
        "Nama",
        "Rekening",
        "Total",
        "Potongan",
        "Selisih",
        "Keterangan",
      ];

      const tableRows = data.map((item, index) => [
        index + 1,
        item.cabang,
        item.unitKerja,
        item.nama,
        item.rekening,
        item.totalIuran,
        item.potongan,
        item.selisih,
        item.keterangan,
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 15,
        styles: { fontSize: 7 },
      });

      doc.save("balancing-potongan.pdf");
    } catch (err) {
      console.error("Export PDF error:", err);
    } finally {
      setLoading(false);
    }
  };
  return {
    exportAllToExcel,
    exportToExcel,
    exportBalancingToExcel,
    exportRekapitulasiToExcel,
    formatTanggal,
    exportBalancingToPDF,
  };
};

export default useExportExcel;
