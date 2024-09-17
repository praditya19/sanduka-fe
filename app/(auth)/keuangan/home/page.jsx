"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import {
  faArrowLeft,
  faBell,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

const data = [
  { cabang: "BANGSRI", kurangSetor: 1000.0 },
  { cabang: "BATEALIT", kurangSetor: 1000.0 },
  { cabang: "CABSUS DINAS PENDIDIKAN", kurangSetor: 1000.0 },
  { cabang: "CABSUS IGTKI", kurangSetor: 1000.0 },
  { cabang: "DONOROJO", kurangSetor: 1000.0 },
  { cabang: "JEPARA", kurangSetor: 1000.0 },
  { cabang: "KALINYAMATAN", kurangSetor: 1000.0 },
  { cabang: "KARIMUNJAWA", kurangSetor: 1000.0 },
  { cabang: "KEDUNG", kurangSetor: 1000.0 },
  { cabang: "KELING", kurangSetor: 1000.0 },
  { cabang: "KEMBANG", kurangSetor: 1000.0 },
  { cabang: "MAYONG", kurangSetor: 1000.0 },
  { cabang: "MLONGGO", kurangSetor: 1000.0 },
  { cabang: "NALUMSARI", kurangSetor: 1000.0 },
  { cabang: "PAKIS AJI", kurangSetor: 1000.0 },
  { cabang: "PECANGAAN", kurangSetor: 1000.0 },
];

export default function Home() {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  // header
  const [notificationCount, setNotificationCount] = useState(2);
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const audioRef = useRef(null);

  const profileImageUrl = "/profile.png";

  const handleNotificationClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
    setNotificationCount(0);
  };

  useEffect(() => {
    if (notificationCount > 0 && !isNotificationSoundPlaying) {
      const playNotificationSound = () => {
        const audio = new Audio("/sound-notification.wav");
        audioRef.current = audio;

        audio
          .play()
          .then(() => {
            setIsNotificationSoundPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing sound:", error);
          });

        audio.onended = () => {
          setIsNotificationSoundPlaying(false);
        };
      };

      playNotificationSound();
    }
  }, [notificationCount, isNotificationSoundPlaying]);
  // end

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
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

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <header className="bg-teal-500 text-white text-lg font-bold py-1.5 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="flex justify-between w-full">
            {/* Left Section: Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer text-black mr-4"
              />
              <Link href="/home">
                <Image src="/sanduka.png" width={70} height={60} alt="logo" />
              </Link>
            </div>
            {/* Right Section: Notifications, Search, and Profile */}
            <div className="flex space-x-6 items-center">
              <button onClick={handleNotificationClick} className="relative">
                <FontAwesomeIcon
                  icon={faBell}
                  className="w-5 h-5 text-gray-700"
                />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 h-4 text-xs font-semibold text-red-100 bg-red-600 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
              <Link href="/anggota/pencarian-anggota">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-5 h-5 text-gray-700"
                />
              </Link>
              <Link href="/update-profile">
                <Image
                  src={profileImageUrl}
                  alt="Profile"
                  width={30}
                  height={30}
                  className="rounded-full cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6 pt-6 ">
            <div className="min-h-screen bg-gray-50 -ml-8 -mb-96 sm:-mb-40">
              <nav className="container mt-8">
                <ul className="flex flex-wrap space-x-4 md:space-x-6">
                  <li>
                    <Link
                      href="/keuangan/data-utama"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Data Utama
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/keuangan/sanduka"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Sanduka
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/keuangan/organisasi"
                      className="text-gray-700 hover:text-teal-600"
                    >
                      Organisasi
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg -mt-[39rem] sm:-mt-[41rem]">
              <div className="text-center md:mx-6 my-4 md:my-0">
                <h4 className="text-xl md:text-2xl font-extrabold">SALDO</h4>
                <p className="text-md md:text-base text-gray-600">Juli 2024</p>
              </div>
              <div className="flex flex-row flex-wrap justify-center items-center mb-8">
                {/* Section 1 */}
                <div className="w-1/2 flex flex-col items-center">
                  <Image
                    src="/sanduka.png"
                    width={100}
                    height={100}
                    className="w-24 sm:w-28"
                    alt="Sanduka"
                  />
                  <p className="text-sm font-semibold text-gray-800 text-center w-full">
                    Rp. 300.329.150,-
                  </p>
                  <div className="mt-1 bg-gray-50 p-4 rounded-lg w-full max-w-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-center w-full">
                        <h6 className="font-bold text-green-700">PEMASUKAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          876.865.500,-
                        </p>
                      </div>
                      <div className="text-center w-full">
                        <h6 className="font-bold text-red-700">PENGELUARAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          576.536.350,-
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="w-1/2 flex flex-col items-center">
                  <Image
                    src="/logo.png"
                    width={100}
                    height={100}
                    className="w-10 sm:w-14"
                    alt="Organisasi"
                  />
                  <p className="text-xs font-semibold text-gray-800 mt-4 text-center w-full">
                    Rp. 0,-
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-center w-full">
                        <h6 className="font-bold text-green-700">PEMASUKAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          0,-
                        </p>
                      </div>
                      <div className="text-center w-full">
                        <h6 className="font-bold text-red-700">PENGELUARAN</h6>
                        <p className="text-sm font-semibold text-gray-800">
                          0,-
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="container w-full table-auto mb-8">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="p-2 md:p-3 border">No</th>
                      <th className="p-2 md:p-3 border">Cabang</th>
                      <th className="p-2 md:p-3 border">Kurang Setor</th>
                      <th className="p-2 md:p-3 border">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center">
                          {index + 1}
                        </td>
                        <td className="p-2 md:p-3 border">{item.cabang}</td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.kurangSetor.toFixed(2)}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          <Link
                            href="/keuangan/home/detail"
                            className="text-blue-500"
                          >
                            <Button>Detail</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
