import React from "react";
import Link from "next/link";
import Image from "next/image";

function LayananKami() {
  return (
    <div
      id="layananKamiSection"
      className="container mx-auto p-4 pt-6 md:p-6 lg:p-12"
    >
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-center">
        Layanan Kami
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 justify-center">
        {/* Registrasi Card */}
        <Link
          href="/create-account/syarat-ketentuan"
          className="bg-white rounded-lg shadow-lg p-4 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center text-center border border-gray-200 w-full"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/registrasi.png"
              width={50}
              height={50}
              alt="registrasi"
              className="object-contain mb-4"
            />
            <h4 className="text-sm md:text-base lg:text-lg font-semibold mb-4">
              Registrasi
            </h4>
          </div>
        </Link>

        {/* Cari Anggota Card */}
        <Link
          href="/anggota/cari-anggota"
          className="bg-white rounded-lg shadow-lg p-4 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center text-center border border-gray-200 w-full"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/search.png"
              width={50}
              height={50}
              alt="search"
              className="object-contain mb-4"
            />
            <h4 className="text-sm md:text-base lg:text-lg font-semibold mb-4">
              Cari Anggota
            </h4>
          </div>
        </Link>

        {/* Bantuan Card */}
        <Link
          href="/bantuan"
          className="bg-white rounded-lg shadow-lg p-4 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center text-center border border-gray-200 w-full"
        >
          <div className="flex flex-col items-center text-gray-700">
            <Image
              src="/bantuan.png"
              width={50}
              height={50}
              alt="bantuan"
              className="object-contain mb-4"
            />
            <h4 className="text-sm md:text-base lg:text-lg font-semibold mb-4">
              Bantuan
            </h4>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default LayananKami;
