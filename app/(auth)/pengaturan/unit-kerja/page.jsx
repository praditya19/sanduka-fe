"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars } from "@fortawesome/free-solid-svg-icons";

const AddUnitForm = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

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
            <h1 className="text-base">Master Data</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-6 text-base">
              <li className="cursor-pointer">
                <Link href="/pengaturan/user">User</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/pengaturan/tambah">Tambah Cabang</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/pengaturan/unit-kerja">Unit Kerja</Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden ml-auto" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-teal-700 text-white">
            <ul className="flex flex-col space-y-2 p-4">
              <li className="cursor-pointer">
                <Link href="/keuangan/home">Home</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/data-utama">Data Utama</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/sanduka">Sanduka</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/organisasi">Organisasi</Link>
              </li>
            </ul>
          </div>
        )}
      </header>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
          <h2 className="text-base font-bold mb-4 text-center text-teal-600">
            TAMBAH UNIT KERJA
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="branch"
            >
              Cabang
            </label>
            <select
              id="branch"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>-- Nama Cabang --</option>
              {/* Add options here */}
            </select>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="unit"
            >
              Isi Unit Kerja Tambahan
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Tambah Unit kerja"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              TAMBAH UNIT KERJA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUnitForm;
