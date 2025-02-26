"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faComments,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";

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

  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const handlePengaduanClick = (pengaduan) => {
    setSelectedPengaduan(pengaduan);
    setChatHistory([]);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setChatHistory([...chatHistory, { sender: "user", message }]);
    setMessage("");
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
      toast.error("Gagal memuat daftar pengaduan");
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
      toast.success("Pengaduan berhasil dikirim!");

    } catch (error) {
      console.error("Error submitting pengaduan:", error);
      toast.error("Gagal mengirim pengaduan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster />
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <h2 className="text-3xl font-bold text-center mt-8 text-gray-800">
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
                  onClick={() => setModalType(null)}
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
                      {selectedPengaduan ? (
                        <div className="flex flex-col h-full">
                          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4">
                            <h4 className="text-xl font-semibold mb-4">
                              {selectedPengaduan.category}
                            </h4>
                            <div className="space-y-4">
                              {/* Display pengaduan details */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                {userRole === "ADMIN" && (
                                  <div className="mb-3 pb-2 border-b">
                                    <p><strong>Pengirim:</strong> {selectedPengaduan.namaLengkap}</p>
                                    <p><strong>NPA:</strong> {selectedPengaduan.npa}</p>
                                    <p><strong>Unit Kerja:</strong> {selectedPengaduan.unitKerja}</p>
                                  </div>
                                )}

                                <p><strong>Deskripsi:</strong> {selectedPengaduan.keterangan}</p>
                                <p className="mt-2"><strong>Status:</strong> {selectedPengaduan.status || "Menunggu respon"}</p>

                                {/* Display bukti if available */}
                                {selectedPengaduan.bukti && (
                                  <div className="mt-3">
                                    <p><strong>Bukti:</strong></p>
                                    <img
                                      src={`data:image/*;base64,${selectedPengaduan.bukti}`}
                                      alt="Bukti Pengaduan"
                                      className="mt-2 max-w-xs rounded-lg"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Chat History */}
                              {chatHistory.map((chat, index) => (
                                <div
                                  key={index}
                                  className={`flex ${chat.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                                >
                                  <div
                                    className={`max-w-xs p-3 rounded-lg ${chat.sender === "user"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-300"
                                      }`}
                                  >
                                    {chat.message}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gray-100 border-t">
                            <input
                              type="text"
                              className="flex-1 p-2 border rounded-lg"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Ketik pesan..."
                            />
                            <button
                              className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                              onClick={handleSendMessage}
                            >
                              Kirim
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 p-4">
                          Pilih pengaduan untuk melihat detail.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
