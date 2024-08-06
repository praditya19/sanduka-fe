"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const data = [
    {
      id: 1,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "BATEALIT",
      nama: "",
      email: "088892829292",
      userId: "idbatealit",
      password: "12345",
    },
    {
      id: 2,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "NALUMSARI",
      nama: "",
      email: "",
      userId: "idnalumsari",
      password: "12345",
    },
    {
      id: 3,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "PAKIS AJI",
      nama: "",
      email: "",
      userId: "idpakisaji",
      password: "12345",
    },
    {
      id: 4,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "PECANGAAN",
      nama: "",
      email: "wongrembang119@gmail.com",
      userId: "idpecangaan",
      password: "12345",
    },
    {
      id: 5,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "MLONGGO",
      nama: "",
      email: "pgri@mlonggo.online",
      userId: "idmlonggo",
      password: "12345",
    },
    {
      id: 6,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "sssssssss1@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 7,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "aaaaaaaaaaaaa01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 8,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 9,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 10,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 11,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 12,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 13,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 14,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 15,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 16,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 17,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 18,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "gggggggg01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 19,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 20,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 21,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "kkkkkkkked01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 22,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 23,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 24,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 25,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 26,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
    },
    {
      id: 27,
      time: "09:09 09/09/2023",
      kabupaten: "KAB. JEPARA",
      cabang: "KEMBANG",
      nama: "",
      email: "zaenalabied01@gmail.com",
      userId: "idkembang",
      password: "12345",
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">Master Data</h1>
          <nav className="mt-4">
            <ul className="flex flex-wrap space-x-4 md:space-x-6">
              <li className="cursor-pointer">
                <Link href="/user">User</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/tambah">Tambah Cabang</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/unit-kerja">Tambah Unit Kerja</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="mb-2">
          <h3 className="text-lg md:text-xl font-bold mb-2">
            Data Pengurus Cabang dan Password
          </h3>
          <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
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
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleAddUserClick}
            >
              Tambah User
            </button>
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
        <table className="w-full border-collapse">
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
                <td className="p-2 md:p-3 border text-center">{item.email}</td>
                <td className="p-2 md:p-3 border">
                  {item.kabupaten} 
                </td>
                <td className="p-2 md:p-3 border">
                   {item.cabang}
                </td>
                <td className="p-2 md:p-3 border">{item.nama}</td>
                <td className="p-2 md:p-3 border">{item.nama}</td>
                <td className="p-2 md:p-3 border text-center">{item.email}</td>
                <td className="p-2 md:p-3 border">
                  Id User : {item.userId} <br /> Password : {item.password}
                </td>
                <td className="p-2 border">
                  <div className="flex space-x-2 justify-center">
                    <button className="bg-red-500 text-white px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button className="bg-green-500 text-white px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col md:flex-row justify-between mt-4 space-y-2 md:space-y-0">
          <span>
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + entries, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="flex space-x-2">
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
                    <SelectValue placeholder="Kabupaten" />
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
                <Label className="block text-sm font-medium mb-2">Cabang</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Cabang" />
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
                <Input type="text" placeholder="Nama" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">NIP</Label>
                <Input type="number" placeholder="NIP" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Email</Label>
                <Input type="email" placeholder="Email" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Password</Label>
                <Input type="password" placeholder="Password" />
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
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
