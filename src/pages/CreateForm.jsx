import React, { useEffect, useState } from 'react';
import FormBuilder from "../components/Builder/FormBuilder";
import { db, serverTimestamp as fsServerTs } from "../utils/firebase.js";
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";

const CreateForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingFormId = searchParams.get("id");

  const [formId, setFormId] = useState(editingFormId || null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [questions, setQuestions] = useState([]);
  
  // Custom UI State for saving
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!editingFormId) return;
    (async () => {
      try {
        const docRef = doc(db, "forms", editingFormId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormTitle(data.title || "");
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
    setStatus({ message: 'Saving...', type: 'loading' });
    
    const fixedQuestions = questions.map(q => ({
      ...q,
      id: q.id || crypto.randomUUID()
    }));

    const payload = {
      title: formTitle || "Untitled Workflow",
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
      setStatus({ message: '✓ Form saved successfully.', type: 'success' });
      setTimeout(() => setStatus({ message: '', type: '' }), 3000); // Clear after 3s
    } catch (err) {
      console.error(err);
      setStatus({ message: '⚠️ Failed to save form.', type: 'error' });
    }
  };

  const handleOpenPreview = () => {
    if (!formId) {
      setStatus({ message: '⚠️ Please save the form first.', type: 'error' });
      return;
    }
    navigate(`/preview/${formId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 flex flex-col items-center">
      
      {/* HEADER TILE */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-sm border border-gray-200 p-8 mt-10 mb-2 transition-shadow hover:shadow-md">
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Untitled Workflow"
          className="w-full text-4xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-100 focus:border-indigo-600 mb-4 focus:outline-none bg-transparent transition-colors"
        />
        <textarea
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
          className="w-full text-lg text-gray-600 border-b border-transparent hover:border-gray-100 focus:border-indigo-400 focus:outline-none resize-none bg-transparent transition-colors"
          rows={2}
          placeholder="Describe the purpose of this data collection..."
        />
      </div>

      <FormBuilder questions={questions} setQuestions={setQuestions} />

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          
          <div className={`text-sm font-medium ${status.type === 'error' ? 'text-red-500' : status.type === 'success' ? 'text-green-600' : 'text-gray-500'}`}>
            {status.message}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenPreview}
              className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Save Workflow
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CreateForm;