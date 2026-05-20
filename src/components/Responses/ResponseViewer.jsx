import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../utils/firebase.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

const ResponseViewer = () => {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;

    (async () => {
      try {
        const formSnap = await getDoc(doc(db, "forms", formId));
        if (formSnap.exists()) setForm(formSnap.data());

        const q = query(
          collection(db, "forms", formId, "responses"),
          orderBy("submittedAt", "desc")
        );

        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setResponses(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  if (loading) return <div className="min-h-screen bg-slate-50 p-10 flex justify-center items-start pt-20 text-gray-500 animate-pulse font-medium">Fetching telemetry data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-4 inline-block flex items-center gap-1 transition-colors">
              <span>&larr;</span> Back to Hub
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">{form?.title || "Data Log"}</h1>
            <p className="text-gray-500 mt-1">{responses.length} total entries recorded</p>
          </div>
        </div>

        {!responses.length && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center shadow-sm">
            <p className="text-gray-500 text-lg">No data collected yet.</p>
            <p className="text-sm text-gray-400 mt-2">Share your form link to start receiving diagnostic data.</p>
          </div>
        )}

        <div className="grid gap-6">
          {responses.map((res, index) => (
            <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Entry #{responses.length - index}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {res.submittedAt?.toDate ? res.submittedAt.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Timestamp unavailable"}
                  </span>
                </div>

                <div className="space-y-3">
                  {form?.questions?.slice(0, 2).map((q) => {
                    const ans = res.answers[q.id];
                    const displayAns = Array.isArray(ans) ? ans.join(", ") : ans;
                    return (
                      <div key={q.id} className="text-sm">
                        <span className="font-semibold text-gray-700 block mb-0.5 truncate">{q.question}</span>
                        <span className="text-gray-500 truncate block">{displayAns || <i className="text-gray-400">Blank</i>}</span>
                      </div>
                    );
                  })}
                  {form?.questions?.length > 2 && (
                    <p className="text-xs text-indigo-400 font-medium mt-2">+ {form.questions.length - 2} more fields</p>
                  )}
                </div>
              </div>

              <Link
                to={`/dashboard/${formId}/${res.id}`}
                className="w-full md:w-auto text-center bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-sm"
              >
                Open Diagnostic
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ResponseViewer;