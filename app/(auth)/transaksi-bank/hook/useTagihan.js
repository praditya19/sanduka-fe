import { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const useTagihan = (npa, bulan, tahun, token) => {
  const [dataIuran, setDataIuran] = useState(null);
  const [dataAnggota, setDataAnggota] = useState(null);
  const [posLainLainName, setPosLainLainName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!npa || !token) return;
    fetchData();
  }, [npa, bulan, tahun, token]);

  const formatTanggal = (tgl) => (tgl ? `${tgl[2]}-${tgl[1]}-${tgl[0]}` : "-");

  const fetchData = async () => {
    setLoading(true);
    try {
      const bulanIso = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
      const [res, resHut, resPos] = await Promise.all([
        GlobalApi.getTransaksiBankBalancing(
          null,
          null,
          tahun,
          bulan,
          null,
          npa,
        ),
        GlobalApi.getIuranSumbanganHutByNpa(npa, bulanIso).catch(() => null),
        GlobalApi.getPosLainLain().catch(() => ({ data: [] })),
      ]);

      const list = Array.isArray(res) ? res : res?.data || [];
      const balancing = list[0];
      const posList = Array.isArray(resPos) ? resPos : resPos?.data || [];
      const matchedPos = posList.find((p) => {
        const pTahun = String(p.tahun || "").trim();
        return !pTahun || pTahun === String(tahun);
      }) || posList[0];
      const posName = matchedPos?.nama || "HUT 81 PGRI";
      setPosLainLainName(posName);

      let sumbanganNominal = Number(balancing?.totalIuranSumbangan || 0);
      if (!sumbanganNominal && resHut?.totalHut) {
        sumbanganNominal = Number(resHut.totalHut);
      }

      if (balancing || sumbanganNominal > 0) {
        setDataIuran({
          pgri: balancing?.totalIuranAnggota || 0,
          sanduka: balancing?.totalIuranSanduka || 0,
          daspen: balancing?.totalIuranDaspen || 0,
          derap: balancing?.totalIuranDerap || 0,
          kalender: balancing?.totalIuranKalender || 0,
          sumbangan: sumbanganNominal,
          namaLengkap: balancing?.nama,
          unitKerja: balancing?.unitKerja,
          cabang: balancing?.cabang,
          jabatan: balancing?.statusPegawai,
          keterangan: balancing?.keterangan,
          potongan: balancing?.potongan,
          selisih: balancing?.selisih,
          bulan,
          tahun,
        });
      }

      const member = await GlobalApi.cekNpa(npa);

      if (member) {
        const detail = await GlobalApi.getUserById(member.id);

        setDataAnggota(detail);

        setDataIuran((prev) => ({
          ...(prev || {}),
          tempatTanggalLahir: `${detail.tempatLahir}, ${formatTanggal(
            detail.tanggalLahir,
          )}`,
          jabatan: detail.jabatan,
        }));
      }
    } catch (err) {
      console.error("❌ ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    dataIuran,
    dataAnggota,
    posLainLainName,
    loading,
  };
};

export default useTagihan;
