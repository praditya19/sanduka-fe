"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";

function LayananKami() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [npaPgri, setNpa] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [filteredMember, setFilteredMember] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const onSearch = async () => {
    setLoader(true);
    setError("");
    try {
      const member = await GlobalApi.cekNpa(npaPgri);

      if (member) {
        const detailedMember = await GlobalApi.getUserById(member.id);
        if (detailedMember) {
          setFilteredMember({
            ...member,
            unitKerja: detailedMember.unitKerja,
            isVerified: detailedMember.isVerified,
          });
          setError("");
        } else {
          setFilteredMember(null);
          setError("Unit Kerja Tidak Ditemukan");
        }
      } else {
        setFilteredMember(null);
        setError("Data Tidak Ditemukan");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Data Tidak Ditemukan");
    } finally {
      setLoader(false);
    }
  };

  const clearResults = () => {
    setFilteredMember(null);
    setNpa("");
    setError("");
  };

  return (
    <div
      id="layananKamiSection"
      className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 max-w-md md:max-w-xl lg:max-w-3xl"
    >
      <div
        className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 border border-gray-200 cursor-pointer"
        onClick={toggleMenu}
      >
        <h3 className="text-sm md:text-base lg:text-xl ">Cari Anggota</h3>
        <h1
          className="transform transition-transform duration-300"
          style={{
            transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: "20px",
          }}
        >
          ⌄
        </h1>
      </div>
      {isMenuOpen && (
        <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg shadow-md mt-6">
          <h2 className="font-bold text-center text-2xl mt-2">
            CARI KEANGGOTAAN SANDUKA
          </h2>
          <h2 className="text-gray-500 mt-2">Masukkan NPA PGRI</h2>
          <div className="w-full max-w-xl mt-6">
            <Input
              placeholder="NPA PGRI"
              value={npaPgri}
              onChange={(e) => setNpa(e.target.value)}
            />
            <Button
              onClick={onSearch}
              disabled={!npaPgri || loader}
              className="w-full mt-4 bg-teal-700"
            >
              {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Cari"}{" "}
              <span className="ml-2">
                <Search />
              </span>
            </Button>
          </div>
          <div className="mt-4 w-full max-w-xl">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div className="mt-1">
                  <AlertTitle>{error}</AlertTitle>
                </div>
              </Alert>
            )}
            {filteredMember && (
              <div className="p-4 border border-green-200 rounded-lg shadow-md">
                <h3 className="font-bold text-center text-lg mb-2">
                  HASIL PENCARIAN DATA
                </h3>
                <p>
                  <strong>Nama :</strong> {filteredMember.namaLengkap}
                </p>
                <p>
                  <strong>Unit Kerja :</strong> {filteredMember.unitKerja}
                </p>
                <p>
                  <strong>Jabatan :</strong> {filteredMember.jabatan}
                </p>
                <p className="flex items-center">
                  <strong>Terdaftar Sanduka:</strong>
                  {filteredMember.isVerified ? (
                    <span className="text-green-500 ml-2">✔</span>
                  ) : (
                    <span className="text-red-500 ml-2">✘</span>
                  )}
                </p>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={clearResults}
                    className="bg-red-600 text-white"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 justify-center">
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

        {/* <Link
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
          </Link> */}

        <Link
          href="/bantuan/all"
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
