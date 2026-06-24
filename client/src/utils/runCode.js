import { transform } from "sucrase";
import api from "../api/axios";

const formatArg = (arg) => {
  if (typeof arg === "object" && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
};

export function runJavaScript(code) {
  const stdout = [];
  const stderr = [];

  const consoleProxy = {
    log: (...args) => stdout.push(args.map(formatArg).join(" ")),
    info: (...args) => stdout.push(args.map(formatArg).join(" ")),
    warn: (...args) => stdout.push(args.map(formatArg).join(" ")),
    debug: (...args) => stdout.push(args.map(formatArg).join(" ")),
    error: (...args) => stderr.push(args.map(formatArg).join(" ")),
  };

  try {
    const runner = new Function("console", `"use strict";\n${code}`);
    runner(consoleProxy);
    return {
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
      code: stderr.length ? 1 : 0,
    };
  } catch (err) {
    return {
      stdout: stdout.join("\n"),
      stderr: err.message || String(err),
      code: 1,
    };
  }
}

let skulptPromise;

const loadSkulpt = () => {
  if (window.Sk) return Promise.resolve(window.Sk);
  if (skulptPromise) return skulptPromise;

  skulptPromise = new Promise((resolve, reject) => {
    const loadScript = (src) =>
      new Promise((res, rej) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => res();
        script.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });

    loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js")
      .then(() =>
        loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.min.js"),
      )
      .then(() => resolve(window.Sk))
      .catch(reject);
  });

  return skulptPromise;
};

export async function runPython(code) {
  const Sk = await loadSkulpt();
  let stdout = "";

  Sk.configure({
    output: (text) => {
      stdout += text;
    },
    read: (filename) => {
      if (
        Sk.builtinFiles === undefined ||
        Sk.builtinFiles.files[filename] === undefined
      ) {
        throw new Error(`File not found: ${filename}`);
      }
      return Sk.builtinFiles.files[filename];
    },
  });

  try {
    await Sk.misceval.asyncToPromise(() =>
      Sk.importMainWithBody("<stdin>", false, code, true),
    );
    return { stdout, stderr: "", code: 0 };
  } catch (err) {
    return {
      stdout,
      stderr: err.toString(),
      code: 1,
    };
  }
}

export function runTypeScript(code) {
  try {
    const { code: js } = transform(code, { transforms: ["typescript"] });
    return runJavaScript(js);
  } catch (err) {
    return {
      stdout: "",
      stderr: err.message || "TypeScript transpile failed",
      code: 1,
    };
  }
}

const SERVER_LANGUAGES = new Set(["cpp", "java", "go"]);

async function runOnServer(code, language) {
  const { data } = await api.post("/execute", { code, language });
  return data;
}

export async function runCode(code, language) {
  const trimmed = code?.trim();
  if (!trimmed) {
    return { stdout: "", stderr: "No code to run", code: 1 };
  }

  if (language === "javascript") return runJavaScript(trimmed);
  if (language === "typescript") return runTypeScript(trimmed);
  if (language === "python") return runPython(trimmed);

  if (SERVER_LANGUAGES.has(language)) {
    try {
      return await runOnServer(trimmed, language);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Server execution unavailable. C++, Java, and Go require a self-hosted Piston instance.";
      return { stdout: "", stderr: message, code: 1 };
    }
  }

  return {
    stdout: "",
    stderr: `Unsupported language: ${language}`,
    code: 1,
  };
}
