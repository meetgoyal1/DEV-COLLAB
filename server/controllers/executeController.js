const axios = require("axios");

// Glot.io language map
const LANGUAGE_MAP = {
  javascript: { language: "javascript", filename: "main.js" },
  python: { language: "python", filename: "main.py" },
  typescript: { language: "typescript", filename: "main.ts" },
  cpp: { language: "cpp", filename: "main.cpp" },
  java: { language: "java", filename: "Main.java" },
  go: { language: "go", filename: "main.go" },
};

exports.executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    const lang = LANGUAGE_MAP[language];
    if (!lang) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const response = await axios.post(
      `https://glot.io/api/run/${lang.language}/latest`,
      {
        files: [
          {
            name: lang.filename,
            content: code,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const { stdout, stderr, error } = response.data;

    res.status(200).json({
      stdout: stdout || "",
      stderr: stderr || error || "",
      code: stderr || error ? 1 : 0,
    });
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return res.status(408).json({ message: "Execution timed out" });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ message: "Rate limit hit — try again in a moment" });
    }
    res.status(500).json({ message: "Execution failed", error: error.message });
  }
};