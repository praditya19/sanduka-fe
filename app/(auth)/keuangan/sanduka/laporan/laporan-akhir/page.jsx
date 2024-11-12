"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const tableRef = useRef();
  const [bulanList, setBulanList] = useState([]);
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  useEffect(() => {
    const bulan = [
      { id: 1, namaBulan: "Januari" },
      { id: 2, namaBulan: "Februari" },
      { id: 3, namaBulan: "Maret" },
      { id: 4, namaBulan: "April" },
      { id: 5, namaBulan: "Mei" },
      { id: 6, namaBulan: "Juni" },
      { id: 7, namaBulan: "Juli" },
      { id: 8, namaBulan: "Agustus" },
      { id: 9, namaBulan: "September" },
      { id: 10, namaBulan: "Oktober" },
      { id: 11, namaBulan: "November" },
      { id: 12, namaBulan: "Desember" },
    ];
    setBulanList(bulan);

    const currentYear = new Date().getFullYear();
    const yearsArray = Array.from(
      { length: 5 },
      (_, index) => currentYear - index
    );
    setSelectedYear(yearsArray);

    const currentMonth = new Date().getMonth();
    setSelectedMonth(bulan[currentMonth].id);
    setSelectedYear(currentYear);
  }, []);

  const getSaldoAkhirSanduka = async (month, year) => {
    try {
      const response = await GlobalApi.getSaldoAkhir(month, year);
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      getSaldoAkhirSanduka(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data || []);
      } catch (error) {
        console.error("Error fetching bulan data:", error);
      }
    };

    fetchBulan();
  }, []);

  const formatCurrency = (amount) =>
    `Rp ${parseInt(amount).toLocaleString("id-ID")}`;

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Laporan Akhir</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Laporan Akhir (SALDO)</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out bg-gray-300 ${
            isSidebarOpen ? "ml-60" : "ml-0"
          }`}
        >
          <div className="container mx-auto p-6 ">
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
              <div className="bg-teal-800 p-2 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {bulanList.map((bulan) => (
                        <option key={bulan.id} value={bulan.id}>
                          {bulan.namaBulan}
                        </option>
                      ))}
                    </select>
                    <select
                      className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      id="tahunTable"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">Pilih Tahun</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                      Transaksi {selectedMonth} {selectedYear}
                    </h1>
                  </div>
                  <div className="flex justify-center space-x-4 mt-0 sm:mt-3 mr-0 sm:mr-10">
                    <Button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                      onClick={printTable}
                    >
                      Cetak
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div ref={tableRef} className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th
                          rowSpan="2"
                          className="py-3 px-4 border border-gray-300 bg-gray-800 text-white text-left"
                        >
                          Pemasukan Sanduka
                        </th>
                        <th
                          colSpan="2"
                          className="py-3 px-4 border border-gray-300 bg-gray-800 text-white"
                        >
                          Target
                        </th>
                        <th
                          colSpan="2"
                          className="py-3 px-4 border border-gray-300 bg-gray-800 text-white"
                        >
                          Realisasi
                        </th>
                        <th
                          colSpan="2"
                          className="py-3 px-4 border border-gray-300 bg-gray-800 text-white"
                        >
                          Selisih
                        </th>
                      </tr>
                      <tr>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Anggota
                        </th>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Nominal
                        </th>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Anggota
                        </th>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Nominal
                        </th>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Kurang
                        </th>
                        <th className="py-2 px-4 border border-gray-300 bg-gray-800 text-white">
                          Lebih
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data ? (
                        <>
                          <tr className="bg-gray-100">
                            <td className="py-3 px-4 border border-gray-300">
                              Pemasukan Sanduka
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-center">
                              {data.totalAnggota}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-right">
                              {formatCurrency(data.targetNominal)}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-center">
                              {data.totalAnggota}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-right">
                              {formatCurrency(data.realisasiNominal)}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-right">
                              {formatCurrency(data.selisihNominal)}
                            </td>
                            <td className="py-3 px-4 border border-gray-300 text-right">
                              {formatCurrency(data.selisihNominal)}
                            </td>
                          </tr>

                          <tr className="bg-gray-300 font-semibold">
                            <td className="py-2 px-4 border border-gray-300">
                              Penerimaan dan Setoran Bulan Lalu
                            </td>
                            <td
                              colSpan="6"
                              className="border border-gray-300"
                            ></td>
                          </tr>

                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              Piutang Bulan Lalu
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.piutangBulanLalu)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              Saldo Piutang Bulan Lalu
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.saldoPiutangBulanLalu)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>

                          <tr className="bg-gray-300 font-semibold">
                            <td className="py-2 px-4 border border-gray-300">
                              Pengeluaran
                            </td>
                            <td
                              colSpan="6"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              Operasional 15%
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.operasional)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              ATK
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.atk)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>

                          <tr className="font-semibold">
                            <td className="py-3 px-4 border border-gray-300">
                              Total Pengeluaran
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.totalPengeluaran)}
                            </td>
                            <td colSpan="4" className="border border-gray-300">
                              {" "}
                              {formatCurrency(data.totalPengeluaran)}
                            </td>
                          </tr>

                          <tr className="bg-gray-300 font-semibold">
                            <td className="py-2 px-4 border border-gray-300">
                              Pemasukan
                            </td>
                            <td
                              colSpan="6"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              Saldo Bulan Lalu
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.saldoBulanLalu)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 border border-gray-300">
                              Saldo Bulan Sekarang
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.saldoBulanSekarang)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>

                          <tr className="font-semibold">
                            <td className="py-3 px-4 border border-gray-300">
                              Total Saldo
                            </td>
                            <td
                              colSpan="2"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.totalSaldo)}
                            </td>
                            <td
                              colSpan="4"
                              className="border border-gray-300"
                            ></td>
                          </tr>
                          <tr className="bg-gray-400 font-semibold">
                            <td className="py-3 px-4 border border-gray-300">
                              (Akhir Saldo) Pemasukan - Pengeluaran
                            </td>
                            <td
                              colSpan="6"
                              className="py-3 px-4 border border-gray-300 text-right"
                            >
                              {formatCurrency(data.saldoAkhir)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-3  px-4 border border-gray-300 text-center"
                          >
                            No Data Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
