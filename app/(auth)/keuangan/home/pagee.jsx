"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import {
  faArrowLeft,
  faBell,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

const data = [
  { cabang: "BANGSRI", kurangSetor: 0 },
  { cabang: "BATEALIT", kurangSetor: 0 },
  { cabang: "CABSUS DINAS PENDIDIKAN", kurangSetor: 0 },
  { cabang: "CABSUS IGTKI", kurangSetor: 0 },
  { cabang: "DONOROJO", kurangSetor: 0 },
  { cabang: "JEPARA", kurangSetor:  0 },
  { cabang: "KALINYAMATAN", kurangSetor: 0 },
  { cabang: "KARIMUNJAWA", kurangSetor: 0 },
  { cabang: "KEDUNG", kurangSetor: 0 },
  { cabang: "KELING", kurangSetor: 0 },
  { cabang: "KEMBANG", kurangSetor: 0 },
  { cabang: "MAYONG", kurangSetor: 0 },
  { cabang: "MLONGGO", kurangSetor: 0 },
  { cabang: "NALUMSARI", kurangSetor: 0 },
  { cabang: "PAKIS AJI", kurangSetor: 0 },
  { cabang: "PECANGAAN", kurangSetor: 0 },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState("");
  const [role, setRole] = useState("");
  const [saldoAkhir, setSaldoAkhir] = useState("");
  const [pemasukan, setPemasukan] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [saldoAkhirOr, setSaldoAkhirOr] = useState("");
  const [pemasukanOr, setPemasukanOr] = useState("");
  const [pengeluaranOr, setPengeluaranOr] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ ,setDefaultIuran] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch role from sessionStorage
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const pgriResponse = await GlobalApi.getDefaultIuranById(2);
      const daspenResponse = await GlobalApi.getDefaultIuranById(4);
      const derapResponse = await GlobalApi.getDefaultIuranById(3);
      const kalenderResponse = await GlobalApi.getDefaultIuranById(1);
  
      sessionStorage.setItem("PGRIData", JSON.stringify(pgriResponse));
      sessionStorage.setItem("daspenData", JSON.stringify(daspenResponse));
      sessionStorage.setItem("derapData", JSON.stringify(derapResponse));
      sessionStorage.setItem("kalenderData", JSON.stringify(kalenderResponse));
  
      const response = {
        pgri: pgriResponse,
        daspen: daspenResponse,
        derap: derapResponse,
        kalender: kalenderResponse,
      };
  
      setDefaultIuran(response);
    };
  
    const storedData = sessionStorage.getItem("PGRIData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setDefaultIuran(parsedData);
    } else {
      fetchData();
    }
  }, []);

  
  // Fungsi untuk memanggil API dan mendapatkan data saldo sanduka
  const fetchSaldoSanduka = async () => {
    try {
      const response = await GlobalApi.getSaldoSanduka();
      setSaldoAkhir(response.saldo_akhir_sanduka);
      setPemasukan(response.total_masuk);
      setPengeluaran(response.total_keluar);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error fetching saldo sanduka:",
        error.message,
        error.config
      );
      setLoading(false);
    }
  };

  // Mengambil data saat komponen pertama kali di-render
  useEffect(() => {
    fetchSaldoSanduka();
  }, []);

  const fetchSaldoOrganisasi = async () => {
    try {
      const response = await GlobalApi.getSaldoOrganisasi();
      setSaldoAkhirOr(response.saldo_akhir_organisasi);
      setPemasukanOr(response.total_masuk);
      setPengeluaranOr(response.total_keluar);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error fetching saldo Organisasi:",
        error.message,
        error.config
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaldoOrganisasi();
  }, []);

  useEffect(() => {
    const date = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString("id-ID", options);

    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

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

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getVisiblePages = () => {
    const range = 2; // Number of pages to show on each side of current page
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    // Adjust start and end to always show a consistent number of pages if possible
    if (end - start < range * 2) {
      if (start === 1) {
        end = Math.min(totalPages, start + range * 2);
      } else if (end === totalPages) {
        start = Math.max(1, end - range * 2);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
          <div className="min-h-screen bg-gray-50 p-2 md:p-2">
            {role === "SUPER ADMIN" && (
              <>
                <nav className="container mt-8 -ml-8 sm:-ml-4">
                  <ul className="flex flex-wrap space-x-2 md:space-x-6">
                    <li>
                      <Link
                        href="/keuangan/data-utama"
                        className="text-gray-700 hover:text-teal-600"
                      >
                        Data Utama
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/keuangan/sanduka"
                        className="text-gray-700 hover:text-teal-600"
                      >
                        Sanduka
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/keuangan/organisasi"
                        className="text-gray-700 hover:text-teal-600"
                      >
                        Organisasi
                      </Link>
                    </li>
                  </ul>
                </nav>
              </>
            )}

            <main className=" mx-auto w-full bg-white shadow-lg rounded-lg ">
              {role === "SUPER ADMIN" && (
                <>
                  <div className="text-center md:mx-6 my-4 md:my-0">
                    <h4 className="text-xl md:text-2xl font-extrabold">
                      SALDO
                    </h4>
                    <p className="text-md md:text-base text-gray-600">
                      {currentDate}
                    </p>
                  </div>
                  <div className="flex flex-row flex-wrap justify-center items-center mb-8">
                    {/* Section 1 */}
                    <div className="w-1/2 flex flex-col items-center">
                      <Image
                        src="/sanduka.png"
                        width={100}
                        height={100}
                        className="w-24 sm:w-28"
                        alt="Sanduka"
                      />
                      {loading ? (
                        <p className="text-sm font-semibold text-gray-800 text-center w-full">
                          Loading...
                        </p>
                      ) : (
                        <>
                          {/* Saldo Akhir */}
                          <p className="text-sm font-semibold text-gray-800 text-center w-full">
                            Rp. {saldoAkhir}
                          </p>
                          <div className="mt-1 bg-gray-50 p-4 rounded-lg w-full max-w-md">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {/* Pemasukan */}
                              <div className="text-center w-full">
                                <h6 className="font-bold text-green-700">
                                  PEMASUKAN
                                </h6>
                                <p className="text-sm font-semibold text-gray-800">
                                  Rp. {pemasukan}
                                </p>
                              </div>
                              {/* Pengeluaran */}
                              <div className="text-center w-full">
                                <h6 className="font-bold text-red-700 ">
                                  PENGELUARAN
                                </h6>
                                <p className="text-sm font-semibold text-gray-800">
                                  Rp. {pengeluaran}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Section 2 */}
                    <div className="w-1/2 flex flex-col items-center">
                      <Image
                        src="/logo.png"
                        width={100}
                        height={100}
                        className="w-10 sm:w-14"
                        alt="Organisasi"
                      />
                      <p className="text-xs font-semibold text-gray-800 mt-4 text-center w-full">
                        Rp. {saldoAkhirOr}
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="text-center w-full">
                            <h6 className="font-bold text-green-700">
                              PEMASUKAN
                            </h6>
                            <p className="text-sm font-semibold text-gray-800">
                              Rp. {pemasukanOr}
                            </p>
                          </div>
                          <div className="text-center w-full">
                            <h6 className="font-bold text-red-700">
                              PENGELUARAN
                            </h6>
                            <p className="text-sm font-semibold text-gray-800">
                              Rp. {pengeluaranOr}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="overflow-x-auto mt-10">
                <table className="container w-full table-auto mb-8">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="p-2 md:p-3 border text-sm">No</th>
                      <th className="p-2 md:p-3 border text-sm">Cabang</th>
                      <th className="p-2 md:p-3 border text-sm">
                        Kurang Setor
                      </th>
                      <th className="p-2 md:p-3 border text-sm">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageData().map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center text-sm">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-2 md:p-3 border text-sm">
                          {item.cabang}
                        </td>
                        <td className="p-2 md:p-3 border text-center text-sm">
                          {item.kurangSetor.toFixed(2)}
                        </td>
                        <td className="p-2 md:p-3 border text-center text-sm">
                          <Link
                            href="/keuangan/home/detail"
                            className="text-blue-500"
                          >
                            <Button>Detail</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="flex justify-center mt-4 mb-4 gap-1">
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
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
