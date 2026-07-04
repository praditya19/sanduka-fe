"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faComments,
  faTimes,
  faArrowLeft,
  faChartBar,
  faTrash,
  faEye,
  faPrint,
  faHandsHelping,
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
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
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
  const { register, handleSubmit, reset, setValue, watch } = useForm();
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rekapPengaduan, setRekapPengaduan] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pengaduanToDelete, setPengaduanToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responsesMap, setResponsesMap] = useState({});
  const [newPengaduanCount, setNewPengaduanCount] = useState(0);
  const [responseCountsMap, setResponseCountsMap] = useState({});

  const fetchNewPengaduanCount = async () => {
    try {
      let cabang = null;
      if (userRole === "ADMIN") {
        cabang = userCabang; 
      }

      const count = await GlobalApi.countNewPengaduan(1, cabang); 
      setNewPengaduanCount(count);
    } catch (error) {
      console.error("Error fetching new pengaduan count:", error);
    }
  };

  useEffect(() => {
    fetchNewPengaduanCount();

    const interval = setInterval(fetchNewPengaduanCount, 60000); 

    return () => clearInterval(interval);
  }, [userRole, userCabang]); 

  const fetchResponseCounts = async () => {
    try {
      const counts = {};
      for (const pengaduan of pengaduanList) {
        const count = await GlobalApi.countResponsesByPengaduanId(pengaduan.id);
        counts[pengaduan.id] = count;
      }
      setResponseCountsMap(counts);
    } catch (error) {
      console.error("Error fetching response counts:", error);
    }
  };

  useEffect(() => {
    if (pengaduanList.length > 0) {
      fetchResponseCounts();
    }
  }, [pengaduanList]);

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

  const fetchRekapPengaduan = async () => {
    try {
      setLoading(true);
      const response = await GlobalApi.getAllRekapPengaduan();
      setRekapPengaduan(response);
    } catch (error) {
      console.error("Error fetching rekap pengaduan:", error);
      setNotification({
        type: 'error',
        message: 'Gagal memuat data rekap pengaduan'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPengaduan && (userRole === 'ADMIN' || userRole === 'SUPERADMIN' || userRole === 'USER')) {
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

    const role = sessionStorage.getItem("role");
    const nama = sessionStorage.getItem("nama");
    const email = sessionStorage.getItem("email") || "";
    const npa = sessionStorage.getItem("npa");
    const cabang = sessionStorage.getItem("cabang");
    const unitKerja = sessionStorage.getItem("unitKerja") || "-";

    const tempMessage = {
      id: Date.now(),
      message: message,
      senderRole: role,
      namaLengkap: nama,
      createdAt: new Date().toISOString().split('T')[0].split('-'),
      isTemporary: true
    };

    setResponses(prevResponses => [...prevResponses, tempMessage]);
    setChatHistory(prevHistory => [...prevHistory, {
      sender: role.toLowerCase(),
      message,
      timestamp: new Date().toISOString()
    }]);

    try {
      const responseData = {
        pengaduanId: selectedPengaduan.id,
        senderRole: role,
        message: message,
        namaLengkap: nama,
        email: email,
        npa: npa,
        unitKerja: unitKerja,
        cabang: cabang
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
                  {/* {selectedPengaduan.status || "Menunggu respon"} */}
                </span>
              </div>

              {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
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

  const renderPengaduanForm = (category) => {
    const categoryLabels = {
      pengaduan: "Pengaduan",
      kritikan: "Kritikan",
      "permohonan-bantuan": "Permohonan Bantuan",
    };

    return (
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          Buat {categoryLabels[category]}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
          <textarea
            {...register("deskripsi", { required: true })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
            placeholder={`Tulis ${categoryLabels[category]} Anda...`}
          ></textarea>
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

          {buktiFoto && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-500">Pratinjau Foto:</p>
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
            className="w-full py-2 rounded-lg transition mt-4 bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
        </form>
      </div>
    );
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const role = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa") || sessionStorage.getItem("npaPgri") || sessionStorage.getItem("npapgri");
      const cabang = sessionStorage.getItem("cabang");
      
      if (role) setUserRole(role);
      if (npa) setUserNpa(npa);
      if (cabang) setUserCabang(cabang);

      if (role === "SUPERADMIN" || role === "ADMIN") {
        fetchRekapPengaduan();
      }

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

      const currentRole = sessionStorage.getItem("role");
      const currentCabang = sessionStorage.getItem("cabang");
      const currentNpa = sessionStorage.getItem("npa");

      const sortedResponse = response.sort((a, b) =>
        new Date(...b.createdAt) - new Date(...a.createdAt)
      );

      let filteredPengaduan = [];

      if (currentRole === "SUPERADMIN") {
        filteredPengaduan = sortedResponse;
      } else if (currentRole === "ADMIN") {
        filteredPengaduan = sortedResponse.filter(
          (pengaduan) => pengaduan.cabang === currentCabang
        );
      } else {
        filteredPengaduan = sortedResponse.filter(
          (pengaduan) => pengaduan.npa === currentNpa
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
      
      const role = sessionStorage.getItem("role");
      const nama = sessionStorage.getItem("nama");
      const email = sessionStorage.getItem("email") || "";
      const npa = sessionStorage.getItem("npa");
      const cabang = sessionStorage.getItem("cabang");
      const unitKerja = sessionStorage.getItem("unitKerja") || "-";

      const pengaduanData = {
        namaLengkap: nama,
        email: email,
        npa: npa,
        cabang: cabang,
        unitKerja: unitKerja,
        category: selectedCategory, 
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
        type: 'error',
        message: `Gagal mengirim pengaduan. Silahkan Coba lagi`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsesForPengaduan = async (pengaduanId) => {
    try {
      const responses = await GlobalApi.getResponPengaduanByPengaduanId(pengaduanId);
      setResponsesMap(prev => ({ ...prev, [pengaduanId]: responses }));
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  useEffect(() => {
    rekapPengaduan.forEach(pengaduan => {
      fetchResponsesForPengaduan(pengaduan.id);
    });
  }, [rekapPengaduan]);

  const renderRekapPengaduan = () => {
    return (
      <div className="h-[74vh] overflow-y-auto">
        {/* Header dengan tombol panah kiri */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setModalType("respon")}
            className="text-gray-500 hover:text-blue-600 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          </button>
          <h3 className="text-2xl font-semibold text-center flex-grow">
            Rekapitulasi Pengaduan
          </h3>
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
            disabled={isLoading || rekapPengaduan.length === 0}
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" />
            {isLoading ? "Mencetak..." : "Cetak"}
          </button>
        </div>

        {loading ? (
          <p className="text-center">Memuat data rekap...</p>
        ) : rekapPengaduan.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada data rekap pengaduan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Kategori</th>
                  <th className="py-3 px-4 text-left">Cabang</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Aduan</th>
                  <th className="py-3 px-4 text-left">Respons</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekapPengaduan
                  .map((rekap) => (
                    <tr key={rekap.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{rekap.category}</td>
                      <td className="py-3 px-4">{rekap.cabang}</td>
                      <td className="py-3 px-4">
                        {new Date(...rekap.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">{rekap.keterangan}</td>
                      <td className="py-3 px-4">
                        {responsesMap[rekap.id]?.map((response, index) => (
                          <div key={index} className="mb-2">
                            <p className="text-sm text-gray-700">
                              <strong>{response.namaLengkap}:</strong> {response.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(...response.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeletePengaduan(rekap)}
                          className="text-red-500 hover:text-red-700 mr-2"
                          aria-label="Hapus"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                          onClick={() => {
                            handlePengaduanClick(rekap);
                            setModalType("respon");
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          aria-label="Lihat Detail"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {showDeleteConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[200]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4">Konfirmasi Hapus</h3>
              <p className="mb-6">
                Apakah Anda yakin ingin menghapus pengaduan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeletePengaduan}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handlePrint = async () => {
    setIsLoading(true);
    try {
      const filteredDataForPrint = rekapPengaduan;

      if (!filteredDataForPrint || filteredDataForPrint.length === 0) {
        toast.error("Tidak ada data yang tersedia untuk dicetak.");
        return;
      }

      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        toast.error("Gagal membuka jendela cetak. Pastikan pop-up diizinkan.");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <title>Rekapitulasi Pengaduan</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; text-align: center; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #2563eb; color: white; }
              tr:hover { background-color: #f5f5f5; }
              .response-item { margin-bottom: 8px; }
              .response-name { font-weight: bold; }
              .response-message { font-size: 0.875rem; }
              .response-time { font-size: 0.75rem; color: #666; }
            </style>
          </head>
          <body>
            <h3>Rekapitulasi Pengaduan</h3>
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Cabang</th>
                    <th>Tanggal</th>
                    <th>Aduan</th>
                    <th>Respons</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredDataForPrint
          .map(
            (item) => `
                    <tr>
                      <td>${item.category}</td>
                      <td>${item.cabang}</td>
                      <td>
                        ${item.createdAt
                ? new Date(...item.createdAt).toLocaleDateString('id-ID')
                : "-"}
                      </td>
                      <td>${item.keterangan}</td>
                      <td>
                        ${responsesMap[item.id]
                ? responsesMap[item.id]
                  .map((response, index) => `
                              <div class="response-item">
                                <div class="response-message">
                                  <span class="response-name">${response.namaLengkap}:</span> ${response.message}
                                </div>
                                <div class="response-time">
                                  ${new Date(...response.createdAt).toLocaleString('id-ID')}
                                </div>
                              </div>
                            `).join('')
                : ''}
                      </td>
                    </tr>
                  `
          )
          .join("")}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error selama proses cetak:", error);
      toast.error("Gagal mencetak data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePengaduan = (pengaduan) => {
    setPengaduanToDelete(pengaduan);
    setShowDeleteConfirmation(true);
  };

  const confirmDeletePengaduan = async () => {
    try {
      setLoading(true);
      await GlobalApi.deletePengaduan(pengaduanToDelete.id);

      fetchPengaduanList();
      if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
        fetchRekapPengaduan();
      }

      setNotification({
        type: 'success',
        message: 'Pengaduan berhasil dihapus'
      });

      if (selectedPengaduan && selectedPengaduan.id === pengaduanToDelete.id) {
        setSelectedPengaduan(null);
        setIsMobileChat(false);
      }

    } catch (error) {
      console.error("Error deleting pengaduan:", error);
      setNotification({
        type: 'error',
        message: 'Gagal menghapus pengaduan'
      });
    } finally {
      setShowDeleteConfirmation(false);
      setPengaduanToDelete(null);
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
              {userRole === "SUPERADMIN"
                ? "Pengaduan Anggota"
                : userRole === "ADMIN"
                  ? "Pengaduan Cabang"
                  : "Pengaduan Saya"}
            </h3>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : pengaduanList.length === 0 ? (
              <p className="text-gray-500 text-center">
                Belum ada pengaduan.
              </p>
            ) : (
              <ul className="space-y-3">
                {pengaduanList
                 
                  .map((pengaduan) => (
                    <li
                      key={pengaduan.id}
                      className="p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer relative"
                    >
                      <div onClick={() => handlePengaduanClick(pengaduan)}>
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
                            {/* {pengaduan.status || "Menunggu respon..."} */}
                          </p>
                          {/* {userRole === "ADMIN" && (
                            <p className="text-sm text-gray-500">
                              NPA: {pengaduan.npa}
                            </p>
                          )} */}
                        </div>
                      </div>

                     
                      {responseCountsMap[pengaduan.id] > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {responseCountsMap[pengaduan.id]}
                        </div>
                      )}

                  
                      {(userRole === "SUPERADMIN" ||
                        (userRole === "ADMIN" && pengaduan.cabang === userCabang)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePengaduan(pengaduan);
                            }}
                            className="absolute bottom-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                            aria-label="Hapus Pengaduan"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                    </li>
                  ))}
                {showDeleteConfirmation && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[200]">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                      <h3 className="text-xl font-bold text-red-600 mb-4">Konfirmasi Hapus</h3>
                      <p className="mb-6">
                        Apakah Anda yakin ingin menghapus pengaduan ini? Tindakan ini tidak dapat dibatalkan.
                      </p>
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                          disabled={loading}
                        >
                          Batal
                        </button>
                        <button
                          onClick={confirmDeletePengaduan}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          disabled={loading}
                        >
                          {loading ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {(userRole === "SUPERADMIN" || userRole === "ADMIN") && (
                  <div
                    onClick={() => setModalType("rekap")}
                    className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl shadow-xl cursor-pointer text-center 
      hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden
      before:absolute before:inset-0 before:bg-black before:opacity-0 
      hover:before:opacity-10 before:transition-opacity"
                  >
                    <div className="relative z-10">
                      <FontAwesomeIcon
                        icon={faChartBar}
                        className="text-4xl mb-3 transition-transform group-hover:rotate-12"
                      />
                      <p className="text-lg font-bold">Rekapitulasi Pengaduan</p>
                      <p className="text-sm opacity-75 mt-1">Lihat ringkasan semua pengaduan</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                )}
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
              {userRole === "SUPERADMIN"
                ? "Pengaduan Anggota"
                : userRole === "ADMIN"
                  ? "Pengaduan Cabang"
                  : "Pengaduan Saya"}
            </h3>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : pengaduanList.length === 0 ? (
              <p className="text-gray-500 text-center">
                Belum ada pengaduan.
              </p>
            ) : (
              <ul className="space-y-3">
                {pengaduanList
                  // .filter((pengaduan) =>
                  // userRole === "SUPERADMIN" || pengaduan.category !== "Permohonan Bantuan"
                  // )
                  .map((pengaduan) => (
                    <li
                      key={pengaduan.id}
                      className="p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer relative"
                    >
                      <div onClick={() => handlePengaduanClick(pengaduan)}>
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
                            {/* {pengaduan.status || "Menunggu respon..."} */}
                          </p>
                          {userRole === "ADMIN" && (
                            <p className="text-sm text-gray-500">
                              NPA: {pengaduan.npa}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Added notification badge in top right */}
                      {responseCountsMap[pengaduan.id] > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {responseCountsMap[pengaduan.id]}
                        </div>
                      )}

                      {/* Delete button moved to bottom right */}
                      {(userRole === "SUPERADMIN" ||
                        (userRole === "ADMIN" && pengaduan.cabang === userCabang)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePengaduan(pengaduan);
                            }}
                            className="absolute bottom-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                            aria-label="Hapus Pengaduan"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                    </li>
                  ))}
                {(userRole === "SUPERADMIN" || userRole === "ADMIN") && (
                  <div
                    onClick={() => setModalType("rekap")}
                    className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl shadow-xl cursor-pointer text-center 
                    hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden
                    before:absolute before:inset-0 before:bg-black before:opacity-0 
                    hover:before:opacity-10 before:transition-opacity"
                  >
                    <div className="relative z-10">
                      <FontAwesomeIcon
                        icon={faChartBar}
                        className="text-4xl mb-3 transition-transform group-hover:rotate-12"
                      />
                      <p className="text-lg font-bold">Rekapitulasi Pengaduan</p>
                      <p className="text-sm opacity-75 mt-1">Lihat ringkasan semua pengaduan</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                )}
              </ul>
            )}

            {/* Delete Confirmation Dialog - same as desktop */}
            {showDeleteConfirmation && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[200]">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Konfirmasi Hapus</h3>
                  <p className="mb-6">
                    Apakah Anda yakin ingin menghapus pengaduan ini? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      disabled={loading}
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDeletePengaduan}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Mobile Chat View
          renderChatContent()
        )}
      </div>
    );
  };

  const handleOpenResponModal = () => {
    setModalType("respon");
    setNewPengaduanCount(0); // Reset jumlah pengaduan baru
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
          <h2 className="text-3xl font-bold text-center mt-12 text-gray-800">
            Pengaduan Anggota
          </h2>

          {/* Card Section */}
          {/* Card Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-6xl mx-auto">
            {/* Card Pengaduan */}
            <div
              onClick={() => {
                setModalType("pengaduan");
                setSelectedCategory("Pengaduan");
              }}
              className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-xl cursor-pointer text-center hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transform rotate-45"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:rotate-12">
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text-3xl text-white"
                  />
                </div>
                <p className="text-xl font-bold mb-2">Pengaduan</p>
                <p className="text-sm opacity-90 mt-1">
                  Sampaikan keluhan atau permasalahan Anda
                </p>
                <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-medium">
                  Klik untuk memulai
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>

            {/* Card Kritikan */}
            <div
              onClick={() => {
                setModalType("kritikan");
                setSelectedCategory("Kritikan");
              }}
              className="p-6 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl shadow-xl cursor-pointer text-center hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transform rotate-45"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:rotate-12">
                  <FontAwesomeIcon
                    icon={faComments}
                    className="text-3xl text-white"
                  />
                </div>
                <p className="text-xl font-bold mb-2">Kritikan</p>
                <p className="text-sm opacity-90 mt-1">
                  Berikan kritik dan saran untuk perbaikan
                </p>
                <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-medium">
                  Klik untuk memulai
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>

            {/* Card Permohonan Bantuan */}
            <div
              onClick={() => {
                setModalType("permohonan-bantuan");
                setSelectedCategory("Permohonan Bantuan");
              }}
              className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl shadow-xl cursor-pointer text-center hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transform rotate-45"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:rotate-12">
                  <FontAwesomeIcon
                    icon={faHandsHelping}
                    className="text-3xl text-white"
                  />
                </div>
                <p className="text-xl font-bold mb-2">Permohonan Bantuan</p>
                <p className="text-sm opacity-90 mt-1">
                  Ajukan permohonan bantuan atau dukungan
                </p>
                <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-medium">
                  Klik untuk memulai
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>

            {/* Card Lihat Respon */}
            <div
              onClick={handleOpenResponModal}
              className="p-6 bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-2xl shadow-xl cursor-pointer text-center hover:scale-105 transition-all duration-500 ease-in-out group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transform rotate-45"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:rotate-12">
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="text-3xl text-white"
                  />
                </div>
                <p className="text-xl font-bold mb-2">Lihat Respon</p>
                <p className="text-sm opacity-90 mt-1">
                  Pantau status dan respon pengaduan Anda
                </p>
                <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-medium">
                  Klik untuk melihat
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              {/* Notifikasi Badge - Hanya tampilkan untuk ADMIN atau SUPERADMIN */}
              {(userRole === "ADMIN" || userRole === "SUPERADMIN") && newPengaduanCount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {newPengaduanCount}
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {modalType && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm animate-fade-in z-[100]"> {/* z-index modal */}
              <div className="bg-white p-6 mt-10 rounded-lg shadow-xl h-[86vh] w-[90vw] mx-auto relative overflow-hidden">
                <button
                  onClick={() => {
                    setModalType(null);
                    setIsMobileChat(false);
                    setSelectedCategory(null);
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
                {modalType === "pengaduan" ||
                  modalType === "kritikan" ||
                  modalType === "permohonan-bantuan"
                  ? renderPengaduanForm(modalType)
                  : modalType === "respon"
                    ? renderResponModal()
                    : renderRekapPengaduan()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
