import React from 'react';
import { v4 as uuidv4 } from "uuid";
import QuestionEditor from "./QuestionEditor";

const FormBuilder = ({ questions, setQuestions }) => {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        question: "",
        type: "radio",
        options: ["Option 1"],
        required: false,
      },
    ]);
  };

  const updateQuestion = (id, updatedData) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedData } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= questions.length) return; // Prevent out-of-bounds moves
    const arr = [...questions];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    setQuestions(arr);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      {questions.map((q, idx) => (
        <QuestionEditor
          key={q.id}
          index={idx}
          question={q}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
          moveQuestion={moveQuestion}
        />
      ))}

      {/* Styled Add Question Action Area */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:border-indigo-400 transition-all font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Question
        </button>
      </div>
    </div>
  );
}

export default FormBuilder;