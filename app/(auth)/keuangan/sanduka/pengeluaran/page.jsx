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
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Pengeluaran() {
  const tableRef = useRef();
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
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const [newSelectedYear, setNewSelectedYear] = useState(currentYear);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedBulanName, setSelectedBulanName] = useState("");
  const [formValues, setFormValues] = useState({
    noBukti: "",
    tanggalTransaksi: "",
    posTransaksi: "",
    posPenerimaan: "",
    jenisPenerimaan: "",
    cabang: "",
    setoranBulan: "",
    nominal: "",
    bulanSantunan: "",
    yangMeninggal: "",
    namaPenerima: "",
    jenisPembayaran: "Sanduka",
    keterangan: "",
    terbilang: "",
    tahun: "",
    checked: false,
    bulan: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredNames, setFilteredNames] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [kwitansiData, setKwitansiData] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [allNames, setAllNames] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isIframeVisible, setIsIframeVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
   const [checkedIds, setCheckedIds] = useState([]);

  const getBulanAngka = (bulanNama) => {
    const bulanObj = bulanList.find((bulan) => bulan.namaBulan === bulanNama);
    return bulanObj ? bulanObj.angkaBulan : null;
  };

  useEffect(() => {
    const tanggalStr = formValues.tanggalTransaksi || ""; // Pastikan ada nilai default

    if (tanggalStr) {
      const [tanggalPart, bulanPart, tahunPart] = tanggalStr.split("");

      const bulanAngka = getBulanAngka(bulanPart);

      setTanggal(parseInt(tanggalPart, 10));
      setBulan(bulanAngka);
      setTahun(parseInt(tahunPart, 10));
    } else {
      setTanggal(null);
      setBulan(null);
      setTahun(null);
    }
  }, [formValues.tanggalTransaksi]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const formattedTanggal = `${tahun}-${String(bulan + 1).padStart(
    //   2,
    //   "0"
    // )}-${String(tanggal).padStart(2, "0")}`;

    const dataToSend = {
      noBukti: formValues.noBukti,
      tanggalTransaksi: formValues.tanggalTransaksi,
      posTransaksi: formValues.posTransaksi,
      masukKe: formValues.jenisPenerimaan,
      cabang: formValues.cabang,
      bulan: formValues.setoranBulan,
      debet: "",
      kredit: formValues.nominal,
      bulanSantunan: formValues.bulanSantunan,
      yangMeninggal: formValues.yangMeninggal,
      namaPenerima: formValues.namaPenerima,
      keterangan: formValues.keterangan,
      jenisPembayaran: "Sanduka",
    };
    try {
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
            Data berhasil dikirim!{" "}
          </h3>
        </div>,
        {
          icon: null,
          duration: 2000,
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
          duration: 2000,
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

  const fetchData = async () => {
    try {
      if (selectedBulan && newSelectedYear) {
        const data = await GlobalApi.getTablePemasukanSanduka(
          selectedBulan,
          newSelectedYear
        );
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, newSelectedYear]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const getVisiblePages = () => {
    const range = 2;
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();

    setFormValues((prevValues) => ({
      ...prevValues,
      yangMeninggal: e.target.value,
    }));

    const filtered = allNames.filter((name) =>
      name.namaLengkap.toLowerCase().includes(searchTerm)
    );

    setFilteredNames(filtered);
    setIsDropdownVisible(true);
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResetForm = () => {
    setFormValues({
      tanggalTransaksi: "",
      posPenerimaan: "",
      tahun: "",
      bulan: "",
      yangMeninggal: "",
      namaPenerima: "",
      nominal: "",
      terbilang: "",
      keterangan: "",
    });
  };

  const handleReset = () => {
    setFormValues({
      tanggalTransaksi: "",
      posPenerimaan: "",
      tahun: "",
      bulan: "",
      yangMeninggal: "",
      namaPenerima: "",
      nominal: "",
      terbilang: "",
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
      ? paginatedTransactions.map((transaction) => transaction.id)
      : [];

    setCheckedIds(updatedCheckedIds);

    setPaginatedTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => ({
        ...transaction,
        checked: newSelectAll,
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

          toast.success("Data berhasil dihapus!");
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error("Gagal menghapus data dengan ID:", checkedIds, error);
      toast.error("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === "-") return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSelectName = async (name) => {
    try {
      setFormValues((prevValues) => ({
        ...prevValues,
        yangMeninggal: name.namaLengkap,
      }));

      const userDataByName = await GlobalApi.searchUsersByName(
        name.namaLengkap
      );

      setIsDropdownVisible(false);
    } catch (error) {
      console.error("Error fetching user data by name:", error.message);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      const updatedValues = { ...prevValues };
    
      if (name === "nominal") {
        // Hanya ambil angka tanpa format pemisah
        const numericValue = Number(value.replace(/\D/g, "")); // Hapus semua karakter non-digit
    
        if (!isNaN(numericValue)) {
          updatedValues.nominal = numericValue; // Simpan angka mentah tanpa pemisah ribuan
          updatedValues.terbilang = convertToTerbilangWithRupiah(numericValue); // Konversi ke terbilang
        } else {
          updatedValues.nominal = ""; // Jika bukan angka, kosongkan nominal
          updatedValues.terbilang = "";
        }
      } else {
        updatedValues[name] = value; // Untuk input lain, gunakan nilai asli
      }
    
      return updatedValues;
    });        

    if (name === "tahun" || name === "bulan") {
      const year = name === "tahun" ? value : formValues.tahun;
      const month = name === "bulan" ? value : formValues.bulan;

      if (year && month) {
        try {
          const data = await GlobalApi.getNamaKwitansi(year, month);
          setAllNames(data);
          setFilteredNames(data);
          setIsDropdownVisible(true);
        } catch (error) {
          console.error("Error fetching deceased users:", error);
        }
      }
    }
  };
  const capitalizeFirstLetter = (text) => {
    if (typeof text !== "string" || !text) return ""; // Jika bukan string atau kosong, kembalikan string kosong
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const convertToTerbilang = (number) => {
    const satuan = [
      "",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
    ];
    const belasan = [
      "sepuluh",
      "sebelas",
      "dua belas",
      "tiga belas",
      "empat belas",
      "lima belas",
      "enam belas",
      "tujuh belas",
      "delapan belas",
      "sembilan belas",
    ];

    const ribuan = "ribu";
    const jutaan = "juta";
    const miliaran = "miliar";
    const rupiah = "rupiah";

    if (number < 10) return satuan[number];
    if (number < 20) return belasan[number - 10];
    if (number < 100)
      return `${satuan[Math.floor(number / 10)]} puluh ${
        satuan[number % 10]
      }`.trim();

    if (number < 1000)
      return `${satuan[Math.floor(number / 100)]} ratus ${convertToTerbilang(
        number % 100
      )}`.trim();

    if (number < 1000000)
      return `${convertToTerbilang(
        Math.floor(number / 1000)
      )} ${ribuan} ${convertToTerbilang(number % 1000)}`.trim();

    if (number < 1000000000)
      return `${convertToTerbilang(
        Math.floor(number / 1000000)
      )} ${jutaan} ${convertToTerbilang(number % 1000000)}`.trim();

    if (number < 1000000000000)
      return `${convertToTerbilang(
        Math.floor(number / 1000000000)
      )} ${miliaran} ${convertToTerbilang(number % 1000000000)}`.trim();

    return "Jumlah terlalu besar";
  };
  const convertToTerbilangWithRupiah = (number) => {
    if (isNaN(number) || number <= 0) return ""; // Validasi angka, kembalikan string kosong jika tidak valid
    const terbilang = convertToTerbilang(number);
    return `${capitalizeFirstLetter(terbilang)} Rupiah`.trim();
  };

  const handleKwitansiClick = async () => {
    const generateKwitansi = async () => {
      try {
        const selectedName = formValues.yangMeninggal;

        if (!selectedName) {
          console.error("Nama yang meninggal belum diisi.");
          return;
        }

        const userDataList = await GlobalApi.searchUsersByName(selectedName);

        if (!userDataList.data || !userDataList.data.users.length) {
          console.error("Tidak ditemukan pengguna dengan nama:", selectedName);
          return;
        }

        const userData = userDataList.data.users[0];

        const formatDate = (dateArray, separator = "-") => {
          if (!Array.isArray(dateArray) || dateArray.length !== 3) {
            return "Tanggal tidak valid";
          }
          const [year, month, day] = dateArray;
          return `${year}${separator}${String(month).padStart(
            2,
            "0"
          )}${separator}${String(day).padStart(2, "0")}`;
        };

        const calculateAge = (tanggalLahir) => {
          const today = new Date();
          const birthDate = new Date(
            tanggalLahir[0],
            tanggalLahir[1] - 1,
            tanggalLahir[2]
          );

          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
          }

          return age;
        };

        // const dataPelaporan = formatDate(userData.tanggalPelaporan);
        const tanggalMeninggal = formatDate(userData.waktuMeninggalTerlapor);
        const umur = calculateAge(userData.tanggalLahir);
        const mulaiJadiAnggotaPgri = formatDate(userData.mulaiJadiAnggotaPgri);

        const generateData = {
          noBukti: formValues.noBukti,
          dataPelaporan: formValues.tanggalTransaksi,
          // dataPelaporan,
          nama: userData.namaLengkap,
          tanggalMeninggal,
          umur,
          dataDukung: userData.unitKerja,
          alamat: userData.alamat,
          nomorHp: userData.nomorHp,
          sejakMenjadiAnggota: mulaiJadiAnggotaPgri,
          jabatan: userData.jabatan,
          terbilang: formValues.terbilang,
          // nominal: formValues.nominal,
          nominal: "2.500.000",
          menyerahkan: sessionStorage.getItem("nama"),
          penerima: formValues.namaPenerima,
        };

        const htmlContent = generateKwitansiHTML(generateData);

        // Buat URL Blob untuk iframe
        const blob = new Blob([htmlContent], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);

        // Set URL ke state
        setKwitansiData(blobUrl);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    await generateKwitansi();
  };

  const handleKwitansiDownload = async (type) => {
    try {
      const iframe = document.querySelector("iframe");
      if (!iframe) {
        console.error("Iframe tidak ditemukan");
        return;
      }

      // Ambil konten dari iframe
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const kwitansiElement = iframeDocument.body;

      if (type === "pdf") {
        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        // Ambil elemen HTML dan konversi ke PNG
        const imageData = await toPng(kwitansiElement);

        // Tambahkan gambar ke PDF
        pdf.addImage(imageData, "PNG", 0, 0, width, height);
        pdf.save("kwitansi.pdf");
      } else if (type === "image") {
        // Konversi elemen HTML ke gambar PNG
        const imageData = await toPng(kwitansiElement);

        // Buat link unduh untuk gambar
        const link = document.createElement("a");
        link.href = imageData;
        link.download = "kwitansi.png";
        link.click();
      }
    } catch (error) {
      console.error("Error saat mengunduh kwitansi:", error);
    }
  };
  const handleKwitansiDownloadPDF = async () => {
    const iframe = document.querySelector("iframe");
    if (!iframe) {
      console.error("Iframe tidak ditemukan");
      return;
    }

    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;
    const kwitansiElement = iframeDocument.body;

    try {
      const canvas = await html2canvas(kwitansiElement, {
        scale: 2, // Tingkatkan kualitas
        useCORS: true, // Izinkan pengambilan gambar eksternal
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4"); // Landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("kwitansi_landscape.pdf");
    } catch (error) {
      console.error("Error saat mengonversi ke PDF:", error);
    }
  };
  const handleKwitansiDownloadPNG = async () => {
    const iframe = document.querySelector("iframe");
    if (!iframe) {
      console.error("Iframe tidak ditemukan");
      return;
    }

    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;
    const kwitansiElement = iframeDocument.body;

    try {
      // Pastikan elemen memiliki ukuran penuh
      const canvas = await html2canvas(kwitansiElement, {
        scale: 2, // Tingkatkan skala untuk kualitas lebih tinggi
        useCORS: true, // Izinkan pengambilan gambar dengan resource eksternal
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");

      // Buat link untuk unduh
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "kwitansi.png";
      link.click();
    } catch (error) {
      console.error("Error saat mengunduh gambar:", error);
    }
  };

  const handleCloseIframe = () => {
    setIsIframeVisible(false);
    handleResetForm();
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

  const generateKwitansiHTML = (data) => {
    const template = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Kwitansi</title>
  <style>
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
        background-color: #fff;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
    }
    .left-header p, .right-header img {
        margin: 0;
    }
    .title {
        font-size: 20px;
        font-weight: bold;
        text-align: center;
    }
    .info, .footer {
        width: 100%;
        margin-top: 20px;
    }
    .info td{
        padding: 10px;
        vertical-align: top;
        border: 1px solid #ccc;
    }
    .nominal {
        font-weight: bold;
        background-color: #000;
        color: white;
        text-align: center;
    }
    .terbilang {
        font-weight: bold;
        color: black;
        text-align: center;
    }
    .signature {
        margin-top: 40px;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .signature div {
        text-align: center;
        width: 30%;
    }
    .footer {
        font-size: 12px;
        text-align: center;
    }

    .data-meninggal {
        display: flex;
        justify-content: space-between;
    }

    .data-item {
        width: 22%;
    }

    @media (max-width: 600px) {
      .data-meninggal {
        flex-direction: column;
      }
      .data-item {
        width: 100%;
      }
    }
  </style>
</head>
<body>
<div class="header">
  <div class="left-header">
    <p>Nomor Transaksi: ${data.noBukti}</p>
    <p>Tanggal Transaksi: ${data.dataPelaporan}</p>
  </div>
  <div class="title">TANDA TERIMA</div>
  <div class="right-header">
    <img src="https://sanduka-fe.vercel.app/_next/image?url=%2Fsanduka.png&amp;w=256&amp;q=75" alt="SANDUKA Logo" style="height: 50px;" />
  </div>
</div>

<div class="data-meninggal">
  <div class="data-item">
    <p>Data Meninggal</p>
    <p><strong>${data.nama}</strong></p>
            <p>${data.umur} Tahun</p>
            <p>${data.alamat}</p>
            <p>${data.nomorHp}</p>
  </div>
  <div class="data-item">
    <p>Data Dukung</p>
     <p><strong>${data.dataDukung}</strong></p>
            <p>${data.jabatan}</p>
            <p>Sejak Menjadi Anggota</p>
            <p>${data.sejakMenjadiAnggota}</p>
  </div>
  <div class="data-item">
    <p>Data Pelaporan</p>
    <p><strong>${data.dataPelaporan}</strong></p>
            <p><strong>Tanggal Meninggal:</strong> ${data.tanggalMeninggal}</p>
  </div>
</div>

<table class="info">
  <tr>
    <td class="nominal">Terbilang</td>
    <td class="nominal">Nominal</td>
  </tr>
  <tr>
    <td class="terbilang"><strong>${data.terbilang}</strong></td>
            <td class="terbilang"><strong>Rp ${data.nominal}</strong></td>
  </tr>
</table>

<div class="signature">
  <div>
    <p>Yang Menyerahkan</p>
    <p>${data.menyerahkan}</p>
  </div>
  <div>
    <p>Penerima</p>
    <p>${data.penerima}</p>
  </div>
</div>

<footer>
  <table class="footer">
    <tr>
      <td>Sekretariat PGRI: <br /> Jalan Bata Putih VI, Kelurahan Demaan, Kecamatan Jepara, Kabupaten Jepara, Jawa Tengah, Telp/Fax : 0291 592479, email : pgrijepara@gmail.com</td>
    </tr>
  </table>
</footer>
</body>
</html>

    `;
    return template;
  };

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
              <h1 className="text-base">Pengeluaran Sanduka</h1>
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
                PENGELUARAN SANDUKA
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
                    Pos Pengeluaran
                  </Label>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="posTransaksi"
                    name="posTransaksi"
                    value={formValues.posTransaksi}
                    onChange={handleChange}
                  >
                    <option value="">Pilih</option>
                    <option value="Pengeluaran Sanduka">
                      Pengeluaran Sanduka
                    </option>
                    <option value="Operasional 15%">Operasional 15%</option>
                    <option value="Lain - Lain">Lain - Lain</option>
                  </select>
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
                    id="tahun"
                    name="tahun"
                    value={formValues.tahun}
                    onChange={handleChange}
                  >
                    <option value="">Tahun Lapor</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-5"
                    id="bulan"
                    name="bulan"
                    value={formValues.bulan}
                    onChange={handleChange}
                  >
                    <option>Bulan Lapor</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.angkaBulan} value={bulan.id}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>

                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      className="mb-5 w-full shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="yangMeninggal"
                      name="yangMeninggal"
                      value={formValues.yangMeninggal}
                      onChange={(e) => {
                        handleSearch(e);
                      }}
                      onFocus={() => {
                        if (filteredNames.length > 0) {
                          setIsDropdownVisible(true);
                        }
                      }}
                      placeholder="Cari nama yang meninggal"
                    />

                    {/* Dropdown */}
                    {filteredNames.length > 0 && isDropdownVisible && (
                      <ul className="absolute z-10 shadow-lg bg-white border border-gray-300 rounded-md w-full max-h-48 overflow-y-auto -mt-3">
                        {filteredNames.map((name) => (
                          <li
                            key={name.id}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleSelectName(name)}
                          >
                            {name.namaLengkap}
                          </li>
                        ))}
                      </ul>
                    )}
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
                      id="namaPenerima"
                      type="text"
                      name="namaPenerima"
                      value={formValues.namaPenerima}
                      onChange={handleChange}
                    />
                    <Button className="mt-2" onClick={handleKwitansiClick}>
                      Kwitansi
                    </Button>
                    {isPopupVisible && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 w-3/4 max-w-lg">
                          <h2 className="text-xl font-bold mb-4">Kwitansi</h2>

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
                  </div>
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

                  <div className="flex flex-col mt-5">
                    <Label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="terbilang"
                    >
                      Terbilang
                    </Label>
                    <Textarea
                      className="shadow appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      id="terbilang"
                      name="terbilang"
                      value={formValues.terbilang}
                      readOnly
                    />
                  </div>
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
              <div>
                {isIframeVisible && kwitansiData && (
                  <div className="relative mb-4 text-right">
                    <iframe src={kwitansiData} className="w-full h-[600px]" />
                    <button
                      onClick={() => handleKwitansiDownloadPDF("pdf")}
                      className="ml-4 text-blue-500 underline"
                    >
                      Unduh Kwitansi (PDF)
                    </button>
                    <button
                      onClick={() => handleKwitansiDownloadPNG("image")}
                      className="ml-4 text-blue-500 underline"
                    >
                      Unduh Kwitansi (PNG)
                    </button>
                    <button
                      onClick={handleCloseIframe}
                      className="ml-4 bg-red-500 text-white rounded-md py-2 px-3"
                    >
                      Tutup
                    </button>
                  </div>
                )}
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
                  {currentTransactions.map((transaction, index) =>
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
            </div>
            <div className="flex justify-center mt-4 gap-1">
              {transactions.length > itemsPerPage && (
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

export default Pengeluaran;
