import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));
const api = { "/api": "http://localhost:4000" };

// Multi-page app: every HTML file below is a separate entry that Vite builds to its own page.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: api },
  preview: { port: 5173, proxy: api },
  build: {
    rollupOptions: {
      input: {
        index: page("index.html"), //  /                  -> home (reminders + upcoming)
        add: page("add.html"), //      /add.html          -> add task
        todos: page("todos.html"), //  /todos.html        -> all tasks (search, filter, sort)
        todo: page("todo.html"), //    /todo.html?id=1    -> single task
      },
    },
  },
});
