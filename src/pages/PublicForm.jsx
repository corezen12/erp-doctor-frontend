import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";

const PublicForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});

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
    await addDoc(collection(db, "forms", formId, "responses"), {
      answers,
      submittedAt: serverTimestamp(),
    });

    alert("Response submitted!");
  };

  if (!form) return <p className="p-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow p-6">

        {/* Title + Description EXACT LIKE PREVIEW */}
        <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-6">{form.description}</p>

        {/* QUESTIONS LIST */}
        {form.questions?.map((q, index) => (
          <div key={index} className="mb-6 border-b pb-4">

            {/* Question Label */}
            <p className="font-medium text-lg">
  {q.question || q.label}
</p>

            {/* Short Answer */}
            {q.type === "short" && (
              <input
                type="text"
                className="w-full mt-2 p-2 border rounded"
                onChange={(e) =>
                  setAnswers({ ...answers, [q.id]: e.target.value })
                }
              />
            )}

            {/* Paragraph */}
            {q.type === "paragraph" && (
              <textarea
                className="w-full mt-2 p-2 border rounded"
                rows={3}
                onChange={(e) =>
                  setAnswers({ ...answers, [q.id]: e.target.value })
                }
              />
            )}

            {/* Multiple Choice */}
            {q.type === "radio" && (
  <div className="mt-2">
    {q.options?.map((opt, i) => (
      <label key={i} className="flex items-center gap-2 mb-1">
        <input
          type="radio"
          name={q.id}
          onChange={() =>
            setAnswers({ ...answers, [q.id]: opt })
          }
        />
        {opt}
      </label>
    ))}
  </div>
)}


            {/* Checkbox */}
            {q.type === "checkbox" && (
              <div className="mt-2">
                {q.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const prev = answers[q.id] || [];
                        if (e.target.checked) {
                          setAnswers({
                            ...answers,
                            [q.id]: [...prev, opt],
                          });
                        } else {
                          setAnswers({
                            ...answers,
                            [q.id]: prev.filter((x) => x !== opt),
                          });
                        }
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default PublicForm;
