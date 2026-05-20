import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";

const PublicForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "forms", formId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setForm(snap.data());
      }
    };
    load();
  }, [formId]);

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "forms", formId, "responses"), {
        answers,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      setError("An error occurred while submitting. Please try again.");
    }
  };

  if (!form) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-500 animate-pulse">Loading secure portal...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Submission Complete</h2>
          <p className="text-gray-500">Your data has been securely routed to the operations dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center items-start pt-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl p-8 shadow-xl border border-gray-100">

        {/* HEADER */}
        <div className="mb-10 border-b border-gray-100 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{form.title}</h1>
          {form.description && <p className="text-lg text-gray-600">{form.description}</p>}
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-10 mb-10">
          {form.questions?.map((q, index) => (
            <div key={index} className="bg-white">
              
              <p className="text-xl font-medium text-gray-800 mb-4">
                <span className="text-indigo-500 mr-2">{index + 1}.</span> 
                {q.question || q.label} {q.required && <span className="text-red-500">*</span>}
              </p>

              {/* Short Answer */}
              {q.type === "text" && (
                <input
                  type="text"
                  placeholder="Your answer"
                  className="w-full mt-2 p-3 border-b-2 border-gray-200 bg-gray-50 rounded-t-lg focus:outline-none focus:border-indigo-600 focus:bg-indigo-50/30 transition-colors text-lg"
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              )}

              {/* Paragraph */}
              {q.type === "paragraph" && (
                <textarea
                  className="w-full mt-2 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                  rows={4}
                  placeholder="Provide detailed context..."
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              )}

              {/* Multiple Choice (Radio) & Checkbox */}
              {(q.type === "radio" || q.type === "checkbox") && (
                <div className="mt-4 space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all">
                      <input
                        type={q.type}
                        name={q.id}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        onChange={(e) => {
                          if (q.type === "radio") {
                            setAnswers({ ...answers, [q.id]: opt });
                          } else {
                            const prev = answers[q.id] || [];
                            if (e.target.checked) {
                              setAnswers({ ...answers, [q.id]: [...prev, opt] });
                            } else {
                              setAnswers({ ...answers, [q.id]: prev.filter((x) => x !== opt) });
                            }
                          }
                        }}
                      />
                      <span className="text-lg text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            Submit Data
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublicForm;