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
  setShowImportBalancing,
  setShowDeleteBalancing,
  setNotification,
  role,
}) => {
  const [dataBalancing, setDataBalancing] = useState([]);
  const [loadingBalancing, setLoadingBalancing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [fileImport, setFileImport] = useState(null);
  const [tagihanUntukBulan, setTagihanUntukBulan] = useState("");
  const [searchBalancing, setSearchBalancing] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [resetUntukBulan, setResetUntukBulan] = useState("");
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [posLainLainName, setPosLainLainName] = useState("");

  const fetchPosLainLain = async () => {
    try {
      const res = await GlobalApi.getPosLainLain();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        const bulanIndo = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const monthNum = month !== "all" ? Number(month) : new Date().getMonth() + 1;
        const yearNum = year !== "all" ? String(year) : String(new Date().getFullYear());
        const bulanName = bulanIndo[monthNum - 1] || "";

        const found =
          list.find((p) => {
            const pBulan = (p.bulan || "").trim().toLowerCase();
            const pTahun = String(p.tahun || "").trim();
            return (
              (!pBulan || pBulan === bulanName.toLowerCase()) &&
              (!pTahun || pTahun === yearNum) &&
              (p.nama || "").toUpperCase().includes("HUT")
            );
          }) ||
          list.find((p) => {
            const pBulan = (p.bulan || "").trim().toLowerCase();
            const pTahun = String(p.tahun || "").trim();
            return pBulan === bulanName.toLowerCase() && pTahun === yearNum;
          }) ||
          list.find((p) => {
            const pBulan = (p.bulan || "").trim().toLowerCase();
            return pBulan === bulanName.toLowerCase();
          }) ||
          list.find((p) => (p.nama || "").toUpperCase().includes("HUT")) ||
          list.find((p) => String(p.tahun || "").trim() === yearNum) ||
          list[0];

        if (found) setPosLainLainName(found.nama);
      }
    } catch (err) {
      console.warn("Gagal ambil pos lain-lain:", err);
    }
  };

  useEffect(() => {
    fetchPosLainLain();
  }, []);

  const getBalancingdata = async () => {
    // ⛔ hanya ADMIN yang wajib punya cabang
    if (role !== "SUPERADMIN" && (!selectedCabang || selectedCabang === "")) {
      return;
    }
    setLoadingBalancing(true);

    try {
      const parsedYear = year !== "all" ? Number(year) : null;
      const parsedMonth = month !== "all" ? Number(month) : null;

      const parsedCabang = !selectedCabang ? null : selectedCabang;
      const result = await GlobalApi.getTransaksiBankBalancing(
        parsedCabang,
        selectedUnitKerja || null,
        parsedYear,
        parsedMonth,
        paymentNote || null,
        searchBalancing || null,
      );

      const safeResult = Array.isArray(result) ? result : result?.content || [];

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
  // Note: deleting by month (reset) is handled in the page component
  // because it needs access to UI state (loader/progress/modal setters).
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

      console.log("[useBalancing] Saving edit for id:", editData.id, {
        editData,
        payload,
      });

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
      setImportLoader(true);
      setImportProgress(0);

      await GlobalApi.importExcelTargetIuran(fileImport, tagihanUntukBulan);

      setNotification({ type: "success", message: "Import Berhasil!" });

      if (typeof setShowImportBalancing === "function") {
        setShowImportBalancing(false);
      }

      setFileImport(null);
      setTagihanUntukBulan("");

      // refresh data after successful import
      if (typeof getBalancingdata === "function") {
        await getBalancingdata();
      }
    } catch (error) {
      console.error("Import gagal:", error);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat import data.",
      });
    } finally {
      setImportLoader(false);
      setImportProgress(0);
    }
  };

  const handleDelete = async (e) => {
    if (e) e.preventDefault();

    if (!resetUntukBulan) {
      alert("Pilih bulan terlebih dahulu!");
      return;
    }

    try {
      setDeleteLoader(true);
      setDeleteProgress(0);

      const tagihan = resetUntukBulan.trim();
      await GlobalApi.deleteBalancing(tagihan, {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setDeleteProgress(percentCompleted);
          }
        },
      });

      setNotification({ type: "success", message: "Data berhasil dihapus!" });
      if (typeof setShowDeleteBalancing === "function") {
        setShowDeleteBalancing(false);
      }
      setResetUntukBulan("");
      await getBalancingdata();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      setNotification({ type: "error", message: "Gagal hapus data." });
    } finally {
      setDeleteLoader(false);
      setDeleteProgress(0);
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
    role,
    month,
    year,
    paymentNote,
    searchBalancing,
  ]);

  const handleConfirmLunas = async (item) => {
    try {
      const parsedYear = year !== "all" ? Number(year) : null;
      const parsedMonth = month !== "all" ? Number(month) : null;

      await GlobalApi.setPelunasanBalancing({
        id: item.id,
        npa: item.npa,
        rekening: item.rekening,
        namaAnggota: item.nama,
        cabang: item.cabang,
        unitKerja: item.unitKerja,
        nominal: item.totalIuran,
        bulan: parsedMonth,
        tahun: parsedYear,
        keterangan: "Sukses",
      });

      setNotification({
        type: "success",
        message: `Status iuran untuk ${item.nama} berhasil ditandai LUNAS!`,
      });

      await getBalancingdata();
    } catch (err) {
      console.error("Gagal menandai lunas:", err);
      setNotification({
        type: "error",
        message: err?.response?.data?.message || "Gagal menandai lunas.",
      });
      throw err;
    }
  };

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
    handleEditClick,
    handleSaveEdit,
    handleConfirmLunas,
    handleImportBalancing,
    handleDelete,
    handleSort,
    sortedData,
    paymentNote,
    setPaymentNote,
    setDataBalancing,
    importLoader,
    importProgress,
    resetUntukBulan,
    setResetUntukBulan,
    deleteLoader,
    deleteProgress,
    posLainLainName,
  };
};
export default useBalancing;
