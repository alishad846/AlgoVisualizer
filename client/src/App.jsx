import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import StudentPage from "./pages/StudentPage";

import SortingPage from "./pages/SortingPage";
import SearchingPage from "./pages/SearchingPage";
import GraphPage from "./pages/GraphPage";
import TreePage from "./pages/TreePage";
import MLPage from "./pages/MLPage";

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Navigate to="/login" />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/admin"
        element={<AdminPage />}
      />

      <Route
        path="/student"
        element={<StudentPage />}
      />

      <Route
        path="/sorting"
        element={<SortingPage />}
      />

      <Route
        path="/searching"
        element={<SearchingPage />}
      />

      <Route
        path="/graph"
        element={<GraphPage />}
      />

      <Route
        path="/tree"
        element={<TreePage />}
      />

      <Route
        path="/ml"
        element={<MLPage />}
      />

    </Routes>

  );
}

export default App;