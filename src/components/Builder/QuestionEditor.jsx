import React from 'react';
import OptionInput from "./OptionInput";

const QuestionEditor = ({
  question,
  updateQuestion,
  deleteQuestion,
  index,
  moveQuestion,
}) => {
  const addOption = () => {
    updateQuestion(question.id, {
      options: [...question.options, `Option ${question.options.length + 1}`],
    });
  };

  const updateOption = (i, value) => {
    const updated = [...question.options];
    updated[i] = value;
    updateQuestion(question.id, { options: updated });
  };

  const removeOption = (i) => {
    updateQuestion(question.id, {
      options: question.options.filter((_, idx) => idx !== i),
    });
  };

  // Helper to check if the question type requires options
  const hasOptions = question.type === "radio" || question.type === "checkbox";

  return (
    <div className="bg-white w-full rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 mb-6 group/card">
      <div className="flex justify-between items-start gap-6">
        
        {/* Left Side: Inputs */}
        <div className="flex-1">
          <input
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            placeholder="Question title"
            className="w-full text-xl font-medium border-b-2 border-gray-100 pb-2 mb-4 focus:outline-none focus:border-indigo-500 transition-colors bg-transparent placeholder-gray-400"
          />

          {/* Render options ONLY if it's a radio or checkbox */}
          {hasOptions && (
            <div className="space-y-1 mb-4">
              {question.options.map((opt, idx) => (
                <OptionInput
                  key={idx}
                  value={opt}
                  questionType={question.type}
                  onChange={(v) => updateOption(idx, v)}
                  onDelete={() => removeOption(idx)}
                />
              ))}
              <button 
                onClick={addOption} 
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-2 flex items-center gap-1"
              >
                <span>+</span> Add Option
              </button>
            </div>
          )}

          {/* Short Answer Placeholder */}
          {!hasOptions && (
            <div className="mb-4">
              <input 
                disabled 
                placeholder="Short answer text will go here..." 
                className="w-2/3 border-b border-dashed border-gray-300 pb-1 bg-transparent text-gray-400 cursor-not-allowed" 
              />
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50 mt-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 cursor-pointer"
            >
              <option value="radio">Multiple Choice</option>
              <option value="checkbox">Checkboxes</option>
              <option value="text">Short Answer</option>
            </select>

            <div className="h-6 w-px bg-gray-200"></div> {/* Divider */}

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
              />
              Required
            </label>
          </div>
        </div>

        {/* Right Side: Actions (Move & Delete) */}
        <div className="flex flex-col items-center justify-between border-l border-gray-100 pl-4 h-full">
          <div className="flex flex-col gap-1 mb-6">
            <button
              onClick={() => moveQuestion && moveQuestion(index, Math.max(0, index - 1))}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Move Up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
            <button
              onClick={() => moveQuestion && moveQuestion(index, index + 1)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Move Down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete Question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionEditor;