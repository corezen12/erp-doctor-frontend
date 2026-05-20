import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormList from '../components/Forms/FormList.jsx';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide uppercase mb-6 border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            AI-Powered Diagnostics
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Enterprise Operations Hub
          </h1>
          
          <p className="text-lg text-gray-500 max-w-2xl mb-10">
            Build intelligent forms, collect telemetry data, and instantly generate AI-driven analytics to optimize your business workflows.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/create")}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all shadow-md flex items-center gap-2"
            >
              <span>+</span> Create New Workflow
            </button>
            <button
              onClick={() => document.getElementById('forms-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              View Active Systems
            </button>
          </div>
        </div>
      </div>

      {/* FORM LIST SECTION */}
      <div id="forms-section" className="py-12">
        <FormList />
      </div>
    </div>
  );
}

export default Home;