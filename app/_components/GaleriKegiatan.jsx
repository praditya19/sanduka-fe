"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt, FaEye, FaArrowRight,
  FaCamera, FaMapMarkerAlt, FaSyncAlt, FaSpinner,
  FaExternalLinkAlt, FaInfoCircle, FaUserCheck, FaEdit, FaUser
} from "react-icons/fa";
import EventStatistikBatang from "./EventStatistikBatang";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-full max-w-xs sm:max-w-sm md:max-w-md mx-4 text-center transform transition-all duration-300 ease-in-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>
          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>
          <p className={`${getTextColor()} text-center`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

const GaleriKegiatan = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [notification, setNotification] = useState(null);
  const [jabatan, setJabatan] = useState("");
  const [jabatanError, setJabatanError] = useState("");
  const [komisi, setKomisi] = useState("");
  const [komisiError, setKomisiError] = useState("");
  const [ranting, setRanting] = useState("");
  const [rantingError, setRantingError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const profileImageUrl = "/profile.png";
  const [fotoBase64, setFotoBase64] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [nonEventGalleries, setNonEventGalleries] = useState([]);
  const [eventGalleries, setEventGalleries] = useState([]);

  const [videoDashboards, setVideoDashboards] = useState([]);

  const [showAllEventsPopup, setShowAllEventsPopup] = useState(false);
  const [showEventDetailPopup, setShowEventDetailPopup] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

  useEffect(() => {
    fetchEventGalleries();
    fetchNonEventGalleries();
    fetchUserData();
    fetchEventParticipants();
    fetchVideoDashboards();
  }, []);

  const fetchVideoDashboards = async () => {
    try {
      const data = await GlobalApi.getAllVideoDashboard();
      const list = Array.isArray(data) ? data : data?.content || [];
      setVideoDashboards(list);
    } catch (error) {
      console.error("Error fetching video dashboards:", error);
    }
  };

  const fetchEventParticipants = async () => {
    try {
      const participants = await GlobalApi.getAllPeserta();
      setEventParticipants(participants);
    } catch (error) {
      console.error("Error fetching event participants:", error);
    }
  };

  useEffect(() => {
    if (userData && eventParticipants.length > 0 && galleries.length > 0) {
      const userNpa = userData.npaPgri;
      const newRegistrationStatus = {};

      galleries.forEach((event) => {
        if (event.category === "EVENT") {
          const isRegistered = eventParticipants.some(
            (participant) =>
              participant.npa === userNpa &&
              participant.namaEvent === event.namaEvent,
          );
          newRegistrationStatus[event.id] = isRegistered
            ? "Sudah Terdaftar"
            : null;
        }
      });
      setRegistrationStatus(newRegistrationStatus);
    }
  }, [userData, eventParticipants, galleries]);

  useEffect(() => {
    if (userData && eventParticipants.length > 0 && eventGalleries.length > 0) {
      const userNpa = userData.npaPgri;
      const newRegistrationStatus = {};

      eventGalleries.forEach((event) => {
        const isRegistered = eventParticipants.some(
          (participant) =>
            participant.npa === userNpa &&
            participant.namaEvent === event.namaEvent,
        );
        newRegistrationStatus[event.id] = isRegistered
          ? "Sudah Terdaftar"
          : null;
      });
      setRegistrationStatus(newRegistrationStatus);
    }
  }, [userData, eventParticipants, eventGalleries]);

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const role = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa");

      if (userId) {
        let response;
        if (role === "ADMIN" || role === "SUPERADMIN") {
          if (npa) {
            response = await GlobalApi.getUserByNpa(npa);
          } else {
            console.error("NPA not found in session storage");
            return;
          }
        } else if (role === "USER") {
          response = await GlobalApi.getUserById(userId);
        }
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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getImageUrl = (item) => {
    if (!item) return null;
    const photo = item.photo || item.photoUrl;
    if (!photo) return null;

    if (photo.startsWith("data:") || photo.startsWith("http")) {
      return photo;
    }
    // Jika path file di server (misal /uploads/...) dan bukan data base64
    // Catatan: Base64 JPEG selalu diawali '/9j/'
    if (
      photo.startsWith("/") &&
      !photo.startsWith("/9j/") &&
      photo.length < 500 &&
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(photo)
    ) {
      return `${GlobalApi.BASE_URL || "https://sb.pgrikabupatenjepara.com"}${photo}`;
    }
    return `data:image/jpeg;base64,${photo.replace(/^data:image\/[^;]+;base64,/, "")}`;
  };

  const fetchNonEventGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getSidebarGalleryByCategory("NON EVENT");
      const processedGalleries = (data || []).map((item) => ({
        ...item,
        imageUrl: getImageUrl(item),
      }));
      setNonEventGalleries(processedGalleries);
    } catch (error) {
      console.error("Error fetching non-event galleries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getSidebarGalleryByCategory("EVENT");
      const processedGalleries = (data || []).map((item) => ({
        ...item,
        imageUrl: getImageUrl(item),
      }));

      const sortedGalleries = [...processedGalleries].sort((a, b) => {
        const aTerlewat = !!a.isTerlewat;
        const bTerlewat = !!b.isTerlewat;
        if (aTerlewat !== bTerlewat) return aTerlewat ? 1 : -1;
        return Number(b.id) - Number(a.id);
      });

      setEventGalleries(sortedGalleries);
    } catch (error) {
      console.error("Error fetching event galleries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getAllSidebarGallery();
      const processedGalleries = (data || []).map((item) => ({
        ...item,
        imageUrl: getImageUrl(item),
      }));
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

  const handleRegister = async (itemId) => {
    const selectedEvent = eventGalleries.find((item) => item.id === itemId);
    if (!selectedEvent) return;
    setCurrentEvent(selectedEvent);

    try {
      const userId = sessionStorage.getItem("userId");
      const role = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa");

      if (userId) {
        let userDataDaftar;
        if (role === "ADMIN" || role === "SUPERADMIN") {
          if (npa) userDataDaftar = await GlobalApi.getUserByNpa(npa);
        } else {
          userDataDaftar = await GlobalApi.getUserById(userId);
        }
        setUserData(userDataDaftar);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }

    setJabatan("");
    setJabatanError("");
    setTimeout(() => {
      setShowPopup(true);
    }, 100);
  };

  const handleEventClick = (event) => {
    setSelectedEventDetail(event);
    setCurrentEvent(event);
    setShowAllEventsPopup(false);
    setShowEventDetailPopup(true);
  };

  const stripHtml = (html) => {
    if (!html) return "";
    if (typeof document !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  const truncateHtml = (html, maxLength) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    if (text.length <= maxLength) return html;

    let truncated = "";
    let currentLength = 0;
    const words = text.split(" ");
    for (const word of words) {
      if (currentLength + word.length <= maxLength - 3) {
        truncated += word + " ";
        currentLength += word.length + 1;
      } else {
        break;
      }
    }
    return truncated.trim() + "...";
  };

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const processHTML = (htmlContent) => {
    if (!htmlContent) return "";
    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;
    const processedContent = htmlContent.replace(urlRegex, (url) => {
      const href = url.startsWith("www.") ? `http://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
    });
    return processedContent;
  };

  const renderHTML = (htmlContent) => {
    const processedContent = processHTML(htmlContent);
    return { __html: processedContent };
  };

  if (isLoading) {
    return (
      <>
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 md:px-12 lg:px-24">
            <h2 className="text-xl font-bold mb-6 text-center">
              Galeri Kegiatan
            </h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-300 rounded-lg w-full md:w-[400px] h-[200px]"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 md:px-12 lg:px-24">
            <h2 className="text-xl font-bold mb-6 text-center">Event</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-300 rounded-lg w-full md:w-[400px] h-[200px]"
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const GallerySwiper = ({ items, title }) => {
    const maxDescriptionLength = 250;
    const isEvent = title === "Event";

    const renderDescription = (item) => {
      const plainText = item.deskripsi ? stripHtml(item.deskripsi) : "";
      const isLongText = plainText.length > maxDescriptionLength;
      const isExpanded = expandedItems[item.id];

      if (!isLongText) {
        return (
          <div
            className="text-gray-600 mt-1 prose max-w-none text-justify sm:text-left md:text-justify"
            dangerouslySetInnerHTML={renderHTML(item.deskripsi)}
          ></div>
        );
      }

      return (
        <>
          <div
            className="text-gray-600 mt-1 prose max-w-none text-justify sm:text-left md:text-justify"
            dangerouslySetInnerHTML={renderHTML(
              isExpanded
                ? item.deskripsi
                : truncateHtml(item.deskripsi, maxDescriptionLength),
            )}
          ></div>
          <button
            onClick={() => toggleExpand(item.id)}
            className="text-blue-500 hover:text-blue-600 mt-1 text-sm font-medium focus:outline-none"
          >
            {isExpanded ? "Lihat lebih sedikit" : "Lihat lebih banyak"}
          </button>
        </>
      );
    };

    const getSeamlessItems = (arr) => {
      if (!arr || arr.length === 0) return [];
      if (!isEvent) return arr;

      const MIN_ITEMS = 6;
      let duplicated = [...arr];

      while (duplicated.length < MIN_ITEMS) {
        duplicated = [...duplicated, ...arr];
      }
      return [...duplicated, ...duplicated];
    };

    const displayItems = getSeamlessItems(items);

    return (
      <div className="mb-12 overflow-hidden w-full">
        <div className="mb-6">
          <div className="container mx-auto px-4 md:px-12 lg:px-24 flex justify-between items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            {isEvent && items.length > 0 && (
              <button
                onClick={() => setShowAllEventsPopup(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors hover:underline"
              >
                Lihat Semua
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="container mx-auto px-4 text-center text-gray-600">
            {isEvent
              ? "Tidak ada event apa pun untuk saat ini."
              : "Belum ada galeri kegiatan."}
          </div>
        ) : (
          <div className="relative w-full">
            {isEvent ? (
              <Swiper
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={"auto"}
                loop={true}
                speed={4000}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                className="w-full !py-4 marquee-swiper px-4 md:px-12"
              >
                {displayItems.map((item, index) => (
                  <SwiperSlide
                    key={`${item.id}-${index}`}
                    className="flex flex-col items-center pb-8"
                    style={{ width: "350px", maxWidth: "85vw" }}
                  >
                    <div
                      className="relative w-full aspect-square mx-auto cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl rounded-2xl overflow-hidden shadow-md bg-white border border-gray-200/70"
                      onClick={() => handleEventClick(item)}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={stripHtml(item.deskripsi) || item.namaEvent || "Gallery image"}
                        fill
                        unoptimized={true}
                        sizes="(max-width: 640px) 85vw, 350px"
                        className={`object-cover transition-transform duration-500 hover:scale-105 ${item.isTerlewat ? "filter grayscale-[25%]" : ""}`}
                        priority={true}
                        quality={90}
                      />

                      {item.isTerlewat && (
                        <div className="absolute top-4 left-4 bg-red-600/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
                          ⏰ Sudah Terlaksana
                        </div>
                      )}

                      {registrationStatus[item.id] && (
                        <div className="absolute top-4 right-4 bg-yellow-400/95 backdrop-blur-sm text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
                          <FaCheckCircle /> Terdaftar
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center w-full px-2 sm:px-4 md:px-8">
                      <p className="text-lg font-bold text-gray-900 line-clamp-2">
                        {item.namaEvent}
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={true}
                  pagination={{ clickable: true }}
                  loop={true}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  className="w-full !pb-12"
                >
                  {displayItems.map((item) => (
                    <SwiperSlide
                      key={item.id}
                      className="flex flex-col items-center pb-4"
                    >
                      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
                        <Image
                          src={item.imageUrl}
                          alt={stripHtml(item.deskripsi) || "Gallery image"}
                          fill
                          unoptimized={true}
                          sizes="100vw"
                          className="object-cover"
                          priority={true}
                          quality={90}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>

                      <div className="mt-6 text-center w-full px-4 md:px-12 lg:px-24 max-w-5xl mx-auto">
                        <div>{renderDescription(item)}</div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const AllEventsPopup = () => {
  if (!showAllEventsPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      {/* Background dengan efek blur */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/40 backdrop-blur-sm"
        onClick={() => setShowAllEventsPopup(false)}
      ></div>
      
      <div
        className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-2xl z-[1001] w-full max-w-6xl mx-4 transform transition-all duration-300 ease-in-out overflow-hidden border border-white/20"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan gradient dan dekorasi */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 flex justify-between items-center z-10 border-b-4 border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-wide">
              Semua Event
            </h3>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {eventGalleries.length} Event
            </span>
          </div>
          <button
            onClick={() => setShowAllEventsPopup(false)}
            className="text-white hover:text-indigo-200 transition-all duration-300 hover:rotate-90 transform"
            aria-label="Close"
          >
            <FaTimesCircle size={28} className="drop-shadow-lg" />
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventGalleries.map((event, index) => (
              <div
                key={event.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 flex flex-col border-2 border-transparent hover:border-indigo-500 relative"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
                onClick={() => handleEventClick(event)}
              >
                {/* Badge event status */}
                {event.isTerlewat ? (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ⏰ Sudah Terlaksana
                    </span>
                  </div>
                ) : index < 3 ? (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      🔥 NEW
                    </span>
                  </div>
                ) : null}

                {/* Image Container dengan overlay gradient */}
                <div className="relative w-full bg-gray-100 overflow-hidden" style={{ paddingBottom: "100%" }}>
                  <Image
                    src={event.imageUrl}
                    alt={event.namaEvent || "Event image"}
                    fill
                    unoptimized={true}
                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                      event.isTerlewat ? "filter grayscale-[25%]" : ""
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Ikon zoom di hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 p-3 rounded-full backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <FaEye className="text-indigo-600 text-xl" />
                    </div>
                  </div>
                </div>

                {/* Content dengan border bottom gradient */}
                <div className="p-4 flex-grow flex flex-col relative">
                  {/* Garis dekoratif */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <h4 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    {event.namaEvent}
                  </h4>
                  
                  <div
                    className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={renderHTML(event.deskripsi)}
                  ></div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    {registrationStatus[event.id] && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200 shadow-sm">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          {registrationStatus[event.id]}
                        </span>
                      </div>
                    )}
                    
                    {/* Tombol lihat detail */}
                    <button className="mt-2 text-indigo-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-indigo-800">
                      Lihat Detail
                      <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer dengan dekorasi */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      </div>
      
      {/* Tambahkan CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

  const EventDetailPopup = () => {
    if (!showEventDetailPopup || !selectedEventDetail) return null;

    const [fileName, setFileName] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [jabatan, setJabatan] = useState("");
    const [jabatanError, setJabatanError] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [tanggalDaftar, setTanggalDaftar] = useState(
      new Date().toISOString().split("T")[0],
    );
    const [ktaFile, setKtaFile] = useState(null);
    const [ktaFileName, setKtaFileName] = useState("");
    const fileInputRef = useRef(null);
    const ktaFileInputRef = useRef(null);

    // State & Ref untuk Foto Kehadiran
    const [fotoKehadiranFile, setFotoKehadiranFile] = useState(null);
    const [fotoKehadiranFileName, setFotoKehadiranFileName] = useState("");
    const [fotoKehadiranPreview, setFotoKehadiranPreview] = useState(null);
    const fotoKehadiranInputRef = useRef(null);
    const fotoKehadiranCameraRef = useRef(null);

    // State untuk Tag Location & Koordinat GPS
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [tagLocation, setTagLocation] = useState("");
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");

    const loginRole =
      typeof window !== "undefined" ? sessionStorage.getItem("role") : null;
    const isAdminRegistration = ["ADMIN", "SUPERADMIN"].includes(loginRole);
    const [formUserData, setFormUserData] = useState(userData);
    const [registrationNpa, setRegistrationNpa] = useState(
      userData?.npaPgri || "",
    );
    const [isCheckingNpa, setIsCheckingNpa] = useState(false);
    const [npaError, setNpaError] = useState("");
    const [formFotoBase64, setFormFotoBase64] = useState(fotoBase64);
    const [validationErrors, setValidationErrors] = useState({});

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("mendaftar");
    const [isSubmittingPresensi, setIsSubmittingPresensi] = useState(false);
    const [isEditingPresensi, setIsEditingPresensi] = useState(false);
    const [showAdminOtherRegistration, setShowAdminOtherRegistration] = useState(false);

    const activeNpa = isAdminRegistration
      ? registrationNpa
      : userData?.npaPgri ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("npa")
          : "");

    const myParticipation = eventParticipants.find(
      (p) =>
        ((activeNpa && p.npa === activeNpa) ||
          (userData?.npaPgri && p.npa === userData.npaPgri)) &&
        p.namaEvent === selectedEventDetail?.namaEvent
    );

    const isRegistered =
      !!myParticipation ||
      registrationStatus[selectedEventDetail?.id] === "Sudah Terdaftar";

    useEffect(() => {
      setFormUserData(userData);
      if (!isAdminRegistration) {
        setRegistrationNpa(userData?.npaPgri || "");
        setFormFotoBase64(fotoBase64);
      }
    }, [fotoBase64, isAdminRegistration, userData]);

    // Deteksi Otomatis Lokasi GPS Saat Form Registrasi Dibuka
    const detectLocation = () => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        setLocationStatus("Geolokasi tidak didukung oleh browser ini.");
        return;
      }

      setIsDetectingLocation(true);
      setLocationStatus("Mendeteksi lokasi GPS otomatis...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          const coordsText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
          let locationName = coordsText;

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                signal: controller.signal,
                headers: { "Accept-Language": "id" },
              }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                locationName = data.display_name;
              }
            }
          } catch (e) {
            // Gunakan format koordinat jika lookup reverse geocoding gagal/timeout
          }

          setTagLocation(locationName);
          setLocationStatus(`Lokasi terdeteksi: ${coordsText}`);
          setIsDetectingLocation(false);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          let errMsg = "Gagal mendeteksi lokasi";
          if (err.code === 1) errMsg = "Izin akses lokasi ditolak oleh browser";
          else if (err.code === 2) errMsg = "Posisi GPS tidak tersedia";
          else if (err.code === 3) errMsg = "Waktu permintaan lokasi habis (timeout)";
          setLocationStatus(errMsg);
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    useEffect(() => {
      detectLocation();
    }, []);

    const handleFotoKehadiranChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Format foto kehadiran harus berupa gambar (JPG, PNG, atau WEBP).");
        e.target.value = "";
        return;
      }

      setFotoKehadiranFile(file);
      setFotoKehadiranFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoKehadiranPreview(reader.result);
      };
      reader.readAsDataURL(file);
    };

    const handleRemoveFotoKehadiran = () => {
      setFotoKehadiranFile(null);
      setFotoKehadiranFileName("");
      setFotoKehadiranPreview(null);
      if (fotoKehadiranInputRef.current) fotoKehadiranInputRef.current.value = "";
      if (fotoKehadiranCameraRef.current) fotoKehadiranCameraRef.current.value = "";
    };

    const handleSubmitPresensi = async () => {
      if (!selectedEventDetail || isSubmittingPresensi) return;

      if (!fotoKehadiranFile && !myParticipation?.hasFotoKehadiran && !myParticipation?.fotoKehadiran) {
        alert("Silakan ambil foto selfie kehadiran atau pilih foto terlebih dahulu.");
        return;
      }

      try {
        setIsSubmittingPresensi(true);
        const formData = new FormData();
        const npaToUse = myParticipation?.npa || activeNpa || userData?.npaPgri;
        if (!npaToUse) {
          throw new Error("NPA peserta tidak ditemukan");
        }

        formData.append("npa", npaToUse);
        formData.append("namaEvent", selectedEventDetail.namaEvent);
        formData.append("kehadiran", "HADIR");

        if (fotoKehadiranFile) {
          formData.append(
            "fotoKehadiran",
            fotoKehadiranFile,
            fotoKehadiranFileName || "foto-kehadiran.jpg"
          );
        }
        if (latitude !== null && latitude !== undefined) {
          formData.append("latitude", latitude);
        }
        if (longitude !== null && longitude !== undefined) {
          formData.append("longitude", longitude);
        }
        if (tagLocation && tagLocation.trim()) {
          formData.append("tagLocation", tagLocation.trim());
        }

        if (myParticipation?.id) {
          await GlobalApi.updatePresensiEvent(myParticipation.id, formData);
        } else {
          await GlobalApi.updatePresensiByNpaEvent(formData);
        }

        setNotification({
          type: "success",
          message: `Presensi kehadiran untuk event "${selectedEventDetail.namaEvent}" berhasil disimpan!`,
        });

        setIsEditingPresensi(false);
        await fetchEventParticipants();
      } catch (error) {
        console.error("Error submitting presensi:", error);
        setNotification({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "Gagal menyimpan presensi kehadiran. Silakan coba lagi.",
        });
      } finally {
        setIsSubmittingPresensi(false);
      }
    };

    const handleCheckNpa = async () => {
      const npa = registrationNpa.trim();
      if (!npa || isCheckingNpa) return;

      try {
        setIsCheckingNpa(true);
        setNpaError("");
        const member = await GlobalApi.cekNpa(npa);
        setFormUserData(member);
        setFormFotoBase64(member.foto || null);
        setJabatan(member.jabatan || "");
        setValidationErrors((prev) => ({ ...prev, registrationNpa: false }));
      } catch (error) {
        setFormUserData(null);
        setFormFotoBase64(null);
        setNpaError(error.message || "Data anggota tidak ditemukan.");
        setValidationErrors((prev) => ({ ...prev, registrationNpa: true }));
      } finally {
        setIsCheckingNpa(false);
      }
    };

    const truncateWords = (text, maxWords) => {
      const words = text.trim().split(/\s+/);
      if (words.length <= maxWords) return text;
      return words.slice(0, maxWords).join(" ") + "...";
    };

    const truncateHtmlByWords = (html, maxWords) => {
      if (!html) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      const text = tmp.textContent || tmp.innerText || "";
      const words = text.trim().split(/\s+/);

      if (words.length <= maxWords) return html;

      const truncatedText = words.slice(0, maxWords).join(" ");
      let wordCount = 0;
      const targetWords = maxWords;

      function traverseAndTruncate(node) {
        if (wordCount >= targetWords) return null;

        if (node.nodeType === Node.TEXT_NODE) {
          const nodeWords = node.textContent
            .trim()
            .split(/\s+/)
            .filter((w) => w);
          if (wordCount + nodeWords.length <= targetWords) {
            wordCount += nodeWords.length;
            return node.cloneNode(true);
          } else {
            const remainingWords = targetWords - wordCount;
            const truncated =
              nodeWords.slice(0, remainingWords).join(" ") + "...";
            wordCount = targetWords;
            const newNode = document.createTextNode(truncated);
            return newNode;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          for (let child of node.childNodes) {
            if (wordCount >= targetWords) break;
            const processedChild = traverseAndTruncate(child);
            if (processedChild) clone.appendChild(processedChild);
          }
          return clone;
        }
        return null;
      }

      const result = document.createElement("DIV");
      for (let child of tmp.childNodes) {
        if (wordCount >= targetWords) break;
        const processedChild = traverseAndTruncate(child);
        if (processedChild) result.appendChild(processedChild);
      }

      return result.innerHTML;
    };

    const handleKtaFileChange = (e) => {
      const file = e.target.files?.[0];

      if (!file) {
        setKtaFile(null);
        setKtaFileName("");
        setValidationErrors((prev) => ({
          ...prev,
          uploadKta: !formFotoBase64,
        }));
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (
        allowedTypes.includes(file.type) &&
        allowedExtensions.includes(fileExtension)
      ) {
        setKtaFile(file);
        setKtaFileName(file.name);
        setValidationErrors((prev) => ({ ...prev, uploadKta: false }));
      } else {
        alert(
          "Format file KTA tidak didukung. Silakan pilih file PDF, JPG, JPEG, atau PNG.",
        );

        e.target.value = "";
        setKtaFile(null);
        setKtaFileName("");
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
          "video/mp4",
          "video/avi",
          "video/quicktime",
          "video/x-msvideo",
          "video/mpeg",
          "video/webm",
        ];
        const allowedExtensions = [
          ".pdf",
          ".jpg",
          ".jpeg",
          ".png",
          ".mp4",
          ".avi",
          ".mov",
          ".mpeg",
          ".webm",
        ];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (
          allowedTypes.includes(file.type) &&
          allowedExtensions.includes(fileExtension)
        ) {
          setUploadFile(file);
          setFileName(file.name);
        } else {
          alert(
            "Format file tidak didukung. Pilih file PDF, JPG, PNG, JPEG, atau video (MP4, AVI, MOV, MPEG, WEBM).",
          );
          e.target.value = null;
          setFileName("");
          setUploadFile(null);
        }
      } else {
        setFileName("");
        setUploadFile(null);
      }
    };

    const handleCustomButtonClick = () => {
      fileInputRef.current.click();
    };

    const handleSubmitRegistration = async () => {
      if (!currentEvent || isSubmitting) return;

      const errors = {
        registrationNpa:
          isAdminRegistration &&
          (!registrationNpa.trim() ||
            formUserData?.npaPgri !== registrationNpa.trim()),
        jenisKelamin: !jenisKelamin,
        jabatan: !jabatan.trim(),
        tanggalDaftar: !tanggalDaftar,
        uploadKta: !ktaFile && !formFotoBase64,
      };
      setValidationErrors(errors);

      const firstInvalidField = Object.keys(errors).find((field) => errors[field]);
      if (firstInvalidField) {
        const fieldId =
          firstInvalidField === "uploadKta"
            ? "uploadKtaControl"
            : firstInvalidField;
        const field = document.getElementById(fieldId);
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstInvalidField === "uploadKta") {
          field?.querySelector("button")?.focus({ preventScroll: true });
        } else {
          field?.focus({ preventScroll: true });
        }
        return;
      }

      try {
        setIsSubmitting(true);
        const userId = sessionStorage.getItem("userId");

        if (!userId) throw new Error("User ID not found");

        let userDataDaftar = formUserData;
        if (!isAdminRegistration) {
          userDataDaftar = await GlobalApi.getUserById(userId);
        }

        if (!userDataDaftar) throw new Error("Could not retrieve user data");
        if (
          isAdminRegistration &&
          userDataDaftar.npaPgri !== registrationNpa.trim()
        ) {
          throw new Error("Silakan cek NPA terlebih dahulu");
        }

        const formData = new FormData();
        formData.append(
          "namaLengkap",
          userDataDaftar.namaLengkap || userDataDaftar.nama,
        );
        formData.append("npa", userDataDaftar.npaPgri);
        formData.append("email", userDataDaftar.email);
        formData.append("cabang", userDataDaftar.cabang);
        formData.append("unitKerja", userDataDaftar.unitKerja);
        formData.append("jabatan", jabatan.trim());
        formData.append("jenisKelamin", jenisKelamin.trim());
        formData.append(
          "nomorHp",
          userDataDaftar.nomorHp || userDataDaftar.noHp,
        );
        formData.append("namaEvent", currentEvent.namaEvent);
        formData.append("tanggalDaftar", tanggalDaftar);

        if (ktaFile) {
          formData.append("foto", ktaFile, ktaFileName || ktaFile.name);
        } else if (formFotoBase64) {
          const fotoBlob = await fetch(
            `data:image/jpeg;base64,${formFotoBase64.replace(/^data:image\/[^;]+;base64,/, "")}`,
          ).then((response) => response.blob());
          formData.append("foto", fotoBlob, "foto-kta.jpg");
        }

        if (uploadFile) {
          formData.append("upload", uploadFile, fileName);
        }

        // Foto Kehadiran (Opsional saat pendaftaran)
        if (fotoKehadiranFile) {
          formData.append(
            "fotoKehadiran",
            fotoKehadiranFile,
            fotoKehadiranFileName || "foto-kehadiran.jpg"
          );
        }

        // Koordinat Geolocation & Tag Lokasi (Opsional)
        if (latitude !== null && latitude !== undefined) {
          formData.append("latitude", latitude);
        }
        if (longitude !== null && longitude !== undefined) {
          formData.append("longitude", longitude);
        }
        if (tagLocation && tagLocation.trim()) {
          formData.append("tagLocation", tagLocation.trim());
        }

        // Kehadiran awal: jika foto/lokasi ada -> HADIR, jika tidak -> BELUM HADIR
        const initialKehadiran = (fotoKehadiranFile || (latitude && longitude)) ? "HADIR" : "BELUM HADIR";
        formData.append("kehadiran", initialKehadiran);
        const userCurrentRole = loginRole || userDataDaftar?.role || "PESERTA";
        formData.append("role", userCurrentRole);

        await GlobalApi.addPesertaEvent(formData);

        setRegistrationStatus((prev) => ({
          ...prev,
          [currentEvent.id]: "Sudah Terdaftar",
        }));

        setNotification({
          type: "success",
          message: `Selamat! Anda berhasil terdaftar untuk event "${currentEvent.namaEvent}". Silakan lakukan presensi kehadiran pada tab Hadir saat acara.`,
        });

        // Alihkan otomatis ke tab Hadir
        setActiveTab("hadir");

        fetchEventParticipants().catch((refreshError) => {
          console.error("Error refreshing event participants:", refreshError);
        });
      } catch (error) {
        console.error("Error submitting registration:", error);
        setNotification({
          type: "error",
          message: "Maaf, pendaftaran event gagal. Silakan coba lagi.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-[1000]">
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => setShowEventDetailPopup(false)}
        ></div>
        <div
          className="relative bg-white rounded-lg shadow-xl z-[1001] w-full max-w-4xl mx-4 transform transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: "90vh" }}
          onClick={(e) =>
            e.stopPropagation()
          } /* Mencegah klik di dalam popup menutup modal */
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-end items-center z-10">
            <button
              onClick={() => setShowEventDetailPopup(false)}
              className="text-red-600 hover:text-red-800 transition-colors"
              aria-label="Close"
            >
              <FaTimesCircle size={28} />
            </button>
          </div>

          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 80px)" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="relative w-full rounded-lg overflow-hidden shadow-md mb-4">
                  <Image
                    src={selectedEventDetail.imageUrl}
                    alt={selectedEventDetail.namaEvent}
                    width={800}
                    height={600}
                    unoptimized={true}
                    className="w-full h-auto object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ maxHeight: "500px" }}
                  />
                </div>
                <div className="prose max-w-none">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedEventDetail.isTerlewat ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                        Sudah Terlaksana
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                        Event Aktif
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold mb-3">
                    {selectedEventDetail.namaEvent}
                  </h4>
                  <h5 className="text-lg font-semibold mb-2 text-gray-700">
                    Deskripsi Event
                  </h5>
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={renderHTML(
                      isDescriptionExpanded
                        ? selectedEventDetail.deskripsi
                        : truncateHtmlByWords(
                            selectedEventDetail.deskripsi,
                            100,
                          ),
                    )}
                  ></div>
                  {stripHtml(selectedEventDetail.deskripsi).split(/\s+/)
                    .length > 100 && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                      className="text-blue-600 hover:text-blue-800 mt-2 text-sm font-medium focus:outline-none transition-colors"
                    >
                      {isDescriptionExpanded
                        ? "Lihat lebih sedikit"
                        : "Lihat lebih banyak"}
                    </button>
                  )}
                </div>
              </div>

              {userData && (
                <div className="bg-gray-50 rounded-lg p-5 sm:p-6 flex flex-col h-full">
                  {/* ================= TABS NAVIGATION ================= */}
                  <div className="flex bg-gray-200/90 p-1 rounded-xl mb-5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setActiveTab("mendaftar")}
                      className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        activeTab === "mendaftar"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <FaCalendarAlt className={activeTab === "mendaftar" ? "text-blue-600" : "text-gray-400"} />
                      <span>Mendaftar</span>
                      {isRegistered && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full border border-green-200 font-semibold flex items-center gap-0.5">
                          <FaCheckCircle size={9} /> Terdaftar
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("hadir");
                        if (!latitude || !longitude) {
                          detectLocation();
                        }
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        activeTab === "hadir"
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <FaCamera className={activeTab === "hadir" ? "text-emerald-600" : "text-gray-400"} />
                      <span>Hadir (Presensi)</span>
                      {myParticipation?.kehadiran === "HADIR" && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full border border-emerald-200 font-semibold flex items-center gap-0.5">
                          <FaCheckCircle size={9} /> Hadir
                        </span>
                      )}
                    </button>
                  </div>

                  {/* ================= KONTEN TAB 1: MENDAFTAR ================= */}
                  {activeTab === "mendaftar" && (
                    <div>
                      {selectedEventDetail.isTerlewat && !isAdminRegistration ? (
                        <div className="text-center py-8">
                          <div className="inline-block p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
                            <FaTimesCircle className="text-3xl text-red-500 mx-auto mb-2" />
                            <p className="font-bold text-base">Event Sudah Terlaksana</p>
                            <p className="text-xs text-red-600 mt-1">
                              Pendaftaran untuk event ini telah ditutup karena kegiatan telah selesai diselenggarakan.
                            </p>
                          </div>
                        </div>
                      ) : isRegistered && !showAdminOtherRegistration ? (
                        /* ================= INFO PENDAFTARAN PERSONAL ================= */
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-green-900 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                <FaCheckCircle size={22} />
                              </div>
                              <div>
                                <h5 className="font-bold text-base text-green-800">
                                  Anda Telah Terdaftar!
                                </h5>
                                <p className="text-xs text-green-700">
                                  Data pendaftaran Anda telah tersimpan di sistem untuk event ini.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Rincian Pendaftaran Personal */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
                            <h6 className="font-bold text-sm text-gray-800 border-b pb-2 flex items-center justify-between">
                              <span>Rincian Pendaftaran Personal</span>
                              <span className="text-xs font-normal text-gray-500">
                                {myParticipation?.tanggalDaftar ? `Tgl: ${myParticipation.tanggalDaftar}` : ""}
                              </span>
                            </h6>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div>
                                <p className="text-gray-500">Nama Lengkap</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.namaLengkap || formUserData?.namaLengkap || formUserData?.nama}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">NPA PGRI</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.npa || formUserData?.npaPgri}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Cabang</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.cabang || formUserData?.cabang || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Unit Kerja</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.unitKerja || formUserData?.unitKerja || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Nomor HP</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.nomorHp || formUserData?.noHp || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Jenis Kelamin</p>
                                <p className="font-semibold text-gray-800">
                                  {myParticipation?.jenisKelamin || "-"}
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-gray-500">Keterangan</p>
                                <p className="font-semibold text-gray-800 break-words">
                                  {myParticipation?.jabatan || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">File KTA</p>
                                <p className="font-semibold text-green-700">
                                  {myParticipation?.hasFileKta ? "✓ Berkas Tersedia" : "Belum Tersedia"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Dokumen / Materi</p>
                                <p className="font-semibold text-gray-700">
                                  {myParticipation?.hasFileMateri ? "✓ Berkas Tersedia" : "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Navigasi cepat ke Tab Hadir */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                            <p className="text-xs text-emerald-800 mb-2">
                              Sudah berada di lokasi kegiatan? Lakukan selfie presensi dan tag lokasi GPS:
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("hadir");
                                if (!latitude || !longitude) detectLocation();
                              }}
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                              <FaCamera />
                              <span>Buka Presensi Kehadiran</span>
                              <FaArrowRight size={12} />
                            </button>
                          </div>

                          {/* Opsi khusus admin untuk daftarkan anggota lain */}
                          {isAdminRegistration && (
                            <button
                              type="button"
                              onClick={() => setShowAdminOtherRegistration(true)}
                              className="w-full py-2 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              + Daftarkan Peserta Lain (Admin Mode)
                            </button>
                          )}
                        </div>
                      ) : (
                        /* ================= FORM PENDAFTARAN EVENT ================= */
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-800">
                              Form Pendaftaran Event {selectedEventDetail.isTerlewat && "(Admin Mode)"}
                            </h4>
                            {showAdminOtherRegistration && (
                              <button
                                type="button"
                                onClick={() => setShowAdminOtherRegistration(false)}
                                className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                              >
                                Batal
                              </button>
                            )}
                          </div>

                          {selectedEventDetail.isTerlewat && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
                              ⚠️ Perhatian: Event ini berstatus "Sudah Terlaksana". Pendaftaran hanya diizinkan untuk Admin.
                            </div>
                          )}

                          {/* Keterangan Form Tanda Bintang Wajib Isi */}
                          <div className="mb-3.5 p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                            <span className="text-red-500 font-extrabold text-base leading-none mt-0.5">*</span>
                            <div>
                              <span className="font-bold">Ketentuan Pengisian Form:</span>
                              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                Kolom yang bertanda bintang merah (<strong className="text-red-600">*</strong>) merupakan form yang wajib diisi. Sebagian form tanpa tanda bintang bersifat opsional.
                              </p>
                            </div>
                          </div>

                          {/* Foto KTA */}
                          <div className="flex flex-col items-center justify-center mb-4">
                            <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
                              {formFotoBase64 ? (
                                <Image
                                  src={`data:image/jpeg;base64,${formFotoBase64.replace(/^data:image\/[^;]+;base64,/, "")}`}
                                  width={80}
                                  height={80}
                                  alt="Foto KTA"
                                  className="w-full h-full rounded-full object-cover object-top"
                                  unoptimized={true}
                                />
                              ) : (
                                <Image
                                  src={profileImageUrl}
                                  width={80}
                                  height={80}
                                  alt="Foto KTA"
                                  className="w-full h-full rounded-full object-cover object-top"
                                  unoptimized={true}
                                />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 text-center">
                              Foto profil dari KTA PGRI
                            </p>
                          </div>

                          <div className="space-y-3">
                            {/* Nama Lengkap */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <p className="text-xs text-gray-500">Nama Lengkap</p>
                              <p className="text-gray-800 font-semibold text-sm">
                                {formUserData?.namaLengkap || formUserData?.nama || "Loading..."}
                              </p>
                            </div>

                            {/* NPA PGRI */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="registrationNpa">
                                NPA PGRI
                              </label>
                              {isAdminRegistration ? (
                                <div className="flex gap-2 mt-1">
                                  <input
                                    id="registrationNpa"
                                    type="text"
                                    value={registrationNpa}
                                    onChange={(e) => {
                                      setRegistrationNpa(e.target.value);
                                      setFormUserData(null);
                                      setFormFotoBase64(null);
                                      setNpaError("");
                                      setValidationErrors((prev) => ({
                                        ...prev,
                                        registrationNpa: true,
                                      }));
                                    }}
                                    className={`min-w-0 flex-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                                      validationErrors.registrationNpa
                                        ? "border-red-500 focus:ring-red-200"
                                        : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                    placeholder="Masukkan NPA anggota"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCheckNpa}
                                    disabled={isCheckingNpa || !registrationNpa.trim()}
                                    className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                                  >
                                    {isCheckingNpa ? "Mengecek..." : "Cek Data"}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-800 font-semibold text-sm">
                                  {formUserData?.npaPgri || "Loading..."}
                                </p>
                              )}
                              {npaError && <p className="text-red-500 text-xs mt-1">{npaError}</p>}
                              {validationErrors.registrationNpa && !npaError && (
                                <p className="text-red-500 text-xs mt-1">
                                  Masukkan NPA dan pilih Cek Data terlebih dahulu.
                                </p>
                              )}
                            </div>

                            {/* Email */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-gray-800 font-medium text-sm">
                                {formUserData?.email || "-"}
                              </p>
                            </div>

                            {/* Cabang & Unit Kerja */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="bg-white p-3 rounded-md border border-gray-200">
                                <p className="text-xs text-gray-500">Cabang</p>
                                <p className="text-gray-800 font-medium text-sm">
                                  {formUserData?.cabang || "-"}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-md border border-gray-200">
                                <p className="text-xs text-gray-500">Unit Kerja</p>
                                <p className="text-gray-800 font-medium text-sm">
                                  {formUserData?.unitKerja || "-"}
                                </p>
                              </div>
                            </div>

                            {/* Nomor HP */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <p className="text-xs text-gray-500">Nomor HP</p>
                              <p className="text-gray-800 font-medium text-sm">
                                {formUserData?.noHp || formUserData?.nomorHp || "-"}
                              </p>
                            </div>

                            {/* Jenis Kelamin */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="jenisKelamin">
                                Jenis Kelamin <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="jenisKelamin"
                                value={jenisKelamin}
                                onChange={(e) => {
                                  setJenisKelamin(e.target.value);
                                  setValidationErrors((prev) => ({ ...prev, jenisKelamin: false }));
                                }}
                                className={`w-full mt-1 p-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${
                                  validationErrors.jenisKelamin
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                                required
                              >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                              </select>
                            </div>

                            {/* Keterangan */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="jabatan">
                                Keterangan <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="jabatan"
                                type="text"
                                value={jabatan}
                                onChange={(e) => {
                                  setJabatan(e.target.value);
                                  setValidationErrors((prev) => ({ ...prev, jabatan: false }));
                                }}
                                placeholder="Isikan keterangan atau link"
                                className={`w-full mt-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                                  validationErrors.jabatan
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                                required
                              />
                            </div>

                            {/* Tanggal Daftar */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="tanggalDaftar">
                                Tanggal Daftar <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="tanggalDaftar"
                                type="date"
                                value={tanggalDaftar}
                                onChange={(e) => {
                                  setTanggalDaftar(e.target.value);
                                  setValidationErrors((prev) => ({ ...prev, tanggalDaftar: false }));
                                }}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>

                            {/* Upload File KTA */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="uploadKta">
                                Upload File KTA <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-col space-y-2 mt-1">
                                <input
                                  ref={ktaFileInputRef}
                                  id="uploadKta"
                                  type="file"
                                  onChange={handleKtaFileChange}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                />
                                <div
                                  id="uploadKtaControl"
                                  className={`w-full border rounded-md overflow-hidden flex ${
                                    validationErrors.uploadKta ? "border-red-500" : "border-gray-300"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => ktaFileInputRef.current?.click()}
                                    className="bg-gray-100 hover:bg-gray-200 py-2 px-3 border-r border-gray-300 text-gray-700 text-xs font-medium"
                                  >
                                    Choose File
                                  </button>
                                  <div className="flex-1 px-3 py-2 text-xs text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {ktaFileName || "No file chosen"}
                                  </div>
                                </div>
                                {ktaFileName && (
                                  <div className="p-2 bg-green-50 border border-green-200 rounded-md flex items-center justify-between text-xs text-green-700">
                                    <span className="truncate">{ktaFileName}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setKtaFileName("");
                                        setKtaFile(null);
                                        if (ktaFileInputRef.current) ktaFileInputRef.current.value = "";
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      <FaTimesCircle size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Upload Dokumen atau Video */}
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <label className="text-xs text-gray-500" htmlFor="uploadFile">
                                Upload Dokumen atau Video (Opsional)
                              </label>
                              <div className="flex flex-col space-y-2 mt-1">
                                <input
                                  ref={fileInputRef}
                                  id="uploadFile"
                                  type="file"
                                  onChange={handleFileChange}
                                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov,.mpeg,.webm"
                                  className="hidden"
                                />
                                <div className="w-full border border-gray-300 rounded-md overflow-hidden flex">
                                  <button
                                    type="button"
                                    onClick={handleCustomButtonClick}
                                    className="bg-gray-100 hover:bg-gray-200 py-2 px-3 border-r border-gray-300 text-gray-700 text-xs font-medium"
                                  >
                                    Choose File
                                  </button>
                                  <div className="flex-1 px-3 py-2 text-xs text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {fileName || "No file chosen"}
                                  </div>
                                </div>
                                {fileName && (
                                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs text-blue-700">
                                    <span className="truncate">{fileName}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFileName("");
                                        setUploadFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      <FaTimesCircle size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tombol Submit Pendaftaran */}
                          <button
                            type="button"
                            onClick={handleSubmitRegistration}
                            disabled={isSubmitting}
                            className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center gap-2">
                                <FaSpinner className="animate-spin" />
                                <span>Mendaftarkan...</span>
                              </div>
                            ) : (
                              "Daftar Event"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* ================= KONTEN TAB 2: HADIR (PRESENSI) ================= */}
                  {activeTab === "hadir" && (
                    <div>
                      {!isRegistered ? (
                        /* Jika belum terdaftar */
                        <div className="text-center py-8">
                          <div className="inline-block p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 max-w-md mx-auto shadow-sm">
                            <FaInfoCircle className="text-4xl text-amber-500 mx-auto mb-3" />
                            <h5 className="font-bold text-base text-amber-900 mb-1">
                              Belum Terdaftar pada Event Ini
                            </h5>
                            <p className="text-xs text-amber-700 leading-relaxed mb-4">
                              Presensi kehadiran hanya dapat dilakukan setelah Anda terdaftar sebagai peserta event.
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveTab("mendaftar")}
                              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
                            >
                              <FaCalendarAlt />
                              <span>Buka Form Pendaftaran</span>
                            </button>
                          </div>
                        </div>
                      ) : myParticipation?.kehadiran === "HADIR" && !isEditingPresensi ? (
                        /* ================= INFO KEHADIRAN PERSONAL (SUDAH HADIR) ================= */
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <FaUserCheck size={22} />
                              </div>
                              <div>
                                <h5 className="font-bold text-base text-emerald-800">
                                  Presensi Kehadiran Terverifikasi
                                </h5>
                                <p className="text-xs text-emerald-700">
                                  Anda tercatat telah hadir pada event ini.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Rincian Kehadiran Personal */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                              <h6 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                <FaCamera className="text-emerald-600" />
                                <span>Foto & Tag Lokasi Kehadiran</span>
                              </h6>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                                HADIR
                              </span>
                            </div>

                            {/* Foto Selfie Kehadiran */}
                            <div className="flex flex-col items-center justify-center">
                              <div className="relative w-36 h-36 rounded-2xl border-2 border-emerald-300 shadow-md overflow-hidden bg-gray-100">
                                {myParticipation?.fileKehadiranUrl ? (
                                  <img
                                    src={myParticipation.fileKehadiranUrl}
                                    alt="Foto Kehadiran"
                                    className="w-full h-full object-cover"
                                  />
                                ) : fotoKehadiranPreview ? (
                                  <img
                                    src={fotoKehadiranPreview}
                                    alt="Foto Kehadiran"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2 text-center text-xs">
                                    <FaCamera size={28} className="mb-1 text-gray-300" />
                                    Foto Tidak Tersedia
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2 font-medium">
                                Swafoto Kehadiran Personal
                              </p>
                            </div>

                            {/* Data Lokasi GPS */}
                            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2 border border-gray-200">
                              <div className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                                <div className="flex-1">
                                  <p className="text-gray-500 font-medium">Tag Location Terkunci:</p>
                                  <p className="text-gray-800 font-semibold mt-0.5">
                                    {myParticipation?.tagLocation || tagLocation || "Lokasi GPS tercatat"}
                                  </p>
                                </div>
                              </div>

                              {(myParticipation?.latitude || latitude) && (
                                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                                  <span className="text-gray-500 text-[11px]">
                                    Koordinat: {myParticipation?.latitude || latitude}, {myParticipation?.longitude || longitude}
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps?q=${myParticipation?.latitude || latitude},${myParticipation?.longitude || longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-1"
                                  >
                                    Buka Google Maps <FaExternalLinkAlt size={9} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tombol Perbarui Presensi */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingPresensi(true);
                              detectLocation();
                            }}
                            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <FaEdit />
                            <span>Perbarui Foto / Titik Lokasi Presensi</span>
                          </button>
                        </div>
                      ) : (
                        /* ================= FORM PRESENSI KEHADIRAN ================= */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-base text-gray-800">
                                Konfirmasi Kehadiran Event
                              </h5>
                              <p className="text-xs text-gray-500">
                                Ambil swafoto dan kunci lokasi Anda untuk validasi presensi hari ini.
                              </p>
                            </div>
                            {isEditingPresensi && (
                              <button
                                type="button"
                                onClick={() => setIsEditingPresensi(false)}
                                className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                              >
                                Batal
                              </button>
                            )}
                          </div>

                          {/* Identitas Peserta */}
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <span className="text-gray-500">Peserta: </span>
                              <span className="font-bold text-blue-900">
                                {myParticipation?.namaLengkap || formUserData?.namaLengkap || formUserData?.nama}
                              </span>
                              <span className="text-gray-500 ml-2">({myParticipation?.npa || formUserData?.npaPgri})</span>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded">
                              {myParticipation?.unitKerja || formUserData?.unitKerja || "-"}
                            </span>
                          </div>

                          {/* Box Foto Kehadiran */}
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <FaCamera className="text-emerald-600" />
                                Foto Kehadiran / Swafoto (Selfie)
                              </span>
                              <span className="text-[11px] text-red-500 font-semibold">* Wajib</span>
                            </label>
                            <p className="text-[11px] text-gray-500 leading-normal">
                              Pastikan wajah terlihat jelas saat mengambil swafoto di tempat acara.
                            </p>

                            <input
                              ref={fotoKehadiranInputRef}
                              id="fotoKehadiranInput"
                              type="file"
                              accept="image/*"
                              onChange={handleFotoKehadiranChange}
                              className="hidden"
                            />
                            <input
                              ref={fotoKehadiranCameraRef}
                              id="fotoKehadiranCamera"
                              type="file"
                              accept="image/*"
                              capture="user"
                              onChange={handleFotoKehadiranChange}
                              className="hidden"
                            />

                            {fotoKehadiranPreview ? (
                              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-emerald-300 shadow-sm">
                                  <img
                                    src={fotoKehadiranPreview}
                                    alt="Preview Kehadiran"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-emerald-900 truncate">
                                    {fotoKehadiranFileName || "Foto Selfie Siap"}
                                  </p>
                                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800">
                                    ✓ Foto Siap Dikirim
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveFotoKehadiran}
                                  className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                  title="Ganti foto"
                                >
                                  <FaTimesCircle size={20} />
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => fotoKehadiranCameraRef.current?.click()}
                                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                >
                                  <FaCamera /> Ambil Selfie / Kamera
                                </button>
                                <button
                                  type="button"
                                  onClick={() => fotoKehadiranInputRef.current?.click()}
                                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Pilih dari Berkas
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Box Tag Location GPS */}
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-red-500" />
                                Kehadiran & Tag Location Otomatis
                              </label>
                              <button
                                type="button"
                                onClick={detectLocation}
                                disabled={isDetectingLocation}
                                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400"
                              >
                                <FaSyncAlt className={isDetectingLocation ? "animate-spin" : ""} size={11} />
                                {isDetectingLocation ? "Mendeteksi..." : "Perbarui Lokasi"}
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 ${
                                  latitude && longitude
                                    ? "bg-green-100 text-green-800"
                                    : isDetectingLocation
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {latitude && longitude ? (
                                  <>
                                    <FaCheckCircle size={11} /> GPS Terkunci
                                  </>
                                ) : isDetectingLocation ? (
                                  <>
                                    <FaSpinner className="animate-spin" size={11} /> Mencari GPS...
                                  </>
                                ) : (
                                  "GPS Belum Terkunci"
                                )}
                              </span>
                              {locationStatus && (
                                <span className="text-gray-500 text-[11px] truncate flex-1">
                                  {locationStatus}
                                </span>
                              )}
                            </div>

                            <input
                              type="text"
                              value={tagLocation}
                              onChange={(e) => setTagLocation(e.target.value)}
                              placeholder="Keterangan nama tempat / lokasi kehadiran..."
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                            />

                            {latitude && longitude && (
                              <p className="text-[10px] text-gray-400">
                                Koordinat: {latitude}, {longitude}
                              </p>
                            )}
                          </div>

                          {/* Tombol Kirim Presensi */}
                          <button
                            type="button"
                            onClick={handleSubmitPresensi}
                            disabled={isSubmittingPresensi}
                            className="mt-4 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmittingPresensi ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                <span>Menyimpan Presensi...</span>
                              </>
                            ) : (
                              <>
                                <FaCheckCircle />
                                <span>Kirim Presensi Kehadiran</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Popup = () => {
    if (!showPopup) return null;

    const [fileName, setFileName] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [komisi, setKomisi] = useState("");
    const [komisiError, setKomisiError] = useState("");
    const [ranting, setRanting] = useState("");
    const [rantingError, setRantingError] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [jabatanError, setJabatanError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
          "video/mp4",
          "video/avi",
          "video/quicktime",
          "video/x-msvideo",
          "video/mpeg",
          "video/webm",
        ];
        const allowedExtensions = [
          ".pdf",
          ".jpg",
          ".jpeg",
          ".png",
          ".mp4",
          ".avi",
          ".mov",
          ".mpeg",
          ".webm",
        ];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (
          allowedTypes.includes(file.type) &&
          allowedExtensions.includes(fileExtension)
        ) {
          setUploadFile(file);
          setFileName(file.name);
        } else {
          alert(
            "Format file tidak didukung. Pilih file PDF, JPG, PNG, JPEG, atau video (MP4, AVI, MOV, MPEG, WEBM).",
          );
          e.target.value = null;
          setFileName("");
          setUploadFile(null);
        }
      } else {
        setFileName("");
        setUploadFile(null);
      }
    };

    const handleCustomButtonClick = () => {
      fileInputRef.current.click();
    };

    const handleSubmitRegistration = async () => {
      if (!currentEvent || isSubmitting) return;

      try {
        setIsSubmitting(true);
        const userId = sessionStorage.getItem("userId");
        const role = sessionStorage.getItem("role");
        const npa = sessionStorage.getItem("npa");

        if (!userId) throw new Error("User ID not found");

        let userDataDaftar;
        if (role === "ADMIN" || role === "SUPERADMIN") {
          if (npa) {
            userDataDaftar = await GlobalApi.getUserByNpa(npa);
          } else {
            throw new Error("NPA not found in session storage");
          }
        } else {
          userDataDaftar = await GlobalApi.getUserById(userId);
        }

        if (!userDataDaftar) throw new Error("Could not retrieve user data");

        const formData = new FormData();
        formData.append(
          "namaLengkap",
          userDataDaftar.namaLengkap || userDataDaftar.nama,
        );
        formData.append("npa", userDataDaftar.npaPgri);
        formData.append("email", userDataDaftar.email);
        formData.append("cabang", userDataDaftar.cabang);
        formData.append("unitKerja", userDataDaftar.unitKerja);
        formData.append("jabatan", jabatan.trim());
        formData.append(
          "nomorHp",
          userDataDaftar.nomorHp || userDataDaftar.noHp,
        );
        formData.append("namaEvent", currentEvent.namaEvent);

        if (fotoBase64) {
          const blob = await fetch(`data:image/jpeg;base64,${fotoBase64}`).then(
            (res) => res.blob(),
          );
          formData.append("foto", blob, "profile.jpg");
        }

        if (uploadFile) {
          formData.append("upload", uploadFile, fileName);
        }

        formData.append("kehadiran", "HADIR");
        formData.append("role", role || "PESERTA");

        await GlobalApi.addPesertaEvent(formData);

        setRegistrationStatus((prev) => ({
          ...prev,
          [currentEvent.id]: "Sudah Terdaftar",
        }));

        await fetchEventParticipants();
        setShowPopup(false);
        setNotification({
          type: "success",
          message: `Selamat! Anda telah berhasil terdaftar untuk event "${currentEvent.namaEvent}".`,
        });
      } catch (error) {
        console.error("Error submitting registration:", error);
        setNotification({
          type: "error",
          message: "Maaf, pendaftaran event gagal. Silakan coba lagi.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const isRegistered =
      registrationStatus[currentEvent?.id] === "Sudah Terdaftar";

    return (
      <div className="fixed inset-0 flex items-center justify-center z-[1000]">
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => setShowPopup(false)}
        ></div>
        <div
          className="relative bg-white rounded-lg p-4 sm:p-6 shadow-xl z-[1001] w-full max-w-xs sm:max-w-md md:max-w-lg mx-4 transform transition-all duration-300 ease-in-out overflow-y-auto max-h-[90vh]"
          onClick={(e) =>
            e.stopPropagation()
          } /* Mencegah klik di dalam popup menutup modal */
        >
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Close"
          >
            <FaTimesCircle size={24} />
          </button>

          <h3 className="text-xl font-bold mb-4 text-center">
            Mendaftar Event: {currentEvent.namaEvent || "Undefined Event"}
          </h3>

          <div className="flex justify-center mb-4">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
              {fotoBase64 ? (
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
              ) : (
                <Image
                  src={profileImageUrl}
                  width={100}
                  height={100}
                  alt="Foto User"
                  className="w-full h-full rounded-full object-cover object-top"
                  unoptimized={true}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="text-gray-800 font-medium">
                {userData?.namaLengkap || userData?.nama || "Loading..."}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">NPA PGRI</p>
              <p className="text-gray-800 font-medium">
                {userData?.npaPgri || "Loading..."}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-800 font-medium">
                {userData?.email || "Loading..."}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">Cabang</p>
              <p className="text-gray-800 font-medium">
                {userData?.cabang || "Loading..."}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">Unit Kerja</p>
              <p className="text-gray-800 font-medium">
                {userData?.unitKerja || "Loading..."}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <p className="text-sm text-gray-600">Nomor HP</p>
              <p className="text-gray-800 font-medium">
                {userData?.nomorHp || userData?.noHp || "Loading..."}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600" htmlFor="jabatan">
                Jabatan Organisasi PGRI <span className="text-red-500">*</span>
              </label>
              <input
                id="jabatan"
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Masukkan jabatan organisasi PGRI"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {jabatanError && (
                <p className="text-red-500 text-sm mt-1">{jabatanError}</p>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600" htmlFor="uploadFile">
                Upload Dokumen atau Video (opsional)
              </label>
              <div className="flex flex-col space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov,.mpeg,.webm"
                  className="hidden"
                />
                <div className="w-full mt-1 border border-gray-300 rounded-md overflow-hidden flex">
                  <button
                    type="button"
                    onClick={handleCustomButtonClick}
                    className="bg-gray-100 hover:bg-gray-200 py-2 px-4 border-r border-gray-300 text-gray-700 font-medium transition-colors"
                  >
                    Choose File
                  </button>
                  <div className="flex-1 px-3 py-2 text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    {fileName || "No file chosen"}
                  </div>
                </div>
                {fileName && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                    <div className="flex-grow">
                      <p className="text-sm text-blue-700 break-words">
                        <span className="font-medium">File terpilih:</span>{" "}
                        {fileName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFileName("");
                        setUploadFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                      aria-label="Remove file"
                    >
                      <FaTimesCircle size={18} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format yang didukung: PDF, JPG, PNG, JPEG, MP4, AVI, MOV, MPEG,
                WEBM
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmitRegistration}
            disabled={isSubmitting || isRegistered}
            className="mt-6 w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mendaftar...
              </div>
            ) : isRegistered ? (
              "Anda Telah Terdaftar"
            ) : (
              "Daftar Event"
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .marquee-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `,
        }}
      />

      <div id="galeriSec" className="bg-gray-100 py-8 z-10">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              <span className="relative">
                Galeri
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-teal-400/50 to-transparent rounded-full"></span>
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Kegiatan
              </span>
            </h2>
          </div>
        </div>
        <GallerySwiper items={nonEventGalleries} title="Galeri Kegiatan" />
      </div>

      {/* Background Soft / Kalem (Tidak terlalu terang, tidak gelap) */}
      <div
        id="eventSec"
        className="py-16 z-10 relative overflow-hidden bg-gradient-to-br from-stone-100 via-orange-50/60 to-stone-200/50 border-t border-stone-200"
      >
        {/* Elemen Dekoratif Blob (Sangat transparan agar tidak silau) */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

        <div className="container relative mx-auto px-4 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 drop-shadow-sm tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                Event
              </span>
              <br className="md:hidden" /> Kami
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mt-4 opacity-80"></div>
          </div>
        </div>

        <div className="relative">
          <GallerySwiper items={eventGalleries} title="Event" />
        </div>

        {/* ========================================================
            STATISTIK MODEL BATANG DI DASHBOARD UTAMA
        ========================================================= */}
        <div className="container relative mx-auto px-4 md:px-12 lg:px-24 mt-8">
          <EventStatistikBatang
            participants={eventParticipants}
            cabangList={[]}
            selectedEventName={""}
            title="Statistik Kehadiran Peserta Per Cabang (Dashboard Utama)"
          />
        </div>
      </div>

      {/* ==========================================
          SECTION: VIDEO DASHBOARD 
      =========================================== */}
      {videoDashboards.length > 0 && (
        <div
          id="videoDashboardSec"
          className="bg-white py-16 relative overflow-hidden z-10 border-t border-gray-200"
        >
          <div className="container mx-auto px-4 md:px-12 lg:px-24 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                Video <span className="text-blue-600">Dokumentasi</span>
              </h2>
              <div className="w-24 h-1.5 bg-blue-600 rounded-full mx-auto opacity-80"></div>
            </div>

            {/* Logika Pintar: Jika 1 video = besar di tengah. Jika > 1 = Grid 2 Kolom */}
            <div
              className={
                videoDashboards.length === 1
                  ? "max-w-4xl mx-auto"
                  : "grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
              }
            >
              {videoDashboards.map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.link);
                if (!embedUrl) return null;
                return (
                  <div key={video.id} className="w-full flex flex-col group">
                    <div className="border-[4px] border-blue-50/80 rounded-2xl overflow-hidden shadow-xl bg-black relative pt-[56.25%] transform transition-transform duration-500 hover:scale-[1.02]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={embedUrl}
                        title="Video Dokumentasi"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showPopup && <Popup setUploadFile={setUploadFile} />}
      {showAllEventsPopup && <AllEventsPopup />}
      {showEventDetailPopup && <EventDetailPopup />}
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default GaleriKegiatan;
