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
} from "react-icons/fa";
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

  const fetchNonEventGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await GlobalApi.getSidebarGalleryByCategory("NON EVENT");
      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob(),
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        }),
      );
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
      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob(),
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        }),
      );
      setEventGalleries(processedGalleries);
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
      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob(),
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        }),
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
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
                    style={{ width: "400px" }}
                  >
                    <div
                      className="relative w-full mx-auto cursor-pointer transition-transform duration-300 hover:scale-105"
                      onClick={() => handleEventClick(item)}
                      style={{ height: "400px" }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.deskripsi || "Gallery image"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 500px"
                        className="object-contain"
                        priority={true}
                        quality={90}
                      />

                      {registrationStatus[item.id] && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                          <FaCheckCircle /> Terdaftar
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center w-full px-2 sm:px-4 md:px-8">
                      <p className="text-lg font-bold text-gray-900">
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
                          alt={item.deskripsi || "Gallery image"}
                          fill
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
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => setShowAllEventsPopup(false)}
        ></div>
        <div
          className="relative bg-white rounded-lg shadow-xl z-[1001] w-full max-w-6xl mx-4 transform transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: "90vh" }}
          onClick={(e) =>
            e.stopPropagation()
          } /* Mencegah klik di dalam popup menutup modal */
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
            <h3 className="text-2xl font-bold">Semua Event</h3>
            <button
              onClick={() => setShowAllEventsPopup(false)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventGalleries.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-105 duration-200 flex flex-col"
                  onClick={() => handleEventClick(event)}
                >
                  <div
                    className="relative w-full bg-gray-100"
                    style={{ paddingBottom: "100%" }}
                  >
                    <Image
                      src={event.imageUrl}
                      alt={event.namaEvent || "Event image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                    <h4 className="text-lg font-semibold mb-2 line-clamp-2">
                      {event.namaEvent}
                    </h4>
                    <div
                      className="text-gray-600 text-sm line-clamp-3 mb-2"
                      dangerouslySetInnerHTML={renderHTML(event.deskripsi)}
                    ></div>
                    <div className="mt-auto">
                      {registrationStatus[event.id] && (
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            {registrationStatus[event.id]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
      setFormUserData(userData);
      if (!isAdminRegistration) {
        setRegistrationNpa(userData?.npaPgri || "");
        setFormFotoBase64(fotoBase64);
      }
    }, [fotoBase64, isAdminRegistration, userData]);

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
      } catch (error) {
        setFormUserData(null);
        setFormFotoBase64(null);
        setNpaError(error.message || "Data anggota tidak ditemukan.");
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

      try {
        if (!jenisKelamin || !tanggalDaftar) {
          throw new Error("Jenis kelamin dan tanggal daftar wajib diisi");
        }

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

        await GlobalApi.addPesertaEvent(formData);

        setRegistrationStatus((prev) => ({
          ...prev,
          [currentEvent.id]: "Sudah Terdaftar",
        }));

        setShowEventDetailPopup(false);
        setNotification({
          type: "success",
          message: `Selamat! Anda telah berhasil terdaftar untuk event "${currentEvent.namaEvent}".`,
        });

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

    const isRegistered = registrationStatus[selectedEventDetail.id];

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
                    className="w-full h-auto object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ maxHeight: "500px" }}
                  />
                </div>
                <div className="prose max-w-none">
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
                <div className="bg-gray-50 rounded-lg p-6">
                  {/* {isRegistered ? (
                    <div className="text-center">
                      <div className="inline-block px-8 py-3 bg-yellow-500 text-white rounded-lg font-semibold text-base shadow-md mb-4">
                        {isRegistered}
                      </div>

                      <p className="text-gray-600">
                        Anda sudah terdaftar untuk event ini.
                      </p>
                    </div>
                  ) : ( */}
                  <>
                    <h4 className="text-xl font-bold mb-4 text-center">
                      Form Pendaftaran Event
                    </h4>

                    {/* ================= FOTO KTA ================= */}
                    <div className="flex flex-col items-center justify-center mb-5">
                      <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
                        {formFotoBase64 ? (
                          <Image
                            src={`data:image/jpeg;base64,${formFotoBase64.replace(/^data:image\/[^;]+;base64,/, "")}`}
                            width={100}
                            height={100}
                            alt="Foto KTA"
                            className="w-full h-full rounded-full object-cover object-top"
                            unoptimized={true}
                          />
                        ) : (
                          <Image
                            src={profileImageUrl}
                            width={100}
                            height={100}
                            alt="Foto KTA"
                            className="w-full h-full rounded-full object-cover object-top"
                            unoptimized={true}
                          />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Foto diambil dari KTA PGRI
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* ================= NAMA LENGKAP ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Nama Lengkap</p>

                        <p className="text-gray-800 font-medium">
                          {formUserData?.namaLengkap ||
                            formUserData?.nama ||
                            "Loading..."}
                        </p>
                      </div>

                      {/* ================= NPA ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="registrationNpa"
                        >
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
                              }}
                              className="min-w-0 flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Masukkan NPA anggota"
                            />
                            <button
                              type="button"
                              onClick={handleCheckNpa}
                              disabled={
                                isCheckingNpa || !registrationNpa.trim()
                              }
                              className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            >
                              {isCheckingNpa ? "Mengecek..." : "Cek Data"}
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {formUserData?.npaPgri || "Loading..."}
                          </p>
                        )}
                        {npaError && (
                          <p className="text-red-500 text-sm mt-1">
                            {npaError}
                          </p>
                        )}
                      </div>

                      {/* ================= EMAIL ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Email</p>

                        <p className="text-gray-800 font-medium">
                          {formUserData?.email || "Loading..."}
                        </p>
                      </div>

                      {/* ================= CABANG ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Cabang</p>

                        <p className="text-gray-800 font-medium">
                          {formUserData?.cabang || "Loading..."}
                        </p>
                      </div>

                      {/* ================= UNIT KERJA ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Unit Kerja</p>

                        <p className="text-gray-800 font-medium">
                          {formUserData?.unitKerja || "Loading..."}
                        </p>
                      </div>

                      {/* ================= NOMOR HP ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Nomor HP</p>

                        <p className="text-gray-800 font-medium">
                          {formUserData?.noHp ||
                            formUserData?.nomorHp ||
                            "Loading..."}
                        </p>
                      </div>

                      {/* ================= NAMA EVENT ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-600">Nama Event</p>

                        <p className="text-gray-800 font-medium">
                          {currentEvent?.namaEvent || "Loading..."}
                        </p>
                      </div>

                      {/* ================= JENIS KELAMIN ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="jenisKelamin"
                        >
                          Jenis Kelamin <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="jenisKelamin"
                          value={jenisKelamin}
                          onChange={(e) => setJenisKelamin(e.target.value)}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Pilih Jenis Kelamin</option>

                          <option value="Laki-laki">Laki-laki</option>

                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      {/* ================= JABATAN ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="jabatan"
                        >
                          Jabatan Organisasi PGRI{" "}
                          <span className="text-red-500">*</span>
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
                          <p className="text-red-500 text-sm mt-1">
                            {jabatanError}
                          </p>
                        )}
                      </div>

                      {/* ================= TANGGAL DAFTAR ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="tanggalDaftar"
                        >
                          Tanggal Daftar <span className="text-red-500">*</span>
                        </label>

                        <input
                          id="tanggalDaftar"
                          type="date"
                          value={tanggalDaftar}
                          onChange={(e) => setTanggalDaftar(e.target.value)}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Tanggal otomatis menggunakan tanggal hari ini, tetapi
                          masih dapat diubah.
                        </p>
                      </div>

                      {/* ================= UPLOAD ================= */}
                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="uploadKta"
                        >
                          Upload File KTA{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-col space-y-2">
                          <input
                            ref={ktaFileInputRef}
                            id="uploadKta"
                            type="file"
                            onChange={handleKtaFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                          />

                          <div className="w-full mt-1 border border-gray-300 rounded-md overflow-hidden flex">
                            <button
                              type="button"
                              onClick={() => ktaFileInputRef.current?.click()}
                              className="bg-gray-100 hover:bg-gray-200 py-2 px-4 border-r border-gray-300 text-gray-700 font-medium transition-colors"
                            >
                              Choose File
                            </button>

                            <div className="flex-1 px-3 py-2 text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                              {ktaFileName || "No file chosen"}
                            </div>
                          </div>

                          {ktaFileName && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                              <div className="flex-grow">
                                <p className="text-sm text-green-700 break-words">
                                  <span className="font-medium">
                                    File KTA terpilih:
                                  </span>{" "}
                                  {ktaFileName}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setKtaFileName("");
                                  setKtaFile(null);

                                  if (ktaFileInputRef.current) {
                                    ktaFileInputRef.current.value = "";
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 ml-2"
                                aria-label="Remove KTA file"
                              >
                                <FaTimesCircle size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Upload file KTA PGRI dalam format PDF, JPG, JPEG, atau
                          PNG.
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-md">
                        <label
                          className="text-sm text-gray-600"
                          htmlFor="uploadFile"
                        >
                          Upload Dokumen atau Video (Opsional)
                        </label>

                        <div className="flex flex-col space-y-2">
                          <input
                            ref={fileInputRef}
                            id="uploadFile"
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
                                  <span className="font-medium">
                                    File terpilih:
                                  </span>{" "}
                                  {fileName}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setFileName("");
                                  setUploadFile(null);

                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
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
                          Format yang didukung: PDF, JPG, PNG, JPEG, MP4, AVI,
                          MOV, MPEG, WEBM
                        </p>
                      </div>
                    </div>

                    {/* ================= BUTTON ================= */}
                    <button
                      type="button"
                      onClick={handleSubmitRegistration}
                      disabled={
                        isSubmitting ||
                        !jenisKelamin ||
                        !tanggalDaftar ||
                        (isAdminRegistration &&
                          formUserData?.npaPgri !== registrationNpa.trim())
                      }
                      className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:bg-blue-400 transform hover:scale-105 duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Mendaftar...
                        </div>
                      ) : (
                        "Daftar Event"
                      )}
                    </button>
                  </>
                  {/* )} */}
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

        formData.append("foto", ktaFile, ktaFileName || ktaFile.name);

        if (uploadFile) {
          formData.append("upload", uploadFile, fileName);
        }

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
            disabled={isSubmitting}
            className="mt-6 w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-blue-400 transform hover:scale-105 duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mendaftar...
              </div>
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
