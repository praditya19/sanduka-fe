"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
  const dropdownRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userDetails, setUserDetails] = useState({ id: null, npaPgri: null });
  const [dataLaporDiterima, setDataLaporDiterima] = useState([]);
  const [dataLaporBelum, setDataLaporBelum] = useState([]);
  const [displayedDataLapor, setDisplayedDataLapor] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [cabangList, setCabangList] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [filterText, setFilterText] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [filteredCabangList, setFilteredCabangList] = useState(cabangList);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [kwitansiData, setKwitansiData] = useState(null);

  useEffect(() => {
    const fetchDataDiterima = async () => {
      try {
        const response = await GlobalApi.getRekapLaporDiterima();
        const fetchedDataDiterima = response || [];
        setDataLaporDiterima(fetchedDataDiterima);
      } catch (error) {
        console.error("Error fetching data lapor diterima:", error);
      }
    };

    fetchDataDiterima();
  }, []);

  useEffect(() => {
    const fetchDataBelum = async () => {
      try {
        const response = await GlobalApi.getRekapLaporBelom();
        const fetchedDataBelum = response || [];
        setDataLaporBelum(fetchedDataBelum);
      } catch (error) {
        console.error("Error fetching data lapor belum:", error);
      }
    };

    fetchDataBelum();
  }, []);

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

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowFilterInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang ? cabang.kecamatan : "");
    setShowFilterInput(false);
    setFilterText("");
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    const filtered = cabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleFocus = () => {
    setShowFilterInput(true);
    setFilteredCabangList(cabangList);
  };

  const handleViewClick = async (dataMeninggal) => {
    if (!dataMeninggal) return;

    const namaAnggota = dataMeninggal.split("\n")[0].trim();
    console.log(`Nama Anggota yang diambil: ${namaAnggota}`);

    try {
      const response = await GlobalApi.searchUsersByName(namaAnggota);
      console.log("Response searchUsersByName:", response);

      const userDataArray = response.data.users;
      if (userDataArray && userDataArray.length > 0) {
        const user = userDataArray[0];
        const { id, npaPgri } = user;
        console.log(`ID yang ditemukan: ${id}, NPA PGRI: ${npaPgri}`);

        try {
          const kwitansiResponse = await GlobalApi.getKwitansiByIdAndNpa(
            id,
            npaPgri
          );
          console.log("Response getKwitansiByIdAndNpa:", kwitansiResponse);

          const blob = kwitansiResponse.data;
          const imageUrl = URL.createObjectURL(blob);
          setKwitansiData(imageUrl);

          setPopupVisible(true);
        } catch (error) {
          console.error("Error saat mengambil gambar kwitansi:", error);
        }
      } else {
        console.error("Tidak ada data user yang ditemukan berdasarkan nama");
      }
    } catch (error) {
      console.error("Error saat mengambil data user:", error);
    }
  };

  const handleFileClick = async (dataMeninggal) => {
    if (!dataMeninggal) return;

    const namaAnggota = dataMeninggal.split("\n")[0].trim();
    console.log(`Nama Anggota yang diambil: ${namaAnggota}`);

    try {
      const response = await GlobalApi.searchUsersByName(namaAnggota);
      console.log("Response searchUsersByName:", response);

      const userDataArray = response.data.users;
      if (userDataArray && userDataArray.length > 0) {
        const npaTerlaporList =
          JSON.parse(sessionStorage.getItem("npaTerlaporList")) || [];

        const filteredUser = userDataArray.find((user) =>
          npaTerlaporList.includes(user.npaPgri)
        );

        if (filteredUser) {
          const { id, npaPgri } = filteredUser;

          console.log(`ID yang ditemukan: ${id}, NPA PGRI: ${npaPgri}`);

          const npaResponse = await GlobalApi.cekNpa(npaPgri);
          console.log("Response cekNpa:", npaResponse);

          if (npaResponse && npaResponse.id && npaResponse.npaPgri) {
            setUserDetails({ id, npaPgri });

            console.log(
              `ID Terpilih: ${npaResponse.id}, NPA PGRI: ${npaResponse.npaPgri}`
            );
          } else {
            console.error("Data user tidak ditemukan pada response cekNpa");
          }
        } else {
          console.error(
            "Tidak ada user yang sesuai dengan NPA dari sessionStorage"
          );
        }
      } else {
        console.error("Tidak ada data user yang ditemukan berdasarkan nama");
      }
    } catch (error) {
      console.error("Error saat mengambil data user:", error);
    }
  };

  const handleFileChangeAndUpload = async (event) => {
    const file = event.target.files[0];
    const { id, npaPgri } = userDetails;

    if (!file) {
      console.error("Tidak ada file yang dipilih.");
      toast.error("Tidak ada file yang dipilih.");
      return;
    }

    if (!id || !npaPgri) {
      console.error("ID atau NPA PGRI tidak ditemukan.");
      toast.error("ID atau NPA PGRI tidak ditemukan.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await GlobalApi.createKwitansiByIdAndNpa(
        id,
        npaPgri,
        formData
      );
      console.log("Response Upload Kwitansi:", response);

      toast.success("File berhasil diupload");
    } catch (error) {
      console.error("Gagal mengupload file kwitansi:", error);
      toast.error("Gagal mengupload file");
    }
  };

  const handleCabangChange = (e) => {
    setSelectedCabang(e.target.value);
  };

  const handleBulanChange = (e) => {
    setSelectedBulan(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  useEffect(() => {
    if (filterStatus === "Terima") {
      setDisplayedDataLapor(dataLaporDiterima);
    } else if (filterStatus === "Belum") {
      setDisplayedDataLapor(dataLaporBelum);
    } else {
      setDisplayedDataLapor([]);
    }
  }, [filterStatus, dataLaporDiterima, dataLaporBelum]);

  useEffect(() => {
    const filterData = () => {
      let filteredData = [];

      if (filterStatus === "Terima") {
        filteredData = dataLaporDiterima;
      } else if (filterStatus === "Belum") {
        filteredData = dataLaporBelum;
      } else {
        filteredData = [...dataLaporDiterima, ...dataLaporBelum];
      }

      const finalFilteredData = filteredData.filter((item) => {
        const isCabangMatch = selectedCabang
          ? item.Cabang === selectedCabang
          : true;

        let monthFromData = null;
        let yearFromData = null;
        if (item.Date_lapor) {
          const dateMatch = item.Date_lapor.match(/\b\d{2}-\d{2}-\d{4}\b/);
          if (dateMatch) {
            const dateParts = dateMatch[0].split("-");
            monthFromData = dateParts[1];
            yearFromData = dateParts[2];
          }
        }

        const isBulanMatch = selectedBulan
          ? monthFromData === selectedBulan
          : true;
        const isYearMatch = selectedYear ? yearFromData === selectedYear : true;

        return isCabangMatch && isBulanMatch && isYearMatch;
      });

      setDisplayedDataLapor(finalFilteredData);
    };

    filterData();
  }, [
    filterStatus,
    selectedCabang,
    selectedBulan,
    selectedYear,
    dataLaporDiterima,
    dataLaporBelum,
  ]);

  const handlePrint = () => {
    const printContent = document.getElementById("table-to-print").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
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
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "1%",
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
              background: "white",
              color: "black",
            },
          },
        }}
      />
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="bg-teal-700 p-4 flex flex-col sm:flex-row items-center justify-between mt-5">
              <h1 className="text-white font-bold mb-4 sm:mb-0">
                REKAP LAPOR SANDUKA
              </h1>
              <div className="flex items-end ml-auto sm:hidden">
                <button className="text-white">
                  <FontAwesomeIcon icon={faFilter} size="lg" />
                </button>
              </div>
              <div
                className={` top-0 right-0 w-64 bg-teal-700 p-4 space-y-2 sm:space-y-0 sm:space-x-2 items-center sm:flex ${
                  showFilters ? "block" : "hidden"
                } sm:relative sm:w-auto sm:p-0 sm:bg-transparent`}
              >
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  {/* Input for displaying the selected branch */}
                  <input
                    className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    placeholder="Pilih Cabang"
                    value={selectedCabang}
                    readOnly
                    onFocus={handleFocus}
                  />

                  {/* Dropdown with integrated filter input */}
                  {showFilterInput && (
                    <div className="absolute bg-white border rounded w-full mt-1 z-10 shadow-lg">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <input
                            className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            placeholder="Cari Cabang..."
                            value={filterText}
                            onChange={handleFilterChange}
                            autoFocus
                          />
                        </li>

                        {/* Option to reset selection */}
                        <li
                          className="p-2 px-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                          onClick={() => handleCabangSelect(null)}
                        >
                          Pilih Cabang
                        </li>

                        {/* List of filtered cabang */}
                        {filteredCabangList.map((cabang) => (
                          <li
                            key={cabang.id}
                            className="p-2 px-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCabangSelect(cabang)}
                          >
                            {cabang.kecamatan}
                          </li>
                        ))}

                        {/* Option if no cabang found */}
                        {filteredCabangList.length === 0 && (
                          <div className="p-2 text-gray-500 text-center">
                            Cabang tidak ditemukan
                          </div>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  id="bulan"
                  name="bulan"
                  value={selectedBulan}
                  onChange={handleBulanChange}
                >
                  <option value="">-- Bulan --</option>
                  {bulanList.map((bulan) => (
                    <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                      {bulan.namaBulan}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  id="tahun"
                  name="tahun"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  <option value="">-- Tahun --</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Terima">Terima</option>
                  <option value="Belum">Belum</option>
                </select>
                <Button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full sm:w-auto"
                  onClick={handlePrint}
                >
                  Cetak
                </Button>
              </div>
            </div>
            <div id="table-to-print" className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="py-2 px-3 text-center">No</th>
                    <th className="py-2 px-3 text-center">Date lapor</th>
                    <th className="py-2 px-3 text-center">Data Meninggal</th>
                    <th className="py-2 px-3 text-center">Cabang</th>
                    <th className="py-2 px-3 text-center">Keterangan</th>
                    <th className="py-2 px-3 text-center">Diterimakan</th>
                    <th className="py-2 px-3 text-center">Action</th>
                    <th className="py-2 px-3 text-center">Bukti</th>
                    <th className="py-2 px-3 text-center">Kwitansi</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(displayedDataLapor) &&
                  displayedDataLapor.length > 0 ? (
                    displayedDataLapor.map((item, index) => (
                      <tr key={index} className="border-t text-sm">
                        <td className="py-2 px-3 text-center text-sm">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          {item.Date_lapor ? item.Date_lapor : "N/A"}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          {item.Data_Meninggal}
                        </td>
                        <td className="py-2 px-3 text-center text-sm">
                          {item.Cabang}
                        </td>
                        <td className="py-2 px-3 text-center text-sm">
                          {item.Keterangan}
                        </td>
                        <td className="py-2 px-3 text-center text-sm">
                          Diterimakan (Sesuaikan jika ada)
                        </td>
                        <td className="py-2 px-3 space-x-2 text-sm">
                          <button className="bg-blue-500 text-white p-2 rounded mb-2">
                            Kwitansi
                          </button>
                          <button className="bg-blue-500 text-white p-2 rounded text-sm">
                            Edit
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            className="bg-gray-200 p-2 rounded border"
                            onClick={() => handleViewClick(item.Data_Meninggal)}
                          >
                            View
                          </button>
                          {isPopupVisible && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-5 z-50">
                              <div className="bg-white rounded-lg p-6 w-3/4 max-w-lg">
                                <h2 className="text-xl font-bold mb-4">
                                  Bukti Kwitansi
                                </h2>

                                {kwitansiData ? (
                                  <div className="flex justify-center">
                                    <img
                                      src={kwitansiData}
                                      alt="Gambar Kwitansi"
                                      className="w-full max-h-96 object-contain"
                                    />
                                  </div>
                                ) : (
                                  <p>Gambar kwitansi tidak tersedia.</p>
                                )}

                                <button
                                  className="mt-4 bg-teal-500 text-white py-2 px-4 rounded"
                                  onClick={() => {
                                    setPopupVisible(false);
                                    URL.revokeObjectURL(kwitansiData);
                                    setKwitansiData(null);
                                  }}
                                >
                                  Tutup
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="file"
                            className="hidden"
                            id={`file-upload-${index}`}
                            onClick={() => handleFileClick(item.Data_Meninggal)}
                            onChange={handleFileChangeAndUpload}
                          />
                          <label
                            htmlFor={`file-upload-${index}`}
                            className="bg-green-500 text-white p-2 rounded cursor-pointer"
                          >
                            Browse...
                          </label>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-2">
                        No data available
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
};

export default Page;
