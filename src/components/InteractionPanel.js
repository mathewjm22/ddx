import React, { useState } from 'react';
import DifferentialTab from './DifferentialTab';
import OrdersTab from './OrdersTab';

const InteractionPanel = ({
  submitOrders,
  differentialList,
  setDifferentialList
}) => {
  const [activeTab, setActiveTab] = useState('differential');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'differential':
        return <DifferentialTab differentialList={differentialList} setDifferentialList={setDifferentialList} />;
      case 'labs':
        return <OrdersTab type="labs" onSubmit={submitOrders} />;
      case 'imaging':
        return <OrdersTab type="imaging" onSubmit={submitOrders} />;
      case 'management':
        return <OrdersTab type="management" onSubmit={submitOrders} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      className={`p-3 ${activeTab === tabName ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
      onClick={() => setActiveTab(tabName)}
    >
      {label}
    </button>
  );

  return (
    <div className="lg:sticky lg:top-4 self-start">
      <div className="glass-panel p-6 flex flex-col h-[90vh]">
        <div id="tabs" className="flex border-b border-gray-600 mb-4">
          <TabButton tabName="differential" label="Differential" />
          <TabButton tabName="labs" label="Labs" />
          <TabButton tabName="imaging" label="Imaging" />
          <TabButton tabName="management" label="Management" />
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default InteractionPanel;
