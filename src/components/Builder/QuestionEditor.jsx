import React from 'react'
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

  return (
    <div className="bg-white w-full rounded-2xl shadow p-5 mb-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <input
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            className="w-full text-lg border-b border-gray-300 mb-3 focus:outline-none focus:border-purple-500"
          />

          {question.type === "radio" &&
            question.options.map((opt, idx) => (
              <OptionInput
                key={idx}
                value={opt}
                onChange={(v) => updateOption(idx, v)}
                onDelete={() => removeOption(idx)}
              />
            ))}

          {question.type === "checkbox" &&
            question.options.map((opt, idx) => (
              <OptionInput
                key={idx}
                value={opt}
                onChange={(v) => updateOption(idx, v)}
                onDelete={() => removeOption(idx)}
              />
            ))}

          <div className="flex items-center gap-4 mt-3">
            <button onClick={addOption} className="text-purple-600 font-medium">
              + Add option
            </button>

            <select
              value={question.type}
              onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="radio">Multiple choice</option>
              <option value="checkbox">Checkboxes</option>
              <option value="text">Short answer</option>
            </select>

            <label className="ml-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              />
              Required
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => moveQuestion && moveQuestion(index, Math.max(0, index - 1))}
              className="text-sm text-gray-500"
            >
              ↑
            </button>
            <button
              onClick={() => moveQuestion && moveQuestion(index, index + 1)}
              className="text-sm text-gray-500"
            >
              ↓
            </button>
          </div>

          <button
            onClick={() => deleteQuestion(question.id)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionEditor