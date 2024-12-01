"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

export default function Iuran() {
  const [totalAnggota, setTotalAnggota] = useState(null);
  const [totalAnggotaCabang, setTotalAnggotaCabang] = useState(0);
  const [iuranPB, setIuranPB] = useState("");
  const [iuranProvinsi, setIuranProvinsi] = useState("");
  const [iuranKabupaten, setIuranKabupaten] = useState("");
  const [iuranCabang, setIuranCabang] = useState("");
  const [bulan, setBulan] = useState("");
  const [totalIuran, setTotalIuran] = useState("");
  const [sumbanganSanduka, setSumbanganSanduka] = useState("");
  const [totalSumbangan, setTotalSumbangan] = useState("");
  const [selectedBulan, setSelectedBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [isFormVisible, setFormVisible] = useState(false);
  const [bulanList, setBulanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [keteranganSelisih, setKeteranganSelisih] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newSelectedYear, setNewSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBulanBaru, setSelectedBulanBaru] = useState("");
  const [newCabangList, setNewCabangList] = useState([]);
  const [dataSumbangan, setDataSumbangan] = useState([]);
  const [filteredDataSumbangan, setFilteredDataSumbangan] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [allCabangData, setAllCabangData] = useState([]);
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chosenCabang, setChosenCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);

  useEffect(() => {
    const fetchTotalAnggota = async () => {
      const response = await GlobalApi.getTotalAnggota();
      setTotalAnggota(response);
    };

    fetchTotalAnggota();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await GlobalApi.getTableIuran(
        selectedBulanBaru,
        newSelectedYear,
        newCabangList
      );
      setDataSumbangan(data);
      setFilteredDataSumbangan(data);
    };

    if (selectedBulanBaru && newSelectedYear) {
      fetchData();
    }
  }, [selectedBulanBaru, newSelectedYear, newCabangList]);

  useEffect(() => {
    if (!selectedBulanBaru || !newSelectedYear) {
      setDataSumbangan([]);
    }
  }, [selectedBulanBaru, newSelectedYear]);

  const handleKeteranganChange = (event) => {
    setKeteranganSelisih(event.target.value);
  };

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        const fetchedBulan = response.data || [];
        setBulanList(fetchedBulan);

        const currentMonthIndex = new Date().getMonth();
        const currentMonthName =
          fetchedBulan[currentMonthIndex]?.namaBulan || "";
        setSelectedBulanBaru(currentMonthName);
      } catch (error) {
        console.error("Error fetching bulan:", error);
        setBulanList([]);
      }
    };

    fetchBulan();
  }, []);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
        setFilteredCabangList(response.data);
        setAllCabangData(response.data);
        setFilteredCabangOptions(response.data);
        setCabangOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);
  const handleSearchInputChange = (e) => {
    const input = e.target.value.toLowerCase();
    setSearchTerm(input);
    setFilteredCabangOptions(
      allCabangData.filter((cabang) =>
        cabang.kecamatan.toLowerCase().includes(input)
      )
    );
  };

  const handleCabangSelection = (cabang) => {
    setChosenCabang(cabang.kecamatan);
    setDropdownVisible(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = new Intl.DateTimeFormat("id-ID", {
      month: "long",
    }).format(currentDate);
    const currentYear = currentDate.getFullYear();
    setBulan(currentMonth);
    setTahun(currentYear);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      pb: iuranPB,
      propinsi: iuranProvinsi,
      kabupaten: iuranKabupaten,
      cabang: iuranCabang,
      sanduka: sumbanganSanduka,
      bulan: bulan,
      tahun: tahun,
    };

    try {
      const result = await GlobalApi.createIuranData(payload);
      handleReset();

      toast.success("Data berhasil disimpan!");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error("Gagal menyimpan data iuran:", error);
    }
  };

  const handleSubmitTarget = async (event) => {
    event.preventDefault();
    const payload = {
      cabang: selectedCabang,
      jumlah: totalAnggotaCabang,
      bulan: selectedBulan,
      keterangan: keteranganSelisih,
      tahun: selectedYear,
    };

    try {
      await GlobalApi.createTargetIuaran(payload);
      toast.success("Data berhasil disimpan!");

      const data = await GlobalApi.getTableIuran(
        selectedBulanBaru,
        newSelectedYear,
        newCabangList
      );
      setFilteredDataSumbangan(data);
    } catch (error) {
      console.error("Error creating data:", error);
      toast.error(`Gagal menyimpan data: ${error.message}`);
    }
  };

  useEffect(() => {
    const total = iuranPB + iuranProvinsi + iuranKabupaten + iuranCabang;
    setTotalIuran(total);
    setTotalSumbangan(total + sumbanganSanduka);
  }, [iuranPB, iuranProvinsi, iuranKabupaten, iuranCabang, sumbanganSanduka]);

  const fetchIuranData = () => {
    const storedData = sessionStorage.getItem("PGRIData");
    if (storedData) {
      const data = JSON.parse(storedData);
      const firstItem = data[0];

      if (firstItem) {
        setIuranPB(Number(firstItem.pb));
        setIuranProvinsi(Number(firstItem.propinsi));
        setIuranKabupaten(Number(firstItem.kabupaten));
        setIuranCabang(Number(firstItem.cabang));
        setSumbanganSanduka(Number(firstItem.sanduka));

        const calculatedTotalIuran =
          Number(firstItem.pb) +
          Number(firstItem.propinsi) +
          Number(firstItem.kabupaten) +
          Number(firstItem.cabang);

        setTotalIuran(calculatedTotalIuran);

        const calculatedTotalSumbangan =
          calculatedTotalIuran + (Number(firstItem.sanduka) || 0);

        setTotalSumbangan(calculatedTotalSumbangan);
      }
    }
  };

  useEffect(() => {
    if (selectedCabang) {
      fetchData();
    }
  }, [selectedCabang]);
  const fetchData = async () => {
    try {
      const data = await GlobalApi.getTotalAnggotaByCabang(selectedCabang);
      if (data.length > 0) {
        setTotalAnggotaCabang(data[0].totalAnggota);
      } else {
        setTotalAnggotaCabang(0);
      }
    } catch (error) {
      console.error("Gagal mengambil data anggota:", error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = cabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query)
    );
    setFilteredCabangList(filtered);
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleInputChange = (event, setter) => {
    setter(Number(event.target.value.replace(/\D/g, "")));
  };

  const handleReset = () => {
    const storedData = sessionStorage.getItem("iuranPGRIData");

    if (storedData) {
      const data = JSON.parse(storedData);
      const firstItem = data[0];

      if (firstItem) {
        setIuranPB(parseInt(firstItem.pb) || 0);
        setIuranProvinsi(parseInt(firstItem.propinsi) || 0);
        setIuranKabupaten(parseInt(firstItem.kabupaten) || 0);
        setIuranCabang(parseInt(firstItem.cabang) || 0);
        setSumbanganSanduka(parseInt(firstItem.sanduka) || 0);
      }
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleToggleForm = async () => {
    fetchIuranData();
    setFormVisible(!isFormVisible);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printTable").innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
        <html>
          <head>
            <title>Cetak Tabel</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: center; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Transaksi ${selectedBulanBaru} ${newSelectedYear}</h1>
            <table>
              ${printContent}
            </table>
          </body>
        </html>
      `);
    newWindow.document.close();
    newWindow.print();
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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
              <h1 className="text-base">Iuran PGRI</h1>
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
              <h1 className="text-base">Iuran PGRI</h1>
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
          <div className="w-full p-4 bg-gray-50 rounded-lg shadow-lg">
            <Button
              className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
              onClick={handleToggleForm}
            >
              Rincian Iuran
            </Button>
            {isFormVisible && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                    Besaran Iuran PGRI
                  </h2>

                  <div>
                    <div className="mb-4">
                      <Label
                        htmlFor="iuranPB"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Iuran PB
                      </Label>
                      <Input
                        type="text"
                        id="iuranPB"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(iuranPB)}
                        onChange={(event) =>
                          handleInputChange(event, setIuranPB)
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Label
                        htmlFor="iuranProvinsi"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Iuran Provinsi
                      </Label>
                      <Input
                        type="text"
                        id="iuranProvinsi"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(iuranProvinsi)}
                        onChange={(event) =>
                          handleInputChange(event, setIuranProvinsi)
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Label
                        htmlFor="iuranKabupaten"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Iuran Kabupaten
                      </Label>
                      <Input
                        type="text"
                        id="iuranKabupaten"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(iuranKabupaten)}
                        onChange={(event) =>
                          handleInputChange(event, setIuranKabupaten)
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Label
                        htmlFor="iuranCabang"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Iuran Cabang/Ranting
                      </Label>
                      <Input
                        type="text"
                        id="iuranCabang"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(iuranCabang)}
                        onChange={(event) =>
                          handleInputChange(event, setIuranCabang)
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <Label
                        htmlFor="totalIuran"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Total Iuran
                      </Label>
                      <Input
                        type="text"
                        id="totalIuran"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(totalIuran)}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <Label
                        htmlFor="sumbanganSanduka"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Sumbangan Sanduka
                      </Label>
                      <Input
                        type="text"
                        id="sumbanganSanduka"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(sumbanganSanduka)}
                        onChange={(event) =>
                          handleInputChange(event, setSumbanganSanduka)
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-1 text-center">
                        Total Sumbangan dan Iuran PGRI
                      </h2>
                      <Input
                        type="text"
                        id="totalSumbangan"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={formatRupiah(totalSumbangan)}
                        readOnly
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleSubmit}
                      >
                        Simpan
                      </Button>
                      <Button
                        type="button"
                        className="bg-red-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-2">
                    Jumlah Anggota: {totalAnggota}
                  </h3>
                  <h3 className="text-lg font-bold mb-2">
                    Setor Provinsi: Rp. 8.325.600
                  </h3>
                  <div className="mb-4">
                    <p className="bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                      Jumlah Anggota Selisih laporan Cabang
                    </p>
                    <div className="flex flex-col sm:flex-row items-center mt-2 space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="relative w-full sm:w-1/3">
                        <Input
                          type="text"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          readOnly
                          value={selectedCabang}
                          placeholder="Pilih Cabang Baru"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onFocus={() => {
                            setSearchQuery("");
                          }}
                        />

                        {isDropdownOpen && (
                          <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
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
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() =>
                                    handleCabangSelect(cabang.kecamatan)
                                  }
                                >
                                  {cabang.kecamatan}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="w-full sm:w-1/4">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="bulan"
                          value={selectedBulan}
                          onChange={(e) => setSelectedBulan(e.target.value)}
                        >
                          <option value="">Pilih Bulan</option>
                          {bulanList.map((bulan) => (
                            <option key={bulan.id} value={bulan.namaBulan}>
                              {bulan.namaBulan}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-1/4">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="tahun"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          <option>Pilih Tahun</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-1/4">
                        <input
                          type="number"
                          id="jumlah"
                          value={totalAnggotaCabang}
                          onChange={(e) => setJumlah(e.target.value)}
                          disabled
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-not-allowed"
                          placeholder="Data Cabang"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="keterangaSilisih"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Keterangan Selisih data
                    </label>
                    <textarea
                      id="keterangaSilisih"
                      value={keteranganSelisih}
                      onChange={handleKeteranganChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="5"
                    ></textarea>
                  </div>
                  <div className="flex justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={handleSubmitTarget}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div>
              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5">
                    <div className="relative flex flex-col md:flex ">
                      <Input
                        type="text"
                        placeholder="Pilih Cabang"
                        value={chosenCabang || "Pilih Cabang"}
                        readOnly
                        onFocus={() => {
                          setDropdownVisible(true);
                          setFilteredCabangOptions(cabangOptions);
                          setSearchTerm("");
                        }}
                        className="border rounded-lg p-2 px-4 w-52 bg-white shadow-sm cursor-pointer"
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
                      {Array.isArray(bulanList) &&
                        bulanList.map((bulan) => (
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
                    Transaksi {selectedBulanBaru} {newSelectedYear}
                  </h1>
                  <Button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out mt-3 mr-6 w-24"
                    onClick={handlePrint}
                  >
                    Cetak
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="w-full text-left table-auto border-collapse border border-gray-300 bg-white rounded-lg shadow-lg"
                  id="printTable"
                >
                  <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="border px-6 py-3 text-center text-sm">
                        No
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Cabang/Khusus
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Jumlah Anggota
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Iuran PGRI
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        PB. PGRI
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Provinsi
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Kabupaten
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Cabang/Ranting
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Sanduka
                      </th>
                      <th className="border px-6 py-3 text-center text-sm">
                        Total Sumbangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataSumbangan.length === 0 ? (
                      <tr>
                        <td
                          className="border px-6 py-4 text-center"
                          colSpan="10"
                        >
                          Data tidak ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredDataSumbangan.map((item, index) => (
                        <tr
                          key={index + 1}
                          className="transition duration-200 ease-in-out"
                        >
                          <td className="border px-6 py-4 text-center text-sm">
                            {index + 1}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {item[0]}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {item[1]}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[2])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[3])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[4])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[5])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[6])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[7])}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm">
                            {formatRupiah(item[8])}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
