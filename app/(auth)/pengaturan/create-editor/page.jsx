"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  faMagnifyingGlass,
  faMinusCircle,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const phoneNumberForLink = (phoneNumber) => {
  const formatted = phoneNumber.startsWith("08")
    ? `+62${phoneNumber.substring(1)}`
    : phoneNumber;
  return encodeURIComponent(formatted);
};
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

const CreateEditor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [editorData, setEditorData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [entries, setEntries] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [npa, setNpa] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [editableCabang, setEditableCabang] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [editablePassword, setEditablePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState(adminData?.status || "ADMIN");
  const [showPassword, setShowPassword] = useState(false);

  const fetchEditor = async (page = 0, size = entries) => {
    try {
      setLoadingTable(true);
      const res = await GlobalApi.getAllEditor(page, size);

      setEditorData(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalEntries(res.totalElements || 0);
    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        message: "Gagal mengambil data editor",
      });
    } finally {
      setLoadingTable(false);
    }
  };
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };
  const handleAddUserClick = () => {
    setIsPopupVisible(true);
  };
  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setNpa("");
    setAdminData(null);
  };
  const handleNpaChange = (e) => {
    setNpa(e.target.value);
  };
  const cekNpa = async (npa) => {
    try {
      const data = await GlobalApi.cekNpa(npa);
      setAdminData(data);
    } catch (error) {
      console.error("Error fetching npa:", error);
      setAdminData(null);
    }
  };
  const getAnggotaByNPA = async (npa) => {
    try {
      const data = await GlobalApi.cekNpa(npa);
      setAdminData(data);
      return data;
    } catch (error) {
      console.error("Error fetching npa:", error);
      setAdminData();
      return null;
    }
  };
  const handleCekNpa = async () => {
    try {
      const data = await getAnggotaByNPA(npa);
      console.log(data);
      if (data) {
        setAdminData(data);
        setEditableCabang(data.cabang);
        setSelectedCabang(data.cabang);
        setEditablePassword("");
        setPasswordError("");
      } else {
        setAdminData(null);
        setEditableCabang("");
        setSelectedCabang("");
        setEditablePassword("");
        setPasswordError("");
      }
    } catch (error) {
      console.error("Error fetching npa:", error);
      setAdminData(null);
      setEditableCabang("");
      setSelectedCabang("");
      setEditablePassword("");
      setPasswordError("");
    }
  };
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!editablePassword.trim()) {
      setPasswordError("Password harus diisi");
      return;
    }

    const updatedAdminData = {
      daerah: adminData.unitKerja,
      cabang: editableCabang,
      nama: adminData.namaLengkap,
      npapgri: adminData.npaPgri,
      jabatan: adminData.jabatan,
      nohp: adminData.noHp,
      email: adminData.email,
      password: editablePassword,
      passwordNew: editablePassword,
      role: role,
    };

    try {
      let result;

      if (role === "EDITOR") {
        console.log("Memanggil API: createEditor");
        result = await GlobalApi.createEditor(updatedAdminData);
      } else {
        console.log("Memanggil API: createAdmin");
        result = await GlobalApi.createAdmin(updatedAdminData);
      }

      console.log("Response dari server:", result);

      setNotification({
        type: "success",
        message: `${role} berhasil ditambahkan!`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("ERROR SAAT CREATE:", error);
      console.error("Response error:", error?.response?.data);

      setNotification({
        type: "error",
        message: `Gagal menambahkan ${role}!`,
      });
    }
  };
  const deleteAdmin = async (idAdmin) => {
    try {
      const response = await GlobalApi.deleteEditor(idAdmin);
      setNotification({
        type: "success",
        message: `Editor berhasil dihapus!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };
  const handleDeleteEditorClick = (idAdmin) => {
    deleteAdmin(idAdmin);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);

      fetchEditor(currentPage, entries);

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

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
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
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
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
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Data Editor</h2>
              {sessionStorage.getItem("role") === "SUPERADMIN" && (
                <Button
                  className="bg-blue-500 text-white text-xs px-4 py-2 rounded"
                  onClick={handleAddUserClick}
                >
                  Tambah Admin
                </Button>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border">No</th>
                      <th className="px-3 py-2 border">Nama</th>
                      <th className="px-3 py-2 border">Cabang</th>
                      <th className="px-3 py-2 border">Jabatan</th>
                      <th className="px-3 py-2 border">No HP</th>
                      <th className="px-3 py-2 border">Email</th>
                      {sessionStorage.getItem("role") === "SUPERADMIN" && (
                        <th className="p-2 md:p-3 border hidden md:table-cell">
                          Password
                        </th>
                      )}
                      <th className="p-2 border text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingTable ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : editorData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      editorData.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 border text-center">
                            {currentPage * entries + index + 1}
                          </td>
                          <td className="px-3 py-2 border">{item.nama}</td>
                          <td className="px-3 py-2 border">{item.cabang}</td>
                          <td className="px-3 py-2 border">{item.npaPgri}</td>
                          <td className="px-3 py-2 border">{item.noHp}</td>
                          <td className="px-3 py-2 border">{item.email}</td>
                          {sessionStorage.getItem("role") === "SUPERADMIN" && (
                            <td className="p-2 md:p-3 border hidden md:table-cell text-center">
                              <span
                                className="text-gray-800 font-medium cursor-pointer hover:text-blue-500 transition duration-300"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword
                                  ? item.passwordNew
                                    ? item.passwordNew
                                    : "-"
                                  : "*****"}
                              </span>
                            </td>
                          )}
                          <td className="p-2 border text-center">
                            <div className="flex space-x-2 justify-center">
                              {!isMobile ? (
                                <>
                                  {sessionStorage.getItem("role") ===
                                    "SUPERADMIN" && (
                                    <Button
                                      className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                      onClick={() =>
                                        handleDeleteEditorClick(item.id)
                                      }
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                  <Link
                                    href={`https://wa.me/${phoneNumberForLink(
                                      item.noHp,
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-150"
                                  >
                                    <FontAwesomeIcon icon={faWhatsapp} />
                                  </Link>
                                </>
                              ) : (
                                <Button
                                  className="bg-blue-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-150"
                                  onClick={() => toggleDetails(item.id)}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      expandedRow === item.id
                                        ? faMinusCircle
                                        : faPlusCircle
                                    }
                                  />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col md:flex-row justify-between text-sm mt-4 items-center space-y-2 md:space-y-0 md:space-x-2">
                <span>
                  Showing {currentPage * entries + 1} to{" "}
                  {Math.min((currentPage + 1) * entries, totalEntries)} of{" "}
                  {totalEntries} entries
                </span>

                <div className="flex flex-wrap justify-center md:justify-end space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`px-3 py-1 border text-sm rounded ${
                      currentPage === 0 ? "bg-gray-300" : "bg-white"
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
                          className={`px-3 py-1 border text-sm rounded ${
                            currentPage === index
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
                    className={`px-3 py-1 border text-sm rounded ${
                      currentPage === totalPages - 1
                        ? "bg-gray-300"
                        : "bg-white"
                    }`}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {isPopupVisible && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center mt-20">
                <div className="bg-white p-6 rounded shadow-lg w-full md:w-3/6 max-h-[80vh] overflow-auto relative">
                  <Button
                    className="absolute top-2 right-2 text-gray-600 hover:text-blacktext-gray-800"
                    onClick={handleClosePopup}
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </Button>

                  <h2 className="text-lg font-bold mb-4 text-center">
                    Tambah User Baru
                  </h2>

                  <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-4">
                    <Label className="block flex-1">
                      <span className="text-gray-700">NPA PGRI</span>
                      <Input
                        type="text"
                        value={npa}
                        onChange={handleNpaChange}
                        className="mt-1 block w-full"
                        placeholder="Masukkan NPA PGRI"
                      />
                    </Label>
                    <Button
                      className="bg-blue-500 text-white px-4 py-2 mt-4 md:mt-6 rounded w-full md:w-auto"
                      onClick={cekNpa}
                    >
                      Cek NPA
                    </Button>
                  </div>

                  {isPopupVisible && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center mt-20">
                      <div className="bg-white p-6 rounded shadow-lg w-full md:w-3/6 max-h-[80vh] overflow-auto relative">
                        <Button
                          className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                          onClick={handleClosePopup}
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </Button>

                        <h2 className="text-lg font-bold mb-4 text-center">
                          Tambah User Baru
                        </h2>

                        <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-4">
                          <Label className="block flex-1">
                            <span className="text-gray-700">NPA PGRI</span>
                            <Input
                              type="text"
                              value={npa}
                              onChange={handleNpaChange}
                              className="mt-1 block w-full"
                              placeholder="Masukkan NPA PGRI"
                            />
                          </Label>
                          <Button
                            className="bg-blue-500 text-white px-4 py-2 mt-4 md:mt-6 rounded w-full md:w-auto"
                            onClick={handleCekNpa}
                          >
                            Cek NPA
                          </Button>
                        </div>

                        {adminData && (
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
                              Data Admin
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="nama"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Nama:
                                </Label>
                                <Input
                                  type="text"
                                  id="nama"
                                  value={adminData.namaLengkap}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="npa_pgri"
                                  className="block font-semibold md:w-1/3"
                                >
                                  NPA:
                                </Label>
                                <Input
                                  type="text"
                                  id="npa_pgri"
                                  value={adminData.npaPgri}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="jabatan"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Jabatan:
                                </Label>
                                <Input
                                  type="text"
                                  id="jabatan"
                                  value={adminData.jabatan}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="email"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Email:
                                </Label>
                                <Input
                                  type="text"
                                  id="email"
                                  value={adminData.email}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="cabang"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Cabang:
                                </Label>
                                <Input
                                  type="text"
                                  id="cabang"
                                  value={adminData.cabang}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="password"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Password:
                                </Label>
                                <div className="w-full">
                                  <Input
                                    type="text"
                                    id="password"
                                    value={editablePassword}
                                    onChange={(e) => {
                                      setEditablePassword(e.target.value);
                                      setPasswordError("");
                                    }}
                                    className={`border rounded w-full p-2 text-black bg-white ${
                                      passwordError ? "border-red-500" : ""
                                    }`}
                                    placeholder="Masukkan password"
                                    required
                                  />
                                  {passwordError && (
                                    <span className="text-red-500 text-sm mt-1">
                                      {passwordError}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="password"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Role:
                                </Label>
                                <Input
                                  type="text"
                                  id="role"
                                  value={adminData.role}
                                  readOnly
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                />
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                                <Label
                                  htmlFor="role"
                                  className="block font-semibold md:w-1/3"
                                >
                                  Ubah Role:
                                </Label>
                                <select
                                  id="role"
                                  className="border rounded w-full p-2 text-black bg-gray-200"
                                  value={role}
                                  onChange={handleRoleChange}
                                >
                                  <option value="">-</option>
                                  <option value="EDITOR">EDITOR</option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <Button
                                className="bg-teal-600 text-white px-4 py-2 rounded w-full md:w-auto"
                                onClick={handleAddUser}
                              >
                                Tambah
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditor;
