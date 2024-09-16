"use client";
import { useState, useEffect } from "react";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AddUnitForm = () => {
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
  const [unitKerja, setUnitKerja] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cabang, setCabang] = useState([]);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchCabang = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabang(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
      fetchCabang();

      const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
      setIsSidebarOpen(sidebarState);

      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [token, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleFormSubmit = async () => {
    try {
      const payload = {
        cabang: selectedCabang,
        unitKerja: unitKerja,
      };
      const response = await GlobalApi.addUnitKerja(payload);
      setSelectedCabang("-- Cabang --");
      setUnitKerja("");

      toast.success("Unit Kerja berhasil ditambahkan!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error("Gagal menambahkan Unit Kerja. Coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 mt-4 sm:mt-0 ml-4 sm:ml-0">
      <Toaster />
      {isMobile ? (
       <HeaderMobile />
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <nav className="mt-6">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                <li>
                  <Link
                    href="/pengaturan/user"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    User

                  </Link>
                </li>
                <li>
                  <Link
                    href="/pengaturan/unit-kerja"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Unit Kerja
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pengaturan/tambah"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Tambah
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <h2 className="text-base font-bold mb-4 text-center text-teal-600">
                TAMBAH UNIT KERJA
              </h2>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="branch"
                >
                  Cabang
                </label>
                <select
                  className="shadow appearance-none border rounded w-full md:w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                >
                  <option value="">-- Cabang --</option>
                  {cabang.map((item) => (
                    <option key={item.id} value={item.kecamatan}>
                      {item.kecamatan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="unit"
                >
                  Isi Unit Kerja Tambahan
                </label>
                <input
                  id="unit"
                  type="text"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  placeholder="Tambah Unit kerja"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleFormSubmit}
                >
                  TAMBAH UNIT KERJA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUnitForm;