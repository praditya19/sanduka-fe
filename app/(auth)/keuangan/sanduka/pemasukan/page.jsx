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
  const [transactions, setTransactions] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [newSelectedYear, setNewSelectedYear] = useState(currentYear);
  const [formValues, setFormValues] = useState({
    noBukti: "",
    tanggalTransaksi: "",
    posPenerimaan: "",
    jenisPenerimaan: "",
    cabang: "",
    setoranBulan: "",
    nominal: "",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleBulanChange = (e) => {
    setSelectedBulan(e.target.value);
  };

  const handleYearChange = (e) => {
    setNewSelectedYear(e.target.value);
  };

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const today = new Date();

    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = today.toLocaleDateString("id-ID", options);

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
        console.log(data);
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, newSelectedYear]);

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

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data);
      } catch (error) {}
    };

    fetchBulan();
  }, []);

  const [selectAll, setSelectAll] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        noBukti: formValues.noBukti,
        tanggalTransaksi: formValues.tanggalTransaksi,
        posTransaksi: formValues.posPenerimaan,
        masukKe: formValues.jenisPenerimaan,
        cabang: formValues.cabang,
        bulan: formValues.setoranBulan,
        debet: formValues.nominal,
        kredit: formValues.nominal,
        bulanSantunan: formValues.setoranBulan,
        keterangan: formValues.keterangan,
        jenisPembayaran: "Sanduka",
        namaPenerima: "",
        yangMeninggal: "",
      };

      const response = await GlobalApi.createPembayaranSanduka(dataToSend);
      toast.success("Data berhasil disimpan!");
      console.log("Data yang berhasil dikirim:", dataToSend);
    } catch (error) {
      toast.error(`Gagal menyimpan data: ${error.message}`);
    }
  };

  const handleReset = () => {
    setFormValues({
      noBukti: "",
      posPenerimaan: "",
      jenisPenerimaan: "",
      cabang: "",
      setoranBulan: "",
      nominal: "",
      keterangan: "",
    });
  };

  const handleCheck = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, checked: !transaction.checked }
          : transaction
      )
    );
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => ({
        ...transaction,
        checked: isChecked,
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

  const totalBalance = transactions.reduce(
    (acc, transaction) =>
      acc +
      (parseNumber(transaction.balance) === "-"
        ? 0
        : parseNumber(transaction.balance)),
    0
  );

  const totalDebit = transactions.reduce(
    (acc, transaction) =>
      acc +
      (parseNumber(transaction.debit) === "-"
        ? 0
        : parseNumber(transaction.debit)),
    0
  );

  const totalCredit = transactions.reduce(
    (acc, transaction) =>
      acc +
      (parseNumber(transaction.credit) === "-"
        ? 0
        : parseNumber(transaction.credit)),
    0
  );

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
                <div className="flex flex-col">
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
                  />
                </div>
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
                    type="text"
                    name="tanggalTransaksi"
                    value={formValues.tanggalTransaksi}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="posPenerimaan"
                  >
                    Pos Penerimaan
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="posPenerimaan"
                    name="posPenerimaan"
                    value={formValues.posPenerimaan}
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
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="cabang"
                  >
                    Cabang
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="cabang"
                    name="cabang"
                    value={formValues.cabang}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Cabang</option>
                    {cabangList.map((cabang) => (
                      <option key={cabang.id} value={cabang.kecamatan}>
                        {cabang.kecamatan}
                      </option>
                    ))}
                  </select>
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
                    value={formValues.setoranBulan}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="nominal"
                  >
                    Total Anggota
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="nominal"
                    type="number"
                    name="nominal"
                    // value={formValues.nominal}
                    // onChange={handleChange}
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
                    value={formValues.nominal}
                    onChange={handleChange}
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
                    value={formValues.keterangan}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="nominal"
                  >
                    Total Sumbangan
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="nominal"
                    type="number"
                    name="nominal"
                    // value={formValues.nominal}
                    // onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center mt-6 justify-center gap-6">
                <Button
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSubmit}
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
                  Transaksi {selectedBulan} {newSelectedYear}
                </h1>
                <div className="flex justify-center space-x-4 mt-5 mr-10">
                  <Input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 mt-3"
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
                  {transactions.map((transaction, index) =>
                    transaction.tglTransaksi ? (
                      <tr
                        key={index}
                        className={`border-b text-black text-center ${
                          transaction.checked
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm">{index + 1}</td>
                        <td className="px-6 py-4 text-sm">
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
                              onChange={() => handleCheck(transaction.id)}
                            />
                            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : null
                  )}

                  {/* Row for TOTAL */}
                  {/* <tr className="bg-gray-200 text-base text-black text-center font-bold">
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
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pemasukan;
