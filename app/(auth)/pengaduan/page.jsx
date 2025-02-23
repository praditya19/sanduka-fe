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

export default function PengaduanPage() {
  const { register, handleSubmit, reset } = useForm();
  // const [pengaduanList, setPengaduanList] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [buktiFoto, setBuktiFoto] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const handlePengaduanClick = (pengaduan) => {
    setSelectedPengaduan(pengaduan);
    setChatHistory([]);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setChatHistory([...chatHistory, { sender: "admin", message }]);
    setMessage("");
  };
  const pengaduanList = [
    {
      id: 1,
      kategori: "Sampah di jalan",
      deskripsi:
        "Terdapat tumpukan sampah di sepanjang jalan desa yang mengganggu kenyamanan warga.",
      response: "Sudah dijadwalkan untuk diambil besok pagi.",
    },
    {
      id: 2,
      kategori: "Kerusakan jalan",
      deskripsi:
        "Jalan utama desa rusak parah, banyak lubang yang membahayakan pengendara.",
      response: "Laporan sedang diproses oleh tim perbaikan.",
    },
    {
      id: 3,
      kategori: "Kebersihan lingkungan",
      deskripsi:
        "Beberapa saluran air tersumbat oleh sampah, menyebabkan genangan air di musim hujan.",
      response: "Proses pembersihan saluran air sedang dilakukan.",
    },
    {
      id: 4,
      kategori: "Pencurian",
      deskripsi:
        "Terjadi pencurian di rumah warga pada malam hari, barang berharga hilang.",
      response: "Polisi sedang melakukan penyelidikan.",
    },
    {
      id: 5,
      kategori: "Gangguan listrik",
      deskripsi:
        "Sering terjadi pemadaman listrik yang tidak terjadwal di beberapa kawasan desa.",
      response: "Tim PLN sedang melakukan perbaikan jaringan.",
    },
  ];

  useEffect(() => {
    if (!token) router.push("/sign-in");
    else {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router]);

  const onSubmit = (data) => {
    const npa = sessionStorage.getItem("npa");
    const nama = sessionStorage.getItem("nama");
    const cabang = sessionStorage.getItem("cabang");
    const unitKerja = sessionStorage.getItem("unit_kerja");

    const newPengaduan = {
      ...data,
      status: "Menunggu Respon",
      response: "",
      npa,
      nama,
      cabang,
      unitKerja,
    };

    setPengaduanList([newPengaduan, ...pengaduanList]);
    reset();
    setModalType(null);
    toast.success("Pengaduan berhasil dikirim!");
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
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
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
              <div className="bg-white p-6 rounded-lg shadow-xl h-[80vh] w-[90vw] mx-auto relative">
                <button
                  onClick={() => setModalType(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
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
                        {...register("kategori")}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pengaduan">Pengaduan</option>
                        <option value="Kritikan">Kritikan</option>
                        <option value="Permohonan Bantuan">
                          Permohonan Bantuan
                        </option>
                      </select>

                      <textarea
                        {...register("deskripsi")}
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
                            className="w-full h-40 object-cover rounded-lg mt-2"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Kirim
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex h-[74vh]">
                    {/* Sidebar Pengaduan */}
                    <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
                      <h3 className="text-2xl font-semibold mb-4 text-center">
                        Respon Pengaduan
                      </h3>
                      {pengaduanList.length === 0 ? (
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
                                {pengaduan.kategori}
                              </h4>
                              <p className="text-gray-600">
                                {pengaduan.deskripsi}
                              </p>
                              <p className="text-sm text-blue-600 mt-2">
                                {pengaduan.response
                                  ? `Respon: ${pengaduan.response}`
                                  : "Menunggu respon..."}
                              </p>
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
                              {selectedPengaduan.kategori}
                            </h4>
                            <div className="space-y-4">
                              {/* Chat History */}
                              {chatHistory.map((chat, index) => (
                                <div
                                  key={index}
                                  className={`flex ${
                                    chat.sender === "admin"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs p-2 rounded-lg ${
                                      chat.sender === "admin"
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
                        <p className="text-center text-gray-500">
                          Pilih pengaduan untuk mulai chat.
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
