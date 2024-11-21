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
  { cabang: "BANGSRI", kurangSetor: 1000.0 },
  { cabang: "BATEALIT", kurangSetor: 1000.0 },
  { cabang: "CABSUS DINAS PENDIDIKAN", kurangSetor: 1000.0 },
  { cabang: "CABSUS IGTKI", kurangSetor: 1000.0 },
  { cabang: "DONOROJO", kurangSetor: 1000.0 },
  { cabang: "JEPARA", kurangSetor: 1000.0 },
  { cabang: "KALINYAMATAN", kurangSetor: 1000.0 },
  { cabang: "KARIMUNJAWA", kurangSetor: 1000.0 },
  { cabang: "KEDUNG", kurangSetor: 1000.0 },
  { cabang: "KELING", kurangSetor: 1000.0 },
  { cabang: "KEMBANG", kurangSetor: 1000.0 },
  { cabang: "MAYONG", kurangSetor: 1000.0 },
  { cabang: "MLONGGO", kurangSetor: 1000.0 },
  { cabang: "NALUMSARI", kurangSetor: 1000.0 },
  { cabang: "PAKIS AJI", kurangSetor: 1000.0 },
  { cabang: "PECANGAAN", kurangSetor: 1000.0 },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState("");

  const [saldoAkhir, setSaldoAkhir] = useState("");
  const [pemasukan, setPemasukan] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [saldoAkhirOr, setSaldoAkhirOr] = useState("");
  const [pemasukanOr, setPemasukanOr] = useState("");
  const [pengeluaranOr, setPengeluaranOr] = useState("");
  const [loading, setLoading] = useState(true);

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
          
            <main className=" mx-auto w-full bg-white shadow-lg rounded-lg ">
              <div className="text-center md:mx-6 my-4 md:my-0">
                <h4 className="text-xl md:text-2xl font-extrabold">SALDO</h4>
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
                        <h6 className="font-bold text-green-700">PEMASUKAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          Rp. {pemasukanOr}
                        </p>
                      </div>
                      <div className="text-center w-full">
                        <h6 className="font-bold text-red-700">PENGELUARAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          Rp. {pengeluaranOr}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="container w-full table-auto mb-8">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="p-2 md:p-3 border text-sm">No</th>
                      <th className="p-2 md:p-3 border text-sm">Cabang</th>
                      <th className="p-2 md:p-3 border text-sm">Kurang Setor</th>
                      <th className="p-2 md:p-3 border text-sm">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center text-sm">
                          {index + 1}
                        </td>
                        <td className="p-2 md:p-3 border text-sm">{item.cabang}</td>
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
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}