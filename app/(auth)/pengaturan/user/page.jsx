"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("08")) {
    return `+62${phoneNumber.substring(1)}`;
  }
  return phoneNumber;
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
      toast.success("Admin berhasil diHapus!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
      daerah: "KAB. JEPARA",
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

    try {
      const result = await GlobalApi.createAdmin(updatedAdminData);
      toast.success("Admin berhasil ditambahkan!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
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
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-teal-700 text-white">
                    <th className="p-2 md:p-3 border">No.</th>
                    <th className="p-2 md:p-3 border">Email</th>
                    <th className="p-2 md:p-3 border">Cabang</th>
                    <th className="p-2 md:p-3 border">Nama</th>
                    <th className="p-2 md:p-3 border">Npa Pgri</th>
                    <th className="p-2 md:p-3 border">Nomor HP</th>
                    <th className="p-2 md:p-3 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const formattedPhoneNumber = formatPhoneNumber(
                        item?.noHp || ""
                      );

                      return (
                        <tr key={item.id} className="bg-gray-100">
                          <td className="p-2 md:p-3 border text-center">
                            {index + 1 + currentPage * entries}
                          </td>
                          <td className="p-2 md:p-3 border text-center">
                            {item.email}
                          </td>
                          <td className="p-2 md:p-3 border">{item.cabang}</td>
                          <td className="p-2 md:p-3 border">{item.nama}</td>
                          <td className="p-2 md:p-3 border">{item.npaPgri}</td>
                          <td className="p-2 md:p-3 border text-center">
                            {item.noHp}
                          </td>
                          <td className="p-2 border">
                            <div className="flex space-x-2 justify-center">
                              <Button
                                className="bg-red-500 text-white px-2 py-2 rounded"
                                onClick={() => handleDeleteAdminClick(item.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                              <Link
                                href={`https://wa.me/${formattedPhoneNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white px-2 py-2 rounded"
                              >
                                <FontAwesomeIcon icon={faWhatsapp} />
                              </Link>
                            </div>
                          </td>
                        </tr>
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

              <div className="flex justify-between text-sm mt-4 items-center space-y-2">
                <span className="text-center md:text-left">
                  Showing {currentPage * entries + 1} to{" "}
                  {Math.min((currentPage + 1) * entries, totalEntries)} of{" "}
                  {totalEntries} entries
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`px-3 py-1 border text-sm rounded ${
                      currentPage === 0 ? "bg-gray-300" : "bg-white"
                    }`}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
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
                  ))}
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
                                  value={adminData.status}
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
