"use client";
import React, { useState, useEffect } from "react";
import HeaderMobile from "@/app/_components/HeaderMobile";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

const DetailAnggota = () => {
  const [anggotaData, setAnggotaData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fotoBase64, setFotoBase64] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  const getUserById = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");
    const userId = sessionStorage.getItem("userId");
    const id = anggotaId || userId;

    try {
      const response = await GlobalApi.getUserById(id);
      const fetchedData = response;

      const fotoBase64Array = [];

      if (fetchedData) {
        if (fetchedData.foto) {
          try {
            const decodedString = atob(fetchedData.foto);
            fotoBase64Array.push(decodedString);
          } catch (error) {
            console.error("Error decoding Base64:", error);
            fotoBase64Array.push(null);
          }
        } else {
          fotoBase64Array.push(null);
        }
      } else {
        console.warn("No data found.");
      }
      setAnggotaData(fetchedData);
      setFotoBase64(fotoBase64Array);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generatePDF = async (anggotaData, fotoBase64) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    const leftColWidth = 60;
    const rightColX = margin + leftColWidth + 10;
    const rightColWidth = pageWidth - rightColX - margin;

    if (fotoBase64) {
      try {
        doc.addImage(
          `data:image/png;base64,${fotoBase64}`,
          "PNG",
          margin,
          yPosition,
          60,
          55
        );
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }
    }

    let contactY = yPosition + 60;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Nomor HP: ${anggotaData.nomorHp || "-"}`, margin, contactY);
    contactY += 8;

    doc.text(`Email: ${anggotaData.email || "-"}`, margin, contactY);
    contactY += 8;

    const alamat = anggotaData.alamat || "-";
    const alamatLines = doc.splitTextToSize(`Alamat: ${alamat}`, leftColWidth);
    doc.text(alamatLines, margin, contactY);
    contactY += alamatLines.length * 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 123, 255);
    doc.text("Data Anggota", rightColX, yPosition + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(anggotaData.namaLengkap, rightColX, yPosition + 20);

    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69);
    doc.text(anggotaData.jabatan || "-", rightColX, yPosition + 30);

    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = currentDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const fullFormattedDate = `${formattedDate} ${formattedTime}`;

    const updatedAtArray = anggotaData.updatedAt || [];
    let formattedUpdatedAt = "-";

    if (updatedAtArray.length === 6) {
      const [year, month, day, hour, minute, second] = updatedAtArray;
      const updatedDate = new Date(year, month - 1, day, hour, minute, second); // Bulan dikurangi 1
      formattedUpdatedAt =
        updatedDate.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) + ` ${updatedDate.toLocaleTimeString("id-ID")}`;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(220, 53, 69);
    doc.text(`Tanggal Cetak: ${fullFormattedDate}`, rightColX, yPosition + 40);

    doc.text(
      `Tanggal Update: ${formattedUpdatedAt}`,
      rightColX,
      yPosition + 45
    );

    const addSection = (title, y) => {
      doc.setFillColor(108, 108, 108);
      doc.rect(rightColX, y, rightColWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, rightColX + 5, y + 7);
      doc.setTextColor(0, 0, 0);
      return y + 20;
    };

    // Data Tugas
    let rightY = yPosition + 55;
    rightY = addSection("DATA TUGAS", rightY);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const tugas = [
      [`Cabang: ${anggotaData.cabang || "-"}`],
      [`Unit Kerja: ${anggotaData.unitKerja || "-"}`],
      [`Tingkat Sekolah: ${anggotaData.tingkatSekolah || "-"}`],
      [`Status Sekolah: ${anggotaData.statusSekolah || "-"}`],
      [`Golongan Jabatan: ${anggotaData.golonganJabatan || "-"}`],
      [`Jabatan: ${anggotaData.jabatan || "-"}`],
      [
        `Mengajar: ${
          Number(anggotaData.mengajar) === 0 ? "-" : anggotaData.mengajar
        }`,
      ],
    ];

    tugas.forEach((line) => {
      doc.text(line, rightColX, rightY);
      rightY += 10;
    });

    // Data Pribadi
    let leftY = contactY - 10;
    doc.setFillColor(108, 108, 108);
    doc.rect(margin, leftY, leftColWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DATA PRIBADI", margin + 5, leftY + 7);
    doc.setTextColor(0, 0, 0);
    leftY += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const pribadi = [
      `Tempat, Tanggal Lahir: ${anggotaData.tempatLahir || "-"} , ${
        anggotaData.tanggalLahir?.join("-") || "-"
      }`,
      `NIK: ${anggotaData.nik || "-"}`,
      `Jenis Kelamin: ${anggotaData.jenisKelamin || "-"}`,
      `Agama: ${anggotaData.agama || "-"}`,
      `Golongan Darah: ${anggotaData.golonganDarah || "-"}`,
      `Status Pegawai: ${anggotaData.statusPegawai || "-"}`,
      `Pangkat Golongan: ${anggotaData.pangkatGolongan || "-"}`,
    ];

    pribadi.forEach((line) => {
      const lines = doc.splitTextToSize(line, leftColWidth);
      lines.forEach((textLine) => {
        doc.text(textLine, margin, leftY);
        leftY += 10;
      });
    });

    leftY += -5;
    doc.setFillColor(108, 108, 108);
    doc.rect(margin, leftY, leftColWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("DATA KEANGGOTAAN", margin + 5, leftY + 7);
    doc.setTextColor(0, 0, 0);
    leftY += 20;

    doc.setFont("helvetica", "normal");
    const keanggotaan = [
      `NPA PGRI: ${anggotaData.npaPgri || "-"}`,
      `Status: ${anggotaData.statusKeanggotaan || "-"}`,
      `Mulai: ${anggotaData.mulaiJadiAnggotaPgri?.join("-") || "-"}`,
      `Mulai Jadi Anggota: ${anggotaData.mulaiJadiAnggotaPgri?.join("-")}`,
      `Peserta Sanduka: ${anggotaData.pesertaSanduka || "-"}`,
      `Peserta KTA Digital: ${anggotaData.pesertaKtaDigital || "-"}`,
      `Peserta Daspen: ${anggotaData.pesertaDaspen || "-"}`,
    ];

    keanggotaan.forEach((line) => {
      doc.text(line, margin, leftY);
      leftY += 10;
    });

    // Data Pendidikan
    rightY += 5;
    rightY = addSection("DATA PENDIDIKAN", rightY);

    const pendidikan = [
      `Pendidikan Terakhir: ${anggotaData.pendidikanTerakhir || "-"}`,
      `Sertifikat Pendidik: ${anggotaData.sertifikatPendidik || "-"}`,
    ];

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    pendidikan.forEach((line) => {
      doc.text(line, rightColX, rightY);
      rightY += 8;
    });

    // Data Keluarga
    rightY += 5;
    rightY = addSection("DATA KELUARGA", rightY);

    const keluarga = [
      `Nama Suami/Istri: ${anggotaData.namaSuamiIstri ?? "-"}`,
      `Nama Anak: ${
        Array.isArray(anggotaData.namaAnak) && anggotaData.namaAnak.length > 0
          ? anggotaData.namaAnak
              .map((namaAnak, index) => {
                const formattedName = namaAnak
                  .replace(/[\[\]"]/g, "")
                  .replace(/\n/g, " ")
                  .trim();
                return `${index + 1}. ${formattedName}`;
              })
              .join("\n")
          : "-"
      }`,
    ];

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    keluarga.forEach((line) => {
      const wrappedText = doc.splitTextToSize(line, 60);
      wrappedText.forEach((wrappedLine) => {
        doc.text(wrappedLine, rightColX, rightY);
        rightY += 8;
      });
    });

    return doc;
  };

  const handlePrintPDF = async () => {
    try {
      const doc = await generatePDF(anggotaData, fotoBase64);
      doc.save(`Data_Anggota_${anggotaData.namaLengkap}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!token) {
        router.push("/sign-in");
      } else {
        getUserById();

        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }
    };

    initializeData();
  }, [token, router]);

  if (!anggotaData) return <div>Loading...</div>;

  const personalData = [
    `Tempat, Tanggal Lahir: ${
      anggotaData.tempatLahir
    }, ${anggotaData.tanggalLahir?.join("-")}`,
    `NIK: ${anggotaData.nik}`,
    `Jenis Kelamin: ${anggotaData.jenisKelamin}`,
    `Agama: ${anggotaData.agama}`,
    `Golongan Darah: ${anggotaData.golonganDarah}`,
    `Status Pegawai: ${anggotaData.statusPegawai}`,
    `Pangkat Golongan: ${anggotaData.pangkatGolongan}`,
  ];

  const jobData = [
    `Cabang: ${anggotaData.cabang}`,
    `Unit Kerja: ${anggotaData.unitKerja}`,
    `Tingkat Sekolah: ${
      typeof anggotaData.tingkatSekolah === "string"
        ? anggotaData.tingkatSekolah.replace(/_/g, "/")
        : "-"
    }`,
    `Status Sekolah: ${anggotaData.statusSekolah}`,
    `Golongan Jabatan: ${anggotaData.golonganJabatan}`,
    `Jabatan: ${anggotaData.jabatan}`,
    `Mengajar: ${
      Number(anggotaData.mengajar) === 0 ? "-" : anggotaData.mengajar
    }`,
  ];

  const membershipData = [
    `NPA PGRI: ${anggotaData.npaPgri}`,
    `NIP: ${anggotaData.nip}`,
    `Status Keanggotaan: ${anggotaData.statusKeanggotaan}`,
    `Mulai Jadi Anggota: ${anggotaData.mulaiJadiAnggotaPgri?.join("-")}`,
    `Peserta Sanduka: ${anggotaData.pesertaSanduka ?? "-"}`,
    `Peserta KTA Digital: ${anggotaData.pesertaKtaDigital ?? "-"}`,
    `Peserta Daspen: ${anggotaData.pesertaDaspen ?? "-"}`,
  ];

  const familyData = [
    `Nama Suami/Istri: ${anggotaData.namaSuamiIstri ?? "-"}`,
    `Nama Anak: `,
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-6 printable-content">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="w-full flex justify-end mb-4 mt-16 lg:mt-10">
        <Button onClick={handlePrintPDF} className="ml-auto">
          Cetak
        </Button>
      </div>
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section with Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 lg:p-6">
          {!isMobile && (
            <div className="text-center">
              <h1 className="text-xl lg:text-2xl font-bold mb-1">
                Data Anggota
              </h1>
              <h2 className="text-lg lg:text-xl font-serif">
                {anggotaData.namaLengkap}
              </h2>
              <p className="text-base lg:text-lg italic text-blue-100">
                {anggotaData.jabatan}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row p-4 lg:p-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-[250px] lg:border-r lg:pr-6">
            {/* Profile Photo - Reduced negative margin for mobile */}
            <div className="flex justify-center">
              <div className="w-[180px] h-[225px] md:w-[200px] md:h-[250px] overflow-hidden rounded-lg shadow-md border-4 border-white relative -mt-10 md:-mt-16 bg-white">
                {anggotaData.foto ? (
                  <img
                    src={`data:image/png;base64,${fotoBase64}`}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex justify-center items-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 md:h-20 md:w-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Name Display - Improved text sizing */}
            {isMobile && (
              <div className="text-center mt-4 mb-5">
                <h2 className="text-base md:text-lg font-serif font-bold">
                  {anggotaData.namaLengkap}
                </h2>
                <h3 className="text-sm md:text-base text-rose-500">
                  {anggotaData.jabatan}
                </h3>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-5 bg-gray-50 p-3 md:p-4 rounded-lg shadow-sm text-sm md:text-base">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="bg-blue-100 p-1.5 md:p-2 rounded-full text-blue-600 flex-shrink-0">
                  <span className="text-base md:text-lg">📞</span>
                </div>
                <span className="break-all">{anggotaData.nomorHp}</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="bg-blue-100 p-1.5 md:p-2 rounded-full text-blue-600 flex-shrink-0">
                  <span className="text-base md:text-lg">✉️</span>
                </div>
                <span className="break-all">{anggotaData.email}</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-blue-100 p-1.5 md:p-2 rounded-full text-blue-600 flex-shrink-0 mt-0.5">
                  <span className="text-base md:text-lg">📍</span>
                </div>
                <span className="break-all">{anggotaData.alamat}</span>
              </div>
            </div>

            {/* Personal Data */}
            <div className="mt-5">
              <div className="bg-blue-600 text-white py-1.5 px-3 md:py-2 md:px-4 rounded-t-lg font-medium text-sm md:text-base">
                <h2>DATA PRIBADI</h2>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 p-3 md:p-4 rounded-b-lg shadow-sm text-sm md:text-base">
                <ul className="list-none space-y-1.5 md:space-y-2">
                  {personalData.map((item, index) => (
                    <li key={index} className="break-words flex items-start">
                      <span className="text-blue-600 mr-2 flex-shrink-0">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Membership Data */}
            <div className="mt-5">
              <div className="bg-blue-600 text-white py-1.5 px-3 md:py-2 md:px-4 rounded-t-lg font-medium text-sm md:text-base">
                <h2>DATA KEANGGOTAAN</h2>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 p-3 md:p-4 rounded-b-lg shadow-sm text-sm md:text-base">
                {membershipData.map((item, index) => (
                  <div
                    key={index}
                    className="break-words mb-1.5 md:mb-2 flex items-start"
                  >
                    <span className="text-blue-600 mr-2 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:flex-1 lg:pl-6 mt-6 lg:mt-0">
            {/* Job Data */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white py-1.5 px-3 md:py-2 md:px-4 rounded-t-lg font-medium flex items-center text-sm md:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h2>DATA TUGAS</h2>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 p-3 md:p-4 rounded-b-lg shadow-sm text-sm md:text-base">
                {jobData.map((item, index) => (
                  <div
                    key={index}
                    className="break-words mb-3 md:mb-4 bg-gray-50 p-2.5 md:p-3 rounded border-l-3 md:border-l-4 border-blue-400"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Education Data */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white py-1.5 px-3 md:py-2 md:px-4 rounded-t-lg font-medium flex items-center text-sm md:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  />
                </svg>
                <h2>DATA PENDIDIKAN</h2>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 p-3 md:p-4 rounded-b-lg shadow-sm text-sm md:text-base">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="break-words bg-gray-50 p-2.5 md:p-3 rounded border-l-3 md:border-l-4 border-blue-400">
                    <div className="font-medium text-blue-700 mb-1">
                      Pendidikan Terakhir
                    </div>
                    <div>{anggotaData.pendidikanTerakhir || "-"}</div>
                  </div>
                  <div className="break-words bg-gray-50 p-2.5 md:p-3 rounded border-l-3 md:border-l-4 border-blue-400">
                    <div className="font-medium text-blue-700 mb-1">
                      Sertifikat Pendidik
                    </div>
                    <div>{anggotaData.sertifikatPendidik || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Data */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white py-1.5 px-3 md:py-2 md:px-4 rounded-t-lg font-medium flex items-center text-sm md:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h2>DATA KELUARGA</h2>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 p-3 md:p-4 rounded-b-lg shadow-sm text-sm md:text-base">
                {familyData.map((item, index) => (
                  <div key={index} className="break-words mb-3 md:mb-4">
                    {index === 1 ? (
                      <div className="bg-gray-50 p-2.5 md:p-3 rounded border-l-3 md:border-l-4 border-blue-400">
                        <div className="font-medium text-blue-700 mb-1 md:mb-2">
                          {item.split("\n")[0]}
                        </div>
                        <div className="pl-2 md:pl-4">
                          {Array.isArray(anggotaData.namaAnak) &&
                          anggotaData.namaAnak.length > 0 ? (
                            anggotaData.namaAnak.map((anak, anakIndex) => {
                              if (typeof anak === "string") {
                                let cleanedAnak = anak
                                  .replace(/\[|\]|\"/g, "")
                                  .trim();
                                if (cleanedAnak) {
                                  return (
                                    <div
                                      key={anakIndex}
                                      className="flex items-center my-1 text-sm md:text-base"
                                    >
                                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs md:text-sm flex-shrink-0">
                                        {anakIndex + 1}
                                      </div>
                                      <span className="break-words">
                                        {cleanedAnak}
                                      </span>
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })
                          ) : (
                            <div className="text-gray-500 italic">-</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2.5 md:p-3 rounded border-l-3 md:border-l-4 border-blue-400">
                        {item}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 md:p-4 text-center text-gray-500 text-xs md:text-sm border-t">
          © {new Date().getFullYear()} - Data Anggota - Semua informasi bersifat
          rahasia
        </div>
      </div>
    </div>
  );
};

export default DetailAnggota;
