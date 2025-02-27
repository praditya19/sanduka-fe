"use client";
import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { ClipLoader } from "react-spinners";

const Page = () => {
  const [allData, setAllData] = useState([]);
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [userCabang, setUserCabang] = useState("");

  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    if (userRole === "ADMIN") {
      const adminCabang = sessionStorage.getItem("cabang");
      setUserCabang(adminCabang);
      setSelectedCabang(adminCabang); 
    }
  }, []);

  useEffect(() => {
    GlobalApi.getCabang()
      .then((response) => {
        const userRole = sessionStorage.getItem("role");
        if (userRole === "ADMIN") {
          const adminCabang = sessionStorage.getItem("cabang");
          setCabangOptions(response.data.filter(cabang => 
            cabang.kecamatan.toLowerCase() === adminCabang.toLowerCase()
          ));
        } else {
          setCabangOptions(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cabang options:", error);
        setLoading(false);
      });
  }, []);

  const fetchBulan = async () => {
    try {
      const response = await GlobalApi.getBulan();
      setBulanOptions(response.data);
    } catch (error) {
      console.error("Error fetching bulan:", error);
    }
  };

  useEffect(() => {
    fetchBulan();
  }, []);

  const years = Array.from(new Array(11), (v, i) => i + 2020);

  const handlePrint = () => {
    window.print();
  };

  const fetchAllData = async () => {
    try {
      const userRole = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa");
      const adminCabang = sessionStorage.getItem("cabang");
      setLoading(true);

      let historyData = [];
      let page = 0;
      const size = 10000;
      let hasMoreData = true;

      if (userRole === "ADMIN") {
        try {
          while (hasMoreData) {
            const historyResponse = await GlobalApi.getHistoryData(page, size);

            if (historyResponse && historyResponse.content) {
              const filteredData = historyResponse.content.filter(item => 
                item.cabang.toLowerCase() === adminCabang.toLowerCase()
              );

              historyData = [
                ...historyData,
                ...filteredData.sort((a, b) => {
                  const dateA = new Date(`${a.tanggal} ${a.jam}`);
                  const dateB = new Date(`${b.tanggal} ${b.jam}`);
                  return dateB - dateA;
                }),
              ];

              hasMoreData = !historyResponse.last;
              page += 1;
            } else {
              hasMoreData = false;
            }
          }
        } catch (error) {
          console.error("Error fetching admin history data:", error);
          historyData = [];
        }
      } else if (userRole === "USER") {
        try {
          const historyResponse = await GlobalApi.getHistoryByNpa(npa);
          historyData = Array.isArray(historyResponse)
            ? historyResponse.sort((a, b) => {
              const dateA = new Date(`${a.tanggal} ${a.jam}`);
              const dateB = new Date(`${b.tanggal} ${b.jam}`);
              return dateB - dateA;
            })
            : [historyResponse];
        } catch (error) {
          console.error("Error fetching USER history:", error);
          historyData = [];
        }
      } else {
        try {
          while (hasMoreData) {
            const historyResponse = await GlobalApi.getHistoryData(page, size);

            if (historyResponse && historyResponse.content) {
              historyData = [
                ...historyData,
                ...historyResponse.content.sort((a, b) => {
                  const dateA = new Date(`${a.tanggal} ${a.jam}`);
                  const dateB = new Date(`${b.tanggal} ${b.jam}`);
                  return dateB - dateA;
                }),
              ];

              hasMoreData = !historyResponse.last;
              page += 1;
            } else {
              hasMoreData = false;
            }
          }
        } catch (error) {
          console.error("Error fetching history data:", error);
          historyData = [];
        }
      }

      setAllData(historyData);
    } catch (error) {
      console.error("Error in fetchAllData:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      fetchAllData();
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router]);

  useEffect(() => {
    const filtered = allData
      .filter((item) => {
        const matchesCabang = selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true;

        const matchesMonth = selectedMonth
          ? new Date(item.tanggal).getMonth() + 1 === parseInt(selectedMonth, 10)
          : true;

        const matchesYear = selectedYear
          ? new Date(item.tanggal).getFullYear() === parseInt(selectedYear, 10)
          : true;

        return matchesCabang && matchesMonth && matchesYear;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.tanggal} ${a.jam}`);
        const dateB = new Date(`${b.tanggal} ${b.jam}`);
        return dateB - dateA;
      });

    setTotalItems(filtered.length);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem));
    setData(filtered);

    const maxPage = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > maxPage) {
      setCurrentPage(Math.max(1, maxPage));
    }
  }, [allData, selectedCabang, selectedMonth, selectedYear, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getVisiblePages = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const visiblePages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          visiblePages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          visiblePages.push(i);
        }
      }
    }

    return visiblePages;
  };

  const handleEdit = (item) => {
    sessionStorage.setItem("npaDetailHistory", item.npa);
    router.push(`/history-data/detail`);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState.toString());
  };

  const formatDate = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <div className="w-full p-4 container shadow-lg rounded-lg mt-12">
            <div className="rounded-md flex flex-col py-4">
              <div className="container px-2">
                {/* Mobile Filters */}
                <div className="md:hidden mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm mb-3 border border-gray-200">
                    <select
                      value={selectedCabang}
                      onChange={(e) => setSelectedCabang(e.target.value)}
                      className="p-2 border rounded w-full mb-2"
                    >
                      <option value="">Semua Cabang</option>
                      {cabangOptions.map((option) => (
                        <option key={option.id} value={option.kecamatan}>
                          {option.kecamatan}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="p-2 border rounded w-full mb-2"
                    >
                      <option value="">Pilih Bulan</option>
                      {bulanOptions.map((bulan) => (
                        <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                          {bulan.namaBulan}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="p-2 border rounded w-full mb-2"
                    >
                      <option value="">Pilih Tahun</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handlePrint}
                    className="p-2 px-4 bg-blue-500 text-white rounded w-full"
                  >
                    Cetak
                  </button>
                </div>

                {/* Desktop Filters */}
                <div className="hidden md:flex w-full items-center justify-between mb-4">
                  <div className="flex w-2/3 space-x-2">
                    <select
                      value={selectedCabang}
                      onChange={(e) => setSelectedCabang(e.target.value)}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Semua Cabang</option>
                      {cabangOptions.map((option) => (
                        <option key={option.id} value={option.kecamatan}>
                          {option.kecamatan}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Pilih Bulan</option>
                      {bulanOptions.map((bulan) => (
                        <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                          {bulan.namaBulan}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Pilih Tahun</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto"
                  >
                    Cetak
                  </button>
                </div>
                
                <table className="w-full table-auto mb-8">
                  <thead className="p-2 md:p-3 border bg-green-300">
                    <tr>
                      {[
                        "No",
                        "Date",
                        "Data",
                        "Cabang",
                        "Keterangan",
                        "Detail",
                      ].map((header, idx) => (
                        <th
                          key={header}
                          rowSpan="2"
                          className={`border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white ${idx > 2 ? "hidden lg:table-cell" : ""}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {loading ? (
                    <tbody>
                      <tr>
                        <td colSpan="6" className="text-center py-20">
                          <div className="flex justify-center items-center">
                            <ClipLoader color="#3498db" size={50} />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : currentItems.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan="6" className="text-center py-20">
                          <div className="flex flex-col justify-center items-center space-y-2">
                            <p className="text-gray-500 text-lg">Tidak Ada Data History</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {currentItems.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`${index % 2 === 0 ? "bg-gray-200" : "bg-white"
                              }`}
                          >
                            <td className="text-center border py-4">
                              {startIndex + index + 1}
                              <button
                                className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden ml-2"
                                onClick={() => handleExpand(index)}
                              >
                                {expandedIndex === index ? (
                                  <FaMinusCircle className="w-4 h-4" />
                                ) : (
                                  <FaPlusCircle className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="border px-4 py-4 lg:table-cell w-[300px]">
                              {`${item.hari}, ${formatDate(item.tanggal)}, ${item.jam}`}
                            </td>
                            <td className="border px-4 py-4 lg:table-cell w-[300px]">
                              <div>
                                <div>{item.nama ?? "-"}</div>
                                <div>{item.npa ?? "-"}</div>
                              </div>
                            </td>
                            <td className="text-center border hidden lg:table-cell px-4 py-4 w-[150px]">
                              {item.cabang}
                            </td>
                            <td className="border hidden lg:table-cell px-4 py-4 w-[400px]">
                              {item.uraian}
                            </td>
                            <td className="text-center border hidden lg:table-cell px-4 py-4">
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>

                          {expandedIndex === index && (
                            <tr className="bg-gray-100 lg:hidden">
                              <td colSpan="6" className="border px-4 py-4">
                                <div>
                                  <strong>Cabang:</strong> {item.cabang ?? "-"}
                                </div>
                                <div className="mt-2">
                                  <strong>Keterangan:</strong> {item.uraian ?? "-"}
                                </div>
                                <div className="mt-4 text-center">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="ml-2 px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Detail
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  )}
                </table>

                <div className="flex justify-center items-center mt-4">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                    >
                      First
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                    >
                      Prev
                    </button>

                    {getVisiblePages().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${page === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage))
                        )
                      }
                      disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                      className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.ceil(totalItems / itemsPerPage))
                      }
                      disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                      className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
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
    </div >
  );
};

export default Page;