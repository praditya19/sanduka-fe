import React, { useEffect } from "react";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success": return "bg-green-100";
      case "error": return "bg-red-100";
      default: return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error": return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default: return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success": return "text-green-800";
      case "error": return "text-red-800";
      default: return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors">
          <FaTimesCircle size={24} />
        </button>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>
          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>
          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
