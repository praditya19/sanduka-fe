"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle, X } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";

const PencarianAnggota = ({ isOpen, onClose }) => {
  const [npaPgri, setNpa] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [filteredMember, setFilteredMember] = useState(null);
  const modalRef = useRef(null);

  const onSearch = async () => {
    setLoader(true);
    setError("");
    try {
      const member = await GlobalApi.cekNpa(npaPgri);
  
      if (member) {
        const detailedMember = await GlobalApi.getUserById(member.id);
        if (detailedMember) {
          setFilteredMember({
            ...member,
            unitKerja: detailedMember.unitKerja,
            isVerified: detailedMember.isVerified,
          });
          setError("");
        } else {
          setFilteredMember(null);
          setError("Unit Kerja Tidak Ditemukan");
        }
      } else {
        setFilteredMember(null);
        setError("Data Tidak Ditemukan");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Data Tidak Ditemukan");
    } finally {
      setLoader(false);
    }
  };

  const clearResults = () => {
    setFilteredMember(null);
    setNpa("");
    setError("");
  };

  const handleClose = () => {
    clearResults();
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && npaPgri && !loader) {
      onSearch();
    }
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when modal is open
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'auto'; // Restore body scroll
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
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
            <p className="text-gray-500">Masukkan NPA PGRI</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="NPA PGRI"
              value={npaPgri}
              onChange={(e) => setNpa(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
            
            <Button
              onClick={onSearch}
              disabled={!npaPgri || loader}
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

            {/* Results */}
            {filteredMember && (
              <div className="p-4 border border-green-200 rounded-lg shadow-sm bg-green-50">
                <h4 className="font-bold text-center text-lg mb-4 text-green-800">
                  HASIL PENCARIAN DATA
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Nama:</span>
                    <span className="text-right">{filteredMember.namaLengkap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cabang:</span>
                    <span className="text-right">{filteredMember.cabang}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Unit Kerja:</span>
                    <span className="text-right">{filteredMember.unitKerja}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Jabatan:</span>
                    <span className="text-right">{filteredMember.jabatan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Terdaftar Sanduka:</span>
                    <span className="flex items-center">
                      {filteredMember.isVerified ? (
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
          {filteredMember && (
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
    </div>
  );
};

export default PencarianAnggota;