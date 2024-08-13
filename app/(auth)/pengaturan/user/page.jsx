"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft, faBars } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const dummyData = [
    {
      id: 1,
      npa_pgri: "123456",
      nama: "Budi Santoso",
      jabatan: "Ketua Cabang",
      email: "budi.santoso@example.com",
      password: "password123",
      kabupaten: "Jakarta",
      cabang: "Jakarta Pusat",
      userId: "budi123",
    },
    {
      id: 2,
      npa_pgri: "654321",
      nama: "Siti Aminah",
      jabatan: "Sekretaris Cabang",
      email: "siti.aminah@example.com",
      password: "password456",
      kabupaten: "Bandung",
      cabang: "Bandung Timur",
      userId: "siti321",
    },
    {
      id: 3,
      npa_pgri: "789012",
      nama: "Ahmad Fauzi",
      jabatan: "Bendahara Cabang",
      email: "ahmad.fauzi@example.com",
      password: "password789",
      kabupaten: "Surabaya",
      cabang: "Surabaya Barat",
      userId: "ahmad789",
    },
    {
      id: 4,
      npa_pgri: "345678",
      nama: "Dewi Lestari",
      jabatan: "Anggota Cabang",
      email: "dewi.lestari@example.com",
      password: "password101",
      kabupaten: "Yogyakarta",
      cabang: "Yogyakarta Utara",
      userId: "dewi101",
    },
    {
      id: 5,
      npa_pgri: "901234",
      nama: "Rudi Hartono",
      jabatan: "Ketua Cabang",
      email: "rudi.hartono@example.com",
      password: "password102",
      kabupaten: "Medan",
      cabang: "Medan Selatan",
      userId: "rudi102",
    },
    {
      id: 6,
      npa_pgri: "112233",
      nama: "Tini Susanti",
      jabatan: "Sekretaris Cabang",
      email: "tini.susanti@example.com",
      password: "password103",
      kabupaten: "Semarang",
      cabang: "Semarang Barat",
      userId: "tini103",
    },
    {
      id: 7,
      npa_pgri: "445566",
      nama: "Andi Setiawan",
      jabatan: "Bendahara Cabang",
      email: "andi.setiawan@example.com",
      password: "password104",
      kabupaten: "Makassar",
      cabang: "Makassar Timur",
      userId: "andi104",
    },
    {
      id: 8,
      npa_pgri: "778899",
      nama: "Ratna Sari",
      jabatan: "Anggota Cabang",
      email: "ratna.sari@example.com",
      password: "password105",
      kabupaten: "Palembang",
      cabang: "Palembang Barat",
      userId: "ratna105",
    },
    {
      id: 9,
      npa_pgri: "123789",
      nama: "Yudi Pratama",
      jabatan: "Ketua Cabang",
      email: "yudi.pratama@example.com",
      password: "password106",
      kabupaten: "Banjarmasin",
      cabang: "Banjarmasin Tengah",
      userId: "yudi106",
    },
    {
      id: 10,
      npa_pgri: "456012",
      nama: "Maya Putri",
      jabatan: "Sekretaris Cabang",
      email: "maya.putri@example.com",
      password: "password107",
      kabupaten: "Bali",
      cabang: "Denpasar Selatan",
      userId: "maya107",
    },
    {
      id: 11,
      npa_pgri: "789345",
      nama: "Hendra Wijaya",
      jabatan: "Bendahara Cabang",
      email: "hendra.wijaya@example.com",
      password: "password108",
      kabupaten: "Pontianak",
      cabang: "Pontianak Utara",
      userId: "hendra108",
    },
    {
      id: 12,
      npa_pgri: "101112",
      nama: "Lia Wulandari",
      jabatan: "Anggota Cabang",
      email: "lia.wulandari@example.com",
      password: "password109",
      kabupaten: "Batam",
      cabang: "Batam Timur",
      userId: "lia109",
    },
    {
      id: 13,
      npa_pgri: "131415",
      nama: "Agus Susanto",
      jabatan: "Ketua Cabang",
      email: "agus.susanto@example.com",
      password: "password110",
      kabupaten: "Pekanbaru",
      cabang: "Pekanbaru Selatan",
      userId: "agus110",
    },
    {
      id: 14,
      npa_pgri: "161718",
      nama: "Fitriani",
      jabatan: "Sekretaris Cabang",
      email: "fitriani@example.com",
      password: "password111",
      kabupaten: "Bandar Lampung",
      cabang: "Lampung Tengah",
      userId: "fitri111",
    },
    {
      id: 15,
      npa_pgri: "192021",
      nama: "Dedi Kurniawan",
      jabatan: "Bendahara Cabang",
      email: "dedi.kurniawan@example.com",
      password: "password112",
      kabupaten: "Malang",
      cabang: "Malang Barat",
      userId: "dedi112",
    },
  ];

  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [npa, setNpa] = useState("");
  const [adminData, setAdminData] = useState(null);

  const totalPages = Math.ceil(dummyData.length / entries);

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
    setNpa("");
    setAdminData(null);
  };

  const handleNpaChange = (e) => {
    setNpa(e.target.value);
  };

  const handleCekNpa = () => {
    const foundData = dummyData.find((item) => item.npa_pgri === npa);

    if (foundData) {
      setAdminData(foundData); // Set admin data dari dummy data
    } else {
      setAdminData(null); // Handle jika data tidak ditemukan
    }
  };

  const filteredData = dummyData.filter((item) => {
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
  const handleAddUser = () => {
    // Implementasikan logika penambahan user baru di sini
    console.log("Menambahkan user baru:", adminData);

    // Misalnya, kamu bisa menambahkan logika untuk menyimpan data ke database atau mengirim data ke API.
  };

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div>
      <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
        <div className="container mx-auto flex items-center justify-between">
          {/* Back Button and Title */}
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="sm"
              onClick={handleBackClick}
              className="cursor-pointer mr-2"
            />
            <h1 className="text-base">Master Data</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-6 text-base">
              <li className="cursor-pointer">
                <Link href="/pengaturan/user">User</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/pengaturan/tambah">Tambah Cabang</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/pengaturan/unit-kerja">Unit Kerja</Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden ml-auto" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-teal-700 text-white">
            <ul className="flex flex-col space-y-2 p-4">
              <li className="cursor-pointer">
                <Link href="/keuangan/home">Home</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/data-utama">Data Utama</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/sanduka">Sanduka</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/organisasi">Organisasi</Link>
              </li>
            </ul>
          </div>
        )}
      </header>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
          <div className="mb-2">
            <h3 className="text-base md:text-base font-bold mb-2">
              Data Pengurus Cabang dan Password
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
                <th className="p-2 md:p-3 border">Kabupaten</th>
                <th className="p-2 md:p-3 border">Cabang</th>
                <th className="p-2 md:p-3 border">Nama</th>
                <th className="p-2 md:p-3 border">NIP</th>
                <th className="p-2 md:p-3 border">HP</th>
                <th className="p-2 md:p-3 border">ID User & Password</th>
                <th className="p-2 md:p-3 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {selectedData.map((item, index) => (
                <tr key={item.id} className="bg-gray-100">
                  <td className="p-2 md:p-3 border text-center">
                    {startIndex + index + 1}
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    {item.email}
                  </td>
                  <td className="p-2 md:p-3 border">{item.kabupaten}</td>
                  <td className="p-2 md:p-3 border">{item.cabang}</td>
                  <td className="p-2 md:p-3 border">{item.nama}</td>
                  <td className="p-2 md:p-3 border">{item.nama}</td>
                  <td className="p-2 md:p-3 border text-center">
                    {item.email}
                  </td>
                  <td className="p-2 md:p-3 border">
                    Id User : {item.userId} <br /> Password : {item.password}
                  </td>
                  <td className="p-2 border">
                    <div className="flex space-x-2 justify-center">
                      <Button className="bg-red-500 text-white px-2 py-2 rounded">
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                      <Link
                        href={`https://wa.me/${item.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-2 py-2 rounded"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} />
                      </Link>
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
                className={`px-3 py-1 border text-sm rounded ${
                  currentPage === 1 ? "bg-gray-300" : "bg-white"
                }`}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Determine if the page number should be shown
                const shouldShowPage =
                  pageNumber === currentPage ||
                  pageNumber === currentPage - 1 ||
                  pageNumber === currentPage + 1;

                if (totalPages <= 3 || shouldShowPage) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNumber
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-3 py-1 border text-sm rounded ${
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
                  onClick={handleCekNpa}
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
                        <h3 className="text-lg font-semibold mb-4">
                          Data Admin
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <Label
                              htmlFor="nama"
                              className="block font-semibold mr-2 mb-1 md:mb-0"
                            >
                              Nama:
                            </Label>
                            <Input
                              type="text"
                              id="nama"
                              value={adminData.nama}
                              className="border rounded w-full p-2 text-black bg-gray-200"
                            />
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center">
                            <Label
                              htmlFor="npa_pgri"
                              className="block font-semibold mr-2 mb-1 md:mb-0"
                            >
                              NPA:
                            </Label>
                            <Input
                              type="text"
                              id="npa_pgri"
                              value={adminData.npa_pgri}
                              className="border rounded w-full p-2 text-black bg-gray-200" // Perbaiki className
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <Label
                              htmlFor="jabatan"
                              className="block font-semibold mr-2 mb-1 md:mb-0"
                            >
                              Jabatan:
                            </Label>
                            <Input
                              type="text"
                              id="jabatan"
                              value={adminData.jabatan}
                              className="border rounded w-full p-2 text-black bg-gray-200" // Perbaiki className
                            />
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center">
                            <Label
                              htmlFor="email"
                              className="block font-semibold mr-2 mb-1 md:mb-0"
                            >
                              Email:
                            </Label>
                            <Input
                              type="text"
                              id="email"
                              value={adminData.email}
                              className="border rounded w-full p-2 text-black bg-gray-200" // Perbaiki className
                            />
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center mb-4">
                          <Label
                            htmlFor="password"
                            className="block font-semibold mr-2 mb-1 md:mb-0"
                          >
                            Password:
                          </Label>
                          <Input
                            type="text"
                            id="password"
                            value={adminData.password}
                            className="border rounded w-full p-2 text-black bg-gray-200" // Perbaiki className
                          />
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
  );
};

export default Page;
