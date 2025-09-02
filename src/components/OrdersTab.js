import React, { useState } from 'react';

const PILL_DATA = {
  labs: {
    title: 'Common Lab Orders:',
    pills: ["CBC", "CMP", "UA", "Troponin", "TSH"],
  },
  imaging: {
    title: 'Common Imaging Orders:',
    pills: ["CXR", "CT chest", "CT AB/PEL", "CTPA", "MRI", "US", "TTE"],
  },
  management: {
    title: 'Management Plan Components:',
    pills: ["Medication: ", "Procedure: ", "Consultation: ", "Disposition: "],
  }
};

const OrdersTab = ({ type, onSubmit }) => {
  const [orderText, setOrderText] = useState('');
  const { title, pills } = PILL_DATA[type];

  const handlePillClick = (text) => {
    setOrderText(prev => (prev ? `${prev}\n${text}` : text));
  };

  const handleSubmit = () => {
    onSubmit(type, orderText);
    setOrderText('');
  };

  return (
    <div id={`${type}-content`} className="tab-content">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {pills.map(pillText => (
          <span
            key={pillText}
            className="pill bg-gray-700/50 p-2 rounded-full text-sm"
            onClick={() => handlePillClick(pillText)}
          >
            {pillText}
          </span>
        ))}
      </div>
      <textarea
        id={`${type}-orders`}
        rows="8"
        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        placeholder={`Enter ${type} orders here...`}
        value={orderText}
        onChange={(e) => setOrderText(e.target.value)}
      ></textarea>
      <button
        id={`submit-${type}-btn`}
        className="glass-button w-full mt-2 py-2 px-4 rounded-lg font-semibold"
        onClick={handleSubmit}
      >
        Submit {type.charAt(0).toUpperCase() + type.slice(1)} Orders
      </button>
    </div>
  );
};

export default OrdersTab;
