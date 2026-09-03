"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faMinusCircle,
  faPlusCircle,
  faTrash,
  faEdit,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

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

const Page = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [npa, setNpa] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [adminDataAll, setAdminDataAll] = useState([]);
  const [role, setRole] = useState(adminData?.status || "ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState("SUPERADMIN"); // "SUPERADMIN" | "ADMIN" | "EDITOR"
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cabang, setCabang] = useState([]);
  const [editableCabang, setEditableCabang] = useState("");
  const [editablePassword, setEditablePassword] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);
  const [notification, setNotification] = useState(null);

  // Edit Admin Modal States
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [showEditModalPassword, setShowEditModalPassword] = useState(false);
  const [editAdminData, setEditAdminData] = useState({
    id: "",
    nama: "",
    npaPgri: "",
    cabang: "",
    jabatan: "",
    nohp: "",
    email: "",
    password: "",
    role: "ADMIN",
    daerah: "",
  });
  const [editPasswordError, setEditPasswordError] = useState("");
  const [selectedEditCabang, setSelectedEditCabang] = useState("");
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [editQuery, setEditQuery] = useState("");
  const editDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target)) {
        setShowEditDropdown(false);
      }
    };

    if (showDropdown || showEditDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showEditDropdown]);

  const fetchAdminData = async (
    page = currentPage,
    size = entries,
    nama = "",
    email = "",
    roleTab = activeRoleTab,
  ) => {
    try {
      if (roleTab === "EDITOR") {
        const response = await GlobalApi.getAllEditor(page, size);
        const list = (response?.content || response?.data?.content || []).map((u) => ({
          ...u,
          role: "EDITOR",
        }));
        setAdminDataAll(list);
        setTotalEntries(response?.totalElements || response?.data?.totalElements || list.length);
        setTotalPages(response?.totalPages || response?.data?.totalPages || 1);
      } else if (roleTab === "SUPERADMIN") {
        const response = await GlobalApi.getAllAdmin(0, 100, nama, email);
        const list = (response?.data?.content || []).filter(
          (u) => (u.role || "").toUpperCase() === "SUPERADMIN"
        );
        setAdminDataAll(list);
        setTotalEntries(list.length);
        setTotalPages(1);
      } else {
        // ADMIN (Admin Cabang)
        const response = await GlobalApi.getAllAdmin(page, size, nama, email);
        const list = (response?.data?.content || []).filter(
          (u) => (u.role || "").toUpperCase() !== "SUPERADMIN"
        );
        setAdminDataAll(list);
        setTotalEntries(response?.data?.totalElements || list.length);
        setTotalPages(response?.data?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await GlobalApi.getCabang();

        if (Array.isArray(response.data)) {
          setCabang(response.data);
        } else {
          console.error("Data fetched is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching cabang:", error);
      }
    };
    fetchCabang();
  }, []);

  const filteredOptions = query
    ? cabang.filter((item) =>
        item.kecamatan.toLowerCase().includes(query.toLowerCase()),
      )
    : cabang;

  const handleCabangChange = (item) => {
    setSelectedCabang(item.kecamatan);
    setEditableCabang(item.kecamatan);
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
      fetchAdminData(currentPage, entries);

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

  const deleteAdmin = async (idAdmin) => {
    try {
      if (activeRoleTab === "EDITOR") {
        await GlobalApi.deleteEditor(idAdmin);
      } else {
        await GlobalApi.deleteAdmin(idAdmin);
      }
      setNotification({
        type: "success",
        message: `${activeRoleTab === "EDITOR" ? "Editor" : "Admin"} berhasil dihapus!`,
      });
      fetchAdminData(currentPage, entries, searchQuery, "", activeRoleTab);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchAdminData(newPage, entries, searchQuery, "", activeRoleTab);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    fetchAdminData(0, entries, query, "", activeRoleTab);
  };

  const handleAddUserClick = () => {
    setIsPopupVisible(true);
    setAdminEmailInput("");
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setNpa("");
    setAdminEmailInput("");
    setAdminData(null);
  };

  const handleNpaChange = (e) => {
    setNpa(e.target.value);
  };

  const handleCekNpa = async () => {
    try {
      const data = await getAnggotaByNPA(npa);
      console.log(data);
      if (data) {
        setAdminData(data);
        setEditableCabang(data.cabang);
        setSelectedCabang(data.cabang);
        setAdminEmailInput(""); // Kosongkan agar diinput manual oleh superadmin
        setEditablePassword("");
        setPasswordError("");
      } else {
        setAdminData(null);
        setEditableCabang("");
        setSelectedCabang("");
        setAdminEmailInput("");
        setEditablePassword("");
        setPasswordError("");
      }
    } catch (error) {
      console.error("Error fetching npa:", error);
      setAdminData(null);
      setEditableCabang("");
      setSelectedCabang("");
      setAdminEmailInput("");
      setEditablePassword("");
      setPasswordError("");
    }
  };

  const filteredData = adminDataAll?.filter((item) => {
    return (
      item.cabang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const startIndex = currentPage * entries;
  const selectedData = filteredData?.slice(startIndex, startIndex + entries);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!adminEmailInput.trim()) {
      toast.error("Email login pengurus harus diisi");
      return;
    }

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
      email: adminEmailInput.trim(),
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

  const handleEditAdminClick = (item) => {
    setEditAdminData({
      id: item.id,
      nama: item.nama || "",
      npaPgri: item.npaPgri || item.npapgri || "",
      cabang: item.cabang || "",
      jabatan: item.jabatan || "",
      nohp: item.noHp || "",
      email: item.email || "",
      password: item.passwordNew || item.password || "",
      role: (item.role || "ADMIN").toUpperCase(),
      daerah: item.daerah || "",
    });
    setSelectedEditCabang(item.cabang || "");
    setEditPasswordError("");
    setIsEditPopupVisible(true);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupVisible(false);
    setEditPasswordError("");
  };

  const handleSaveEditAdmin = async (e) => {
    e.preventDefault();

    if (!editAdminData.email.trim()) {
      toast.error("Email login pengurus harus diisi");
      return;
    }

    if (!editAdminData.password.trim()) {
      setEditPasswordError("Password harus diisi");
      return;
    }

    const formData = new FormData();
    formData.append("daerah", editAdminData.daerah || "");
    formData.append("cabang", selectedEditCabang || editAdminData.cabang);
    formData.append("nama", editAdminData.nama);
    formData.append("npapgri", editAdminData.npaPgri);
    formData.append("jabatan", editAdminData.jabatan || "");
    formData.append("nohp", editAdminData.nohp || "");
    formData.append("email", editAdminData.email.trim());
    formData.append("password", editAdminData.password.trim());
    formData.append("passwordNew", editAdminData.password.trim());
    formData.append("role", editAdminData.role || "ADMIN");

    try {
      await GlobalApi.updateAdminById(editAdminData.id, formData);
      setNotification({
        type: "success",
        message: "Data Admin berhasil diperbarui!",
      });
      setIsEditPopupVisible(false);
      fetchAdminData(currentPage, entries, searchQuery);
    } catch (error) {
      console.error("Error updating admin:", error);
      setNotification({
        type: "error",
        message: "Gagal memperbarui data Admin!",
      });
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleDeleteAdminClick = (idAdmin) => {
    deleteAdmin(idAdmin);
  };

  const toggleDetails = (id) => {
    setExpandedRow((prevExpandedRow) => (prevExpandedRow === id ? null : id));
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
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-4 border-b border-gray-200">
                <div className="flex gap-2 mb-2">
                  <button
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                      activeRoleTab === "SUPERADMIN"
                        ? "border-teal-600 text-teal-700 bg-teal-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveRoleTab("SUPERADMIN");
                      setCurrentPage(0);
                      fetchAdminData(0, entries, searchQuery, "", "SUPERADMIN");
                    }}
                  >
                    Super Admin
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                      activeRoleTab === "ADMIN"
                        ? "border-teal-600 text-teal-700 bg-teal-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveRoleTab("ADMIN");
                      setCurrentPage(0);
                      fetchAdminData(0, entries, searchQuery, "", "ADMIN");
                    }}
                  >
                    Admin Cabang
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                      activeRoleTab === "EDITOR"
                        ? "border-teal-600 text-teal-700 bg-teal-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveRoleTab("EDITOR");
                      setCurrentPage(0);
                      fetchAdminData(0, entries, searchQuery, "", "EDITOR");
                    }}
                  >
                    Editor
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="text-base md:text-base font-bold mb-2">
                  {activeRoleTab === "SUPERADMIN"
                    ? "Data Super Admin"
                    : activeRoleTab === "EDITOR"
                    ? "Data Editor"
                    : "Data Pengurus Cabang (Admin)"}
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
                  {sessionStorage.getItem("role") === "SUPERADMIN" && (
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2 rounded"
                      onClick={handleAddUserClick}
                    >
                      {activeRoleTab === "SUPERADMIN"
                        ? "Tambah Super Admin"
                        : activeRoleTab === "EDITOR"
                        ? "Tambah Editor"
                        : "Tambah Admin"}
                    </Button>
                  )}
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
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Cabang
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Nama
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        NPA PGri
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        No HP
                      </th>
                      <th className="p-2 md:p-3 border ">Email</th>
                      {sessionStorage.getItem("role") === "SUPERADMIN" && (
                        <th className="p-2 md:p-3 border hidden md:table-cell">
                          Password
                        </th>
                      )}
                      <th className="p-2 border text-center">Action</th>
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
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.cabang}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.nama}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell text-center">
                                {item.npaPgri}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell text-center">
                                {item.noHp}
                              </td>
                              <td className="p-2 md:p-3 border text-center">
                                {item.email}
                              </td>
                              {sessionStorage.getItem("role") ===
                                "SUPERADMIN" && (
                                <td className="p-2 md:p-3 border hidden md:table-cell text-center">
                                  <span
                                    className="text-gray-800 font-medium cursor-pointer hover:text-blue-500 transition duration-300"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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
                                        <>
                                          <Button
                                            className="bg-blue-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-150"
                                            onClick={() =>
                                              handleEditAdminClick(item)
                                            }
                                            title="Edit Admin"
                                          >
                                            <FontAwesomeIcon icon={faEdit} />
                                          </Button>
                                          <Button
                                            className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                            onClick={() =>
                                              handleDeleteAdminClick(item.id)
                                            }
                                            title="Hapus Admin"
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </Button>
                                        </>
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
                            {expandedRow === item.id && (
                              <tr className="bg-gray-200">
                                <td colSpan="7" className="p-4">
                                  <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/2 p-4 border rounded-lg shadow-sm bg-white">
                                      <p>
                                        <strong>Cabang:</strong> {item.cabang}
                                      </p>
                                      <p>
                                        <strong>Nama:</strong> {item.nama}
                                      </p>
                                      <p>
                                        <strong>Npa Pgri:</strong>{" "}
                                        {item.npaPgri}
                                      </p>
                                      <p>
                                        <strong>Nomor HP:</strong> {item.noHp}
                                      </p>
                                      {sessionStorage.getItem("role") ===
                                        "SUPERADMIN" && (
                                        <p>
                                          <strong>Password:</strong>{" "}
                                          <span
                                            className="cursor-pointer text-blue-500 hover:text-blue-700 transition duration-300"
                                            onClick={() =>
                                              setShowPassword(!showPassword)
                                            }
                                          >
                                            {showPassword
                                              ? item.passwordNew || "-"
                                              : "*****"}
                                          </span>
                                        </p>
                                      )}

                                      <div className="flex flex-col space-y-2 mt-4">
                                        <strong className="text-lg font-semibold">
                                          Action:
                                        </strong>
                                        <div className="flex space-x-2">
                                          {sessionStorage.getItem("role") ===
                                            "SUPERADMIN" && (
                                            <button
                                              className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-150"
                                              onClick={() =>
                                                handleEditAdminClick(item)
                                              }
                                              title="Edit Admin"
                                            >
                                              <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                          )}
                                          <button
                                            className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                            onClick={() =>
                                              handleDeleteAdminClick(item.id)
                                            }
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </button>
                                          <Link
                                            href={`https://wa.me/${phoneNumberForLink(
                                              item.noHp,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition ease-in-out duration-150"
                                          >
                                            <FontAwesomeIcon
                                              icon={faWhatsapp}
                                            />
                                          </Link>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
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
            </main>
            {/* POPUP: TAMBAH USER BARU */}
            {isPopupVisible && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center mt-20 z-50">
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
                            Email Asli:
                          </Label>
                          <Input
                            type="text"
                            id="email"
                            value={adminData.email || "-"}
                            readOnly
                            className="border rounded w-full p-2 text-black bg-gray-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                          <Label
                            htmlFor="adminEmailInput"
                            className="block font-semibold md:w-1/3"
                          >
                            Email Login:
                          </Label>
                          <div className="w-full">
                            <Input
                              type="email"
                              id="adminEmailInput"
                              value={adminEmailInput}
                              onChange={(e) =>
                                setAdminEmailInput(e.target.value)
                              }
                              className="border rounded w-full p-2 text-black bg-white"
                              placeholder="Masukkan email untuk login admin"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              * Email ini yang akan digunakan pengurus untuk login
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                          <Label
                            htmlFor="cabang"
                            className="block font-semibold md:w-1/3"
                          >
                            Cabang:
                          </Label>
                          <div className="w-full">
                            <div className="relative" ref={dropdownRef}>
                              <Input
                                type="text"
                                className="border-teal-500 rounded-lg p-2 bg-white shadow-sm w-full"
                                placeholder="Pilih Cabang"
                                value={selectedCabang}
                                readOnly
                                onFocus={() => {
                                  setQuery("");
                                  setShowDropdown(true);
                                }}
                              />
                              {showDropdown && (
                                <div className="absolute z-10 w-full mt-1">
                                  <Input
                                    type="text"
                                    className="border rounded-lg p-2 w-full"
                                    placeholder="Cari Cabang..."
                                    value={query}
                                    onChange={(e) =>
                                      setQuery(e.target.value)
                                    }
                                    autoFocus
                                  />
                                  <ul className="mt-1 max-h-48 overflow-y-auto bg-white border rounded-lg shadow-sm">
                                    {[...filteredOptions]
                                      .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, "id"))
                                      .map((item) => (
                                      <li
                                        key={item.idKecamatan}
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                          handleCabangChange(item);
                                          setShowDropdown(false);
                                        }}
                                      >
                                        {item.kecamatan}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                          <Label
                            htmlFor="password"
                            className="block font-semibold md:w-1/3"
                          >
                            Password:
                          </Label>
                          <div className="w-full relative">
                            <Input
                              type={showAddPassword ? "text" : "password"}
                              id="password"
                              value={editablePassword}
                              onChange={(e) => {
                                setEditablePassword(e.target.value);
                                setPasswordError("");
                              }}
                              className={`border rounded w-full p-2 pr-10 text-black bg-white ${
                                passwordError ? "border-red-500" : ""
                              }`}
                              placeholder="Masukkan password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowAddPassword(!showAddPassword)}
                              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <FontAwesomeIcon
                                icon={showAddPassword ? faEyeSlash : faEye}
                              />
                            </button>
                            {passwordError && (
                              <span className="text-red-500 text-sm mt-1 block">
                                {passwordError}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
                          <Label
                            htmlFor="role"
                            className="block font-semibold md:w-1/3"
                          >
                            Role:
                          </Label>
                          <select
                            id="role"
                            className="border rounded w-full p-2 text-black bg-white"
                            value={role}
                            onChange={handleRoleChange}
                          >
                            <option value="SUPERADMIN">
                              SUPER ADMIN
                            </option>
                            <option value="ADMIN">ADMIN</option>
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

            {/* POPUP: EDIT ADMIN */}
            {isEditPopupVisible && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center mt-20 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-3/6 max-h-[85vh] overflow-auto relative">
                  <Button
                    className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                    onClick={handleCloseEditPopup}
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </Button>

                  <h2 className="text-lg font-bold mb-4 text-center">
                    Edit Data Admin / Pengurus
                  </h2>

                  <form onSubmit={handleSaveEditAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block font-semibold mb-1">
                          Nama Lengkap:
                        </Label>
                        <Input
                          type="text"
                          value={editAdminData.nama}
                          onChange={(e) =>
                            setEditAdminData({
                              ...editAdminData,
                              nama: e.target.value,
                            })
                          }
                          className="border rounded w-full p-2 text-black bg-white"
                          required
                        />
                      </div>

                      <div>
                        <Label className="block font-semibold mb-1">
                          NPA PGRI:
                        </Label>
                        <Input
                          type="text"
                          value={editAdminData.npaPgri}
                          readOnly
                          className="border rounded w-full p-2 text-black bg-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block font-semibold mb-1">
                          Email Login Pengurus:
                        </Label>
                        <Input
                          type="email"
                          value={editAdminData.email}
                          onChange={(e) =>
                            setEditAdminData({
                              ...editAdminData,
                              email: e.target.value,
                            })
                          }
                          className="border rounded w-full p-2 text-black bg-white"
                          placeholder="Email untuk login"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          * Email ini yang digunakan untuk login
                        </p>
                      </div>

                      <div>
                        <Label className="block font-semibold mb-1">
                          Cabang:
                        </Label>
                        <div className="relative" ref={editDropdownRef}>
                          <Input
                            type="text"
                            className="border-teal-500 rounded-lg p-2 bg-white shadow-sm w-full"
                            placeholder="Pilih Cabang"
                            value={selectedEditCabang}
                            readOnly
                            onFocus={() => {
                              setEditQuery("");
                              setShowEditDropdown(true);
                            }}
                          />
                          {showEditDropdown && (
                            <div className="absolute z-20 w-full mt-1">
                              <Input
                                type="text"
                                className="border rounded-lg p-2 w-full"
                                placeholder="Cari Cabang..."
                                value={editQuery}
                                onChange={(e) =>
                                  setEditQuery(e.target.value)
                                }
                                autoFocus
                              />
                              <ul className="mt-1 max-h-48 overflow-y-auto bg-white border rounded-lg shadow-lg">
                                {[...cabang]
                                  .filter((c) =>
                                    c.kecamatan
                                      .toLowerCase()
                                      .includes(editQuery.toLowerCase()),
                                  )
                                  .sort((a, b) =>
                                    a.kecamatan.localeCompare(
                                      b.kecamatan,
                                      "id",
                                    ),
                                  )
                                  .map((item) => (
                                    <li
                                      key={item.idKecamatan || item.id}
                                      className="p-2 cursor-pointer hover:bg-gray-100"
                                      onClick={() => {
                                        setSelectedEditCabang(
                                          item.kecamatan,
                                        );
                                        setShowEditDropdown(false);
                                      }}
                                    >
                                      {item.kecamatan}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block font-semibold mb-1">
                          No. HP / WhatsApp:
                        </Label>
                        <Input
                          type="text"
                          value={editAdminData.nohp}
                          onChange={(e) =>
                            setEditAdminData({
                              ...editAdminData,
                              nohp: e.target.value,
                            })
                          }
                          className="border rounded w-full p-2 text-black bg-white"
                        />
                      </div>

                      <div>
                        <Label className="block font-semibold mb-1">
                          Role:
                        </Label>
                        <select
                          className="border rounded w-full p-2 text-black bg-white"
                          value={editAdminData.role}
                          onChange={(e) =>
                            setEditAdminData({
                              ...editAdminData,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="SUPERADMIN">SUPER ADMIN</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="EDITOR">EDITOR</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="block font-semibold mb-1">
                          Password Akun:
                        </Label>
                        <div className="relative">
                          <Input
                            type={showEditModalPassword ? "text" : "password"}
                            value={editAdminData.password}
                            onChange={(e) => {
                              setEditAdminData({
                                ...editAdminData,
                                password: e.target.value,
                              });
                              setEditPasswordError("");
                            }}
                            className={`border rounded w-full p-2 pr-10 text-black bg-white ${
                              editPasswordError ? "border-red-500" : ""
                            }`}
                            placeholder="Masukkan password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowEditModalPassword(!showEditModalPassword)
                            }
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={
                                showEditModalPassword ? faEyeSlash : faEye
                              }
                            />
                          </button>
                        </div>
                        {editPasswordError && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {editPasswordError}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseEditPopup}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
