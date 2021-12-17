import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import AuthProvider from "./context/AuthProvider";
import Layout from "./components/Layout";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Layout>
        <App />
      </Layout>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
