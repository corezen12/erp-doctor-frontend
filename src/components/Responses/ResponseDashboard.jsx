import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// --- BOMB-PROOF AI PARSER ---
const parseAIReport = (rawText) => {
  if (!rawText) return null;

  try {
    // Helper to safely extract text between two section headers
    const getSection = (startKeyword, endKeyword) => {
      const startIndex = rawText.indexOf(startKeyword);
      if (startIndex === -1) return "";
      
      const contentStart = rawText.indexOf("\n", startIndex);
      if (contentStart === -1) return "";

      let endIndex = rawText.length;
      if (endKeyword) {
        const foundEnd = rawText.indexOf(endKeyword, contentStart);
        if (foundEnd !== -1) endIndex = foundEnd;
      }
      return rawText.substring(contentStart, endIndex).trim();
    };

    // Extract Sections
    const summary = getSection("PART 1", "PART 2");
    const scoreSection = getSection("PART 2", "PART 3");
    const deptSection = getSection("PART 3", "PART 4");
    const risksSection = getSection("PART 4", "PART 5");
    const recsSection = getSection("PART 5", "PART 6");
    const verdictSection = getSection("PART 6", "");

    // Process Overall Score
    const scoreMatch = scoreSection.match(/([1-5])/);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const scoreExplanation = scoreSection.replace(/\*\*.*?\*\*/g, '').replace(/Score.*?[1-5].*?\n/i, '').trim();

    // Process Departments for the Chart
    const departments = [];
    const deptLines = deptSection.split('\n');
    deptLines.forEach(line => {
      // Looks for any line with a number 1-5 that also has letters (the department name)
      const match = line.match(/[-*]*\s*([a-zA-Z\s&/]+)\s*[-*:]+\s*([1-5])/);
      if (match && match[1].trim().length > 2) {
        departments.push({ 
          name: match[1].replace(/\*/g, '').replace(/:/g, '').trim(), 
          score: parseInt(match[2]) 
        });
      }
    });

    // Process Lists
    const cleanList = (text) => text.split('\n')
      .map(l => l.replace(/^[-*]+/, '').replace(/\*\*/g, '').trim())
      .filter(l => l.length > 5);

    return {
      summary: summary || "Summary could not be parsed.",
      overallScore,
      scoreExplanation: scoreExplanation || "Explanation unavailable.",
      departments,
      rawDepartments: deptSection,
      risks: cleanList(risksSection),
      recommendations: cleanList(recsSection),
      verdict: verdictSection.replace(/\*/g, '').trim() || "Analyzed"
    };
  } catch (err) {
    console.error("Failed to parse AI text:", err);
    return null; // Fallback to raw text view if parsing completely crashes
  }
};


const ResponseDashboard = () => {
  const { formId, responseId } = useParams();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  
  const [rawInsights, setRawInsights] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showRaw, setShowRaw] = useState(false); // Toggle to view raw text
  
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
        const parsed = parseAIReport(data.analysis);
        setParsedData(parsed);
        // If parser fails to find a score, default to raw view
        if (!parsed || parsed.overallScore === 0) setShowRaw(true);
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full max-h-[850px] overflow-y-auto custom-scrollbar">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Form Inputs
              </h2>
              <div className="space-y-5">
                {form.questions.map((q, idx) => {
                  const ans = response.answers[q.id];
                  const displayAns = Array.isArray(ans) ? ans.join(", ") : ans;
                  return (
                    <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-semibold text-gray-700 mb-2 text-sm leading-tight">
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

            {/* WAITING STATE */}
            {!rawInsights && !loadingAI && !error && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center flex-1 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Engine Ready</h3>
                <p className="text-gray-500 max-w-md">Click the button above to generate a full visual diagnostic report, readiness scores, and operational risk factors.</p>
              </div>
            )}

            {/* SUCCESS STATE - DASHBOARD UI */}
            {rawInsights && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                
                {/* Header & Toggle */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>✨</span> Intelligence Engine
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-500 font-medium">View Raw AI Text</span>
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showRaw}
                      onChange={() => setShowRaw(!showRaw)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                  </label>
                </div>

                {/* RAW FALLBACK VIEW */}
                {(showRaw || !parsedData) ? (
                   <div className="prose prose-indigo max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-y-auto max-h-[600px]">
                     <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed text-sm">
                       {rawInsights}
                     </pre>
                   </div>
                ) : (
                  /* BEAUTIFIED WIDGET VIEW */
                  <div className="space-y-6">
                    
                    {/* Top Row: Score & Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Readiness Score</h3>
                        <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center mb-4 bg-white ${
                          parsedData.overallScore >= 4 ? 'border-emerald-400 text-emerald-500' : 
                          parsedData.overallScore === 3 ? 'border-amber-400 text-amber-500' : 'border-rose-400 text-rose-500'
                        }`}>
                          <span className="text-4xl font-black">{parsedData.overallScore}</span>
                          <span className="text-lg text-gray-300 ml-1">/5</span>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          parsedData.overallScore >= 4 ? 'bg-emerald-100 text-emerald-800' : 
                          parsedData.overallScore === 3 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {parsedData.verdict}
                        </span>
                      </div>

                      <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Executive Summary</h3>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {parsedData.summary}
                        </p>
                        {parsedData.scoreExplanation && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                             <p className="text-gray-500 text-sm font-medium">
                               <span className="text-indigo-500 font-bold mr-1">Note:</span> 
                               {parsedData.scoreExplanation}
                             </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Department Chart */}
                    {parsedData.departments.length > 0 ? (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Departmental Heatmap</h3>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={parsedData.departments} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                              <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 5]} tickCount={6} tick={{fontSize: 12, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: '#E5E7EB'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                {parsedData.departments.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={
                                    entry.score >= 4 ? '#34D399' : entry.score === 3 ? '#FBBF24' : '#FB7185'
                                  } />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : null}

                    {/* Bottom Row: Risks & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                        <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          Key Vulnerabilities
                        </h3>
                        <ul className="space-y-3">
                          {parsedData.risks.length > 0 ? parsedData.risks.map((risk, i) => (
                            <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-rose-400 mt-0.5">•</span>
                              <span className="leading-relaxed">{risk}</span>
                            </li>
                          )) : <li className="text-gray-500 text-sm italic">No specific risks extracted.</li>}
                        </ul>
                      </div>

                      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                        <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Action Plan
                        </h3>
                        <ul className="space-y-3">
                          {parsedData.recommendations.length > 0 ? parsedData.recommendations.map((rec, i) => (
                            <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">→</span>
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          )) : <li className="text-gray-500 text-sm italic">No specific recommendations extracted.</li>}
                        </ul>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDashboard;