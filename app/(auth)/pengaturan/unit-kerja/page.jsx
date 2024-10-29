"use client";
import { useState, useEffect, useRef } from "react";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AddUnitForm = () => {
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cabang, setCabang] = useState([]);
  const [filteredCabang, setFilteredCabang] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // State for controlling dropdown visibility
  const dropdownRef = useRef(null); // Reference for dropdown
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleCabangChange = (e) => {
    const searchValue = e.target.value;
    setSelectedCabang(searchValue);
    setShowDropdown(true); // Show dropdown on input change

    const filtered = cabang.filter((item) =>
      item.kecamatan.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCabang(filtered);
  };

  const handleCabangSelect = (cabangName) => {
    setSelectedCabang(cabangName);
    setShowDropdown(false); // Hide dropdown on cabang selection
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 mt-4 sm:mt-0 ml-4 sm:ml-0">
       <Toaster
          toastOptions={{
            style: {
              fontSize: "1.25rem", // Ukuran font yang lebih besar
              padding: "16px", // Menambah padding jika diperlukan
            },
            success: {
              style: {
                background: "white", // Warna background hijau untuk pesan sukses
                color: "black",
              },
            },
            error: {
              style: {
                background: "#f44336", // Warna background merah untuk pesan error
                color: "#fff",
              },
            },
          }}
        />
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
                <input
        type="text"
        value={selectedCabang}
        onChange={handleCabangChange}
        placeholder="Cari cabang..."
        onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
      />
      {showDropdown && selectedCabang && (
        <div
          ref={dropdownRef}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 max-h-48 overflow-y-auto"
        >
          {filteredCabang.length > 0 ? (
            filteredCabang.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCabangSelect(item.kecamatan)}
                className="cursor-pointer hover:bg-gray-200 p-1"
              >
                {item.kecamatan}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Cabang tidak ditemukan</div>
          )}
        </div>
      )}
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