import { useState } from "react";

const LANGUAGES = ["javascript", "python", "typescript", "java", "cpp", "go", "rust", "html", "css", "sql"];

const CodeSnippetModal = ({ onSend, onClose }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  const handleSend = (e) => {
    // Prevent any accidental form submission side effects
    e.preventDefault(); 
    if (!code.trim()) return;
    
    onSend({ code, language });
    onClose();
  };

  return (
    // Clicking the backdrop itself will trigger onClose
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      {/* CRITICAL FIX: e.stopPropagation() stops clicks inside the modal 
        from bubbling up to the backdrop and triggering onClose 
      */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Share Code Snippet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <div className="mb-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          rows={10}
          className="w-full bg-gray-800 text-gray-200 font-mono text-sm border border-gray-700 rounded-xl p-4 focus:outline-none focus:border-indigo-500 resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-700 text-gray-400 hover:text-white py-2 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!code.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition text-sm disabled:opacity-50"
          >
            Send Snippet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;