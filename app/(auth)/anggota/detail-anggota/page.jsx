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
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-20">
        <div className="w-full lg:w-[210px] lg:flex-shrink-0">
          <div className="flex flex-col sm:flex-row lg:flex-col gap-6">
            <div className="w-[200px] mx-auto sm:mx-0">
              <div className="bg-red-600 w-full aspect-square mb-4 flex justify-center items-center">
                {anggotaData.foto ? (
                  <img
                    src={`data:image/png;base64,${fotoBase64}`}
                    alt="Profile"
                    className="object-cover w-[200px] h-[250px]"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex justify-center items-center text-center text-white">
                    No Image Available
                  </div>
                )}
              </div>

              {isMobile ? (
                <>
                  <h2 className="text-xl lg:text-xl font-serif mb-3 text-center">
                    {anggotaData.namaLengkap}
                  </h2>
                  <h3 className="text-xl lg:text-xl text-rose-500 text-center">
                    {anggotaData.jabatan}
                  </h3>
                </>
              ) : null}
            </div>

            <div className="flex-1 space-y-3 text-base">
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span className="break-all">{anggotaData.nomorHp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span className="break-all">{anggotaData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="break-all">{anggotaData.alamat}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-8 text-base">
            <div className="bg-neutral-500 text-white py-2 px-4 mb-6 pb-2">
              <h2>DATA PRIBADI</h2>
            </div>
            <ul className="list-none space-y-2 ml-3">
              {personalData.map((item, index) => (
                <li key={index} className="break-words">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 lg:mt-8 text-base">
            <div className="bg-neutral-500 text-white py-2 px-4 mb-6 pb-2">
              <h2>DATA KEANGGOTAAN</h2>
            </div>
            <div className="space-y-2 ml-3">
              {membershipData.map((item, index) => (
                <div key={index} className="break-words">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 text-base">
          {!isMobile ? (
            <>
              <div className="text-center lg:text-left mb-6">
                <h1 className="text-3xl lg:text-4xl mb-2">Data Anggota</h1>
                <h2 className="text-2xl lg:text-3xl font-serif mb-3">
                  {anggotaData.namaLengkap}
                </h2>
                <h3 className="text-lg lg:text-xl text-rose-500">
                  {anggotaData.jabatan}
                </h3>
              </div>
            </>
          ) : null}
          <div className="mb-6 mt-16">
            <div className="bg-neutral-500 text-white py-2 px-4 mb-6 pb-2">
              <h2>DATA TUGAS</h2>
            </div>
            <div className="space-y-4 ml-3">
              {jobData.map((item, index) => (
                <div key={index} className="break-words">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-base">
            <div className="bg-neutral-500 text-white py-2 px-4 mb-6 pb-2">
              <h2>DATA PENDIDIKAN</h2>
            </div>
            <div className="space-y-4 ml-3">
              <div className="break-words">
                <span>Pendidikan Terakhir:</span>{" "}
                {anggotaData.pendidikanTerakhir}
              </div>
              <div className="break-words">
                <span>Sertifikat Pendidik:</span>{" "}
                {anggotaData.sertifikatPendidik}
              </div>
            </div>
          </div>

          <div className="mt-6 text-base mb-6">
            <div className="bg-neutral-500 text-white py-2 px-4 mb-6 pb-2">
              <h2>DATA KELUARGA</h2>
            </div>
            <div className="space-y-4 ml-3">
              {familyData.map((item, index) => (
                <div key={index} className="break-words">
                  {index === 1 ? (
                    <>
                      <div>{item.split("\n")[0]}</div>
                      <div>
                        {Array.isArray(anggotaData.namaAnak) &&
                        anggotaData.namaAnak.length > 0
                          ? anggotaData.namaAnak.map((anak, anakIndex) => {
                              if (typeof anak === "string") {
                                // Periksa apakah anak adalah array JSON yang terpisah dengan koma
                                let cleanedAnak = anak
                                  .replace(/\[|\]|\"/g, "")
                                  .trim(); // Menghapus tanda [] dan ""
                                if (cleanedAnak) {
                                  return (
                                    <div key={anakIndex}>
                                      {anakIndex + 1}. {cleanedAnak}
                                    </div>
                                  );
                                }
                              }
                              return null; // Menghindari menampilkan data yang tidak valid
                            })
                          : "-"}
                      </div>
                    </>
                  ) : (
                    <div>{item}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailAnggota;
