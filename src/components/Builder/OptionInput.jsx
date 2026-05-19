import React from 'react'

const OptionInput = ({ value, onChange, onDelete }) => {
  return (
    <div className="flex items-center gap-3 mb-2">
      <input type="radio" disabled className="text-purple-600" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-purple-500"
      />
      <button onClick={onDelete} className="text-gray-400 hover:text-red-500">🗑️</button>
    </div>
  );
}

export default OptionInput