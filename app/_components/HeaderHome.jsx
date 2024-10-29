"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch } from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "../_utils/GlobalApi";

const HeaderHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0); // Track previous count
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const audioRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState("/profile.png");

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

  const handleNotificationClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
    setPreviousNotificationCount(notificationCount); // Update previous count to the current count
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
    sessionStorage.clear(); // Menghapus semua item di sessionStorage
    window.location.href = "/"; // Redirect ke halaman utama atau halaman login
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
    const intervalId = setInterval(fetchNotificationCount, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getAnggotaById();

    // Play notification sound only if new notifications are greater than previous ones
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
          <div className="flex items-center pl-4">
            <Link href="/home">
              <Image src="/sanduka.png" width={70} height={60} alt="logo" />
            </Link>
          </div>

          <div className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              <li className="relative">
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
              <li className="relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center focus:outline-none"
                >
                  <Image
                    src={
                      profileImageUrl
                        ? "/profile.png"
                        : `data:image/jpeg;base64,${profileImageUrl}`
                    }
                    width={30}
                    height={30}
                    alt="Foto Profile"
                    className="rounded-full"
                  />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href="/update-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
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
