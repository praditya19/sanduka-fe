"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { Input } from "@/components/ui/input";
import GlobalApi from "@/app/_utils/GlobalApi";

// components
import HeaderSection from "./components/HeaderSection";
import SummaryCards from "./components/SummaryCards";
import DeleteUploadModal from "./components/DeleteUploadModal";
import DeleteBalancingModal from "./components/DeleteBalancingModal";
import ImportBalancingModal from "./components/ImportBalancingModal";
import UploadModal from "./components/UploadModal";
import TebNavigation from "./components/TebNavigation";
import EditBalancingModal from "./components/EditBalancingModal";
import DeleteModal from "./components/DeleteModal";
// component potongan
import PotonganHeaderActions from "./components/potongan/PotonganHeaderActions";
import PotonganFilters from "./components/potongan/PotonganFilters";
import PotonganTable from "./components/potongan/PotonganTable";
// component balancing
import BalancingHeaderActions from "./components/balancing/BalancingHeaderActions";
import BalancingFilters from "./components/balancing/BalancingFilters";
import BalancingTable from "./components/balancing/BalancingTable";
// Compoenent rekap
import RekapHeader from "./components/rekapitulasi/RekapHeader";
import RekapFilters from "./components/rekapitulasi/RekapFilters";
import RekapTable from "./components/rekapitulasi/RekapTable";
// hook
import usePotonganBank from "./hook/usePotonganBank";
import useUploadHandler from "./hook/useUploadHandler";
import useBalancing from "./hook/useBalancing";
import useExportExcel from "./hook/useExportExcel";
import useDropdownFilter from "./hook/useDropdownFilter";
import useRekapitulasi from "./hook/useRekapitulasi";

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
        return "text-[#0B131E]";
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

export default function BankTransactionPage() {
  const [activeTab, setActiveTab] = useState("potongan");
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteBalancing, setShowDeleteBalancing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [showImportBalancing, setShowImportBalancing] = useState(false);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const [displayCount, setDisplayCount] = useState(10);
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const bulanList = [
    { label: "Semua Bulan", value: "all" },
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
  ];
  const tahunList = [
    { label: "Semua Tahun", value: "all" },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: (currentYear - 2 + i).toString(),
      value: (currentYear - 2 + i).toString(),
    })),
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [onProses, setOnProses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalPagesBalancing, setTotalPagesBalancing] = useState(1);

  const updatedRowRef = useRef(null);
  const [updatedId, setUpdatedId] = useState(null);
  const cekRole = sessionStorage.getItem("role");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filteredBalancingData, setFilteredBalancingData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatRupiah = (angka) => {
    const parsed = Number(angka);
    if (isNaN(parsed)) return "Rp 0";
    return parsed.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleBalancingFilterChange = (filteredData) => {
    setFilteredBalancingData(filteredData);
  };
  // hook
  const {
    jumlahPotonganBank,
    totalNominalPotonganBank,
    jumlahSetorTunai,
    totalNominalSetorTunai,
    totalTerfilter,
    totalNominalTerfilter,
    searchQuery,
    setSearchQuery,
    data,
    loadingFilter,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePotonganBank(month, year);
  const {
    handleDeleteUpload,
    resetData,
    setResetData,
    handleInputChange,
    loader,
    progress,
    setLoader,
    setProgress,
    handleSubmitUpload,
  } = useUploadHandler({
    setNotification,
    setShowUploadModal,
  });

  // Get dropdown filters first
  const dropdownFilters = useDropdownFilter(
    showEditModal,
    editData,
    handleBalancingFilterChange,
    [], // Start with empty data
  );

  const {
    setFileImport,
    tagihanUntukBulan,
    setTagihanUntukBulan,
    handleImportBalancing,
    searchBalancing,
    setSearchBalancing,
    setPaymentNote,
    sortConfig,
    currentPageBalancing,
    handleDeleteClick,
    dataBalancing,
    loadingBalancing,
    sortedData,
    handleSort,
    handleSaveEdit,
    handleEditClick,
    paymentNote,
    getBalancingdata,
    importLoader,
    importProgress,
    resetUntukBulan,
    setResetUntukBulan,
    handleDelete,
    deleteLoader,
    deleteProgress,
  } = useBalancing({
    selectedCabang: dropdownFilters.selectedCabang,
    selectedUnitKerja: dropdownFilters.selectedUnitKerja,
    month,
    year,
    editData,
    setEditData,
    setShowEditModal,
    setShowImportBalancing,
    setShowDeleteBalancing,
    setNotification,
  });

  // Note: handleDelete dipindahkan ke useBalancing hook
  // Akses via: handleDelete dari destructure hook

  const balancingSummary = useMemo(() => {
    const source = Array.isArray(dataBalancing) ? dataBalancing : [];
    const potonganRows = source.filter(
      (item) =>
        !String(item.keterangan || "")
          .toLowerCase()
          .startsWith("tunai"),
    );
    const tunaiRows = source.filter((item) =>
      String(item.keterangan || "")
        .toLowerCase()
        .startsWith("tunai"),
    );

    return {
      jumlahPotonganBank: potonganRows.length,
      totalNominalPotonganBank: potonganRows.reduce(
        (sum, item) => sum + Number(item.potongan || 0),
        0,
      ),
      jumlahSetorTunai: tunaiRows.length,
      totalNominalSetorTunai: tunaiRows.reduce(
        (sum, item) => sum + Number(item.totalIuran || 0),
        0,
      ),
      totalTerfilter: source.length,
      totalNominalTerfilter: source.reduce(
        (sum, item) => sum + Number(item.totalIuran || 0),
        0,
      ),
    };
  }, [dataBalancing]);

  const summaryValues =
    activeTab === "potongan"
      ? {
          jumlahPotonganBank,
          totalNominalPotonganBank,
          jumlahSetorTunai,
          totalNominalSetorTunai,
          totalTerfilter,
          totalNominalTerfilter,
        }
      : balancingSummary;

  const {
    exportAllToExcel,
    exportToExcel,
    exportBalancingToExcel,
    exportRekapitulasiToExcel,
    formatTanggal,
    exportBalancingToPDF,
  } = useExportExcel();

  // Destructure from dropdown filters
  const {
    handleCabangClick,
    handleCabangSearch,
    selectedCabang,
    handleSelectCabang,
    filteredCabangList,
    unitKerjaInput,
    handleUnitKerjaChange,
    handleUnitKerjaClick,
    searchUnitKerja,
    handleUnitKerjaSearch,
    handleUnitKerjaSelect,
    filteredUnitKerja,
    showCabangDropdown,
    cabangRef,
    unitKerjaRef,
    selectedUnitKerja,
    showUnitKerjaDropdown,
  } = dropdownFilters;

  const { dataRekapitulasi, loadingRekapitulasi, getRekapitulasiData } =
    useRekapitulasi({
      activeTab,
      selectedCabang,
      selectedUnitKerja,
      year,
      month,
      paymentNote,
      searchBalancing,
    });

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

  useEffect(() => {
    if (!dataBalancing || dataBalancing.length === 0) {
      setFilteredBalancingData([]); // 🔥 reset
      return;
    }

    if (!selectedCabang && !selectedUnitKerja) {
      setFilteredBalancingData(dataBalancing);
    }
  }, [dataBalancing, selectedCabang, selectedUnitKerja]);

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
  };
  const handleCloseModalDelete = () => {
    setShowDeleteModal(false);
    setResetData("");
  };
  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    await handleDeleteClick(selectedId);
    setShowDeletePopup(false);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxPagesToShow - 1, totalPages);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(end - maxPagesToShow + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };
  const handleExportPDF = () => {
    exportBalancingToPDF({
      selectedCabang,
      selectedUnitKerja,
      month,
      year,
      paymentNote,
      searchBalancing,
      setLoading,
    });
  };
  const isFiltering =
    selectedCabang ||
    selectedUnitKerja ||
    paymentNote ||
    searchBalancing ||
    month !== "all" ||
    year !== "all";
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-1">
      <HeaderSection handleBackClick={handleBackClick} />

      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`pt-20 pb-8 px-4 md:px-8 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Transaksi Pemotongan Bank
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola dan lihat data transaksi pemotongan bank serta lakukan
              balancing.
            </p>
          </div>

          <SummaryCards
            activeTab={activeTab}
            jumlahPotonganBank={summaryValues.jumlahPotonganBank}
            totalNominalPotonganBank={summaryValues.totalNominalPotonganBank}
            jumlahSetorTunai={summaryValues.jumlahSetorTunai}
            totalNominalSetorTunai={summaryValues.totalNominalSetorTunai}
            totalTerfilter={summaryValues.totalTerfilter}
            totalNominalTerfilter={summaryValues.totalNominalTerfilter}
            formatRupiah={formatRupiah}
          />

          <TebNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <DeleteUploadModal
            showDeleteModal={showDeleteModal}
            handleCloseModalDelete={handleCloseModalDelete}
            handleDeleteUpload={handleDeleteUpload}
            resetData={resetData}
            handleInputChange={handleInputChange}
            loader={loader}
            progress={progress}
          />
          <DeleteBalancingModal
            showDeleteBalancing={showDeleteBalancing}
            setShowDeleteBalancing={setShowDeleteBalancing}
            handleDelete={handleDelete}
            resetUntukBulan={resetUntukBulan}
            setResetUntukBulan={setResetUntukBulan}
            loader={deleteLoader}
            progress={deleteProgress}
          />

          <ImportBalancingModal
            showImportBalancing={showImportBalancing}
            setShowImportBalancing={setShowImportBalancing}
            setFileImport={setFileImport}
            tagihanUntukBulan={tagihanUntukBulan}
            setTagihanUntukBulan={setTagihanUntukBulan}
            handleImportBalancing={handleImportBalancing}
            loader={importLoader}
            progress={importProgress}
          />

          <UploadModal
            showUploadModal={showUploadModal}
            handleCloseModal={handleCloseModal}
            handleSubmitUpload={handleSubmitUpload}
            handleInputChange={handleInputChange}
            loader={loader}
            progress={progress}
          />

          {activeTab === "potongan" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <PotonganHeaderActions
                isLoading={isLoading}
                exportAllToExcel={() =>
                  exportAllToExcel({ setLoading: setIsLoading })
                }
                exportToExcel={() =>
                  exportToExcel({
                    month,
                    year,
                    searchQuery,
                    setLoading: setIsLoading,
                  })
                }
                setShowDeleteModal={setShowDeleteModal}
                setShowUploadModal={setShowUploadModal}
              />

              <PotonganFilters
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                bulanList={bulanList}
                tahunList={tahunList}
              />

              <div className="overflow-x-auto">
                <PotonganTable
                  data={data}
                  loadingFilter={loadingFilter}
                  currentPage={currentPage}
                  displayCount={displayCount}
                  formatRupiah={formatRupiah}
                  formatTanggal={formatTanggal}
                />
              </div>

              <div className="p-4 border-t">
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handlePageClick(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    First
                  </button>

                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Prev
                  </button>

                  {getVisiblePages().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        page === currentPage
                          ? "bg-teal-600 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageClick(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "balancing" && (
            <div className="bg-white rounded-xl shadow-sm w-auto">
              <BalancingHeaderActions
                isLoading={isLoading}
                onExport={() =>
                  exportBalancingToExcel({
                    selectedCabang,
                    selectedUnitKerja,
                    month,
                    year,
                    paymentNote,
                    searchBalancing,
                    setLoading: setIsLoading,
                  })
                }
                onExportPDF={handleExportPDF}
                role={sessionStorage.getItem("role")}
                onDeleteBalancing={() => setShowDeleteBalancing(true)}
                onImportBalancing={() => setShowImportBalancing(true)}
              />

              <BalancingFilters
                cabangRef={cabangRef}
                selectedCabang={selectedCabang}
                role={sessionStorage.getItem("role")}
                showCabangDropdown={showCabangDropdown}
                handleCabangClick={handleCabangClick}
                handleCabangSearch={handleCabangSearch}
                handleSelectCabang={handleSelectCabang}
                filteredCabangList={filteredCabangList}
                unitKerjaRef={unitKerjaRef}
                unitKerjaInput={unitKerjaInput}
                handleUnitKerjaChange={handleUnitKerjaChange}
                handleUnitKerjaClick={handleUnitKerjaClick}
                showUnitKerjaDropdown={showUnitKerjaDropdown}
                searchUnitKerja={searchUnitKerja}
                handleUnitKerjaSearch={handleUnitKerjaSearch}
                handleUnitKerjaSelect={handleUnitKerjaSelect}
                filteredUnitKerja={filteredUnitKerja}
                month={month}
                setMonth={setMonth}
                bulanList={bulanList}
                year={year}
                setYear={setYear}
                tahunList={tahunList}
                searchBalancing={searchBalancing}
                setSearchBalancing={setSearchBalancing}
                paymentNote={paymentNote}
                setPaymentNote={setPaymentNote}
                Input={Input}
              />

              <div className="relative">
                <BalancingTable
                  loadingBalancing={loadingBalancing}
                  sortedData={sortedData}
                  dataBalancing={dataBalancing}
                  currentPageBalancing={currentPageBalancing}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  cekRole={cekRole}
                  updatedId={updatedId}
                  updatedRowRef={updatedRowRef}
                  formatRupiah={formatRupiah}
                  handleEditClick={handleEditClick}
                  setSelectedId={setSelectedId}
                  setShowDeletePopup={setShowDeletePopup}
                />
              </div>
            </div>
          )}

          {activeTab === "rekapitulasi" && (
            <div className="bg-white rounded-xl shadow-sm w-[1900px]">
              <div className="p-6 border-b border-gray-100">
                <RekapHeader
                  isLoading={isLoading}
                  exportRekapitulasiToExcel={exportRekapitulasiToExcel}
                />
                <RekapFilters
                  selectedCabang={selectedCabang}
                  handleCabangClick={handleCabangClick}
                  showCabangDropdown={showCabangDropdown}
                  handleSelectCabang={handleSelectCabang}
                  filteredCabangList={filteredCabangList}
                  cabangRef={cabangRef}
                  handleCabangSearch={handleCabangSearch}
                  role={sessionStorage.getItem("role")}
                  bulanList={bulanList}
                  month={month}
                  setMonth={setMonth}
                  tahunList={tahunList}
                  year={year}
                  setYear={setYear}
                  paymentNote={paymentNote}
                  setPaymentNote={setPaymentNote}
                  Input={Input}
                />
              </div>
              {loadingRekapitulasi ? (
                <div className="text-center animate-slide-up mt-28">
                  <p className="text-gray-600 text-2xl font-medium">
                    Sedang Proses
                    <span className="inline-block dot-animation ml-1">.</span>
                    <span
                      className="inline-block dot-animation ml-0.5"
                      style={{ animationDelay: "0.2s" }}
                    >
                      .
                    </span>
                    <span
                      className="inline-block dot-animation ml-0.5"
                      style={{ animationDelay: "0.4s" }}
                    >
                      .
                    </span>
                  </p>
                </div>
              ) : (
                <div className="w-full -mt-12">
                  <div className="p-6 border-b border-gray-100">
                    <RekapTable
                      dataRekapitulasi={dataRekapitulasi}
                      formatRupiah={formatRupiah}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showEditModal && (
        <EditBalancingModal
          editData={editData}
          setEditData={setEditData}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showDeletePopup && (
        <DeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}
    </div>
  );
}
