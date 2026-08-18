import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AssessmentFoundationPage } from "../pages/AssessmentFoundationPage";
import { EntryPage } from "../pages/EntryPage";
import { ResultsFoundationPage } from "../pages/ResultsFoundationPage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/assessment" element={<AssessmentFoundationPage />} />
        <Route path="/results" element={<ResultsFoundationPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppShell>
  );
}
