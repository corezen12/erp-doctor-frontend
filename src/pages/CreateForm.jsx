import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from "uuid";
import FormBuilder from "../components/Builder/FormBuilder";
import { db, serverTimestamp } from "../utils/firebase.js";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp as fsServerTs,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";

const CreateForm = () => {
   const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingFormId = searchParams.get("id"); // optional: ?id=docId to edit

  const [formId, setFormId] = useState(editingFormId || null);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDesc, setFormDesc] = useState("");
  const [questions, setQuestions] = useState([]);

  // If editing existing form, load it
  useEffect(() => {
    if (!editingFormId) return;
    (async () => {
      try {
        const docRef = doc(db, "forms", editingFormId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormTitle(data.title || "Untitled Form");
          setFormDesc(data.description || "");
          setQuestions(data.questions || []);
          setFormId(snap.id);
        }
      } catch (err) {
        console.error("Failed to load form:", err);
      }
    })();
  }, [editingFormId]);

  const handleSave = async () => {
  // Ensure each question has an ID
  const fixedQuestions = questions.map(q => ({
    ...q,
    id: q.id || crypto.randomUUID()
  }));

  const payload = {
    title: formTitle,
    description: formDesc,
    questions: fixedQuestions,
    updatedAt: serverTimestamp(),
  };

  try {
    if (formId) {
      await setDoc(doc(db, "forms", formId), payload, { merge: true });
    } else {
      const created = await addDoc(collection(db, "forms"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      setFormId(created.id);
    }
    alert("Form saved. Preview or copy the URL to share.");
  } catch (err) {
    console.error(err);
    alert("Failed to save form.");
  }
};



  const handleOpenPreview = () => {
    if (!formId) {
      alert("Save the form first (click Save Form).");
      return;
    }
    navigate(`/preview/${formId}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex flex-col items-center">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow p-6 mb-6">
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="w-full text-3xl font-semibold border-b border-gray-300 mb-2 focus:outline-none focus:border-purple-500"
        />
        <textarea
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
          className="w-full text-gray-600 border-b border-gray-200 focus:outline-none focus:border-purple-400 resize-none"
          rows={2}
          placeholder="Form description"
        />
      </div>

      <FormBuilder questions={questions} setQuestions={setQuestions} />

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Save Form
        </button>

        <button
          onClick={handleOpenPreview}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Preview Form
        </button>
      </div>
    </div>
  );
}

export default CreateForm