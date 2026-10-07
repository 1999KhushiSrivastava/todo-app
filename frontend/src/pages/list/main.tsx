import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../styles.css";
import { ListPage } from "./ListPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ListPage />
  </StrictMode>,
);
