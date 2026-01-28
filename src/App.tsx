import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { TaskDashboard, TaskViewer } from '@/components/tasks';
import { PatientList, PatientProfile } from '@/components/patients';
import { AnalyticsDashboard } from '@/components/analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TaskDashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Route>
        <Route path="/tasks/:taskId" element={<TaskViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
