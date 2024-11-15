"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faCancel,
  faCheck,
  faLocation,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

export default function ReportCard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [laporan, setLaporan] = useState(null);
  const [isBatal, setIsBatal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GlobalApi.getDataLapor();
        setDataList(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleBatalClick = async () => {
    const laporanId = sessionStorage.getItem("idTerlapor");

    if (!laporanId) {
      console.error("ID Terlapor tidak ditemukan di sessionStorage");
      return;
    }

    try {
      // Menghapus data laporan
      await GlobalApi.batalLaporanById(laporanId);

      // Tampilkan notifikasi toast
      toast.success("Laporan berhasil dibatalkan!");

      // Hapus laporan dari dataList untuk menghilangkan card
      setDataList((prevDataList) =>
        prevDataList.filter((data) => data.id !== laporanId)
      );

      // Reset laporan setelah dihapus
      setLaporan(null);

      // Reload halaman setelah 2 detik
      setTimeout(() => {
        window.location.reload(); // Reload halaman
      }, 2000);
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      toast.error("Gagal membatalkan laporan.");
    }
  };

  const handleVerifikasiClick = async () => {
    const laporanId = sessionStorage.getItem("idTerlapor");
    if (!laporanId) {
      console.error("ID Terlapor tidak ditemukan di sessionStorage");
      return;
    }
  
    // Mengambil tanggal saat ini
    const currentDate = new Date();
    const tanggalSantunan = currentDate.toISOString().split("T")[0]; // Format: yyyy-mm-dd
  
    const newTanggalSantunan = {
      tanggalSantunan: tanggalSantunan, // Tanggal saat ini
    };
  
    try {
      // Panggil API untuk memperbarui tanggal santunan
      await GlobalApi.verifikasiLaporanById(laporanId, newTanggalSantunan);
  
      // Tampilkan notifikasi toast
      toast.success("Data Berhasil Terkonfirmasi!");
  
      // Hapus data setelah 2 detik
      setTimeout(() => {
        setDataList((prevDataList) => prevDataList.filter((_, index) => index !== currentSlide));
      }, 2000);
    } catch (error) {
      // Menangani error jika ada
      console.error("Terjadi kesalahan:", error);
      toast.error("Gagal Mengkonfirmasi!");
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const daysOfWeek = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const dayName = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === dataList.length - 1 ? 0 : prevSlide + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [dataList]);

  return (
    <div className="relative max-w-sm mx-auto bg-white shadow-lg rounded-2xl overflow-hidden my-6 border border-gray-300">
   <Toaster
            toastOptions={{
              style: {
                fontSize: "1.25rem", // Ukuran font yang lebih besar
                padding: "16px", // Menambah padding jika diperlukan
              },
              success: {
                style: {
                  background: "white", // Warna background hijau untuk pesan sukses
                  color: "black",
                },
              },
              error: {
                style: {
                  background: "#f44336", // Warna background merah untuk pesan error
                  color: "#fff",
                },
              },
            }}
          />
      <div className="relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-2 py-2">
          {dataList.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? "bg-blue-500" : "bg-gray-400"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

     
      <div className="p-4 bg-gray-50">
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-center rounded-xl mb-4 relative">
          <div className="flex justify-center mb-2">
            <img
              src="https://via.placeholder.com/80"
              width={80}
              height={80}
              alt="Profile"
              className="rounded-full border-2 border-white shadow-md"
            />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            {dataList[currentSlide]?.namaLengkap}
          </h2>
          <p className="text-xs font-medium text-white">
            Meninggal{" "}
            {formatDate(dataList[currentSlide]?.waktuMeninggalTerlapor)}
          </p>
        </div>
        <div className="text-center text-gray-700 mb-3 space-y-1">
          <p>{dataList[currentSlide]?.npaPgri || "N/A"}</p>
          <p>
            {dataList[currentSlide]?.tempatLahir},{" "}
            {formatDate(dataList[currentSlide]?.tanggalLahir)}
          </p>
          <p>{dataList[currentSlide]?.jabatan}</p>
          <p>{dataList[currentSlide]?.unitKerja}</p>
          <p>{dataList[currentSlide]?.cabang}</p>
          <p>{dataList[currentSlide]?.alamat}</p>
        </div>
        <p className="text-center text-gray-600 mb-4 font-medium">Catatan :{ dataList[currentSlide]?.keteranganTerlapor }</p>
        <div className="flex justify-around mb-4">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
            <FontAwesomeIcon icon={faLocation} className="mr-2" /> Lokasi
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-full transition duration-300"
            onClick={handleBatalClick}>
            <FontAwesomeIcon icon={faCancel} className="mr-2" /> Batal
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded-full transition duration-300"
          onClick={handleVerifikasiClick}
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" /> Verifikasi
          </button>
        </div>
        <div className="bg-blue-700 text-white font-medium py-2 px-4 rounded-full text-center flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faBullhorn} className="mr-2" /> PELAPOR
        </div>
        <p className="text-center text-gray-600 mt-2 text-sm">
          {formatDate(dataList[currentSlide]?.tanggalPelaporan)},{" "}
          {dataList[currentSlide]?.jamLapor}
        </p>
        <p className="text-center text-gray-600 text-sm">
          {dataList[currentSlide]?.namaPelapor || "N/A"}
        </p>
        <p className="text-center text-gray-600 text-sm">
          📞 {dataList[currentSlide]?.nomorHpPelapor || "N/A"}
        </p>
      </div>
    </div>
  );
}
