"use client";
import React, { useState, useEffect, useRef } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { FaBars, FaTimes } from "react-icons/fa";
import Modal from "react-modal";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-[9999] w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [searchNama, setSearchNama] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState(null);
  const [notification, setNotification] = useState(null);
  const [statusKeanggotaan, setStatusKeanggotaan] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // atau "desc"


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

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';

    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const sortAndFilterData = () => {
    let result = [...data];

    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField] ?? '';
        let valB = b[sortField] ?? '';

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return sortOrder === 'asc'
            ? (valA === valB ? 0 : valA ? 1 : -1)
            : (valA === valB ? 0 : valA ? -1 : 1);
        }

        if (!isNaN(valA) && !isNaN(valB)) {
          return sortOrder === 'asc'
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (sortOrder === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
    }

    result = result.filter((item) => {
      const statusMatch = statusKeanggotaan
        ? item.statusKeanggotaan?.toLowerCase() === statusKeanggotaan.toLowerCase()
        : true;

      const cabangMatch = selectedCabang ? item.cabang === selectedCabang : true;
      const unitKerjaMatch = selectedUnitKerja
        ? item.unitKerja?.toLowerCase() === selectedUnitKerja?.toLowerCase()
        : true;

      const namaMatch = searchNama
        ? item.namaAnggota?.toLowerCase().includes(searchNama.toLowerCase()) ||
        item.npa?.toLowerCase().includes(searchNama.toLowerCase()) ||
        item.nip?.toLowerCase().includes(searchNama.toLowerCase())
        : true;

      return cabangMatch && unitKerjaMatch && namaMatch && statusMatch;
    });

    return result;
  };

  const filteredData = sortAndFilterData();
  const paginatedData = paginateData(filteredData);

  useEffect(() => {
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
        setNotification({
          type: 'success',
          message: `File berhasil dikirim!`,
        });
      } catch (error) {
        setIsUploading(false);
        setNotification({
          type: 'error',
          message: `File Gagal dikirim!`,
        });
        console.error(
          "Error submitting data:",
          error.response?.data || error.message
        );
      }
    } else {
      setNotification({
        type: 'error',
        message: `Format file tidak sesuai. Harap upload file Excel!.`,
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

  const handleNamaChange = (e) => {
    setSearchNama(e.target.value.toLowerCase());
  };

  const renderTableBody = () => {
    return (
      <tbody className="text-center">
        {paginatedData.map((item, index) => {
          const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
          return (
            <React.Fragment key={item.id || index}>
              <tr
                className={`bg-white border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-200 transition duration-150`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center justify-between">
                    <span>{actualIndex}</span>
                    {isMobile && (
                      <FontAwesomeIcon
                        icon={
                          expandedRow === actualIndex
                            ? faMinusCircle
                            : faPlusCircle
                        }
                        className="text-blue-500 cursor-pointer ml-2"
                        size="lg"
                        onClick={() => toggleExpandRow(actualIndex)}
                      />
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">{item.cabang}</td>
                <td className="py-4 px-6">{item.unitKerja}</td>
                {!isMobile && (
                  <>
                    <td className="py-4 px-6">{item.namaAnggota}</td>
                    <td className="py-4 px-6">{item.npa || "-"}</td>
                    <td className="py-4 px-6">{item.nip}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-1 rounded ${item.dataKtaDigital
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.dataKtaDigital ? "YES" : "NO"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-1 rounded ${item.dataDaspen
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
                      ) : item.verifikasi ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Sudah Sinkronisasi
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-4 px-6">{item.statusKeanggotaan}</td>
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
                    <td className="py-4 px-6">
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
              {expandedRow === actualIndex && (
                <tr>
                  <td colSpan="9" className="px-4 py-4 bg-gray-50">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="text-left">
                          <h3 className="font-semibold">Nama:</h3>
                          <p>{item.namaAnggota}</p>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Npa:</h3>
                          <p>{item.npa || "-"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="text-left">
                          <h3 className="font-semibold">Nip:</h3>
                          <p>{item.nip}</p>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Data Kta Digital:</h3>
                          <p
                            className={`inline-block px-2 py-1 rounded ${item.dataKtaDigital
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {item.dataKtaDigital ? "YES" : "NO"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="text-left">
                          <h3 className="font-semibold">Data Daspen:</h3>
                          <p
                            className={`inline-block px-2 py-1 rounded ${item.dataDaspen
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {item.dataDaspen ? "YES" : "NO"}
                          </p>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Keterangan:</h3>
                          <p>
                            {item.verifikasi === null ? (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                Belum Sinkronisasi
                              </span>
                            ) : item.verifikasi ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Sudah Sinkronisasi
                              </span>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="text-left">
                          <div className="text-left">
                            <h3 className="font-semibold">Status Keanggotaan:</h3>
                            <p>{item.statusKeanggotaan}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-left">Action:</h3>
                          <div className="text-left flex items-center gap-2">
                            <button
                              onClick={() =>
                                window.open(
                                  `https://wa.me/${item.nomorHp}`,
                                  "_blank"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full flex items-center justify-center"
                            >
                              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                            </button>
                            <Button
                              className="bg-red-500 p-2 border rounded-md"
                              title="Hapus"
                              type="button"
                              onClick={() => handleDeleteClick(item.id)}
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    );
  };

  const toggleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
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
            className={`px-3 py-1 border rounded-md ${page === currentPage
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
        setNotification({
          type: 'error',
          message: `Id tidak ditemukan!`,
        });
        return;
      }

      const result = await GlobalApi.deleteFiles(id);

      setNotification({
        type: 'success',
        message: `File berhasil dihapus!`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
    } catch (error) {
      setNotification({
        type: 'success',
        message: `Gagal menghapus file!`,
      });
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

  const handleCekData = () => {
    router.push("/singkron-data/cek-data");
  };

  const handleStatusChange = (value) => {
    setStatusKeanggotaan(value);
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  const handleDownloadRekap = () => {
    GlobalApi.exportTidakTerdaftarToExcel(selectedCabang, selectedUnitKerja);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
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

            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
              {/* Filter Controls */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
                  {/* Cabang Filter */}
                  <div className="relative w-full" ref={cabangRef}>
                    <Input
                      type="text"
                      value={selectedCabang}
                      readOnly
                      onClick={handleCabangClick}
                      className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition duration-150 ${role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      placeholder="Pilih Cabang"
                      disabled={role === "ADMIN"}
                    />
                    {showCabangDropdown && role !== "ADMIN" && (
                      <div className="absolute z-10 border rounded-md bg-white shadow-md mt-2 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-3">
                            <Input
                              type="text"
                              onChange={(e) => handleCabangSearch(e.target.value)}
                              className="block w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
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

                  {/* Unit Kerja Filter */}
                  <div className="relative w-full" ref={unitKerjaRef}>
                    <Input
                      type="text"
                      value={unitKerjaInput}
                      onChange={handleUnitKerjaChange}
                      onFocus={handleUnitKerjaFocus}
                      placeholder="Pilih Unit Kerja"
                      className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition ${!selectedCabang ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      disabled={!selectedCabang}
                    />
                    {showUnitKerjaDropdown && (
                      <div className="absolute z-10 border rounded-md bg-white shadow-md mt-2 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-3">
                            <Input
                              type="text"
                              onChange={(e) =>
                                handleUnitKerjaSearch(e.target.value)
                              }
                              placeholder="Cari atau ketik Unit Kerja..."
                              autoFocus
                              className="block w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                            />
                          </li>
                          <li
                            onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
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

                  {/* Search Filter */}
                  <div className="w-full">
                    <Input
                      type="text"
                      className="block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                      placeholder="Cari Data"
                      onChange={handleNamaChange}
                    />
                  </div>

                  {/* Dropdown Status Keanggotaan */}
                  <div className="w-full">
                    <select
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                      defaultValue=""
                    >
                      <option value="">Pilih Semua</option>
                      <option value="Terdaftar">Terdaftar</option>
                      <option value="Tidak Terdaftar">Tidak Terdaftar</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Data Totals */}
              <div className="flex flex-col gap-1 min-w-max text-sm">
                <span>
                  {loading
                    ? "Loading..."
                    : `Total Data Daspen: ${filteredTotalFiles.totalDaspen}`}
                </span>
                <span>
                  {loading
                    ? "Loading..."
                    : `Total Data Kta Digital: ${filteredTotalFiles.totalKtaDigital}`}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="relative">
                {/* Tombol hamburger */}
                <button
                  aria-label="Tampilkan menu aksi"
                  className="p-2 text-white bg-gray-700 rounded-md hover:bg-gray-800"
                  onClick={toggleActions}
                >
                  <FaBars />
                </button>

                {showActions && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={toggleActions}
                  ></div>
                )}

                <div
                  className={`fixed top-0 right-0 h-full w-72 max-w-sm bg-white shadow-2xl p-4 z-50 transition-transform duration-300 transform ${showActions ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                  <div className="flex justify-end mb-4">
                    <button
                      aria-label="Tutup menu aksi"
                      className="text-gray-600 text-2xl hover:text-red-500"
                      onClick={toggleActions}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Tombol Download Template */}
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={openModal}
                    >
                      Download Template
                    </Button>

                    {/* Modal Pilih Template */}
                    <Modal
                      isOpen={showModal}
                      onRequestClose={closeModal}
                      contentLabel="Pilih Template"
                      className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
                      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[90]"
                    >
                      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-[101]">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">Pilih Template untuk Download</h2>
                          <button
                            aria-label="Tutup modal"
                            className="text-2xl font-bold text-gray-700 hover:text-red-500"
                            onClick={closeModal}
                          >
                            ×
                          </button>
                        </div>

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

                        {selectedTemplate && (
                          <div className="mt-4">
                            <Button
                              className="w-full bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                              onClick={handleDownloadTemplate}
                            >
                              Download {selectedTemplate === "daspen" ? "Template Daspen" : "Template KTA Digital"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Modal>

                    {/* Tombol Upload Data */}
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Upload Data
                    </Button>

                    {/* Tombol Cek Data */}
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={handleCekData}
                    >
                      Cek Data
                    </Button>

                    {/* Tombol Rekap Anggota */}
                    {role === 'SUPER ADMIN' && (
                      <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={handleDownloadRekap}
                      >
                        Rekap Anggota
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={tableRef}
              className="overflow-x-auto relative shadow-md sm:rounded-lg"
            >
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-teal-700 text-center">
                  <tr>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('id')}>
                      No
                      {sortField === 'id' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('cabang')}>
                      Cabang
                      {sortField === 'cabang' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('unitKerja')}>
                      Unit Kerja
                      {sortField === 'unitKerja' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    {!isMobile && (
                      <>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('namaAnggota')}>
                          Nama
                          {sortField === 'namaAnggota' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('npa')}>
                          NPA
                          {sortField === 'npa' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('nip')}>
                          NIP
                          {sortField === 'nip' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataKtaDigital')}>
                          Data KTA Digital
                          {sortField === 'dataKtaDigital' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('dataDaspen')}>
                          Data Daspen
                          {sortField === 'dataDaspen' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('verifikasi')}>
                          Keterangan
                          {sortField === 'verifikasi' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </th>
                        <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSort('statusKeanggotaan')}>
                          Status Keanggotaan
                          {sortField === 'statusKeanggotaan' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
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
