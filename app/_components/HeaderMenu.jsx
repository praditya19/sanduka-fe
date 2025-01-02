"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import {
  faBell,
  faSearch,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "../_utils/GlobalApi";
import { useMute } from "../MuteContext";

const HeaderHome = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const audioRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState("/profile.png");
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);
  const { isMuted, handleMuteToggle } = useMute();
  const [isIconBlinking, setIsIconBlinking] = useState(false);

  const role = sessionStorage.getItem("role");

  useEffect(() => {
    const fetchPensiunData = async () => {
      setLoader(true);
      try {
        const pensiunResponse = await GlobalApi.getAllPensiun();

        if (
          !pensiunResponse ||
          !pensiunResponse.data ||
          !pensiunResponse.data.content
        ) {
          throw new Error("Response dari API tidak valid");
        }

        const allPensiunList = pensiunResponse.data.content;

        const segeraItems = allPensiunList.filter(
          (item) => item.keterangan === null && item.status === "Segera"
        );
        const countSegera = segeraItems.length;

        sessionStorage.setItem("statusSegera", countSegera.toString());

        setStatusSegeraCount(countSegera);
        setPensiunList(allPensiunList);

        const finalFilteredPensiunList = allPensiunList.filter((item) => {
          if (item.keterangan === null) {
            return item.status === "Segera";
          }
          return item.keterangan !== "Pensiun";
        });

        setFilteredPensiunList(finalFilteredPensiunList);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data pensiun:", error);
      } finally {
        setLoader(false);
      }
    };

    if (isLoggedIn) {
      const statusSegera = sessionStorage.getItem("statusSegera");
      if (statusSegera) {
        setStatusSegeraCount(parseInt(statusSegera, 10));
        fetchPensiunData(); // Tetap *fetch* untuk mendapatkan data terbaru
      } else {
        fetchPensiunData();
      }
    }
  }, [isLoggedIn]);

  const getAnggotaById = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await GlobalApi.getUserById(userId);
      if (response.foto) {
        const decodedString = atob(response.foto);
        setProfileImageUrl(decodedString);
      } else {
        setProfileImageUrl("/profile.png");
      }
    } catch (error) {
      console.error("Error Saat Mendapatkan Foto:", error);
      setProfileImageUrl("/profile.png");
    }
  };

  const router = useRouter();
  const handleBackClick = () => {
    sessionStorage.removeItem("anggotaId");
    router.back();
  };

  const handleNotificationClick = () => {
    router.push("/keuangan/sanduka/lapor/lapor-cabang");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
    setPreviousNotificationCount(notificationCount);
    setNotificationCount(0);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      setIsProfileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  const getEditProfilePath = () => {
    const userRole = sessionStorage.getItem("role");
    return userRole === "SUPER ADMIN" || userRole === "ADMIN" 
      ? "/anggota/edit-admin" 
      : "/anggota/edit-anggota";
  };

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const count = await GlobalApi.getNotifikasi();
        setNotificationCount(count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getAnggotaById();

    if (isMuted) {
      // Jangan mainkan suara jika mute aktif
      return;
    }
    const storedStatusSegeraCount = sessionStorage.getItem("statusSegera");
    if (storedStatusSegeraCount) {
      setEmailCount(parseInt(storedStatusSegeraCount));
    }

    if (
      notificationCount > previousNotificationCount &&
      !isNotificationSoundPlaying
    ) {
      const playNotificationSound = () => {
        const audio = new Audio("/sound-notification.wav");
        audioRef.current = audio;
        audio
          .play()
          .then(() => setIsNotificationSoundPlaying(true))
          .catch((error) => console.error("Error playing sound:", error));
        audio.onended = () => setIsNotificationSoundPlaying(false);
      };
      playNotificationSound();
    }
    // Update blinking state
    if (notificationCount > 1) {
      setIsIconBlinking(true);
    } else {
      setIsIconBlinking(false);
    }
  }, [
    notificationCount,
    previousNotificationCount,
    isNotificationSoundPlaying,
    isMuted,
  ]);

  useEffect(() => {
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <nav className="bg-teal-500 shadow-md fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="sm"
              onClick={handleBackClick}
              className="cursor-pointer"
            />
            {/* Logo */}
            <Link href="/home"  onClick={() => sessionStorage.removeItem("anggotaId")}>
              <Image src="/sanduka.png" width={70} height={60} alt="logo" />
            </Link>
          </div>

          <div className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              {/* Icon Email */}
              {sessionStorage.getItem("role") !== "USER" && (
                <li
                  className={`relative ${
                    emailCount > 1 ? "animate-blink" : ""
                  }`}
                >
                  <button
                    className="relative"
                    onClick={() => (window.location.href = "/pensiun")}
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="w-5 h-5 text-gray-700"
                    />
                    {emailCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-red-100 bg-red-600 rounded-full">
                        {emailCount}
                      </span>
                    )}
                  </button>
                </li>
              )}
              {/* Icon Bell */}
              <li
                className={`relative ${
                  notificationCount > 1 ? "animate-blink" : ""
                }`}
              >
                <button onClick={handleNotificationClick} className="relative">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="w-5 h-5 text-gray-700"
                  />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-red-100 bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <Link href="/anggota/pencarian-anggota">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="w-5 h-5 text-gray-700"
                  />
                </Link>
              </li>
              <li
                className="relative flex items-center space-x-4"
                ref={profileMenuRef}
              >
                {/* Nama dan Cabang */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {sessionStorage.getItem("nama") || "Nama Pengguna"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sessionStorage.getItem("cabang") ||
                      "Cabang Belum Terdaftar"}
                  </p>
                </div>
                {/* Gambar Profil */}
                <button
                  onClick={toggleProfileMenu}
                  className="relative flex items-center focus:outline-none border-2 border-gray-200 hover:border-gray-400 rounded-full p-1"
                >
                  <Image
                    src={
                      profileImageUrl
                        ? "/profile.png"
                        : `data:image/jpeg;base64,${profileImageUrl}`
                    }
                    width={40}
                    height={40}
                    alt="Foto Profile"
                    className="rounded-full"
                  />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-36 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href={getEditProfilePath()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      Logout
                    </button>
                    <button
                      onClick={handleMuteToggle}
                      className="text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      {isMuted ? "Unmute" : "Mute"} Notifications
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <ul className="flex flex-col space-y-1">
            <li className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative w-full text-left"
              >
                <FontAwesomeIcon
                  icon={faBell}
                  className="w-5 h-5 text-gray-700"
                />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-red-100 bg-red-600 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <Link href="/anggota/pencarian-anggota">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-5 h-5 text-gray-700"
                />
              </Link>
            </li>
            <li className="relative flex justify-end">
              <Link href="/update-profile" className="text-blue-500">
                <Image
                  src={`data:image/jpeg;base64,${profileImageUrl}`}
                  alt="Profile"
                  width={30}
                  height={30}
                  className="w-10 h-10 inline-block rounded-full cursor-pointer"
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;
