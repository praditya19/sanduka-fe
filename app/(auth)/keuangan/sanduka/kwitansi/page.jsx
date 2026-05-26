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
    yangMeninggalList: [],
    daftarYangMeninggal: [],
    namaPenerima: "",
    jenisPembayaran: "Sanduka",
    keterangan: "",
    terbilang: "",
    tahun: "",
    checked: false,
    bulan: "",
  });
  const [filteredNames, setFilteredNames] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [kwitansiData, setKwitansiData] = useState(null);
  const [, setTanggal] = useState("");
  const [, setBulan] = useState("");
  const [, setTahun] = useState("");
  const [allNames, setAllNames] = useState([]);
  const [isIframeVisible, setIsIframeVisible] = useState(true);
  const [kwitansiList, setKwitansiList] = useState([]);

  const getBulanAngka = (bulanNama) => {
    const bulanObj = bulanList.find((bulan) => bulan.namaBulan === bulanNama);
    return bulanObj ? bulanObj.angkaBulan : null;
  };

  useEffect(() => {
    const tanggalStr = formValues.tanggalTransaksi || "";

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

  useEffect(() => {
    const today = new Date();

    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = today.toLocaleDateString("id-ID", options);

    setFormValues((prevValues) => ({
      ...prevValues,
      tanggalTransaksi: formattedDate,
    }));
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

  const handleAddName = () => {
    const { yangMeninggal, daftarYangMeninggal } = formValues;
    if (!yangMeninggal) return;

    setFormValues((prev) => ({
      ...prev,
      daftarYangMeninggal: [...daftarYangMeninggal, yangMeninggal],
      yangMeninggal: "",
    }));
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      const updatedValues = { ...prevValues };

      if (name === "nominal") {
        const numericValue = Number(value.replace(/\D/g, ""));

        if (!isNaN(numericValue)) {
          updatedValues.nominal = numericValue;
          updatedValues.terbilang = convertToTerbilangWithRupiah(numericValue);
        } else {
          updatedValues.nominal = "";
          updatedValues.terbilang = "";
        }
      } else {
        updatedValues[name] = value;
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
    if (typeof text !== "string" || !text) return "";
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
    if (isNaN(number) || number <= 0) return "";
    const terbilang = convertToTerbilang(number);
    return `${capitalizeFirstLetter(terbilang)} Rupiah`.trim();
  };

  const handleKwitansiClick = async () => {
    try {
      const selectedNames = formValues.yangMeninggalList;

      if (!selectedNames || selectedNames.length < 1) {
        alert("Harap pilih setidaknya satu nama.");
        return;
      }

      const kwitansiDataList = [];

      for (const name of selectedNames) {
        const userDataList = await GlobalApi.searchUsersByName(name);

        if (
          userDataList.data &&
          userDataList.data.users &&
          userDataList.data.users.length > 0
        ) {
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
            if (!tanggalLahir || !Array.isArray(tanggalLahir)) return 0;
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

          const tanggalMeninggal = formatDate(userData.waktuMeninggalTerlapor);
          const umur = calculateAge(userData.tanggalLahir);
          const mulaiJadiAnggotaPgri = formatDate(
            userData.mulaiJadiAnggotaPgri
          );

          kwitansiDataList.push({
            noBukti: formValues.noBukti,
            dataPelaporan: formValues.tanggalTransaksi,
            nama: userData.namaLengkap || "Tidak diketahui",
            tanggalMeninggal: tanggalMeninggal || "Tidak diketahui",
            umur: umur || "Tidak diketahui",
            dataDukung: userData.unitKerja || "Tidak diketahui",
            alamat: userData.alamat || "Tidak diketahui",
            nomorHp: userData.nomorHp || "Tidak diketahui",
            sejakMenjadiAnggota: mulaiJadiAnggotaPgri || "Tidak diketahui",
            jabatan: userData.jabatan || "Tidak diketahui",
            terbilang: formValues.terbilang,
            nominal: "2.500.000",
            menyerahkan: sessionStorage.getItem("nama") || "Tidak diketahui",
            penerima: formValues.namaPenerima || "Tidak diketahui",
          });
        } else {
          console.warn(`Data untuk nama "${name}" tidak ditemukan.`);
        }
      }

      if (kwitansiDataList.length === 0) {
        alert("Tidak ada data kwitansi yang valid untuk digenerate.");
        return;
      }

      const htmlContent = generateKwitansiHTML(kwitansiDataList);

      const blob = new Blob([htmlContent], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);

      setKwitansiData(blobUrl);
      setKwitansiList(blobUrl);
    } catch (error) {
      console.error("Error:", error.message);
      alert("Terjadi kesalahan saat memproses kwitansi.");
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
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let pdfHeight = pdf.internal.pageSize.getHeight();

      const kwitansiCount = iframeDocument.querySelectorAll(".kwitansi").length;
      const heightAdjustment =
        kwitansiCount === 1 ? pdfHeight : pdfHeight * kwitansiCount;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, heightAdjustment);
      pdf.save("kwitansi_multiple.pdf");
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
      const canvas = await html2canvas(kwitansiElement, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");

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

  const generateKwitansiHTML = (generateDataList) => {
    const kwitansiHTML = generateDataList
      .map(
        (data) => `<!DOCTYPE html>
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
        margin-bottom: 10px;
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
        margin-top: 10px;
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
        margin-top: 80px;
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
.kwitansi {
    width: 210mm; /* Lebar A4 */
    height: 297mm; /* Tinggi A4 */
    margin: 0 auto; /* Pusatkan di halaman */
    padding: 20px; /* Tambahkan padding */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Tambahkan bayangan */
    background-color: #fff; /* Warna latar belakang putih */
     margin-bottom: 100px;
  }
    .data-item p {
  margin: 4px 0; /* Mengurangi jarak antar paragraf */
  line-height: 1.4; /* Menyesuaikan jarak antar teks */
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
  ................., ..................
    <p>Yang Menyerahkan,</p>
  
  </div>
  <div>
  ................., ..................
    <p>Penerima,</p>
  
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
</html> `
      )
      .join("");

    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${kwitansiHTML}
          </div>
        </body>
      </html>
    `;
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
          <div className="container mx-auto p-6 mt-2">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                Kwitansi
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <button
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      if (
                        formValues.yangMeninggal &&
                        !formValues.yangMeninggalList.includes(
                          formValues.yangMeninggal
                        )
                      ) {
                        setFormValues({
                          ...formValues,
                          yangMeninggalList: [
                            ...formValues.yangMeninggalList,
                            formValues.yangMeninggal,
                          ],
                          yangMeninggal: "",
                        });
                      }
                    }}
                  >
                    Tambah Nama
                  </button>
                  {/* Daftar Nama yang Dipilih */}
                  <ul className="mt-4">
                    {formValues.yangMeninggalList.map((name, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{name}</span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              yangMeninggalList:
                                formValues.yangMeninggalList.filter(
                                  (n) => n !== name
                                ),
                            });
                          }}
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pengeluaran;


// "use client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import React, { useState, useEffect, useRef } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useRouter } from "next/navigation";
// import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// import Sidebar from "@/app/_components/Sidebar";
// import GlobalApi from "@/app/_utils/GlobalApi";
// import toast, { Toaster } from "react-hot-toast";
// import { toPng } from "html-to-image";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// function Pengeluaran() {
//   const bulanList = [
//     { id: "01", angkaBulan: 0, namaBulan: "Januari" },
//     { id: "02", angkaBulan: 1, namaBulan: "Februari" },
//     { id: "03", angkaBulan: 2, namaBulan: "Maret" },
//     { id: "04", angkaBulan: 3, namaBulan: "April" },
//     { id: "05", angkaBulan: 4, namaBulan: "Mei" },
//     { id: "06", angkaBulan: 5, namaBulan: "Juni" },
//     { id: "07", angkaBulan: 6, namaBulan: "Juli" },
//     { id: "08", angkaBulan: 7, namaBulan: "Agustus" },
//     { id: "09", angkaBulan: 8, namaBulan: "September" },
//     { id: "10", angkaBulan: 9, namaBulan: "Oktober" },
//     { id: "11", angkaBulan: 10, namaBulan: "November" },
//     { id: "12", angkaBulan: 11, namaBulan: "Desember" },
//   ];
//   const startYear = 2020;
//   const currentYear = new Date().getFullYear();
//   const [formValues, setFormValues] = useState({
//     noBukti: "",
//     tanggalTransaksi: "",
//     posTransaksi: "",
//     posPenerimaan: "",
//     jenisPenerimaan: "",
//     cabang: "",
//     setoranBulan: "",
//     nominal: "",
//     bulanSantunan: "",
//     yangMeninggal: "",
//     yangMeninggalList: [],
//     daftarYangMeninggal: [],
//     namaPenerima: "",
//     jenisPembayaran: "Sanduka",
//     keterangan: "",
//     terbilang: "",
//     tahun: "",
//     checked: false,
//     bulan: "",
//   });
//   const [filteredNames, setFilteredNames] = useState([]);
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
//   const dropdownRef = useRef(null);
//   const [isPopupVisible, setPopupVisible] = useState(false);
//   const [kwitansiData, setKwitansiData] = useState(null);
//   const [, setTanggal] = useState("");
//   const [, setBulan] = useState("");
//   const [, setTahun] = useState("");
//   const [allNames, setAllNames] = useState([]);
//   const [isIframeVisible, setIsIframeVisible] = useState(true);
//   const [kwitansiList, setKwitansiList] = useState([]);

//   const getBulanAngka = (bulanNama) => {
//     const bulanObj = bulanList.find((bulan) => bulan.namaBulan === bulanNama);
//     return bulanObj ? bulanObj.angkaBulan : null;
//   };

//   useEffect(() => {
//     const tanggalStr = formValues.tanggalTransaksi || "";

//     if (tanggalStr) {
//       const [tanggalPart, bulanPart, tahunPart] = tanggalStr.split("");

//       const bulanAngka = getBulanAngka(bulanPart);

//       setTanggal(parseInt(tanggalPart, 10));
//       setBulan(bulanAngka);
//       setTahun(parseInt(tahunPart, 10));
//     } else {
//       setTanggal(null);
//       setBulan(null);
//       setTahun(null);
//     }
//   }, [formValues.tanggalTransaksi]);

//   useEffect(() => {
//     const today = new Date();

//     const options = { day: "numeric", month: "long", year: "numeric" };
//     const formattedDate = today.toLocaleDateString("id-ID", options);

//     setFormValues((prevValues) => ({
//       ...prevValues,
//       tanggalTransaksi: formattedDate,
//     }));
//   }, []);

//   const years = Array.from(
//     { length: currentYear - startYear + 1 },
//     (_, index) => startYear + index
//   );

//   const handleSearch = (e) => {
//     const searchTerm = e.target.value.toLowerCase();

//     setFormValues((prevValues) => ({
//       ...prevValues,
//       yangMeninggal: e.target.value,
//     }));

//     const filtered = allNames.filter((name) =>
//       name.namaLengkap.toLowerCase().includes(searchTerm)
//     );

//     setFilteredNames(filtered);
//     setIsDropdownVisible(true);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownVisible(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleSelectName = async (name) => {
//     try {
//       setFormValues((prevValues) => ({
//         ...prevValues,
//         yangMeninggal: name.namaLengkap,
//       }));

//       const userDataByName = await GlobalApi.searchUsersByName(
//         name.namaLengkap
//       );

//       setIsDropdownVisible(false);
//     } catch (error) {
//       console.error("Error fetching user data by name:", error.message);
//     }
//   };

//   const handleAddName = () => {
//     const { yangMeninggal, daftarYangMeninggal } = formValues;
//     if (!yangMeninggal) return;

//     setFormValues((prev) => ({
//       ...prev,
//       daftarYangMeninggal: [...daftarYangMeninggal, yangMeninggal],
//       yangMeninggal: "", // Kosongkan input
//     }));
//   };

//   const handleChange = async (e) => {
//     const { name, value } = e.target;

//     setFormValues((prevValues) => {
//       const updatedValues = { ...prevValues };

//       if (name === "nominal") {
//         const numericValue = Number(value.replace(/\D/g, ""));

//         if (!isNaN(numericValue)) {
//           updatedValues.nominal = numericValue;
//           updatedValues.terbilang = convertToTerbilangWithRupiah(numericValue);
//         } else {
//           updatedValues.nominal = "";
//           updatedValues.terbilang = "";
//         }
//       } else {
//         updatedValues[name] = value;
//       }

//       return updatedValues;
//     });

//     if (name === "tahun" || name === "bulan") {
//       const year = name === "tahun" ? value : formValues.tahun;
//       const month = name === "bulan" ? value : formValues.bulan;

//       if (year && month) {
//         try {
//           const data = await GlobalApi.getNamaKwitansi(year, month);
//           setAllNames(data);
//           setFilteredNames(data);
//           setIsDropdownVisible(true);
//         } catch (error) {
//           console.error("Error fetching deceased users:", error);
//         }
//       }
//     }
//   };
//   const capitalizeFirstLetter = (text) => {
//     if (typeof text !== "string" || !text) return "";
//     return text
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };
//   const convertToTerbilang = (number) => {
//     const satuan = [
//       "",
//       "satu",
//       "dua",
//       "tiga",
//       "empat",
//       "lima",
//       "enam",
//       "tujuh",
//       "delapan",
//       "sembilan",
//     ];
//     const belasan = [
//       "sepuluh",
//       "sebelas",
//       "dua belas",
//       "tiga belas",
//       "empat belas",
//       "lima belas",
//       "enam belas",
//       "tujuh belas",
//       "delapan belas",
//       "sembilan belas",
//     ];

//     const ribuan = "ribu";
//     const jutaan = "juta";
//     const miliaran = "miliar";
//     const rupiah = "rupiah";

//     if (number < 10) return satuan[number];
//     if (number < 20) return belasan[number - 10];
//     if (number < 100)
//       return `${satuan[Math.floor(number / 10)]} puluh ${
//         satuan[number % 10]
//       }`.trim();

//     if (number < 1000)
//       return `${satuan[Math.floor(number / 100)]} ratus ${convertToTerbilang(
//         number % 100
//       )}`.trim();

//     if (number < 1000000)
//       return `${convertToTerbilang(
//         Math.floor(number / 1000)
//       )} ${ribuan} ${convertToTerbilang(number % 1000)}`.trim();

//     if (number < 1000000000)
//       return `${convertToTerbilang(
//         Math.floor(number / 1000000)
//       )} ${jutaan} ${convertToTerbilang(number % 1000000)}`.trim();

//     if (number < 1000000000000)
//       return `${convertToTerbilang(
//         Math.floor(number / 1000000000)
//       )} ${miliaran} ${convertToTerbilang(number % 1000000000)}`.trim();

//     return "Jumlah terlalu besar";
//   };
//   const convertToTerbilangWithRupiah = (number) => {
//     if (isNaN(number) || number <= 0) return "";
//     const terbilang = convertToTerbilang(number);
//     return `${capitalizeFirstLetter(terbilang)} Rupiah`.trim();
//   };

//   const handleKwitansiClick = async () => {
//     try {
//       const selectedNames = formValues.yangMeninggalList;

//       // Validasi minimal satu nama harus dipilih
//       if (!selectedNames || selectedNames.length < 1) {
//         alert("Harap pilih setidaknya satu nama.");
//         return;
//       }

//       const kwitansiDataList = [];

//       for (const name of selectedNames) {
//         // Panggil API untuk mencari pengguna berdasarkan nama
//         const userDataList = await GlobalApi.searchUsersByName(name);

//         // Validasi jika API mengembalikan data
//         if (
//           userDataList.data &&
//           userDataList.data.users &&
//           userDataList.data.users.length > 0
//         ) {
//           const userData = userDataList.data.users[0];

//           // Helper untuk format tanggal
//           const formatDate = (dateArray, separator = "-") => {
//             if (!Array.isArray(dateArray) || dateArray.length !== 3) {
//               return "Tanggal tidak valid";
//             }
//             const [year, month, day] = dateArray;
//             return `${year}${separator}${String(month).padStart(
//               2,
//               "0"
//             )}${separator}${String(day).padStart(2, "0")}`;
//           };

//           // Helper untuk menghitung umur
//           const calculateAge = (tanggalLahir) => {
//             if (!tanggalLahir || !Array.isArray(tanggalLahir)) return 0; // Tambahan validasi
//             const today = new Date();
//             const birthDate = new Date(
//               tanggalLahir[0],
//               tanggalLahir[1] - 1,
//               tanggalLahir[2]
//             );

//             let age = today.getFullYear() - birthDate.getFullYear();
//             const monthDiff = today.getMonth() - birthDate.getMonth();
//             const dayDiff = today.getDate() - birthDate.getDate();

//             if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
//               age--;
//             }

//             return age;
//           };

//           // Format tanggal meninggal dan mulai menjadi anggota
//           const tanggalMeninggal = formatDate(userData.waktuMeninggalTerlapor);
//           const umur = calculateAge(userData.tanggalLahir);
//           const mulaiJadiAnggotaPgri = formatDate(
//             userData.mulaiJadiAnggotaPgri
//           );

//           // Tambahkan data kwitansi ke daftar
//           kwitansiDataList.push({
//             noBukti: formValues.noBukti,
//             dataPelaporan: formValues.tanggalTransaksi,
//             nama: userData.namaLengkap || "Tidak diketahui",
//             tanggalMeninggal: tanggalMeninggal || "Tidak diketahui",
//             umur: umur || "Tidak diketahui",
//             dataDukung: userData.unitKerja || "Tidak diketahui",
//             alamat: userData.alamat || "Tidak diketahui",
//             nomorHp: userData.nomorHp || "Tidak diketahui",
//             sejakMenjadiAnggota: mulaiJadiAnggotaPgri || "Tidak diketahui",
//             jabatan: userData.jabatan || "Tidak diketahui",
//             terbilang: formValues.terbilang,
//             nominal: "2.500.000",
//             menyerahkan: sessionStorage.getItem("nama") || "Tidak diketahui",
//             penerima: formValues.namaPenerima || "Tidak diketahui",
//           });
//         } else {
//           console.warn(`Data untuk nama "${name}" tidak ditemukan.`);
//         }
//       }

//       // Jika tidak ada data valid, tampilkan pesan
//       if (kwitansiDataList.length === 0) {
//         alert("Tidak ada data kwitansi yang valid untuk digenerate.");
//         return;
//       }

//       // Generate HTML kwitansi
//       const htmlContent = generateKwitansiHTML(kwitansiDataList);

//       // Buat blob untuk kwitansi
//       const blob = new Blob([htmlContent], { type: "text/html" });
//       const blobUrl = URL.createObjectURL(blob);

//       setKwitansiData(blobUrl);
//       setKwitansiList(blobUrl);
//     } catch (error) {
//       console.error("Error:", error.message);
//       alert("Terjadi kesalahan saat memproses kwitansi.");
//     }
//   };

//   const handleKwitansiDownloadPDF = async () => {
//     const iframe = document.querySelector("iframe");
//     if (!iframe) {
//       console.error("Iframe tidak ditemukan");
//       return;
//     }

//     const iframeDocument =
//       iframe.contentDocument || iframe.contentWindow.document;
//     const kwitansiElement = iframeDocument.body;

//     try {
//       const canvas = await html2canvas(kwitansiElement, {
//         scale: 2,
//         useCORS: true,
//       });

//       const imgData = canvas.toDataURL("image/png");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       let pdfHeight = pdf.internal.pageSize.getHeight();

//       const kwitansiCount = iframeDocument.querySelectorAll(".kwitansi").length;
//       const heightAdjustment =
//         kwitansiCount === 1 ? pdfHeight : pdfHeight * kwitansiCount;

//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, heightAdjustment);
//       pdf.save("kwitansi_multiple.pdf");
//     } catch (error) {
//       console.error("Error saat mengonversi ke PDF:", error);
//     }
//   };

//   const handleKwitansiDownloadPNG = async () => {
//     const iframe = document.querySelector("iframe");
//     if (!iframe) {
//       console.error("Iframe tidak ditemukan");
//       return;
//     }

//     const iframeDocument =
//       iframe.contentDocument || iframe.contentWindow.document;
//     const kwitansiElement = iframeDocument.body;

//     try {
//       const canvas = await html2canvas(kwitansiElement, {
//         scale: 2,
//         useCORS: true,
//         scrollX: 0,
//         scrollY: 0,
//       });

//       const imgData = canvas.toDataURL("image/png");

//       const link = document.createElement("a");
//       link.href = imgData;
//       link.download = "kwitansi.png";
//       link.click();
//     } catch (error) {
//       console.error("Error saat mengunduh gambar:", error);
//     }
//   };

//   const handleCloseIframe = () => {
//     setIsIframeVisible(false);
//     window.location.reload();
//   };

//   useEffect(() => {
//     const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
//     setIsSidebarOpen(sidebarState);
//   }, []);

//   const [isMobile, setIsMobile] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const router = useRouter();

//   const handleBackClick = () => {
//     router.back();
//   };

//   const toggleSidebar = () => {
//     const newSidebarState = !isSidebarOpen;
//     setIsSidebarOpen(newSidebarState);
//     localStorage.setItem("isSidebarOpen", newSidebarState);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const generateKwitansiHTML = (generateDataList) => {
//     const kwitansiHTML = generateDataList
//       .map(
//         (data) => `<!DOCTYPE html>
// <html lang="id">
// <head>
//   <meta charset="UTF-8" />
//   <title>Kwitansi</title>
//   <style>
//     body {
//         font-family: Arial, sans-serif;
//         margin: 20px;
//         background-color: #fff;
//     }
//     .header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 10px;
//         border-bottom: 2px solid #000;
//         padding-bottom: 10px;
//     }
//     .left-header p, .right-header img {
//         margin: 0;
//     }
//     .title {
//         font-size: 20px;
//         font-weight: bold;
//         text-align: center;
//     }
//     .info, .footer {
//         width: 100%;
//         margin-top: 10px;
//     }
//     .info td{
//         padding: 10px;
//         vertical-align: top;
//         border: 1px solid #ccc;
//     }
//     .nominal {
//         font-weight: bold;
//         background-color: #000;
//         color: white;
//         text-align: center;
//     }
//     .terbilang {
//         font-weight: bold;
//         color: black;
//         text-align: center;
//     }
//     .signature {
//         margin-top: 80px;
//         width: 100%;
//         display: flex;
//         justify-content: space-between;
//     }
//     .signature div {
//         text-align: center;
//         width: 30%;
//     }
//     .footer {
//         font-size: 12px;
//         text-align: center;
//     }

//     .data-meninggal {
//         display: flex;
//         justify-content: space-between;
//     }

//     .data-item {
//         width: 22%;
//     }
// .kwitansi {
//     width: 210mm; /* Lebar A4 */
//     height: 297mm; /* Tinggi A4 */
//     margin: 0 auto; /* Pusatkan di halaman */
//     padding: 20px; /* Tambahkan padding */
//     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Tambahkan bayangan */
//     background-color: #fff; /* Warna latar belakang putih */
//      margin-bottom: 100px;
//   }
//     .data-item p {
//   margin: 4px 0; /* Mengurangi jarak antar paragraf */
//   line-height: 1.4; /* Menyesuaikan jarak antar teks */
// }
  
//     @media (max-width: 600px) {
//       .data-meninggal {
//         flex-direction: column;
//       }
//       .data-item {
//         width: 100%;
//       }
//     }
//   </style>
// </head>
// <body>
// <div class="header">
//   <div class="left-header">
//     <p>Nomor Transaksi: ${data.noBukti}</p>
//     <p>Tanggal Transaksi: ${data.dataPelaporan}</p>
//   </div>
//   <div class="title">TANDA TERIMA</div>
//   <div class="right-header">
//     <img src="https://sanduka-fe.vercel.app/_next/image?url=%2Fsanduka.png&amp;w=256&amp;q=75" alt="SANDUKA Logo" style="height: 50px;" />
//   </div>
// </div>

// <div class="data-meninggal">
//   <div class="data-item">
//     <p>Data Meninggal</p>
//     <p><strong>${data.nama}</strong></p>
//             <p>${data.umur} Tahun</p>
//             <p>${data.alamat}</p>
//             <p>${data.nomorHp}</p>
//   </div>
//   <div class="data-item">
//     <p>Data Dukung</p>
//      <p><strong>${data.dataDukung}</strong></p>
//             <p>${data.jabatan}</p>
//             <p>Sejak Menjadi Anggota</p>
//             <p>${data.sejakMenjadiAnggota}</p>
//   </div>
//   <div class="data-item">
//     <p>Data Pelaporan</p>
//     <p><strong>${data.dataPelaporan}</strong></p>
//             <p><strong>Tanggal Meninggal:</strong> ${data.tanggalMeninggal}</p>
//   </div>
// </div>

// <table class="info">
//   <tr>
//     <td class="nominal">Terbilang</td>
//     <td class="nominal">Nominal</td>
//   </tr>
//   <tr>
//     <td class="terbilang"><strong>${data.terbilang}</strong></td>
//             <td class="terbilang"><strong>Rp ${data.nominal}</strong></td>
//   </tr>
// </table>

// <div class="signature">
// <div>
//   ................., ..................
//     <p>Yang Menyerahkan,</p>
  
//   </div>
//   <div>
//   ................., ..................
//     <p>Penerima,</p>
  
//   </div>
// </div>

// <footer>
//   <table class="footer">
//     <tr>
//       <td>Sekretariat PGRI: <br /> Jalan Bata Putih VI, Kelurahan Demaan, Kecamatan Jepara, Kabupaten Jepara, Jawa Tengah, Telp/Fax : 0291 592479, email : pgrijepara@gmail.com</td>
//     </tr>
//   </table>
// </footer>
// </body>
// </html> `
//       )
//       .join("");

//     return `
//       <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 0;
//               padding: 0;
//             }
//             .container {
//               display: flex;
//               flex-direction: column;
//               justify-content: space-between;
//               height: 100%;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             ${kwitansiHTML}
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   //   const generateKwitansiHTML = (data) => {
//   //     const template = `<!DOCTYPE html>
//   // <html lang="id">
//   // <head>
//   //   <meta charset="UTF-8" />
//   //   <title>Kwitansi</title>
//   //   <style>
//   //     body {
//   //         font-family: Arial, sans-serif;
//   //         margin: 20px;
//   //         background-color: #fff;
//   //     }
//   //     .header {
//   //         display: flex;
//   //         justify-content: space-between;
//   //         align-items: center;
//   //         margin-bottom: 20px;
//   //         border-bottom: 2px solid #000;
//   //         padding-bottom: 10px;
//   //     }
//   //     .left-header p, .right-header img {
//   //         margin: 0;
//   //     }
//   //     .title {
//   //         font-size: 20px;
//   //         font-weight: bold;
//   //         text-align: center;
//   //     }
//   //     .info, .footer {
//   //         width: 100%;
//   //         margin-top: 20px;
//   //     }
//   //     .info td{
//   //         padding: 10px;
//   //         vertical-align: top;
//   //         border: 1px solid #ccc;
//   //     }
//   //     .nominal {
//   //         font-weight: bold;
//   //         background-color: #000;
//   //         color: white;
//   //         text-align: center;
//   //     }
//   //     .terbilang {
//   //         font-weight: bold;
//   //         color: black;
//   //         text-align: center;
//   //     }
//   //     .signature {
//   //         margin-top: 40px;
//   //         width: 100%;
//   //         display: flex;
//   //         justify-content: space-between;
//   //     }
//   //     .signature div {
//   //         text-align: center;
//   //         width: 30%;
//   //     }
//   //     .footer {
//   //         font-size: 12px;
//   //         text-align: center;
//   //     }

//   //     .data-meninggal {
//   //         display: flex;
//   //         justify-content: space-between;
//   //     }

//   //     .data-item {
//   //         width: 22%;
//   //     }
//   // .kwitansi {
//   //     width: 210mm; /* Lebar A4 */
//   //     height: 297mm; /* Tinggi A4 */
//   //     margin: 0 auto; /* Pusatkan di halaman */
//   //     padding: 20px; /* Tambahkan padding */
//   //     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Tambahkan bayangan */
//   //     background-color: #fff; /* Warna latar belakang putih */
//   //   }
//   //     .data-item p {
//   //   margin: 4px 0; /* Mengurangi jarak antar paragraf */
//   //   line-height: 1.4; /* Menyesuaikan jarak antar teks */
//   // }

//   //     @media (max-width: 600px) {
//   //       .data-meninggal {
//   //         flex-direction: column;
//   //       }
//   //       .data-item {
//   //         width: 100%;
//   //       }
//   //     }
//   //   </style>
//   // </head>
//   // <body>
//   // <div class="header">
//   //   <div class="left-header">
//   //     <p>Nomor Transaksi: ${data.noBukti}</p>
//   //     <p>Tanggal Transaksi: ${data.dataPelaporan}</p>
//   //   </div>
//   //   <div class="title">TANDA TERIMA</div>
//   //   <div class="right-header">
//   //     <img src="https://sanduka-fe.vercel.app/_next/image?url=%2Fsanduka.png&amp;w=256&amp;q=75" alt="SANDUKA Logo" style="height: 50px;" />
//   //   </div>
//   // </div>

//   // <div class="data-meninggal">
//   //   <div class="data-item">
//   //     <p>Data Meninggal</p>
//   //     <p><strong>${data.nama}</strong></p>
//   //             <p>${data.umur} Tahun</p>
//   //             <p>${data.alamat}</p>
//   //             <p>${data.nomorHp}</p>
//   //   </div>
//   //   <div class="data-item">
//   //     <p>Data Dukung</p>
//   //      <p><strong>${data.dataDukung}</strong></p>
//   //             <p>${data.jabatan}</p>
//   //             <p>Sejak Menjadi Anggota</p>
//   //             <p>${data.sejakMenjadiAnggota}</p>
//   //   </div>
//   //   <div class="data-item">
//   //     <p>Data Pelaporan</p>
//   //     <p><strong>${data.dataPelaporan}</strong></p>
//   //             <p><strong>Tanggal Meninggal:</strong> ${data.tanggalMeninggal}</p>
//   //   </div>
//   // </div>

//   // <table class="info">
//   //   <tr>
//   //     <td class="nominal">Terbilang</td>
//   //     <td class="nominal">Nominal</td>
//   //   </tr>
//   //   <tr>
//   //     <td class="terbilang"><strong>${data.terbilang}</strong></td>
//   //             <td class="terbilang"><strong>Rp ${data.nominal}</strong></td>
//   //   </tr>
//   // </table>

//   // <div class="signature">
//   //   <div>
//   //     <p>Yang Menyerahkan,</p>

//   //   </div>
//   //   <div>
//   //   ................., ..................
//   //     <p>Penerima,</p>

//   //   </div>
//   // </div>

//   // <footer>
//   //   <table class="footer">
//   //     <tr>
//   //       <td>Sekretariat PGRI: <br /> Jalan Bata Putih VI, Kelurahan Demaan, Kecamatan Jepara, Kabupaten Jepara, Jawa Tengah, Telp/Fax : 0291 592479, email : pgrijepara@gmail.com</td>
//   //     </tr>
//   //   </table>
//   // </footer>
//   // </body>
//   // </html>`;
//   //     return template;
//   //   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-2 md:p-6">
//       {isMobile ? (
//         <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
//           <div className="container mx-auto flex items-center justify-between">
//             <div className="flex items-center">
//               <FontAwesomeIcon
//                 icon={faArrowLeft}
//                 size="sm"
//                 onClick={handleBackClick}
//                 className="cursor-pointer mr-4"
//               />
//               <h1 className="text-base">Kwitansi</h1>
//             </div>
//           </div>
//         </header>
//       ) : (
//         <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
//           <div className="container mx-auto flex items-center justify-between">
//             <div className="flex items-center">
//               <FontAwesomeIcon
//                 icon={faArrowLeft}
//                 size="sm"
//                 onClick={handleBackClick}
//                 className="cursor-pointer mr-4"
//               />
//               <h1 className="text-base">Kwitansi</h1>
//             </div>
//           </div>
//         </header>
//       )}
//       <div>
//         <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//         <div
//           className={`flex-1 transition-all duration-300 ease-in-out ${
//             isSidebarOpen ? "ml-64" : "ml-0"
//           }`}
//         >
//           <Toaster
//             toastOptions={{
//               style: {
//                 fontSize: "1.25rem",
//                 padding: "16px",
//               },
//               success: {
//                 style: {
//                   background: "white",
//                   color: "black",
//                 },
//               },
//               error: {
//                 style: {
//                   background: "#f44336",
//                   color: "#fff",
//                 },
//               },
//             }}
//           />
//           <div className="container mx-auto p-6 mt-2">
//             <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
//               <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
//                 Kwitansi
//               </h1>
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 {/* Bagian Tanggal Transaksi */}
//                 <div className="flex flex-col space-y-4">
//                   <Label
//                     className="text-gray-700 font-medium mb-2"
//                     htmlFor="tanggalTransaksi"
//                   >
//                     Tanggal Transaksi
//                   </Label>
//                   <Input
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="tanggalTransaksi"
//                     type="date"
//                     name="tanggalTransaksi"
//                     value={formValues.tanggalTransaksi || ""}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="flex flex-col space-y-4">
//                   {/* Nominal */}
//                   <Label
//                     className="text-gray-700 font-medium mb-2"
//                     htmlFor="nominal"
//                   >
//                     Nominal
//                   </Label>
//                   <Input
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="nominal"
//                     type="number"
//                     name="nominal"
//                     value={formValues.nominal || ""}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 {/* Bagian Data Sanduka */}
//                 <div className="flex flex-col space-y-4">
//                   <Label
//                     className="text-gray-700 font-medium mb-2"
//                     htmlFor="cabang"
//                   >
//                     Data Meninggal
//                   </Label>

//                   {/* Tahun Lapor */}
//                   <select
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="tahun"
//                     name="tahun"
//                     value={formValues.tahun}
//                     onChange={handleChange}
//                   >
//                     <option value="">Tahun Lapor</option>
//                     {years.map((year) => (
//                       <option key={year} value={year}>
//                         {year}
//                       </option>
//                     ))}
//                   </select>

//                   {/* Bulan Lapor */}
//                   <select
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="bulan"
//                     name="bulan"
//                     value={formValues.bulan}
//                     onChange={handleChange}
//                   >
//                     <option>Bulan Lapor</option>
//                     {bulanList.map((bulan) => (
//                       <option key={bulan.angkaBulan} value={bulan.id}>
//                         {bulan.namaBulan}
//                       </option>
//                     ))}
//                   </select>

//                   {/* Input Pencarian Nama */}
//                   <div className="relative">
//                     <input
//                       type="text"
//                       className="w-full shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       id="yangMeninggal"
//                       name="yangMeninggal"
//                       value={formValues.yangMeninggal}
//                       onChange={(e) => handleSearch(e)}
//                       onFocus={() => {
//                         if (filteredNames.length > 0) {
//                           setIsDropdownVisible(true);
//                         }
//                       }}
//                       placeholder="Cari nama yang meninggal"
//                     />

//                     {/* Dropdown Pencarian */}
//                     {filteredNames.length > 0 && isDropdownVisible && (
//                       <ul className="absolute z-10 shadow-lg bg-white border border-gray-300 rounded-md w-full max-h-48 overflow-y-auto -mt-3">
//                         {filteredNames.map((name) => (
//                           <li
//                             key={name.id}
//                             className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
//                             onClick={() => handleSelectName(name)}
//                           >
//                             {name.namaLengkap}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>

//                   {/* Tombol Tambah Nama */}
//                   <button
//                     className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gradient-to-l"
//                     onClick={() => {
//                       if (
//                         formValues.yangMeninggal &&
//                         !formValues.yangMeninggalList.includes(
//                           formValues.yangMeninggal
//                         )
//                       ) {
//                         setFormValues({
//                           ...formValues,
//                           yangMeninggalList: [
//                             ...formValues.yangMeninggalList,
//                             formValues.yangMeninggal,
//                           ],
//                           yangMeninggal: "",
//                         });
//                       }
//                     }}
//                   >
//                     Tambah Nama
//                   </button>

//                   {/* Daftar Nama yang Dipilih */}
//                   <ul className="mt-4 space-y-2">
//                     {formValues.yangMeninggalList.map((name, index) => (
//                       <li
//                         key={index}
//                         className="flex items-center justify-between"
//                       >
//                         <span className="text-gray-700">{name}</span>
//                         <button
//                           className="text-red-500 hover:text-red-700"
//                           onClick={() => {
//                             setFormValues({
//                               ...formValues,
//                               yangMeninggalList:
//                                 formValues.yangMeninggalList.filter(
//                                   (n) => n !== name
//                                 ),
//                             });
//                           }}
//                         >
//                           Hapus
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 {/* Bagian Penerima dan Nominal */}
//                 <div className="flex flex-col space-y-4">
//                   {/* Terbilang */}
//                   <Label
//                     className="text-gray-700 font-medium mb-2"
//                     htmlFor="terbilang"
//                   >
//                     Terbilang
//                   </Label>
//                   <textarea
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="terbilang"
//                     name="terbilang"
//                     value={formValues.terbilang}
//                     onChange={handleChange}
//                     style={{ height: "5.6em" }}
//                   />
//                   {/* Nama Penerima */}
//                   <Label
//                     className="text-gray-700 font-medium mb-2"
//                     htmlFor="jenisPenerimaan"
//                   >
//                     Nama Penerima
//                   </Label>
//                   <Input
//                     className="shadow-md border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     id="namaPenerima"
//                     type="text"
//                     name="namaPenerima"
//                     value={formValues.namaPenerima}
//                     onChange={handleChange}
//                   />
//                   <Button
//                     className="mt-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gradient-to-l"
//                     onClick={handleKwitansiClick}
//                   >
//                     Kwitansi
//                   </Button>
//                 </div>
//               </div>
//               <div>
//                 {isIframeVisible && kwitansiData && (
//                   <div className="relative mb-4 text-right">
//                     <iframe src={kwitansiData} className="w-full h-[600px]" />
//                     <button
//                       onClick={() => handleKwitansiDownloadPDF("pdf")}
//                       className="ml-4 text-blue-500 underline"
//                     >
//                       Unduh Kwitansi (PDF)
//                     </button>
//                     <button
//                       onClick={handleCloseIframe}
//                       className="ml-4 bg-red-500 text-white rounded-md py-2 px-3"
//                     >
//                       Tutup
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Pengeluaran;
