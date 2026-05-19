import React from 'react'
import { v4 as uuidv4 } from "uuid";
import QuestionEditor from "./QuestionEditor";

const FormBuilder = ({ questions, setQuestions }) => {
   const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        question: "Untitled question",
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
    const arr = [...questions];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    setQuestions(arr);
  };

  return (
    <div className="w-full max-w-3xl">
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

      <div className="mt-4">
        <button
          onClick={addQuestion}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Question
        </button>
      </div>
    </div>
  );
}

export default FormBuilder