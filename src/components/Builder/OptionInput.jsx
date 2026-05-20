import React from 'react';

const OptionInput = ({ value, onChange, onDelete, questionType }) => {
  return (
    <div className="flex items-center gap-3 mb-2 group">
      {/* Dynamically change the icon based on question type */}
      <input 
        type={questionType === 'checkbox' ? 'checkbox' : 'radio'} 
        disabled 
        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300" 
      />
      
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Option text"
        className="flex-1 pb-1 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors bg-transparent"
      />
      
      {/* Hide delete button until hovered for a cleaner UI */}
      <button 
        onClick={onDelete} 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
        title="Remove Option"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default OptionInput;