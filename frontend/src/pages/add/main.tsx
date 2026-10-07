import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../styles.css";
import { AddPage } from "./AddPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AddPage />
  </StrictMode>,
);
