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

  const [newCabangList, setNewCabangList] = useState([]);
  const [selectedBulanBaru, setSelectedBulanBaru] = useState("");
  const [newSelectedYear, setNewSelectedYear] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await GlobalApi.getTableDaspen(
        selectedBulanBaru,
        newSelectedYear,
        newCabangList
      );
      setTableData(data);
    };

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
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

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

      toast.success("Data berhasil disimpan!");
    } catch (error) {
      toast.error(`Gagal menyimpan data: ${error.message}`);
    }
  };

  const handleSubmitTarget = async (event) => {
    event.preventDefault();

    const payload = {
      bulan: selectedBulan,
      tahun: selectedYear,
      cabang: selectedCabang,
      kategori1: kat1,
      kategori2: kat2,
      kategori3: kat3,
    };

    try {
      const result = await GlobalApi.createTargetDaspen(payload);
      toast.success("Data berhasil disimpan!");
      handleReset();
    } catch (error) {
      console.error("Error creating data target daspen:", error);
      toast.error("Gagal menyimpan data target: " + error.message);
    }
  };

  const handleReset = () => {
    const storedData = JSON.parse(sessionStorage.getItem("daspenData"));

    if (storedData && storedData.length > 0) {
      const daspen = storedData[0];

      setKuota(parseInt(daspen.pb));
      setKatagori1(parseInt(daspen.propinsi));
      setKatagori2(parseInt(daspen.kabupaten));
      setKatagori3(parseInt(daspen.cabang));
    } else {
      setKatagori1(0);
      setKatagori2(0);
      setKatagori3(0);
      setKuota(0);
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
                    <div className="flex flex-col">
                      <Label
                        htmlFor="cabang"
                        className="block text-gray-700 text-sm font-semibold mb-2"
                      >
                        Cabang
                      </Label>
                      <select
                        id="cabang"
                        value={selectedCabang}
                        onChange={(e) => setSelectedCabang(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                      >
                        <option value="">Select Cabang</option>
                        {cabangList.map((cabang) => (
                          <option key={cabang.id} value={cabang.kecamatan}>
                            {cabang.kecamatan}
                          </option>
                        ))}
                      </select>
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
                  <select
                    className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    id="newCabangTable"
                    value={newCabangList}
                    onChange={(e) => setNewCabangList(e.target.value)}
                  >
                    <option value="">Pilih Cabang Baru</option>
                    {cabangList.map((cabang) => (
                      <option key={cabang.id} value={cabang.kecamatan}>
                        {cabang.kecamatan}
                      </option>
                    ))}
                  </select>

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
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <tr
                        className="transition duration-200 ease-in-out"
                        key={index}
                      >
                        <td className="border px-6 py-4 text-center text-sm text-black">
                          {index + 1}
                        </td>
                        <td className="border px-6 py-4 text-center text-sm text-black">
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
                          {(row["Sumbangan Kategori III"] ?? 0).toLocaleString(
                            "en-US"
                          )}
                        </td>
                        <td className="border px-6 py-4 text-center text-sm text-black">
                          {(row["Anggota Total"] ?? 0).toLocaleString("en-US")}
                        </td>
                        <td className="border px-6 py-4 text-center text-sm text-black">
                          {(row["Sumbangan Total"] ?? 0).toLocaleString(
                            "en-US"
                          )}
                        </td>
                      </tr>
                    ))
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