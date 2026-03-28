import React from 'react';

const StatsCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  };

  const style = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-2xl shadow-md p-8 transform hover:shadow-lg transition-all duration-300`}>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{icon}</div>
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2 tracking-wide uppercase">{label}</h3>
        <p className={`text-4xl font-bold mt-3 leading-tight ${style.text}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
