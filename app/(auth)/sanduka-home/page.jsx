"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle, ChevronDown, CheckCircle, XCircle, User, Building, Briefcase } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";
import Header from "@/app/_components/Header";

function SandukaHome() {
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && npaPgri) {
      onSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 max-w-md md:max-w-xl lg:max-w-3xl">
        <Header />

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 pt-12 md:pt-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 mb-6 shadow-lg">
            <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
            Pusat Layanan Anggota
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-700">
              Sanduka PGRI
            </span>
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Cari data keanggotaan, registrasi, dan bantuan dalam satu platform terpadu
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center bg-white rounded-xl shadow-lg p-5 border border-teal-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-teal-200"
            onClick={toggleMenu}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100">
                <Search className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">
                  Cari Data Anggota
                </h3>
                <p className="text-sm text-gray-500">Masukkan NPA PGRI untuk memverifikasi keanggotaan</p>
              </div>
            </div>
            <ChevronDown
              className={`w-6 h-6 text-teal-600 transition-transform duration-300 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isMenuOpen && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 mt-4 animate-fadeIn">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl md:text-2xl text-gray-800 mb-2">
                  Cari Keanggotaan Sanduka
                </h2>
                <p className="text-gray-500">Masukkan NPA PGRI Anda untuk verifikasi</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Contoh: 33212345"
                    value={npaPgri}
                    onChange={(e) => setNpa(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 py-6 text-base rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <Button
                  onClick={onSearch}
                  disabled={!npaPgri || loader}
                  className="w-full py-6 text-base font-medium bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loader ? (
                    <>
                      <LoaderIcon className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Cari Data Anggota
                      <Search className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Results Section */}
              <div className="mt-6">
                {error && (
                  <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="ml-2 font-semibold">{error}</AlertTitle>
                  </Alert>
                )}

                {filteredMember && (
                  <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl shadow-lg p-6 border border-teal-100">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-3">
                        <User className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-800 mb-1">
                        Data Ditemukan
                      </h3>
                      <p className="text-sm text-gray-500">Informasi keanggotaan Sanduka</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                        <User className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Nama Lengkap</p>
                          <p className="font-semibold text-gray-800">{filteredMember.namaLengkap}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                        <Building className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Unit Kerja</p>
                          <p className="font-semibold text-gray-800">{filteredMember.unitKerja}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                        <Briefcase className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Jabatan</p>
                          <p className="font-semibold text-gray-800">{filteredMember.jabatan}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                        {filteredMember.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Status Sanduka</p>
                          <div className="flex items-center">
                            <span className={`font-semibold ${filteredMember.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                              {filteredMember.isVerified ? 'Terdaftar' : 'Belum Terdaftar'}
                            </span>
                            {filteredMember.isVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={clearResults}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Tutup Hasil
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Layanan Tersedia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Link
              href="/create-account/syarat-ketentuan"
              className="group bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 hover:border-teal-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-100 mb-4 group-hover:from-blue-100 group-hover:to-cyan-200 transition-all duration-300">
                  <Image
                    src="/registrasi.png"
                    width={40}
                    height={40}
                    alt="registrasi"
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                  Registrasi Anggota
                </h4>
                <p className="text-sm text-gray-600">
                  Daftarkan diri Anda sebagai anggota Sanduka PGRI
                </p>
                <div className="mt-4 text-teal-600 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Mulai registrasi
                  <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
                </div>
              </div>
            </Link>

            <Link
              href="/bantuan/all"
              className="group bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 hover:border-teal-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-orange-50 to-amber-100 mb-4 group-hover:from-orange-100 group-hover:to-amber-200 transition-all duration-300">
                  <Image
                    src="/bantuan.png"
                    width={40}
                    height={40}
                    alt="bantuan"
                    className="object-contain"
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                  Pusat Bantuan
                </h4>
                <p className="text-sm text-gray-600">
                  Temukan solusi dan panduan penggunaan layanan
                </p>
                <div className="mt-4 text-teal-600 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat bantuan
                  <ChevronDown className="w-4 h-4 ml-1 rotate-270" />
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>

      {/* Tambahkan animasi CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
      `}</style>
    </div>
  );
}

export default SandukaHome;