"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaTimesCircle } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const GaleriKegiatan = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGalleries();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const role = sessionStorage.getItem("role");

      if (userId) {
        let response;
        if (role === "ADMIN" || role === "SUPER ADMIN") {
          response = await GlobalApi.getAdminById(userId);
        } else if (role === "USER") {
          response = await GlobalApi.getUserById(userId);
        }
        setUserData(response);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getAllSidebarGallery();

      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob()
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        })
      );

      setGalleries(processedGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      galleries.forEach((item) => {
        if (item.imageUrl) {
          URL.revokeObjectURL(item.imageUrl);
        }
      });
    };
  }, [galleries]);

  const handleRegister = (itemId) => {
    const selectedEvent = galleries.find(item => item.id === itemId);
    setCurrentEvent(selectedEvent);
    setShowPopup(true);
  };

  const handleSubmitRegistration = async () => {
    if (!userData || !currentEvent || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const pesertaEvent = {
        namaLengkap: userData.namaLengkap || userData.nama,
        npa: userData.npaPgri,
        email: userData.email,
        cabang: userData.cabang,
        unitKerja: userData.unitKerja,
        namaEvent: currentEvent.namaEvent
      };

      await GlobalApi.addPesertaEvent(pesertaEvent);

      setRegistrationStatus(prev => ({
        ...prev,
        [currentEvent.id]: "Terdaftar"
      }));

      setShowPopup(false);
      alert("Pendaftaran event berhasil!");

    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Gagal mendaftar event. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nonEventGalleries = galleries.filter(item => item.category !== 'EVENT');
  const eventGalleries = galleries.filter(item => item.category === 'EVENT');

  if (isLoading) {
    return (
      <>
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 md:px-12 lg:px-24">
            <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-300 rounded-lg w-[400px] h-[200px]"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 md:px-12 lg:px-24">
            <h2 className="text-xl font-bold mb-6 text-center">Event</h2>
            <div className="flex justify-center items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-300 rounded-lg w-[400px] h-[200px]"
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const GallerySwiper = ({ items, title, showRegisterButton = false }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-center">{title}</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="w-full"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="flex flex-col items-center">
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                <Image
                  src={item.imageUrl}
                  alt={item.deskripsi}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg shadow-md object-cover"
                  priority
                  quality={100}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-lg font-medium">
                  {item.category === "EVENT" ? item.namaEvent : item.deskripsi}
                </p>
                {showRegisterButton && (
                  <div className="mt-3">
                    {registrationStatus[item.id] ? (
                      <div className="inline-block px-6 py-2 bg-yellow-500 text-white rounded-md font-medium">
                        {registrationStatus[item.id]}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(item.id)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                      >
                        Daftar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination !relative mt-10"></div>
        </Swiper>
      </div>
    );
  };

  const Popup = () => {
    if (!showPopup) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative bg-white rounded-lg p-6 shadow-xl z-10 w-96 text-center">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Close"
          >
            <FaTimesCircle size={24} />
          </button>

          <h3 className="text-xl font-bold mb-4">
            Mendaftar {currentEvent?.namaEvent ? `${currentEvent.namaEvent}` : ''}
          </h3>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="text-gray-800 font-medium">
                {userData?.namaLengkap || userData?.nama || "Loading..."}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">NPA PGRI</p>
              <p className="text-gray-800 font-medium">
                {userData?.npaPgri || "Loading..."}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-800 font-medium">
                {userData?.email || "Loading..."}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Cabang</p>
              <p className="text-gray-800 font-medium">
                {userData?.cabang || "Loading..."}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Unit Kerja</p>
              <p className="text-gray-800 font-medium">
                {userData?.unitKerja || "Loading..."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmitRegistration}
            disabled={isSubmitting}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-blue-400"
          >
            {isSubmitting ? "Mendaftar..." : "Daftar Event"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div id="galeriSec" className="bg-gray-100 py-8 z-10">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <GallerySwiper items={nonEventGalleries} title="Galeri Kegiatan" />
        </div>
      </div>

      <div id="eventSec" className="bg-gray-50 py-8 z-10">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <GallerySwiper
            items={eventGalleries}
            title="Event"
            showRegisterButton={true}
          />
        </div>
      </div>
      <Popup />
    </>
  );
};

export default GaleriKegiatan;