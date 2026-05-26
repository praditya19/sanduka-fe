"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaTimes, FaMinus } from "react-icons/fa";

const AIChat = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Halo! Saya Sanduka AI. Saya sudah memantau data keuangan terbaru. Ada yang bisa saya bantu?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Smart AI Response Logic
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const current = data || { saldo: 0, pemasukan: 0, pengeluaran: 0 };
      
      const format = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

      let botResponse = "Saya mengerti. Terkait hal itu, Anda bisa mengecek detailnya di menu 'Input Data Utama' atau melihat tabel rekapitulasi di bawah. Ada hal spesifik lain yang ingin Anda ketahui?";

      if (lowerInput.includes("saldo")) {
        botResponse = `Berdasarkan data terbaru, Total Saldo kita saat ini adalah ${format(current.saldo)}. Angka ini sudah mencakup seluruh transaksi yang tercatat sampai hari ini.`;
      } else if (lowerInput.includes("pemasukan") || lowerInput.includes("masuk")) {
        botResponse = `Total pemasukan yang tercatat bulan ini adalah ${format(current.pemasukan)}. Sumber utamanya berasal dari Iuran Sanduka dan Iuran PGRI.`;
      } else if (lowerInput.includes("keluar") || lowerInput.includes("pengeluaran")) {
        botResponse = `Total pengeluaran saat ini sebesar ${format(current.pengeluaran)}. Anda bisa melihat rincian pengeluaran per kategori di halaman Detail Keuangan.`;
      } else if (lowerInput.includes("daspen")) {
        botResponse = "Modul Daspen digunakan untuk mengelola Dana Pensiun anggota. Anda bisa mengatur kuota dasar dan besaran per kategori (I, II, III) di bagian Input.";
      } else if (lowerInput.includes("derap")) {
        botResponse = "Modul Derap (Dana Reboan Anggota PGRI) menangani distribusi iuran khusus. Pastikan target setoran per cabang sudah dikunci sebelum melakukan distribusi.";
      } else if (lowerInput.includes("halo") || lowerInput.includes("hai")) {
        botResponse = "Halo! Saya asisten AI Anda. Saya bisa membantu memberikan ringkasan saldo, informasi pemasukan, atau menjelaskan cara kerja modul di Keuangan New ini.";
      } else if (lowerInput.includes("terima kasih") || lowerInput.includes("thanks")) {
        botResponse = "Sama-sama! Senang bisa membantu mengelola keuangan Sanduka. Jangan ragu untuk bertanya lagi jika butuh bantuan.";
      }

      setMessages(prev => [...prev, { role: "bot", text: botResponse }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center"
          >
            <FaRobot size={28} className="animate-pulse" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FaRobot />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sanduka AI Assistant</h3>
                  <p className="text-[10px] text-emerald-100">Online • Cerdas & Responsif</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
                  <FaMinus size={14} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya sesuatu..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all"
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChat;
