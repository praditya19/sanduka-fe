"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

function Pemasukan() {
  const tableRef = useRef();
  const [selectAll, setSelectAll] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const bulanList = [
    { id: "01", angkaBulan: 0, namaBulan: "Januari" },
    { id: "02", angkaBulan: 1, namaBulan: "Februari" },
    { id: "03", angkaBulan: 2, namaBulan: "Maret" },
    { id: "04", angkaBulan: 3, namaBulan: "April" },
    { id: "05", angkaBulan: 4, namaBulan: "Mei" },
    { id: "06", angkaBulan: 5, namaBulan: "Juni" },
    { id: "07", angkaBulan: 6, namaBulan: "Juli" },
    { id: "08", angkaBulan: 7, namaBulan: "Agustus" },
    { id: "09", angkaBulan: 8, namaBulan: "September" },
    { id: "10", angkaBulan: 9, namaBulan: "Oktober" },
    { id: "11", angkaBulan: 10, namaBulan: "November" },
    { id: "12", angkaBulan: 11, namaBulan: "Desember" },
  ];
  const [cabangList, setCabangList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedBulanName, setSelectedBulanName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [paginatedTransactions, setPaginatedTransactions] = useState([]);
  const startYear = 2020;
 const currentYear = new Date().getFullYear();
  const [newSelectedYear, setNewSelectedYear] = useState(currentYear);
  const [formValues, setFormValues] = useState({
    tanggalTransaksi: "",
    posTransaksi: "",
    masukKe: "",
    bulan: "",
    debet: "",
    kredit: "",
    bulanSantunan: "",
    yangMeninggal: "",
    namaPenerima: "",
    keterangan: "",
    jenisPembayaran: "Sanduka",
    totalAnggota: "",
    cabang: "",
    checked: false,
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getVisiblePages = () => {
    const totalPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

    if (endPage - startPage + 1 < totalPagesToShow) {
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleBulanChange = (e) => {
    const selectedId = e.target.value;
    setSelectedBulan(selectedId);

    const bulan = bulanList.find((b) => b.id === parseInt(selectedId));
    setSelectedBulanName(bulan ? bulan.namaBulan : "");
  };

  useEffect(() => {
    const currentMonth = new Date().getMonth();

    const currentBulan = bulanList.find(
      (bulan) => bulan.angkaBulan === currentMonth
    );

    if (currentBulan) {
      setSelectedBulan(currentBulan.id);
    }
  }, []);

  const printTable = () => {
    const tableHTML = tableRef.current.outerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Table Data Pemasukan</title>
          <style>
            /* Gaya CSS untuk cetakan */
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white;
                color: black;
              }
              th:nth-child(8), td:nth-child(8) {
                display: none;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          ${tableHTML} <!-- Masukkan tabel ke dalam dokumen baru -->
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    setFormValues((prevValues) => ({
      ...prevValues,
      tanggalTransaksi: formattedDate,
    }));
  }, []);

  const fetchData = async () => {
    try {
      if (selectedBulan && newSelectedYear) {
        const data = await GlobalApi.getTablePemasukanSanduka(
          selectedBulan,
          newSelectedYear
        );

        setTotalItems(data.length);
        const paginatedData = data.slice(indexOfFirstItem, indexOfLastItem);
        setTransactions(paginatedData);
        setPaginatedTransactions(paginatedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, newSelectedYear, currentPage, itemsPerPage]);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
      } catch (error) {}
    };

    fetchCabangData();
  }, []);

  const handleSubmitAll = async (e) => {
    e.preventDefault();

    const requestData = {
      uangMasukKeluar: {
        ...formValues,
      },
      targetCabang: formValues.cabang,
    };

    try {
      const response = await GlobalApi.sendSesuaiJumlahTarget(requestData);
      if (response && response.data) {
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
            <h3
              style={{
                fontSize: "2rem",
                display: "block",
                marginBottom: "28px",
              }}
            >
              Data berhasil dikirim!
            </h3>
          </div>,
          {
            icon: null,
            duration: 4000,
            style: {
              marginTop: "12%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "450px",
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
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Terjadi kesalahan saat mengirim data.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        // noBukti: formValues.noBukti,
        tanggalTransaksi: formValues.tanggalTransaksi,
        posTransaksi: formValues.posTransaksi,
        masukKe: formValues.jenisPenerimaan,
        cabang: formValues.cabang,
        bulan: formValues.setoranBulan,
        debet: formValues.nominal,
        kredit: "",
        bulanSantunan: formValues.bulanSantunan,
        keterangan: formValues.keterangan,
        jenisPembayaran: "Sanduka",
        namaPenerima: "",
        yangMeninggal: "",
        totalAnggota: "522",
        totalSumbangan: "4718000",
      };

      const response = await GlobalApi.createPembayaranSanduka(dataToSend);
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
          <h3
            style={{
              fontSize: "2rem",
              display: "block",
              marginBottom: "28px",
            }}
          >
            Data berhasil disimpan!
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menyimpan Data.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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

  const handleReset = () => {
    setFormValues({
      // noBukti: "",
      posTransaksi: "",
      jenisPenerimaan: "",
      cabang: "",
      setoranBulan: "",
      nominal: "",
      keterangan: "",
    });
  };

  const handleCheck = (noBukti) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.noBukti === noBukti
        ? { ...transaction, checked: !transaction.checked }
        : transaction
    );

    setTransactions(updatedTransactions);

    const allChecked = updatedTransactions.every(
      (transaction) => transaction.checked
    );
    setSelectAll(allChecked);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => ({
        ...transaction,
        checked: newSelectAll,
      }))
    );
  };

  const parseNumber = (value) => {
    if (value === "" || isNaN(parseFloat(value))) {
      return "-";
    }
    const number = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return isNaN(number) ? "-" : number;
  };

  const formatCurrency = (value) => {
    if (value === "-") return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleEditClick = async (noBukti) => {
    try {
      const data = await GlobalApi.editPemasukanUangMasuk(noBukti);

      setFormValues({
        tanggalTransaksi: data.tglTransaksi || "",
        posTransaksi: data.uraian || "",
        nominal: data.debet.trim() !== "" ? parseInt(data.debet) : 0,
      });
    } catch (error) {
      console.error("Gagal mengambil data berdasarkan noBukti:", error);
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
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
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
              <h1 className="text-base">Pemasukan Sanduka</h1>
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
              <h1 className="text-base">Pemasukan Sanduka</h1>
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
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                PEMASUKAN SANDUKA
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="noBukti"
                  >
                    No. Bukti
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="noBukti"
                    type="text"
                    name="noBukti"
                    value={formValues.noBukti}
                    onChange={handleChange}
                    readOnly
                  />
                </div> */}
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="tanggalTransaksi"
                  >
                    Tanggal Transaksi
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="tanggalTransaksi"
                    type="date"
                    name="tanggalTransaksi"
                    value={formValues.tanggalTransaksi || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="posTransaksi"
                  >
                    Pos Penerimaan
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="posTransaksi"
                    name="posTransaksi"
                    value={formValues.posTransaksi || ""}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Pos Penerima</option>
                    <option value="Sumbangan Sanduka">Sumbangan Sanduka</option>
                    <option value="Hibah">Hibah</option>
                    <option value="Lain-Lain">Lain - Lain</option>
                    <option value="Saldo Awal">Saldo Awal</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="jenisPenerimaan"
                  >
                    Jenis Penerimaan
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="jenisPenerimaan"
                    name="jenisPenerimaan"
                    value={formValues.jenisPenerimaan}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Jenis Penerimaan</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="flex flex-col relative" ref={dropdownRef}>
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="cabang"
                  >
                    Cabang
                  </Label>

                  <input
                    type="text"
                    placeholder="Cabang yang dipilih"
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formValues.cabang || ""}
                    readOnly
                    onFocus={() => setIsDropdownVisible(true)}
                  />

                  {isDropdownVisible && (
                    <div className="absolute top-full left-0 w-full z-10 mt-1 border bg-white shadow-lg rounded-b">
                      <ul className="max-h-48 overflow-y-auto">
                        <li className="py-2 px-4">
                          <input
                            type="text"
                            placeholder="Cari Cabang..."
                            className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formValues.searchCabang || ""}
                            autoFocus
                            onChange={(e) => {
                              const searchValue = e.target.value;
                              setFormValues((prevValues) => ({
                                ...prevValues,
                                searchCabang: searchValue,
                              }));
                            }}
                          />
                        </li>

                        <li className="py-2 px-4 hover:bg-blue-500 hover:text-white text-gray-500">
                          <button
                            onClick={() => {
                              setFormValues((prevValues) => ({
                                ...prevValues,
                                cabang: "",
                                searchCabang: "",
                              }));
                              setIsDropdownVisible(false);
                            }}
                          >
                            Pilih Cabang
                          </button>
                        </li>

                        <li className="py-2 px-4 hover:bg-blue-500 hover:text-white">
                          <button
                            onClick={() => {
                              setFormValues((prevValues) => ({
                                ...prevValues,
                                cabang: "All",
                                searchCabang: "All",
                              }));
                              setIsDropdownVisible(false);
                            }}
                          >
                            Semua Cabang
                          </button>
                        </li>

                        {cabangList
                          .filter((cabang) =>
                            cabang.kecamatan
                              .toLowerCase()
                              .includes(
                                formValues.searchCabang?.toLowerCase() || ""
                              )
                          )
                          .map((cabang) => (
                            <li
                              key={cabang.id}
                              className="py-1 px-4 hover:bg-blue-500 hover:text-white"
                            >
                              <button
                                onClick={() => {
                                  setFormValues((prevValues) => ({
                                    ...prevValues,
                                    cabang: cabang.kecamatan,
                                    searchCabang: "",
                                  }));
                                  setIsDropdownVisible(false);
                                }}
                              >
                                {cabang.kecamatan}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="setoranBulan"
                  >
                    Setoran Bulan
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="setoranBulan"
                    type="month"
                    name="setoranBulan"
                    value={formValues.setoranBulan || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="totalAnggota"
                  >
                    Total Anggota
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="totalAnggota"
                    type="number"
                    name="totalAnggota"
                    value={formValues.totalAnggota || ""}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="nominal"
                  >
                    Nominal
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="nominal"
                    type="number"
                    name="nominal"
                    value={formValues.nominal || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="totalSumbangan"
                  >
                    Total Sumbangan
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="totalSumbangan"
                    type="number"
                    name="totalSumbangan"
                    value={formValues.totalSumbangan || ""}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="keterangan"
                  >
                    Keterangan
                  </Label>
                  <Textarea
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="keterangan"
                    name="keterangan"
                    value={formValues.keterangan || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="totalAnggota"
                  >
                    Total Anggota By Admin
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="totalAnggota"
                    type="totalAnggota"
                    name="totalAnggota"
                    value={formValues.totalAnggota || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center mt-6 justify-center gap-6">
                <Button
                  className={`bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    formValues.nominal ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSubmitAll}
                  disabled={Boolean(formValues.nominal)}
                >
                  Sesuai Jumlah Target
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSubmit}
                >
                  Simpan
                </Button>
                <Button
                  className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-150 ease-in-out"
                  type="button"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5">
                  <select
                    className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    value={selectedBulan}
                    onChange={handleBulanChange}
                  >
                    <option value="">Pilih Bulan</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.angkaBulan} value={bulan.id}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>
                  <select
                    className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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
                  Transaksi {selectedBulanName} {newSelectedYear}
                </h1>
                <div className="flex justify-center space-x-4 mt-5 mr-10">
                  <Input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 mt-3"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <Button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Hapus
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    onClick={printTable}
                  >
                    Cetak
                  </Button>
                </div>
              </div>
            </div>

            <div ref={tableRef} className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr className="bg-gray-200 text-black text-center">
                    <th className="px-6 py-3 text-sm">No</th>
                    <th className="px-6 py-3 text-sm">Tgl Transaksi</th>
                    <th className="px-6 py-3 text-sm">No. Bukti</th>
                    <th className="px-6 py-3 text-sm">Uraian</th>
                    <th className="px-6 py-3 text-sm">Debet</th>
                    <th className="px-6 py-3 text-sm">Kredit</th>
                    <th className="px-6 py-3 text-sm">Saldo</th>
                    <th className="px-6 py-3 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction, index) =>
                    transaction.tglTransaksi ? (
                      <tr
                        key={index}
                        className={`border-b text-black text-center ${
                          transaction.checked
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {" "}
                          {transaction.tglTransaksi}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.noBukti}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.uraian}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(
                            parseFloat(transaction.debet.replace(",")) || 0
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(
                            parseFloat(transaction.kredit.replace(",")) || 0
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(transaction.saldo || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="checkbox"
                              className="form-checkbox h-4 w-4"
                              checked={transaction.checked}
                              onChange={() => handleCheck(transaction.noBukti)}
                            />
                            <Button
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                              onClick={() =>
                                handleEditClick(transaction.noBukti)
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : null
                  )}

                  <tr className="bg-gray-200 text-base text-black text-center font-bold">
                    <td className="px-6 py-4 text-left" colSpan="4">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const debet = Math.floor(
                            parseFloat(transaction.debet.replace(",")) || 0
                          );
                          return debet;
                        }, 0)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const kredit = Math.floor(
                            parseFloat(transaction.kredit.replace(",")) || 0
                          );
                          return kredit;
                        }, 0)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const saldo = Math.floor(
                            parseFloat(transaction.saldo.replace(",")) || 0
                          );
                          return saldo;
                        }, 0)
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm"></td>
                  </tr>
                </tbody>
              </table>
              <style jsx>{`
                @media print {
                  th:nth-child(8),
                  td:nth-child(8) {
                    display: none;
                  }

                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                }
              `}</style>
            </div>
            <div className="flex justify-center mt-4 gap-1">
              {totalItems >= itemsPerPage && (
                <div className="flex justify-center mt-4 gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Prev
                  </button>

                  {getVisiblePages().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        page === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pemasukan;
