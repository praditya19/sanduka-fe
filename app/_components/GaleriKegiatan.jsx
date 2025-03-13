"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-full max-w-xs sm:max-w-sm md:max-w-md mx-4 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <p className={`${getTextColor()} text-center`}>
            {message}
          </p>
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

  useEffect(() => {
    fetchNonEventGalleries();
    fetchEventGalleries();
    fetchUserData();
    fetchEventParticipants();
  }, []);

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

      galleries.forEach(event => {
        if (event.category === 'EVENT') {
          const isRegistered = eventParticipants.some(
            participant => participant.npa === userNpa && participant.namaEvent === event.namaEvent
          );
          newRegistrationStatus[event.id] = isRegistered ? "Sudah Terdaftar" : null;
        }
      });

      setRegistrationStatus(newRegistrationStatus);
    }
  }, [userData, eventParticipants, galleries]);

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
      const data = await GlobalApi.getSidebarGalleryByCategory('NON EVENT');

      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob()
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        })
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
      const data = await GlobalApi.getSidebarGalleryByCategory('EVENT');

      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob()
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        })
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

  const handleRegister = async (itemId) => {
    const selectedEvent = galleries.find(item => item.id === itemId);
    setCurrentEvent(selectedEvent);

    try {
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        const userDataDaftar = await GlobalApi.getUserById(userId);
        setUserData(userDataDaftar);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }

    setJabatan("");
    setJabatanError("");
    setShowPopup(true);
  };

  // const validateForm = () => {
  //   let isValid = true;

  //   if (!jabatan.trim()) {
  //     setJabatanError("Jabatan organisasi wajib diisi");
  //     isValid = false;
  //   } else {
  //     setJabatanError("");
  //   }

  //   return isValid;
  // };



  const [nonEventGalleries, setNonEventGalleries] = useState([]);
  const [eventGalleries, setEventGalleries] = useState([]);

  if (isLoading) {
    return (
      <>
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 md:px-12 lg:px-24">
            <h2 className="text-xl font-bold mb-6 text-center">Galeri Kegiatan</h2>
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

  const processHTML = (htmlContent) => {
    if (!htmlContent) return '';

    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;

    const processedContent = htmlContent.replace(urlRegex, (url) => {
      const href = url.startsWith('www.') ? `http://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
    });

    return processedContent;
  };

  const renderHTML = (htmlContent) => {
    const processedContent = processHTML(htmlContent);
    return { __html: processedContent };
  };

  const GallerySwiper = ({ items, title, showRegisterButton = false }) => {
    const [expandedItems, setExpandedItems] = useState({});
    const maxDescriptionLength = 150;
  
    // Fungsi untuk merender deskripsi
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
                : truncateHtml(item.deskripsi, maxDescriptionLength)
            )}
          ></div>
          <button
            onClick={() => toggleExpand(item.id)}
            className="text-blue-500 hover:text-blue-700 mt-1 text-sm font-medium focus:outline-none"
          >
            {isExpanded ? "Lihat lebih sedikit" : "Lihat lebih banyak"}
          </button>
        </>
      );
    };
  
    // Fungsi untuk menghapus tag HTML dari teks
    const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
  
    // Fungsi untuk memotong teks HTML
    const truncateHtml = (html, maxLength) => {
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
  
    // Fungsi untuk toggle expand/collapse deskripsi
    const toggleExpand = (itemId) => {
      setExpandedItems((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    };
  
    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 text-center">{title}</h2>
        {items.length === 0 ? (
          <div className="text-center text-gray-600">
            {/* Hanya tampilkan pesan untuk "Event" */}
            {title === "Event" && "Tidak ada event apa pun untuk saat ini."}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="w-full"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="flex flex-col items-center">
                <div className="relative w-full rounded-lg shadow-md bg-white flex justify-center">
                  <div
                    className="w-full"
                    style={{
                      height: "0",
                      paddingBottom: "56.25%",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.deskripsi || "Gallery image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
                      className="object-contain rounded-lg"
                      priority={true}
                      quality={90}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                        e.currentTarget.className = "object-cover";
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 text-center w-full px-2 sm:px-4 md:px-8">
                  {item.category === "EVENT" ? (
                    <div>
                      <p className="text-lg font-medium">{item.namaEvent}</p>
                      {renderDescription(item)}
                    </div>
                  ) : (
                    <div>
                      <div
                        className="text-lg font-medium prose max-w-none"
                        dangerouslySetInnerHTML={renderHTML(item.deskripsi)}
                      ></div>
                    </div>
                  )}
                  {showRegisterButton && userData?.role === "USER" && (
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
        )}
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
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (allowedTypes.includes(file.type)) {
          setUploadFile(file);
          setFileName(file.name);
        } else {
          alert("Format file tidak didukung. Pilih file PDF, JPG, PNG, atau JPEG.");
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

      // if (!validateForm()) {
      //   return;
      // }

      try {
        setIsSubmitting(true);

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found");
        }

        const userDataDaftar = await GlobalApi.getUserById(userId);

        if (!userDataDaftar) {
          throw new Error("Could not retrieve user data");
        }

        const formData = new FormData();
        formData.append("namaLengkap", userDataDaftar.namaLengkap || userDataDaftar.nama);
        formData.append("npa", userDataDaftar.npaPgri);
        formData.append("email", userDataDaftar.email);
        formData.append("cabang", userDataDaftar.cabang);
        formData.append("unitKerja", userDataDaftar.unitKerja);
        formData.append("jabatan", jabatan.trim());
        formData.append("nomorHp", userDataDaftar.nomorHp);
        formData.append("namaEvent", currentEvent.namaEvent);
        // formData.append("komisi", komisi || "");
        // formData.append("ranting", ranting || "");

        if (fotoBase64) {
          const blob = await fetch(`data:image/jpeg;base64,${fotoBase64}`).then((res) => res.blob());
          formData.append("foto", blob, "profile.jpg");
        }

        if (uploadFile) {
          formData.append("upload", uploadFile, fileName);
        }

        await GlobalApi.addPesertaEvent(formData);

        setRegistrationStatus(prev => ({
          ...prev,
          [currentEvent.id]: "Sudah Terdaftar"
        }));

        await fetchEventParticipants();

        setShowPopup(false);
        setNotification({
          type: 'success',
          message: `Selamat! Anda telah berhasil terdaftar untuk event "${currentEvent.namaEvent}".`
        });

      } catch (error) {
        console.error("Error submitting registration:", error);
        setNotification({
          type: 'error',
          message: 'Maaf, pendaftaran event gagal. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.'
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-[1000]">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative bg-white rounded-lg p-4 sm:p-6 shadow-xl z-[1001] w-full max-w-xs sm:max-w-md md:max-w-lg mx-4 transform transition-all duration-300 ease-in-out overflow-y-auto max-h-[90vh]">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Close"
          >
            <FaTimesCircle size={24} />
          </button>

          <h3 className="text-xl font-bold mb-4 text-center">
            Mendaftar Event {currentEvent?.namaEvent ? `${currentEvent.namaEvent}` : ''}
          </h3>

          {/* User Photo Section */}
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

            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-600">Nomor HP</p>
              <p className="text-gray-800 font-medium">
                {userData?.nomorHp || "Loading..."}
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

            {/* <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600" htmlFor="komisi">
                Komisi
              </label>
              <input
                id="komisi"
                type="text"
                value={komisi}
                onChange={(e) => setKomisi(e.target.value)}
                placeholder="Masukkan komisi (jika ada)"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {komisiError && (
                <p className="text-red-500 text-sm mt-1">{komisiError}</p>
              )}
            </div> */}

            {/* <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600" htmlFor="ranting">
                Ranting
              </label>
              <input
                id="ranting"
                type="text"
                value={ranting}
                onChange={(e) => setRanting(e.target.value)}
                placeholder="Masukkan ranting (jika ada)"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {rantingError && (
                <p className="text-red-500 text-sm mt-1">{rantingError}</p>
              )}
            </div> */}

            <div className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600" htmlFor="uploadFile">
                Upload Dokumen (opsional)
              </label>
              <div className="flex flex-col space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
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
                        <span className="font-medium">File terpilih:</span> {fileName}
                      </p>
                    </div>
                    <button
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
              <p className="text-xs text-gray-500 mt-1">Format yang didukung: PDF, JPG, PNG, JPEG</p>
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
              'Daftar Event'
            )}
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
      {showPopup && <Popup setUploadFile={setUploadFile} />}
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