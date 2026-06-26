import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

function App() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sorting" element={<Navigate to="/sorting/bubble-sort" />} />
      <Route path="/sorting/:algo" element={<SortingPage key={location.pathname} />} />
      <Route path="/searching" element={<Navigate to="/searching/linear-search" />} />
      <Route path="/searching/:algo" element={<SearchingPage key={location.pathname} />} />
      <Route path="/recursion" element={<Navigate to="/recursion/tower-of-hanoi" />} />
      <Route path="/recursion/:algo" element={<RecursionPage key={location.pathname} />} />
      <Route path="/stack-queue" element={<Navigate to="/stack-queue/stack" />} />
      <Route path="/stack-queue/:algo" element={<StackQueuePage key={location.pathname} />} />
      <Route path="/linked-list" element={<Navigate to="/linked-list/reverse" />} />
      <Route path="/linked-list/:algo" element={<LinkedListPage key={location.pathname} />} />
      <Route path="/tree" element={<Navigate to="/tree/inorder" />} />
      <Route path="/tree/:algo" element={<TreePage key={location.pathname} />} />
      <Route path="/graph" element={<Navigate to="/graph/bfs" />} />
      <Route path="/graph/:algo" element={<GraphPage key={location.pathname} />} />
      <Route path="/dp" element={<Navigate to="/dp/fibonacci" />} />
      <Route path="/dp/:algo" element={<DPPage key={location.pathname} />} />
      <Route path="/ml" element={<Navigate to="/ml/linear-regression" />} />
      <Route path="/ml/:algo" element={<MLPage key={location.pathname} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;