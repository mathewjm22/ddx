import React from 'react';
import CasePresentation from './CasePresentation';
import InteractionPanel from './InteractionPanel';

const CaseScreen = ({
    caseContent,
    advanceCase,
    revealDiagnosis,
    isCaseComplete,
    submitOrders,
    differentialList,
    setDifferentialList
}) => {
  return (
    <div id="case-screen" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CasePresentation
          content={caseContent}
          onAdvanceCase={advanceCase}
          onRevealDiagnosis={revealDiagnosis}
          isComplete={isCaseComplete}
        />

        <InteractionPanel
          submitOrders={submitOrders}
          differentialList={differentialList}
          setDifferentialList={setDifferentialList}
        />
      </div>
    </div>
  );
};

export default CaseScreen;
