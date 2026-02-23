"use client";
import { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddUnitForm = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedCabangFiltered, setSelectedCabangFiltered] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cabang, setCabang] = useState([]);
  const [filteredCabang, setFilteredCabang] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [searchCabang, setSearchCabang] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [, setFormData] = useState({ unit: "" });
  const dropdownRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [allUnitKerjaFiltered, setAllUnitKerjaFiltered] = useState([]);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchCabang = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabang(response.data);
      setCabangOptions(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const fetchUnitKerja = async (
    page = currentPage,
    size = entries,
    cabang = selectedCabangFiltered,  // Use the selected filtered cabang
    unitKerja = ""
  ) => {
    try {
      const response = await GlobalApi.getAllUnitKerja(
        page,
        size,
        cabang,
        unitKerja
      );
      setAllUnitKerja(response.content || []);
      setTotalEntries(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  const deleteUnitKerja = async (id) => {
    try {
      const response = await GlobalApi.deleteUnitKerja(id);
      setNotification({
        type: 'success',
        message: `Unit Kerja berhasil dihapus!`
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const fetchUnitKerjaData = async () => {
    try {
      const unitKerjaResponse = await GlobalApi.getUnitKerja();
      setAllUnitKerjaFiltered(unitKerjaResponse.data);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }
    setLoading(false);
    fetchCabang();
    fetchUnitKerjaData();
  
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
    const role = sessionStorage.getItem("role");
    const cabangFromSession = sessionStorage.getItem("cabang") || "";
    if (role === "ADMIN" && cabangFromSession) {
      setSelectedCabangFiltered(cabangFromSession);
      fetchUnitKerja(currentPage, entries, cabangFromSession); // Fetch with cabang filter
    } else {
      fetchUnitKerja(currentPage, entries); // Default fetch without filter
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowDropdownCabang(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router, currentPage, entries, selectedCabangFiltered]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDelete = (id) => {
    deleteUnitKerja(id);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = cabang.filter((item) =>
      item.kecamatan.toLowerCase().includes(value)
    );
    setFilteredCabang(filtered);
  };

  const handleSearchChangeFiltered = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchCabang(value);
    const filtered = cabang.filter((item) =>
      item.kecamatan.toLowerCase().includes(value)
    );
    setFilteredCabangOptions(filtered);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleFormSubmit = async () => {
    try {
      const payload = {
        cabang: selectedCabang,
        unitKerja: unitKerja,
      };
      const response = await GlobalApi.addUnitKerja(payload);
      setSelectedCabang("");
      setUnitKerja("");

      setNotification({
        type: 'success',
        message: `Unit Kerja berhasil ditambahkan!`
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      setNotification({
        type: 'success',
        message: `Gagal menambahkan unit kerja. Coba lagi nanti!`
      });
    }
  };

  const handleCabangChange = (e) => {
    const value = e.target.value;
    setSelectedCabang(value);
    setShowDropdown(true);
  };

  const handleCabangSelect = (kecamatan) => {
    setSelectedCabang(kecamatan);
    setShowDropdown(false);
  };

  const handleCabangSelectFiltered = (cabang) => {
    setSelectedCabangFiltered(cabang.kecamatan);
    setShowDropdownCabang(false);

    fetchUnitKerja(currentPage, entries, cabang.kecamatan);
  };

  const handleUnitKerjaSelect = (selectedItem) => {
    setSelectedUnitKerja(selectedItem.unitKerja || "");
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja("");

    fetchUnitKerja(0, entries, selectedCabangFiltered, selectedItem.unitKerja);
  };

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchUnitKerja(value);

    const filteredOptions = allUnitKerjaFiltered.filter(
      (uk) =>
        uk.unitKerja.toLowerCase().includes(value) &&
        uk.cabang.toLowerCase() === selectedCabangFiltered.toLowerCase()
    );

    setFilteredUnitKerjaOptions(filteredOptions);
  };

  const handleFocus = () => {
    setFilteredCabang(cabang);
    setShowDropdown(true);
  };

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Ensure that the filter persists across page changes
      fetchUnitKerja(newPage, entries, selectedCabangFiltered); // Pass filtered cabang
    }
  };

  const startIndex = currentPage * entries;

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 mt-4 sm:mt-0 ml-4 sm:ml-0">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <nav className="mt-6">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                <li>
                  <Link
                    href="/pengaturan/user"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    User
                  </Link>
                </li>

                {sessionStorage.getItem("role") === "SUPERADMIN" && (
                  <li>
                    <Link
                      href="/pengaturan/tambah"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Tambah Cabang
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/pengaturan/unit-kerja"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Unit Kerja
                  </Link>
                </li>
                {sessionStorage.getItem("role") === "SUPERADMIN" && (
                  <li>
                    <Link
                      href="/pengaturan/backup-data"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Backup Data
                    </Link>
                  </li>
                )}
                {sessionStorage.getItem("role") === "SUPERADMIN" && (
                  <li>
                    <Link
                      href="/pengaturan/create-editor"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Tambah Editor
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <h2 className="text-base font-bold mb-4 text-center text-teal-600">
                TAMBAH UNIT KERJA
              </h2>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="branch"
                >
                  Cabang
                </label>
                <Input
                  readOnly
                  type="text"
                  value={selectedCabang}
                  onChange={handleCabangChange}
                  placeholder="Tentukan Cabang"
                  onFocus={handleFocus}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
                {showDropdown && (
                  <div className=" w-auto" ref={dropdownRef}>
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Cari cabang..."
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                    />
                    <div className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 max-h-48 overflow-y-auto">
                      {filteredCabang.length > 0 ? (
                        filteredCabang.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleCabangSelect(item.kecamatan)}
                            className="cursor-pointer hover:bg-gray-200 p-1"
                          >
                            {item.kecamatan}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">
                          Cabang tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="unit"
                >
                  Isi Unit Kerja Tambahan
                </label>
                <input
                  id="unit"
                  type="text"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  placeholder="Tambah Unit kerja"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleFormSubmit}
                >
                  TAMBAH UNIT KERJA
                </button>
              </div>
            </div>
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-2">
                <h3 className="text-base md:text-base font-bold mb-2">
                  Data Unit Kerja
                </h3>
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
                  <div className="flex items-center  space-x-2">
                    <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto">
                      <div
                        ref={dropdownRef}
                        className="relative flex flex-col w-full md:w-48"
                      >
                        <Input
                          type="text"
                          placeholder="Pilih Cabang"
                          value={selectedCabangFiltered}
                          readOnly
                          disabled={role === "ADMIN"}
                          onFocus={() => {
                            if (role === "SUPERADMIN") {
                              setShowDropdownCabang(true);
                              setFilteredCabangOptions(cabangOptions);
                            }
                          }}
                          className="border rounded-lg p-2 w-full bg-white shadow-sm"
                        />
                        {showDropdownCabang && role === "SUPERADMIN" && (
                          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  value={searchCabang}
                                  onChange={handleSearchChangeFiltered}
                                  className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Cari Cabang..."
                                  autoFocus
                                />
                              </li>
                              <li
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  handleCabangSelectFiltered({ kecamatan: "" });
                                }}
                              >
                                Pilih Cabang
                              </li>
                              {filteredCabangOptions.length > 0 ? (
                                filteredCabangOptions.map((cabang) => (
                                  <li
                                    key={cabang.idKecamatan}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() =>
                                      handleCabangSelectFiltered(cabang)
                                    }
                                  >
                                    {cabang.kecamatan}
                                  </li>
                                ))
                              ) : (
                                <li className="px-4 py-2 text-gray-500 cursor-default">
                                  Tidak ada hasil
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div
                        ref={unitKerjaRef}
                        className="relative w-full md:w-48 mt-4 sm:mt-0"
                      >
                        <Input
                          type="text"
                          placeholder="Pilih Unit Kerja"
                          value={selectedUnitKerja}
                          readOnly
                          onFocus={() => {
                            setShowDropdownUnitKerja(true);
                            setFilteredUnitKerjaOptions(
                              selectedCabangFiltered === "Pilih Cabang"
                                ? allUnitKerjaFiltered
                                : allUnitKerjaFiltered.filter(
                                  (uk) => uk.cabang === selectedCabangFiltered
                                )
                            );
                          }}
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          disabled={selectedCabangFiltered === "Pilih Cabang"}
                        />

                        {showDropdownUnitKerja && (
                          <div className="absolute z-10 border rounded bg-white shadow-sm mt-1 w-full">
                            <div className="p-1">
                              <Input
                                type="text"
                                value={searchUnitKerja}
                                onChange={handleUnitKerjaChange}
                                placeholder="Cari Unit Kerja..."
                                className="w-full border rounded py-2 px-3 mb-2"
                              />
                            </div>
                            <ul className="max-h-44 overflow-y-auto -mt-3">
                              <li
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleUnitKerjaSelect({})}
                              >
                                Semua Unit Kerja
                              </li>
                              {filteredUnitKerjaOptions.map((item) => (
                                <li
                                  key={item.id}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleUnitKerjaSelect(item)}
                                >
                                  {item.unitKerja}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center  space-x-2">
                    <Label htmlFor="entries" className="mr-2">
                      Show
                    </Label>
                    <select
                      id="entries"
                      className="border rounded p-1"
                      onChange={handleEntriesChange}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="ml-2">entries</span>
                  </div>
                </div>
              </div>
              <DataTable
                data={allUnitKerja}
                startIndex={startIndex}
                handleDelete={handleDelete}
              />

              <div className="flex flex-col md:flex-row justify-between text-sm mt-4 items-center space-y-2 md:space-y-0 md:space-x-2">
                <span className="text-center md:text-left">
                  Showing {currentPage * entries + 1} to{" "}
                  {Math.min((currentPage + 1) * entries, totalEntries)} of{" "}
                  {totalEntries} entries
                </span>

                <div className="flex flex-wrap justify-center md:justify-end space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`px-3 py-1 border text-sm rounded ${currentPage === 0 ? "bg-gray-300" : "bg-white"
                      }`}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    if (
                      index < 3 ||
                      index > totalPages - 4 ||
                      (index >= currentPage - 1 && index <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`px-3 py-1 border text-sm rounded ${currentPage === index
                              ? "bg-blue-500 text-white"
                              : "bg-white"
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    }
                    if (index === 3 || index === totalPages - 4) {
                      return (
                        <span
                          key={index}
                          className="px-3 py-1 border text-sm rounded text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages - 1
                        ? "bg-gray-300"
                        : "bg-white"
                      }`}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ data, startIndex, handleDelete }) => {
  return (
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md mt-6">
      <thead className="bg-teal-700 text-white text-center">
        <tr>
          <th className="p-2 md:p-3 border">No.</th>
          <th className="p-2 md:p-3 border">Cabang</th>
          <th className="p-2 md:p-3 border">Unit Kerja</th>
          <th className="p-2 md:p-3 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={item.id}
            className="hover:bg-gray-50 text-sm cursor-pointer text-center"
          >
            <td className="p-2 md:p-3 border">{startIndex + index + 1}</td>
            <td className="p-2 md:p-3 border">{item.cabang}</td>
            <td className="p-2 md:p-3 border">{item.unitKerja}</td>
            <td className="p-2 md:p-3 border text-center">
              <FontAwesomeIcon
                icon={faTrash}
                size="lg"
                className="text-red-500 mr-4 cursor-pointer"
                onClick={() => handleDelete(item.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AddUnitForm;
