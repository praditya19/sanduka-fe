"use client";
import React, { useState, useEffect, useRef } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "react-modal";

const SyncData = () => {
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateType, setTemplateType] = useState("");
  const [data, setData] = useState([]);
  const tableRef = useRef();
  const [formData, setFormData] = useState({
    file: null,
    category: "",
  });
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [displayedPages, setDisplayedPages] = useState([1, 2, 3]);
  const [visiblePages, setVisiblePages] = useState([1, 2, 3]);
  const totalData = data.length;
  const [role, setRole] = useState("");
  const [filteredTotalFiles, setFilteredTotalFiles] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");

    if (storedRole === "ADMIN" && storedCabang) {
      setSelectedCabang(storedCabang);
      filterUnitKerjaForCabang(storedCabang);
    }
  }, []);

  const filterUnitKerjaForCabang = (cabang) => {
    const filtered = unitKerjaList.filter(
      (unitKerja) => unitKerja.cabang.toLowerCase() === cabang.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(totalData / itemsPerPage));
  }, [totalData]);

  useEffect(() => {
    updateVisiblePages(currentPage);
  }, [currentPage, totalPages]);

  const updateVisiblePages = (current) => {
    if (current === 1) {
      setVisiblePages([1, 2, 3].filter((page) => page <= totalPages));
    } else if (current === totalPages) {
      setVisiblePages(
        [current - 2, current - 1, current].filter((page) => page > 0)
      );
    } else {
      setVisiblePages(
        [current - 1, current, current + 1].filter(
          (page) => page > 0 && page <= totalPages
        )
      );
    }
  };

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      filterUnitKerjaForCabang(selectedCabang);
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    // Only allow cabang selection if not ADMIN
    if (role !== "ADMIN") {
      setFilteredCabangList(originalCabangList);
      setShowCabangDropdown(true);
    }
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);

    if (selectedCabang) {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
          unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
      setShowUnitKerjaDropdown(true);
    }
  };

  useEffect(() => {
    if (selectedCabang) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      filterUnitKerjaForCabang(selectedCabang);
      setCurrentPage(1);
    }
  }, [selectedCabang]);

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);

    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }

    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    setSelectedUnitKerja("");
    setUnitKerjaInput("");
  }, [selectedCabang]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredData = data.filter((item) => {
    // For ADMIN users
    if (role === "ADMIN") {
      const cabangMatch = item.cabang === selectedCabang;
      const unitKerjaMatch = selectedUnitKerja
        ? item.unitKerja.toLowerCase() === selectedUnitKerja.toLowerCase()
        : true;
      return cabangMatch && unitKerjaMatch;
    }

    // For other roles
    const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
    const unitKerjaMatch = selectedUnitKerja
      ? item.unitKerja.toLowerCase() === selectedUnitKerja.toLowerCase()
      : true;
    return cabangMatch && unitKerjaMatch;
  });

  const paginatedData = paginateData(filteredData);

  useEffect(() => {
    // Update total pages whenever filtered data changes
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCabang, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GlobalApi.getAllFiles();
        setData(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));

        const uniqueCabang = [...new Set(result.map((item) => item.cabang))];
        setCabangList(
          uniqueCabang.map((cabang, id) => ({ id, kecamatan: cabang }))
        );
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchData();
  }, [itemsPerPage]);

  const fetchTotalFiles = async () => {
    try {
      const result = await GlobalApi.getAllTotalData();
      setFilteredTotalFiles(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalFiles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handlePrint = () => {
    const printContents = tableRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setProgress(0);
    setIsUploading(true);

    let fileToSend = formData.file;

    const submissionCabang =
      role === "ADMIN" ? sessionStorage.getItem("cabang") : formData.cabang;

    if (
      fileToSend &&
      (fileToSend.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileToSend.type === "application/vnd.ms-excel")
    ) {
      const dataToSend = new FormData();
      dataToSend.append("file", fileToSend);
      dataToSend.append("category", formData.category);
      dataToSend.append("cabang", submissionCabang);
      dataToSend.append("unitKerja", formData.unitKerja);
      dataToSend.append("namaAnggota", formData.namaLengkap);
      dataToSend.append("npaNip", formData.npaNip);
      dataToSend.append("nomorHp", formData.nomorHp);
      dataToSend.append("dataSanduka", formData.dataSanduka);
      dataToSend.append("dataKtaDigital", formData.dataKtaDigital);
      dataToSend.append("dataDaspen", formData.dataDaspen);
      dataToSend.append("verifikasi", formData.verifikasi);

      try {
        const response = await GlobalApi.uploadFile(dataToSend);
        toast.success(
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "150px",
                height: "150px",
                color: "#06D001",
                marginBottom: "16px",
                marginTop: "14px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <h3
              style={{
                fontSize: "2rem",
                display: "block",
                marginBottom: "28px",
              }}
            >
              File Berhasil Dikirim!
            </h3>
          </div>,
          {
            icon: null,
            duration: 4000,
            style: {
              marginTop: "12%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "450px",
              height: "50%",
              maxHeight: "400px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 9999,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          }
        );
      } catch (error) {
        setIsUploading(false);
        toast.error(
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "150px",
                height: "150px",
                color: "#D0011B",
                marginBottom: "16px",
                marginTop: "14px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <h3
              style={{
                fontSize: "2rem",
                display: "block",
                marginBottom: "28px",
              }}
            >
              File Gagal Dikirim!
            </h3>
          </div>,
          {
            icon: null,
            duration: 4000,
            style: {
              marginTop: "12%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "450px",
              height: "50%",
              maxHeight: "400px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 9999,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          }
        );
        console.error(
          "Error submitting data:",
          error.response?.data || error.message
        );
      }
    } else {
      toast.error("Format file tidak sesuai. Harap unggah file Excel!", {
        duration: 3000,
        style: {
          fontSize: "1rem",
          backgroundColor: "#D0011B",
          color: "#fff",
        },
      });
    }

    setLoader(false);
  };

  const getProgressFile = async () => {
    try {
      const response = await GlobalApi.getProgressFile();
      return Number(response) || 0;
    } catch (error) {
      return 0;
    }
  };

  useEffect(() => {
    let intervalId;

    if (isUploading) {
      intervalId = setInterval(async () => {
        const currentProgress = await getProgressFile();
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          setIsUploading(false);
          setIsModalOpen(false);
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isUploading]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowModal(false);
    setSelectedTemplate(null);
  };

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderTableBody = () => {
    return (
      <tbody className="text-center">
        {paginatedData.map((item, index) => {
          const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
          return (
            <tr
              key={item.id || index}
              className={`bg-white border-b ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-200 transition duration-150`}
            >
              <td className="py-4 px-6">{actualIndex}</td>
              <td className="py-4 px-6">{item.cabang}</td>
              <td className="py-4 px-6">{item.unitKerja}</td>
              {!isMobile && (
                <>
                  <td className="py-4 px-6">{item.namaAnggota}</td>
                  <td className="py-4 px-6">{item.npa ? item.npa : "-"}</td>
                  <td className="py-4 px-6">{item.nip}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2 py-1 rounded ${
                        item.dataKtaDigital
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.dataKtaDigital ? "YES" : "NO"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2 py-1 rounded ${
                        item.dataDaspen
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.dataDaspen ? "YES" : "NO"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {item.verifikasi === null ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        Belum Sinkronisasi
                      </span>
                    ) : item.verifikasi === true ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Sudah Sinkronisasi
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        window.open(`https://wa.me/${item.nomorHp}`, "_blank")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                    </button>
                  </td>
                  <td>
                    <Button
                      className="bg-red-500 p-2 border rounded-md"
                      title="Hapus"
                      type="button"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <FaTrash className="w-4 h-4" />
                    </Button>
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    );
  };

  useEffect(() => {
    updateDisplayedPages(currentPage);
  }, [currentPage]);

  const updateDisplayedPages = (current) => {
    let pages = [];
    if (current <= 2) {
      pages = [1, 2, 3];
    } else if (current >= totalPages - 1) {
      pages = [totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [current - 1, current, current + 1];
    }
    pages = pages.filter((page) => page > 0 && page <= totalPages);
    setDisplayedPages(pages);
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded-md ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Last
        </button>
      </div>
    );
  };

  const handleDeleteClick = async (id) => {
    try {
      if (!id) {
        toast.error(
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "48px",
                height: "48px",
                color: "red",
                marginBottom: "16px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
              <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
            </svg>
            <strong
              style={{
                fontSize: "1.75rem",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Id tidak ditemukan.
            </strong>
          </div>,
          {
            icon: null,
            duration: 2000,
            style: {
              marginTop: "16%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "700px",
              height: "50%",
              maxHeight: "400px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 9999,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          }
        );
        return;
      }

      const result = await GlobalApi.deleteFiles(id);

      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            File Berhasil Dihapus!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 3000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );

      setTimeout(() => {
        window.location.reload();
      }, 3000);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
    } catch (error) {
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "48px",
              height: "48px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menghapus Data.
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 3000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleDownloadTemplate = () => {
    if (selectedTemplate) {
      downloadTemplate(selectedTemplate);
    }
    closeModal();
  };

  const downloadTemplate = (template) => {
    if (template === "daspen") {
      window.open(
        "https://docs.google.com/spreadsheets/d/19YgMVfGCOq4iK4vNzGTpr3ezPVrsKROb/edit?usp=sharing&ouid=104657245264175519758&rtpof=true&sd=true",
        "_blank"
      );
    } else if (template === "kta") {
      window.open(
        "https://docs.google.com/spreadsheets/d/1WGxbFRHjtAGxhSC77OEdyXTYAs8R98F6/edit?usp=sharing&ouid=104657245264175519758&rtpof=true&sd=true",
        "_blank"
      );
    } else {
      console.error("Template tidak ditemukan.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "white",
              color: "black",
            },
          },
        }}
      />
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Sinkronsisasi</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderMenu />
      )}
      <div>
        <div>
          <div className="min-h-screen flex-grow bg-gray-50 py-10 pt-16">
            {isModalOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black opacity-50 z-40"
                  onClick={handleCloseModal}
                ></div>
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white shadow-lg rounded-lg p-6 w-11/12 md:w-1/2 relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500"
                      onClick={handleCloseModal}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold mb-4">Upload Data</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Upload File
                        </label>
                        <input
                          type="file"
                          name="file"
                          onChange={handleInputChange}
                          className="block w-full mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Kategori
                        </label>
                        <select
                          className="form-select block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                          name="category"
                          onChange={handleInputChange}
                        >
                          <option value="">-- Pilih Kategori --</option>
                          <option value="DASPEN">Daspen </option>
                          <option value="KTA_DIGITAL"> KTA Digital</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                          disabled={loader}
                        >
                          {loader ? `Uploading... ${progress}%` : "Submit"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
              {/* Filter Section */}
              <div className="flex flex-wrap w-full md:w-auto space-x-4">
                {/* Filter Cabang */}
                <div
                  className="flex flex-col relative w-full md:w-auto"
                  ref={cabangRef}
                >
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={handleCabangClick}
                    className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                      role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="Pilih Cabang"
                    disabled={role === "ADMIN"}
                  />
                  {showCabangDropdown && role !== "ADMIN" && (
                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <Input
                            type="text"
                            onChange={(e) => handleCabangSearch(e.target.value)}
                            className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                            placeholder="Cari atau ketik Cabang..."
                            autoFocus
                          />
                        </li>
                        <li
                          onClick={() => handleSelectCabang({ kecamatan: "" })}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          Pilih Cabang
                        </li>
                        {filteredCabangList.map((cabang) => (
                          <li
                            key={cabang.id}
                            onClick={() => handleSelectCabang(cabang)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          >
                            {cabang.kecamatan}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Filter Unit Kerja */}
                <div
                  className="flex flex-col relative w-full md:w-auto"
                  ref={unitKerjaRef}
                >
                  <Input
                    type="text"
                    value={unitKerjaInput}
                    onChange={handleUnitKerjaChange}
                    onFocus={handleUnitKerjaFocus}
                    placeholder="Pilih Unit Kerja"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    disabled={!selectedCabang}
                  />
                  {showUnitKerjaDropdown && (
                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <Input
                            type="text"
                            onChange={(e) =>
                              handleUnitKerjaSearch(e.target.value)
                            }
                            placeholder="Cari atau ketik Unit Kerja..."
                            autoFocus
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-2"
                          />
                        </li>
                        <li
                          onClick={() =>
                            handleUnitKerjaSelect({ unitKerja: "" })
                          }
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          Pilih Unit Kerja
                        </li>
                        {filteredUnitKerja.length > 0 ? (
                          filteredUnitKerja.map((unitKerja) => (
                            <li
                              key={unitKerja.id}
                              onClick={() => handleUnitKerjaSelect(unitKerja)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {unitKerja.unitKerja}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-500 cursor-default">
                            Tidak ada hasil
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Data Section */}
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
                <h1>
                  {loading
                    ? "Loading..."
                    : `Total Data Daspen: ${filteredTotalFiles.totalDaspen}`}
                </h1>
                <h1>
                  {loading
                    ? "Loading..."
                    : `Total Data Kta Digital: ${filteredTotalFiles.totalKtaDigital}`}
                </h1>
              </div>

              {/* Button Section */}
              <div className="flex flex-wrap items-center space-x-4">
                <Button
                  onClick={openModal}
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  Download Template
                </Button>

                <Modal
                  isOpen={showModal}
                  onRequestClose={closeModal}
                  contentLabel="Pilih Template"
                  className="fixed inset-0 flex items-center justify-center p-4"
                  overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        Pilih Template untuk Download
                      </h2>
                      <button
                        className="text-2xl font-bold text-gray-700 hover:text-red-500 focus:outline-none"
                        onClick={closeModal}
                      >
                        x
                      </button>
                    </div>

                    {/* Pilihan Template */}
                    <div className="flex flex-col gap-4">
                      <button
                        className="w-full bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                        onClick={() => setSelectedTemplate("daspen")}
                      >
                        Template Daspen
                      </button>
                      <button
                        className="w-full bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                        onClick={() => setSelectedTemplate("kta")}
                      >
                        Template KTA Digital
                      </button>
                    </div>

                    {/* Tombol untuk download setelah memilih template */}
                    {selectedTemplate && (
                      <div className="mt-4">
                        <Button
                          className="w-full bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                          onClick={handleDownloadTemplate}
                        >
                          Download{" "}
                          {selectedTemplate === "daspen"
                            ? "Template Daspen"
                            : "Template KTA Digital"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Modal>

                <Button
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                  onClick={() => setIsModalOpen(true)}
                >
                  Upload Data
                </Button>
                {/* <Button
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  Cetak
                </Button> */}
              </div>
            </div>

            <div
              ref={tableRef}
              className="overflow-x-auto relative shadow-md sm:rounded-lg"
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 text-center">
                  <tr>
                    <th scope="col" className="py-3 px-6">
                      No
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Cabang
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Unit Kerja
                    </th>
                    {!isMobile && (
                      <>
                        <th scope="col" className="py-3 px-6">
                          Nama
                        </th>
                        <th scope="col" className="py-3 px-6">
                          NPA
                        </th>
                        <th scope="col" className="py-3 px-6">
                          NIP
                        </th>

                        <th scope="col" className="py-3 px-6">
                          Data KTA Digital
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Data Daspen
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Keterangan
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Wa
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Aksi
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                {renderTableBody()}
              </table>
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncData;
