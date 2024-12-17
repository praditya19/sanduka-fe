"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

export default function Daspen() {
  const dropdownRef = useRef(null);
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [katagori1Lainnya, setKatagori1Lainnya] = useState(0);
  const [katagori2Lainnya, setKatagori2Lainnya] = useState(0);
  const [katagori3Lainnya, setKatagori3Lainnya] = useState(0);
  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [valueKat1, setValueKat1] = useState(0);
  const [valueKat2, setValueKat2] = useState(0);
  const [valueKat3, setValueKat3] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [perolehanCabang, setPerolehanCabang] = useState(0);
  const [perolehanKabupaten, setPerolehanKabupaten] = useState(0);
  const [perolehanProvinsi, setPerolehanProvinsi] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const tableRef = useRef();
  const currentYear = new Date().getFullYear();
  const startYear = 2020;

  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTableData, setFilteredTableData] = useState(tableData);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [chosenCabang, setChosenCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);

  const [newCabangList, setNewCabangList] = useState([]);
  const [selectedBulanBaru, setSelectedBulanBaru] = useState("");
  const [newSelectedYear, setNewSelectedYear] = useState(
    new Date().getFullYear()
  );

  const fetchData = async () => {
    try {
      const data = await GlobalApi.getTableDaspen(
        selectedBulanBaru,
        newSelectedYear,
        newCabangList
      );
  console.log("data",data)
      
      const jumlahRow = data.find((row) => row["Cabang/Khusus"] === "Jumlah");
      const filteredData = data.filter((row) => row["Cabang/Khusus"] !== "Jumlah");
  
      const sortedData = jumlahRow ? [...filteredData, jumlahRow] : filteredData;
  
      setTableData(sortedData);
      setFilteredTableData(sortedData);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };
  useEffect(() => {
    if (selectedBulanBaru && newSelectedYear) {
      fetchData();
    }
  }, [selectedBulanBaru, newSelectedYear, newCabangList]);
    

  useEffect(() => {
    if (!selectedBulanBaru || !newSelectedYear) {
      setTableData([]);
    }
  }, [selectedBulanBaru, newSelectedYear]);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
        setCabangOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const filteredCabangList = cabangList.filter((cabang) =>
    cabang.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang);
    setIsDropdownOpen(false);
  };

  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredOptions = cabangOptions.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(searchValue)
    );
    setFilteredCabangOptions(filteredOptions);
  };

  const handleCabangSelection = (cabang) => {
    setChosenCabang(cabang.kecamatan || "Pilih Cabang");
    setDropdownVisible(false);

    if (cabang.kecamatan) {
      const filteredData = tableData.filter(
        (row) => row["Cabang/Khusus"] === cabang.kecamatan
      );
      setFilteredTableData(filteredData);
    } else {
      setFilteredTableData(tableData);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".relative")) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [dropdownVisible]);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data || []);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

  useEffect(() => {
    if (bulanList.length > 0) {
      const currentMonthIndex = new Date().getMonth();
      const currentMonth = bulanList[currentMonthIndex]?.namaBulan || "";
      setSelectedBulanBaru(currentMonth);
    }
  }, [bulanList]);

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("daspenData");

    if (storedData) {
      const data = JSON.parse(storedData);

      const firstItem = data[0];

      if (firstItem) {
        setKuota(Number(firstItem.pb));
        setKatagori1(Number(firstItem.propinsi));
        setKatagori2(Number(firstItem.kabupaten));
        setKatagori3(Number(firstItem.cabang));
      }
    }
  }, []);

  useEffect(() => {
    setKatagori1Lainnya(kuota * katagori1);
    setKatagori2Lainnya(kuota * katagori2);
    setKatagori3Lainnya(kuota * katagori3);
  }, [kuota, katagori1, katagori2, katagori3]);

  useEffect(() => {
    const total =
      katagori1Lainnya * kat1 +
      katagori2Lainnya * kat2 +
      katagori3Lainnya * kat3;
    setTotalTarget(total);

    const provinsi = total * PROVINSI_PERCENTAGE;
    setPerolehanProvinsi(provinsi);

    const cabang = total * CABANG_PERCENTAGE;
    setPerolehanCabang(cabang);

    const kabupaten = total * KABUPATEN_PERCENTAGE;
    setPerolehanKabupaten(kabupaten);
  }, [kat1, kat2, kat3, katagori1, katagori2, katagori3]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      kategori1: katagori1,
      kategori2: katagori2,
      kategori3: katagori3,
      kuota: kuota,
      bulan: selectedBulan,
      tahun: selectedYear,
    };

    try {
      const result = await GlobalApi.createDaspenData(payload);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Data berhasil disimpan!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 4000,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    } catch (error) {
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menyimpan Data.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
  };

  const handleSubmitTarget = async (event) => {
    event.preventDefault();
  
    const valueKat1 = kat1 * katagori1Lainnya;
    const valueKat2 = kat2 * katagori2Lainnya;
    const valueKat3 = kat3 * katagori3Lainnya;
  
    const payload = {
      bulan: selectedBulan,
      tahun: selectedYear,
      cabang: selectedCabang,
      kategori1: kat1,
      kategori2: kat2,
      kategori3: kat3,
      perolehanCabang: perolehanCabang,
      perolehanKabupaten: perolehanKabupaten,
      valueKat1: valueKat1,
      valueKat2: valueKat2,
      valueKat3: valueKat3,
    };
  
    console.log("Data yang akan dikirim ke database:", payload);
    try {
      await GlobalApi.createTargetDaspen(payload);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Data berhasil disimpan!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 4000,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );  
      await fetchData();
      handleReset();
    } catch (error) {
      console.error("Error creating data target daspen:", error);
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menyimpan Data.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
  };
  

  useEffect(() => {
    setValueKat1(kat1 * katagori1Lainnya);
    setValueKat2(kat2 * katagori2Lainnya);
    setValueKat3(kat3 * katagori3Lainnya);
  }, [kat1, kat2, kat3, katagori1Lainnya, katagori2Lainnya, katagori3Lainnya]);

  const handleReset = () => {
    const storedData = JSON.parse(sessionStorage.getItem("daspenData"));

    if (storedData && storedData.length > 0) {
      const daspen = storedData[0];

      setKuota(parseInt(daspen.pb));
      setKatagori1(parseInt(daspen.propinsi));
      setKatagori2(parseInt(daspen.kabupaten));
      setKatagori3(parseInt(daspen.cabang));
    }
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Daspen</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Daspen</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Toaster
            toastOptions={{
              style: {
                fontSize: "1.25rem",
                padding: "16px",
              },
              success: {
                style: {
                  background: "white",
                  color: "black",
                },
              },
              error: {
                style: {
                  background: "#f44336",
                  color: "#fff",
                },
              },
            }}
          />
          <div className="p-4 bg-gray-50 rounded-lg shadow-lg ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                  Besaran Sumbangan Daspen
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="kuota"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Kuota
                    </Label>
                    <Input
                      type="number"
                      id="kuota"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                      value={kuota}
                      onChange={(e) => setKuota(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <Label
                        htmlFor="katagori1"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Katagori I
                      </Label>
                      <Input
                        type="text"
                        id="katagori1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${katagori1Lainnya.toLocaleString("id-ID")}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col w-1/2 mt-7">
                      <Input
                        type="number"
                        id="katagori1-2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={katagori1}
                        onChange={(e) => setKatagori1(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <Label
                        htmlFor="katagori2"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Katagori II
                      </Label>
                      <Input
                        type="text"
                        id="katagori2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${katagori2Lainnya.toLocaleString("id-ID")}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col w-1/2 mt-7">
                      <Input
                        type="number"
                        id="katagori2-2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={katagori2}
                        onChange={(e) => setKatagori2(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <Label
                        htmlFor="katagori3"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Katagori III
                      </Label>
                      <Input
                        type="text"
                        id="katagori3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${katagori3Lainnya.toLocaleString("id-ID")}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col w-1/2 mt-7">
                      <Input
                        type="number"
                        id="katagori3-2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={katagori3}
                        onChange={(e) => setKatagori3(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center space-x-4">
                    <Button
                      className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-150 ease-in-out"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-150 ease-in-out"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                  Inputan Manual Target Daspen
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="bulan"
                        className="block text-gray-700 text-sm font-semibold mb-2"
                      >
                        Bulan
                      </Label>
                      <select
                        id="bulan"
                        value={selectedBulan}
                        onChange={(e) => setSelectedBulan(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                      >
                        {bulanList.map((bulan) => (
                          <option key={bulan.id} value={bulan.namaBulan}>
                            {bulan.namaBulan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <Label
                        htmlFor="tahun"
                        className="block text-gray-700 text-sm font-semibold mb-2"
                      >
                        Tahun
                      </Label>
                      <select
                        id="tahun"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col ">
                      <Label
                        htmlFor="cabang"
                        className="block text-gray-700 text-sm font-semibold mb-2"
                      >
                        Cabang
                      </Label>
                      <div className="relative w-full" ref={dropdownRef}>
                        <Input
                          type="text"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          readOnly
                          value={selectedCabang || ""}
                          placeholder="Pilih Cabang"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onFocus={() => {
                            setSearchQuery("");
                          }}
                        />

                        {isDropdownOpen && (
                          <div className="absolute w-40 mt-1 bg-white border rounded shadow-lg z-10">
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  className="w-full p-2 border-b text-gray-700 focus:outline-none"
                                  placeholder="Cari cabang..."
                                  value={searchQuery}
                                  onChange={handleSearchChange}
                                  autoFocus
                                />
                              </li>
                              {filteredCabangList.map((cabang) => (
                                <li
                                  key={cabang.id}
                                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  onClick={() =>
                                    handleCabangSelect(cabang.kecamatan)
                                  }
                                >
                                  {cabang.kecamatan}
                                </li>
                              ))}
                              {filteredCabangList.length === 0 && (
                                <li className="p-2 text-gray-500">
                                  Cabang tidak ditemukan
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="kat1"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Kat I
                      </Label>
                      <Input
                        type="number"
                        id="kat1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={kat1}
                        onChange={(e) => setKat1(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="kat2"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Kat II
                      </Label>
                      <Input
                        type="number"
                        id="kat2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={kat2}
                        onChange={(e) => setKat2(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="kat3"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Kat III
                      </Label>
                      <Input
                        type="number"
                        id="kat3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        value={kat3}
                        onChange={(e) => setKat3(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="totalTarget"
                        className="text-gray-700 text-sm font-semibold mb-2 mt-5"
                      >
                        Total Target
                      </Label>
                      <Input
                        type="text"
                        id="totalTarget"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${totalTarget.toLocaleString("id-ID")}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="perolehanProvinsi"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Perolehan Provinsi (89,5%)
                      </Label>
                      <Input
                        type="text"
                        id="perolehanProvinsi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${perolehanProvinsi.toLocaleString(
                          "id-ID"
                        )}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="perolehanCabang"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Perolehan Cabang (6,5%)
                      </Label>
                      <Input
                        type="text"
                        id="perolehanCabang"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${perolehanCabang.toLocaleString("id-ID")}`}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label
                        htmlFor="perolehanKabupaten"
                        className="text-gray-700 text-sm font-semibold mb-2"
                      >
                        Perolehan Kabupaten (4%)
                      </Label>
                      <Input
                        type="text"
                        id="perolehanKabupaten"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                        value={`Rp ${perolehanKabupaten.toLocaleString(
                          "id-ID"
                        )}`}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center space-x-4">
                    <Button
                      className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-150 ease-in-out"
                      onClick={handleSubmitTarget}
                    >
                      Submit
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-150 ease-in-out"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5">
                  <div className="relative flex flex-col md:flex ml-2 w-72">
                    <Input
                      type="text"
                      placeholder="Pilih Cabang"
                      value={chosenCabang || "Pilih Cabang"}
                      readOnly
                      onFocus={() => {
                        setDropdownVisible(true);
                        setSearchTerm("");
                        setFilteredCabangOptions(cabangOptions);
                      }}
                      className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                    />

                    {dropdownVisible && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchTerm}
                              onChange={handleSearchInputChange}
                              className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Cari Cabang..."
                              autoFocus
                            />
                          </li>
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCabangSelection({ kecamatan: "", id: "" })
                            }
                          >
                            Pilih Cabang
                          </li>
                          {filteredCabangOptions.length > 0 ? (
                            filteredCabangOptions.map((cabang) => (
                              <li
                                key={cabang.id}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCabangSelection(cabang)}
                              >
                                {cabang.kecamatan}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-gray-500 cursor-default">
                              Tidak ada hasil
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <select
                    className="shadow appearance-none border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="bulanTableBaru"
                    value={selectedBulanBaru}
                    onChange={(e) => setSelectedBulanBaru(e.target.value)}
                  >
                    <option value="">Pilih Bulan</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.id} value={bulan.namaBulan}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>

                  <select
                    className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    id="tahunTable"
                    value={newSelectedYear}
                    onChange={(e) => setNewSelectedYear(e.target.value)}
                  >
                    <option value="">Pilih Tahun</option>

                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                  Transaksi Juli 2024
                </h1>
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out mt-3 mr-6 w-24"
                  onClick={printTable}
                >
                  Cetak
                </Button>
              </div>
            </div>

            <div ref={tableRef} className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      No
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Cabang/Khusus
                    </th>
                    <th
                      scope="col"
                      colSpan={2}
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                    >
                      Katagori I
                    </th>
                    <th
                      scope="col"
                      colSpan={2}
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                    >
                      Katagori II
                    </th>
                    <th
                      scope="col"
                      colSpan={2}
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                    >
                      Katagori III
                    </th>
                    <th
                      scope="col"
                      colSpan={2}
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                    >
                      Total
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    ></th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    ></th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Anggota
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Sumbangan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Anggota
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Sumbangan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Anggota
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Sumbangan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Anggota
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                    >
                      Sumbangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData.length > 0 ? (
                    filteredTableData.map((row, index) => {
                      const isJumlahRow = row["Cabang/Khusus"] === "Jumlah";

                      return (
                        <tr
                          key={index}
                          className={`transition duration-200 ease-in-out ${
                            isJumlahRow ? "bg-gray-300" : ""
                          }`}
                        >
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {!isJumlahRow ? index + 1 : ""}
                          </td>
                          <td
                            className={`border px-6 py-4 text-center text-sm ${
                              isJumlahRow
                                ? "text-gray-700 font-bold"
                                : "text-black"
                            }`}
                          >
                            {row["Cabang/Khusus"] || "-"}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Anggota Kategori I"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Sumbangan Kategori I"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Anggota Kategori II"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Sumbangan Kategori II"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Anggota Kategori III"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(
                              row["Sumbangan Kategori III"] ?? 0
                            ).toLocaleString("en-US")}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Anggota Total"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {(row["Sumbangan Total"] ?? 0).toLocaleString(
                              "en-US"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
                        className="text-center py-4 border text-black"
                      >
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
