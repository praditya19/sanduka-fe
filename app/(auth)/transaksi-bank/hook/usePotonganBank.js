import { useState, useCallback, useEffect, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const usePotonganBank = (
  month,
  year,
  { selectedCabang = "", unitKerjaInput = "", searchBalancing = "" } = {},
) => {
  const [data, setData] = useState([]);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCountPotongan, setDisplayCountPotongan] = useState(10);
  const [jumlahPotonganBank, setJumlahPotonganBank] = useState(0);
  const [totalNominalPotonganBank, setTotalNominalPotonganBank] = useState(0);
  const [jumlahSetorTunai, setJumlahSetorTunai] = useState(0);
  const [totalNominalSetorTunai, setTotalNominalSetorTunai] = useState(0);
  const [totalTerfilter, setTotalTerfilter] = useState(0);
  const [totalNominalTerfilter, setTotalNominalTerfilter] = useState(0);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [displayCount, setDisplayCount] = useState(10);

  const handleFilter = async () => {
    setData([]);
    setLoadingFilter(true);
    console.log("[usePotonganBank] handleFilter params:", {
      month,
      year,
      displayCountPotongan,
      currentPage,
    });
    try {
      let result;

      if (displayCountPotongan === "all") {
        const tempResult = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          1,
          0,
        );

        const totalElements = tempResult.totalElements;

        result = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          totalElements,
          0,
        );
      } else {
        result = await GlobalApi.getTransaksiBank(
          month,
          year,
          searchQuery,
          displayCountPotongan,
          currentPage - 1,
        );
      }

      console.log("[usePotonganBank] API result summary:", {
        totalElements: result && result.totalElements,
        contentLength:
          result && Array.isArray(result.content) ? result.content.length : 0,
      });

      setData(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("[usePotonganBank] Gagal memuat data:", err);
    } finally {
      setLoadingFilter(false);
    }
  };
  const getPotonganBank = async () => {
    setJumlahPotonganBank(0);
    setTotalNominalPotonganBank(0);
    try {
      const data = await GlobalApi.getCountAnggotaPotonganBank(month, year);
      setJumlahPotonganBank(data.jumlahAnggota || 0);
      setTotalNominalPotonganBank(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal mengambil data potongan bank:", error);
    }
  };
  const getSetorTunai = async () => {
    setJumlahSetorTunai(0);
    setTotalNominalSetorTunai(0);
    try {
      const data = await GlobalApi.getCountAnggotaSetorTunai({
        cabang: selectedCabang || null,
        unitKerja: unitKerjaInput || null,
        search: searchBalancing || null,
        bulan: month || null,
        tahun: year || null,
      });

      setJumlahSetorTunai(data.jumlahAnggota || 0);
      setTotalNominalSetorTunai(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal fetch:", error);
    }
  };
  const getAnggotaTerfilter = async () => {
    setTotalTerfilter(0);
    setTotalNominalTerfilter(0);
    try {
      const data = await GlobalApi.getCountAnggotaTerfilter({
        cabang: selectedCabang || null,
        unitKerja: unitKerjaInput || null,
        search: searchBalancing || null,
        bulan: month || null,
        tahun: year || null,
      });

      setTotalTerfilter(data.jumlahAnggota || 0);
      setTotalNominalTerfilter(data.totalNominal || 0);
    } catch (error) {
      console.error("❌ Gagal fetch:", error);
    }
  };

  useEffect(() => {
    handleFilter();
    getPotonganBank();
    getSetorTunai();
    getAnggotaTerfilter();
  }, [
    month,
    year,
    searchQuery,
    displayCount,
    displayCountPotongan,
    currentPage,
    selectedCabang,
    unitKerjaInput,
    searchBalancing,
  ]);

  return {
    // state
    data,
    loadingFilter,
    currentPage,
    totalPages,
    searchQuery,
    displayCountPotongan,
    jumlahPotonganBank,
    totalNominalPotonganBank,
    jumlahSetorTunai,
    totalNominalSetorTunai,
    totalTerfilter,
    totalNominalTerfilter,

    // setter
    setCurrentPage,
    setSearchQuery,
    setDisplayCountPotongan,

    // function
    handleFilter,
    getPotonganBank,
    getSetorTunai,
    getAnggotaTerfilter,
  };
};

export default usePotonganBank;
