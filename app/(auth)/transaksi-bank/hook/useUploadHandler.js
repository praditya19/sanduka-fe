import { useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const useUploadHandler = ({
  setNotification,
  setShowUploadModal,
  handleFilter,
  getBalancingdata,
  handleCloseModalDelete,
}) => {
  const [formData, setFormData] = useState({
    file: null,
    namaFile: "",
    tanggalUntuk: "",
  });
  const [resetData, setResetData] = useState("");
  const [progress, setProgress] = useState(0);
  const [loader, setLoader] = useState(false);

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    setLoader(true);

    const uploadData = new FormData();
    uploadData.append("file", formData.file);
    uploadData.append("namaFile", formData.namaFile);
    uploadData.append("tanggalUntuk", formData.tanggalUntuk);

    try {
      const response = await GlobalApi.uploadSinkronBank(uploadData);
      const fullMessage = response || "";
      const shortMessage = fullMessage.split("Detail kegagalan:")[0].trim();

      const formattedMessage = shortMessage.replace(/\\n/g, "\n");

      setNotification({
        type: "success",
        message: formattedMessage,
      });

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoader(false);
            setShowUploadModal(false);
            setProgress(0);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      if (typeof handleFilter === "function") handleFilter();
      if (typeof getBalancingdata === "function") getBalancingdata();
    } catch (error) {
      console.error("Upload gagal:", error);
      setLoader(false);
      setNotification({
        type: "error",
        message: "Gagal Upload Data!",
      });
    }
  };
  const handleDeleteUpload = async (e) => {
    e.preventDefault();
    if (!resetData) return alert("Silakan pilih tanggal untuk reset data.");

    setLoader(true);
    setProgress(0);

    try {
      await GlobalApi.deleteTransaksiBank(resetData);
      setProgress(100);

      if (typeof handleCloseModalDelete === "function") {
        handleCloseModalDelete();
      }

      setResetData("");

      setNotification({
        type: "success",
        message: "Data berhasil direset!",
      });

      if (typeof handleFilter === "function") {
        handleFilter();
      }

      if (typeof getBalancingdata === "function") {
        getBalancingdata();
      }
    } catch (error) {
      console.error("Gagal reset data:", error);
      setNotification({
        type: "error",
        message: "Gagal hapus data.",
      });
    } finally {
      setLoader(false);
      setProgress(0);
    }
  };

 const handleDownloadTemplate = () => {
  try {
    // HEADER SESUAI TEMPLATE ASLI (huruf kecil semua)
    const headers = [
      "rekening",
      "nama anggota",
      "rekening kabupaten",
      "potongan",
      "type",
      "tanggal pemotongan",
      "transaksi",
    ];

    // contoh data sesuai format asli
    const sampleData = [
      [
        "3093077341",
        "NEVA VARIANA",
        "2015151695",
        33000,
        "Gaji",
        "02/06/2026",
        "Sukses",
      ],
    ];

    const data = [headers, ...sampleData];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // lebar kolom biar mirip excel asli
    worksheet["!cols"] = [
      { wch: 18 }, // rekening
      { wch: 30 }, // nama anggota
      { wch: 22 }, // rekening kabupaten
      { wch: 15 }, // potongan
      { wch: 10 }, // type
      { wch: 20 }, // tanggal
      { wch: 15 }, // transaksi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, "Template Upload Potongan Bank.xlsx");
  } catch (error) {
    console.error("Gagal membuat template:", error);
    setNotification({
      type: "error",
      message: "Gagal membuat template!",
    });
  }
};

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setResetData(e.target.value);
  };
  return {
    formData,
    resetData,
    progress,
    loader,
    setFormData,
    setResetData,
    setProgress,
    setLoader,
    handleSubmitUpload,
    handleDeleteUpload,
    handleInputChange,
    handleDownloadTemplate,
  };
};

export default useUploadHandler;
