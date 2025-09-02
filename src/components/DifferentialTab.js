import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { diagnoses } from '../data';

const DifferentialTab = ({ differentialList, setDifferentialList }) => {
  const [inputValue, setInputValue] = useState('');
  const [autocomplete, setAutocomplete] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (!value) {
      setAutocomplete([]);
      return;
    }
    const filtered = diagnoses
      .filter(d => d.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
    setAutocomplete(filtered);
  };

  const handleAddDiagnosis = (value) => {
    if (value.trim() !== '') {
      // Add to the beginning of the list
      setDifferentialList(prev => [value.trim(), ...prev]);
      setInputValue('');
      setAutocomplete([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddDiagnosis(inputValue);
    }
  };

  const handleRemoveDiagnosis = (index) => {
    setDifferentialList(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div id="differential-content" className="tab-content">
      <label htmlFor="differential-input" className="block mb-2 font-semibold">Add to Differential Diagnosis:</label>
      <div className="relative">
        <input
          type="text"
          id="differential-input"
          className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="Type a diagnosis..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setAutocomplete([]), 150)} // Hide on blur with delay
        />
        {autocomplete.length > 0 && (
          <div id="autocomplete-list">
            {autocomplete.map(d => (
              <div key={d} onMouseDown={() => handleAddDiagnosis(d)}>
                {d}
              </div>
            ))}
          </div>
        )}
      </div>

      <ReactSortable
        list={differentialList}
        setList={setDifferentialList}
        className="mt-4 space-y-2"
        animation={150}
        ghostClass="sortable-ghost"
      >
        {differentialList.map((item, index) => (
          <li key={index} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg cursor-grab">
            <span>{index + 1}. {item}</span>
            <button
              className="text-red-500 hover:text-red-400 font-bold text-xl"
              onClick={() => handleRemoveDiagnosis(index)}
            >
              &times;
            </button>
          </li>
        ))}
      </ReactSortable>
    </div>
  );
};

export default DifferentialTab;
