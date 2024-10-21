"use client";
import React, { useState, useEffect, useRef } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
// import Sidebar from "@/app/_components/Sidebar";

const SyncData = () => {
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUnitKerjaList, setFilteredUnitKerjaList] = useState([]);
  const [data, setData] = useState([]);
  const tableRef = useRef();

  const [formData, setFormData] = useState({
    file: null,
    category: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GlobalApi.getAllFiles();
        setData(result);

        // Ambil daftar cabang unik dari data
        const uniqueCabang = [...new Set(result.map((item) => item.cabang))];
        setCabangList(
          uniqueCabang.map((cabang, id) => ({ id, kecamatan: cabang }))
        );
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data); // Asumsi response.data adalah array dari unit kerja
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };

    fetchUnitKerjaData(); // Panggil API saat komponen mount
  }, []);

  const handlePrint = () => {
    const printContents = tableRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    // Set hanya konten tabel yang ingin dicetak
    document.body.innerHTML = printContents;
    window.print();

    // Kembalikan konten asli setelah mencetak
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload halaman untuk memastikan tampilan kembali normal
  };

  useEffect(() => {
    // Filtering berdasarkan input yang diketik
    if (searchTerm && selectedCabang) {
      const filtered = unitKerjaList
        .filter((unit) => unit.cabang === selectedCabang)
        .filter((unit) =>
          unit.unitKerja.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredUnitKerjaList(filtered);
    } else {
      setFilteredUnitKerjaList([]); // Kosongkan jika input dihapus
    }
  }, [searchTerm, selectedCabang]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);

    // Filter daftar unit kerja berdasarkan input searchTerm
    const filtered = data
      .filter(
        (item) =>
          item.unitKerja.toLowerCase().includes(e.target.value.toLowerCase()) &&
          item.cabang === selectedCabang
      )
      .map((item) => ({ id: item.id, unitKerja: item.unitKerja }));

    setFilteredUnitKerjaList(filtered);
  };

  const handleUnitKerjaSelect = (unit) => {
    setSearchTerm(unit.unitKerja);
    setShowDropdown(false);
  };

  // Filter data berdasarkan cabang dan unit kerja
  const filteredData = data.filter((item) => {
    const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
    const unitKerjaMatch = searchTerm
      ? item.unitKerja.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return cabangMatch && unitKerjaMatch;
  });

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data); // Assuming the response data is an array
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  const handleCabangChange = (e) => {
    setSelectedCabang(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman
    let fileToSend = formData.file;

    // Cek apakah file berformat Excel
    if (
      fileToSend &&
      (fileToSend.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileToSend.type === "application/vnd.ms-excel")
    ) {
      try {
        // Membaca file menggunakan FileReader
        const reader = new FileReader();

        reader.onload = async (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Mengambil nama sheet pertama
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Mengonversi sheet ke CSV
          const csvString = XLSX.utils.sheet_to_csv(worksheet);

          // Buat FormData baru untuk mengirimkan CSV
          const dataToSend = new FormData();
          dataToSend.append(
            "file",
            new Blob([csvString], { type: "text/csv" }),
            "converted.csv"
          );
          dataToSend.append("category", formData.category);
          dataToSend.append("cabang", formData.cabang);
          dataToSend.append("unitKerja", formData.unitKerja);
          dataToSend.append("namaAnggota", formData.namaLengkap);
          dataToSend.append("npaNip", formData.npaNip);
          dataToSend.append("nomorHp", formData.nomorHp);
          dataToSend.append("dataSanduka", formData.dataSanduka);
          dataToSend.append("dataKtaDigital", formData.dataKtaDigital);
          dataToSend.append("dataDaspen", formData.dataDaspen);
          dataToSend.append("verifikasi", formData.verifikasi);

          try {
            const response = await GlobalApi.uploadFile(dataToSend);
            console.log("Data successfully submitted:", response);
            setIsModalOpen(false); // Menutup modal setelah berhasil
          } catch (error) {
            console.error(
              "Error submitting data:",
              error.response?.data || error.message
            );
          }
        };

        reader.readAsArrayBuffer(fileToSend); // Membaca file sebagai array buffer
      } catch (error) {
        console.error("Error processing file:", error);
      }
    } else {
      // Jika file sudah berformat CSV atau lainnya
      const dataToSend = new FormData();
      dataToSend.append("file", fileToSend);
      dataToSend.append("category", formData.category);
      dataToSend.append("cabang", formData.cabang);
      dataToSend.append("unitKerja", formData.unitKerja);
      dataToSend.append("namaAnggota", formData.namaLengkap);
      dataToSend.append("npaNip", formData.npaNip);
      dataToSend.append("nomorHp", formData.nomorHp);
      dataToSend.append("dataSanduka", formData.dataSanduka);
      dataToSend.append("dataKtaDigital", formData.dataKtaDigital);
      dataToSend.append("dataDaspen", formData.dataDaspen);
      dataToSend.append("verifikasi", formData.verifikasi);

      try {
        const response = await GlobalApi.uploadFile(dataToSend);
        console.log("Data successfully submitted:", response);
        setIsModalOpen(false); // Menutup modal setelah berhasil
      } catch (error) {
        console.error(
          "Error submitting data:",
          error.response?.data || error.message
        );
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
  //   setIsSidebarOpen(sidebarState);
  // }, []);

  const [isMobile, setIsMobile] = useState(false);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  // const toggleSidebar = () => {
  //   const newSidebarState = !isSidebarOpen;
  //   setIsSidebarOpen(newSidebarState);
  //   localStorage.setItem("isSidebarOpen", newSidebarState);
  // };

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        {/* <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}

        <div
        // className={`flex-1 transition-all duration-300 ease-in-out ${
        //   isSidebarOpen ? "ml-64" : "ml-0"
        // }`}
        >
          <div className="min-h-screen flex-grow bg-gray-50 py-10 pt-16">
            {/* <div className="container mx-auto p-6 bg-white shadow-md rounded-lg"> */}
            <div className="flex flex-col md:flex-row justify-center md:space-x-4 mb-6">
              <Button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0">
                Rekap Hasil Upload
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mb-2 md:mb-0"
                onClick={() => setIsModalOpen(true)}
              >
                Upload Data
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Cetak
              </Button>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black opacity-50 z-40"
                  onClick={handleCloseModal}
                ></div>
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500"
                      onClick={handleCloseModal}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold mb-4">Upload Data</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Upload File
                        </label>
                        <input
                          type="file"
                          name="file"
                          onChange={handleInputChange}
                          className="block w-full mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Kategori
                        </label>
                        <select
                          className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                          name="category"
                          onChange={handleInputChange}
                        >
                          <option value="">-- Pilih Kategori --</option>
                          <option value="daspen">Daspen</option>
                          <option value="ktadigital">KTA Digital</option>
                          <option value="daspenkta">
                            Daspen & KTA Digital
                          </option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          onClick={handleSubmit}
                          className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                        >
                          Submit
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Cabang
              </label>
              <select
                className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                id="cabang"
                name="cabang"
                value={selectedCabang}
                onChange={handleCabangChange}
              >
                <option value="">Pilih Cabang</option>
                {cabangList.map((cabang) => (
                  <option key={cabang.id} value={cabang.kecamatan}>
                    {cabang.kecamatan}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Unit Kerja
              </label>
              <input
                type="text"
                className="form-input block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Ketik untuk mencari Unit Kerja"
                disabled={!selectedCabang} // Hanya bisa mengetik jika cabang dipilih
              />
              {showDropdown && filteredUnitKerjaList.length > 0 && (
                <ul
                  className="absolute bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg z-10"
                  style={{ maxHeight: "160px", overflowY: "auto" }}
                >
                  {filteredUnitKerjaList.map((unit) => (
                    <li
                      key={unit.id}
                      className="cursor-pointer px-4 py-2 hover:bg-teal-500 hover:text-white"
                      onClick={() => handleUnitKerjaSelect(unit)}
                    >
                      {unit.unitKerja}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              ref={tableRef}
              className="overflow-x-auto relative shadow-md sm:rounded-lg"
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 text-center">
                  <tr>
                    <th scope="col" className="py-3 px-6">
                      No
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Cabang
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Unit Kerja
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Nama
                    </th>
                    <th scope="col" className="py-3 px-6">
                      NPA/NIP
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Data Sanduka
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Data KTA Digital
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Data Daspen
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Wa
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {filteredData.map((item, index) => (
                    <tr
                      key={index}
                      className={`bg-white border-b ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200 transition duration-150`}
                    >
                      <td className="py-4 px-6">{index + 1}</td>
                      <td className="py-4 px-6">{item.cabang}</td>
                      <td className="py-4 px-6">{item.unitKerja}</td>
                      <td className="py-4 px-6">{item.namaAnggota}</td>
                      <td className="py-4 px-6">{item.npaNip}</td>
                      <td className="py-4 px-6">
                        {item.dataSanduka ? "YES" : "NO"}
                      </td>
                      <td className="py-4 px-6">
                        {item.dataKtaDigital ? "YES" : "NO"}
                      </td>
                      <td className="py-4 px-6">
                        {item.dataDaspen ? "YES" : "NO"}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            window.open(
                              `https://wa.me/${item.nomorHp}`,
                              "_blank"
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
