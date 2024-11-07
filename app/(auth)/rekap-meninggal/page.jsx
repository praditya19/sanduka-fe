"use client";
import React, { useState, useEffect, useRef } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import Image from "next/image";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";

const Page = () => {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const router = useRouter();
  const { token } = useAuth();
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const profileImageUrl = "/profile.png";
  const [fotoBase64, setFotoBase64] = useState([]);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const fetchData = async () => {
        try {
          const fetchedData = await GlobalApi.getAllDataLapor();
          setData(fetchedData);

          const fotoBase64Array = [];

          if (fetchedData && fetchedData.length > 0) {
            fetchedData.forEach((item) => {
              if (item.foto) {
                try {
                  const decodedString = atob(item.foto);
                  fotoBase64Array.push(decodedString);
                } catch (error) {
                  console.error("Error decoding Base64:", error);
                  fotoBase64Array.push(null);
                }
              } else {
                fotoBase64Array.push(null);
              }
            });
          } else {
            console.warn("No data found.");
          }

          setFotoBase64(fotoBase64Array);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch data:", error.message);
        }
      };

      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      fetchData();
      handleResize();

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [itemsPerPage, token, router]);

  useEffect(() => {
    let filtered = data;
    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.namaPelapor?.toLowerCase() || "").includes(lowercasedFilter) ||
          (item.namaAnggotaTerlapor?.toLowerCase() || "").includes(
            lowercasedFilter
          ) ||
          (item.cabangPelapor?.toLowerCase() || "").includes(lowercasedFilter)
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter((item) => {
        const itemMonth = new Date(item.waktuMeninggalTerlapor).getMonth() + 1;
        return itemMonth === parseInt(selectedMonth);
      });
    }

    if (selectedYear) {
      filtered = filtered.filter((item) => {
        const itemYear = new Date(item.waktuMeninggalTerlapor).getFullYear();
        return itemYear === parseInt(selectedYear);
      });
    }

    setFilteredData(filtered);
  }, [filter, selectedMonth, selectedYear, data]);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 2);
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div>
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex justify-center bg-red-600 py-2 rounded-b-lg shadow-md sm:mt-14 mt-12 sm:-mb-5 -mb-10">
            <h1 className="text-xl font-semibold text-white">
              Rekap Meninggal
            </h1>
          </div>
          <div className="w-full p-4 container shadow-lg rounded-lg mt-5 sm:mt-0">
            <div className="rounded-md flex flex-col py-4">
              <div className="container px-2">
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between mb-4 text-sm">
                  <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-0 w-full">
                    <div className="relative flex items-center mb-2 md:mb-0 w-full md:max-w-sm">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Search"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 pl-10 border rounded w-full"
                      />
                    </div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="p-2 border rounded md:ml-4 mb-2 md:mb-0 w-full md:w-auto"
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString("default", {
                              month: "long",
                            })}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="p-2 border rounded md:ml-4 mb-2 md:mb-0 w-full md:w-auto"
                    >
                      <option value="">All Years</option>
                      {[
                        ...new Set(
                          data.map((item) =>
                            new Date(item.waktuMeninggalTerlapor).getFullYear()
                          )
                        ),
                      ].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        setItemsPerPage(parseInt(e.target.value))
                      }
                      className="p-2 border rounded md:ml-4 mb-2 md:mb-0 w-full md:w-auto"
                    >
                      <option value={10}>10</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <button
                    onClick={() => window.print()} // Fungsi untuk mencetak halaman
                    className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto"
                  >
                    Cetak
                  </button>
                </div>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm mb-8 border-collapse border border-gray-300">
                    <thead className="bg-teal-700 text-white">
                      <tr>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase">
                          No
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase">
                          Foto
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase">
                          Data Lapor
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase">
                          Data Meninggal
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase hidden lg:table-cell">
                          Cabang
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase hidden lg:table-cell">
                          Keterangan
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-bold uppercase hidden lg:table-cell">
                          Diterimakan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((item, index) => (
                          <React.Fragment key={item.id}>
                            {/* Main Row */}
                            <tr
                              className={
                                index % 2 === 0 ? "bg-gray-200" : "bg-white"
                              }
                            >
                              <td className="text-center border px-4 py-2">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                                <button
                                  onClick={() => handleExpand(index)}
                                  className="ml-2 text-blue-500 lg:hidden"
                                >
                                  {expandedIndex === index ? (
                                    <FaMinusCircle />
                                  ) : (
                                    <FaPlusCircle />
                                  )}
                                </button>
                              </td>
                              <td className="border px-4 py-2">
                                <Image
                                  src={
                                    fotoBase64[index]
                                      ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                      : profileImageUrl
                                  }
                                  alt={`Foto ${item.namaPelapor || "User"}`}
                                  width={50}
                                  height={50}
                                  className="rounded"
                                  unoptimized={true}
                                />
                              </td>

                              <td className="border px-4 py-2">
                                <div className="text-xs">
                                  {item.namaPelapor}
                                </div>
                                <div className="text-xs">
                                  {item.jabatanPelapor ||
                                    "Jabatan tidak tersedia"}
                                </div>
                                <div className="text-xs">
                                  {item.tanggalPelaporan
                                    ? item.tanggalPelaporan.join("-")
                                    : "Tanggal tidak tersedia"}
                                </div>
                                <div className="text-xs">
                                  {item.cabangPelapor}
                                </div>
                                <div className="text-xs">
                                  {item.nomorHpPelapor}
                                </div>
                              </td>

                              <td className="border px-4 py-2">
                                <div className="text-xs">
                                  {item.namaAnggotaTerlapor}
                                </div>
                                <div className="text-xs">
                                  {item.cabangKhususTerlapor}
                                </div>
                                <div className="text-xs">
                                  {item.waktuMeninggalTerlapor
                                    ? item.waktuMeninggalTerlapor.join("-")
                                    : "Waktu tidak tersedia"}
                                </div>
                                <div className="text-xs">
                                  {item.unitKerjaTerlapor}
                                </div>
                              </td>

                              <td className="border px-4 py-2 text-center hidden lg:table-cell">
                                <div className="text-xs">
                                  {item.cabangKhususTerlapor ||
                                    "Cabang tidak tersedia"}
                                </div>
                              </td>
                              <td className="border px-4 py-2 hidden lg:table-cell">
                                {item.keteranganTerlapor ||
                                  "Keterangan tidak tersedia"}
                              </td>
                              <td className="border text-center px-4 py-2 hidden lg:table-cell">
                                Diterimakan (Sesuaikan jika ada)
                              </td>
                            </tr>

                            {expandedIndex === index && (
                              <tr className="lg:hidden bg-gray-100">
                                <td colSpan="4" className="border px-4 py-2">
                                  <div className="text-xs">
                                    <strong>Cabang:</strong>{" "}
                                    {item.cabangKhususTerlapor ||
                                      "Cabang tidak tersedia"}
                                  </div>
                                  <div className="text-xs">
                                    <strong>Keterangan:</strong>{" "}
                                    {item.keteranganTerlapor ||
                                      "Keterangan tidak tersedia"}
                                  </div>
                                  <div className="text-xs">
                                    <strong>Diterimakan:</strong> Diterimakan
                                    (Sesuaikan jika ada)
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center p-4">
                            No data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded"
                  >
                    First
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border rounded"
                  >
                    Prev
                  </button>

                  {getVisiblePages().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`p-2 border rounded ${
                        page === currentPage ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
