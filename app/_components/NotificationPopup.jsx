"use client";
import React, { useEffect } from "react";
import {
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationCircle,
} from "react-icons/fa";

const NotificationPopup = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 2000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: {
            bg: "bg-green-100",
            text: "text-green-800",
            icon: <FaCheckCircle className="text-green-500 text-3xl" />,
        },
        error: {
            bg: "bg-red-100",
            text: "text-red-800",
            icon: <FaExclamationCircle className="text-red-500 text-3xl" />,
        },
        info: { bg: "bg-blue-100", text: "text-blue-800", icon: null },
    };

    const { bg, text, icon } = colors[type] || colors.info;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            ></div>
            <div
                className={`relative ${bg} rounded-lg p-8 shadow-xl z-10 w-96 text-center`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                >
                    <FaTimesCircle size={24} />
                </button>
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-bounce">{icon}</div>
                    <h3 className={`text-xl font-bold ${text}`}>
                        {type === "success" ? "Berhasil!" : "Gagal!"}
                    </h3>
                    <div className={`${text}`}>{message}</div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;