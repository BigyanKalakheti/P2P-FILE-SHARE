import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import 'global'; // Add this line to ensure global is defined in the browser


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
