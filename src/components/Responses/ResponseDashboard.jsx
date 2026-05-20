import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

const ResponseDashboard = () => {
  const { formId, responseId } = useParams();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const formSnap = await getDoc(doc(db, "forms", formId));
        const resSnap  = await getDoc(doc(db, "forms", formId, "responses", responseId));
        
        if (formSnap.exists()) setForm(formSnap.data());
        if (resSnap.exists()) setResponse(resSnap.data());
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load diagnostic data.");
      }
    })();
  }, [formId, responseId]);

  const analyzeWithAI = async () => {
    setLoadingAI(true);
    setError("");

    try {
      // Connects to your live Render backend
      const API_URL = import.meta.env.VITE_BACKEND_URL || "https://erp-doctor-backend.onrender.com/analyze"; 
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, response }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setInsights(data.analysis);
      }
    } catch (err) {
      setError("Failed to connect to the AI Diagnostic Engine.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!form || !response) return <div className="min-h-screen bg-slate-50 p-10 flex justify-center pt-20 animate-pulse text-gray-500 font-medium">Loading command center...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <Link to={`/responses/${formId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-4 inline-block flex items-center gap-1 transition-colors">
            <span>&larr;</span> Back to Data Log
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Diagnostic Profile
          </h1>
          <p className="text-gray-500 mt-2">
            Submitted: {response.submittedAt?.toDate ? response.submittedAt.toDate().toLocaleString() : "Unknown"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: RAW DATA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                Raw Telemetry
              </h2>

              <div className="space-y-6">
                {form.questions.map((q, idx) => {
                  const ans = response.answers[q.id];
                  const displayAns = Array.isArray(ans) ? ans.join(", ") : ans;
                  return (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-2 text-sm">
                        <span className="text-indigo-400 mr-2">{idx + 1}.</span> {q.question}
                      </p>
                      <p className="text-gray-600">
                        {displayAns || <span className="text-gray-400 italic">No data provided</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI ENGINE */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-indigo-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>✨</span> Intelligence Engine
                </h2>
                
                {!insights && !loadingAI && (
                  <button
                    onClick={analyzeWithAI}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-sm font-semibold text-sm flex items-center gap-2"
                  >
                    Run Deep Analysis
                  </button>
                )}
              </div>

              {loadingAI && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-600 font-medium animate-pulse">Synthesizing workflow diagnostics...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
                  ⚠️ {error}
                </div>
              )}

              {insights && (
                <div className="prose prose-indigo max-w-none bg-slate-50 p-6 md:p-8 rounded-xl border border-slate-200 flex-1 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed text-sm md:text-base">
                    {insights}
                  </pre>
                </div>
              )}

              {!insights && !loadingAI && !error && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Awaiting Execution</h3>
                  <p className="text-gray-500 text-sm max-w-sm">Trigger the AI to generate readiness scores, identify operational risks, and provide actionable recommendations.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResponseDashboard;