"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex flex-row items-center justify-center space-x-2 sm:space-x-4 -mt-36">
        <div
          className={`py-2 px-4 rounded-full transition duration-300 text-sm ${
            step === 1
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          onClick={() => handleNavigation(1)}
        >
          1. SYARAT & KETENTUAN
        </div>

        <hr className="border-t-2 border-gray-400 w-24 mx-2 sm:w-24 md:w-32" />

        <div
          className={`py-2 px-4 rounded-full transition duration-300 text-xs ${
            step === 2
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          onClick={() => handleNavigation(2)}
        >
          2. DATA PRIBADI
        </div>

        <hr className="border-t-2 border-gray-400 w-24 mx-2 sm:w-24 md:w-32" />

        <div
          className={`py-2 px-4 rounded-full transition duration-300 text-xs ${
            step === 3
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          onClick={() => handleNavigation(3)}
        >
          3. DATA PEKERJAAN
        </div>

        <hr className="border-t-2 border-gray-400 w-24 mx-2 sm:w-24 md:w-32" />

        <div
          className={`py-2 px-4 rounded-full transition duration-300 text-xs ${
            step === 4
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          onClick={() => handleNavigation(4)}
        >
          4. MENUNGGU ACC ADMIN
        </div>

        <hr className="border-t-2 border-gray-400 w-24 mx-2 sm:w-24 md:w-32" />

        <div
          className={`py-2 px-4 rounded-full transition duration-300 text-xs ${
            step === 5
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          onClick={() => handleNavigation(5)}
        >
          5. SELESAI
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-40">
        <div className="mb-4">
          <img
            src="/sanduka.png"
            alt="Registrasi Berhasil"
            className="w-100 h-24 mx-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-teal-600 mb-4">
          Registrasi Berhasil
        </h1>
        <p className="text-gray-700 mb-6">
          Menunggu ACC dari Admin. Harap cek kembali secara berkala.
        </p>

        <button
          onClick={handleSignIn}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Pergi ke Halaman Masuk
        </button>
      </div>
    </div>
  );
};

export default Page;
