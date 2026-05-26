import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMoneyBillWave,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";

const SummaryCards = ({
  activeTab,
  jumlahPotonganBank,
  totalNominalPotonganBank,
  jumlahSetorTunai,
  totalNominalSetorTunai,
  totalTerfilter,
  totalNominalTerfilter,
  formatRupiah,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm mb-"
      }`}
      // ${activeTab === "potongan" ? "w-full" : "w-[1900px]
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 mt-4">
        {/* CARD 1 */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-white border border-teal-100">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={faUsers} className="text-teal-600" />
            </div>
            <h3 className="font-medium text-gray-700">Anggota Potongan Bank</h3>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {jumlahPotonganBank} Anggota
          </p>
          <p className="text-gray-600 text-sm">
            Total Nominal: {formatRupiah(totalNominalPotonganBank)}
          </p>
        </div>

        {/* CARD 2 */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-[#0B131E]"
              />
            </div>
            <h3 className="font-medium text-gray-700">Anggota Setor Tunai</h3>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {jumlahSetorTunai} Anggota
          </p>
          <p className="text-gray-600 text-sm">
            Total Nominal: {formatRupiah(totalNominalSetorTunai)}
          </p>
        </div>

        {/* CARD 3 */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={faChartPie} className="text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-700">
              Total Anggota Terfilter
            </h3>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {totalTerfilter} Anggota
          </p>
          <p className="text-gray-600 text-sm">
            Total Nominal: {formatRupiah(totalNominalTerfilter)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
