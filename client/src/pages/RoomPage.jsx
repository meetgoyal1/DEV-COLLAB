import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom } from "../api/rooms";
import { useSocket } from "../context/SocketContext";
import ChatPanel from "../components/chat/ChatPanel";
import EditorPanel from "../components/editor/EditorPanel";

const RoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("editor"); // mobile only

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await getRoom(id);
        setRoom(data.room);
      } catch (err) {
        setError(err.response?.data?.message || "Room not found");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.on("online-users", ({ users }) => setOnlineUsers(users));
    return () => socket.off("online-users");
  }, [socket]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Loading room...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate("/dashboard")} className="text-indigo-400 hover:underline text-sm">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <span className="text-gray-700">|</span>
          <div>
            <span className="text-white font-semibold text-sm">{room?.name}</span>
            {room?.description && (
              <span className="text-gray-500 text-xs ml-2 hidden md:inline">
                {room.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile tab switcher */}
          <div className="flex md:hidden bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={`text-xs px-3 py-1 rounded-md transition ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`text-xs px-3 py-1 rounded-md transition ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Chat
            </button>
          </div>

          {/* Online users */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500">{onlineUsers.length} online</span>
          </div>
        </div>
      </nav>

      {/* Split view — desktop */}
      <div className="flex-1 overflow-hidden hidden md:flex">

        {/* Chat — left */}
        <div className="w-80 lg:w-96 border-r border-gray-800 flex flex-col shrink-0">
          <ChatPanel roomId={id} onlineUsers={onlineUsers} />
        </div>

        {/* Editor — right */}
        <div className="flex-1 overflow-hidden">
          <EditorPanel roomId={id} />
        </div>
      </div>

      {/* Mobile view — tabs */}
      <div className="flex-1 overflow-hidden flex md:hidden">
        <div className={`w-full h-full ${activeTab === "editor" ? "block" : "hidden"}`}>
          <EditorPanel roomId={id} />
        </div>
        <div className={`w-full h-full ${activeTab === "chat" ? "flex flex-col" : "hidden"}`}>
          <ChatPanel roomId={id} onlineUsers={onlineUsers} />
        </div>
      </div>

    </div>
  );
};

export default RoomPage;