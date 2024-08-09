"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ShoppingBasket } from "lucide-react";

const HeaderHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [isNotificationSoundPlaying, setIsNotificationSoundPlaying] =
    useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef(null);

  const handleClick = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNotificationSoundPlaying(false);
    }
    setNotificationCount(0);
  };

  useEffect(() => {
    setHasUserInteracted(true);
    console.log("notificationCount:", notificationCount);
    console.log("isNotificationSoundPlaying:", isNotificationSoundPlaying);

    if (
      notificationCount > 0 &&
      !isNotificationSoundPlaying &&
      hasUserInteracted
    ) {
      const playNotificationSound = () => {
        console.log("Playing notification sound");
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
  }, [notificationCount, isNotificationSoundPlaying, hasUserInteracted]);

  return (
    <nav className="bg-white shadow-md fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image src="/sanduka.png" width={170} height={170} alt="logo" />
            </Link>
          </div>
          <div className="-mr-2 flex md:hidden">
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
            <ul className="flex space-x-4 items-center">
              <li className="relative">
                <Link
                  href="/home"
                  className="text-gray-700 relative"
                  onClick={handleNotificationClick}
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
                </Link>
              </li>
              <li className="relative">
                <Link href="/comming-soon" className="text-gray-700 relative">
                  <ShoppingBasket className="h-7 w-7" />
                </Link>
              </li>
              <li className="relative">
                <Link href="/sign-in" className="text-blue-500">
                  <Button>Login</Button>
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
              <Link
                href="/home"
                className="text-gray-700 relative"
                onClick={handleNotificationClick}
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
              </Link>
            </li>
            <li className="relative">
              <Link
                href={"/sign-in"}
                className="text-blue-500"
                onClick={handleClick}
              >
                <Button>Login</Button>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default HeaderHome;
