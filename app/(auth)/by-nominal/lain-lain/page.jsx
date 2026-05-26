"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaDatabase, FaUpload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

import NotificationPopup from "@/app/_components/NotificationPopup";
import UploadPopup from "@/app/_components/UploadPopup";
import DeleteModal from "@/app/_components/DeleteModal";
import UpdateModal from "@/app/_components/UpdateModal";
import UpdateByBulanModal from "@/app/_components/UpdateByBulanModal";
import FilterControls from "@/app/_components/FilterControls";
import NominalTable from "@/app/_components/NominalTable";
import TabNavigation from "@/app/_components/TabNavigation";

function ByNominal() {
  const router = useRouter();
  const { token } = useAuth();
  const [dataNominal, setDataNominal] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [searchCabang, setSearchCabang] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [namaAnggotaInput, setNamaAnggotaInput] = useState("");
  const [debouncedNamaAnggota, setDebouncedNamaAnggota] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    itemName: "",
  });

  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    data: null,
    loading: false,
  });

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const updateCabangRef = useRef(null);
  const updateUnitRef = useRef(null);
  const [showUpdateCabangDropdown, setShowUpdateCabangDropdown] =
    useState(false);
  const [showUpdateUnitDropdown, setShowUpdateUnitDropdown] = useState(false);
  const [searchUpdateCabang, setSearchUpdateCabang] = useState("");
  const [searchUpdateUnit, setSearchUpdateUnit] = useState("");
  const [filteredUpdateUnit, setFilteredUpdateUnit] = useState([]);

  useEffect(() => {
    if (!token) router.push("/sign-in");
  }, [token, router]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [nominalRes, cabangRes, unitRes] = await Promise.all([
        GlobalApi.getAllByNominal(),
        GlobalApi.getCabang(),
        GlobalApi.getUnitKerja(),
      ]);
      setDataNominal(nominalRes || []);
      setOriginalCabangList(cabangRes.data);
      setFilteredCabangList(cabangRes.data);
      setUnitKerjaList(unitRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setNotification({ type: "error", message: "Gagal mengambil data." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNamaAnggota(namaAnggotaInput);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [namaAnggotaInput]);

  useEffect(() => {
    let filtered = dataNominal;

    if (selectedCabang) {
      filtered = filtered.filter(
        (item) =>
          item.cabang &&
          item.cabang.toLowerCase().includes(selectedCabang.toLowerCase())
      );
    }
    if (unitKerjaInput) {
      filtered = filtered.filter(
        (item) =>
          item.unitKerja &&
          item.unitKerja.toLowerCase().includes(unitKerjaInput.toLowerCase())
      );
    }

    if (debouncedNamaAnggota) {
      filtered = filtered.filter(
        (item) =>
          item.namaAnggota &&
          item.namaAnggota
            .toLowerCase()
            .includes(debouncedNamaAnggota.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [dataNominal, selectedCabang, unitKerjaInput, debouncedNamaAnggota]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target))
        setShowCabangDropdown(false);
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target))
        setShowUnitKerjaDropdown(false);
      if (
        updateCabangRef.current &&
        !updateCabangRef.current.contains(event.target)
      )
        setShowUpdateCabangDropdown(false);
      if (
        updateUnitRef.current &&
        !updateUnitRef.current.contains(event.target)
      )
        setShowUpdateUnitDropdown(false);
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    handleResize();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const handleCabangClick = () => setShowCabangDropdown(true);

  const handleCabangSearch = useCallback(
    (query) => {
      setSearchCabang(query);
      setFilteredCabangList(
        originalCabangList.filter((c) =>
          c.kecamatan.toLowerCase().includes(query.toLowerCase())
        )
      );
    },
    [originalCabangList]
  );

  const handleSelectCabang = useCallback(
    (cabang) => {
      setSelectedCabang(cabang.kecamatan);
      setShowCabangDropdown(false);
      setUnitKerjaInput("");
      setFilteredUnitKerja(
        unitKerjaList.filter((u) => u.cabang === cabang.kecamatan)
      );
    },
    [unitKerjaList]
  );

  const handleUnitKerjaClick = () => {
    if (!selectedCabang) return;
    const filtered = unitKerjaList.filter((u) => u.cabang === selectedCabang);
    setFilteredUnitKerja(filtered);
    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSearch = useCallback(
    (term) => {
      setSearchUnitKerja(term);
      const filtered = unitKerjaList.filter(
        (u) =>
          u.cabang === selectedCabang &&
          u.unitKerja.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
    },
    [selectedCabang, unitKerjaList]
  );

  const handleUnitKerjaSelect = useCallback((unit) => {
    setUnitKerjaInput(unit.unitKerja);
    setShowUnitKerjaDropdown(false);
  }, []);

  const openUpdateModal = (item) => {
    let tagihanUntukBulan = item.tagihanUntukBulan;
    if (Array.isArray(tagihanUntukBulan) && tagihanUntukBulan.length === 3) {
      const [year, month, day] = tagihanUntukBulan;
      tagihanUntukBulan = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }
    setUpdateModal({
      isOpen: true,
      data: { ...item, tagihanUntukBulan },
      loading: false,
    });
  };

  const closeUpdateModal = () => {
    setUpdateModal({ isOpen: false, data: null, loading: false });
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateModal((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateModal.data) return;

    const id =
      typeof updateModal.data.id === "object"
        ? updateModal.data.id.id
        : updateModal.data.id;
    const total =
      (updateModal.data.pgri || 0) +
      (updateModal.data.sanduka || 0) +
      (updateModal.data.daspen || 0) +
      (updateModal.data.derap || 0) +
      (updateModal.data.kalender || 0) +
      (updateModal.data.lainLain || 0);
    const updatedData = { ...updateModal.data, total };

    closeUpdateModal();
    setDataNominal((prevData) =>
      prevData.map((item) => (item.id === id ? updatedData : item))
    );
    setFilteredData((prevData) =>
      prevData.map((item) => (item.id === id ? updatedData : item))
    );

    GlobalApi.updateByNominal(id, updatedData)
      .then(() => {
        setNotification({
          type: "success",
          message: "Data berhasil diperbarui.",
        });
      })
      .catch((err) => {
        console.error("Error updating data:", err);
        setNotification({
          type: "error",
          message: "Gagal memperbarui data. Memulihkan data...",
        });

        fetchAllData();
      });
  };

  const formatDate = useCallback((dateValue) => {
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
    return dateValue;
  }, []);

  const openUpdatePopup = useCallback(
    (item) => {
      setSelectedItem({
        ...item,
        tagihanUntukBulan: item.tagihanUntukBulan
          ? formatDate(item.tagihanUntukBulan)
          : "",
      });
      setShowUpdateModal(true);
    },
    [formatDate]
  );

  const closeModal = useCallback(() => {
    setShowUpdateModal(false);
    setSelectedItem(null);
  }, []);

  const handleChange = (field, value) => {
    setSelectedItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      setLoadingUpdate(true);
      const nip = selectedItem?.nip || "";
      const bulan = selectedItem?.tagihanUntukBulan || "";
      const payload = {
        namaAnggota: selectedItem.namaAnggota,
        nip: selectedItem.nip,
        nomorRekening: selectedItem.nomorRekening,
        cabang: selectedItem.cabang,
        unitKerja: selectedItem.unitKerja,
        pgri: Number(selectedItem.pgri),
        sanduka: Number(selectedItem.sanduka),
        daspen: Number(selectedItem.daspen),
        derap: Number(selectedItem.derap),
        kalender: Number(selectedItem.kalender),
        lainLain: Number(selectedItem.lainLain),
      };
      await GlobalApi.updateByNominalByBulan(nip, bulan, payload);
      setNotification({
        type: "success",
        message: "Data berhasil diperbarui.",
      });
      closeModal();
      await fetchAllData();
    } catch (error) {
      console.error("Gagal update:", error);
      setNotification({ type: "error", message: "Gagal memperbarui data." });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const openDeleteModal = useCallback((id, itemName = "") => {
    setDeleteModal({ isOpen: true, id: id, itemName: itemName });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, id: null, itemName: "" });
  }, []);

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setLoading(true);
      await GlobalApi.deleteByNominal(deleteModal.id);
      setNotification({ type: "success", message: "Data berhasil dihapus." });
      closeDeleteModal();
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting data:", err);
      setNotification({
        type: "error",
        message: "Gagal menghapus data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          } p-4 md:p-8`}
        >
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
          <div className="mt-8">
            <TabNavigation />
          </div>
          <div className="flex items-center justify-between mb-6 mt-14">
            <div className="flex items-center gap-2">
              <FaDatabase className="text-2xl text-gray-700" />
              <h1 className="font-semibold text-2xl">Lain  - Lain</h1>
            </div>
          </div>

          <FilterControls
            {...{
              cabangRef,
              selectedCabang,
              handleCabangClick,
              showCabangDropdown,
              searchCabang,
              handleCabangSearch,
              handleSelectCabang,
              filteredCabangList,
              unitKerjaRef,
              unitKerjaInput,
              handleUnitKerjaClick,
              showUnitKerjaDropdown,
              searchUnitKerja,
              handleUnitKerjaSearch,
              handleUnitKerjaSelect,
              filteredUnitKerja,
              namaAnggotaInput,
              setNamaAnggotaInput,
            }}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#14b8a6" size={45} />
            </div>
          ) : (
            <NominalTable
              data={filteredData}
              onEdit={openUpdatePopup}
              onDelete={openDeleteModal}
            />
          )}
        </div>
      </div>

      {showUploadPopup && (
        <UploadPopup
          onClose={() => setShowUploadPopup(false)}
          setNotification={setNotification}
          fetchAllData={fetchAllData}
        />
      )}

      {updateModal.isOpen && (
        <UpdateModal
          {...{
            updateModal,
            closeUpdateModal,
            handleUpdateSubmit,
            handleUpdateInputChange,
            updateCabangRef,
            showUpdateCabangDropdown,
            setShowUpdateCabangDropdown,
            searchUpdateCabang,
            setSearchUpdateCabang,
            filteredCabangList,
            originalCabangList,
            unitKerjaList,
            updateUnitRef,
            showUpdateUnitDropdown,
            setShowUpdateUnitDropdown,
            searchUpdateUnit,
            setSearchUpdateUnit,
            filteredUpdateUnit,
            setFilteredUpdateUnit,
          }}
        />
      )}

      {showUpdateModal && (
        <UpdateByBulanModal
          {...{
            selectedItem,
            setSelectedItem,
            loadingUpdate,
            setLoadingUpdate,
            closeModal,
            handleUpdate,
            handleChange,
            setNotification,
            fetchAllData,
          }}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteModal
          {...{
            deleteModal,
            closeDeleteModal,
            confirmDelete,
            loading,
          }}
        />
      )}
    </div>
  );
}

export default ByNominal;
