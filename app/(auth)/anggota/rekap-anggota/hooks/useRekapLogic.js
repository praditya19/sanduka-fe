import { useState, useCallback, useEffect, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { processApiResponse } from "../utils/rekapUtils";

export const useRekapLogic = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [originalRekapData, setOriginalRekapData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter States
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [namaAnggotaInput, setNamaAnggotaInput] = useState("");

  const fetchData = useCallback(async (cabang = "") => {
    setLoading(true);
    try {
      let res = await GlobalApi.getNominalAggregatedData(cabang);
      res = processApiResponse(res, null, false);
      const regular = res.filter(item => !(item.cabang === "Total" && !item.unitKerja));
      setData(regular);
      if (cabang === "") setOriginalRekapData(regular);
    } catch (err) {
      console.error("Error fetching data:", err);
      setNotification({ type: "error", message: "Gagal memuat data." });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateIuran = async (nip, payload) => {
    try {
      await GlobalApi.updateIuranByNip(nip, payload);
      setNotification({ type: "success", message: "Data berhasil diperbarui!" });
      fetchData(selectedCabang);
      return true;
    } catch (err) {
      console.error("Error updating iuran:", err);
      setNotification({ type: "error", message: "Gagal memperbarui data." });
      return false;
    }
  };

  return {
    data,
    setData,
    originalRekapData,
    loading,
    setLoading,
    isExporting,
    setIsExporting,
    notification,
    setNotification,
    selectedCabang,
    setSelectedCabang,
    selectedUnitKerja,
    setSelectedUnitKerja,
    namaAnggotaInput,
    setNamaAnggotaInput,
    fetchData,
    handleUpdateIuran
  };
};
