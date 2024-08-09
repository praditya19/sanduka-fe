import React from "react";
import Link from "next/link";
import Image from "next/image";

function LayananKami() {
  return (
    <div className="container bg-white mx-auto p-4 pt-6 md:p-6 lg:p-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Layanan Kami
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Registrasi Card */}
        <Link
          href="/create-account/syarat-ketentuan"
          className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center text-center"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/registrasi.png"
              width={60}
              height={60}
              alt="registrasi"
              className="object-contain"
            />
            <h4 className="text-base md:text-lg lg:text-xl font-semibold">
              Registrasi
            </h4>
          </div>
        </Link>

        {/* Cari Anggota Card */}
        <Link
          href="/anggota/cari-anggota"
          className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center text-center"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/search.png"
              width={60}
              height={60}
              alt="search"
              className="object-contain"
            />
            <h4 className="text-base md:text-lg lg:text-xl font-semibold">
              Cari Anggota
            </h4>
          </div>
        </Link>

        {/* Bantuan Card */}
        <Link
          href="/bantuan"
          className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center text-center"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/bantuan.png"
              width={60}
              height={60}
              alt="bantuan"
              className="object-contain"
            />
            <h4 className="text-base md:text-lg lg:text-xl font-semibold">
              Bantuan
            </h4>
          </div>
        </Link>

        {/* Lapor Card (Disabled) */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center text-center cursor-not-allowed">
          <div className="flex flex-col items-center text-gray-600">
            <Image
              src="/lapor.jpg"
              width={60}
              height={60}
              alt="bantuan"
              className="object-contain"
            />
            <h4 className="text-base md:text-lg lg:text-xl font-semibold">
              Lapor
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayananKami;
