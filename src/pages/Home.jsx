import React from 'react'
import { useNavigate } from 'react-router-dom';
import FormList from '../components/Forms/FormList.jsx';  // 👈 Import component

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-10">

      {/* TOP SECTION (your original UI) */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-4xl font-bold text-purple-700 mb-8">
          AI ERP Diagnostic Tool
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/create")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-purple-700 transition"
          >
            + Blank Form
          </button>

          <button
            onClick={() => navigate("/create")}
            className="bg-white border border-gray-200 px-6 py-3 rounded-lg text-lg hover:shadow"
          >
            Open Builder
          </button>
        </div>
      </div>

      {/* FORM LIST (Displayed below the big buttons) */}
      <div className="max-w-4xl mx-auto">
        <FormList />
      </div>

    </div>
  );
}

export default Home;
