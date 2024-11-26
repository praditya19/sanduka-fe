"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GlobalApi from "@/app/_utils/GlobalApi";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const DataTable = () => {
  const tableRef = useRef();
  const dropdownRef = useRef(null);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  const [detailFilter, setDetailFilter] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [tahunOptions, setTahunOptions] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleString("default", { month: "long" });
    const currentYear = today.getFullYear();

    setSelectedBulan(currentMonth);
    setSelectedTahun(currentYear);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const bulanResponse = await GlobalApi.getBulan();
        if (bulanResponse?.data) {
          setBulanOptions(bulanResponse.data);
          const currentMonthIndex = new Date().getMonth();
          const currentMonth = bulanResponse.data[currentMonthIndex]?.id;

          if (currentMonth) {
            setSelectedBulan(currentMonth);
          }
        }

        const tahunArray = Array.from(
          { length: 11 },
          (_, index) => 2020 + index
        );
        setTahunOptions(tahunArray);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangOptions(response.data);
        setFilteredOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  const handleBulanChange = (event) => {
    setSelectedBulan(event.target.value);
  };

  const handleTahunChange = (event) => {
    setSelectedTahun(event.target.value);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const month = selectedBulan;
      const year = selectedTahun;
      const cabang = selectedCabang || "";

      let data = [];

      if (detailFilter === "Menjadi Anggota Baru") {
        data = await GlobalApi.getCalculateSandukaBaru(month, year, cabang);
      } else if (detailFilter === "Anggota Keluar") {
        data = await GlobalApi.getCalculateSandukaKeluar(month, year, cabang);
      } else if (detailFilter === "Anggota Pensiun") {
        data = await GlobalApi.getCalculateSandukaPensiun(month, year, cabang);
      } else if (detailFilter === "Anggota Meninggal") {
        data = await GlobalApi.getCalculateSandukaMeninggal(
          month,
          year,
          cabang
        );
      }

      setTableData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (detailFilter) {
      fetchData();
    }
  }, [detailFilter, selectedBulan, selectedTahun, selectedCabang]);

  useEffect(() => {
    if (detailFilter) {
      fetchData();
    }
  }, [detailFilter]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    const filtered = cabangOptions.filter((option) =>
      option.kecamatan.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredOptions(filtered);
    setShowDropdown(value.length > 0);

    if (value.trim() === "") {
      setSelectedCabang("");
    }
  };

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

  const handleToggleDetail = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleOptionClick = (option) => {
    const cabangTerpilih = option ? option.kecamatan : "";
    setSelectedCabang(cabangTerpilih);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Data Anggota</title>");
    printWindow.document.write(
      "<style>table { width: 100%; border-collapse: collapse; } td, th { border: 1px solid #ddd; padding: 8px; text-align: center; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(tableRef.current.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
    }
  }, [token, router]);

  if (error) {
    return <div>Something went wrong. Please try again later.</div>;
  }

  return (
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-base md:text-base font-bold mb-4 text-center">
            DATA ANGGOTA
          </h2>
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0 md:space-x-4 text-base">
            <div className="w-full grid grid-cols-1 gap-4 md:flex md:space-x-4">
              <select
                value={detailFilter}
                onChange={(e) => setDetailFilter(e.target.value)}
                className="p-2 border rounded w-full md:max-w-xs"
              >
                <option value="">Select Detail Filter</option>
                <option value="Menjadi Anggota Baru">
                  Menjadi Anggota Baru
                </option>
                <option value="Anggota Keluar">Anggota Keluar</option>
                <option value="Anggota Pensiun">Anggota Pensiun</option>
                <option value="Anggota Meninggal">Anggota Meninggal</option>
              </select>

              <div className="relative w-full" ref={dropdownRef}>
                <Input
                  type="text"
                  placeholder="Cabang terpilih"
                  value={selectedCabang}
                  readOnly
                  className="p-2 border border-gray-300 rounded-md w-full"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="absolute w-full bg-white border border-gray-300 rounded-md max-h-48 shadow-lg z-10">
                    <ul className="max-h-44 overflow-y-auto">
                      <li className="py-2 px-2">
                        <Input
                          type="text"
                          placeholder="Cari atau ketik Cabang..."
                          value={searchTerm}
                          onChange={handleInputChange}
                          className="p-2 border-b border-gray-300 w-full"
                          autoFocus
                        />
                      </li>
                      <li
                        className="p-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                        onClick={() => handleOptionClick(null)}
                      >
                        Pilih Cabang
                      </li>
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                          <li
                            key={index}
                            className="p-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleOptionClick(option)}
                          >
                            {option.kecamatan}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500">Tidak ada hasil</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <select
                onChange={handleBulanChange}
                value={selectedBulan}
                className="p-2 border border-gray-300 rounded-md w-full md:w-40"
              >
                {Array.isArray(bulanOptions) &&
                  bulanOptions.map((bulan) => (
                    <option key={bulan.id} value={bulan.id}>
                      {bulan.namaBulan}
                    </option>
                  ))}
              </select>

              <select
                value={selectedTahun}
                onChange={handleTahunChange}
                className="p-2 border border-gray-300 rounded-md w-full md:w-40"
              >
                <option value="">Pilih Tahun</option>
                {tahunOptions.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={handlePrint}
                className="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Cetak
              </button>
            </div>
          </div>

          <div ref={tableRef}>
            {isLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Table className="w-full table-auto mb-8 text-sm">
                <TableHeader className="p-2 md:p-3 border bg-teal-700">
                  <TableRow>
                    <TableHead
                      rowSpan="2"
                      className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                    >
                      No
                    </TableHead>
                    <TableHead
                      rowSpan="2"
                      className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                    >
                      Data
                    </TableHead>
                    <TableHead
                      rowSpan="2"
                      className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                    >
                      Cabang
                    </TableHead>
                    <TableHead
                      colSpan="4"
                      className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                    >
                      Detail
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                      Nama
                    </TableHead>
                    <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                      NPA
                    </TableHead>
                    <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                      Usia
                    </TableHead>
                    <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                      Unit Kerja
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(tableData) && tableData.length > 0 ? (
                    tableData.map((item, index) => {
                      const detailParts = item.detail?.[0]?.split("\n") || [];
                      const nama = detailParts[0] || "-";
                      const npa = detailParts[1] || "-";
                      const usia = detailParts[2] || "-";
                      const unitKerja = detailParts[3] || "-";

                      return (
                        <React.Fragment key={index}>
                          <TableRow
                            className={
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }
                          >
                            <TableCell className="text-center border">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border flex justify-between items-center px-2">
                              <span>Jumlah Data: {item.jumlahData || "-"}</span>
                              <button
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                onClick={() => handleToggleDetail(index)}
                              >
                                {expandedIndex === index ? "Hide" : "+"}
                              </button>
                            </TableCell>

                            <TableCell className="border text-center">
                              {item.cabang || "-"}
                            </TableCell>
                            <TableCell className="border text-center">
                              {nama}
                            </TableCell>
                            <TableCell className="border text-center">
                              {npa}
                            </TableCell>
                            <TableCell className="border text-center">
                              {usia} Tahun
                            </TableCell>
                            <TableCell className="border text-center">
                              {unitKerja}
                            </TableCell>
                          </TableRow>

                          {expandedIndex === index &&
                            item.detail
                              .slice(1)
                              .map((detailItem, detailIndex) => {
                                const extraDetailParts = detailItem.split("\n");
                                const extraNama = extraDetailParts[0] || "-";
                                const extraNpa = extraDetailParts[1] || "-";
                                const extraUsia = extraDetailParts[2] || "-";
                                const extraUnitKerja =
                                  extraDetailParts[3] || "-";

                                return (
                                  <TableRow
                                    key={detailIndex}
                                    className="bg-gray-100"
                                  >
                                    <TableCell className="border text-center">
                                      -
                                    </TableCell>
                                    <TableCell
                                      className="border text-center"
                                      colSpan="2"
                                    ></TableCell>
                                    <TableCell className="border text-center">
                                      {extraNama}
                                    </TableCell>
                                    <TableCell className="border text-center">
                                      {extraNpa}
                                    </TableCell>
                                    <TableCell className="border text-center">
                                      {extraUsia} Tahun
                                    </TableCell>
                                    <TableCell className="border text-center">
                                      {extraUnitKerja}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan="7"
                        className="text-center border p-2 text-gray-500"
                      >
                        Tidak ada data yang tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
