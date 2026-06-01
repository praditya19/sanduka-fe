import { useState, useEffect, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const useBalancing = ({
  selectedCabang,
  selectedUnitKerja,
  month,
  year,
  editData,
  setEditData,
  setShowEditModal,
  setNotification,
}) => {
  const [dataBalancing, setDataBalancing] = useState([]);
  const [loadingBalancing, setLoadingBalancing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [fileImport, setFileImport] = useState(null);
  const [tagihanUntukBulan, setTagihanUntukBulan] = useState("");
  const [searchBalancing, setSearchBalancing] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const getBalancingdata = async () => {
    setLoadingBalancing(true);

    try {
      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      let cabangFilter = "";

      if (storedRole === "ADMIN") {
        cabangFilter = storedCabang || "";
      } else {
        cabangFilter = selectedCabang || "";
      }

      const parsedYear = year !== "all" ? Number(year) : null;
      const parsedMonth = month !== "all" ? Number(month) : null;

      const result = await GlobalApi.getTransaksiBankBalancing(
        cabangFilter || null,
        selectedUnitKerja || null,
        parsedYear,
        parsedMonth,
        paymentNote || null,
        searchBalancing || null,
      );

      const safeResult = Array.isArray(result) ? result : [];

      setDataBalancing(safeResult);
    } catch (err) {
      console.error("❌ Gagal memuat data:", err);
      setDataBalancing([]);
    } finally {
      setLoadingBalancing(false);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await GlobalApi.deleteBalancingById(id);

      setNotification({
        type: "success",
        message: "Data berhasil dihapus!",
      });

      await getBalancingdata();
    } catch (error) {
      console.error(error);

      setNotification({
        type: "error",
        message: "Gagal menghapus data!",
      });
    }
  };
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!resetUntukBulan) {
      alert("Pilih bulan terlebih dahulu!");
      return;
    }

    try {
      setLoader(true);
      setProgress(0);

      const tagihanUntukBulan = resetUntukBulan.trim();
      await GlobalApi.deleteBalancing(tagihanUntukBulan, {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(percentCompleted);
          }
        },
      });

      setNotification({
        type: "success",
        message: "Data berhasil dihapus!",
      });
      setShowDeleteBalancing(false);
      setResetUntukBulan("");
      getBalancingdata();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      setNotification({
        type: "error",
        message: "Gagal hapus data.",
      });
    } finally {
      setLoader(false);
    }
  };
  const handleEditClick = async (id) => {
    try {
      const data = await GlobalApi.getBalancingById(id);
      console.log(data);
      setEditData(data);
      setShowEditModal(true);
      await getBalancingdata();
    } catch (err) {
      console.error("Gagal ambil data balancing:", err);
    }
  };
  const handleSaveEdit = async () => {
    if (!editData || !editData.id) {
      alert("Data tidak valid!");
      return;
    }

    try {
      const payload = {
        namaAnggota: editData.namaAnggota,
        nip: editData.nip,
        npa: editData.npa,
        nomorRekening: editData.nomorRekening,
        cabang: editData.cabang,
        unitKerja: editData.unitKerja,
        statusPegawai: editData.statusPegawai,

        defaultPgri: editData.defaultPgri || 0,
        manualPgri: editData.manualPgri || 0,
        pgri: (editData.defaultPgri || 0) + (editData.manualPgri || 0),

        defaultSanduka: editData.defaultSanduka || 0,
        manualSanduka: editData.manualSanduka || 0,
        sanduka: (editData.defaultSanduka || 0) + (editData.manualSanduka || 0),

        defaultDaspen: editData.defaultDaspen || 0,
        manualDaspen: editData.manualDaspen || 0,
        daspen: (editData.defaultDaspen || 0) + (editData.manualDaspen || 0),

        defaultDerap: editData.defaultDerap || 0,
        manualDerap: editData.manualDerap || 0,
        derap: (editData.defaultDerap || 0) + (editData.manualDerap || 0),

        defaultKalender: editData.defaultKalender || 0,
        manualKalender: editData.manualKalender || 0,
        kalender:
          (editData.defaultKalender || 0) + (editData.manualKalender || 0),

        defaultLainLain: editData.defaultLainLain || 0,
        manualLainLain: editData.manualLainLain || 0,
        lainLain:
          (editData.defaultLainLain || 0) + (editData.manualLainLain || 0),

        total:
          (editData.defaultPgri || 0) +
          (editData.manualPgri || 0) +
          (editData.defaultSanduka || 0) +
          (editData.manualSanduka || 0) +
          (editData.defaultDaspen || 0) +
          (editData.manualDaspen || 0) +
          (editData.defaultDerap || 0) +
          (editData.manualDerap || 0) +
          (editData.defaultKalender || 0) +
          (editData.manualKalender || 0) +
          (editData.defaultLainLain || 0) +
          (editData.manualLainLain || 0),

        tagihanUntukBulan: editData.tagihanUntukBulan,
      };

      await GlobalApi.updateBalancing(editData.id, payload);

      setNotification({
        type: "success",
        message: "Data berhasil diperbarui!",
      });

      setShowEditModal(false);
      await getBalancingdata();
    } catch (err) {
      console.error("Gagal update data:", err);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat update data.",
      });
    }
  };
  const handleImportBalancing = async () => {
    if (!fileImport || !tagihanUntukBulan) {
      alert("File dan tanggal harus diisi");
      return;
    }

    try {
      await GlobalApi.importExcelTargetIuran(fileImport, tagihanUntukBulan);

      setNotification({
        type: "success",
        message: "Import Berhasil!",
      });

      setShowImportBalancing(false);
      setFileImport(null);
      setTagihanUntukBulan("");
    } catch (error) {
      console.error("Import gagal:", error);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat import data.",
      });
    }
  };
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!dataBalancing || dataBalancing.length === 0) return [];

    let sorted = [...dataBalancing];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key] || 0;
        const bVal = b[sortConfig.key] || 0;

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [dataBalancing, sortConfig]);

  useEffect(() => {
    getBalancingdata();
  }, [
    selectedCabang,
    selectedUnitKerja,
    month,
    year,
    paymentNote,
    searchBalancing,
  ]);

  return {
    dataBalancing,
    loadingBalancing,
    searchBalancing,
    setSearchBalancing,
    sortConfig,
    fileImport,
    tagihanUntukBulan,
    setSortConfig,
    setFileImport,
    setTagihanUntukBulan,
    getBalancingdata,
    handleDeleteClick,
    handleDelete,
    handleEditClick,
    handleSaveEdit,
    handleImportBalancing,
    handleSort,
    sortedData,
    paymentNote,
    setPaymentNote,
    setDataBalancing,
  };
};
export default useBalancing;
