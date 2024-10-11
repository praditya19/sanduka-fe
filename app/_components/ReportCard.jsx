"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faCancel,
  faCheck,
  faLocation,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

export default function ReportCard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dataList, setDataList] = useState([]);
  // const dataList = [
  //   {
  //     id: 1,
  //     nama: "John Doe",
  //     nma: "12320200465",
  //     tempat_tanggal_lahir: "Jepara, 14-03-1968",
  //     jabatan: "Guru",
  //     unit_kerja: "SMPN 2 PECANGAAN",
  //     cabang: "PECANGAAN",
  //     alamat: "PECANGAAN KULON RT.02/II PECANGAAN",
  //     meninggal: "Meninggal Kamis, 12-08-2024",
  //   },
  //   {
  //     id: 2,
  //     nama: "Jane Smith",
  //     nma: "67890123456",
  //     tempat_tanggal_lahir: "Semarang, 15-04-1975",
  //     jabatan: "Kepala Sekolah",
  //     unit_kerja: "SMPN 1 SEMARANG",
  //     cabang: "SEMARANG",
  //     alamat: "SEMARANG KULON RT.03/III SEMARANG",
  //     meninggal: "Meninggal Jumat, 13-08-2024",
  //   },
  //   {
  //     id: 3,
  //     nama: "Alice Johnson",
  //     nma: "34567890123",
  //     tempat_tanggal_lahir: "Solo, 01-01-1980",
  //     jabatan: "Staff Administrasi",
  //     unit_kerja: "SMPN 3 SOLO",
  //     cabang: "SOLO",
  //     alamat: "SOLO KULON RT.01/I SOLO",
  //     meninggal: "Meninggal Sabtu, 14-08-2024",
  //   },
  // ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GlobalApi.getDataLapor();
        setDataList(data);
        console.log(data); // Menampilkan data di console
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      {/* Slider */}
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

      {/* Content */}
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
        <p className="text-center text-gray-600 mb-4 font-medium">Catatan :</p>
        <div className="flex justify-around mb-4">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
          <FontAwesomeIcon icon={faLocation} className="mr-2" /> Lokasi
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
          <FontAwesomeIcon icon={faCancel} className="mr-2" />  Batal
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
          <FontAwesomeIcon icon={faCheck} className="mr-2" />  Verifikasi
          </button>
        </div>
        <div className="bg-blue-700 text-white font-medium py-2 px-4 rounded-full text-center flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={faBullhorn} className="mr-2" /> PELAPOR
        </div>
        <p className="text-center text-gray-600 mt-2 text-sm">
          {formatDate(dataList[currentSlide]?.tanggalPelaporan)}, {" "}
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
    // <div className="relative max-w-sm mx-auto bg-white shadow-lg rounded-2xl overflow-hidden my-6 border border-gray-300">
    //   {/* Slider */}
    //   <div className="relative overflow-hidden">
    //     <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-2 py-2">
    //       {dataList.map((_, index) => (
    //         <button
    //           key={index}
    //           className={`w-3 h-3 rounded-full ${
    //             currentSlide === index ? "bg-blue-500" : "bg-gray-400"
    //           }`}
    //           onClick={() => setCurrentSlide(index)}
    //         />
    //       ))}
    //     </div>
    //   </div>

    //   {/* Content */}
    //   <div className="p-4 bg-gray-50">
    //     <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-center rounded-xl mb-4 relative">
    //       <div className="flex justify-center mb-2">
    //         <Image
    //           src="https://via.placeholder.com/80"
    //           width={80}
    //           height={80}
    //           alt="Profile"
    //           className="rounded-full border-2 border-white shadow-md"
    //         />
    //       </div>
    //       <h2 className="text-lg font-bold text-white mb-1">
    //         {dataList[currentSlide].nama}
    //       </h2>
    //       <p className="text-xs font-medium text-white">
    //         {dataList[currentSlide].meninggal}
    //       </p>
    //     </div>
    //     <div className="text-center text-gray-700 mb-3 space-y-1">
    //       <p>{dataList[currentSlide].nma}</p>
    //       <p>{dataList[currentSlide].tempat_tanggal_lahir}</p>
    //       <p>{dataList[currentSlide].jabatan}</p>
    //       <p>{dataList[currentSlide].unit_kerja}</p>
    //       <p>{dataList[currentSlide].cabang}</p>
    //       <p>{dataList[currentSlide].alamat}</p>
    //     </div>
    //     <p className="text-center text-gray-600 mb-4 font-medium">Catatan :</p>
    //     <div className="flex justify-around mb-4">
    //       <Button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
    //         <FontAwesomeIcon icon={faLocation} className="mr-2" /> Lokasi
    //       </Button>
    //       <Button className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
    //         <FontAwesomeIcon icon={faCancel} className="mr-2" /> Batal
    //       </Button>
    //       <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
    //         <FontAwesomeIcon icon={faCheck} className="mr-2" /> Verifikasi
    //       </Button>
    //     </div>
    //     <div className="bg-blue-700 text-white font-medium py-2 px-4 rounded-full text-center flex items-center justify-center mb-4">
    //       <FontAwesomeIcon icon={faBullhorn} className="mr-2" /> PELAPOR
    //     </div>
    //     <p className="text-center text-gray-600 mt-2 text-sm">
    //       Selasa, 13/08/2024, 11:33:58am
    //     </p>
    //     <p className="text-center text-gray-600 text-sm">HABIB NOR HAQIQI</p>
    //     <p className="text-center text-gray-600 text-sm">📞 6281325552982</p>
    //   </div>
    // </div>
  );
}
