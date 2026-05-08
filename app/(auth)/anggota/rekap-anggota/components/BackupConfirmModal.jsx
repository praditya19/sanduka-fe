import React from "react";

const BackupConfirmModal = ({ isVisible, onClose, onConfirm, isProcessing }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Konfirmasi Backup
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Apakah Anda yakin akan membackup data?
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-8 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ya, Backup"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupConfirmModal;
