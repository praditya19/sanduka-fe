import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle, X, ArrowRightLeft } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";

// Mutation Notification Component
const MutationNotification = ({ type, message, details, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

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
        return <span className="text-green-500 text-4xl mb-3">✓</span>;
      case 'error':
        return <span className="text-red-500 text-4xl mb-3">⚠</span>;
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center space-y-3">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Mutasi Berhasil!' : 'Mutasi Gagal!'}
          </h3>

          <p className={`${getTextColor()} text-center text-lg`}>
            {message}
          </p>
          
          {details && (
            <div className="mt-3 w-full">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mutasi Modal Component
const MutasiModal = ({ isOpen, onClose, selectedMember }) => {
  const [cabangOptions, setCabangOptions] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [cabang, setCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [notification, setNotification] = useState(null);

  const modalRef = useRef(null);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaOptions(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };

    if (isOpen) {
      fetchCabangData();
      fetchUnitKerjaData();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsPopupVisible(true);
  };

  const handleCreateHistory = async () => {
    const now = new Date();
    
    // Format date components
    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];
    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();
  
    // Get user details from session storage
    const userRole = sessionStorage.getItem("role");
    const namaLengkapUser = userRole === "USER" 
      ? selectedMember.namaLengkap 
      : sessionStorage.getItem("nama");
  
    const historyData = {
      hari,
      tanggal,
      jam,
      npa: selectedMember.npaPgri || "N/A",
      nama: selectedMember.namaLengkap,
      cabang: selectedMember.cabang, 
      uraian: "Pindah Cabang",
      masuk: cabang, 
      keluar: selectedMember.cabang, 
      bulan,
      tahun,
      cabang_ke_2: cabang, 
      user: namaLengkapUser,
    };
  
    try {
      await GlobalApi.createHistoryData(historyData);
      console.log("History data created successfully");
    } catch (error) {
      console.error("Failed to create history data:", error);
    }
  };

  const handleConfirmSave = async () => {
    if (!cabang || !selectedUnitKerja) {
      setNotification({
        type: 'error',
        message: 'Silakan pilih Cabang dan Unit Kerja sebelum menyimpan.',
        details: null
      });
      setIsPopupVisible(false);
      return;
    }

    try {
      await GlobalApi.mutasiCabangUnitKerja(
        selectedMember.id,
        cabang,
        selectedUnitKerja
      );

      await handleCreateHistory();

      setNotification({
        type: 'success',
        message: 'Anggota telah berhasil dimutasi.',
        details: {
          'Nama': selectedMember.namaLengkap,
          'Cabang Baru': cabang,
          'Unit Kerja Baru': selectedUnitKerja
        }
      });

      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (error) {
      console.error("Error saat memutasikan anggota:", error);
      
      setNotification({
        type: 'error',
        message: `Terjadi kesalahan: ${error?.response?.data?.message || "Silakan coba lagi."}`,
        details: null
      });
    } finally {
      setIsPopupVisible(false);
    }
  };

  const handleClose = () => {
    setCabang("");
    setSelectedUnitKerja("");
    setNotification(null);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPopupVisible || notification) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        const isSelectDropdown = event.target.closest('select') || 
                                event.target.tagName === 'OPTION' ||
                                event.target.closest('[role="listbox"]') ||
                                event.target.closest('.select-dropdown');
        
        if (!isSelectDropdown) {
          handleClose();
        }
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, isPopupVisible, notification]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 px-4">
      {notification && (
        <MutationNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div
        ref={modalRef}
        className="bg-white p-4 rounded shadow-lg w-full sm:w-3/4 md:w-2/4 lg:w-2/5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">MUTASI ANGGOTA</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {selectedMember && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Data Anggota:</h3>
            <p><strong>Nama:</strong> {selectedMember.namaLengkap}</p>
            <p><strong>Cabang Saat Ini:</strong> {selectedMember.cabang}</p>
            <p><strong>Unit Kerja Saat Ini:</strong> {selectedMember.unitKerja}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Cabang Baru:</label>
          <select
            value={cabang}
            onChange={(e) => {
              e.stopPropagation(); 
              setCabang(e.target.value);
              setSelectedUnitKerja("");
              const filteredUnits = unitKerjaOptions.filter(
                (unit) => unit.cabang === e.target.value
              );
              setFilteredUnitKerjaOptions(filteredUnits);
            }}
            onMouseDown={(e) => e.stopPropagation()} 
            onFocus={(e) => e.stopPropagation()} 
            className="border border-teal-500 rounded-lg p-2 w-full bg-white shadow-sm"
          >
            <option value="">Pilih Cabang</option>
            {cabangOptions.map((cabangItem) => (
              <option key={cabangItem.idKecamatan} value={cabangItem.kecamatan}>
                {cabangItem.kecamatan}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Unit Kerja Baru:</label>
          <select
            value={selectedUnitKerja}
            onChange={(e) => {
              e.stopPropagation(); 
              setSelectedUnitKerja(e.target.value);
            }}
            onMouseDown={(e) => e.stopPropagation()} 
            onFocus={(e) => e.stopPropagation()} 
            className="border border-teal-500 rounded-lg p-2 w-full bg-white shadow-sm"
            disabled={!cabang}
          >
            <option value="">Pilih Unit Kerja</option>
            {filteredUnitKerjaOptions.map((unit) => (
              <option key={unit.id} value={unit.unitKerja}>
                {unit.unitKerja}
              </option>
            ))}
          </select>
          {!cabang && (
            <p className="text-sm text-gray-500 mt-1">Pilih cabang terlebih dahulu</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="border-gray-300 hover:bg-red-400"
          >
            Batal
          </Button>
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSave}
          >
            Simpan Mutasi
          </Button>
        </div>

        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-70">
            <div className="bg-white p-6 py-9 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-full">
              <p className="text-lg mb-12">
                Apakah Anda yakin ingin memutasi anggota ini?
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsPopupVisible(false)}
                >
                  Tidak
                </button>
                <button
                  className="bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded"
                  onClick={handleConfirmSave}
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PencarianAnggota = ({ isOpen, onClose }) => {
  const [searchInput, setSearchInput] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMutasi, setShowMutasi] = useState(false);
  const modalRef = useRef(null);

  // Function to search by NPA
  const searchByNpa = async (npaValue) => {
    try {
      const member = await GlobalApi.cekNpa(npaValue);
      
      if (member) {
        const detailedMember = await GlobalApi.getUserById(member.id);
        if (detailedMember) {
          return [{
            ...member,
            unitKerja: detailedMember.unitKerja,
            isVerified: detailedMember.isVerified,
          }];
        } else {
          throw new Error("Unit Kerja Tidak Ditemukan");
        }
      } else {
        throw new Error("Data Tidak Ditemukan");
      }
    } catch (err) {
      throw err;
    }
  };

  // UPDATED: Function to search by name using getAllAnggota
  const searchByName = async (namaValue) => {
    try {
      const response = await GlobalApi.getAllAnggota(
        0,      // page
        50,     // size - get more results for name search
        null,   // cabang
        null,   // unitKerja  
        namaValue, // keyword (nama)
        "Aktif" // statusKeanggotaan
      );
      
      if (response && response.content && response.content.length > 0) {
        const detailedMembers = response.content.map(member => ({
          ...member,
          isVerified: member.isVerified || false,
        }));
        
        return detailedMembers;
      } else {
        throw new Error("Data Tidak Ditemukan");
      }
    } catch (err) {
      throw err;
    }
  };

  const onSearch = async () => {
    if (!searchInput.trim()) return;
    
    setLoader(true);
    setError("");
    setFilteredMembers([]);
    setSelectedMember(null);
    
    try {
      let results = [];
      
      const isNpa = /^\d+$/.test(searchInput.trim());
      
      if (isNpa) {
        // Search by NPA
        results = await searchByNpa(searchInput);
      } else {
        // Search by name using getAllAnggota with keyword
        results = await searchByName(searchInput);
      }
      
      setFilteredMembers(results);
      
      if (results.length === 1) {
        setSelectedMember(results[0]);
      }
      
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Data Tidak Ditemukan");
    } finally {
      setLoader(false);
    }
  };

  const clearResults = () => {
    setFilteredMembers([]);
    setSelectedMember(null);
    setSearchInput("");
    setError("");
  };

  const handleClose = () => {
    clearResults();
    setShowMutasi(false);
    onClose();
  };

  const handleMutasiClick = () => {
    setShowMutasi(true);
  };

  const handleMutasiClose = () => {
    setShowMutasi(false);
  };

  const selectMember = (member) => {
    setSelectedMember(member);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchInput.trim() && !loader) {
      onSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMutasi) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, showMutasi]); 

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (showMutasi) {
          setShowMutasi(false); 
        } else {
          handleClose(); 
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, showMutasi]); 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Cari Anggota SANDUKA
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="font-bold text-xl mb-2">
              CARI KEANGGOTAAN SANDUKA
            </h3>
            <p className="text-gray-500">Masukkan NPA PGRI atau Nama Lengkap</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Masukkan NPA PGRI atau Nama Lengkap"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
            
            <Button
              onClick={onSearch}
              disabled={!searchInput.trim() || loader}
              className="w-full bg-teal-700 hover:bg-teal-800"
            >
              {loader ? (
                <LoaderIcon className="animate-spin mr-2" />
              ) : (
                <Search className="mr-2" />
              )}
              {loader ? "Mencari..." : "Cari"}
            </Button>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* Search Results List (for name search with multiple results) */}
            {filteredMembers.length > 1 && !selectedMember && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-center text-lg text-teal-800">
                  Pilih Anggota ({filteredMembers.length} hasil)
                </h4>
                {filteredMembers.map((member, index) => (
                  <div
                    key={index}
                    onClick={() => selectMember(member)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-colors"
                  >
                    <div className="font-medium">{member.namaLengkap}</div>
                    <div className="text-sm text-gray-600">
                      {member.cabang} • {member.jabatan}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Member Details */}
            {selectedMember && (
              <div className="p-4 border border-green-200 rounded-lg shadow-sm bg-green-50">
                <h4 className="font-bold text-center text-lg mb-4 text-green-800">
                  HASIL PENCARIAN DATA
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Nama:</span>
                    <span className="text-right">{selectedMember.namaLengkap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">NPA PGRI:</span>
                    <span className="text-right">{selectedMember.npaPgri}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cabang:</span>
                    <span className="text-right">{selectedMember.cabang}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Unit Kerja:</span>
                    <span className="text-right">{selectedMember.unitKerja}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Jabatan:</span>
                    <span className="text-right">{selectedMember.jabatan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Terdaftar Sanduka:</span>
                    <span className="flex items-center">
                      {selectedMember.isVerified ? (
                        <span className="text-green-600 flex items-center">
                          <span className="mr-1">✓</span>
                          <span className="text-xs">Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <span className="mr-1">✗</span>
                          <span className="text-xs">Belum Terverifikasi</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          {selectedMember && (
            <Button
              onClick={handleMutasiClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Mutasi
            </Button>
          )}
          {(selectedMember || filteredMembers.length > 0) && (
            <Button
              onClick={clearResults}
              variant="outline"
              className="border-gray-300 hover:bg-green-200"
            >
              Cari Lagi
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-300 hover:bg-red-400"
          >
            Tutup
          </Button>
        </div>
      </div>

      {/* Mutasi Modal */}
      {showMutasi && <MutasiModal isOpen={showMutasi} onClose={handleMutasiClose} selectedMember={selectedMember} />}
    </div>
  );
};

export default PencarianAnggota;