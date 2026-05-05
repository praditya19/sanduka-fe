"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState(4);

  useEffect(() => {
    if (!router.isReady) return;
    const queryStep = parseInt(router.query?.step) || 4;
    setStep(queryStep);
  }, [router.isReady, router.query]);

  const handleNavigation = (targetStep) => {
    router.push(`/tunggu-admin?step=${targetStep}`);
    setStep(targetStep);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Alur Langkah */}
      <div className="w-full mx-auto overflow-x-auto mt-6">
        <div className="flex flex-row items-center justify-start space-x-2 sm:space-x-4 whitespace-nowrap px-4 mb-1">
          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${
              step === 1
                ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
            }`}
            // onClick={() => handleNavigation(1)}
          >
            1. SYARAT & KETENTUAN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${
              step === 2
                ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
            }`}
            // onClick={() => handleNavigation(2)}
          >
            2. DATA PRIBADI
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${
              step === 3
                ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
            }`}
            // onClick={() => handleNavigation(3)}
          >
            3. DATA PEKERJAAN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${
              step === 4
                ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
            }`}
            onClick={() => handleNavigation(4)}
          >
            4. MENUNGGU VERIFIKASI ADMIN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${
              step === 5
                ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
            }`}
            // onClick={() => handleNavigation(5)}
          >
            5. SELESAI
          </div>
        </div>
      </div>

      {/* Konten Registrasi */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <img
              src="/sanduka.png"
              alt="Registrasi Berhasil"
              className="w-100 h-24 mx-auto"
            />
          </div>

          <h1 className="text-4xl font-bold text-teal-600 mb-4">
            Registrasi Berhasil
          </h1>
          <p className="text-gray-700 mb-6">
            Menunggu Verifikasi dari Admin. Harap cek kembali secara berkala.
          </p>

          <Link href="/">
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
              Pergi ke Halaman Masuk
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
