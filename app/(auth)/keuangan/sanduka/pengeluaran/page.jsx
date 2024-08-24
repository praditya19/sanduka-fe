"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

function Pengeluaran() {
  const [formValues, setFormValues] = useState({
    noBukti: "",
    tanggalTransaksi: "01/03/2020",
    posPenerimaan: "Sumbangan Sanduka",
    jenisPenerimaan: "Bank",
    cabang: "",
    setoranBulan: "",
    nominal: "",
    keterangan: "",
  });
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "Senin, 01/07/2024",
      noBukti: "01-0000001",
      description: "Saldo Awal",
      debit: "302946650",
      credit: "",
      balance: "302946650",
      checked: false,
    },
    {
      id: 2,
      date: "Senin, 15/07/2024",
      noBukti: "11-0000184",
      description: "Santunan -atas nama KUSNIATI (DONOROJO) diterima",
      debit: "",
      credit: "2500000",
      balance: "300446650",
      checked: false,
    },
    {
      id: 3,
      date: "Senin, 15/07/2024",
      noBukti: "11-0000186",
      description: "Santunan -atas nama NUNIK LUDFIANA HADI (TAHUNAN) diterima",
      debit: "",
      credit: "2500000",
      balance: "297946650",
      checked: false,
    },
    {
      id: 4,
      date: "Senin, 15/07/2024",
      noBukti: "11-0000187",
      description: "Santunan -atas nama NUR KHALIM (KALINYAMATAN) diterima",
      debit: "",
      credit: "2500000",
      balance: "295446650",
      checked: false,
    },
    {
      id: 5,
      date: "Senin, 15/07/2024",
      noBukti: "11-0000188",
      description:
        "Santunan -atas nama SUHARTO (CABSUS DINAS PENDIDIKAN) diterima",
      debit: "",
      credit: "2500000",
      balance: "292946650",
      checked: false,
    },
    {
      id: 6,
      date: "Senin, 15/07/2024",
      noBukti: "11-0000189",
      description: "Santunan -atas nama UTSIYAH PUJI RAHAYU (JEPARA) diterima",
      debit: "",
      credit: "2500000",
      balance: "290446650",
      checked: false,
    },
    {
      id: 7,
      date: "Selasa, 16/07/2024",
      noBukti: "11-0000185",
      description: "Santunan -atas nama MARDJONO (PECANGAAN) diterima",
      debit: "",
      credit: "2500000",
      balance: "287946650",
      checked: false,
    },
  ]);
  const [selectAll, setSelectAll] = useState(false);
  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formValues);
  };

  const handleReset = () => {
    setFormValues({
      noBukti: "",
      tanggalTransaksi: "01/03/2020",
      posPenerimaan: "Sumbangan Sanduka",
      jenisPenerimaan: "Bank",
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
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Pengeluaran Sanduka</h1>
            </div>
          </div>
        </header>
      ) : (
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
            <h1 className="text-base">Pengeluaran Sanduka</h1>
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
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                PENGELUARAN SANDUKA
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
                    placeholder="No Bukti Otomatis"
                    readOnly
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
                    type="date"
                    name="tanggalTransaksi"
                    value={formValues.tanggalTransaksi}
                  />
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="posPenerimaan"
                  >
                    Pos Pengeluaran
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="posPenerimaan"
                    name="posPenerimaan"
                    value={formValues.posPenerimaan}
                    onChange={handleChange}
                  >
                    <option value="sumbangan sanduka">
                      Pengeluaran Sanduka
                    </option>
                    <option value="hibah">Operasional 15%</option>
                    <option value="lain-lain">Lain - Lain</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="jenisPenerimaan"
                  >
                    Nama Penerima
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="tanggalTransaksi"
                    type="text"
                    name="tanggalTransaksi"
                    value={formValues.tanggalTransaksi}
                  />
                  <Button>Kwitansi</Button>
                </div>
                <div className="flex flex-col">
                  <Label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="cabang"
                  >
                    Data Sanduka
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-5"
                    id="cabang"
                    name="cabang"
                    value={formValues.cabang}
                    onChange={handleChange}
                  >
                    <option>-- Bulan Lapor --</option>
                  </select>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-5"
                    id="cabang"
                    name="cabang"
                    value={formValues.cabang}
                    onChange={handleChange}
                  >
                    <option>-- Nama Yang Meninggal --</option>
                  </select>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-5"
                    id="cabang"
                    name="cabang"
                    value={formValues.cabang}
                    onChange={handleChange}
                  >
                    <option>-- Tahun Lapor --</option>
                  </select>
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

                  <div className="flex flex-col mt-5">
                    <Label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="keterangan"
                    >
                      Keterangan
                    </Label>
                    <Textarea
                      className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      id="keterangan"
                      name="keterangan"
                      value={formValues.keterangan}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-6 justify-center">
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSubmit}
                >
                  Simpan
                </Button>
                <Button
                  className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-150 ease-in-out ml-6"
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
                  <select className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
                    <option>Juli</option>
                    <option>Agustus</option>
                    <option>September</option>
                  </select>
                  <select className="shadow-lg border rounded w-1/2 sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
                    <option>2023</option>
                    <option>2024</option>
                    <option>2025</option>
                  </select>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                  Transaksi Juli 2024
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
                  <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Cetak
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr className="bg-gray-200 text-black text-center">
                    <th className="px-6 py-3 font-semibold">No</th>
                    <th className="px-6 py-3 font-semibold">Tgl Transaksi</th>
                    <th className="px-6 py-3 font-semibold">No. Bukti</th>
                    <th className="px-6 py-3 font-semibold">Uraian</th>
                    <th className="px-6 py-3 font-semibold">Debet</th>
                    <th className="px-6 py-3 font-semibold">Kredit</th>
                    <th className="px-6 py-3 font-semibold">Saldo</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`border-b text-black text-center ${
                        transaction.checked ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">{transaction.id}</td>
                      <td className="px-6 py-4">{transaction.date}</td>
                      <td className="px-6 py-4">{transaction.noBukti}</td>
                      <td className="px-6 py-4">{transaction.description}</td>
                      <td className="px-6 py-4">
                        {formatCurrency(parseNumber(transaction.debit))}
                      </td>
                      <td className="px-6 py-4">
                        {formatCurrency(parseNumber(transaction.credit))}
                      </td>
                      <td className="px-6 py-4">
                        {formatCurrency(parseNumber(transaction.balance))}
                      </td>
                      <td className="px-6 py-4">
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
                  ))}
                  <tr className="bg-gray-200 font-bold text-black text-center">
                    <td className="px-6 py-4 text-left" colSpan="4">
                      TOTAL
                    </td>
                    <td className="px-6 py-4">{formatCurrency(totalDebit)}</td>
                    <td className="px-6 py-4">{formatCurrency(totalCredit)}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(totalBalance)}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pengeluaran;
