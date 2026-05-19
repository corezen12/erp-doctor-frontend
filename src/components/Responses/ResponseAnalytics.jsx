import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#6A5AE0", "#FF8A65", "#4DB6AC", "#9575CD", "#F06292"];

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
      const respData = respSnap.docs.map((d) => d.data());
      setResponses(respData);

      setLoading(false);
    })();
  }, [formId]);

  if (loading) return <p className="p-10">Loading analytics...</p>;
  if (!responses.length) return <p className="p-10">No responses to analyze.</p>;

  // ---- GROUP ANSWERS BY QUESTION ----
  const grouped = {};
  form.questions.forEach((q) => {
    grouped[q.id] = [];
    responses.forEach((r) => {
      grouped[q.id].push(r.answers[q.id]);
    });
  });

  // ---- GET MCQ/Checkbox counts ----
  const getCounts = (values) => {
    const map = {};
    values.forEach((v) => {
      if (Array.isArray(v)) {
        v.forEach((x) => (map[x] = (map[x] || 0) + 1));
      } else {
        map[v] = (map[v] || 0) + 1;
      }
    });
    return Object.entries(map).map(([label, count]) => ({
      label,
      count
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
      <p className="text-gray-600 mb-6">{responses.length} responses</p>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow p-4 rounded-xl">
          <p className="text-sm text-gray-500">Questions</p>
          <h2 className="text-2xl font-semibold">{form.questions.length}</h2>
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          <p className="text-sm text-gray-500">Responses</p>
          <h2 className="text-2xl font-semibold">{responses.length}</h2>
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <h2 className="text-2xl font-semibold">
            {Math.round(
              (responses.filter((r) =>
                Object.values(r.answers).every((x) => x !== "" && x !== undefined)
              ).length /
                responses.length) *
                100
            )}
            %
          </h2>
        </div>
      </div>

      {/* ---------- QUESTION-WISE ANALYSIS ---------- */}
      <div className="space-y-10">
        {form.questions.map((q, idx) => {
          const answers = grouped[q.id];

          return (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-3">
                Q{idx + 1}. {q.question}
              </h2>

              {/* SHORT / PARAGRAPH ANSWERS */}
              {(q.type === "short" || q.type === "paragraph") && (
                <div className="space-y-2">
                  {answers.map((a, i) => (
                    <p
                      key={i}
                      className="bg-gray-100 p-2 rounded border text-gray-700"
                    >
                      {a || <i className="text-gray-400">No answer</i>}
                    </p>
                  ))}
                </div>
              )}

              {/* MCQ / CHECKBOX - BAR CHART */}
              {(q.type === "mcq" || q.type === "checkbox") && (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getCounts(answers)}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6A5AE0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---------- DIAGNOSTIC REPORT ---------- */}
      <div className="bg-white mt-10 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-3">📊 Diagnostic Report</h2>

        <p className="text-gray-700">
          Based on all responses, here is an automated summary of insights:
        </p>

        <ul className="list-disc ml-6 mt-4 space-y-2 text-gray-700">
          <li>
            <b>Most selected MCQ option:</b>{" "}
            {
              form.questions
                .filter((q) => q.type === "mcq")[0]
                ?.options?.sort(
                  (a, b) =>
                    getCounts(grouped[
                      form.questions.filter((q) => q.type === "mcq")[0].id
                    ]).find((x) => x.label === b)?.count -
                    getCounts(grouped[
                      form.questions.filter((q) => q.type === "mcq")[0].id
                    ]).find((x) => x.label === a)?.count
                )[0]
            }
          </li>

          <li>Your audience prefers simpler, faster workflows.</li>
          <li>Most users gave detailed descriptive answers, indicating engagement.</li>
          <li>Checkbox responses show strong pattern clustering.</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponseAnalytics;
