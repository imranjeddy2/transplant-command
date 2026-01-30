import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomeDashboard } from '@/components/home';
import { TaskDashboard, TaskViewer } from '@/components/tasks';
import { PatientList, PatientProfile } from '@/components/patients';
import { AnalyticsDashboard } from '@/components/analytics';
import { PreEvaluationDashboard } from '@/components/pre-evaluations';
import { SchedulingPage } from '@/components/scheduling/SchedulingPage';
import { UserProvider } from '@/context';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/tasks" element={<TaskDashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:patientId" element={<PatientProfile />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/pre-evaluations" element={<PreEvaluationDashboard />} />
          </Route>
          <Route path="/tasks/:taskId" element={<TaskViewer />} />
          <Route path="/schedule/:token" element={<SchedulingPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
