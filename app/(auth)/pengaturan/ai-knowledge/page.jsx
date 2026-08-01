"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import {
  Sparkles,
  Bot,
  Send,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BookOpen,
  MessageSquare,
  X,
  Database
} from "lucide-react";

export default function AiKnowledgePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userRole = typeof window !== "undefined" ? sessionStorage.getItem("role") : null;
    if (userRole && userRole !== "SUPERADMIN") {
      router.push("/home");
    }
  }, [router]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    topik: "",
    kataKunci: "",
    konten: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Playground Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Halo Super Admin! Ini adalah **Trial Playground AI Sanduka**. Coba tambahkan data/SOP baru di sebelah kiri, lalu tes tanyakan di sini untuk melihat respons AI secara real-time!",
      toolsExecuted: [],
    },
  ]);
  const [inputChat, setInputChat] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:8080"
      : BASE_URL);

  const fetchKnowledge = async () => {
    setLoadingList(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${apiBaseUrl}/api/v1/ai/knowledge`, { headers });
      setKnowledgeList(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data AI Knowledge:", err);
      toast.error("Gagal memuat daftar AI Knowledge Base.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({ topik: "", kataKunci: "", konten: "", isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      topik: item.topik || "",
      kataKunci: item.kataKunci || "",
      konten: item.konten || "",
      isActive: item.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pengetahuan ini?")) return;
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await axios.delete(`${apiBaseUrl}/api/v1/ai/knowledge/${id}`, { headers });
      toast.success("Pengetahuan AI berhasil dihapus!");
      fetchKnowledge();
    } catch (err) {
      console.error("Gagal menghapus knowledge:", err);
      toast.error("Gagal menghapus data pengetahuan.");
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.topik.trim() || !formData.konten.trim()) {
      toast.error("Topik dan Konten wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (editingItem) {
        await axios.put(`${apiBaseUrl}/api/v1/ai/knowledge/${editingItem.id}`, formData, { headers });
        toast.success("Pengetahuan AI berhasil diperbarui!");
      } else {
        await axios.post(`${apiBaseUrl}/api/v1/ai/knowledge`, formData, { headers });
        toast.success("Pengetahuan AI baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchKnowledge();
    } catch (err) {
      console.error("Gagal menyimpan knowledge:", err);
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTrialChat = async (customMessage = null) => {
    const textToSend = customMessage || inputChat;
    if (!textToSend.trim() || chatLoading) return;

    const newMsgs = [...chatMessages, { role: "user", text: textToSend }];
    setChatMessages(newMsgs);
    if (!customMessage) setInputChat("");
    setChatLoading(true);

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const historyPayload = chatMessages
        .filter((m) => (m.role === "user" || m.role === "assistant") && !m.text.includes("Gagal"))
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

      const res = await axios.post(
        `${apiBaseUrl}/api/v1/ai/chat`,
        { message: textToSend, history: historyPayload },
        { headers }
      );

      if (res.data && res.data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.data.reply,
            toolsExecuted: res.data.toolsExecuted || [],
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Tidak ada respons dari AI." },
        ]);
      }
    } catch (err) {
      console.error("Trial chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Gagal menghubungkan trial chat ke AI backend." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredKnowledge = knowledgeList.filter(
    (k) =>
      k.topik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.kataKunci?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.konten?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <Toaster position="top-right" />
      <HeaderMenu />
      <HeaderMobile />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header Page */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  Knowledge Base AI Sanduka <span className="text-xs bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-normal">Super Admin</span>
                </h1>
                <p className="text-xs md:text-sm text-emerald-100/90 mt-1">
                  Kelola pengetahuan, SOP, dan aturan dinamis AI Sanduka. Data baru yang Anda tambahkan akan langsung dibaca AI secara otomatis!
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm"
            >
              <Plus className="w-5 h-5" /> Tambah Pengetahuan Baru
            </button>
          </div>

          {/* Main Grid: Management Table (Left) + Trial Chat Playground (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Data Table (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    Daftar Knowledge Base ({filteredKnowledge.length})
                  </h2>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari topik / kata kunci..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Topik & Kata Kunci</th>
                      <th className="p-3.5">Konten / Informasi SOP</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {loadingList ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                          Memuat data pengetahuan AI...
                        </td>
                      </tr>
                    ) : filteredKnowledge.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">
                          Belum ada pengetahuan AI yang sesuai. Klik "Tambah Pengetahuan Baru" untuk membuat.
                        </td>
                      </tr>
                    ) : (
                      filteredKnowledge.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 align-top max-w-[180px]">
                            <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">{item.topik}</div>
                            {item.kataKunci && (
                              <div className="flex flex-wrap gap-1">
                                {item.kataKunci.split(",").map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-md font-mono border border-emerald-200 dark:border-emerald-800"
                                  >
                                    #{tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 align-top">
                            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-xs leading-relaxed line-clamp-4">
                              {item.konten}
                            </p>
                          </td>
                          <td className="p-3.5 align-top text-center">
                            {item.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                                <XCircle className="w-3.5 h-3.5" /> Nonaktif
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 align-top text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 rounded-lg transition-colors"
                                title="Edit Pengetahuan"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600 rounded-lg transition-colors"
                                title="Hapus Pengetahuan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Live AI Trial Playground (5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col h-[650px]">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      AI Trial Chat Playground <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Simulasi respons AI langsung dari database terbaru</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setChatMessages([
                      {
                        role: "assistant",
                        text: "Percakapan trial telah dibersihkan. Silakan ajukan pertanyaan baru!",
                        toolsExecuted: [],
                      },
                    ])
                  }
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors"
                  title="Reset Trial Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap gap-1">
                          {msg.toolsExecuted.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-2 justify-start items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendTrialChat();
                }}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  placeholder="Ketik pertanyaan untuk mengetes AI..."
                  disabled={chatLoading}
                  className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputChat.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Add / Edit Knowledge */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {editingItem ? "Edit Pengetahuan AI" : "Tambah Pengetahuan AI Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Topik Pengetahuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topik}
                  onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                  placeholder="Misal: Jam Pelayanan Sekretariat / Syarat Klaim Duka"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Kata Kunci (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.kataKunci}
                  onChange={(e) => setFormData({ ...formData, kataKunci: e.target.value })}
                  placeholder="Misal: pelayanan, buka, jam, sekretariat, jepara"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Detail Informasi / Konten SOP <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  placeholder="Tuliskan aturan, syarat, atau informasi detail yang ingin diajarkan ke AI..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Aktifkan pengetahuan ini untuk AI Assistant
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Pengetahuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
