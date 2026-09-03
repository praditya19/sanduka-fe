"use client";
import useTagihan from "../hook/useTagihan";
import TagihanView from "./TagihanView";
import { useAuth } from "@/app/AuthContext";

const TagihanModal = ({
  isOpen,
  onClose,
  npa,
  bulan,
  tahun,
  posLainLainName,
  onLunasClick,
  onRefresh,
}) => {
  const { token } = useAuth();

  const {
    dataIuran,
    setDataIuran,
    dataAnggota,
    posLainLainName: hookPosName,
    loading,
    refetch,
  } = useTagihan(npa, bulan, tahun, token);

  if (!isOpen) return null;

  const handleLunas = async (item) => {
    if (typeof onLunasClick === "function") {
      await onLunasClick(item);
      if (typeof refetch === "function") {
        await refetch();
      }
      if (typeof onRefresh === "function") {
        await onRefresh();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[90%] md:w-[800px] rounded-xl shadow-lg p-6 relative">
        {/* tombol close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg font-bold"
        >
          ✕
        </button>
        {/* scroll area */}
        <div className="overflow-y-auto p-4">
          <TagihanView
            dataIuran={dataIuran}
            dataAnggota={dataAnggota}
            posLainLainName={posLainLainName || hookPosName}
            loading={loading}
            onLunasClick={onLunasClick ? handleLunas : null}
          />
        </div>
      </div>
    </div>
  );
};

export default TagihanModal;
