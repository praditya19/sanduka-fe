"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faCancel,
  faCheck,
  faLocation,
} from "@fortawesome/free-solid-svg-icons";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportCard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [laporan, setLaporan] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GlobalApi.getDataLapor();
        setDataList(data);
        setLatitude(data.latitude || 0);
        setLongitude(data.longitude || 0);
        console.log("respon", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchIdAndLocation = async () => {
      const npa = dataList[currentSlide]?.npaPgri || "N/A";
      console.log("NPA saat ini:", npa);

      if (npa !== "N/A") {
        try {
          const response = await GlobalApi.cekNpa(npa);
          const id = response?.id;

          if (id) {
            console.log("ID yang didapatkan dari GlobalApi:", id);

            const locationResponse = await GlobalApi.getUserById(id);
            const lat = locationResponse?.latitude;
            const lon = locationResponse?.longitude;

            if (lat && lon) {
              setLatitude(lat);
              setLongitude(lon);
              console.log("Latitude dan Longitude yang didapat:", lat, lon);
            } else {
              console.error("Latitude atau Longitude tidak ditemukan");
            }
          }
        } catch (error) {
          console.error("Error saat mengambil data:", error);
        }
      }
    };

    if (currentSlide !== undefined && dataList.length > 0) {
      fetchIdAndLocation();
    }
  }, [currentSlide, dataList]);

  const handleLokasiClick = () => {
    if (latitude !== null && longitude !== null) {
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapsUrl, "_blank");
    } else {
      alert("Lokasi belum tersedia. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    const npaList = dataList.map((item) => item?.npaPgri).filter((npa) => npa);

    if (npaList.length > 0) {
      handleCheckNpa(npaList);
    }
  }, [dataList, currentSlide]);

  const handleCheckNpa = async (npaList) => {
    try {
      const responses = await Promise.all(
        npaList.map((npa) => GlobalApi.cekNpa(npa))
      );

      const userData = responses
        .map((response) => {
          if (response) {
            const { id, npaPgri } = response;
            return { id, npaPgri };
          }
          return null;
        })
        .filter((item) => item);

      if (userData.length > 0) {
        const idList = userData.map((item) => item.id);
        sessionStorage.setItem("idTerlaporList", JSON.stringify(idList));

        const npaList = userData.map((item) => item.npaPgri);
        sessionStorage.setItem("npaTerlaporList", JSON.stringify(npaList));

        console.log("Data saved to sessionStorage:", { idList, npaList });
      }
    } catch (error) {
      console.error("Error checking NPA:", error);
    }
  };

  const handleBatalClick = async () => {
    const currentNpa = dataList[currentSlide]?.npaPgri || null;

    if (!currentNpa) {
      console.error("NPA tidak ditemukan di slide saat ini");
      return;
    }

    try {
      const userData = await GlobalApi.cekNpa(currentNpa);

      console.log("Response cekNpa:", userData);

      if (!userData || !userData.id) {
        console.error("Data user tidak ditemukan berdasarkan NPA");
        return;
      }

      const userId = userData.id;
      const idTerlaporList =
        JSON.parse(sessionStorage.getItem("idTerlaporList")) || [];
      const npaTerlaporList =
        JSON.parse(sessionStorage.getItem("npaTerlaporList")) || [];

      if (idTerlaporList.length === 0 || npaTerlaporList.length === 0) {
        console.error(
          "ID Terlapor atau NPA Terlapor tidak ditemukan di sessionStorage"
        );
        return;
      }

      const updatedIdTerlaporList = [];
      const updatedNpaTerlaporList = [];

      for (let i = 0; i < idTerlaporList.length; i++) {
        const laporanId = idTerlaporList[i];
        const npaSession = npaTerlaporList[i];

        if (laporanId === userId && npaSession === currentNpa) {
          await GlobalApi.batalLaporanById(laporanId);
          console.log(`Laporan dengan ID ${laporanId} berhasil dibatalkan`);
        } else {
          updatedIdTerlaporList.push(laporanId);
          updatedNpaTerlaporList.push(npaSession);
        }
      }

      if (updatedIdTerlaporList.length === 0) {
        sessionStorage.removeItem("idTerlaporList");
      } else {
        sessionStorage.setItem(
          "idTerlaporList",
          JSON.stringify(updatedIdTerlaporList)
        );
      }

      if (updatedNpaTerlaporList.length === 0) {
        sessionStorage.removeItem("npaTerlaporList");
      } else {
        sessionStorage.setItem(
          "npaTerlaporList",
          JSON.stringify(updatedNpaTerlaporList)
        );
      }

      console.log(
        "idTerlaporList dan npaTerlaporList telah diperbarui di sessionStorage"
      );
      setNotification({
        type: 'success',
        message: `Laporan berhasil dibatalkan`
      });
      setLaporan(null);
      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      setNotification({
        type: 'error',
        message: `Gagal menghapus laporan`
      });
    }
  };

  const handleVerifikasiClick = async () => {
    const idTerlaporList =
      JSON.parse(sessionStorage.getItem("idTerlaporList")) || [];
    const npaTerlaporList =
      JSON.parse(sessionStorage.getItem("npaTerlaporList")) || [];

    if (idTerlaporList.length === 0 || npaTerlaporList.length === 0) {
      console.error(
        "ID Terlapor atau NPA Terlapor tidak ditemukan di sessionStorage"
      );
      setNotification({
        type: 'error',
        message: `Data ID atau NPA tidak ditemukan`
      });
      return;
    }

    const currentNpa = dataList[currentSlide]?.npaPgri || null;
    if (!currentNpa) {
      console.error("NPA tidak ditemukan di UI");
      return;
    }

    const currentIndex = npaTerlaporList.indexOf(currentNpa);

    if (currentIndex === -1) {
      console.error("NPA dari UI tidak ditemukan di sessionStorage");
      return;
    }

    const laporanId = idTerlaporList[currentIndex];

    try {
      const userData = await GlobalApi.cekNpa(currentNpa);

      const userId = userData?.id;
      const npaUser = userData?.npaPgri;

      if (userId === laporanId && npaUser === currentNpa) {
        console.log("ID dan NPA cocok, lanjutkan proses verifikasi");

        const currentDate = new Date();
        const tanggalSantunan = currentDate.toISOString().split("T")[0];

        const newTanggalSantunan = { tanggalSantunan };

        try {
          await GlobalApi.verifikasiLaporanById(laporanId, newTanggalSantunan);
          setNotification({
            type: 'success',
            message: `Data berhasil dikonfirmasi`
          });

          const updatedIdTerlaporList = idTerlaporList.filter(
            (_, index) => index !== currentIndex
          );
          const updatedNpaTerlaporList = npaTerlaporList.filter(
            (_, index) => index !== currentIndex
          );

          sessionStorage.setItem(
            "idTerlaporList",
            JSON.stringify(updatedIdTerlaporList)
          );
          sessionStorage.setItem(
            "npaTerlaporList",
            JSON.stringify(updatedNpaTerlaporList)
          );

          setTimeout(() => {
            setDataList((prevDataList) =>
              prevDataList.filter((_, index) => index !== currentSlide)
            );
            window.location.href = "/home";
          }, 2000);
        } catch (error) {
          console.error("Terjadi kesalahan saat verifikasi:", error);
          setNotification({
            type: 'success',
            message: `Gagal mengkonfirmasi data`
          });
        }
      } else {
        console.error("ID atau NPA tidak cocok, verifikasi dibatalkan");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat pengecekan NPA:", error);
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
    <div className="relative max-w-sm mx-auto bg-white shadow-lg rounded-2xl overflow-hidden my-4 border border-gray-300">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-2 py-2">
          {dataList.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-blue-500" : "bg-gray-400"
                }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="bg-gradient-to-r from-blue-400 to-blue-800 p-4 text-center rounded-xl mb-4 relative">
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
        <p className="text-center text-gray-600 mb-4 font-medium">
          Catatan :{dataList[currentSlide]?.keteranganTerlapor}
        </p>
        <div className="flex justify-around mb-4">
          <button
            onClick={handleLokasiClick}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-full transition duration-300"
          >
            <FontAwesomeIcon icon={faLocation} className="mr-2" /> Lokasi
          </button>
          <button
            className={`${["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
              } text-white font-medium py-1 px-3 rounded-full transition duration-300`}
            onClick={handleBatalClick}
            disabled={
              !["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
            }
          >
            <FontAwesomeIcon icon={faCancel} className="mr-2" /> Batal
          </button>
          <button
            className={`${["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed"
              } text-white font-medium py-1 px-3 rounded-full transition duration-300`}
            onClick={handleVerifikasiClick}
            disabled={
              !["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
            }
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
