import React from "react";

const TebNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "potongan", label: "Potongan Bank" },
    { key: "balancing", label: "Balancing" },
    { key: "rekapitulasi", label: "Rekapitulasi" },
  ];

  return (
    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-full mb-6 shadow-inner">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            flex-1 px-5 py-2.5 text-sm font-medium rounded-xl
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1
            ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200 scale-[1.02]"
                : "bg-transparent text-gray-600 hover:bg-white/50 hover:text-teal-600"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TebNavigation;
