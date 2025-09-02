import React, { useEffect, useRef } from 'react';

const CasePresentation = ({ content, onAdvanceCase, onRevealDiagnosis, isComplete }) => {
  const contentEndRef = useRef(null);

  const scrollToBottom = () => {
    contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [content]);

  const renderContentPart = (part, index) => {
    if (part.type === 'text') {
      return <p key={index} className="text-lg" dangerouslySetInnerHTML={{ __html: part.content.replace(/\n/g, '<br />') }}></p>;
    }
    if (part.type === 'image') {
      // In a real app, the base64 data would be real. Here we just show a placeholder.
      return <div key={index} className="my-4 rounded-lg shadow-lg w-full h-96 bg-gray-700 flex items-center justify-center">
        <p className="text-gray-400">Watercolor Illustration Placeholder</p>
      </div>
    }
     if (part.type === 'result') {
      return (
        <div key={index} className="my-4 p-4 bg-gray-900/50 rounded-lg border border-teal-500">
          <h4 className="font-bold text-teal-300">{part.resultType.charAt(0).toUpperCase() + part.resultType.slice(1)} Results:</h4>
          <p className="mt-2" dangerouslySetInnerHTML={{ __html: part.content.replace(/\n/g, '<br />') }}></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-[90vh]">
      <h2 className="text-2xl font-bold mb-4 text-white">Case Presentation</h2>
      <div id="case-content" className="flex-grow overflow-y-auto pr-2">
        {content.map((phase, phaseIndex) => (
          <div key={phaseIndex}>
            {phaseIndex > 0 && <hr className="my-4 border-gray-600" />}
            {phase.map(renderContentPart)}
          </div>
        ))}
        <div ref={contentEndRef} />
      </div>
      {!isComplete ? (
        <button onClick={onAdvanceCase} className="glass-button w-full mt-4 py-2 px-4 rounded-lg font-semibold">
          Advance Case
        </button>
      ) : (
        <button onClick={onRevealDiagnosis} className="glass-button bg-green-500/50 hover:bg-green-500/80 w-full mt-4 py-2 px-4 rounded-lg font-semibold">
          Lock In & Reveal Diagnosis
        </button>
      )}
    </div>
  );
};

export default CasePresentation;
