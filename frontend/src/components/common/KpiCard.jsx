// c:\gestor\frontend\src\components\common\KpiCard.jsx

import React from 'react';

const KpiCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className={`kpi-card ${bgColor} ${textColor}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
};

export default KpiCard;
