import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CHART_COLORS = ["#4F46E5", "#0EA5E9", "#14B8A6", "#8B5CF6", "#F43F5E"];

const ResponseAnalytics = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const formSnap = await getDoc(doc(db, "forms", formId));
      if (formSnap.exists()) setForm(formSnap.data());

      const respSnap = await getDocs(collection(db, "forms", formId, "responses"));
      setResponses(respSnap.docs.map((d) => d.data()));
      setLoading(false);
    })();
  }, [formId]);

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse font-medium mt-20">Compiling metrics...</div>;
  if (!responses.length) return <div className="p-10 text-center text-gray-500 mt-20">Insufficient data: No responses logged yet.</div>;

  const grouped = {};
  form.questions.forEach((q) => {
    grouped[q.id] = [];
    responses.forEach((r) => grouped[q.id].push(r.answers[q.id]));
  });

  const getCounts = (values) => {
    const map = {};
    values.forEach((v) => {
      if (Array.isArray(v)) v.forEach((x) => (map[x] = (map[x] || 0) + 1));
      else if (v) map[v] = (map[v] || 0) + 1;
    });
    return Object.entries(map).map(([label, count], index) => ({ 
      label, 
      count,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  const completionRate = Math.round(
    (responses.filter((r) => Object.values(r.answers).every((x) => x !== "" && x !== undefined)).length / responses.length) * 100
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      <div className="mb-8">
        <Link to={`/responses/${formId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-4 inline-block flex items-center gap-1 transition-colors">
          <span>&larr;</span> Back to Data Log
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
        <p className="text-lg text-gray-500">Aggregated Form Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border-l-4 border-indigo-600 shadow-sm p-6 rounded-xl">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Datapoints</p>
          <h2 className="text-4xl font-bold text-gray-900">{form.questions.length}</h2>
        </div>
        <div className="bg-white border-l-4 border-blue-500 shadow-sm p-6 rounded-xl">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Submissions</p>
          <h2 className="text-4xl font-bold text-gray-900">{responses.length}</h2>
        </div>
        <div className="bg-white border-l-4 border-teal-500 shadow-sm p-6 rounded-xl">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Completion Rate</p>
          <h2 className="text-4xl font-bold text-gray-900">{completionRate}%</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {form.questions.map((q, idx) => {
          const answers = grouped[q.id];
          const hasChart = q.type === "radio" || q.type === "checkbox";

          return (
            <div key={q.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${!hasChart ? 'col-span-1 lg:col-span-2' : ''}`}>
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                <span className="text-indigo-400 mr-2">Q{idx + 1}.</span> {q.question}
              </h2>

              {!hasChart && (
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {answers.map((a, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-gray-700 text-sm">
                      {a || <span className="text-gray-400 italic">Left blank</span>}
                    </div>
                  ))}
                </div>
              )}

              {hasChart && (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCounts(answers)} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} allowDecimals={false} />
                      <Tooltip 
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponseAnalytics;