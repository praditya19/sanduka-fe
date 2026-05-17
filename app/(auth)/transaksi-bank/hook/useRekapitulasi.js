import { useState, useCallback, useEffect, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const useRekapitulasi = () => {
  const [dataRekapitulasi, setDataRekapitulasi] = useState([]);
  const [loadingRekapitulasi, setLoadingRekapitulasi] = useState(false);

    
    const getRekapitulasiData = async () => {
        setDataRekapitulasi([]);
        setLoadingRekapitulasi(true);
    
        try {
          const storedRole = sessionStorage.getItem("role");
          const storedCabang = sessionStorage.getItem("cabang");
    
          let cabangFilter = "";
          if (storedRole === "ADMIN") {
            cabangFilter = storedCabang || "";
          } else {
            cabangFilter = selectedCabang || "";
          }
    
          const result = await GlobalApi.getTransaksiBankBalancing(
            cabangFilter,
            selectedUnitKerja || null,
            year === "all" ? null : year ? parseInt(year) : null,
            month === "all" ? null : month ? parseInt(month) : null,
            paymentNote || null,
            searchBalancing || null,
          );
    
          const safeResult = Array.isArray(result) ? result : [];
    
          const filteredByCabang = safeResult.filter(
            (item) => !cabangFilter || item.cabang === cabangFilter,
          );
    
          const filteredByUnitKerja = filteredByCabang.filter(
            (item) => !selectedUnitKerja || item.unitKerja === selectedUnitKerja,
          );
    
          const npaMap = {};
          filteredByUnitKerja.forEach((item) => {
            const key = `${item.cabang}-${item.unitKerja}-${item.npa}`;
    
            if (!npaMap[key] || item.id > npaMap[key].id) {
              npaMap[key] = item;
            }
          });
    
          const rekapMap = {};
          Object.values(npaMap).forEach((item) => {
            const key = `${item.cabang}-${item.unitKerja}`;
    
            if (!rekapMap[key]) {
              rekapMap[key] = {
                cabang: item.cabang,
                unitKerja: item.unitKerja,
                iuran: 0,
                sanduka: 0,
                daspen: 0,
                derap: 0,
                kalender: 0,
                lainLain: 0,
                potonganBank: 0,
                uniqueNPA: new Set(),
              };
            }
    
            rekapMap[key].iuran += item.totalIuranAnggota || 0;
            rekapMap[key].sanduka += item.totalIuranSanduka || 0;
            rekapMap[key].daspen += item.totalIuranDaspen || 0;
            rekapMap[key].derap += item.totalIuranDerap || 0;
            rekapMap[key].kalender += item.totalIuranKalender || 0;
            rekapMap[key].lainLain += item.totalIuranSumbangan || 0;
            rekapMap[key].potonganBank += item.potongan || 0;
            rekapMap[key].uniqueNPA.add(item.npa);
          });
    
          const rekapArray = Object.values(rekapMap).map((item, index) => {
            const totalIuran =
              item.iuran +
              item.sanduka +
              item.daspen +
              item.derap +
              item.kalender +
              item.lainLain;
            const selisih = totalIuran - item.potonganBank;
    
            return {
              id: index,
              cabang: item.cabang,
              unitKerja: item.unitKerja,
              iuran: item.iuran,
              sanduka: item.sanduka,
              daspen: item.daspen,
              derap: item.derap,
              kalender: item.kalender,
              lainLain: item.lainLain,
              totalIuran: totalIuran,
              potonganBank: item.potonganBank,
              selisih: selisih,
              jumlahAnggota: item.uniqueNPA.size,
            };
          });
    
          setDataRekapitulasi(rekapArray);
        } catch (err) {
          console.error("❌ Gagal memuat rekapitulasi:", err);
          setDataRekapitulasi([]);
        } finally {
          setLoadingRekapitulasi(false);
        }
    };
    useEffect(() => {
        if (activeTab === "rekapitulasi") {
          getRekapitulasiData();
        }
      }, [
        activeTab,
        selectedCabang,
        selectedUnitKerja,
        year,
        month,
        paymentNote,
        searchBalancing,
      ]);
    return {
  // state
  dataRekapitulasi,
  loadingRekapitulasi,

  // function
  getRekapitulasiData,
};
}
 
export default useRekapitulasi;