import "reflect-metadata";

import { createRoot } from "react-dom/client";

import { App } from "./components/App.js";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App></App>);
