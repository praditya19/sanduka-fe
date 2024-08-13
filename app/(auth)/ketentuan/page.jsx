"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { faArrowLeft, faBars } from "@fortawesome/free-solid-svg-icons";

const page = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };
  return (
    <div>
      <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
        <div className="container mx-auto flex items-center justify-between">
          {/* Back Button and Title */}
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="sm"
              onClick={handleBackClick}
              className="cursor-pointer mr-2"
            />
            <h1 className="text-base">Ketentuan</h1>
          </div>
        </div>
      </header>
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 mt-12 md:px-12 lg:px-24">
          {/* <h2 className="text-3xl font-bold mb-8 text-center">Ketentuan</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
              <div className="flex items-center mb-2">
                <Image
                  src="/1.png"
                  alt="Apa itu Sanduka"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">APA ITU SANDUKA</h4>
              </div>
              <p className="text-gray-700 text-sm">
                Sanduka adalah santunan duka cita bagi anggota PGRI Aktif yang
                terdaftar di dalam database keanggotaan PGRI Kabupaten Jepara
                sebagai wujud solidaritas.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
              <div className="flex items-center mb-2">
                <Image
                  src="/2.png"
                  alt="Berapa Sumbangan Anggota"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">BERAPA SUMBANGAN ANGGOTA?</h4>
              </div>
              <p className="text-gray-700 text-sm">
                Berdasarkan surat keputusan Pengurus PGRI Kabupaten Jepara nomor
                :034/SK/PGRI JPR/XXII/2020 tentang Teknis Pelaksanaan Dana Setia
                Kawan Duka PGRI Kabupaten Jepara, sumbangan Sanduka ditetapkan
                sebesar Rp. 3000 tiap anggota, dibayarkan tiap bulan, bersamaan
                dengan iuran anggota PGRI.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
              <div className="flex items-center mb-2">
                <Image
                  src="/3.png"
                  alt="Berapa Santunan yang Diterima"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">
                  BERAPA SANTUNAN YANG DITERIMA?
                </h4>
              </div>
              <p className="text-gray-700 text-sm">
                Sesuai keputusan bersama Pengurus PGRI Kabupaten Jepara dan
                Pengurus Cabang se-Kabupaten Jepara, maka disepakati sebesar
                Rp.2.500.000,- dengan kuota 5 orang tiap bulan dan apabila
                anggota meninggal lebih daripada kuota akan diperhitungkan pada
                bulan berikutnya.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg card">
              <div className="flex items-center mb-2">
                <Image
                  src="/4.png"
                  alt="Bagaimana Cara Pengajuannya"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">
                  BAGAIMANA CARA PENGAJUANNYA?
                </h4>
              </div>
              <p className="text-gray-700 text-sm">
                Pengurus Cabang melaporkan kematian anggotanya secara online
                melalui aplikasi sanduka.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-20 mt-8">
          <Link href="/documents/surat-keputusan-sanduka.pdf" legacyBehavior>
            <a className="flex flex-col items-center text-blue-600">
              <FontAwesomeIcon icon={faFilePdf} size="3x" />
              <span className="mt-2 text-center text-sm md:text-base">
                Surat Keputusan Sanduka
              </span>
            </a>
          </Link>
          <Link href="/documents/surat-edaran-sanduka.pdf" legacyBehavior>
            <a className="flex flex-col items-center text-blue-600">
              <FontAwesomeIcon icon={faFilePdf} size="3x" />
              <span className="mt-2 text-center text-sm md:text-base">
                Surat Edaran Sanduka
              </span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
