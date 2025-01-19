"use client";
import { useState, useEffect, useRef } from "react";
import {
  faCalendarAlt,
  faUserTie,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";

const TemanUnitKerja = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [cardsData, setCardsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  // const [unitKerja, setUnitKerja] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [temanUnitKerjaData, setTemanUnitKerjaData] = useState([]);
  const [queryUnit, setQueryUnit] = useState("");
  const [queryCabang, setQueryCabang] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");

  const fetchTemanUnitKerja = async () => {
    try {
      // Ambil nilai unitKerja dari sessionStorage
      const unitKerja = sessionStorage.getItem("unitKerja");

      if (!unitKerja) {
        console.error("unitKerja is not available in sessionStorage.");
        return;
      }

      // Tampilkan unitKerja di console
      console.log("Fetched unitKerja from sessionStorage:", unitKerja);

      const result = await GlobalApi.getTemanUnitKerja(
        unitKerja,
        currentPage - 1,
        itemsPerPage
      );

      setCardsData(result.content || []);

      const fotoBase64Array = result.content.map((item) => {
        if (item.foto) {
          try {
            return atob(item.foto);
          } catch (error) {
            console.error("Error decoding Base64 for item:", item, error);
            return null;
          }
        }
        return null;
      });

      setFotoBase64(fotoBase64Array);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTemanUnitKerja();
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const fetchData = async () => {
        try {
          const [cabangResponse, unitKerjaResponse] = await Promise.all([
            GlobalApi.getCabang(),
            GlobalApi.getUnitKerja(),
          ]);

          setCabangOptions(cabangResponse.data);
          setUnitKerjaOptions(unitKerjaResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
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
    if (selectedCabang) {
      // Filter unit kerja berdasarkan cabang yang dipilih
      const unitsForSelectedCabang = unitKerjaOptions.filter(
        (unit) => unit.cabangId === selectedCabang.idKecamatan
      );
      setFilteredUnitKerja(unitsForSelectedCabang); // Update filtered unit kerja
    } else {
      // Jika cabang belum dipilih, tampilkan seluruh unit kerja
      setFilteredUnitKerja(unitKerjaOptions);
    }
  }, [selectedCabang, unitKerjaOptions]);

  const handleCabangSelect = (cabang) => {
    console.log("Cabang selected:", cabang);

    setQueryCabang(cabang.kecamatan);
    setSelectedCabang(cabang.kecamatan);
    setShowDropdownCabang(false);

    // Filter unit kerja berdasarkan cabang yang dipilih
    const unitsForSelectedCabang = unitKerjaOptions.filter(
      (unit) => unit.cabang === cabang.kecamatan
    );

    setFilteredUnitKerja(unitsForSelectedCabang);
    console.log("Filtered Unit Kerja:", unitsForSelectedCabang);
  };

  const handleFilterCabangClick = () => {
    setQueryCabang("");
    setSelectedCabang(null);
    // setFilteredUnitKerja([]);
    setUnitKerja("");
  };

  const handleClick = (event, pageNumber) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
  };

  // const handleUnitKerjaChange = async (selectedUnitKerja) => {
  //   console.log("Unit Kerja yang dipilih:", selectedUnitKerja);

  //   // Panggil fetchTemanUnitKerja setelah unit kerja dipilih
  //   await fetchTemanUnitKerja(selectedUnitKerja);
  // };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(cardsData.length / itemsPerPage); i++) {
      pageNumbers.push(
        <li key={i}>
          <a
            href="#"
            onClick={(event) => handleClick(event, i)}
            className={`px-3 py-1 rounded-full shadow-md ${
              currentPage === i
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition duration-300"
            }`}
          >
            {i}
          </a>
        </li>
      );
    }
    return pageNumbers;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(cardsData)
    ? cardsData.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const profileImageUrl = "/profile.png";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen flex flex-col items-center justify-start bg-gray-300 pt-4 px-4">
            {/* <div className="w-full flex flex-col items-start relative">
              <Label className="block text-sm font-medium mb-1">Cabang</Label>
              <Input
                id="cabangInput"
                type="text"
                className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                placeholder="Pilih Cabang"
                value={
                  sessionStorage.getItem("role") === "SUPER ADMIN"
                    ? queryCabang
                    : sessionStorage.getItem("cabang")
                }
                disabled={sessionStorage.getItem("role") !== "SUPER ADMIN"}
                readOnly={sessionStorage.getItem("role") !== "SUPER ADMIN"}
                onClick={() => {
                  if (sessionStorage.getItem("role") === "SUPER ADMIN") {
                    setQueryCabang("");
                    setShowDropdownCabang(true);
                  }
                }}
              />

              {showDropdownCabang &&
                sessionStorage.getItem("role") === "SUPER ADMIN" && (
                  <div
                    id="dropdownCabang"
                    className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[10%] w-full"
                  >
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="py-2 px-2">
                        <Input
                          type="text"
                          className="border-b p-2 w-full bg-white"
                          placeholder="Cari Cabang..."
                          value={queryCabang}
                          onClick={handleFilterCabangClick}
                          onChange={(e) => {
                            setQueryCabang(e.target.value);
                          }}
                          autoFocus
                        />
                      </li>
                      <li
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleCabangSelect({
                            kecamatan: "",
                            idKecamatan: null,
                          })
                        }
                      >
                        Pilih Cabang
                      </li>
                      {cabangOptions
                        .filter((cabang) =>
                          cabang.kecamatan
                            .toLowerCase()
                            .includes(queryCabang.toLowerCase())
                        )
                        .map((cabang) => (
                          <li
                            key={cabang.idKecamatan}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleCabangSelect(cabang)}
                          >
                            {cabang.kecamatan}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div> */}

            {/* <div className="w-full flex flex-col items-start mt-3">
              <Label className="block text-sm font-medium mb-1">
                Unit Kerja
              </Label>
              <Input
                type="text"
                className="border rounded-lg p-2 w-full bg-white shadow-sm"
                placeholder="Pilih Unit Kerja"
                value={queryUnit}
                readOnly
                onChange={(e) => setQueryUnit(e.target.value)}
                onClick={() => {
                  setQueryUnit("");
                  setShowDropdownUnit(true);
                }}
              />

              {showDropdownUnit && filteredUnitKerja.length > 0 && (
                <div
                  className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[4.5%] w-[43%]"
                  id="dropdownUnit"
                >
                  <ul className="max-h-44 overflow-y-auto">
                    <li className="py-2 px-2">
                      <Input
                        id="searchInput"
                        type="text"
                        className="border-b p-2 w-full bg-white mb-1"
                        placeholder="Cari Unit Kerja..."
                        value={queryUnit}
                        onChange={(e) => setQueryUnit(e.target.value)}
                        autoFocus
                      />
                    </li>
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setShowDropdownUnit(false);
                      }}
                    >
                      Pilih Unit Kerja
                    </li>
                    {filteredUnitKerja
                      .filter((unit) =>
                        unit.unitKerja
                          .toLowerCase()
                          .includes(queryUnit.toLowerCase())
                      )
                      .map((unit) => (
                        <li
                          key={unit.id}
                          value={unit.unitKerja}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={async () => {
                            await handleUnitKerjaChange(unit.unitKerja); // Panggil fungsi handle
                            setShowDropdownUnit(false); // Tutup dropdown
                          }}
                        >
                          {unit.unitKerja}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              {currentItems.map((data, index) => {
                const fotoFromState = fotoBase64[index];
                const base64Image = fotoFromState
                  ? `data:image/jpeg;base64,${fotoFromState}`
                  : profileImageUrl;

                return (
                  <div
                    key={index}
                    className="bg-white items-center rounded-lg shadow-lg p-3 border border-gray-200 w-full hover:shadow-xl transition duration-300 ease-in-out"
                  >
                    <div className="bg-teal-500 text-white p-2 rounded-t-lg mb-4 w-full">
                      <h2 className="text-sm font-semibold w-full">
                        {data.namaLengkap}
                      </h2>
                      <p className="text-xs w-full">{data.npaPgri}</p>
                    </div>

                    <div className="flex w-full items-center">
                      <div className="flex-shrink-0 w-1/3 flex justify-center">
                        <Image
                          src={base64Image}
                          width={80}
                          height={80}
                          alt={
                            fotoFromState
                              ? "Anggota Foto"
                              : `Fallback Image: ${profileImageUrl}`
                          }
                          className="rounded-full border-2 border-gray-200 max-w-[80px] max-h-[80px]"
                        />
                      </div>

                      <div className="ml-2 w-2/3">
                        <div className="flex items-center text-gray-800 text-sm mb-1">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="text-gray-600"
                          />
                          <span className="ml-2">
                            {formatDate(data.tanggalLahir)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-800 text-sm mb-1">
                          <FontAwesomeIcon
                            icon={faUserTie}
                            className="text-gray-600"
                          />
                          <span className="ml-2">{data.jabatan}</span>
                        </div>
                        <div className="flex items-center text-gray-800 text-sm">
                          <FontAwesomeIcon
                            icon={faHome}
                            className="text-gray-600"
                          />
                          <span className="ml-2">{data.alamat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 justify-items-center">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 text-sm">
                        <div className="flex items-center">
                          <span className="font-semibold">Daspen:</span>
                          <span className="ml-2">
                            {data.pesertaDaspen ? "✔" : "✘"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold">KTA Digital:</span>
                          <span className="ml-2">
                            {data.pesertaKtaDigital ? "✔" : "✘"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold">Sanduka:</span>
                          <span className="ml-2">
                            {data.pesertaSanduka ? "✔" : "✘"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <ul className="flex mt-4 space-x-2">
              {currentPage > 1 && (
                <li>
                  <a
                    href="#"
                    onClick={(event) => handleClick(event, currentPage - 1)}
                    className="px-2 py-1 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition duration-300"
                  >
                    &lt;
                  </a>
                </li>
              )}
              {renderPageNumbers()}
              {currentPage < Math.ceil(cardsData.length / itemsPerPage) && (
                <li>
                  <a
                    href="#"
                    onClick={(event) => handleClick(event, currentPage + 1)}
                    className="px-2 py-1 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition duration-300"
                  >
                    &gt;
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemanUnitKerja;
