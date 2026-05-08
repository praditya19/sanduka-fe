import * as XLSX from "xlsx";
import GlobalApi from "@/app/_utils/GlobalApi";
import { processApiResponse, getTotalSumbangan } from "./rekapUtils";

export const handlePrintLogic = async (groupedData, selectedBulan, selectedTahun) => {
  try {
    if (!groupedData || groupedData.length === 0) {
      console.error("Data kosong, tidak dapat mencetak.");
      return;
    }

    const bulan = selectedBulan || new Date().getMonth() + 1;
    const tahun = selectedTahun || new Date().getFullYear();

    const htmlContent = `
      <html>
        <head>
          <title>Rekap Laporan Iuran</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; text-align: center; }
            .total-row { font-weight: bold; background-color: #eee; }
            .header { text-align: center; margin-bottom: 20px; }
            .member-list div { margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>REKAP LAPORAN IURAN ANGGOTA</h2>
            <p>Bulan: ${bulan} Tahun: ${tahun}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Cabang</th>
                <th>Unit Kerja</th>
                <th>Nama Anggota</th>
                <th>Jml</th>
                <th>PGRI</th>
                <th>Sanduka</th>
                <th>Daspen</th>
                <th>Derap</th>
                <th>Kalender</th>
                <th>Sumbangan</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${groupedData.map((group, index) => {
                const members = group.members || [];
                return members.map((member, memberIndex) => {
                  return `
                    <tr>
                      ${memberIndex === 0 ? `
                        <td rowspan="${members.length}">${index + 1}</td>
                        <td rowspan="${members.length}">${group.cabang}</td>
                        <td rowspan="${members.length}">${group.unitKerja}</td>
                      ` : ""}
                      <td class="member-list">
                        <div>${member.namaAnggota}</div>
                        <div>${member.nip || "-"}</div>
                        <div>${member.nomorRekening || "-"}</div>
                      </td>
                      ${memberIndex === 0 ? `<td rowspan="${members.length}">${group.jumlah || 0}</td>` : ""}
                      <td>Rp. ${parseInt(member.pgri || 0).toLocaleString("id-ID")}</td>
                      <td>Rp. ${parseInt(member.sanduka || 0).toLocaleString("id-ID")}</td>
                      <td>Rp. ${parseInt(member.daspen || 0).toLocaleString("id-ID")}</td>
                      <td>Rp. ${parseInt(member.derap || 0).toLocaleString("id-ID")}</td>
                      <td>Rp. ${parseInt(member.kalender || 0).toLocaleString("id-ID")}</td>
                      <td>
                        ${member.detailSumbangan && member.detailSumbangan.length > 0 ? `
                          <div style="text-align: left; padding: 4px 0;">
                            ${member.detailSumbangan.map(d => `
                              <div style="margin-bottom: 4px;">
                                <strong>${d.namaSumbangan}</strong><br>
                                Rp. ${parseInt(d.jumlah || 0).toLocaleString("id-ID")}
                              </div>
                            `).join("")}
                          </div>
                        ` : `Rp. ${parseInt(member.sumbangan || 0).toLocaleString("id-ID")}`}
                      </td>
                      <td>Rp. ${parseInt(member.totalIuran || 0).toLocaleString("id-ID")}</td>
                    </tr>
                  `;
                }).join("");
              }).join("")}
              <tr class="total-row">
                <td colspan="4" style="text-align: center">Total Keseluruhan :</td>
                <td>${groupedData.reduce((sum, group) => sum + parseInt(group.jumlah || 0), 0)}</td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.pgri || 0), 0).toLocaleString("id-ID")}</td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.sanduka || 0), 0).toLocaleString("id-ID")}</td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.daspen || 0), 0).toLocaleString("id-ID")}</td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.derap || 0), 0).toLocaleString("id-ID")}</td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.kalender || 0), 0).toLocaleString("id-ID")}</td>
                <td>
                  ${(() => {
                    const allDetails = groupedData.flatMap(g => g.members || []).flatMap(m => m.detailSumbangan || []);
                    if (allDetails.length > 0) {
                      const detailByName = {};
                      allDetails.forEach(d => {
                        detailByName[d.namaSumbangan] = (detailByName[d.namaSumbangan] || 0) + parseInt(d.jumlah || 0);
                      });
                      return `<div style="text-align: left; padding: 4px 0;">
                        ${Object.entries(detailByName).map(([name, total]) => `
                          <div style="margin-bottom: 4px;"><strong>${name}</strong><br>Rp. ${total.toLocaleString("id-ID")}</div>
                        `).join("")}
                      </div>`;
                    }
                    return `Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.sumbangan || 0), 0).toLocaleString("id-ID")}`;
                  })()}
                </td>
                <td>Rp. ${groupedData.flatMap(g => g.members || []).reduce((sum, m) => sum + parseInt(m.totalIuran || 0), 0).toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    printFrame.srcdoc = htmlContent;
    document.body.appendChild(printFrame);
    printFrame.onload = () => {
      printFrame.contentWindow.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    };
  } catch (error) {
    console.error("Error during print process:", error);
  }
};

export const exportToExcelLogic = async (selectedCabang, selectedUnitKerja, selectedBulan, selectedTahun, namaAnggotaInput, setIsExporting) => {
  try {
    setIsExporting(true);
    const cabangParam = selectedCabang || "";
    const unitKerjaParam = selectedUnitKerja || "";
    const bulanParam = selectedBulan || null;
    const tahunParam = selectedTahun || null;

    let allData = await GlobalApi.getNominalAggregatedData(cabangParam, unitKerjaParam, null, bulanParam, tahunParam);
    allData = processApiResponse(allData, null, false);

    if (!allData || allData.length === 0) {
      alert("Tidak ada data anggota ditemukan.");
      return;
    }

    let filteredData = allData;
    if (selectedCabang) filteredData = filteredData.filter(item => item.cabang?.toLowerCase().includes(selectedCabang.toLowerCase()));
    if (selectedUnitKerja) filteredData = filteredData.filter(item => item.unitKerja?.toLowerCase().includes(selectedUnitKerja.toLowerCase()));
    if (namaAnggotaInput) filteredData = filteredData.filter(item => item.namaAnggota?.toLowerCase().includes(namaAnggotaInput.toLowerCase()));

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const namaBulan = monthNames[selectedBulan - 1] || selectedBulan;

    const excelData = [
      [`Tagihan Untuk Bulan ${namaBulan} ${selectedTahun}`],
      [],
      [
        "No", "Cabang", "Unit Kerja", "Nama Anggota", "NIP", "NPA", "Nomor Rekening",
        "Default PGRI", "Manual PGRI", "PGRI",
        "Default Sanduka", "Manual Sanduka", "Sanduka",
        "Default Daspen", "Manual Daspen", "Daspen",
        "Default Derap", "Manual Derap", "Derap",
        "Default Kalender", "Manual Kalender", "Kalender",
        "Default Lain-Lain", "Manual Lain-Lain", "Lain-Lain",
        "Total"
      ]
    ];
    
    filteredData.forEach((item, idx) => {
      excelData.push([
        idx + 1,
        item.cabang || "-",
        item.unitKerja || "-",
        item.namaAnggota,
        item.nip || "-",
        item.npaPgri || "-",
        item.nomorRekening || "-",
        parseInt(item.defaultPgri || 0),
        parseInt(item.manualPgri || 0),
        parseInt(item.pgri || 0),
        parseInt(item.defaultSanduka || 0),
        parseInt(item.manualSanduka || 0),
        parseInt(item.sanduka || 0),
        parseInt(item.defaultDaspen || 0),
        parseInt(item.manualDaspen || 0),
        parseInt(item.daspen || 0),
        parseInt(item.defaultDerap || 0),
        parseInt(item.manualDerap || 0),
        parseInt(item.derap || 0),
        parseInt(item.defaultKalender || 0),
        parseInt(item.manualKalender || 0),
        parseInt(item.kalender || 0),
        parseInt(item.defaultLainLain || 0),
        parseInt(item.manualLainLain || 0),
        parseInt(item.lainLain || parseInt(getTotalSumbangan(item) || 0)),
        parseInt(item.totalIuran || 0)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RekapData");
    
    const waktuDownload = new Date().toLocaleString("id-ID", { dateStyle: "short" }).replace(/\//g, "-");
    XLSX.writeFile(wb, `Backupbynominal_${namaBulan}_${selectedTahun}_${waktuDownload}.xlsx`);
  } catch (error) {
    console.error("Gagal ekspor data:", error);
    alert("Terjadi kesalahan saat ekspor.");
  } finally {
    setIsExporting(false);
  }
};

export const exportPotonganBankLogic = (groupedData, selectedBulan, selectedTahun) => {
  if (!groupedData || groupedData.length === 0) {
    console.error("Data kosong, tidak dapat export ke Excel");
    return;
  }

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const bulanNama = `${monthNames[selectedBulan - 1]} ${selectedTahun}`;
  const tanggalDownload = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const excelData = [
    ["Rekap Data Anggota Potongan Bank"],
    [`Bulan: ${bulanNama}`],
    [`Tanggal Download: ${tanggalDownload}`],
    [],
    ["Pgri Kabupaten Jepara"],
    ["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"],
    [],
    ["No", "Cabang", "Nama", "No Rekening", "Total Tagihan", "Keterangan"]
  ];

  let rowNumber = 1;
  let hasValidData = false;
  let totalTagihanSemua = 0;

  groupedData.forEach((group) => {
    if (group.members && group.members.length > 0) {
      group.members.forEach((member) => {
        const nomorRekeningFinal = member.nomorRekening || "";
        if (nomorRekeningFinal && nomorRekeningFinal.trim() !== "") {
          const tagihan = parseInt(member.totalIuran || 0);
          totalTagihanSemua += tagihan;
          hasValidData = true;
          excelData.push([
            rowNumber++,
            group.cabang,
            member.namaAnggota,
            nomorRekeningFinal,
            tagihan,
            "",
          ]);
        }
      });
    }
  });

  if (!hasValidData) {
    alert("Tidak ada data dengan nomor rekening.");
    return;
  }

  excelData.push([]);
  excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
  excelData.push([]);
  excelData.push(["", "", "", "", tanggalDownload]);
  excelData.push(["", "", "", "", "TTD"]);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Rekening");
  XLSX.writeFile(wb, "Rekap_Laporan_Potongan_Bank.xlsx");
};

export const exportMandiriLogic = (groupedData, selectedBulan, selectedTahun) => {
  if (!groupedData || groupedData.length === 0) {
    console.error("Data kosong, tidak dapat export ke Excel");
    return;
  }

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const bulanNama = `${monthNames[selectedBulan - 1]} ${selectedTahun}`;
  const tanggalDownload = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const excelData = [
    ["Rekap Data Anggota Tanpa No Rekening (Mandiri)"],
    [`Bulan: ${bulanNama}`],
    [`Tanggal Download: ${tanggalDownload}`],
    [],
    ["Pgri Kabupaten Jepara"],
    ["No Rekening : 2.015.15169.5 (PGRI Kabupaten Jepara)"],
    [],
    ["No", "Cabang", "Nama", "No Rekening", "Total Tagihan", "Keterangan"]
  ];

  let rowNumber = 1;
  let hasMissingData = false;
  let totalTagihanSemua = 0;

  groupedData.forEach((group) => {
    if (group.members && group.members.length > 0) {
      group.members.forEach((member) => {
        if (!member.nomorRekening || member.nomorRekening.trim() === "") {
          const tagihan = parseInt(member.totalIuran || 0);
          totalTagihanSemua += tagihan;
          hasMissingData = true;
          excelData.push([
            rowNumber++,
            group.cabang,
            member.namaAnggota,
            "",
            tagihan,
            "",
          ]);
        }
      });
    }
  });

  if (!hasMissingData) {
    alert("Semua data memiliki nomor rekening.");
    return;
  }

  excelData.push([]);
  excelData.push(["", "", "", "Total Keseluruhan", totalTagihanSemua]);
  excelData.push([]);
  excelData.push(["", "", "", "", tanggalDownload]);
  excelData.push(["", "", "", "", "TTD"]);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Tanpa No Rekening");
  XLSX.writeFile(wb, "Rekap_Laporan_Mandiri.xlsx");
};
