import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Helper to parse the raw AI text into structured data for charts
const parseAIReport = (rawText) => {
  if (!rawText) return null;

  // Split by the specific headers we gave the AI in the prompt
  const parts = rawText.split(/### 📌 PART \d — [^\n]+/);
  
  // parts[0] = empty/intro
  // parts[1] = Summary
  // parts[2] = Overall Score
  // parts[3] = Department Scores
  // parts[4] = Risks
  // parts[5] = Recommendations
  // parts[6] = Verdict

  // Extract Overall Score (Look for a number 1-5)
  const scoreMatch = parts[2]?.match(/\b([1-5])\b/);
  const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

  // Extract Department Scores for the Chart
  // Looks for pattern: "- Department Name: 4" or "- **Dept**: 3"
  const departments = [];
  const deptRegex = /- \**([A-Za-z &\/]+)\**[^\d]*([1-5])/g;
  let match;
  while ((match = deptRegex.exec(parts[3] || ""))) {
    departments.push({ name: match[1].trim(), score: parseInt(match[2]) });
  }

  // Extract Lists
  const extractList = (text) => 
    (text || "").split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^- /, '').replace(/\*\*/g, '').trim());

  return {
    summary: parts[1]?.trim() || "No summary generated.",
    overallScore,
    scoreExplanation: (parts[2] || "").replace(/\b[1-5]\b/, '').replace(/Score:/g, '').replace(/\*\*/g, '').trim(),
    departments,
    rawDepartments: parts[3]?.trim() || "",
    risks: extractList(parts[4]),
    recommendations: extractList(parts[5]),
    verdict: parts[6]?.trim().replace(/\*\*/g, '') || "Pending"
  };
};

const ResponseDashboard = () => {
  const { formId, responseId } = useParams();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  
  const [rawInsights, setRawInsights] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  
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
        setError("Failed to load diagnostic data.");
      }
    })();
  }, [formId, responseId]);

  const analyzeWithAI = async () => {
    setLoadingAI(true);
    setError("");

    try {
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
        setRawInsights(data.analysis);
        setParsedData(parseAIReport(data.analysis));
      }
    } catch (err) {
      setError("Failed to connect to the AI Diagnostic Engine.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!form || !response) return <div className="min-h-screen bg-slate-50 p-10 flex justify-center pt-20 animate-pulse text-gray-500 font-medium">Loading command center...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <Link to={`/responses/${formId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-4 inline-block flex items-center gap-1 transition-colors">
              <span>&larr;</span> Back to Data Log
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Diagnostic Profile
            </h1>
            <p className="text-gray-500 mt-2 font-mono text-sm">
              ID: {responseId} | {response.submittedAt?.toDate ? response.submittedAt.toDate().toLocaleString() : "Unknown Timestamp"}
            </p>
          </div>
          
          {!rawInsights && !loadingAI && (
            <button onClick={analyzeWithAI} className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              Run Diagnostic Engine
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: RAW TELEMETRY */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full max-h-[800px] overflow-y-auto custom-scrollbar">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 sticky top-0 bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Form Inputs
              </h2>
              <div className="space-y-5">
                {form.questions.map((q, idx) => {
                  const ans = response.answers[q.id];
                  const displayAns = Array.isArray(ans) ? ans.join(", ") : ans;
                  return (
                    <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-semibold text-gray-700 mb-1 text-sm leading-tight">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-indigo-900 font-medium text-sm">
                        {displayAns || <span className="text-gray-400 italic">No answer</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: AI DASHBOARD */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {loadingAI && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-indigo-100 flex flex-col items-center justify-center flex-1">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 animate-pulse">Analyzing Workflow Telemetry...</h3>
                <p className="text-gray-500 text-center max-w-md">The AI is cross-referencing your inputs against enterprise operations standards.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium shadow-sm">
                ⚠️ {error}
              </div>
            )}

            {!parsedData && !loadingAI && !error && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center flex-1 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Engine Ready</h3>
                <p className="text-gray-500 max-w-md">Click the button above to generate a full visual diagnostic report, readiness scores, and operational risk factors.</p>
              </div>
            )}

            {/* DYNAMIC AI UI */}
            {parsedData && (
              <>
                {/* Top Row: Score & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Gauge Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Readiness Score</h3>
                    <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4 ${
                      parsedData.overallScore >= 4 ? 'border-green-400 text-green-500' : 
                      parsedData.overallScore === 3 ? 'border-yellow-400 text-yellow-500' : 'border-red-400 text-red-500'
                    }`}>
                      <span className="text-5xl font-black">{parsedData.overallScore}</span>
                      <span className="text-xl text-gray-300 ml-1">/5</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      parsedData.overallScore >= 4 ? 'bg-green-50 text-green-700' : 
                      parsedData.overallScore === 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {parsedData.verdict}
                    </span>
                  </div>

                  {/* Summary Card */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Executive Summary</h3>
                    <p className="text-gray-700 leading-relaxed text-lg font-medium">
                      {parsedData.summary}
                    </p>
                    <p className="text-gray-500 text-sm mt-4 border-t border-gray-50 pt-4">
                      {parsedData.scoreExplanation}
                    </p>
                  </div>
                </div>

                {/* Middle Row: Department Chart */}
                {parsedData.departments.length > 0 ? (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Departmental Heatmap</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={parsedData.departments} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                          <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 5]} tickCount={6} tick={{fontSize: 12, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {parsedData.departments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                entry.score >= 4 ? '#34D399' : entry.score === 3 ? '#FBBF24' : '#F87171'
                              } />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Department Breakdown</h3>
                    <p className="whitespace-pre-wrap text-gray-600">{parsedData.rawDepartments}</p>
                  </div>
                )}

                {/* Bottom Row: Risks & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risks */}
                  <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Key Vulnerabilities
                    </h3>
                    <ul className="space-y-3">
                      {parsedData.risks.length > 0 ? parsedData.risks.map((risk, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{risk}</span>
                        </li>
                      )) : <li className="text-gray-500 text-sm">No specific risks parsed.</li>}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Action Plan
                    </h3>
                    <ul className="space-y-3">
                      {parsedData.recommendations.length > 0 ? parsedData.recommendations.map((rec, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      )) : <li className="text-gray-500 text-sm">No specific recommendations parsed.</li>}
                    </ul>
                  </div>
                </div>

              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDashboard;