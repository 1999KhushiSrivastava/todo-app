import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../styles.css";
import { DetailPage } from "./DetailPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DetailPage />
  </StrictMode>,
);
