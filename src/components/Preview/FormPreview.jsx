import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, serverTimestamp } from "../../utils/firebase.js";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

const FormPreview = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) return;
    (async () => {
      try {
        const docRef = doc(db, "forms", formId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setForm({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [formId]);

  const handleChange = (qid, value) => {
    setError(""); // Clear error on typing
    setAnswers((s) => ({ ...s, [qid]: value }));
  };

  const handleCheckboxChange = (qid, option) => {
    setError("");
    setAnswers((s) => {
      const prev = s[qid] || [];
      return prev.includes(option) 
        ? { ...s, [qid]: prev.filter((o) => o !== option) } 
        : { ...s, [qid]: [...prev, option] };
    });
  };

  const validateCurrentQuestion = () => {
    const q = form.questions[currentQuestion];
    if (!q.required) return true;
    const value = answers[q.id];
    return q.type === "checkbox" ? value && value.length > 0 : value && value.trim() !== "";
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      setError("This question requires an answer before proceeding.");
      return;
    }
    setError("");
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!formId) return;
    if (!validateCurrentQuestion()) {
      setError("Please answer the required question before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, "forms", formId, "responses"), {
        answers,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit response. Please try again.");
    }
  };

  if (!form) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-500 animate-pulse">Loading secure form...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Data Received</h2>
          <p className="text-gray-500">Your inputs have been securely logged in the system. You may now close this window.</p>
        </div>
      </div>
    );
  }

  const totalQuestions = form.questions?.length || 0;
  const q = form.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center items-start pt-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}
          
          <div className="flex justify-between text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="min-h-[250px] mb-8 flex flex-col justify-center">
          <label className="block text-2xl font-medium text-gray-800 mb-6 leading-tight">
            {q.question} {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.type === "text" && (
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border-b-2 border-gray-200 py-3 text-lg focus:outline-none focus:border-indigo-600 transition-colors bg-transparent"
            />
          )}

          {(q.type === "radio" || q.type === "checkbox") && (
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all">
                  <input
                    type={q.type}
                    name={q.id}
                    checked={q.type === 'radio' ? answers[q.id] === opt : (answers[q.id] || []).includes(opt)}
                    onChange={() => q.type === 'radio' ? handleChange(q.id, opt) : handleCheckboxChange(q.id, opt)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-lg text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm mt-4 font-medium animate-pulse">{error}</p>}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => { setError(""); setCurrentQuestion((prev) => prev - 1); }}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${currentQuestion === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Back
          </button>

          {currentQuestion < totalQuestions - 1 ? (
            <button type="button" onClick={handleNext} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
              Submit Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPreview;