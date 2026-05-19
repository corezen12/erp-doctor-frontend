import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, serverTimestamp } from "../../utils/firebase.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";

const FormPreview = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) return;
    (async () => {
      try {
        const docRef = doc(db, "forms", formId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setForm({ id: snap.id, ...snap.data() });
        } else {
          setForm(null);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [formId]);

  const handleChange = (qid, value) => {
    setAnswers((s) => ({ ...s, [qid]: value }));
  };

  const handleCheckboxChange = (qid, option) => {
    setAnswers((s) => {
      const prev = s[qid] || [];
      if (prev.includes(option)) {
        return { ...s, [qid]: prev.filter((o) => o !== option) };
      } else {
        return { ...s, [qid]: [...prev, option] };
      }
    });
  };

  const validateCurrentQuestion = () => {
    const q = form.questions[currentQuestion];
    if (!q.required) return true;

    const value = answers[q.id];

    if (q.type === "checkbox") {
      return value && value.length > 0;
    }

    return value && value.trim() !== "";
  };

  const handleSubmit = async () => {
    if (!formId) return;

    if (!validateCurrentQuestion()) {
      alert("Please answer the required question.");
      return;
    }

    try {
      await addDoc(collection(db, "forms", formId, "responses"), {
        answers,
        submittedAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit response.");
    }
  };

  if (form === null) return <div className="p-8">Form not found.</div>;
  if (!form) return <div className="p-8">Loading...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">
            🎉 Thank you for your response!
          </h2>
          <p className="text-gray-600">
            Your answers have been recorded successfully.
          </p>
        </div>
      </div>
    );
  }

  const totalQuestions = form.questions?.length || 0;
  const q = form.questions[currentQuestion];
  const progressPercentage =
    ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow">

        <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 mb-4">{form.description}</p>
        )}

        <p className="text-sm text-gray-500 mb-2">
          Question {currentQuestion + 1} of {totalQuestions}
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-3 text-lg">
            {q.question}
            {q.required && <span className="text-red-500"> *</span>}
          </label>

          {q.type === "text" && (
            <input
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
          )}

          {q.type === "radio" &&
            q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt}
                  onChange={() => handleChange(q.id, opt)}
                />
                <span>{opt}</span>
              </label>
            ))}

          {q.type === "checkbox" &&
            q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={(answers[q.id] || []).includes(opt)}
                  onChange={() =>
                    handleCheckboxChange(q.id, opt)
                  }
                />
                <span>{opt}</span>
              </label>
            ))}
        </div>

        <div className="flex justify-between mt-6">
          {currentQuestion > 0 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentQuestion((prev) => prev - 1)
              }
              className="bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentQuestion < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!validateCurrentQuestion()) {
                  alert("Please answer the required question.");
                  return;
                }
                setCurrentQuestion((prev) => prev + 1);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default FormPreview;
