import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../../context/SocketContext";
import { runCode } from "../../utils/runCode";
import { copyToClipboard } from "../../utils/copyToClipboard";
import LanguageSelector from "./LanguageSelector";
import OutputPanel from "./OutputPanel";

const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello from DevCollab!");`,
  python: `# Python\nprint("Hello from DevCollab!")`,
  typescript: `// TypeScript\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("DevCollab"));`,
  cpp: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from DevCollab!" << endl;\n    return 0;\n}`,
  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from DevCollab!");\n    }\n}`,
  go: `// Go\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello from DevCollab!")\n}`,
};

const EditorPanel = ({ roomId }) => {
  const { socket } = useSocket();
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const isRemoteUpdate = useRef(false);
  const debounceTimer = useRef(null);
  const editorRef = useRef(null);

  // Handle monaco editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    // Track cursor position and broadcast
    editor.onDidChangeCursorPosition((e) => {
      if (!socket) return;
      socket.emit("editor-cursor", {
        roomId,
        cursor: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    });
  };

  // Socket events for editor sync
  useEffect(() => {
    if (!socket) return;

    // Get current editor state when joining
    socket.on("editor-init", ({ code: initCode, language: initLang }) => {
      isRemoteUpdate.current = true;
      setCode(initCode);
      setLanguage(initLang);
      setTimeout(() => { isRemoteUpdate.current = false; }, 0);
    });

    // Someone else changed the code
    socket.on("editor-update", ({ code: newCode, language: newLang }) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
      if (newLang) setLanguage(newLang);
      setTimeout(() => { isRemoteUpdate.current = false; }, 0);
    });

    // Someone changed the language
    socket.on("editor-language-update", ({ language: newLang }) => {
      setLanguage(newLang);
      setCode(DEFAULT_CODE[newLang] || "");
    });

    // Remote cursor positions
    socket.on("editor-cursor-update", ({ userId, username, cursor }) => {
      setRemoteUsers((prev) => ({
        ...prev,
        [userId]: { username, cursor },
      }));
    });

    return () => {
      socket.off("editor-init");
      socket.off("editor-update");
      socket.off("editor-language-update");
      socket.off("editor-cursor-update");
    };
  }, [socket]);

  // Handle local code change
  const handleCodeChange = useCallback((value) => {
    if (isRemoteUpdate.current) return; // skip — came from remote

    setCode(value);

    // Debounce — only emit after 80ms of no typing
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      socket?.emit("editor-change", { roomId, code: value, language });
    }, 80);
  }, [socket, roomId, language]);

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = DEFAULT_CODE[newLang] || "";
    setCode(newCode);
    socket?.emit("editor-language-change", { roomId, language: newLang });
    socket?.emit("editor-change", { roomId, code: newCode, language: newLang });
  };

  // Run code
  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput(null);
    try {
      const result = await runCode(code, language);
      setOutput(result);
    } catch (err) {
      setOutput({
        stdout: "",
        stderr: err.message || "Execution failed",
        code: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    const text = editorRef.current?.getValue() ?? code;
    if (!copyToClipboard(text)) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">

      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <span className="text-xs text-gray-600">
            {Object.keys(remoteUsers).length > 0 && (
              `${Object.keys(remoteUsers).length} collaborator${Object.keys(remoteUsers).length > 1 ? "s" : ""} editing`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy code button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              copied
                ? "text-green-400 border-green-500/50 bg-green-500/10"
                : "text-gray-500 hover:text-white border-gray-700 hover:border-gray-500"
            }`}
          >
            {copied ? "Copied to clipboard!" : "Copy"}
          </button>

          {/* Run button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            contextmenu: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Output panel */}
      {showOutput && (
        <div className="shrink-0">
          <OutputPanel
            output={output}
            isRunning={isRunning}
            onClose={() => {
              setShowOutput(false);
              setOutput(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EditorPanel;