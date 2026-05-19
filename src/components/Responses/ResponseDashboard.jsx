import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { ai } from "../../utils/gemini";

const ResponseDashboard = () => {
  const { formId, responseId } = useParams();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Load data
  useEffect(() => {
    (async () => {
      const formSnap = await getDoc(doc(db, "forms", formId));
      const resSnap  = await getDoc(doc(db, "forms", formId, "responses", responseId));

      setForm(formSnap.data());
      setResponse(resSnap.data());
    })();
  }, []);

  // Generate AI report
  const analyzeWithAI = async () => {
  setLoadingAI(true);

  try {
    console.log("Sending payload:", {
  answers: response.answers
});

    const res = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form: form,
        response: response,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setInsights("⚠️ AI Error: " + data.error);
    } else {
      setInsights(data.analysis);
    }
  } catch (err) {
    setInsights("⚠️ Failed to connect to AI analysis server.");
  }

  setLoadingAI(false);
};

  if (!form || !response) return <div>Loading dashboard...</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100 flex justify-center">
      <div className="max-w-4xl w-full">

        <h1 className="text-3xl font-bold mb-4">
          Response Analytics Dashboard
        </h1>

        {/* FORM QUESTIONS + ANSWERS */}
        <div className="bg-white p-5 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Submitted Answers</h2>

          {form.questions.map(q => (
            <div key={q.id} className="mb-3 border-b pb-2">
              <p className="font-medium">{q.question}</p>
              <p className="text-gray-700">
                {Array.isArray(response.answers[q.id])
                  ? response.answers[q.id].join(", ")
                  : response.answers[q.id] || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* AI REPORT CARD */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">AI Insights</h2>

          {!insights && (
            <button
              onClick={analyzeWithAI}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
            >
              ⚡ Generate AI Report
            </button>
          )}

          {loadingAI && <p className="text-gray-500 mt-2">Analyzing...</p>}

          {insights && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <pre className="whitespace-pre-wrap text-sm leading-6">
                {insights}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDashboard;
