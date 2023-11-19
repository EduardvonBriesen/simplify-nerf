import { Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import AuthGuard from "./utils/AuthGuard";

function App() {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
