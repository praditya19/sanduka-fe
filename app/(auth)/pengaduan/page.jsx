"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faComments,
  faTimes,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
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

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PengaduanPage() {
  const { register, handleSubmit, reset } = useForm();
  const [pengaduanList, setPengaduanList] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [buktiFoto, setBuktiFoto] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [userNpa, setUserNpa] = useState("");
  const [userCabang, setUserCabang] = useState("");
  const [notification, setNotification] = useState(null);
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  // const handlePengaduanClick = (pengaduan) => {
  //   setSelectedPengaduan(pengaduan);
  //   setChatHistory([]);
  // };
  const [responses, setResponses] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobile(isMobile);
      setIsMobileView(isMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [token, router]);

  const fetchResponses = async (pengaduanId) => {
    try {
      const fetchedResponses = await GlobalApi.getResponPengaduanByPengaduanId(pengaduanId);

      const sortedResponses = fetchedResponses.sort((a, b) =>
        new Date(...a.createdAt) - new Date(...b.createdAt)
      );

      setResponses(sortedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setNotification({
        type: 'error',
        message: 'Gagal memuat respon'
      });
    }
  };

  useEffect(() => {
    if (selectedPengaduan && (userRole === 'ADMIN' || userRole === 'SUPER ADMIN' || userRole === 'USER')) {
      const pollResponses = async () => {
        try {
          const fetchedResponses = await GlobalApi.getResponPengaduanByPengaduanId(selectedPengaduan.id);

          const newResponses = fetchedResponses.filter(
            newResp => !responses.some(existingResp => existingResp.id === newResp.id)
          );

          if (newResponses.length > 0) {
            setResponses(prevResponses => [...prevResponses, ...newResponses]);
          }
        } catch (error) {
          console.error("Error polling responses:", error);
        }
      };

      const pollingInterval = setInterval(pollResponses, 5000);

      return () => clearInterval(pollingInterval);
    }
  }, [selectedPengaduan, userRole, responses]);

  const handlePengaduanClick = (pengaduan) => {
    setSelectedPengaduan(pengaduan);
    setChatHistory([]);
    fetchResponses(pengaduan.id);

    if (isMobileView) {
      setIsMobileChat(true);
    }
  };

  const handleMobileBackToList = () => {
    setIsMobileChat(false);
    setSelectedPengaduan(null);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "" || !selectedPengaduan) return;

    const tempMessage = {
      id: Date.now(),
      message: message,
      senderRole: userRole === "SUPER ADMIN" ? "SUPERADMIN" :
        userRole === "ADMIN" ? "ADMIN" : "USER",
      namaLengkap: sessionStorage.getItem("nama"),
      createdAt: new Date().toISOString().split('T')[0].split('-'),
      isTemporary: true
    };

    setResponses(prevResponses => [...prevResponses, tempMessage]);
    setChatHistory(prevHistory => [...prevHistory, {
      sender: tempMessage.senderRole.toLowerCase(),
      message,
      timestamp: new Date().toISOString()
    }]);

    try {
      const responseData = {
        pengaduanId: selectedPengaduan.id,
        senderRole: tempMessage.senderRole,
        message: message,
        namaLengkap: sessionStorage.getItem("nama"),
        email: sessionStorage.getItem("email") || "",
        npa: sessionStorage.getItem("npa"),
        unitKerja: sessionStorage.getItem("unitKerja"),
        cabang: sessionStorage.getItem("cabang")
      };

      const newResponse = await GlobalApi.createResponPengaduan(responseData);

      setResponses(prevResponses =>
        prevResponses.map(resp =>
          resp.isTemporary && resp.message === message
            ? newResponse
            : resp
        )
      );

      setMessage("");

    } catch (error) {
      console.error("Error sending message:", error);

      setResponses(prevResponses =>
        prevResponses.filter(resp => !resp.isTemporary || resp.message !== message)
      );

      setNotification({
        type: 'error',
        message: 'Gagal mengirim pesan'
      });
    }
  };

  const renderChatContent = () => {
    if (!selectedPengaduan) {
      return (
        <p className="text-center text-gray-500 p-4">
          Pilih pengaduan untuk melihat detail.
        </p>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header Chat - Enhanced */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-t-xl shadow-md flex items-center">
          {isMobileView && isMobileChat && (
            <button
              onClick={handleMobileBackToList}
              className="mr-4 text-white hover:text-blue-200 transition"
              aria-label="Kembali ke Daftar"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>
          )}
          <div className="flex-grow">
            <h4 className="text-lg font-bold tracking-wide">
              {selectedPengaduan.category}
            </h4>
            <p className="text-xs text-blue-100 mt-1 truncate max-w-md">
              {selectedPengaduan.keterangan}
            </p>
          </div>
          <div className="ml-4 bg-blue-500 rounded-full p-2">
            <FontAwesomeIcon icon={faComments} className="text-lg" />
          </div>
        </div>

        {/* Chat Area - Enhanced */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Pengaduan details - More refined */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-lg font-semibold text-gray-800">
                  Detail Pengaduan
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPengaduan.status === 'Selesai'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {selectedPengaduan.status || "Menunggu respon"}
                </span>
              </div>

              {(userRole === "ADMIN" || userRole === "SUPER ADMIN") && (
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-1 text-gray-700 text-sm">
                    <p><strong>Pengirim:</strong> {selectedPengaduan.namaLengkap}</p>
                    <p><strong>NPA:</strong> {selectedPengaduan.npa}</p>
                    <p><strong>Unit Kerja:</strong> {selectedPengaduan.unitKerja}</p>
                    <p><strong>Cabang:</strong> {selectedPengaduan.cabang}</p>
                  </div>
                </div>
              )}

              <p className="text-gray-600 text-sm mb-3">
                <strong>Deskripsi:</strong> {selectedPengaduan.keterangan}
              </p>

              {selectedPengaduan.bukti && (
                <div className="mt-3 border-t pt-3 border-gray-200">
                  <p className="font-semibold mb-2 text-sm text-gray-700">Bukti Pengaduan:</p>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/*;base64,${selectedPengaduan.bukti}`}
                      alt="Bukti Pengaduan"
                      className={`
          rounded-lg shadow-md object-cover 
          ${isMobileView
                          ? 'w-full max-w-[250px] h-[250px]'
                          : 'max-w-xs'
                        }
        `}
                      style={{
                        maxHeight: isMobileView ? '250px' : 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Messages - Smaller for Mobile */}
            {responses.map((response, index) => {
              const isOwnMessage = response.senderRole === userRole ||
                response.namaLengkap === sessionStorage.getItem("nama") ||
                response.isTemporary;

              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                  max-w-[250px] w-full p-3 rounded-xl shadow-md text-sm
                  ${isOwnMessage
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'}
                  ${response.isTemporary ? 'opacity-60' : 'opacity-100'}
                  transform transition-all duration-300 ease-in-out hover:scale-[1.02]
                `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2">
                        {!isOwnMessage && (
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xs">
                              {response.namaLengkap?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className={`font-semibold text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                          {!isOwnMessage ? response.namaLengkap : "Anda"}
                        </span>
                      </div>
                      <span className={`text-[10px] ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                        {response.createdAt
                          ? new Date(...(response.isTemporary
                            ? new Date().toISOString().split('T')[0].split('-')
                            : response.createdAt)
                          ).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Waktu tidak tersedia'}
                      </span>
                    </div>
                    <p className={`${isOwnMessage ? 'text-white' : 'text-gray-700'} text-xs`}>
                      {response.message}
                    </p>
                    {response.isTemporary && (
                      <div className={`text-[10px] mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                        Mengirim...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Area - Enhanced */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-inner">
          <div className="max-w-3xl mx-auto flex items-center space-x-2">
            <input
              type="text"
              className="flex-grow p-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan Anda..."
            />
            <button
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md"
              onClick={handleSendMessage}
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-base" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const role = sessionStorage.getItem("role") || "";
      const npa = sessionStorage.getItem("npa") || "";
      const cabang = sessionStorage.getItem("cabang") || "";

      setUserRole(role);
      setUserNpa(npa);
      setUserCabang(cabang);

      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router]);

  useEffect(() => {
    if (modalType === "respon") {
      fetchPengaduanList();
    }
  }, [modalType]);

  const fetchPengaduanList = async () => {
    try {
      setLoading(true);
      const response = await GlobalApi.getAllPengaduan();

      let filteredPengaduan = [];

      if (userRole === "SUPER ADMIN") {
        filteredPengaduan = response;
      } else if (userRole === "ADMIN") {
        filteredPengaduan = response.filter(
          (pengaduan) => pengaduan.cabang === userCabang
        );
      } else {
        filteredPengaduan = response.filter(
          (pengaduan) => pengaduan.npa === userNpa
        );
      }

      setPengaduanList(filteredPengaduan);
    } catch (error) {
      console.error("Error fetching pengaduan:", error);
      setNotification({
        type: 'error',
        message: `Gagal memuat data pengaduan`
      });
    } finally {
      setLoading(false);
    }
  };


  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const npa = sessionStorage.getItem("npa");
      const namaLengkap = sessionStorage.getItem("nama");
      const email = sessionStorage.getItem("email") || "";
      const cabang = sessionStorage.getItem("cabang");
      const unitKerja = sessionStorage.getItem("unitKerja");

      const pengaduanData = {
        namaLengkap,
        email,
        npa,
        cabang,
        unitKerja,
        category: data.kategori,
        keterangan: data.deskripsi,
        bukti: data.buktiFoto ? data.buktiFoto[0] : null
      };

      const response = await GlobalApi.createPengaduan(pengaduanData);

      reset();
      setBuktiFoto(null);
      setModalType(null);
      setNotification({
        type: 'success',
        message: `Pengaduan berhasil dikirim.`
      });

    } catch (error) {
      console.error("Error submitting pengaduan:", error);
      setNotification({
        type: 'success',
        message: `Gagal mengirim pengaduan. Silahkan Coba lagi`
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const renderResponModal = () => {
    // For desktop
    if (!isMobileView) {
      return (
        <div className="flex h-[74vh]">
          {/* Sidebar Pengaduan */}
          <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4 text-center">
              {userRole === "ADMIN" ? "Pengaduan Cabang" : "Pengaduan Saya"}
            </h3>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : pengaduanList.length === 0 ? (
              <p className="text-gray-500 text-center">
                Belum ada pengaduan.
              </p>
            ) : (
              <ul className="space-y-3">
                {pengaduanList.map((pengaduan) => (
                  <li
                    key={pengaduan.id}
                    className="p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer"
                    onClick={() => handlePengaduanClick(pengaduan)}
                  >
                    <h4 className="font-bold text-lg text-gray-800">
                      {pengaduan.category}
                    </h4>
                    <p className="text-gray-600">
                      {pengaduan.keterangan.length > 50
                        ? `${pengaduan.keterangan.substring(0, 50)}...`
                        : pengaduan.keterangan}
                    </p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-blue-600">
                        {pengaduan.status || "Menunggu respon..."}
                      </p>
                      {userRole === "ADMIN" && (
                        <p className="text-sm text-gray-500">
                          NPA: {pengaduan.npa}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white border-l border-gray-300">
            {renderChatContent()}
          </div>
        </div>
      );
    }

    // For mobile
    return (
      <div className="h-[74vh] flex flex-col">
        {/* Mobile View: List or Chat */}
        {!isMobileChat ? (
          <div className="p-4 overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4 text-center">
              {userRole === "ADMIN" ? "Pengaduan Cabang" : "Pengaduan Saya"}
            </h3>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : pengaduanList.length === 0 ? (
              <p className="text-gray-500 text-center">
                Belum ada pengaduan.
              </p>
            ) : (
              <ul className="space-y-3">
                {pengaduanList.map((pengaduan) => (
                  <li
                    key={pengaduan.id}
                    className="p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer"
                    onClick={() => handlePengaduanClick(pengaduan)}
                  >
                    <h4 className="font-bold text-lg text-gray-800">
                      {pengaduan.category}
                    </h4>
                    <p className="text-gray-600">
                      {pengaduan.keterangan.length > 50
                        ? `${pengaduan.keterangan.substring(0, 50)}...`
                        : pengaduan.keterangan}
                    </p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-blue-600">
                        {pengaduan.status || "Menunggu respon..."}
                      </p>
                      {userRole === "ADMIN" && (
                        <p className="text-sm text-gray-500">
                          NPA: {pengaduan.npa}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          // Mobile Chat View
          renderChatContent()
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <h2 className="text-3xl font-bold text-center mt-10 text-gray-800">
            Pengaduan Anggota
          </h2>

          {/* Card Section */}
          <div className="grid grid-cols-2 gap-6 mt-6 max-w-md mx-auto">
            <div
              onClick={() => setModalType("pengaduan")}
              className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg cursor-pointer text-center hover:scale-105 transition-transform"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-4xl mb-2" />
              <p className="text-lg font-medium">Ajukan Pengaduan</p>
            </div>
            <div
              onClick={() => setModalType("respon")}
              className="p-6 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg cursor-pointer text-center hover:scale-105 transition-transform"
            >
              <FontAwesomeIcon icon={faComments} className="text-4xl mb-2" />
              <p className="text-lg font-medium">Lihat Respon</p>
            </div>
          </div>

          {/* Modal */}
          {modalType && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white p-6 mt-10 rounded-lg shadow-xl h-[86vh] w-[90vw] mx-auto relative overflow-hidden">
                <button
                  onClick={() => {
                    setModalType(null);
                    setIsMobileChat(false);
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
                {modalType === "pengaduan" ? (
                  <>
                    <h3 className="text-2xl font-semibold mb-4 text-center">
                      Buat Pengaduan
                    </h3>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <select
                        {...register("kategori", { required: true })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Pengaduan">Pengaduan</option>
                        <option value="Kritikan">Kritikan</option>
                        <option value="Permohonan Bantuan">
                          Permohonan Bantuan
                        </option>
                      </select>

                      <textarea
                        {...register("deskripsi", { required: true })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        required
                        placeholder="Tulis pengaduan Anda..."
                      ></textarea>

                      {/* Input untuk unggah foto */}
                      <input
                        type="file"
                        accept="image/*"
                        {...register("buktiFoto")}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setBuktiFoto(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      {/* Pratinjau foto yang diunggah */}
                      {buktiFoto && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Pratinjau Foto:
                          </p>
                          <img
                            src={buktiFoto}
                            alt="Bukti Pengaduan"
                            className="w-full max-h-40 object-contain rounded-lg mt-2"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                      >
                        {loading ? "Mengirim..." : "Kirim"}
                      </button>
                    </form>
                  </>
                ) : (
                  renderResponModal()
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
