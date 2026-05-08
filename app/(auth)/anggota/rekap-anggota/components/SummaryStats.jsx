import React from "react";
import { 
  FaUsers, 
  FaBuilding, 
  FaUniversity, 
  FaHandHoldingHeart, 
  FaWallet, 
  FaFileInvoiceDollar, 
  FaCalendarAlt,
  FaCoins
} from "react-icons/fa";

const StatCard = ({ title, value, icon: Icon, gradient, shadowColor, isLoading }) => {
  const isCurrency = typeof value === 'number' && value > 5000;
  const isCount = title === "Anggota" || title === "Unit Kerja";

  return (
    <div className="relative group transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 rounded-3xl opacity-20 blur-xl transition-opacity group-hover:opacity-40 ${gradient}`} />
      <div className="relative bg-white/80 backdrop-blur-md border border-white rounded-3xl p-5 shadow-sm h-full flex flex-col justify-between overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${gradient}`} />
        
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${isLoading ? 'bg-gray-200 animate-pulse' : gradient} flex items-center justify-center text-white text-xl shadow-lg ${isLoading ? '' : shadowColor}`}>
            {isLoading ? null : <Icon />}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        </div>

        <div>
          {isLoading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-lg mb-2" />
          ) : (
            <h4 className="text-xl font-black text-gray-800 leading-tight">
              {!isCount && isCurrency ? (
                <span className="text-sm font-medium text-gray-400 mr-1">Rp.</span>
              ) : null}
              {typeof value === 'number' ? value.toLocaleString("id-ID") : value}
            </h4>
          )}
          <div className={`w-8 h-1 ${isLoading ? 'bg-gray-100' : 'bg-gray-100 group-hover:w-16'} rounded-full mt-2 transition-all duration-500`} />
        </div>
      </div>
    </div>
  );
};

const SummaryStats = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-10 mt-6">
      <StatCard 
        title="Anggota" 
        value={stats.memberCount} 
        icon={FaUsers} 
        gradient="bg-gradient-to-br from-blue-500 to-cyan-400" 
        shadowColor="shadow-blue-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Unit Kerja" 
        value={stats.unitKerjaCount} 
        icon={FaBuilding} 
        gradient="bg-gradient-to-br from-indigo-500 to-purple-400" 
        shadowColor="shadow-indigo-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="PGRI" 
        value={stats.pgri} 
        icon={FaUniversity} 
        gradient="bg-gradient-to-br from-teal-500 to-emerald-400" 
        shadowColor="shadow-teal-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Sanduka" 
        value={stats.sanduka} 
        icon={FaHandHoldingHeart} 
        gradient="bg-gradient-to-br from-rose-500 to-pink-400" 
        shadowColor="shadow-rose-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Daspen" 
        value={stats.daspen} 
        icon={FaWallet} 
        gradient="bg-gradient-to-br from-orange-500 to-amber-400" 
        shadowColor="shadow-orange-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Derap" 
        value={stats.derap} 
        icon={FaFileInvoiceDollar} 
        gradient="bg-gradient-to-br from-violet-600 to-indigo-500" 
        shadowColor="shadow-violet-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Kalender" 
        value={stats.kalender} 
        icon={FaCalendarAlt} 
        gradient="bg-gradient-to-br from-emerald-600 to-teal-500" 
        shadowColor="shadow-emerald-200"
        isLoading={isLoading}
      />
      <StatCard 
        title="Total" 
        value={stats.total} 
        icon={FaCoins} 
        gradient="bg-gradient-to-br from-slate-800 to-slate-600" 
        shadowColor="shadow-slate-300"
        isLoading={isLoading}
      />
    </div>
  );
};

export default SummaryStats;
