"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faMinusCircle,
  faPlusCircle,
  faTrash,
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

const phoneNumberForLink = (phoneNumber) => {
  const formatted = phoneNumber.startsWith("08")
    ? `+62${phoneNumber.substring(1)}`
    : phoneNumber;
  return encodeURIComponent(formatted);
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
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async (
    page = currentPage,
    size = entries,
    nama = "",
    email = ""
  ) => {
    try {
      const response = await GlobalApi.getAllAdmin(page, size, nama, email);
      setAdminDataAll(response.data.content || []);
      setTotalEntries(response.data.totalElements);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
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
      const response = await GlobalApi.deleteAdmin(idAdmin);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
               marginTop: "14px"
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Admin Berhasil Dihapus!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchAdminData(newPage, entries);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    fetchAdminData(0, entries, query);
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

  const handleCekNpa = async () => {
    try {
      const data = await getAnggotaByNPA(npa);
      if (data) {
        setAdminData(data);
      } else {
        setAdminData(null);
      }
    } catch (error) {
      console.error("Error fetching npa:", error);
      setAdminData(null);
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

    const updatedAdminData = {
      daerah: "",
      cabang: adminData.cabang,
      nama: adminData.namaLengkap,
      npapgri: adminData.npaPgri,
      jabatan: adminData.jabatan,
      nohp: adminData.noHp,
      email: adminData.email,
      password: adminData.password,
      role: role,
      foto: adminData.foto,
    };

    console.log("Data yang akan terkirim:", updatedAdminData);

    try {
      const result = await GlobalApi.createAdmin(updatedAdminData);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
               marginTop: "14px"
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Admin Berhasil Ditambahkan!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error creating admin:", error);
    }
  };

  const handleBackClick = () => {
    router.back();
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
      <Toaster />
      {isMobile ? (
       <HeaderMobile />
      ) : (
        <HeaderMenu />
      )}
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
                <li>
                  <Link
                    href="/pengaturan/unit-kerja"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Unit Kerja
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pengaturan/tambah"
                    className="text-gray-700 hover:text-teal-600"
                  >
                     Tambah Cabang
                  </Link>
                </li>
              </ul>
            </nav>
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-2">
                <h3 className="text-base md:text-base font-bold mb-2">
                  Data Pengurus Cabang
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
                  <Button
                    className="bg-blue-500 text-white text-xs px-4 py-2 rounded"
                    onClick={handleAddUserClick}
                  >
                    Tambah User
                  </Button>
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
                      <th className="p-2 md:p-3 border text-left">Email</th>
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
                              <td className="p-2 md:p-3 border text-center">
                                {item.email}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.cabang}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.nama}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.npaPgri}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.noHp}
                              </td>
                              <td className="p-2 border text-center">
                                <div className="flex space-x-2 justify-center">
                                  {!isMobile ? (
                                    <>
                                      <Button
                                        className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                        onClick={() =>
                                          handleDeleteAdminClick(item.id)
                                        }
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </Button>
                                      <Link
                                        href={`https://wa.me/${phoneNumberForLink(
                                          item.noHp
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
                                    <div className="md:w-1/2">
                                      <strong>Cabang:</strong> {item.cabang}
                                      <br />
                                      <strong>Nama:</strong> {item.nama}
                                      <br />
                                      <strong>Npa Pgri:</strong> {item.npaPgri}
                                      <br />
                                      {isMobile && (
                                        <>
                                          <strong>Nomor HP:</strong> {item.noHp}
                                          <br />
                                        </>
                                      )}
                                      <div className="flex flex-col space-y-2 mt-2">
                                        <strong className="text-lg font-semibold">
                                          Action:
                                        </strong>
                                        <div className="flex space-x-2">
                                          <Button
                                            className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                            onClick={() =>
                                              handleDeleteAdminClick(item.id)
                                            }
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </Button>
                                          <Link
                                            href={`https://wa.me/${phoneNumberForLink(
                                              item.noHp
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
                                  <option value="SUPER_ADMIN">
                                    SUPER ADMIN
                                  </option>
                                  <option value="ADMIN">ADMIN</option>
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

export default Page;
