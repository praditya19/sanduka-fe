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

const HeaderMenu = () => {
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

  const toggleMobileMenu = () => {
    setIsOpen((prev) => !prev);
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
      <nav className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 shadow-md border-b border-teal-600/30 fixed top-0 inset-x-0 z-50 text-white">
        <div className="w-full px-6 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleBackClick}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Kembali"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="sm"
                  className="transition-colors"
                />
              </button>
              {/* Logo */}
              <Link
                href="/home"
                onClick={() => sessionStorage.removeItem("anggotaId")}
                className="transition-transform hover:scale-105"
              >
                <Image src="/sanduka.png" width={64} height={54} alt="logo" priority />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <ul className="flex space-x-3 items-center">
                {/* Icon Email */}
                {sessionStorage.getItem("role") !== "USER" && (
                  <li
                    className={`relative ${
                      emailCount > 1 ? "animate-blink" : ""
                    }`}
                  >
                    <button
                      className="relative p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      onClick={() => (window.location.href = "/pensiun")}
                      title="Pensiun"
                    >
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="w-4 h-4 text-white"
                      />
                      {emailCount > 0 && (
                        <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-teal-800">
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
                    className="relative p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Notifikasi"
                  >
                    <FontAwesomeIcon
                      icon={faBell}
                      className="w-4 h-4 text-white"
                    />
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-teal-800">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </li>

                {/* Search Icon */}
                <li>
                  <button
                    onClick={handleSearchClick}
                    className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Cari Anggota"
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="w-4 h-4 text-white"
                    />
                  </button>
                </li>

                {/* Profile Section */}
                <li
                  className="relative flex items-center space-x-3 pl-2 border-l border-teal-600/50"
                  ref={profileMenuRef}
                >
                  {/* Nama dan Cabang */}
                  <div className="text-right leading-tight">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {sessionStorage.getItem("nama") || "Nama Pengguna"}
                    </p>
                    <p className="text-[11px] text-teal-200 font-medium">
                      {sessionStorage.getItem("cabang") ||
                        "Cabang Belum Terdaftar"}
                    </p>
                  </div>

                  {/* Gambar Profil */}
                  <button
                    onClick={toggleProfileMenu}
                    className="relative flex items-center justify-center focus:outline-none w-10 h-10 rounded-full border-2 border-white/50 hover:border-white shadow-sm transition-all duration-200 cursor-pointer overflow-hidden ring-2 ring-teal-900/30"
                  >
                    <Image
                      src={
                        fotoBase64
                          ? `data:image/jpeg;base64,${fotoBase64}`
                          : profileImageUrl
                      }
                      width={40}
                      height={40}
                      alt={`Foto User`}
                      className="w-full h-full rounded-full object-cover object-top"
                      unoptimized={true}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 text-slate-800">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {sessionStorage.getItem("nama") || "Pengguna"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {sessionStorage.getItem("cabang") || "PGRI Jepara"}
                        </p>
                      </div>
                      {sessionStorage.getItem("role") !== "EDITOR" && (
                        <Link
                          href={getEditProfilePath()}
                          className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition w-full"
                        >
                          Edit Profil
                        </Link>
                      )}
                      <button
                        onClick={handleMuteToggle}
                        className="text-left block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition w-full cursor-pointer"
                      >
                        {isMuted ? "Aktifkan Suara" : "Senyapkan Suara"}
                      </button>
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="text-left block px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition w-full cursor-pointer"
                        >
                          Keluar (Logout)
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-teal-600`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <ul className="flex flex-col space-y-3">
              {/* Mobile Email Icon */}
              {sessionStorage.getItem("role") !== "USER" && (
                <li className="relative">
                  <button
                    onClick={() => (window.location.href = "/pensiun")}
                    className="relative w-full text-left flex items-center space-x-3 px-3 py-2 text-white hover:bg-teal-700 rounded-md"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                    <span>Email</span>
                    {emailCount > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-600 rounded-full">
                        {emailCount}
                      </span>
                    )}
                  </button>
                </li>
              )}

              {/* Mobile Bell Icon */}
              <li className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="relative w-full text-left flex items-center space-x-3 px-3 py-2 text-white hover:bg-teal-700 rounded-md"
                >
                  <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                  <span>Notifikasi</span>
                  {notificationCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </li>

              {/* Mobile Search */}
              <li>
                <button
                  onClick={handleSearchClick}
                  className="w-full text-left flex items-center space-x-3 px-3 py-2 text-white hover:bg-teal-700 rounded-md"
                >
                  <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
                  <span>Cari Anggota</span>
                </button>
              </li>

              {/* Mobile Profile */}
              <li className="relative flex items-center space-x-3 px-3 py-2">
                <Image
                  src={
                    fotoBase64
                      ? `data:image/jpeg;base64,${fotoBase64}`
                      : profileImageUrl
                  }
                  width={40}
                  height={40}
                  alt={`Foto User`}
                  className="w-10 h-10 rounded-full object-cover object-top border-2 border-white"
                  unoptimized={true}
                />
                <div className="text-white">
                  <p className="text-sm font-semibold">
                    {sessionStorage.getItem("nama") || "Nama Pengguna"}
                  </p>
                  <p className="text-xs text-gray-200">
                    {sessionStorage.getItem("cabang") ||
                      "Cabang Belum Terdaftar"}
                  </p>
                </div>
              </li>

              {/* Mobile Menu Items */}
              {sessionStorage.getItem("role") !== "EDITOR" && (
                <li>
                  <Link
                    href={getEditProfilePath()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    Edit Profile
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleMuteToggle}
                  className="w-full text-left px-3 py-2 text-white hover:bg-teal-700 rounded-md"
                >
                  {isMuted ? "Unmute" : "Mute"} Notifications
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white hover:bg-teal-700 rounded-md"
                >
                  Logout
                </button>
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

export default HeaderMenu;
