import api from "./axios";

export const executeCode = (code, language) =>
  api.post("/execute", { code, language });