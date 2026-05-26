import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const HeaderSection = ({ handleBackClick }) => {
  return (
    <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-4 md:px-8 shadow-lg fixed top-0 left-0 w-full z-50 flex items-center">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="sm"
            onClick={handleBackClick}
            className="cursor-pointer mr-4"
          />
          <h1 className="text-base">Transaksi Bank</h1>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
