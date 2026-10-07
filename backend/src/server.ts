import { createApp } from "./app.js";
import { createDb } from "./db.js";

const port = Number(process.env.PORT ?? 4000);
createApp(createDb()).listen(port, () =>
  console.log(`Todo API listening on http://localhost:${port}`),
);
