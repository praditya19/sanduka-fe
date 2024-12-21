"use client";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Link from "next/link";
import Sidebar from "@/app/_components/Sidebar";

const Page = () => {
  const [daspenData, setDaspenData] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const anggotaId = sessionStorage.getItem("userId");
      if (anggotaId) {
        try {
          const response = await GlobalApi.getUserById(anggotaId);
          if (response) {
            const nip = response.nip;
            if (nip) {
              const fileResponse = await GlobalApi.getFileByNip(nip);
              if (fileResponse) {
                setDaspenData(fileResponse);
              } else {
                console.log("File tidak ditemukan untuk NIP:", nip);
                setError("File tidak ditemukan untuk NIP tersebut.");
              }
            } else {
              console.log("NIP tidak ditemukan dalam data anggota");
              setError("NIP tidak ditemukan dalam data anggota.");
            }
          } else {
            console.log("Data anggota tidak ditemukan");
            setError("Data anggota tidak ditemukan.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Terjadi kesalahan saat mengambil data.");
        }
      } else {
        console.log("Anggota ID tidak ditemukan di sessionStorage");
        setError("Anggota ID tidak ditemukan di sessionStorage.");
      }
    };

    fetchData();
  }, []);

  const calculateAge = (birthDate) => {
    if (!birthDate) return "Tidak tersedia";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return `${age} tahun`;
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

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return daspenData ? (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="bg-white p-5 rounded-md w-5/12 mt-4 sm:mt-0 max-h-[88vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Data Daspen</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Nama Anggota:</p>
            <p>{daspenData.namaAnggota || "Tidak tersedia"}</p>
          </div>
          <div>
            <p className="font-semibold">Kategori Daspen:</p>
            <p>{daspenData.kategoriDaspen || "Tidak tersedia"}</p>
          </div>
          <div>
            <p className="font-semibold">Tanggal Lahir:</p>
            <p>
              {" "}
              {daspenData.tanggalLahir
                ? new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(daspenData.tanggalLahir))
                : "Tidak tersedia"}
            </p>
          </div>

          <div>
            <p className="font-semibold">Usia:</p>
            <p>{calculateAge(daspenData.tanggalLahir)}</p>
          </div>
          <div>
            <p className="font-semibold">NIP:</p>
            <p>{daspenData.nip || "Tidak tersedia"}</p>
          </div>
          <div>
            <p className="font-semibold">Mulai Jadi Anggota:</p>
            <p>
              {daspenData.mulaiJadiAnggotaDaspen
                ? new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(daspenData.mulaiJadiAnggotaDaspen))
                : "Tidak tersedia"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Kelompok Jabatan:</p>
            <p>{daspenData.kelompokJabatan || "-"}</p>
          </div>
          <div>
            <p className="font-semibold">Prediksi Pensiun:</p>
            <p>
              {daspenData.prediksiPensiun
                ? (() => {
                    const prediksiPensiunDate = new Date(
                      daspenData.prediksiPensiun
                    );

                    prediksiPensiunDate.setMonth(
                      prediksiPensiunDate.getMonth() + 1
                    );

                    return new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(prediksiPensiunDate);
                  })()
                : "Tidak tersedia"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Sumbangan:</p>
            <p>
              {daspenData.sumbangan
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(daspenData.sumbangan)
                : "Tidak tersedia"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Untuk Lihat Data Lengkap:</p>
            <div className="flex items-center">
              <p className="text-sm mr-1">Link Website:</p>
              <Link
                href="https://www.dansetjateng.org/"
                className="text-blue-400"
                target="_blank"
              >
                www.dansetjateng.org
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )  : (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
    <div className="bg-white p-5 rounded-md w-5/12 mt-4 sm:mt-0 text-center">
      <h2 className="text-xl font-bold text-red-500">Data belum tersinkronkan</h2>
      <p className="mt-4">Silakan coba lagi atau hubungi administrator jika masalah berlanjut.</p>
      <button 
        onClick={() => window.location.href = '/home'}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Kembali ke Halaman Home
      </button>
    </div>
  </div>
  );
};

export default Page;
