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
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Laporan berhasil dibatalkan!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 4000,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setLaporan(null);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Membatalkan Laporan.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
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
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Data ID atau NPA tidak valid
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
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

      console.log("Response cekNpa:", userData);

      const userId = userData?.id;
      const npaUser = userData?.npaPgri;

      if (userId === laporanId && npaUser === currentNpa) {
        console.log("ID dan NPA cocok, lanjutkan proses verifikasi");

        const currentDate = new Date();
        const tanggalSantunan = currentDate.toISOString().split("T")[0];

        const newTanggalSantunan = {
          tanggalSantunan: tanggalSantunan,
        };

        try {
          await GlobalApi.verifikasiLaporanById(laporanId, newTanggalSantunan);
          toast.success(
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: "150px",
                  height: "150px",
                  color: "#06D001",
                  marginBottom: "16px",
                }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <strong
                style={{
                  fontSize: "2rem",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Data Berhasil Terkonfirmasi!
              </strong>
            </div>,
            {
              icon: null,
              autoClose: 4000,
              duration: 4000,
              style: {
                marginTop: "16%",
                fontSize: "1.75rem",
                padding: "10px",
                width: "80%",
                maxWidth: "700px",
                height: "50%",
                maxHeight: "400px",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 9999,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            }
          );

          setTimeout(() => {
            setDataList((prevDataList) =>
              prevDataList.filter((_, index) => index !== currentSlide)
            );
          }, 2000);
        } catch (error) {
          console.error("Terjadi kesalahan saat verifikasi:", error);
          toast.error(
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: "150px",
                  height: "150px",
                  color: "red",
                  marginBottom: "16px",
                }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
              </svg>
              <strong
                style={{
                  fontSize: "1.75rem",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Gagal Mengkonfirmasi.
              </strong>
            </div>,
            {
              icon: null,
              duration: 5000,
              style: {
                marginTop: "16%",
                fontSize: "1.75rem",
                padding: "10px",
                width: "80%",
                maxWidth: "700px",
                height: "50%",
                maxHeight: "400px",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 9999,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            }
          );
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
      <Toaster
        toastOptions={{
          style: {
            fontSize: "1.25rem",
            padding: "16px",
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#f44336",
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
        <p className="text-center text-gray-600 mb-4 font-medium">
          Catatan :{dataList[currentSlide]?.keteranganTerlapor}
        </p>
        <div className="flex justify-around mb-4">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-full transition duration-300">
            <FontAwesomeIcon icon={faLocation} className="mr-2" /> Lokasi
          </button>
          <button
            className={`${
              ["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
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
            className={`${
              ["ADMIN", "SUPER ADMIN"].includes(sessionStorage.getItem("role"))
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
