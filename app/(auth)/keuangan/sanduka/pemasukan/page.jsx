"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

function Pemasukan() {
  const tableRef = useRef();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
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
  const [transactions, setTransactions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [cabangList, setCabangList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedBulanName, setSelectedBulanName] = useState("");
  const [checkedIds, setCheckedIds] = useState([]);
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const [newSelectedYear, setNewSelectedYear] = useState(currentYear);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaldoAwalExist, setIsSaldoAwalExist] = useState(false);
  const [saldoMap, setSaldoMap] = useState({});
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [editId, setEditId] = useState(null);
  const [allIds, setAllIds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    tanggalTransaksi: "",
    posTransaksi: "",
    masukKe: "",
    cabang: "",
    bulan: "",
    debet: "",
    kredit: "",
    bulanSantunan: "",
    yangMeninggal: "",
    namaPenerima: "",
    keterangan: "",
    jenisPembayaran: "Sanduka",
    totalAnggota: "",
    checked: false,
    totalAnggotaByAdmin: "",
    totalSumbangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nominal") {
      const numericValue = value.replace(/[^\d]/g, ""); // Menghapus semua karakter non-angka
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: numericValue,
      }));
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const currentMonthIndex = new Date().getMonth();
    const currentBulan = bulanList.find(
      (b) => b.angkaBulan === currentMonthIndex
    );

    if (currentBulan) {
      setSelectedBulan(currentBulan.id);
      setSelectedBulanName(currentBulan.namaBulan);
    }
  }, []);

  const handleBulanChange = (e) => {
    const selectedId = e.target.value;
    setSelectedBulan(selectedId);

    const bulan = bulanList.find((b) => b.id === selectedId);
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
    const bulanNama =
      bulanList.find((bulan) => bulan.id === selectedBulan)?.namaBulan || "";
    const tahunNama = newSelectedYear || "";

    // Membangun HTML tabel tanpa kolom Action
    const tableHTMLWithoutActions = `
      <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
          <tr class="bg-gray-200 text-black text-center">
            <th class="px-6 py-3 text-sm">No</th>
            <th class="px-6 py-3 text-sm">Tgl Transaksi</th>
            <th class="px-6 py-3 text-sm">No. Bukti</th>
            <th class="px-6 py-3 text-sm">Uraian</th>
            <th class="px-6 py-3 text-sm">Debet</th>
            <th class="px-6 py-3 text-sm">Kredit</th>
            <th class="px-6 py-3 text-sm">Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTransactions
            .filter((transaction) => transaction.tglTransaksi)
            .map(
              (transaction, index) => `
              <tr class="border-b text-black text-center ${
                transaction.checked ? "bg-gray-100" : "hover:bg-gray-50"
              }">
                <td class="px-6 py-4 text-sm">${index + 1}</td>
                <td class="px-6 py-4 text-sm">${transaction.tglTransaksi}</td>
                <td class="px-6 py-4 text-sm">${transaction.noBukti}</td>
                <td class="px-6 py-4 text-sm">${transaction.uraian}</td>
                <td class="px-6 py-4 text-sm">
                  ${formatCurrency(
                    transaction.uraian === "Saldo Awal"
                      ? Number(newSelectedYear) === 2021 &&
                        Number(selectedBulan) === 3
                        ? parseFloat(transaction.debet.replace(",", "")) || 0
                        : 0
                      : parseFloat(transaction.debet.replace(",", "")) || 0
                  )}
                </td>
                <td class="px-6 py-4 text-sm">
                  ${formatCurrency(
                    parseFloat(transaction.kredit.replace(",", "")) || 0
                  )}
                </td>
                <td class="px-6 py-4 text-sm">
                  ${
                    saldoMap[index]
                      ? saldoMap[index].toLocaleString("id-ID", {
                          minimumFractionDigits: 0,
                        })
                      : 0
                  }
                </td>
              </tr>
            `
            )
            .join("")}
          <tr class="bg-gray-200 text-base text-black text-center font-bold">
            <td class="px-6 py-4 text-left" colSpan="4">TOTAL</td>
            <td class="px-6 py-4 text-sm">
              ${formatCurrency(
                transactions.reduce((total, transaction) => {
                  const isSaldoAwal = transaction.uraian === "Saldo Awal";
                  const isMaret2021 =
                    Number(newSelectedYear) === 2021 &&
                    Number(selectedBulan) === 3;
                  const debet =
                    isSaldoAwal && !isMaret2021
                      ? 0
                      : Math.floor(
                          parseFloat(transaction.debet.replace(",")) || 0
                        );
                  return total + debet;
                }, 0)
              )}
            </td>
            <td class="px-6 py-4 text-sm">
              ${formatCurrency(
                transactions.reduce((total, transaction) => {
                  const kredit = Math.floor(
                    parseFloat(transaction.kredit.replace(",", "")) || 0
                  );
                  return total + kredit;
                }, 0)
              )}
            </td>
            <td class="px-6 py-4 text-sm">
              ${totalSaldo.toLocaleString("id-ID", {
                minimumFractionDigits: 0,
              })}
            </td>
            <td class="px-6 py-4 text-sm"></td>
          </tr>
        </tbody>
      </table>
    `;

    // Membuka jendela baru untuk mencetak
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Table Data Pemasukan Bulan ${bulanNama} Tahun ${tahunNama}</title>
          <style>
            /* Gaya CSS untuk cetakan */
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white;
                color: black;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: center;
              }
              .header-info {
                margin-bottom: 20px;
                font-size: 16px;
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          ${tableHTMLWithoutActions} <!-- Insert table without Action column into the print page -->
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
          newSelectedYear,
          "Sanduka"
        );
        setTransactions(data);
        console.log(data);

        const saldoAwalData = data.find((item) => item.uraian === "Saldo Awal");

        if (saldoAwalData) {
          setIsSaldoAwalExist(true);
        } else {
          setIsSaldoAwalExist(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, newSelectedYear]);

  useEffect(() => {
    let tempSaldoMap = {};
    let saldoSebelumnya = 0;

    transactions.forEach((transaction, index) => {
      let currentSaldo = 0;

      if (transaction.uraian === "Saldo Awal") {
        saldoSebelumnya = parseFloat(transaction.debet.replace(",", "")) || 0;
        currentSaldo = saldoSebelumnya;
      } else {
        let debet = parseFloat(transaction.debet.replace(",", "")) || 0;
        let kredit = parseFloat(transaction.kredit.replace(",", "")) || 0;

        currentSaldo = saldoSebelumnya + debet - kredit;
      }

      tempSaldoMap[index] = currentSaldo;
      saldoSebelumnya = currentSaldo;
    });

    setSaldoMap(tempSaldoMap);

    const calculatedTotalSaldo =
      transactions.reduce((total, transaction) => {
        // Langsung hitung debet tanpa kondisi khusus
        const debet = Math.floor(
          parseFloat(transaction.debet.replace(",", "")) || 0
        );

        // Log debet setiap transaksi untuk debug
        // console.log(`Debet (transaksi ${transaction.id}): ${debet}`);

        return total + debet;
      }, 0) -
      transactions.reduce((total, transaction) => {
        const kredit = Math.floor(
          parseFloat(transaction.kredit.replace(",", "")) || 0
        );

        // Log kredit setiap transaksi untuk debug
        // console.log(`Kredit (transaksi ${transaction.id}): ${kredit}`);

        return total + kredit;
      }, 0);

    // Log total saldo yang dihitung
    // console.log(`Calculated Total Saldo: ${calculatedTotalSaldo}`);

    setTotalSaldo(calculatedTotalSaldo);
  }, [transactions]);

  const createSaldoAwal = async () => {
    try {
      setIsLoading(true);

      const selectedDate = formValues.tanggalTransaksi
        ? new Date(formValues.tanggalTransaksi)
        : new Date();

      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();

      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

      // console.log(
      //   `Tanggal transaksi yang dipilih: ${selectedDate.toISOString().split("T")[0]
      //   }`
      // );
      // console.log(
      //   `Mengambil data transaksi dari bulan: ${prevMonth + 1
      //   }, tahun: ${prevYear}`
      // );

      const prevTransactions = await GlobalApi.getTablePemasukanSanduka(
        prevMonth + 1,
        prevYear,
        "Sanduka"
      );

      // console.log("Transaksi bulan sebelumnya:", prevTransactions);

      const totalDebet = prevTransactions.reduce((total, transaction) => {
        const debet = Math.floor(
          parseFloat(transaction.debet.replace(",", "")) || 0
        );
        return total + debet;
      }, 0);

      const totalKredit = prevTransactions.reduce((total, transaction) => {
        const kredit = Math.floor(
          parseFloat(transaction.kredit.replace(",", "")) || 0
        );
        return total + kredit;
      }, 0);

      const totalSaldoPrev = totalDebet - totalKredit;

      // console.log(`Total Debet: ${totalDebet}`);
      // console.log(`Total Kredit: ${totalKredit}`);
      // console.log(
      //   `Saldo Awal yang dihitung (Debet - Kredit): ${totalSaldoPrev}`
      // );

      // Buat request untuk saldo awal
      const saldoAwalRequest = {
        tanggalTransaksi:
          formValues.tanggalTransaksi ||
          selectedDate.toISOString().split("T")[0],
        posTransaksi: "Saldo Awal",
        masukKe: "Bank",
        debet: totalSaldoPrev,
        jenisPembayaran: "Sanduka",
      };

      // console.log("Data yang akan dikirim untuk Saldo Awal:", saldoAwalRequest);

      await GlobalApi.createSaldoAwal(saldoAwalRequest);

      window.location.reload();
    } catch (error) {
      console.error("Error saat membuat Saldo Awal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Pastikan hanya dieksekusi jika saldo awal belum ada
      if (currentHour === 7 && currentMinute === 10 && !isSaldoAwalExist) {
        createSaldoAwal(); // Memanggil fungsi jika saldo awal belum ada
      }
    };

    // Cek waktu setiap detik
    const intervalId = setInterval(checkTime, 1000);

    // Hentikan pengecekan setelah 1 menit (untuk menghindari pemeriksaan yang tidak perlu)
    const timeoutId = setTimeout(() => clearInterval(intervalId), 60000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isSaldoAwalExist]);

  const sortedTransactions = (() => {
    if (!transactions) return [];

    const saldoAwal = transactions.find((t) => t.uraian === "Saldo Awal");
    const otherTransactions = transactions.filter(
      (t) => t.uraian !== "Saldo Awal"
    );

    return saldoAwal ? [saldoAwal, ...otherTransactions] : otherTransactions;
  })();

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
        setNotification({
          type: "success",
          message: `Data berhasil dikirim!`,
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: `Terjadi kesalahan saat mengirim data!`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const dataToSend = {
      //   // noBukti: formValues.noBukti,
      //   tanggalTransaksi: formValues.tanggalTransaksi,
      //   posTransaksi: formValues.posTransaksi,
      //   masukKe: formValues.jenisPenerimaan,
      //   cabang: formValues.cabang,
      //   bulan: formValues.setoranBulan,
      //   debet: formValues.nominal,
      //   kredit: "",
      //   bulanSantunan: formValues.bulanSantunan || "",
      //   keterangan: formValues.keterangan,
      //   jenisPembayaran: "Sanduka",
      //   namaPenerima: formValues.namaPenerima,
      //   yangMeninggal: "",
      //   totalAnggota: formValues.totalAnggota,
      //   totalSumbangan: formValues.totalSumbangan,
      //   totalAnggotaByAdmin: formValues.totalAnggotaByAdmin,
      // };
      const dataToSend = {
        // noBukti: formValues.noBukti,
        tanggalTransaksi: formValues.tanggalTransaksi,
        posTransaksi: formValues.posTransaksi,
        masukKe: formValues.jenisPenerimaan,
        cabang: formValues.cabang,
        bulan: formValues.setoranBulan,
        debet: formValues.nominal,
        kredit: "",
        bulanSantunan: "",
        keterangan: formValues.keterangan,
        jenisPembayaran: "Sanduka",
        namaPenerima: "",
        yangMeninggal: "",
        totalAnggota: formValues.totalAnggota,
        totalSumbangan: formValues.totalSumbangan,
        totalAnggotaByAdmin: formValues.totalAnggotaByAdmin,
      };

      const response = await GlobalApi.createPembayaranSanduka(dataToSend);
      setNotification({
        type: "success",
        message: `Data berhasil disimpan!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      setNotification({
        type: "error",
        message: `Gagal menyimpan data!`,
      });
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

  const handleCheck = (id) => {
    setCheckedIds((prevCheckedIds) => {
      if (prevCheckedIds.includes(id)) {
        return prevCheckedIds.filter((checkedId) => checkedId !== id);
      } else {
        return [...prevCheckedIds, id];
      }
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedCheckedIds = newSelectAll
      ? transactions
          .filter((transaction) => transaction.uraian !== "Saldo Awal")
          .map((transaction) => transaction.id)
      : [];

    setCheckedIds(updatedCheckedIds);

    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => ({
        ...transaction,
        checked: newSelectAll && transaction.uraian !== "Saldo Awal",
      }))
    );
  };

  const handleDeleteClick = async () => {
    setIsLoading(true);

    try {
      for (const id of checkedIds) {
        const response = await GlobalApi.hapusPemasukanUangMasuk(id);

        if (response) {
          setTransactions((prevTransactions) =>
            prevTransactions.filter(
              (transaction) => !checkedIds.includes(transaction.id)
            )
          );
          setPaginatedTransactions((prevPaginatedTransactions) =>
            prevPaginatedTransactions.filter(
              (transaction) => !checkedIds.includes(transaction.id)
            )
          );

          setNotification({
            type: "success",
            message: `Data berhasil dihapus!`,
          });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error("Gagal menghapus data dengan ID:", checkedIds, error);
      setNotification({
        type: "error",
        message: `Terjadi kesalahan saat menghapus data!`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClickId = async (id) => {
    setLoadingId(id);

    try {
      const response = await GlobalApi.hapusPemasukanUangMasuk(id);

      if (response) {
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );
        setPaginatedTransactions((prevPaginatedTransactions) =>
          prevPaginatedTransactions.filter(
            (transaction) => transaction.id !== id
          )
        );

        setNotification({
          type: "success",
          message: `Data berhasil dihapus!`,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error("Gagal menghapus data dengan ID:", id, error);
      setNotification({
        type: "error",
        message: `Terjadi kesalahan saat menghapus data!`,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
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

  const handleGetEdit = async (id) => {
    try {
      setEditId(id);

      const data = await GlobalApi.getPemasukanUangMasukById(id);

      const tanggalTransaksi = data.tanggalTransaksi
        ? data.tanggalTransaksi.split(", ")[1] || data.tanggalTransaksi
        : "";

      const updatedFormValues = {
        noBukti: data.noBukti || "",
        tanggalTransaksi: tanggalTransaksi || "",
        posTransaksi: data.posTransaksi || "",
        jenisPenerimaan: data.masukKe || "",
        cabang: data.cabang || "",
        setoranBulan: data.bulan || "",
        totalAnggota: data.totalAnggota || "",
        nominal: data.debet || "",
        totalSumbangan: data.totalSumbangan || "",
        totalAnggotaByAdmin: data.totalAnggotaByAdmin || "",
        keterangan: data.posTransaksi || "",
      };

      // Jika posTransaksi bukan "Saldo Awal", langsung tampilkan data tanpa pencarian tambahan
      // if (data.posTransaksi !== "Saldo Awal") {
      //   // console.log("Bukan 'Saldo Awal', langsung menampilkan form data.");
      //   setFormValues(updatedFormValues);
      //   setIsEditing(true);
      //   return;
      // }

      // // console.log(
      // //   "Mendeteksi uraian 'Saldo Awal', mengambil seluruh data terkait..."
      // // );

      // let allIds = [];
      // const startYear = 2021;
      // const startMonth = 4; // April (bulan dalam JavaScript mulai dari 0, jadi 4 = Mei)

      // const now = new Date();
      // const currentYear = now.getFullYear();
      // const currentMonth = now.getMonth() + 1; // getMonth() dimulai dari 0

      // // Looping dari April 2021 hingga bulan saat ini
      // for (let year = startYear; year <= currentYear; year++) {
      //   let start = year === startYear ? startMonth : 1; // Jika tahun pertama, mulai dari April, sisanya dari Januari
      //   let end = year === currentYear ? currentMonth : 12; // Jika tahun terakhir, hanya sampai bulan saat ini

      //   for (let month = start; month <= end; month++) {
      //     // console.log(`Mengambil data bulan ${month} tahun ${year}...`);

      //     try {
      //       const allData = await GlobalApi.getTablePemasukanSanduka(
      //         month,
      //         year
      //       );

      //       // Filter data yang memiliki uraian "Saldo Awal"
      //       const filteredData = allData.filter(
      //         (item) => item.uraian === "Saldo Awal"
      //       );

      //       // Ambil semua ID dari hasil filter
      //       const ids = filteredData.map((item) => item.id);
      //       allIds = allIds.concat(ids);
      //     } catch (error) {
      //       console.error(
      //         `Gagal mengambil data untuk bulan ${month} tahun ${year}:`,
      //         error
      //       );
      //     }
      //   }
      // }

      // // Simpan seluruh ID yang ditemukan ke dalam state
      // setAllIds(allIds);
      // console.log(
      //   "Semua ID dengan uraian 'Saldo Awal' sejak April 2021:",
      //   allIds
      // );

      setFormValues(updatedFormValues);
      setIsEditing(true);
    } catch (error) {
      console.error("Gagal mengambil data berdasarkan id:", error);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editId) {
      console.error("ID belum ada, tidak bisa mengedit");
      return;
    }

    try {
      const data = await GlobalApi.getPemasukanUangMasukById(editId);

      const updatedFormValues = {
        noBukti: data.noBukti || "",
        tanggalTransaksi: formValues.tanggalTransaksi || "",
        posTransaksi: formValues.posTransaksi || "",
        masukKe: formValues.jenisPenerimaan || "",
        cabang: formValues.cabang || "",
        bulan: formValues.setoranBulan || "",
        debet: formValues.nominal || "",
        kredit: "",
        bulanSantunan: "",
        yangMeninggal: "",
        namaPenerima: "",
        keterangan: "",
        jenisPembayaran: "Sanduka",
      };

      setFormValues(updatedFormValues);

      const response = await GlobalApi.editPemasukanUangMasuk(
        editId,
        updatedFormValues
      );

      setNotification({
        type: "success",
        message: `Data berhasil diupdate!`,
      });
      if (data.posTransaksi === "Saldo Awal") {
        // console.log(
        //   "Transaksi 'Saldo Awal' terdeteksi, memperbarui seluruh ID..."
        // );
        // await handleSubmitEditAll();
        window.location.reload();
      } else {
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: `Gagal mengupdate data. Coba lagi!`,
      });
      console.error("Gagal mengedit data:", error);
    }
  };

  // const handleSubmitEditAll = async () => {
  //   if (allIds.length === 0) {
  //     console.error("Tidak ada ID yang dapat diperbarui");
  //     return;
  //   }

  //   // console.log("ID yang akan diperbarui:", allIds);

  //   try {
  //     const promises = allIds.map(async (id) => {
  //       const data = await GlobalApi.getPemasukanUangMasukById(id);

  //       const tanggalTransaksi = new Date(data.tanggalTransaksi);
  //       const bulanTransaksi = tanggalTransaksi.getMonth() + 1;
  //       const tahunTransaksi = tanggalTransaksi.getFullYear();

  //       // console.log(`Memproses transaksi untuk ID: ${id}, Bulan: ${bulanTransaksi}, Tahun: ${tahunTransaksi}`);

  //       const bulanSebelumnya = bulanTransaksi === 1 ? 12 : bulanTransaksi - 1;
  //       const tahunSebelumnya =
  //         bulanTransaksi === 1 ? tahunTransaksi - 1 : tahunTransaksi;

  //       const allData = await GlobalApi.getTablePemasukanSanduka(
  //         bulanSebelumnya,
  //         tahunSebelumnya
  //       );

  //       let currentSaldo = 0;
  //       let totalSaldoBulan = 0;
  //       let totalSaldoBulanFinal = 0;

  //       allData.forEach((transaction, index) => {
  //         let debet = parseFloat(transaction.debet.replace(",", "")) || 0;
  //         let kredit = parseFloat(transaction.kredit.replace(",", "")) || 0;

  //         if (transaction.uraian === "Saldo Awal") {
  //           currentSaldo = debet;
  //         } else {
  //           currentSaldo += debet - kredit;
  //         }

  //         totalSaldoBulan = currentSaldo;
  //         totalSaldoBulanFinal += totalSaldoBulan;

  //         // console.log(`Transaksi ke-${index + 1} - Saldo sementara bulan ${bulanSebelumnya} tahun ${tahunSebelumnya}: ${totalSaldoBulan}`);
  //       });

  //       // console.log(`Total saldo akhir per bulan ${bulanSebelumnya} tahun ${tahunSebelumnya}: ${totalSaldoBulanFinal}`);

  //       const updatedFormValues = {
  //         noBukti: data.noBukti || "",
  //         tanggalTransaksi: data.tanggalTransaksi || "",
  //         posTransaksi: data.posTransaksi || "",
  //         masukKe: data.masukKe || "",
  //         cabang: data.cabang || "",
  //         bulan: bulanTransaksi || "",
  //         debet: totalSaldoBulanFinal || 0,
  //         kredit: "",
  //         bulanSantunan: "",
  //         yangMeninggal: "",
  //         namaPenerima: "",
  //         keterangan: "",
  //         jenisPembayaran: "Sanduka",
  //       };

  //       console.log(
  //         "Data yang akan dikirim untuk update ID:",
  //         id,
  //         updatedFormValues
  //       );

  //       return GlobalApi.editPemasukanUangMasuk(id, updatedFormValues);
  //     });

  //     await Promise.all(promises);

  //     setNotification({
  //       type: 'success',
  //       message: `Semua saldo awal berhasil dihitung! (Tidak dikirim ke database)`,
  //     });
  //     window.location.reload();
  //   } catch (error) {
  //     setNotification({
  //       type: 'success',
  //       message: `Gagal menghitung dan memperbarui semua saldo awal. Coba lagi!`,
  //     });
  //     console.error(
  //       "Gagal menghitung dan memperbarui semua saldo awal:",
  //       error
  //     );
  //   }
  // };

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
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
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
                    type="text"
                    name="nominal"
                    value={formatCurrency(formValues.nominal || "")}
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
                    htmlFor="totalAnggotaByAdmin"
                  >
                    Total Anggota By Admin
                  </Label>
                  <Input
                    className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="totalAnggotaByAdmin"
                    type="totalAnggotaByAdmin"
                    name="totalAnggotaByAdmin"
                    value={formValues.totalAnggotaByAdmin || ""}
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
                <div className="flex space-x-4">
                  {!isEditing ? (
                    <Button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={handleSubmit}
                    >
                      Simpan
                    </Button>
                  ) : (
                    <Button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={handleSubmitEdit}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <Button
                  className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-150 ease-in-out"
                  type="button"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  className={`bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center`}
                  onClick={createSaldoAwal}
                  disabled={isLoading || isSaldoAwalExist}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    "Saldo Awal"
                  )}
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
                {isModalOpen && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                      <h2 className="text-xl font-bold mb-4">Informasi</h2>
                      <p>
                        Jika melakukan edit, sesuaikan dengan tab pemasukan atau
                        pengeluaran.
                      </p>
                      <div className="flex justify-end mt-4">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                          onClick={handleModalToggle}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-center space-x-4 mt-5 mr-10">
                  <FaExclamationCircle
                    className="mt-3 text-lg cursor-pointer text-blue-400"
                    onClick={handleModalToggle}
                  />
                  <Input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 mt-3"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <button
                    className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center`}
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 text-white mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      "Hapus"
                    )}
                  </button>
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
                  {sortedTransactions
                    .filter((transaction) => transaction.tglTransaksi)
                    .map((transaction, index) => (
                      <tr
                        key={transaction.id}
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
                          {/* {formatCurrency(
                            transaction.uraian === "Saldo Awal"
                              ? Number(newSelectedYear) === 2021 &&
                                Number(selectedBulan) === 3
                                ? parseFloat(
                                    transaction.debet.replace(",", "")
                                  ) || 0
                                : 0
                              : parseFloat(
                                  transaction.debet.replace(",", "")
                                ) || 0
                          )} */}
                          {formatCurrency(
                            parseFloat(transaction.debet.replace(",", "")) || 0
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(
                            parseFloat(transaction.kredit.replace(",", "")) || 0
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {saldoMap[index]
                            ? formatCurrency(saldoMap[index])
                            : formatCurrency(0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="checkbox"
                              className="form-checkbox h-4 w-4"
                              checked={transaction.checked}
                              onChange={() => handleCheck(transaction.id)}
                              // disabled={transaction.uraian === "Saldo Awal"}
                            />
                            <Button
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                              onClick={() => handleGetEdit(transaction.id)}
                            >
                              Edit
                            </Button>
                            <button
                              className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center ${
                                transaction.uraian === "Saldo Awal"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() =>
                                handleDeleteClickId(transaction.id)
                              }
                              disabled={
                                transaction.uraian === "Saldo Awal" ||
                                loadingId === transaction.id
                              }
                            >
                              {loadingId === transaction.id ? (
                                <div className="flex items-center">
                                  <svg
                                    className="animate-spin h-5 w-5 text-white mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                  </svg>
                                </div>
                              ) : (
                                "Hapus"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {/* Baris Total */}
                  <tr className="bg-gray-200 text-base text-black text-center font-bold">
                    <td className="px-6 py-4 text-left" colSpan="4">
                      TOTAL
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {/* {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const isSaldoAwal =
                            transaction.uraian === "Saldo Awal";
                          const isMaret2021 =
                            Number(newSelectedYear) === 2021 &&
                            Number(selectedBulan) === 3;

                          // Hanya jumlahkan "Saldo Awal" jika Maret 2021, transaksi lain tetap dihitung normal
                          const debet =
                            isSaldoAwal && !isMaret2021
                              ? 0
                              : Math.floor(
                                  parseFloat(transaction.debet.replace(",")) ||
                                    0
                                );

                          return total + debet;
                        }, 0)
                      )} */}
                      {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const debet = Math.floor(
                            parseFloat(transaction.debet.replace(",", "")) || 0
                          );
                          return total + debet;
                        }, 0)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(
                        transactions.reduce((total, transaction) => {
                          const kredit = Math.floor(
                            parseFloat(transaction.kredit.replace(",", "")) || 0
                          );
                          return total + kredit;
                        }, 0)
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(totalSaldo)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pemasukan;
