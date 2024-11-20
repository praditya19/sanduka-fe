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

const Page = () => {
  const [pensiunList, setPensiunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const router = useRouter();
  const { token } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [filteredPensiunList, setFilteredPensiunList] = useState([]);

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
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    applyFilters(selectedMonth, year);
  };

  useEffect(() => {
    const fetchPensiunData = async () => {
      try {
        const response = await GlobalApi.getAllPensiun();
        setPensiunList(response.data.content);
        setFilteredPensiunList(response.data.content);

        const years = Array.from(
          new Set(
            response.data.content.map((pensiun) =>
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
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full flex items-center justify-between mb-4 mt-16">
              <div className="flex w-full space-x-2">
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border rounded w-full md:w-auto"
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
                  className="p-2 border rounded w-full md:w-auto"
                >
                  <option value="">Pilih Tahun</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto transition duration-300 hover:bg-blue-700">
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPensiunList.map((pensiun, index) => (
                      <>
                        <tr key={pensiun.id} className="border-t">
                          <td className="py-2 px-3 text-center">
                            {index + 1}
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
                              src={pensiun.fotoUrl}
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
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
