"use client";
import React, { useState, useEffect } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
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

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const fetchGalleries = async () => {
    try {
      const data = await GlobalApi.getAllSidebarGallery();
      setGalleries(data);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        category,
        photo: selectedFile
      };

      if (editingId) {
        await GlobalApi.updateSidebarGallery(editingId, formData);
      } else {
        await GlobalApi.createSidebarGallery(formData);
      }

      setCategory("");
      setSelectedFile(null);
      setEditingId(null);
      fetchGalleries();
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await GlobalApi.deleteSidebarGallery(id);
        fetchGalleries();
      } catch (error) {
        console.error("Error deleting gallery:", error);
      }
    }
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentItems = galleries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(galleries.length / itemsPerPage);

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

        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <div className="w-full p-6">
            {/* Form */}
            <div className="mt-10 mb-8">
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full">
                {/* <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div> */}

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
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isLoading ? 'Menyimpan...' : editingId ? 'Update' : 'Upload'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full">
              <h2 className="text-xl font-bold mb-4">Galeri Kegiatan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((gallery) => (
                  <div key={gallery.id} className="border p-4 rounded">
                    {gallery.photo && (
                      <img
                        src={`data:image/jpeg;base64,${gallery.photo}`}
                        alt={gallery.category}
                        className="w-full h-48 object-cover mb-2 rounded"
                      />
                    )}
                    <p className="font-bold">{gallery.category}</p>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleEdit(gallery)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(gallery.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
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
    </div>
  );
};

export default Page;