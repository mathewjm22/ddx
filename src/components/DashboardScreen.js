import React from 'react';
import { specialties, ICONS } from '../data';

const DashboardScreen = ({ onSpecialtyClick }) => {
  return (
    <div id="dashboard-screen" className="w-full">
      <h1 className="text-4xl font-bold text-center mb-2 text-white">Differential Diagnosis AI Simulator</h1>
      <p className="text-center text-gray-300 mb-8">Select a specialty to begin a case or choose a random one.</p>
      <div id="specialty-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {specialties.map(s => {
          const IconComponent = ICONS[s.icon];
          return (
            <div
              key={s.name}
              className="glass-tile p-4 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={() => onSpecialtyClick(s.name)}
            >
              <div className="mb-2">{IconComponent ? <IconComponent /> : null}</div>
              <span className="font-semibold">{s.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardScreen;
