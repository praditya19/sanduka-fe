export const formatTanggal = (timestamp, format = "DMY") => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (format === "YMD") {
    return `${year}-${month}-${day}`;
  }
  return `${day}-${month}-${year}`;
};

export const processApiResponse = (apiData, filterByNpa = null, useLatestDate = true) => {
  if (!apiData || !Array.isArray(apiData)) {
    return apiData;
  }

  let filteredData = apiData;
  if (filterByNpa) {
    filteredData = apiData.filter((item) => item.npaPgri === filterByNpa);
  }

  const groupedByNpa = {};

  filteredData.forEach((item) => {
    const npa = item.npaPgri;

    if (!groupedByNpa[npa]) {
      groupedByNpa[npa] = item;
    } else {
      const shouldReplace = useLatestDate
        ? new Date(item.lastUpdatedAtIuran || 0) >
          new Date(groupedByNpa[npa].lastUpdatedAtIuran || 0)
        : (item.idByNominal || 0) > (groupedByNpa[npa].idByNominal || 0);

      if (shouldReplace) {
        groupedByNpa[npa] = item;
      }
    }
  });

  return Object.values(groupedByNpa);
};

export const processData = (rawData) => {
  const uniqueMap = new Map();

  rawData.forEach((item) => {
    const key = `${item.namaAnggota}-${item.npaPgri}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const filteredData = Array.from(uniqueMap.values());

  const grouped = filteredData.reduce((acc, item) => {
    const unitKey = item.unitKerja || "Tidak Ada Unit Kerja";
    const cabangKey = item.cabang || "Tidak Ada Cabang";

    if (!acc[unitKey]) {
      acc[unitKey] = {
        unitKerja: unitKey,
        cabang: cabangKey,
        members: [],
        jumlah: 0,
        pgri: 0,
        sanduka: 0,
        daspen: 0,
        derap: 0,
        kalender: 0,
        sumbangan: 0,
        totalIuran: 0,
        nomorRekening: 0,
        lastUpdatedAtIuran: "",
        sumbanganDetail: {
          "Cetak Kartu Biasa": 25000,
          "IURAN HUT 80 PGRI": 30000,
        },
      };
    }

    acc[unitKey].members.push({
      namaAnggota: item.namaAnggota,
      npaPgri: item.npaPgri,
      nomorRekening: item.nomorRekening,
      nip: item.nip,
      statusPegawai: item.statusPegawai,
      idByNominal: item.idByNominal,
      statusPotongan: item.statusPotongan,
      potongan: item.potongan,
      pgri: parseFloat(item.pgri) || 0,
      sanduka: parseFloat(item.sanduka) || 0,
      daspen: parseFloat(item.daspen) || 0,
      derap: parseFloat(item.derap) || 0,
      kalender: parseFloat(item.kalender) || 0,
      sumbangan: parseFloat(item.lainLain) || 0,
      totalIuran: parseFloat(item.totalIuran) || 0,
      lastUpdatedAtIuran: item.lastUpdatedAtIuran,
      detailSumbangan: (() => {
        try {
          if (typeof item.detailSumbangan === "string") {
            const parsed = JSON.parse(item.detailSumbangan);
            return Array.isArray(parsed) ? parsed : [];
          }
          return Array.isArray(item.detailSumbangan)
            ? item.detailSumbangan
            : [];
        } catch (error) {
          console.warn(
            `⚠️ Gagal parse detailSumbangan untuk ${item.namaAnggota}:`,
            error,
          );
          return [];
        }
      })(),
    });

    acc[unitKey].jumlah += 1;
    acc[unitKey].pgri += parseFloat(item.pgri) || 0;
    acc[unitKey].sanduka += parseFloat(item.sanduka) || 0;
    acc[unitKey].daspen += parseFloat(item.daspen) || 0;
    acc[unitKey].derap += parseFloat(item.derap) || 0;
    acc[unitKey].kalender += parseFloat(item.kalender) || 0;
    acc[unitKey].sumbangan += parseFloat(item.lainLain) || 0;
    acc[unitKey].totalIuran += parseFloat(item.totalIuran) || 0;

    if (Array.isArray(item.iuranSumbanganList)) {
      item.iuranSumbanganList.forEach((s) => {
        if (!acc[unitKey].sumbanganDetail[s.jenis]) {
          acc[unitKey].sumbanganDetail[s.jenis] = 0;
        }
        acc[unitKey].sumbanganDetail[s.jenis] += s.jumlah;
      });
    }

    return acc;
  }, {});

  return Object.values(grouped);
};

export const getTotalSumbangan = (item) => {
  let details = item.detailSumbangan;
  if (!details) return parseInt(item.lainLain || 0);
  if (typeof details === "string") {
    try {
      details = JSON.parse(details);
    } catch {
      return parseInt(item.lainLain || 0);
    }
  }
  if (Array.isArray(details)) {
    return details.reduce((sum, d) => sum + parseInt(d.jumlah || 0), 0);
  }
  return parseInt(item.lainLain || 0);
};
