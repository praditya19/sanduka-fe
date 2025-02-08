"use client";
import React, { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "@/app/_utils/GlobalApi";
import { ClipLoader } from "react-spinners";

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const fileInputRef = useRef(null);
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

  const compressImage = async (file, maxSizeKB = 50) => {
    const maxFileSizeBytes = maxSizeKB * 1024;

    const img = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let quality = 0.8;
    let scale = 1;

    while (true) {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      );

      if (blob.size <= maxFileSizeBytes) {
        return new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      }

      if (quality > 0.1) {
        quality -= 0.1;
      } else {
        scale *= 0.9;
      }
    }
  };

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
    } catch (error) {
      console.error('Image compression failed', error);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        category: category,
        photo: selectedFile
      };

      let newGallery;
      if (editingId) {
        newGallery = await GlobalApi.updateSidebarGallery(editingId, formData);
        setGalleries(prevGalleries =>
          prevGalleries.map(gallery =>
            gallery.id === editingId ? newGallery : gallery
          )
        );
      } else {
        newGallery = await GlobalApi.createSidebarGallery(formData);
        setGalleries(prevGalleries => [...prevGalleries, newGallery]);
      }

      setSelectedFile(null);
      setCategory("");
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error saving gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (gallery) => {
    setEditingId(gallery.id);
    setCategory(gallery.category);
  };

  const confirmDelete = async () => {
    if (galleryToDelete) {
      try {
        await GlobalApi.deleteSidebarGallery(galleryToDelete.id);
        setGalleries(galleries.filter(gallery => gallery.id !== galleryToDelete.id));
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
  const currentItems = galleries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(galleries.length / itemsPerPage);

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

  const GalleryItem = ({ gallery }) => (
    <div className="border p-4 rounded">
      {gallery.photo && (
        <div className="relative w-full h-48 mb-2">
          <img
            src={`data:image/jpeg;base64,${gallery.photo}`}
            alt={gallery.category}
            className="absolute inset-0 w-full h-full object-cover rounded"
            loading="eager"
            decoding="sync"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
      )}
      <div className="text-sm text-gray-600 mb-2">
        {gallery.category}
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
      </div>
    </div>
  );

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
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
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
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full"
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isLoading ? "Menyimpan..." : editingId ? "Update" : "Upload"}
                </button>
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
          </div>
        </div>
      </div>

      <DeleteConfirmationModal />
    </div>
  );
};

export default Page;