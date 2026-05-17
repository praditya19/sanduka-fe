import React from "react";

const TebNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "potongan", label: "Potongan Bank" },
    { key: "balancing", label: "Balancing" },
    // { key: "rekapitulasi", label: "Rekapitulasi" },
  ];

  return (
    <div className="flex gap-3 p-1 bg-gray-100 rounded-2xl w-full mb-6 shadow-inner">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`
        flex-1 px-5 py-2 text-sm font-medium rounded-xl
        transition-all duration-200 text-center
        focus:outline-none focus:ring-2 focus:ring-teal-400
        ${
          activeTab === tab.key
            ? "bg-white text-teal-700 shadow-md ring-1 ring-gray-200"
            : "text-gray-600 hover:bg-white/70 hover:text-teal-600"
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