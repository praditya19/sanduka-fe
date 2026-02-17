"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
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

const Page = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminDataAll, setHistoryBackupDataAll] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchHistoryBackupData = async (
    page = currentPage,
    size = entries,
    searchFileName = ""
  ) => {
    try {
      const response = await GlobalApi.getBackupHistoryFile(
        page,
        size,
        searchFileName
      );
      setHistoryBackupDataAll(response.content || []);
      setTotalEntries(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
      fetchHistoryBackupData(currentPage, entries);

      const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
      setIsSidebarOpen(sidebarState);

      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [token, router, currentPage, entries]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchHistoryBackupData(newPage, entries);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    fetchHistoryBackupData(0, entries, query);
  };

  const filteredData = adminDataAll?.filter((item) => {
    return item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const startIndex = currentPage * entries;
  const selectedData = filteredData?.slice(startIndex, startIndex + entries);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleBackupClick = async () => {
    setIsLoading(true);
    try {
      await GlobalApi.getBackupDatabaseFile();
    } catch (error) {
      console.error("Backup failed:", error);
    } finally {
      setIsLoading(false);
      fetchHistoryBackupData(currentPage, entries);
    }
  };

  const handleUploudClick = () => {
    setShowPopup(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setNotification({
        type: 'error',
        message: `Pilih file terlebih dahulu`
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await GlobalApi.uploadFileRegister(formData);
      setNotification({
        type: 'success',
        message: `File Berhasil Dikirim!`
      });
    } catch (error) {
      setNotification({
        type: 'success',
        message: `File Gagal Dikirim!`
      });
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
    } finally {
      setShowPopup(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
            <nav className="ml-6 mt-12">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                <li>
                  <Link
                    href="/pengaturan/user"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    User
                  </Link>
                </li>

                {sessionStorage.getItem("role") === "SUPER ADMIN" && (
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
                {sessionStorage.getItem("role") === "SUPER ADMIN" && (
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
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-2">
                <h3 className="text-base md:text-base font-bold mb-2">
                  History Backup Data
                </h3>
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
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
                  <div className="flex gap-2">
                    <Button
                      className={`bg-blue-500 text-white text-xs px-4 py-2 rounded flex items-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      onClick={handleBackupClick}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4"></div>
                          Memproses...
                        </>
                      ) : (
                        "Backup Data"
                      )}
                    </Button>

                    <Button
                      className="bg-green-500 text-white text-xs px-4 py-2 rounded flex items-center gap-2"
                      onClick={handleUploudClick}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="p-2 pl-10 border rounded max-w-sm w-full"
                    onChange={handleSearchChange}
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 md:p-3 border text-left">No</th>
                      <th className="p-2 md:p-3 border md:table-cell">
                        Nama File
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => {
                        return (
                          <React.Fragment key={item.id}>
                            <tr className="bg-gray-100">
                              <td className="p-2 md:p-3 border text-center">
                                {index + 1 + currentPage * entries}
                              </td>
                              <td className="p-2 md:p-3 border md:table-cell">
                                {item.fileName}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center">
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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

              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-5 rounded-lg shadow-lg w-96">
                    <h2 className="text-lg font-semibold mb-3">
                      Unggah File Backup
                    </h2>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => setShowPopup(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={handleUpload}
                      >
                        {isLoading ? "Mengunggah..." : "Unggah"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
