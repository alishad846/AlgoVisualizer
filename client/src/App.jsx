import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import SortingPage from "./pages/sorting/SortingPage";
import SearchingPage from "./pages/searching/SearchingPage";
import RecursionPage from "./pages/recursion/RecursionPage";
import StackQueuePage from "./pages/stackqueue/StackQueuePage";
import LinkedListPage from "./pages/linkedlist/LinkedListPage";
import TreePage from "./pages/tree/TreePage";
import GraphPage from "./pages/graph/GraphPage";
import DPPage from "./pages/dp/DPPage";
import MLPage from "./pages/ml/MLPage";
import DocumentationPage from "./pages/DocumentationPage";
import SupportPage from "./pages/SupportPage";
import SortingDashboard from "./pages/dashboard/SortingDashboard";
import SearchingDashboard from "./pages/dashboard/SearchingDashboard";
import RecursionDashboard from "./pages/dashboard/RecursionDashboard";
import LinkedListDashboard from "./pages/dashboard/LinkedListDashboard";
import TreeDashboard from "./pages/dashboard/TreeDashboard";
import GraphDashboard from "./pages/dashboard/GraphDashboard";
import StackQueueDashboard from "./pages/dashboard/StackQueueDashboard";
import DynamicProgrammingDashboard from "./pages/dashboard/DynamicProgrammingDashboard";
import MachineLearningDashboard from "./pages/dashboard/MachineLearningDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/sorting" element={<SortingDashboard />} />
      <Route path="/dashboard/searching" element={<SearchingDashboard />} />
      <Route path="/dashboard/recursion" element={<RecursionDashboard />} />
      <Route path="/dashboard/linked-list" element={<LinkedListDashboard />} />
      <Route path="/dashboard/tree" element={<TreeDashboard />} />
      <Route path="/dashboard/graph" element={<GraphDashboard />} />
      <Route path="/dashboard/stack-queue" element={<StackQueueDashboard />} />
      <Route path="/dashboard/dp" element={<DynamicProgrammingDashboard />} />
      <Route path="/dashboard/ml" element={<MachineLearningDashboard />} />
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/support" element={<SupportPage />} />

      <Route path="/sorting" element={<Navigate to="/sorting/bubble-sort" />} />
      <Route path="/sorting/:algo" element={<SortingPage />} />

      <Route path="/searching" element={<Navigate to="/searching/linear-search" />} />
      <Route path="/searching/:algo" element={<SearchingPage />} />

      <Route path="/recursion" element={<Navigate to="/recursion/tower-of-hanoi" />} />
      <Route path="/recursion/:algo" element={<RecursionPage />} />

      <Route path="/stack-queue" element={<Navigate to="/stack-queue/stack" />} />
      <Route path="/stack-queue/:algo" element={<StackQueuePage />} />

      <Route path="/linked-list" element={<Navigate to="/linked-list/reverse" />} />
      <Route path="/linked-list/:algo" element={<LinkedListPage />} />

      <Route path="/tree" element={<Navigate to="/tree/inorder" />} />
      <Route path="/tree/:algo" element={<TreePage />} />

      <Route path="/graph" element={<Navigate to="/graph/bfs" />} />
      <Route path="/graph/:algo" element={<GraphPage />} />

      <Route path="/dp" element={<Navigate to="/dp/fibonacci" />} />
      <Route path="/dp/:algo" element={<DPPage />} />

      <Route path="/ml" element={<Navigate to="/ml/linear-regression" />} />
      <Route path="/ml/:algo" element={<MLPage />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;