"use client";
import React, { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faTrash,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faExclamationTriangle,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "@/app/_utils/GlobalApi";
import { ClipLoader } from "react-spinners";
import dynamic from "next/dynamic";

const SummernoteEditor = dynamic(
  () => {
    return Promise.all([
      import("jquery").then((mod) => mod.default),
      import("summernote/dist/summernote-lite.min.css"),
      import("summernote/dist/summernote-lite.min.js"),
    ]).then(([jQuery]) => {
      window.jQuery = jQuery;
      window.$ = jQuery;

      return ({ value, onChange, height }) => {
        const editorRef = useRef(null);

        useEffect(() => {
          const $ = window.jQuery;

          if ($ && editorRef.current) {
            $(editorRef.current).summernote({
              height: height || 300,
              callbacks: {
                onChange: function (contents) {
                  onChange(contents);
                },
              },
            });

            if (value) {
              $(editorRef.current).summernote("code", value);
            }

            return () => {
              $(editorRef.current).summernote("destroy");
            };
          } else {
            console.error("jQuery or editorRef is not available");
          }
        }, []);

        return <textarea ref={editorRef} />;
      };
    });
  },
  { ssr: false },
);

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-3xl"
          />
        );
      case "error":
        return (
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-red-500 text-3xl"
          />
        );
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimesCircle} size="lg" />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [galleries, setGalleries] = useState({
    NON_EVENT: [],
    EVENT: [],
    INFO: [],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [category, setCategory] = useState("NON EVENT");
  const [namaEvent, setNamaEvent] = useState("");
  const [statusEvent, setStatusEvent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const [isPesertaModalOpen, setIsPesertaModalOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const itemsPerPage = 6;
  const [notification, setNotification] = useState(null);
  const profileImageUrl = "/profile.png";
  const [fotoBase64, setFotoBase64] = useState(null);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    handleResize();
    window.addEventListener("resize", handleResize);

    fetchNonEventGalleries();
    fetchEventGalleries();
    fetchInfoGalleries();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(galleries.length / itemsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [galleries, currentPage]);

  const fetchNonEventGalleries = async () => {
    try {
      const nonEventGalleries =
        await GlobalApi.getSidebarGalleryByCategory("NON EVENT");

      await Promise.all(nonEventGalleries.map(preloadImage));

      setGalleries((prev) => ({
        ...prev,
        NON_EVENT: nonEventGalleries,
      }));
    } catch (error) {
      console.error("Error fetching NON EVENT galleries:", error);
      setNotification({
        type: "error",
        message: "Gagal mengambil data galeri NON EVENT. Silakan coba lagi.",
      });
    }
  };

  const fetchEventGalleries = async () => {
    try {
      const eventGalleries =
        await GlobalApi.getSidebarGalleryByCategory("EVENT");

      console.log(eventGalleries);

      await Promise.all(eventGalleries.map(preloadImage));

      setGalleries((prev) => ({
        ...prev,
        EVENT: eventGalleries,
      }));
    } catch (error) {
      console.error("Error fetching EVENT galleries:", error);
      setNotification({
        type: "error",
        message: "Gagal mengambil data galeri EVENT. Silakan coba lagi.",
      });
    }
  };

  const fetchInfoGalleries = async () => {
    try {
      const infoGalleries = await GlobalApi.getSidebarGalleryByCategory("INFO");

      await Promise.all(infoGalleries.map(preloadImage));

      setGalleries((prev) => ({
        ...prev,
        INFO: infoGalleries,
      }));
    } catch (error) {
      console.error("Error fetching INFO galleries:", error);
      setNotification({
        type: "error",
        message: "Gagal mengambil data galeri INFO. Silakan coba lagi.",
      });
    }
  };

  const preloadImage = (gallery) => {
    if (gallery.photo) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${gallery.photo}`;
        img.onload = resolve;
        img.onerror = resolve;
      });
    }
    return Promise.resolve();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleEdit = (gallery) => {
    setEditingId(gallery.id);
    setDeskripsi(gallery.deskripsi);
    setCategory(gallery.category);
    setNamaEvent(gallery.namaEvent || "");
    setStatusEvent(gallery.statusEvent || "");
    setSelectedFile(null);

    setTimeout(() => {
      if (window.jQuery && window.jQuery(".note-editable").length) {
        window.jQuery(".note-editable").html(gallery.deskripsi);
      }
    }, 100);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDeskripsi("");
    setCategory("NON EVENT");
    setNamaEvent("");
    setStatusEvent("Belum Terlaksana");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (window.jQuery && window.jQuery(".note-editable").length) {
      window.jQuery(".note-editable").html("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let newGallery;
      if (editingId) {
        newGallery = await GlobalApi.updateSidebarGallery(editingId, {
          category: category,
          deskripsi: deskripsi,
          namaEvent: category === "EVENT" ? namaEvent : undefined,
          photo: selectedFile,
        });

        setGalleries((prev) => ({
          ...prev,
          [category.replace(" ", "_")]: prev[category.replace(" ", "_")].map(
            (gallery) => (gallery.id === editingId ? newGallery : gallery),
          ),
        }));
      } else {
        newGallery = await GlobalApi.createSidebarGallery({
          category: category,
          deskripsi: deskripsi,
          namaEvent: category === "EVENT" ? namaEvent : undefined,
          photo: selectedFile,
        });

        setGalleries((prev) => {
          const categoryKey = category.replace(" ", "_");
          const updatedCategoryGalleries = [...prev[categoryKey], newGallery];

          return {
            ...prev,
            [categoryKey]: updatedCategoryGalleries,
          };
        });

        if (category === "NON EVENT") {
          const newItemIndex = galleries.NON_EVENT.length;
          const newItemPage = Math.floor(newItemIndex / itemsPerPage);
          setCurrentPage(newItemPage);
        }
      }

      resetForm();
      setNotification({
        type: "success",
        message: editingId
          ? "Data berhasil diperbarui!"
          : "Data berhasil ditambahkan!",
      });
    } catch (error) {
      console.error("Error saving gallery:", error);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (galleryToDelete) {
      try {
        await GlobalApi.deleteSidebarGallery(galleryToDelete.id);

        setGalleries((prev) => {
          const categoryKey = galleryToDelete.category.replace(" ", "_");
          const updatedCategoryGalleries = prev[categoryKey].filter(
            (gallery) => gallery.id !== galleryToDelete.id,
          );

          const totalPages = Math.ceil(
            updatedCategoryGalleries.length / itemsPerPage,
          );

          if (
            categoryKey === "NON_EVENT" &&
            currentPage >= totalPages &&
            totalPages > 0
          ) {
            setCurrentPage(totalPages - 1);
          }

          return {
            ...prev,
            [categoryKey]: updatedCategoryGalleries,
          };
        });

        setIsDeleteModalOpen(false);
        setNotification({
          type: "success",
          message: "Data berhasil dihapus!",
        });
      } catch (error) {
        console.error("Error deleting gallery:", error);
        setNotification({
          type: "error",
          message: "Gagal menghapus data. Silakan coba lagi.",
        });
      }
    }
  };

  const handleDeleteClick = (gallery) => {
    setGalleryToDelete(gallery);
    setIsDeleteModalOpen(true);
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentItems = galleries.NON_EVENT.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const totalPages = Math.ceil(galleries.NON_EVENT.length / itemsPerPage);

  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-96 relative">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTimesCircle} size="lg" />
          </button>
          <div className="p-6 text-center">
            <h2 className="text-lg font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-6">Apa Anda yakin ingin menghapus foto ini?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Ya
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handlePesertaClick = async (gallery) => {
    setSelectedEvent(gallery);
    setIsPesertaModalOpen(true);
    setIsLoadingPeserta(true);

    try {
      const queryString = `namaEvent=${encodeURIComponent(gallery.namaEvent)}`;
      const data = await GlobalApi.getAllPeserta(queryString);
      setPesertaList(data);
    } catch (error) {
      console.error("Error fetching peserta:", error);
    } finally {
      setIsLoadingPeserta(false);
    }
  };

  const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
        <div className="bg-white rounded-lg shadow-xl w-96 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTimesCircle} size="lg" />
          </button>
          <div className="p-6 text-center">
            <h2 className="text-lg font-bold mb-4">{title}</h2>
            <p className="mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Ya
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PesertaModal = () => {
    if (!isPesertaModalOpen) return null;

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
      isOpen: false,
      id: null,
    });

    const openConfirmDialog = (id) => {
      setConfirmDialog({
        isOpen: true,
        id: id,
      });
    };

    const closeConfirmDialog = () => {
      setConfirmDialog({
        isOpen: false,
        id: null,
      });
    };

    const handleFileDownload = (upload, namaEvent, namaPeserta) => {
      if (!upload) {
        alert("File tidak tersedia");
        return;
      }

      try {
        const byteCharacters = atob(upload);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        let mimeType = "application/octet-stream";
        let fileExtension = ".bin";

        if (
          byteArray[0] === 0x25 &&
          byteArray[1] === 0x50 &&
          byteArray[2] === 0x44 &&
          byteArray[3] === 0x46
        ) {
          mimeType = "application/pdf";
          fileExtension = ".pdf";
        } else if (byteArray[0] === 0xff && byteArray[1] === 0xd8) {
          mimeType = "image/jpeg";
          fileExtension = ".jpg";
        } else if (
          byteArray[0] === 0x89 &&
          byteArray[1] === 0x50 &&
          byteArray[2] === 0x4e &&
          byteArray[3] === 0x47
        ) {
          mimeType = "image/png";
          fileExtension = ".png";
        }

        const blob = new Blob([byteArray], { type: mimeType });

        const fileName = `Dokumen ${namaEvent} - ${namaPeserta}${fileExtension}`;

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert("Gagal mengunduh file. Format file mungkin tidak valid.");
      }
    };

    const isImageFile = (byteArray) => {
      if (byteArray[0] === 0xff && byteArray[1] === 0xd8) {
        return true;
      }
      if (
        byteArray[0] === 0x89 &&
        byteArray[1] === 0x50 &&
        byteArray[2] === 0x4e &&
        byteArray[3] === 0x47
      ) {
        return true;
      }
      return false;
    };

    const isPdfFile = (byteArray) => {
      return (
        byteArray[0] === 0x25 &&
        byteArray[1] === 0x50 &&
        byteArray[2] === 0x44 &&
        byteArray[3] === 0x46
      );
    };

    const getFileMimeType = (byteArray) => {
      if (isPdfFile(byteArray)) return "application/pdf";
      if (byteArray[0] === 0xff && byteArray[1] === 0xd8) return "image/jpeg";
      if (
        byteArray[0] === 0x89 &&
        byteArray[1] === 0x50 &&
        byteArray[2] === 0x4e &&
        byteArray[3] === 0x47
      )
        return "image/png";
      return "application/octet-stream";
    };

    const getFileDataUri = (upload) => {
      if (!upload) return null;

      try {
        const byteCharacters = atob(upload);
        const byteArray = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const mimeType = getFileMimeType(byteArray);

        let binary = "";
        const bytes = new Uint8Array(byteArray);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = window.btoa(binary);

        return `data:${mimeType};base64,${base64Data}`;
      } catch (error) {
        console.error("Error creating data URI:", error);
        return null;
      }
    };

    const handlePrint = () => {
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";

      document.body.appendChild(printFrame);

      const eventName = selectedEvent?.namaEvent || "Event";

      const participantsWithFiles = pesertaList.map((peserta) => {
        let fileHtml = "<span>Tidak ada</span>";

        if (peserta.upload) {
          try {
            const byteCharacters = atob(peserta.upload);
            const byteArray = new Uint8Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const mimeType = getFileMimeType(byteArray);
            const base64Data = peserta.upload;
            const dataUri = `data:${mimeType};base64,${base64Data}`;

            if (isImageFile(byteArray)) {
              fileHtml = `
                <div style="text-align: center;">
                  <img src="${dataUri}" style="max-width: 120px; max-height: 120px; display: block; margin: 0 auto;" />
                </div>
              `;
            } else if (isPdfFile(byteArray)) {
              fileHtml = `
                <div style="text-align: center;">
                  <div style="border: 1px solid #ccc; padding: 5px; width: 80px; height: 100px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <span style="color: #cc0000; font-weight: bold;">PDF</span>
                  </div>
                </div>
              `;
            } else {
              fileHtml = `
                <div style="text-align: center; border: 1px solid #ccc; padding: 5px; width: 80px; height: 100px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <span style="font-weight: bold;">File</span>
                </div>
              `;
            }
          } catch (error) {
            console.error("Error processing file for PDF embedding:", error);
            fileHtml = "<span>Tersedia (Error)</span>";
          }
        }

        let photoHtml = "";
        if (peserta.foto) {
          photoHtml = `
            <div style="text-align: center;">
              <img src="data:image/jpeg;base64,${peserta.foto}" style="max-width: 120px; max-height: 120px; display: block; margin: 0 auto;" />
            </div>
          `;
        } else {
          photoHtml = `
            <div style="text-align: center;">
              <img src="${profileImageUrl}" style="max-width: 80px; max-height: 80px; display: block; margin: 0 auto;" />
            </div>
          `;
        }

        return { ...peserta, fileHtml, photoHtml };
      });

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Daftar Peserta - ${eventName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { 
              padding: 8px; 
              text-align: left; 
              border: 1px solid #000; 
              vertical-align: middle;
            }
            th { background-color: #f2f2f2; font-weight: bold; }
            .print-header { margin-bottom: 20px; text-align: center; }
            .table-container { margin-bottom: 30px; }
            .footer { text-align: right; margin-top: 20px; }
            td.file-cell, td.photo-cell { 
              padding: 10px; 
              text-align: center; 
              width: 140px; 
            }
            @media print {
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Daftar Peserta - ${eventName}</h1>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>NPA</th>
                  <th>Cabang</th>
                  <th>Unit Kerja</th>
                  <th>Nomor HP</th>
                  <th>Jabatan Organisasi</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                ${participantsWithFiles
                  .map(
                    (peserta, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td class="photo-cell">${peserta.photoHtml}</td>
                        <td>${peserta.namaLengkap}</td>
                        <td>${peserta.npa}</td>
                        <td>${peserta.cabang}</td>
                        <td>${peserta.unitKerja}</td>
                        <td>${peserta.nomorHp}</td>
                        <td>${peserta.jabatan}</td>
                        <td class="file-cell">${peserta.fileHtml}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>Total Peserta: ${pesertaList.length}</p>
          </div>
        </body>
        </html>
      `;

      const frameDoc =
        printFrame.contentWindow ||
        printFrame.contentDocument.document ||
        printFrame.contentDocument;
      frameDoc.document.open();
      frameDoc.document.write(printContent);
      frameDoc.document.close();

      setTimeout(() => {
        try {
          frameDoc.focus();
          frameDoc.print();
        } catch (error) {
          console.error("Error printing:", error);
          alert("Terjadi kesalahan saat mencetak PDF. Silakan coba lagi.");
        }

        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 1000);
    };

    const exportToExcel = async () => {
      try {
        const XLSX = await import("xlsx");

        const eventName = selectedEvent?.namaEvent || "Event";

        const wb = XLSX.utils.book_new();

        const mainData = pesertaList.map((peserta, index) => {
          return {
            No: index + 1,
            Foto: peserta.foto ? "Tersedia" : "Tidak ada",
            Nama: peserta.namaLengkap,
            NPA: peserta.npa,
            Cabang: peserta.cabang,
            "Unit Kerja": peserta.unitKerja,
            "Nomor HP": peserta.nomorHp,
            "Jabatan Organisasi": peserta.jabatan,
            File: peserta.upload ? "Tersedia" : "Tidak ada",
          };
        });

        const ws = XLSX.utils.json_to_sheet(mainData);
        const columnWidths = [
          { wch: 5 }, // No
          { wch: 10 }, // Foto
          { wch: 30 }, // Nama
          { wch: 15 }, // NPA
          { wch: 20 }, // Cabang
          { wch: 25 }, // Unit Kerja
          { wch: 15 }, // Nomor HP
          { wch: 25 }, // Jabatan Organisasi
          { wch: 15 }, // File
        ];
        ws["!cols"] = columnWidths;
        XLSX.utils.book_append_sheet(wb, ws, "Daftar Peserta");

        XLSX.writeFile(wb, `Daftar Peserta - ${eventName}.xlsx`);
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Gagal mengekspor ke Excel. Silakan coba lagi.");
      }
    };

    const handleDeletePeserta = async (id) => {
      setIsDeleting(true);
      setDeleteId(id);

      try {
        await GlobalApi.deletePeserta(id);
        setPesertaList(pesertaList.filter((peserta) => peserta.id !== id));

        setNotification({
          type: "success",
          message: "Peserta berhasil dihapus!",
        });
      } catch (error) {
        console.error("Error deleting peserta:", error);
        setNotification({
          type: "error",
          message: "Gagal menghapus peserta. Silakan coba lagi.",
        });
      } finally {
        setIsDeleting(false);
        setDeleteId(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[90%] max-h-[80vh] relative">
          <button
            onClick={() => setIsPesertaModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTimesCircle} size="lg" />
          </button>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Daftar Peserta - {selectedEvent?.namaEvent}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Download Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Download PDF
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[60vh]">
              {isLoadingPeserta ? (
                <div className="flex justify-center items-center h-32">
                  <ClipLoader color="#1E40AF" size={40} />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Foto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cabang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Kerja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nomor HP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jabatan Organisasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pesertaList.length > 0 ? (
                      pesertaList.map((peserta, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.foto ? (
                              <div className="h-16 w-16 relative overflow-hidden rounded-full">
                                <img
                                  src={`data:image/jpeg;base64,${peserta.foto}`}
                                  alt={`Foto ${peserta.namaLengkap}`}
                                  className="w-full h-full rounded-full object-cover object-top"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 relative overflow-hidden rounded-full">
                                <img
                                  src={profileImageUrl}
                                  alt="Foto User"
                                  className="w-full h-full rounded-full object-cover object-top"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.namaLengkap}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.npa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.cabang}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.unitKerja}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.nomorHp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.jabatan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {peserta.upload ? (
                              <button
                                onClick={() =>
                                  handleFileDownload(
                                    peserta.upload,
                                    selectedEvent.namaEvent,
                                    peserta.namaLengkap,
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                              >
                                <div className="flex items-center">
                                  <FontAwesomeIcon
                                    icon={faDownload}
                                    className="mr-1"
                                  />
                                  <span>Unduh</span>
                                </div>
                              </button>
                            ) : (
                              <span className="text-gray-500">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button
                              onClick={() => openConfirmDialog(peserta.id)}
                              disabled={isDeleting && deleteId === peserta.id}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                              title="Hapus Peserta"
                            >
                              {isDeleting && deleteId === peserta.id ? (
                                <ClipLoader color="#FF0000" size={16} />
                              ) : (
                                <FontAwesomeIcon icon={faTrash} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Tidak ada data peserta
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Custom Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={closeConfirmDialog}
          onConfirm={() => {
            handleDeletePeserta(confirmDialog.id);
            closeConfirmDialog();
          }}
          title="Konfirmasi Hapus"
          message="Apakah Anda yakin ingin menghapus peserta ini?"
        />
      </div>
    );
  };

  const GalleryItem = ({ gallery }) => {
    const [expanded, setExpanded] = useState(false);

    const parseHTML = (htmlContent) => {
      if (!htmlContent) return "";

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;

      const textNodes = [];
      const walk = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false,
      );

      let node;
      while ((node = walk.nextNode())) {
        textNodes.push(node);
      }

      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

      textNodes.forEach((textNode) => {
        const parent = textNode.parentNode;
        if (parent.nodeName.toLowerCase() === "a") return;

        const content = textNode.textContent;
        const parts = content.split(urlRegex);

        if (parts.length > 1) {
          const fragment = document.createDocumentFragment();
          let i = 0;

          content.replace(urlRegex, (url) => {
            if (parts[i]) {
              fragment.appendChild(document.createTextNode(parts[i]));
            }
            i += 3;

            const href = url.startsWith("www.") ? `https://${url}` : url;
            const link = document.createElement("a");
            link.href = href;
            link.textContent = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "text-blue-600 hover:underline";
            fragment.appendChild(link);

            return url;
          });

          if (parts[parts.length - 1]) {
            fragment.appendChild(
              document.createTextNode(parts[parts.length - 1]),
            );
          }

          parent.replaceChild(fragment, textNode);
        }
      });

      return tempDiv.innerHTML;
    };

    const MAX_LENGTH = 200;
    const deskripsi = gallery.deskripsi || "";
    const isLong = deskripsi.length > MAX_LENGTH;
    const displayedText = expanded
      ? deskripsi
      : deskripsi.slice(0, MAX_LENGTH) + (isLong ? "..." : "");

    return (
      <div className="border p-4 rounded relative">
        {gallery.photo && (
          <div className="relative w-full h-48 mb-2">
            <img
              src={`data:image/jpeg;base64,${gallery.photo}`}
              alt={deskripsi}
              className="absolute inset-0 w-full h-full object-cover rounded"
              loading="eager"
              decoding="sync"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          </div>
        )}

        <div className="mb-3">
          {/* Badge */}

          {gallery.category === "EVENT" && (
            <span
              className={`absolute z-40 top-2 right-2 px-2 py-1 text-xs font-semibold rounded text-white ${
                gallery.isTerlewat ? "bg-green-500" : "bg-yellow-500"
              }`}
            >
              {gallery.isTerlewat ? "Sudah terlaksana" : "Belum terlaksana"}
            </span>
          )}
          {gallery.category === "EVENT" ? (
            <>
              <h3 className="text-center font-bold text-base mb-2">
                {gallery.namaEvent}
              </h3>
              <div className="text-sm text-gray-600 description-content">
                <span
                  dangerouslySetInnerHTML={{
                    __html: parseHTML(displayedText),
                  }}
                />
                {isLong && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 ml-2 hover:underline"
                  >
                    {expanded
                      ? "Tampilkan lebih sedikit"
                      : "Tampilkan lebih banyak"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600 description-content">
              <span
                dangerouslySetInnerHTML={{
                  __html: parseHTML(displayedText),
                }}
              />
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-500 ml-2 hover:underline"
                >
                  {expanded
                    ? "Tampilkan lebih sedikit"
                    : "Tampilkan lebih banyak"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 space-x-2">
          <button
            onClick={() => handleEdit(gallery)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(gallery)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Hapus
          </button>
          {gallery.category === "EVENT" && (
            <button
              onClick={() => handlePesertaClick(gallery)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Peserta
            </button>
          )}
        </div>
      </div>
    );
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
      const pages = [];
      const maxVisiblePages = 4;
      let startPage = Math.max(1, currentPage);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4 gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Prev
        </button>

        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page - 1)}
            className={`px-3 py-1 border rounded text-sm ${
              page - 1 === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            onPageChange(Math.min(currentPage + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="w-full py-14 p-4">
            {/* Form Section */}
            <div className="mb-10">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                  <h2 className="text-xl font-semibold text-white">
                    {editingId ? "Edit Galeri" : "Tambah Galeri Baru"}
                  </h2>
                </div>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="p-6 space-y-6"
                >
                  {/* Kategori & Nama Event - 1 Baris */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-700"
                        required
                      >
                        <option value="EVENT">📅 EVENT</option>
                        <option value="NON EVENT">📋 NON EVENT</option>
                        <option value="INFO">ℹ️ INFO</option>
                      </select>
                    </div>

                    {/* Nama Event - Conditional */}
                    {category === "EVENT" && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={statusEvent}
                          onChange={(e) =>
                            setStatusEvent(e.target.value === "true")
                          }
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-700"
                          required
                        >
                          <option value="false">Belum Terlaksana</option>
                          <option value="true">Sudah Terlaksana</option>
                        </select>
                      </div>
                    )}

                    {category === "EVENT" && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Event <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={namaEvent}
                          onChange={(e) => setNamaEvent(e.target.value)}
                          placeholder="Masukkan nama event"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-700"
                          required
                        />
                      </div>
                    )}

                    {/* Jika kategori bukan EVENT, tampilkan placeholder kosong untuk menjaga layout */}
                    {category !== "EVENT" && (
                      <div className="hidden md:block"></div>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Keterangan <span className="text-red-500">*</span>
                    </label>
                    {typeof window !== "undefined" && (
                      <SummernoteEditor
                        value={deskripsi}
                        onChange={setDeskripsi}
                        height={300}
                      />
                    )}
                  </div>

                  {/* Foto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Foto{" "}
                      {!editingId && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*"
                        required={!editingId}
                        ref={fileInputRef}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Format: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : editingId ? (
                        "🔄 Update"
                      ) : (
                        "📤 Upload"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200"
                    >
                      ❌ Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Gallery Sections */}
            <div className="space-y-10">
              {/* All Gallery */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">🖼️</span> Galeri Kegiatan
                    <span className="ml-3 text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                      {currentItems.length} item
                    </span>
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentItems.map((gallery) => (
                      <GalleryItem key={gallery.id} gallery={gallery} />
                    ))}
                  </div>

                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </div>

              {/* Event Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">📅</span> Event
                    <span className="ml-3 text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                      {galleries.EVENT.length} item
                    </span>
                  </h2>
                </div>

                <div className="p-6">
                  {galleries.EVENT.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {galleries.EVENT.map((gallery) => (
                        <GalleryItem key={gallery.id} gallery={gallery} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">📭 Belum ada event</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">ℹ️</span> Info
                    <span className="ml-3 text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                      {galleries.INFO.length} item
                    </span>
                  </h2>
                </div>

                <div className="p-6">
                  {galleries.INFO.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {galleries.INFO.map((gallery) => (
                        <GalleryItem key={gallery.id} gallery={gallery} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">📭 Belum ada info</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal />
      <PesertaModal />
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Page;
