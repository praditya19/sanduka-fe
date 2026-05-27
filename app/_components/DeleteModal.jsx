"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";

const DeleteModal = ({
    deleteModal,
    closeDeleteModal,
    confirmDelete,
    loading,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Konfirmasi Hapus
                    </h3>
                    <button
                        onClick={closeDeleteModal}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700">
                        Apakah Anda yakin ingin menghapus data ini?
                        {deleteModal.itemName && (
                            <span className="font-semibold block mt-2">
                                {deleteModal.itemName}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={closeDeleteModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;