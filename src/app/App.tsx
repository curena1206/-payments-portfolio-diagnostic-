import { Navigate, Route, Routes } from "react-router-dom";
import { AssessmentExperienceProvider } from "../application/assessment/AssessmentExperienceContext";
import type { AssessmentRuntime } from "../application/assessment/runtime";
import { AppShell } from "../components/AppShell";
import { AssessmentPage } from "../pages/AssessmentPage";
import { EntryPage } from "../pages/EntryPage";
import { ResultsFoundationPage } from "../pages/ResultsFoundationPage";

export function App({ runtime }: { runtime?: AssessmentRuntime }) {
  return (
    <AssessmentExperienceProvider runtime={runtime}>
      <AppShell>
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results" element={<ResultsFoundationPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppShell>
    </AssessmentExperienceProvider>
  );
}
