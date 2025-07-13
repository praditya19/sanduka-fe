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

const HeaderMobile = () => {
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

    if (!userId) {
      console.error("ID tidak ditemukan di sessionStorage");
      return;
    }

    try {
      let idToFetch = userId;

      if ((userRole === "ADMIN" || userRole === "SUPER ADMIN") && npa) {
        const npaResponse = await GlobalApi.cekNpa(npa);
        if (npaResponse && npaResponse.id) {
          idToFetch = npaResponse.id;
        } else {
          console.error("NPA tidak valid atau tidak ditemukan");
          return;
        }
      }

      const response = await GlobalApi.getUserById(idToFetch);
      setUserData(response);

      if (response.foto) {
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
      <header className="bg-teal-500 text-white text-lg font-bold px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
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
          <div className="flex space-x-4 items-center ">
            <div className="flex space-x-4 items-center ml-3">
              {/* Only show email icon for ADMIN and SUPER ADMIN */}
              {(role === "ADMIN" || role === "SUPER ADMIN") && (
                <Link href="/pensiun">
                  <button className="relative">
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
                </Link>
              )}
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

              {/* Conditionally render search icon based on role */}
              {(role === "ADMIN" || role === "SUPER ADMIN") && (
                <button onClick={handleSearchClick}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="w-5 h-5 text-gray-700"
                  />
                </button>
              )}
            </div>
            {/* Profile Image and Menu */}
            <div
              ref={profileMenuRef}
              className="relative flex items-center space-x-2"
            >
              <div className="text-right flex flex-col">
                <p className="text-sm font-semibold text-gray-800">
                  {sessionStorage.getItem("nama") || "Nama Pengguna"}
                </p>
                <p className="text-xs text-gray-500">
                  {sessionStorage.getItem("cabang") || "Cabang Belum Terdaftar"}
                </p>
              </div>
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
                <div className="absolute right-0 mt-44 w-48 bg-white shadow-md rounded-md z-10">
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
                    {isMuted ? "Hidupkan Suara" : "Matikan Suara"} Notifikasi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <PencarianAnggota isOpen={isSearchModalOpen} onClose={handleCloseSearchModal} />
      )}
    </>
  );
};

export default HeaderMobile;