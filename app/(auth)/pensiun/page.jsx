"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
  const [pensiunList, setPensiunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const router = useRouter();
  const { token } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [filteredPensiunList, setFilteredPensiunList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const startNumber = (currentPage - 1) * itemsPerPage;
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);

    const filteredItems = pensiunList.filter((pensiun) => {
      return status ? pensiun.status === status : true;
    });

    setFilteredPensiunList(filteredItems);
  };

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanOptions(response.data);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    applyFilters(month, selectedYear);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    applyFilters(selectedMonth, year);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchPensiunData = async () => {
      try {
        const fetchedData = await GlobalApi.getAllPensiun();
        if (fetchedData && fetchedData.data.content && fetchedData.data.content) {
          const filteredPensiunList = fetchedData.data.content;
          
          // Filter untuk status "Segera"
          const segeraItems = filteredPensiunList.filter(item => item.status === 'Segera');
          
          // Hitung jumlah "Segera"
          const countSegera = segeraItems.length;
  
          // Simpan jumlah "Segera" ke sessionStorage
          sessionStorage.setItem('statusSegera', countSegera);
  
          // Set statusSegeraCount di state
          setStatusSegeraCount(countSegera);
        }
        console.log(fetchedData.data.content)
        const pensiunList = fetchedData.data.content;

        setPensiunList(pensiunList);
        setFilteredPensiunList(pensiunList);

        const years = Array.from(
          new Set(
            pensiunList.map((pensiun) =>
              new Date(pensiun.prediksiPensiun).getFullYear()
            )
          )
        );
        setYearOptions(years);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPensiunData();
  }, []);

  const applyFilters = (month, year) => {
    const filteredList = pensiunList.filter((pensiun) => {
      const pensiunDate = new Date(pensiun.prediksiPensiun);
      const pensiunMonth = pensiunDate.getMonth() + 1;
      const pensiunYear = pensiunDate.getFullYear();
      return (
        (!month || pensiunMonth === parseInt(month)) &&
        (!year || pensiunYear === parseInt(year))
      );
    });

    setFilteredPensiunList(filteredList);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPensiunList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    const role = sessionStorage.getItem("role");

    if (role === "ADMIN" || role === "SUPER ADMIN") {
      const countSegera = filteredPensiunList.filter(
        (item) => item.status === "Segera"
      ).length;
      setStatusSegeraCount(countSegera);

      sessionStorage.setItem("statusSegera", countSegera);
    }
  }, [currentItems]);

  const totalPages = Math.ceil(filteredPensiunList.length / itemsPerPage);

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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

  const handlePopup = async (npa) => {
    try {
      const response = await GlobalApi.cekNpa(npa);

      if (response && response && response.id) {
        const id = response.id;

        sessionStorage.setItem("idPensiun", id);

        setPopupVisible(true);
      } else {
        console.error("ID tidak ditemukan dalam respon API");
      }
    } catch (error) {
      console.error("Error saat mengambil NPA:", error);
    }
  };

  const handleCancelKeluar = () => {
    setPopupVisible(false);
  };

  const handlePensiunAnggota = async () => {
    try {
      const idPensiun = sessionStorage.getItem("idPensiun");
      await GlobalApi.pensiunAnggota(idPensiun);
      setPopupVisible(false);
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
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota berhasil Pensiun!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 4000,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
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
    } catch (error) {
      console.error("Gagal pensiun anggota:", error);
      toast.error(
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
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Anggota Gagal Pensiun.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
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
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#f44336",
              color: "#fff",
            },
          },
        }}
      />
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full flex flex-wrap items-center justify-between mb-4 mt-16 gap-4">
              <div className="flex flex-wrap w-full gap-4 md:w-auto">
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                >
                  <option value="">Pilih Bulan</option>
                  {bulanOptions.map((bulan) => (
                    <option key={bulan.id} value={bulan.angkaBulan}>
                      {bulan.namaBulan}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                >
                  <option value="">Pilih Tahun</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                >
                  <option value="">Pilih Status</option>
                  <option value="Segera">Segera</option>
                </select>
              </div>

              <button className="p-2 px-4 bg-blue-500 text-white rounded w-full sm:w-auto transition duration-300 hover:bg-blue-700">
                Cetak
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <span>Cabang: Tampil Semua</span>
                <span>Jumlah Anggota: {filteredPensiunList.length} Orang</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white mt-4">
                  <thead className="bg-teal-700 text-white">
                    <tr>
                      <th className="py-2 px-3 text-center">No.</th>
                      <th className="py-2 px-3 text-center">Foto</th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Prediksi Pensiun
                      </th>
                      <th className="py-2 px-3 text-center">Data Anggota</th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Keanggotaan
                      </th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Cabang
                      </th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Status
                      </th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((pensiun, index) => (
                      <>
                        <tr key={pensiun.id} className="border-t">
                          <td className="py-2 px-3 text-center">
                            {startNumber + index + 1}
                            <Button
                              className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"
                              onClick={() => handleExpand(index)}
                            >
                              {expandedIndex === index ? (
                                <FaMinusCircle />
                              ) : (
                                <FaPlusCircle />
                              )}
                            </Button>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <img
                              src="/profile.png"
                              alt="Foto"
                              className="w-10 h-10 rounded-full"
                            />
                          </td>
                          <td className="py-2 px-3 text-center hidden lg:table-cell">
                            {formatDate(pensiun.prediksiPensiun)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div>{pensiun.namaLengkap}</div>
                            <div>{pensiun.npa}</div>
                            <div>{pensiun.tempatLahir}</div>
                            <div>{formatDate(pensiun.tanggalLahir)}</div>
                          </td>
                          <td className="py-2 px-3 text-center hidden lg:table-cell">
                            <div>{pensiun.jabatan}</div>
                            <div>{pensiun.unitKerja}</div>
                            <div>Usia: {pensiun.usia}</div>
                          </td>
                          <td className="py-2 px-3 text-center hidden lg:table-cell">
                            {pensiun.cabang}
                          </td>
                          <td className="py-2 px-3 text-center hidden lg:table-cell">
                            {pensiun.status}
                          </td>
                          <td className="py-2 px-3 text-center hidden lg:table-cell">
                            <button
                              type="button"
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              onClick={() => handlePopup(pensiun.npa)}
                            >
                              Pensiun
                            </button>

                            {popupVisible && (
                              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex justify-center items-center z-50">
                                <div className="bg-white rounded-lg p-6 w-2/5 text-center shadow-lg">
                                  <h2 className="text-lg font-semibold text-gray-800">
                                    Apakah Anda yakin ?
                                  </h2>
                                  <p className="text-gray-600 mt-2 mb-4">
                                    Apakah Anda yakin untuk mengubah anggota
                                    menjadi pensiun?
                                  </p>
                                  <div className="flex justify-center gap-4">
                                    <button
                                      onClick={handleCancelKeluar}
                                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      onClick={handlePensiunAnggota}
                                      className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                                    >
                                      Ya, Saya Yakin
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                        {expandedIndex === index && (
                          <tr className="bg-gray-100 lg:hidden">
                            <td
                              colSpan="3"
                              className="py-2 px-3 text-sm border-t"
                            >
                              <div>
                                <strong>Prediksi Pensiun:</strong>{" "}
                                {formatDate(pensiun.prediksiPensiun)}
                              </div>
                              <div>
                                <strong>Keanggotaan:</strong> {pensiun.jabatan},{" "}
                                {pensiun.unitKerja}
                              </div>
                              <div>
                                <strong>Usia:</strong> {pensiun.usia}
                              </div>
                              <div>
                                <strong>Cabang ke-2:</strong> {pensiun.cabang}
                              </div>
                              <div>
                                <strong>Status:</strong> {pensiun.status}
                              </div>
                              <button
                                type="button"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={() => handlePopup(pensiun.npa)}
                              >
                                Pensiun
                              </button>

                              {popupVisible && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex justify-center items-center z-50">
                                  <div className="bg-white rounded-lg p-6 w-4/5 sm:w-2/5 md:w-1/3 text-center shadow-lg">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                      Apakah Anda yakin ?
                                    </h2>
                                    <p className="text-gray-600 mt-2 mb-4">
                                      Apakah Anda yakin untuk mengubah anggota
                                      menjadi pensiun?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                      <button
                                        onClick={handleCancelKeluar}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={handlePensiunAnggota}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                                      >
                                        Ya, Saya Yakin
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPensiunList.length > 0 && (
                <div className="flex justify-center mt-4 gap-1">
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
                      className={`px-3 py-1 border rounded text-sm ${
                        page === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-50"
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
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
