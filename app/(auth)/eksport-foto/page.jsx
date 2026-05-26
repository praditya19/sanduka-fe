"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  Download,
  Building2,
  Users,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [exportMode, setExportMode] = useState("cabang");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [memberNpa, setMemberNpa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [isLoadingCabang, setIsLoadingCabang] = useState(false);
  const [openCabang, setOpenCabang] = useState(false);
  const [searchCabang, setSearchCabang] = useState("");
  const [isCheckingNpa, setIsCheckingNpa] = useState(false);
  const [dataNpa, setDataNpa] = useState(null);

  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize();
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router]);

  useEffect(() => {
    if (exportMode === "cabang") {
      const fetchCabang = async () => {
        setIsLoadingCabang(true);
        try {
          const res = await GlobalApi.getCabang();
          const data = Array.isArray(res) ? res : res?.data || [];

          const mapped = data.map((item) => ({
            id: item.id,
            nama: item.kecamatan,
            kode: item.idKecamatan,
          }));

          setCabangOptions(mapped);
        } catch (error) {
          console.error("Gagal mengambil data cabang:", error);
          setCabangOptions([]);
        } finally {
          setIsLoadingCabang(false);
        }
      };

      fetchCabang();
    }
  }, [exportMode]);

  const filteredCabang = cabangOptions.filter((item) =>
    item.nama.toLowerCase().includes(searchCabang.toLowerCase()),
  );
  const selectedCabangData = cabangOptions.find(
    (c) => String(c.id) === String(selectedCabang),
  );

  const handleCekNpa = async () => {
    if (!memberNpa) {
      setExportStatus({
        type: "error",
        message: "Silakan masukkan NPA terlebih dahulu",
      });
      return;
    }

    try {
      setIsCheckingNpa(true);
      setExportStatus(null);
      setDataNpa(null);

      const res = await GlobalApi.cekNpa(memberNpa);

      setDataNpa(res?.data || res);
    } catch (error) {
      console.error(error);
      setExportStatus({
        type: "error",
        message: error?.response?.data?.message || "NPA tidak ditemukan",
      });
    } finally {
      setIsCheckingNpa(false);
    }
  };
  const sanitizeFileName = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleExport = async () => {
    if (exportMode === "cabang" && !selectedCabang) {
      setExportStatus({
        type: "error",
        message: "Silakan pilih cabang terlebih dahulu",
      });
      return;
    }

    if (exportMode === "anggota") {
      if (!dataNpa) {
        setExportStatus({
          type: "error",
          message: "Silakan cek NPA terlebih dahulu",
        });
        return;
      }

      const res = await GlobalApi.downloadFotoByNpa(memberNpa);

      const contentType = res.headers["content-type"] || "image/png";

      let extension = "png";
      if (contentType.includes("jpeg")) extension = "jpg";
      if (contentType.includes("jpg")) extension = "jpg";

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const safeName = sanitizeFileName(dataNpa.namaLengkap);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName}-${memberNpa}.${extension}`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportStatus({
        type: "success",
        message: `Foto anggota ${dataNpa.namaLengkap} berhasil diekspor`,
      });
    }

    try {
      setIsExporting(true);
      setExportStatus(null);

      if (exportMode === "cabang") {
        const cabang = selectedCabangData?.nama;

        if (!cabang) {
          throw new Error("Cabang tidak valid");
        }

        const res = await GlobalApi.downloadFotoPerCabang(cabang);

        const blob = new Blob([res.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `foto-anggota-${cabang}.zip`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExportStatus({
          type: "success",
          message: `Foto anggota cabang ${cabang} berhasil diekspor`,
        });
      }
    } catch (error) {
      console.error(error);

      setExportStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Gagal mengekspor foto. Silakan coba lagi.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setDataNpa(null);
    setMemberNpa("");
    setExportStatus(null);
    setSelectedCabang(null);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          } p-4 md:p-6`}
        >
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Ekspor Foto Anggota
            </h1>
            <p className="text-gray-600">
              Ekspor foto anggota berdasarkan cabang atau NPA anggota tertentu
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Filter className="mr-2" size={20} />
                  Pilih Mode Ekspor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportMode("cabang")}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      exportMode === "cabang"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg mr-4 ${
                          exportMode === "cabang"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Building2 size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          Berdasarkan Cabang
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ekspor semua foto anggota dari cabang tertentu
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setExportMode("anggota")}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      exportMode === "anggota"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-lg mr-4 ${
                          exportMode === "anggota"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Users size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          Berdasarkan Anggota
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ekspor foto berdasarkan NPA anggota tertentu
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mb-8">
                {exportMode === "cabang" ? (
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">
                      Cabang
                    </label>

                    <button
                      type="button"
                      className="w-full border px-3 py-2 rounded text-left bg-white"
                      onClick={() => setOpenCabang(!openCabang)}
                    >
                      {selectedCabangData
                        ? selectedCabangData.nama
                        : "-- Pilih Cabang --"}
                    </button>

                    {openCabang && (
                      <div className="absolute z-50 w-full bg-white border rounded mt-1 shadow-lg">
                        <div className="p-2 border-b">
                          <input
                            type="text"
                            placeholder="Cari cabang..."
                            className="w-full border px-2 py-1 rounded text-sm"
                            value={searchCabang}
                            onChange={(e) => setSearchCabang(e.target.value)}
                          />
                        </div>

                        <ul className="max-h-48 overflow-y-auto text-sm">
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                            onClick={() => {
                              setSelectedCabang("");
                              setOpenCabang(false);
                            }}
                          >
                            -- Pilih Cabang --
                          </li>

                          {filteredCabang.length === 0 && (
                            <li className="px-3 py-2 text-gray-400">
                              Cabang tidak ditemukan
                            </li>
                          )}

                          {filteredCabang.map((item) => (
                            <li
                              key={item.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedCabang(item.id);
                                setOpenCabang(false);
                                setSearchCabang("");
                              }}
                            >
                              {item.nama}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium">
                        Masukkan NPA Anggota
                      </span>
                      <div className="relative mt-1 flex gap-2">
                        <input
                          type="text"
                          value={memberNpa}
                          onChange={(e) => setMemberNpa(e.target.value)}
                          placeholder="Contoh: 33200012355"
                          className="flex-1 p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <button
                          type="button"
                          onClick={handleCekNpa}
                          disabled={isCheckingNpa}
                          className="px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isCheckingNpa ? "Mengecek..." : "Cek NPA"}
                        </button>
                      </div>
                    </label>

                    {memberNpa && !dataNpa && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <Users className="text-green-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800">
                              Anggota dengan NPA: {memberNpa}
                            </h4>
                            <p className="text-sm text-green-600">
                              Klik <b>Cek NPA</b> untuk melihat detail anggota
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {dataNpa && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Data Anggota
                        </h4>

                        <div className="text-sm text-blue-700 space-y-1">
                          <div>
                            <b>Nama</b> : {dataNpa.namaLengkap}
                          </div>
                          <div>
                            <b>Cabang</b> : {dataNpa.cabang}
                          </div>
                          <div>
                            <b>Unit Kerja</b> : {dataNpa.unitKerja}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {exportStatus && (
                <div
                  className={`mb-6 p-4 rounded-xl ${
                    exportStatus.type === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    {exportStatus.type === "success" ? (
                      <CheckCircle2 className="text-green-600 mr-3" />
                    ) : (
                      <AlertCircle className="text-red-600 mr-3" />
                    )}
                    <span
                      className={
                        exportStatus.type === "success"
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      {exportStatus.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  disabled={
                    isExporting ||
                    (exportMode === "cabang" && !selectedCabang) ||
                    (exportMode === "anggota" && !dataNpa)
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Sedang Mengekspor...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2" size={20} />
                      Ekspor Foto
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={isExporting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle
                    className="text-gray-500 mr-3 mt-0.5"
                    size={18}
                  />
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      Informasi Ekspor
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Foto akan diunduh dalam format ZIP</li>
                      <li>• Ukuran file tergantung jumlah foto</li>
                      <li>
                        • Proses ekspor mungkin memerlukan waktu beberapa menit
                      </li>
                      <li>• Pastikan koneksi internet stabil</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
