"use client";
import React, { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
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
  { ssr: false }
);

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [category, setCategory] = useState("NON EVENT");
  const [namaEvent, setNamaEvent] = useState("");
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

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    handleResize();
    window.addEventListener("resize", handleResize);

    fetchGalleries();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(galleries.length / itemsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [galleries, currentPage]);

  const fetchGalleries = async () => {
    try {
      const data = await GlobalApi.getAllSidebarGallery();

      await Promise.all(
        data.map(async (gallery) => {
          if (gallery.photo) {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = `data:image/jpeg;base64,${gallery.photo}`;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          }
          return Promise.resolve();
        })
      );

      setGalleries(data);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
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
    setSelectedFile(null);

    setTimeout(() => {
      if (window.jQuery && window.jQuery('.note-editable').length) {
        window.jQuery('.note-editable').html(gallery.deskripsi);
      }
    }, 100);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDeskripsi("");
    setCategory("NON EVENT");
    setNamaEvent("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (window.jQuery && window.jQuery('.note-editable').length) {
      window.jQuery('.note-editable').html("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("deskripsi", deskripsi);
      formData.append("category", category);
      if (category === "EVENT") {
        formData.append("namaEvent", namaEvent);
      }
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      let newGallery;
      if (editingId) {
        const updateData = {
          category: category,
          deskripsi: deskripsi,
          namaEvent: category === "EVENT" ? namaEvent : undefined,
          photo: selectedFile,
        };

        newGallery = await GlobalApi.updateSidebarGallery(
          editingId,
          updateData
        );
        setGalleries((prevGalleries) =>
          prevGalleries.map((gallery) =>
            gallery.id === editingId ? newGallery : gallery
          )
        );
      } else {
        newGallery = await GlobalApi.createSidebarGallery({
          category: category,
          deskripsi: deskripsi,
          namaEvent: category === "EVENT" ? namaEvent : undefined,
          photo: selectedFile,
        });
        setGalleries((prevGalleries) => {
          const updatedGalleries = [...prevGalleries, newGallery];
          const newItemIndex = updatedGalleries.length - 1;
          const newItemPage = Math.floor(newItemIndex / itemsPerPage);
          setCurrentPage(newItemPage);
          return updatedGalleries;
        });
      }

      resetForm();

    } catch (error) {
      console.error("Error saving gallery:", error);
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (galleryToDelete) {
      try {
        await GlobalApi.deleteSidebarGallery(galleryToDelete.id);
        setGalleries((prevGalleries) => {
          const updatedGalleries = prevGalleries.filter(
            (gallery) => gallery.id !== galleryToDelete.id
          );
          const totalPages = Math.ceil(updatedGalleries.length / itemsPerPage);

          if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
          }

          return updatedGalleries;
        });
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting gallery:", error);
      }
    }
  };

  const handleDeleteClick = (gallery) => {
    setGalleryToDelete(gallery);
    setIsDeleteModalOpen(true);
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentItems = galleries
    .filter((gallery) => gallery.category === "NON EVENT")
    .slice(indexOfFirstItem, indexOfLastItem);
  const eventItems = galleries.filter(
    (gallery) => gallery.category === "EVENT"
  );
  const totalPages = Math.ceil(
    galleries.filter((gallery) => gallery.category === "NON EVENT").length /
    itemsPerPage
  );

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

  const PesertaModal = () => {
    if (!isPesertaModalOpen) return null;

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
            }
            th { background-color: #f2f2f2; font-weight: bold; }
            .print-header { margin-bottom: 20px; text-align: center; }
            .table-container { margin-bottom: 30px; }
            .footer { text-align: right; margin-top: 20px; }
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
                  <th>Nama</th>
                  <th>NPA</th>
                  <th>Cabang</th>
                  <th>Unit Kerja</th>
                  <th>Nomor HP</th>
                  <th>Jabatan Organisasi</th>
                </tr>
              </thead>
              <tbody>
                ${pesertaList
          .map(
            (peserta, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${peserta.namaLengkap}</td>
                    <td>${peserta.npa}</td>
                    <td>${peserta.cabang}</td>
                    <td>${peserta.unitKerja}</td>
                    <td>${peserta.nomorHp}</td>
                    <td>${peserta.jabatan}</td>
                  </tr>
                `
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
        frameDoc.focus();
        frameDoc.print();

        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[80%] max-h-[80vh] relative">
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
              <button
                onClick={handlePrint}
                className="bg-blue-500 text-white px-4 py-2 mr-3 rounded hover:bg-blue-600"
              >
                Cetak
              </button>
            </div>
            <div className="overflow-auto max-h-[60vh]">
              {isLoadingPeserta ? (
                <div className="flex justify-center items-center h-32">
                  <ClipLoader color="#1E40AF" size={40} />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pesertaList.length > 0 ? (
                      pesertaList.map((peserta, index) => (
                        <tr key={index} className="hover:bg-gray-50">
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
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
      const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);

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
            fragment.appendChild(document.createTextNode(parts[parts.length - 1]));
          }

          parent.replaceChild(fragment, textNode);
        }
      });

      return tempDiv.innerHTML;
    };

    const MAX_LENGTH = 200;
    const deskripsi = gallery.deskripsi || "";
    const isLong = deskripsi.length > MAX_LENGTH;
    const displayedText = expanded ? deskripsi : deskripsi.slice(0, MAX_LENGTH) + (isLong ? "..." : "");

    return (
      <div className="border p-4 rounded">
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
          {gallery.category === "EVENT" ? (
            <>
              <h3 className="text-center font-bold text-base mb-2">{gallery.namaEvent}</h3>
              <div className="text-sm text-gray-600 description-content">
                <span dangerouslySetInnerHTML={{ __html: parseHTML(displayedText) }} />
                {isLong && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 ml-2 hover:underline"
                  >
                    {expanded ? "Tampilkan lebih sedikit" : "Tampilkan lebih banyak"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600 description-content">
              <span dangerouslySetInnerHTML={{ __html: parseHTML(displayedText) }} />
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-500 ml-2 hover:underline"
                >
                  {expanded ? "Tampilkan lebih sedikit" : "Tampilkan lebih banyak"}
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
            className={`px-3 py-1 border rounded text-sm ${page - 1 === currentPage
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
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="w-full p-6">
            <div className="mt-10 mb-8">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full"
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="EVENT">EVENT</option>
                    <option value="NON EVENT">NON EVENT</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                {category === "EVENT" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nama Event
                    </label>
                    <input
                      type="text"
                      value={namaEvent}
                      onChange={(e) => setNamaEvent(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Keterangan
                  </label>
                  {/* Use the dynamic Summernote component */}
                  {typeof window !== "undefined" && (
                    <SummernoteEditor
                      value={deskripsi}
                      onChange={setDeskripsi}
                      height={300}
                    />
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Foto
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded"
                    accept="image/*"
                    required={!editingId}
                    ref={fileInputRef}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isLoading ? "Menyimpan..." : editingId ? "Update" : "Upload"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h2 className="text-xl font-bold mb-4">Galeri Kegiatan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((gallery) => (
                  <GalleryItem key={gallery.id} gallery={gallery} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full mt-8">
              <h2 className="text-xl font-bold mb-4">Event</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventItems.map((gallery) => (
                  <GalleryItem key={gallery.id} gallery={gallery} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full mt-8">
              <h2 className="text-xl font-bold mb-4">Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries
                  .filter((gallery) => gallery.category === "INFO")
                  .map((gallery) => (
                    <GalleryItem key={gallery.id} gallery={gallery} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal />
      <PesertaModal />
    </div>
  );
};

export default Page;