"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "@/app/_utils/GlobalApi";
import Link from "next/link";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

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
        return "text-blue-800";
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

const Page = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newCabang, setNewCabang] = useState("");
  const [idKabupaten] = useState(320);
  const [idKecamatan, setIdKecamatan] = useState(null);
  const [data, setData] = useState([]);
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!token) router.push("/sign-in");
    else {
      setLoading(false);
      fetchData();

      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router]);

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      const fetchedData = response.data || [];
      setData(fetchedData);

      const lastKecamatan =
        fetchedData[fetchedData.length - 1]?.idKecamatan || 123218;
      setIdKecamatan(lastKecamatan + 1);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const addCabang = async () => {
    if (!newCabang) {
      setNotification({
        type: "error",
        message: `Cabang tidak boleh kosong!`,
      });
      return;
    }
    try {
      const payload = {
        kecamatan: newCabang,
        idKabupaten: parseInt(idKabupaten, 10),
        idKecamatan: parseInt(idKecamatan, 10),
      };
      const response = await GlobalApi.addCabang(payload);
      setNotification({
        type: "success",
        message: `Cabang Berhasil Ditambahkan!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
      setNewCabang("");
      setIdKecamatan(idKecamatan + 1);
    } catch (error) {
      setNotification({
        type: "error",
        message: `Gagal menambahkan cabang!. Coba lagi nanti.`,
      });
    }
  };

  const deleteCabang = async (idCabang) => {
    try {
      const response = await GlobalApi.deleteCabang(idCabang);
      setNotification({
        type: "success",
        message: `Cabang Berhasil Dihapus!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const startIndex = (currentPage - 1) * entries;
  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const kabupaten = item.kabupaten || "";
        const cabang = item.cabang || "";
        return (
          kabupaten.toLowerCase().includes(searchQuery) ||
          cabang.toLowerCase().includes(searchQuery)
        );
      })
    : [];

  const selectedData = filteredData.slice(startIndex, startIndex + entries);
  const totalPages = Math.ceil(filteredData.length / entries);

  const handleDelete = (id) => {
    deleteCabang(id);
  };

  if (loading) return <div>Loading...</div>;

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
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <main className="min-h-screen bg-gray-50 p-4 md:p-6">
            <nav className=" mt-6">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                {sessionStorage.getItem("role") === "SUPER ADMIN" && (
                  <li>
                    <Link
                      href="/pengaturan/user"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      User
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/pengaturan/tambah"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Tambah Cabang
                  </Link>
                </li>
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
              </ul>
            </nav>
            <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-2">
                <h3 className="text-base font-bold mb-2">Tambah Cabang</h3>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Input
                    placeholder="Tambah Cabang"
                    value={newCabang}
                    onChange={(e) => setNewCabang(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2 mt-5">
                    <Button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={addCabang}
                    >
                      Tambah
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between mb-2 mt-4 items-center">
                  <div className="flex items-center mb-2 md:mb-0">
                    <label htmlFor="entries" className="mr-2">
                      Show
                    </label>
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
                  <div className="relative mb-2 md:mb-0 w-full text-sm md:max-w-sm">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="p-2 pl-10 border rounded w-full"
                      onChange={handleSearchChange}
                    />
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    />
                  </div>
                </div>
              </div>
              <DataTable
                data={selectedData}
                startIndex={startIndex}
                handleDelete={handleDelete}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ data, startIndex, handleDelete }) => (
  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
    <thead className="bg-teal-700 text-white text-center">
      <tr>
        <th className="p-2 md:p-3 border">No.</th>
        <th className="p-2 md:p-3 border">Cabang</th>
        <th className="p-2 md:p-3 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => {
        return (
          <tr
            key={item.id}
            className="hover:bg-gray-50 text-sm cursor-pointer text-center"
          >
            <td className="p-2 md:p-3 border">{startIndex + index + 1}</td>
            <td className="p-2 md:p-3 border">{item.kecamatan}</td>
            <td className="p-2 md:p-3 border text-center">
              <FontAwesomeIcon
                icon={faTrash}
                size="lg"
                className="text-red-500 mr-4 cursor-pointer"
                onClick={() => handleDelete(item.id)}
              />
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const Pagination = ({ currentPage, totalPages, handlePageChange }) => (
  <div className="flex justify-between items-center mt-4">
    <Button
      disabled={currentPage === 1}
      onClick={() => handlePageChange(currentPage - 1)}
    >
      Previous
    </Button>
    <span>
      Page {currentPage} of {totalPages}
    </span>
    <Button
      disabled={currentPage === totalPages}
      onClick={() => handlePageChange(currentPage + 1)}
    >
      Next
    </Button>
  </div>
);

export default Page;
