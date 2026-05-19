import React from 'react'
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Link } from "react-router-dom";

const FormList = () => {
  const [forms, setForms] = useState([]);

  const loadForms = async () => {
    const snap = await getDocs(collection(db, "forms"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setForms(list);
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this form permanently?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "forms", id));
      setForms(forms.filter((f) => f.id !== id)); // remove from UI
      alert("Form deleted.");
    } catch (err) {
      console.error(err);
      alert("Could not delete form.");
    }
  };

  // 📌 Copy sharable link
  const handleCopyLink = (id) => {
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    alert("Sharable link copied!");
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Your Forms</h2>

      {forms.length === 0 && (
        <p className="text-gray-600">No forms created yet.</p>
      )}

      {forms.map((form) => (
        <div
          key={form.id}
          className="bg-white p-4 rounded-xl shadow mb-4 border"
        >
          <h3 className="text-xl font-semibold">{form.title}</h3>
          <p className="text-gray-600 text-sm">{form.description}</p>

          <div className="flex gap-3 mt-4 flex-wrap">

            <Link
              to={`/create?id=${form.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </Link>

            <Link
              to={`/preview/${form.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Preview
            </Link>

            <Link
              to={`/responses/${form.id}`}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Responses
            </Link>

            {/* COPY LINK */}
            <button
              onClick={() => handleCopyLink(form.id)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Copy Link
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDelete(form.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}

export default FormList;
