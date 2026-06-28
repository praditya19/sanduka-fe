import { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const useTagihan = (npa, bulan, tahun, token) => {
  const [dataIuran, setDataIuran] = useState(null);
  const [dataAnggota, setDataAnggota] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!npa || !token) return;
    fetchData();
  }, [npa, bulan, tahun, token]);

  const formatTanggal = (tgl) => (tgl ? `${tgl[2]}-${tgl[1]}-${tgl[0]}` : "-");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await GlobalApi.getTransaksiBankBalancing(
        null,
        null,
        tahun,
        bulan,
        null,
        npa,
      );
      const list = Array.isArray(res) ? res : res?.data || [];
      const balancing = list[0];

      if (balancing) {
        setDataIuran({
          pgri: balancing.totalIuranAnggota || 0,
          sanduka: balancing.totalIuranSanduka || 0,
          daspen: balancing.totalIuranDaspen || 0,
          derap: balancing.totalIuranDerap || 0,
          kalender: balancing.totalIuranKalender || 0,
          sumbangan: balancing.totalIuranSumbangan || 0,
          namaLengkap: balancing.nama,
          unitKerja: balancing.unitKerja,
          cabang: balancing.cabang,
          jabatan: balancing.statusPegawai,
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
    loading,
  };
};

export default useTagihan;
