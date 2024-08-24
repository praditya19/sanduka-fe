"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch } from "@fortawesome/free-solid-svg-icons";

const HeaderHome = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <nav className="bg-white shadow-md fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link href="/home">
              <Image src="/sanduka.png" width={120} height={120} alt="logo" />
            </Link>
          </div>

          <div className="flex justify-end md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
          </div>

          <div className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              <li className="relative">
                <button onClick={handleNotificationClick} className="relative">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="w-6 h-6 text-gray-700"
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
                    className="w-6 h-6 text-gray-700"
                  />
                </Link>
              </li>
              <li>
                <Link href="/update-profile">
                  <Image
                    src={profileImageUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
                  className="w-6 h-6 text-gray-700"
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
                  className="w-6 h-6 text-gray-700"
                />
              </Link>
            </li>
            <li className="relative flex justify-end">
              <Link href="/update-profile" className="text-blue-500">
                <Image
                  src={profileImageUrl}
                  alt="Profile"
                  width={40}
                  height={40}
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
