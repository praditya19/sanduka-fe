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
  const [profileImageUrl, setProfileImageUrl] = useState("/profile.png");
  const { isMuted, handleMuteToggle } = useMute();

  const getAnggotaById = async () => {
    try {
      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        console.error("ID tidak ditemukan di sessionStorage");
        setProfileImageUrl("/profile.png");
        return;
      }

      const idToFetch = userId;

      const response = await GlobalApi.getUserById(idToFetch);

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

  const handleBackClick = () => {
    router.back();
  };

  const handleNotificationClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
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
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useEffect(() => {
    getAnggotaById();
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
    getAnggotaById();
    if (isMuted) {
      return;
    }
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
  }, [notificationCount, isNotificationSoundPlaying, isMuted]);

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
              <Link href="/anggota/pencarian-anggota">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-5 h-5 text-gray-700"
                />
              </Link>
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
  );
};

export default HeaderMobile;
