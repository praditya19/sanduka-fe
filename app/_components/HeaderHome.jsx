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
import PencarianAnggota from "../_components/PencarianAnggota";
import RunningText from "./RunningText";

const HeaderHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const audioRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const profileImageUrl = "/profile.png";
  const [fotoBase64, setFotoBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const { isMuted, handleMuteToggle } = useMute();
  const [isIconBlinking, setIsIconBlinking] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const fetchUserData = async () => {
    const userId = sessionStorage.getItem("userId");
    const userRole = sessionStorage.getItem("role");
    const npa = sessionStorage.getItem("npa");

    if (!userId && userRole !== "SUPERADMIN") {
      console.error("ID tidak ditemukan di sessionStorage");
      return;
    }

    try {
      let response;

      if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
        response = await GlobalApi.getAdminById(userId);
      } else if (userRole === "EDITOR" && npa) {
        const npaResponse = await GlobalApi.cekNpa(npa);

        if (npaResponse && npaResponse.id) {
          response = await GlobalApi.getUserById(npaResponse.id);
        } else {
          console.error("NPA tidak valid atau tidak ditemukan");
          return;
        }
      } else {
        response = await GlobalApi.getUserById(userId);
      }

      setUserData(response);

      if (response?.foto) {
        try {
          const decodedString = atob(response.foto);
          setFotoBase64(decodedString);
        } catch (error) {
          console.error("Error decoding Base64:", error);
          setFotoBase64(null);
        }
      } else {
        setFotoBase64(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error saat mendapatkan data user:", error);
      setLoading(false);
    }
  };

  const router = useRouter();
  const handleBackClick = () => {
    sessionStorage.removeItem("anggotaId");
    sessionStorage.removeItem("idTagihan");
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

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
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
    localStorage.clear();
    window.location.href = "/";
  };

  const getEditProfilePath = () => {
    const userRole = sessionStorage.getItem("role");
    return userRole === "SUPERADMIN" || userRole === "ADMIN"
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
    fetchUserData();

    if (isMuted) {
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
    <>
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
              <Link
                href="/home"
                onClick={() => sessionStorage.removeItem("anggotaId")}
              >
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
                  <button
                    onClick={handleNotificationClick}
                    className="relative"
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
                {sessionStorage.getItem("role") !== "USER" && (
                  <li>
                    <button onClick={handleSearchClick}>
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="w-5 h-5 text-gray-700"
                      />
                    </button>
                  </li>
                )}
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
                    className="relative flex items-center justify-center focus:outline-none w-12 h-12 rounded-full border-2 border-gray-300 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                  >
                    <Image
                      src={
                        fotoBase64
                          ? `data:image/jpeg;base64,${fotoBase64}`
                          : profileImageUrl
                      }
                      width={100}
                      height={100}
                      alt={`Foto User`}
                      className="w-full h-full rounded-full object-cover object-top"
                      unoptimized={true}
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
              {sessionStorage.getItem("role") !== "USER" && (
                <li>
                  <button onClick={handleSearchClick}>
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="w-5 h-5 text-gray-700"
                    />
                  </button>
                </li>
              )}
              <li className="relative flex justify-end">
                <Link href="/update-profile" className="text-blue-500">
                  <Image
                    src={
                      fotoBase64
                        ? `data:image/jpeg;base64,${fotoBase64}`
                        : profileImageUrl
                    }
                    width={100}
                    height={100}
                    alt={`Foto User`}
                    className="w-full h-full rounded-full object-cover object-top"
                    unoptimized={true}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <PencarianAnggota
          isOpen={isSearchModalOpen}
          onClose={handleCloseSearchModal}
        />
      )}
    </>
  );
};

export default HeaderHome;
