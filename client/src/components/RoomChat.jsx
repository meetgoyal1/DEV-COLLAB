import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import useRoomChat from "../hooks/useRoomChat";

const formatTime = (value) => {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const RoomChat = ({ roomId, onOnlineUsersChange }) => {
  const { user } = useAuth();
  const { messages, loading, connected, error, sendMessage } = useRoomChat(
    roomId,
    { onOnlineUsersChange },
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const sent = sendMessage(draft);
    if (sent) setDraft("");
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full min-h-[420px] max-h-[calc(100vh-10rem)] bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-teal-950/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <h2 className="text-sm font-semibold text-white">Room chat</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            connected
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              : "bg-slate-700/50 text-slate-400 border border-slate-600"
          }`}
        >
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-rose-300 bg-rose-500/10 border-b border-rose-500/20">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 text-sm py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">
            No messages yet. Say hello to the room.
          </p>
        ) : (
          messages.map((message) => {
            if (message.type === "system") {
              return (
                <p
                  key={message._id}
                  className="text-center text-xs text-slate-500 italic py-1"
                >
                  {message.content}
                </p>
              );
            }

            const isMine =
              String(message.sender?._id ?? message.sender) ===
              String(user?.id ?? user?._id);

            return (
              <div
                key={message._id}
                className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 shrink-0 overflow-hidden flex items-center justify-center text-xs text-white">
                  {message.sender?.avatar ? (
                    <img
                      src={message.sender.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    message.sender?.username?.[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 ${
                    isMine
                      ? "bg-teal-600/20 border border-teal-500/25"
                      : "bg-slate-800/80 border border-slate-700"
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-medium text-teal-200/90">
                      {message.sender?.username ?? "User"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 p-3 flex gap-2 bg-slate-900/80"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          disabled={!connected || sending}
          maxLength={2000}
          className="flex-1 bg-slate-800/80 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || sending || !draft.trim()}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 shadow-md shadow-teal-900/20"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default RoomChat;
