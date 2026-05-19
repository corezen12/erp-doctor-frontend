import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateForm from "./pages/CreateForm";
import FormPreview from "./components/Preview/FormPreview";
import ResponseViewer from "./components/Responses/ResponseViewer";
import PublicForm from "./pages/PublicForm";
import ResponseDashboard from "./components/Responses/ResponseDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateForm />} />
        <Route path="/preview/:formId" element={<FormPreview />} />
        <Route path="/responses/:formId" element={<ResponseViewer />} />
        <Route path="/dashboard/:formId/:responseId" element={<ResponseDashboard />} />

        {/* sharable link */}
        <Route path="/form/:formId" element={<PublicForm />} />
      </Routes>
    </Router>
  );
}

export default App;
