import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { getMessages, uploadMessageFile } from "../../api/messages";
import MessageBubble from "./MessageBubble";
import CodeSnippetModal from "./CodeSnippetModal";

const upsertMessage = (list, message) => {
  const id = String(message._id);
  if (list.some((m) => String(m._id) === id)) return list;
  return [...list, message];
};

const ChatPanel = ({ roomId }) => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!roomId) return undefined;

    let active = true;
    setLoading(true);

    getMessages(roomId)
      .then(({ data }) => {
        if (active) setMessages(data.messages ?? []);
      })
      .catch(() => {
        if (active) setMessages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return undefined;

    const joinRoom = () => {
      socket.emit("join-room", { roomId });
    };

    const onNewMessage = (message) => {
      if (String(message.room) !== String(roomId)) return;
      setMessages((prev) => upsertMessage(prev, message));
    };

    socket.on("new-message", onNewMessage);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("new-message", onNewMessage);
      socket.off("connect", joinRoom);
    };
  }, [socket, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendText = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !socket || !connected) return;

    socket.emit("send-message", {
      roomId,
      content: trimmed,
      type: "text",
    });
    setDraft("");
  };

  const sendCodeSnippet = ({ code, language }) => {
    if (!socket || !connected) return;

    socket.emit("send-message", {
      roomId,
      content: code,
      type: "code",
      language,
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !connected) return;

    e.target.value = "";
    setUploading(true);

    try {
      const { data } = await uploadMessageFile(file);
      socket.emit("send-message", {
        roomId,
        content: "",
        type: data.type,
        fileUrl: data.url,
        fileName: data.fileName,
      });
    } catch {
      // Upload failed — user can retry
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-800 shrink-0">
        <h2 className="text-sm font-semibold text-white">Chat</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {connected ? "Connected" : "Connecting…"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">
            No messages yet. Say hello to the room.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {showCodeModal && (
        <CodeSnippetModal
          onSend={sendCodeSnippet}
          onClose={() => setShowCodeModal(false)}
        />
      )}

      <form onSubmit={sendText} className="border-t border-gray-800 p-3 shrink-0">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            disabled={!connected}
            title="Share code snippet"
            className="px-2.5 py-1.5 text-xs font-mono text-gray-400 hover:text-indigo-400 border border-gray-700 hover:border-indigo-500 rounded-lg transition disabled:opacity-50"
          >
            {"</>"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!connected || uploading}
            title="Upload file"
            className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-indigo-400 border border-gray-700 hover:border-indigo-500 rounded-lg transition disabled:opacity-50"
          >
            {uploading ? "…" : "📎"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={connected ? "Type a message…" : "Connecting…"}
            disabled={!connected}
            maxLength={2000}
            className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!connected || !draft.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
