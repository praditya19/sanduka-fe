"use client";
import React, { useState, useEffect, useRef } from "react";
import { faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {
  FaPlusCircle,
  FaMinusCircle
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

const SyncData = () => {
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [rekapData, setRekapData] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const tableRef = useRef();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [formData, setFormData] = useState({
    file: null,
    category: "",
  });

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);

    const filteredUnitKerja = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().startsWith(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(filteredUnitKerja.length > 0);
    setFilteredUnitKerja(filteredUnitKerja);

    const rekapFilteredByUnitKerja = originalRekapData.filter(
      (item) =>
        item.alamatKerja &&
        item.alamatKerja.toLowerCase().includes(input.toLowerCase())
    );

    if (input === "") {
      setRekapData(originalRekapData);
    } else {
      setRekapData(rekapFilteredByUnitKerja);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);

    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }

    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);

    const filteredRekapData = originalRekapData.filter(
      (item) => item.alamatKerja === unitKerja.unitKerja
    );
    setRekapData(filteredRekapData);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleRowExpand = (index) => {
    setExpandedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredData = data.filter((item) => {
    const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
    const unitKerjaMatch = searchTerm
      ? item.unitKerja.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return cabangMatch && unitKerjaMatch;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GlobalApi.getAllFiles();
        setData(result);

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

  const handlePrint = () => {
    const printContents = tableRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileToSend = formData.file;

    if (
      fileToSend &&
      (fileToSend.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileToSend.type === "application/vnd.ms-excel")
    ) {
      try {
        const reader = new FileReader();

        reader.onload = async (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const csvString = XLSX.utils.sheet_to_csv(worksheet);

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
            setIsModalOpen(false);
          } catch (error) {
            console.error(
              "Error submitting data:",
              error.response?.data || error.message
            );
          }
        };

        reader.readAsArrayBuffer(fileToSend);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    } else {
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
        setIsModalOpen(false);
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

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
    <div className="min-h-screen flex flex-col bg-gray-100">
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
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderMenu />
      )}
      <div>
        <div>
          <div className="min-h-screen flex-grow bg-gray-50 py-10 pt-16">
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
                          <option value="SANDUKA">Sanduka</option>
                          <option value="DASPEN">Daspen </option>
                          <option value="KTA_DIGITAL"> KTA Digital</option>
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

            <div className="flex flex-wrap items-center space-x-2 mb-4">
              <div className="flex flex-col relative w-64" ref={cabangRef}>
                <Input
                  type="text"
                  value={selectedCabang}
                  readOnly
                  onClick={handleCabangClick}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  placeholder="Pilih Cabang"
                />
                {showCabangDropdown && (
                  <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="py-2 px-2">
                        <Input
                          type="text"
                          onChange={(e) => handleCabangSearch(e.target.value)}
                          className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                          placeholder="Cari atau ketik Cabang..."
                          autoFocus
                        />
                      </li>

                      <li
                        onClick={() => handleSelectCabang({ kecamatan: "" })}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        Pilih Cabang
                      </li>
                      {filteredCabangList.map((cabang) => (
                        <li
                          key={cabang.id}
                          onClick={() => handleSelectCabang(cabang)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          {cabang.kecamatan}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
                <Input
                  type="text"
                  value={unitKerjaInput}
                  onFocus={handleUnitKerjaFocus}
                  onChange={handleUnitKerjaChange}
                  placeholder="Pilih Unit Kerja"
                  readOnly
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                  disabled={!selectedCabang}
                />
                {showUnitKerjaDropdown && (
                  <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="py-2 px-2">
                        <Input
                          type="text"
                          onChange={(e) =>
                            handleUnitKerjaSearch(e.target.value)
                          }
                          placeholder="Cari atau ketik Unit Kerja..."
                          autoFocus
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-2"
                        />
                      </li>
                      <li
                        onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        Pilih Unit Kerja
                      </li>
                      {filteredUnitKerja.length > 0 ? (
                        filteredUnitKerja.map((unitKerja) => (
                          <li
                            key={unitKerja.id}
                            onClick={() => handleUnitKerjaSelect(unitKerja)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          >
                            {unitKerja.unitKerja}
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
            </div>
            <div
              ref={tableRef}
              className="overflow-x-auto relative shadow-md sm:rounded-lg"
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 text-center">
                  <tr>
                    <th scope="col" className="py-3 px-6">No</th>
                    <th scope="col" className="py-3 px-6">Cabang</th>
                    <th scope="col" className="py-3 px-6">Unit Kerja</th>
                    {!isMobile && (
                      <>
                        <th scope="col" className="py-3 px-6">Nama</th>
                        <th scope="col" className="py-3 px-6">NPA/NIP</th>
                        <th scope="col" className="py-3 px-6">Data Sanduka</th>
                        <th scope="col" className="py-3 px-6">Data KTA Digital</th>
                        <th scope="col" className="py-3 px-6">Data Daspen</th>
                        <th scope="col" className="py-3 px-6">Wa</th>
                      </>
                    )}
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
                        <span
                          className={`inline-block px-2 py-1 rounded ${
                            item.dataSanduka
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.dataSanduka ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2 py-1 rounded ${
                            item.dataKtaDigital
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.dataKtaDigital ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2 py-1 rounded ${
                            item.dataDaspen
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.dataDaspen ? "YES" : "NO"}
                        </span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
