import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import 'global'; // Add this line to ensure global is defined in the browser
// import process from 'process'; // Ensure process is available globally
import * as process from "process";
window.process = process;
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
