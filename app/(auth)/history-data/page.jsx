"use client";
import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    GlobalApi.getCabang()
      .then((response) => {
        setCabangOptions(response.data);
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

  const fetchData = async () => {
    try {
      const role = sessionStorage.getItem("role");
      const userId = sessionStorage.getItem("userId");

      if (role === "USER" && userId) {
        // Jika role adalah USER, ambil data spesifik user
        const userData = await GlobalApi.getHistoryDataById(userId);

        // Pastikan data npaDetail ada
        const npaDetail = userData.npa
          ? await GlobalApi.cekNpaList([userData.npa])
          : null;

        const enrichedData = [
          {
            ...userData,
            npaDetail: npaDetail?.[0] || {}, // Ambil detail NPA jika tersedia
          },
        ];

        setData(enrichedData);
        return; // Keluar dari fungsi setelah data USER diambil
      }

      // Jika bukan USER, ambil data history secara umum
      const pageIndex = currentPage - 1; // Konversi currentPage ke zero-based index
      const historyResponse = await GlobalApi.getHistoryData(pageIndex, itemsPerPage);
      const historyData = historyResponse.content;
      setTotalPages(historyResponse.totalPages);

      const npaList = historyData.map((item) => item.npa).filter((npa) => npa);

      let npaData = [];
      if (npaList.length > 0) {
        npaData = await GlobalApi.cekNpaList(npaList);
      }

      const npaMap = npaData.reduce((acc, item) => {
        if (item.npaPgri) {
          acc[item.npaPgri.trim().toLowerCase()] = item;
        }
        return acc;
      }, {});

      const enrichedData = historyData.map((item) => {
        const npaDetail = npaMap[item.npa.trim().toLowerCase()];
        return {
          ...item,
          npaDetail: npaDetail || {},
        };
      });

      setData(enrichedData);
    } catch (error) {
      console.error("Error fetching history data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
      fetchData();

      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize();
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router, page]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredData = data.filter((item) => {
    const matchesSearchTerm =
      (item.npaDetail.namaLengkap &&
        item.npaDetail.namaLengkap
          .toLowerCase()
          .includes(filter.toLowerCase())) ||
      (item.cabang && item.cabang.toLowerCase().includes(filter.toLowerCase()));

    const matchesCabang = selectedCabang
      ? item.cabang &&
        item.cabang.toLowerCase() === selectedCabang.toLowerCase()
      : true;

    const matchesMonth = selectedMonth
      ? new Date(item.tanggal).getMonth() + 1 === parseInt(selectedMonth, 10)
      : true;

    const matchesYear = selectedYear
      ? new Date(item.tanggal).getFullYear() === parseInt(selectedYear, 10)
      : true;

    return matchesSearchTerm && matchesCabang && matchesMonth && matchesYear;
  });

  const handleEdit = (item) => {
    const npa = item.npaDetail.npaPgri;
    console.log(`NPA yang dituju: ${npa}`);
    sessionStorage.setItem("npa", npa);
    router.push(`/history-data/detail`);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState.toString());
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
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

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="w-full p-4 container shadow-lg rounded-lg mt-12">
            <div className="rounded-md flex flex-col py-4">
              <div className="container px-2">
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex w-2/3 space-x-2">
                    <select
                      value={selectedCabang}
                      onChange={(e) => setSelectedCabang(e.target.value)}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Semua Cabang</option>
                      {cabangOptions.map((option) => (
                        <option key={option.id} value={option.kecamatan}>
                          {option.kecamatan}{" "}
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
                        "Detail",
                        "Keterangan",
                      ].map((header, idx) => (
                        <th
                          key={header}
                          rowSpan="2"
                          className={`border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white ${
                            idx > 2 ? "hidden lg:table-cell" : ""
                          }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={
                            index % 2 === 0 ? "bg-gray-200" : "bg-white"
                          }
                        >
                          <td className="text-center border">
                            {index + 1 + page * size}
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
                          <td className="border">{`${item.hari}, ${formatDate(
                            item.tanggal
                          )}, ${item.jam}`}</td>
                          <td className="border">
                            {item.npaDetail ? (
                              <div>
                                <div>{item.npaDetail.namaLengkap ?? "-"},</div>
                                <div>{item.npaDetail.npaPgri ?? "-"},</div>
                                <div>
                                  {item.npaDetail.tempatLahir ?? "-"}{" "}
                                  {item.npaDetail.tanggalLahir
                                    ? formatDate(item.npaDetail.tanggalLahir)
                                    : "-"}
                                </div>
                                <div>{item.npaDetail.jabatan ?? "-"},</div>
                                <div>{item.npaDetail.unitKerja ?? "-"},</div>
                                <div>
                                  {item.npaDetail.tanggalLahir
                                    ? calculateAge(item.npaDetail.tanggalLahir)
                                    : "-"}{" "}
                                  Tahun
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="text-center border hidden lg:table-cell">
                            {item.cabang}
                          </td>
                          <td className="border hidden lg:table-cell">
                            {item.uraian}
                          </td>
                          <td className="text-center border hidden lg:table-cell">
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
                            <td colSpan="6" className="border px-4 py-2">
                              <div>
                                <strong>Cabang:</strong> {item.cabang ?? "-"}
                              </div>
                              <div className="mt-2">
                                <strong>Detail:</strong> {item.uraian ?? "-"}
                              </div>
                              <div className="mt-2">
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
                </table>

                <div className="flex flex-col md:flex-row justify-between text-sm mt-4 items-center space-y-2 md:space-y-0 md:space-x-2">
                  <span className="text-center md:text-left">
                    Showing {page * size + 1} to{" "}
                    {Math.min((page + 1) * size, totalPages * size)} of{" "}
                    {totalPages * size} entries
                  </span>

                  <div className="flex flex-wrap justify-center md:justify-end space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      className={`px-3 py-1 border text-sm rounded ${
                        page === 0 ? "bg-gray-300" : "bg-white"
                      }`}
                      disabled={page === 0}
                    >
                      Previous
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
                      onClick={handleNextPage}
                      className={`px-3 py-1 border text-sm rounded ${
                        page === totalPages - 1 ? "bg-gray-300" : "bg-white"
                      }`}
                      disabled={page === totalPages - 1}
                    >
                      Next
                    </button>
                  </div>
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