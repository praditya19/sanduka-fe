import React from "react";
import { 
  FaUsers, 
  FaBuilding, 
  FaUniversity, 
  FaHandHoldingHeart, 
  FaWallet, 
  FaFileInvoiceDollar, 
  FaCalendarAlt,
  FaCoins,
  FaEllipsisH
} from "react-icons/fa";

const StatCard = ({ title, value, icon: Icon, gradient, isLoading }) => {
  const isCurrency = typeof value === 'number' && value > 5000;
  const isCount = title === "Anggota" || title === "Unit Kerja";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center space-x-3 transition-all duration-300 hover:shadow-md hover:border-teal-100">
      {/* Icon Section */}
      <div className={`w-10 h-10 rounded-lg flex-shrink-0 ${isLoading ? 'bg-slate-100 animate-pulse' : gradient} flex items-center justify-center text-white text-sm shadow-sm`}>
        {isLoading ? null : <Icon />}
      </div>

      {/* Text Section */}
      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">
          {title}
        </p>
        <div className="mt-0.5">
          {isLoading ? (
            <div className="h-4 w-16 bg-slate-100 animate-pulse rounded" />
          ) : (
            <h4 className="text-sm font-black text-slate-800 truncate leading-tight">
              {!isCount && isCurrency && (
                <span className="text-[10px] font-bold text-slate-400 mr-0.5">Rp</span>
              )}
              {typeof value === 'number' ? value.toLocaleString("id-ID") : value}
            </h4>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryStats = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-9 gap-3 mb-6 mt-4">
      <StatCard 
        title="Anggota" 
        value={stats.memberCount} 
        icon={FaUsers} 
        gradient="bg-gradient-to-br from-blue-500 to-cyan-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Unit Kerja" 
        value={stats.unitKerjaCount} 
        icon={FaBuilding} 
        gradient="bg-gradient-to-br from-indigo-500 to-purple-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="PGRI" 
        value={stats.pgri} 
        icon={FaUniversity} 
        gradient="bg-gradient-to-br from-teal-500 to-emerald-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Sanduka" 
        value={stats.sanduka} 
        icon={FaHandHoldingHeart} 
        gradient="bg-gradient-to-br from-rose-500 to-pink-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Daspen" 
        value={stats.daspen} 
        icon={FaWallet} 
        gradient="bg-gradient-to-br from-orange-500 to-amber-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Derap" 
        value={stats.derap} 
        icon={FaFileInvoiceDollar} 
        gradient="bg-gradient-to-br from-violet-600 to-indigo-500" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Kalender" 
        value={stats.kalender} 
        icon={FaCalendarAlt} 
        gradient="bg-gradient-to-br from-emerald-600 to-teal-500" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Lain - Lain" 
        value={stats.sumbangan} 
        icon={FaEllipsisH} 
        gradient="bg-gradient-to-br from-fuchsia-500 to-purple-400" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Total" 
        value={stats.total} 
        icon={FaCoins} 
        gradient="bg-gradient-to-br from-slate-800 to-slate-600" 
        isLoading={isLoading}
      />
    </div>
  );
};

export default SummaryStats;
