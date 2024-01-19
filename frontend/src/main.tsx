import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Start from "./routes/Start.tsx";
import Project from "./routes/Project.tsx";
import Layout from "./layout/Layout.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/project/:projectId/:stage/" element={<Project />} />
        </Routes>
      </BrowserRouter>
    </Layout>
  </React.StrictMode>,
);
