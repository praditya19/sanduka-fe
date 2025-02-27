"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";

const page = () => {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

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
    <div
      className="min-h-svh flex flex-col bg-contain bg-no-repeat"
      style={{ backgroundImage: "url('/banner_fix.jpeg')" }}
    >
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-0 md:ml-64" : "ml-0"
          }`}
        >
          <div className="py-8 md:py-12">
            <div className="container mx-auto px-4 mt-6 md:mt-12 md:px-6 lg:px-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-500">
                Informasi Santunan Duka Cita
              </h2>

              <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
                {/* Chat bubble 1 */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-indigo-600 p-2 rounded-full">
                      <Image
                        src="/1.png"
                        alt="Apa itu Sanduka"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-2xl p-3 rounded-tl-none max-w-xs md:max-w-md">
                    <h4 className="font-bold text-teal-500 mb-1 text-2xl">
                      Apa itu Sanduka?
                    </h4>
                  </div>
                </div>

                {/* Response bubble 1 */}
                <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
                  <div className="bg-teal-500 text-white rounded-2xl p-3 rounded-tr-none max-w-xs md:max-w-md text-2xl">
                    <p>
                      Sanduka adalah santunan duka cita bagi anggota PGRI Aktif
                      yang terdaftar di dalam database keanggotaan PGRI
                      Kabupaten Jepara sebagai wujud solidaritas.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-white p-2 rounded-full border border-indigo-200 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Chat bubble 2 */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-indigo-600 p-2 rounded-full">
                      <Image
                        src="/2.png"
                        alt="Berapa Sumbangan Anggota"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-2xl p-3 rounded-tl-none max-w-xs md:max-w-md">
                    <h4 className="font-bold text-teal-500 mb-1 text-2xl">
                      Berapa Sumbangan Anggota?
                    </h4>
                  </div>
                </div>

                {/* Response bubble 2 */}
                <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
                  <div className="bg-teal-500 text-white rounded-2xl p-3 rounded-tr-none max-w-xs md:max-w-md text-2xl">
                    <p>
                      Berdasarkan surat keputusan Pengurus PGRI Kabupaten Jepara
                      nomor :034/SK/PGRI JPR/XXII/2020 tentang Teknis
                      Pelaksanaan Dana Setia Kawan Duka PGRI Kabupaten Jepara,
                      sumbangan Sanduka ditetapkan sebesar Rp. 3000 tiap
                      anggota, dibayarkan tiap bulan, bersamaan dengan iuran
                      anggota PGRI.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-white p-2 rounded-full border border-indigo-200 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Chat bubble 3 */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-indigo-600 p-2 rounded-full">
                      <Image
                        src="/3.png"
                        alt="Berapa Santunan yang Diterima"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-2xl p-3 rounded-tl-none max-w-xs md:max-w-md">
                    <h4 className="font-bold text-teal-500 mb-1 text-2xl">
                      Berapa Santunan yang Diterima?
                    </h4>
                  </div>
                </div>

                {/* Response bubble 3 */}
                <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
                  <div className="bg-teal-500 text-white rounded-2xl p-3 rounded-tr-none max-w-xs md:max-w-md text-2xl">
                    <p>
                      Sesuai keputusan bersama Pengurus PGRI Kabupaten Jepara
                      dan Pengurus Cabang se-Kabupaten Jepara, maka disepakati
                      sebesar Rp.2.500.000,- dengan kuota 5 orang tiap bulan dan
                      apabila anggota meninggal lebih daripada kuota akan
                      diperhitungkan pada bulan berikutnya.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-white p-2 rounded-full border border-indigo-200 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Chat bubble 4 */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-indigo-600 p-2 rounded-full">
                      <Image
                        src="/4.png"
                        alt="Bagaimana Cara Pengajuannya"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-2xl p-3 rounded-tl-none max-w-xs md:max-w-md">
                    <h4 className="font-bold text-teal-500 mb-1 text-2xl">
                      Bagaimana Cara Pengajuannya?
                    </h4>
                  </div>
                </div>

                {/* Response bubble 4 */}
                <div className="flex flex-col md:flex-row justify-end gap-2">
                  <div className="bg-teal-500 text-white rounded-2xl p-3 rounded-tr-none max-w-xs md:max-w-md text-2xl">
                    <p>
                      Pengurus Cabang melaporkan kematian anggotanya secara
                      online melalui aplikasi sanduka.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start">
                    <div className="bg-white p-2 rounded-full border border-indigo-200 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document links section */}
              <div className="mt-10 mb-6 px-4">
                <h3 className="text-xl font-semibold text-center text-indigo-800 mb-6">
                  Dokumen Terkait
                </h3>
                <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
                  <Link
                    href="https://drive.google.com/file/d/1nvGIjmPZHRs8G1dsMAl8Q9ljaGYiIMrq/view?usp=drive_link"
                    legacyBehavior
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 w-64"
                    >
                      <div className="text-indigo-600 mb-3">
                        <FontAwesomeIcon icon={faFilePdf} size="3x" />
                      </div>
                      <span className="text-center font-medium text-indigo-800">
                        Surat Keputusan Sanduka
                      </span>
                      <span className="text-xs text-gray-500 mt-2">
                        Klik untuk mengunduh
                      </span>
                    </a>
                  </Link>

                  <Link
                    href="https://drive.google.com/file/d/1JUVCRGX7hyc_MyicfSowfcfdLt2JMFDI/view?usp=drive_link"
                    legacyBehavior
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 w-64"
                    >
                      <div className="text-indigo-600 mb-3">
                        <FontAwesomeIcon icon={faFilePdf} size="3x" />
                      </div>
                      <span className="text-center font-medium text-indigo-800">
                        Surat Edaran Sanduka
                      </span>
                      <span className="text-xs text-gray-500 mt-2">
                        Klik untuk mengunduh
                      </span>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
