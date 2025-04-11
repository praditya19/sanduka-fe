"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMobile from "@/app/_components/HeaderMobile";
import HeaderMenu from "@/app/_components/HeaderMenu";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

export default function Tagihan() {
  const router = useRouter();
  const { token } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const generatePowerOfAttorneyPDF = () => {
    alert("Surat Kuasa sedang diunduh...");

    const fileId = "19gHtiUna9_qufcUGI7fc6uYrJAgvEg7n";
    const downloadUrl = `https://docs.google.com/document/d/${fileId}/export?format=docx`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "Surat_Kuasa.docx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      alert("Surat Kuasa berhasil diunduh!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <main className="container mx-auto py-10 px-4 flex-grow">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-lg mx-auto mb-8 mt-10">
              <div className="px-6 py-4 bg-blue-600 text-white">
                <h1 className="text-2xl font-bold text-center">
                  TAGIHAN ANGGOTA
                </h1>
              </div>

              <div className="p-8 text-center">
                <div className="mb-8">
                  <svg
                    className="w-20 h-20 mx-auto text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>

                  <h2 className="text-xl font-bold mt-4 mb-2">
                    Detail Tagihan Sedang Dalam Proses
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Terima kasih atas kesabaran Anda. Detail tagihan Anda sedang
                    diproses dan akan tersedia dalam beberapa hari kedepan.
                  </p>
                </div>

                <button
                  onClick={generatePowerOfAttorneyPDF}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out flex items-center justify-center mx-auto"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  Download Surat Kuasa
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
