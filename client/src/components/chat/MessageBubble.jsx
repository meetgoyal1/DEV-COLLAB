import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { copyToClipboard } from "../../utils/copyToClipboard";
const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const isOwn =
    String(message.sender?._id ?? message.sender) ===
    String(user?.id ?? user?._id);
  const isSystem = message.type === "system";

  const handleCopyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!copyToClipboard(message.content)) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-600 bg-gray-800/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
        {message.sender?.avatar ? (
          <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          message.sender?.username?.[0]?.toUpperCase()
        )}
      </div>

      <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Username */}
        {!isOwn && (
          <span className="text-xs text-gray-500 px-1">{message.sender?.username}</span>
        )}

        {/* Content */}
        {message.type === "text" && (
          <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-gray-800 text-gray-100 rounded-bl-sm"
          }`}>
            {message.content}
          </div>
        )}

        {message.type === "code" && (
          <div className="w-full max-w-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-indigo-400 font-mono">{message.language}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`text-xs transition ${
                    copied ? "text-green-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {copied ? "Copied to clipboard!" : "Copy"}
                </button>              </div>
              <pre className="p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
                <code>{message.content}</code>
              </pre>
            </div>
          </div>
        )}

        {message.type === "image" && (
          <div className="rounded-xl overflow-hidden border border-gray-700 max-w-xs">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="w-full object-cover cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
            <div className="px-2 py-1 bg-gray-800">
              <span className="text-xs text-gray-500 truncate block">{message.fileName}</span>
            </div>
          </div>
        )}

        {message.type === "file" && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-indigo-500 transition px-3 py-2 rounded-xl"
          >
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-xs font-bold">
              {message.fileName?.split(".").pop()?.toUpperCase() || "FILE"}
            </div>
            <span className="text-sm text-gray-300 truncate max-w-[160px]">{message.fileName}</span>
            <span className="text-xs text-indigo-400">↓</span>
          </a>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-600 px-1">
          {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;