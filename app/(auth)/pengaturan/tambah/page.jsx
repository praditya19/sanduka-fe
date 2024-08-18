"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

const page = () => {
  const data = [
    {
      id: 1,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 2,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 3,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 4,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 5,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 6,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 7,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 8,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 9,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 11,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 12,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 13,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 14,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 15,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
    {
      id: 16,
      kabupaten: "Jepara",
      cabang: "Welahan",
      unitKerja: "SDN 4 Jepara",
    },
  ];

  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const totalPages = Math.ceil(data.length / entries);

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page when changing search
  };

  const handleAddUserClick = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const filteredData = data.filter((item) => {
    return (
      item.kabupaten.toLowerCase().includes(searchQuery) ||
      item.cabang.toLowerCase().includes(searchQuery) ||
      item.nama.toLowerCase().includes(searchQuery) ||
      item.email.toLowerCase().includes(searchQuery) ||
      item.userId.toLowerCase().includes(searchQuery) ||
      item.password.toLowerCase().includes(searchQuery)
    );
  });

  const startIndex = (currentPage - 1) * entries;
  const selectedData = filteredData.slice(startIndex, startIndex + entries);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
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
                  Tambah Cabang
                </h3>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col space-y-4">
                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Kabupaten
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kabupaten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Aceh">Aceh</SelectItem>
                            <SelectItem value="Bali">Bali</SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                            <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Cabang
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Aceh">Aceh</SelectItem>
                            <SelectItem value="Bali">Bali</SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                            <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Tambah
                      </Button>
                    </div>
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

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-teal-700 text-white">
                    <th className="p-2 md:p-3 border">No.</th>
                    <th className="p-2 md:p-3 border">Kabupaten</th>
                    <th className="p-2 md:p-3 border">Cabang</th>
                    <th className="p-2 md:p-3 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((item, index) => (
                    <tr key={item.id} className="bg-gray-100">
                      <td className="p-2 md:p-3 border text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="p-2 md:p3 border">{item.kabupaten}</td>
                      <td className="p-2 md:p3 border">{item.cabang}</td>
                      <td className="p-2 border">
                        <div className="flex space-x-2 justify-center">
                          <button className="bg-red-500 text-white px-2 py-1 rounded">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col md:flex-row justify-between text-sm mt-4 items-center space-y-2 md:space-y-0">
                <span className="text-center md:text-left">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + entries, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </span>
                <div className="flex flex-wrap justify-between md:justify-between space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === 1 ? "bg-gray-300" : "bg-white"
                    }`}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === totalPages ? "bg-gray-300" : "bg-white"
                    }`}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </main>
            {isPopupVisible && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h2 className="text-xl font-bold mb-4">Tambah User</h2>
                  <form>
                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Kabupaten
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kabupaten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Aceh">Aceh</SelectItem>
                            <SelectItem value="Bali">Bali</SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                            <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Cabang
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kabupaten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Aceh">Aceh</SelectItem>
                            <SelectItem value="Bali">Bali</SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                            <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Nama Pengurus Cabang
                      </Label>
                      <Input type="text" placeholder="Masukkan Nama" />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        NIP
                      </Label>
                      <Input type="number" placeholder="Masukkan NIP" />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Password
                      </Label>
                      <Input type="password" placeholder="Masukkan Password" />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Email
                      </Label>
                      <Input type="email" placeholder="Masukkan Email" />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium mb-2">
                        Handphone
                      </Label>
                      <Input type="number" placeholder="Masukkan No. HP" />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleClosePopup}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Simpan
                      </button>
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

export default page;
