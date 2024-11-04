"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GlobalApi from "@/app/_utils/GlobalApi";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const DataTable = () => {
  const dropdownRef = useRef(null);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  const [detailFilter, setDetailFilter] = useState("");
  const [cabangFilter, setCabangFilter] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [anggotaData, setAnggotaData] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Change to a boolean for error state
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangOptions(response.data);
        setFilteredOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  const fetchAnggotaData = async () => {
    try {
      const response = await GlobalApi.getAllAnggota();
      if (Array.isArray(response.data)) {
        setAnggotaData(response.data); // Ensure the data is an array
      } else {
        console.error("Unexpected data format:", response.data);
        setAnggotaData([]); // Set to empty array if data format is unexpected
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error); // Log error for debugging
      setError(true); // Set error state to true
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    const filtered = cabangOptions.filter((option) =>
      option.kecamatan.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredOptions(filtered);
    setShowDropdown(value.length > 0);

    // Jika input kosong, reset selectedCabang
    if (value.trim() === "") {
      setSelectedCabang("");
    }
  };

  const handleOptionClick = (option) => {
    const cabangTerpilih = option ? option.kecamatan : ''; // Jika kosong, set sebagai string kosong
    setSelectedCabang(cabangTerpilih); // Set cabang terpilih
    setShowDropdown(false); // Menyembunyikan dropdown setelah memilih opsi
    setSearchTerm(''); // Reset search term
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(true); // Start loading data
      fetchAnggotaData();
    }
  }, [token, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // Show generic error message if there's an error
    return <div>Something went wrong. Please try again later.</div>;
  }

  const filteredData = anggotaData.filter(
    (item) =>
      (detailFilter === "" || item.detail === detailFilter) &&
      (cabangFilter === "" || item.cabang === cabangFilter)
  );

  return (
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-base md:text-base font-bold mb-4 text-center">
            DATA ANGGOTA
          </h2>
          <div className="w-full flex mb-4 space-x-4 text-base">
            <select
              value={detailFilter}
              onChange={(e) => setDetailFilter(e.target.value)}
              className="p-2 border rounded max-w-sm w-full"
            >
              <option value="">Select Detail Filter</option>
              <option value="Menjadi Anggota Baru">Menjadi Anggota Baru</option>
              <option value="Keluar">Anggota Keluar</option>
              <option value="Pensiun">Anggota Pensiun</option>
              <option value="Meninggal">Anggota Meninggal</option>
            </select>
            <div className="relative" ref={dropdownRef}>
              {/* Input readonly untuk menampilkan cabang terpilih */}
              <Input
                type="text"
                placeholder="Cabang terpilih"
                value={selectedCabang}
                readOnly
                className="p-2 border border-gray-300 rounded-md mb-2 w-64"
                onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown saat input di-click
              />

              {showDropdown && (
                <div className="absolute w-64 bg-white border border-gray-300 rounded-md max-h-48 shadow-lg z-10">
                  {/* Input pencarian di dalam dropdown */}
                  <Input
                    type="text"
                    placeholder="Cari atau ketik Cabang..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="p-2 border-b border-gray-300 w-full"
                    autoFocus // Fokus otomatis pada input pencarian saat dropdown muncul
                  />

                  <ul className="max-h-40 overflow-y-auto">
                    {/* Opsi untuk menghapus pilihan cabang */}
                    <li
                      className="p-2 hover:bg-blue-100 cursor-pointer text-gray-700 font-semibold"
                      onClick={() => handleOptionClick(null)} // Kosongkan pilihan
                    >
                      Kosongkan Pilihan
                    </li>

                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option.kecamatan}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500">Tidak ada hasil</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <Table className="w-full table-auto mb-8 text-sm">
            <TableHeader className="p-2 md:p-3 border bg-teal-700 ">
              <TableRow>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  No
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Date
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Data
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Cabang
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Detail
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  <TableCell className="text-center border">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border">{item.date}</TableCell>
                  <TableCell className="border">{item.data}</TableCell>
                  <TableCell className="border text-center">
                    {item.cabang}
                  </TableCell>
                  <TableCell className="border text-center">
                    {item.detail}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
