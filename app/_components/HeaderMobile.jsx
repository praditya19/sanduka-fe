"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSearch,
  faArrowLeft,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "../_utils/GlobalApi";
import { useRouter } from "next/navigation";
import { useMute } from "../MuteContext";
import PencarianAnggota from "../_components/PencarianAnggota";

const HeaderMobile = ({ showBack = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const audioRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const profileImageUrl = "/profile.png";
  const [fotoBase64, setFotoBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isMuted, handleMuteToggle } = useMute();
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

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleNotificationClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
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
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
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
      <header className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white shadow-md border-b border-teal-600/30 fixed top-0 left-0 w-full z-50 flex items-center h-14 px-3">
        <div className="flex justify-between items-center w-full">
          {/* Left Section: Back Button and Title */}
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                type="button"
                onClick={handleBackClick}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Kembali"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="sm"
                  className="text-white"
                />
              </button>
            )}
            <Link href="/home" className="transition-transform hover:scale-105">
              <Image src="/sanduka_bg_white.png" width={56} height={48} alt="Sanduka" priority />
            </Link>
          </div>
          <div className="flex space-x-2 items-center">
            <div className="flex space-x-1.5 items-center">
              {(role === "ADMIN" || role === "SUPERADMIN") && (
                <Link href="/pensiun">
                  <button className="relative p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition cursor-pointer" title="Pensiun">
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
                </Link>
              )}
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

              {/* Conditionally render search icon based on role */}
              {(role === "ADMIN" || role === "SUPERADMIN") && (
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
              )}
            </div>
            {/* Profile Image and Menu */}
            <div
              ref={profileMenuRef}
              className="relative flex items-center space-x-2 pl-2 border-l border-teal-600/50"
            >
              <button
                onClick={toggleProfileMenu}
                className="relative flex items-center justify-center focus:outline-none w-9 h-9 rounded-full border-2 border-white/50 hover:border-white shadow-sm transition-all duration-200 cursor-pointer overflow-hidden ring-2 ring-teal-900/30"
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 text-slate-800">
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
                    onClick={handleLogout}
                    className="text-left block px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition w-full cursor-pointer"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleMuteToggle}
                    className="text-left block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition w-full cursor-pointer"
                  >
                    {isMuted ? "Aktifkan Suara" : "Senyapkan Suara"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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

export default HeaderMobile;
