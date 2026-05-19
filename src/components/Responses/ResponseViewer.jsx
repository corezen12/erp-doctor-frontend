import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
        // Load form metadata (to show question labels)
        const formSnap = await getDoc(doc(db, "forms", formId));
        if (formSnap.exists()) setForm(formSnap.data());

        // Load responses
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

  if (loading) return <div className="p-10 text-gray-600">Loading responses...</div>;
  if (!responses.length) return <div className="p-10 text-gray-600">No responses yet.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* HEADER */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h1 className="text-3xl font-bold">{form?.title || "Responses"}</h1>
          <p className="text-gray-600 mt-1">{responses.length} responses</p>
        </div>

        {/* LIST OF RESPONSES */}
        <div className="space-y-6">
          {responses.map((res) => (
  <div key={res.id} className="bg-white p-5 rounded-xl shadow">
    <div className="text-sm text-gray-500 mb-3">
      Submitted on:{" "}
      {res.submittedAt?.toDate
        ? res.submittedAt.toDate().toLocaleString()
        : "—"}
    </div>

    {/* ANSWERS */}
    <div className="space-y-4">
      {form?.questions?.map((q) => (
        <div key={q.id} className="border-b pb-3">
          {/* Question Text */}
          <p className="font-medium">{q.question}</p>

          {/* Answer */}
          <p className="text-gray-700 mt-1">
            {Array.isArray(res.answers[q.id])
              ? res.answers[q.id].join(", ")
              : res.answers[q.id] || (
                  <span className="text-gray-400">No answer</span>
                )}
          </p>
        </div>
      ))}
    </div>

    {/* NEW DASHBOARD BUTTON */}
    <div className="mt-4">
      <a
        href={`/dashboard/${formId}/${res.id}`}
        className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        View Dashboard
      </a>
    </div>
  </div>
))}

        </div>

      </div>
    </div>
  );
};

export default ResponseViewer;
