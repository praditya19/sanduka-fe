export const formatDateTime = (timestamp) => {
  if (!timestamp) return "-";
  if (Array.isArray(timestamp)) {
    if (timestamp.length < 3) return "-";
    const [year, month, day, hour = 0, min = 0, sec = 0] = timestamp;
    const d = String(day).padStart(2, "0");
    const m = String(month).padStart(2, "0");
    const y = String(year);
    const hh = String(hour).padStart(2, "0");
    const mm = String(min).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return `${d}-${m}-${y} ${hh}:${mm}:${ss}`;
  }
  const str = String(timestamp).trim();
  if (!str || str === "-") return "-";
  const ymdMatch = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(str);
  if (ymdMatch) {
    const [, y, m, d, hh, mm, ss = "00"] = ymdMatch;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y} ${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
  }
  const dmyMatch = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(str);
  if (dmyMatch) {
    const [, d, m, y, hh, mm, ss = "00"] = dmyMatch;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y} ${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
  }
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
  }
  return str;
};

export const formatTanggal = (timestamp, format = "DMY") => {
  if (!timestamp) return "-";
  if (format === "DMY" || format === "DMY_TIME") {
    return formatDateTime(timestamp);
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "-";
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
          [`IURAN HUT ${new Date().getFullYear() - 1945} PGRI`]: 30000,
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
      lastUpdatedAtIuran:
        item.lastUpdatedAtIuran ||
        item.lastUpdateIuran ||
        item.lastUpdatedAtIuranAnggota ||
        item.updatedAt ||
        item.updated_at ||
        item.createdAt ||
        "",
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
        let jenisKey = s.jenis || s.namaSumbangan || "";
        if (/HUT/i.test(jenisKey)) {
          jenisKey = `IURAN HUT ${new Date().getFullYear() - 1945} PGRI`;
        }
        if (!acc[unitKey].sumbanganDetail[jenisKey]) {
          acc[unitKey].sumbanganDetail[jenisKey] = 0;
        }
        acc[unitKey].sumbanganDetail[jenisKey] += s.jumlah;
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
