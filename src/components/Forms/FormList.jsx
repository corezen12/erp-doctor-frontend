import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Link } from "react-router-dom";

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState(null);

  const loadForms = async () => {
    try {
      const snap = await getDocs(collection(db, "forms"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setForms(list);
    } catch (error) {
      console.error("Failed to load forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this form permanently? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "forms", id));
      setForms(forms.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = (id) => {
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading forms...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Your Operations Forms</h2>
        <Link to="/create" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
          + Create New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No forms found. Time to optimize some workflows!</p>
          <p className="text-sm text-gray-400">Try creating a 5S Audit checklist or an OEE Tracking form to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={form.title}>{form.title || "Untitled Form"}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{form.description || "No description provided."}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                <Link to={`/create?id=${form.id}`} className="flex-1 text-center bg-gray-50 text-gray-700 px-3 py-2 rounded hover:bg-gray-100 transition text-sm font-medium">
                  Edit
                </Link>
                <Link to={`/preview/${form.id}`} className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-2 rounded hover:bg-indigo-100 transition text-sm font-medium">
                  Preview
                </Link>
                <Link to={`/responses/${form.id}`} className="flex-1 text-center bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 transition text-sm font-medium">
                  Data
                </Link>
                
                <div className="w-full flex gap-2 mt-1">
                  <button onClick={() => handleCopyLink(form.id)} className={`flex-1 text-center px-3 py-2 rounded text-sm font-medium transition ${copyStatus === form.id ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                    {copyStatus === form.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={() => handleDelete(form.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm font-medium">
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormList;