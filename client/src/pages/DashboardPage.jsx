import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getRooms } from "../api/rooms";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";
import DevCollabLogo from "../components/DevCollabLogo";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await getRooms();
        setRooms(data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
  };

  const handleRoomJoined = (joinedRoom) => {
    setRooms((prev) => {
      const exists = prev.find((r) => r._id === joinedRoom._id);
      if (exists) return prev;
      return [joinedRoom, ...prev];
    });
  };

  const handleRoomUpdate = (roomId, action) => {
    if (action === "delete") {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <DevCollabLogo />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-900/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-medium text-white shadow-md shadow-teal-900/40">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-slate-400 text-sm hidden md:block">
                {user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-rose-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              My Rooms
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} — click to open
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="border border-slate-700 hover:border-teal-600/50 text-slate-400 hover:text-teal-200 text-sm px-4 py-2 rounded-lg transition"
            >
              Join Room
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition shadow-md shadow-teal-900/30"
            >
              + Create Room
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-40 animate-pulse"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-3xl mb-4">
              🚪
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              No rooms yet
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Create a new room to start collaborating, or join one with an
              invite code.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setShowJoin(true)}
                className="border border-slate-700 hover:border-teal-600/50 text-slate-400 hover:text-teal-200 text-sm px-4 py-2 rounded-lg transition"
              >
                Join Room
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition shadow-md shadow-teal-900/30"
              >
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onUpdate={handleRoomUpdate}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          onClose={() => setShowJoin(false)}
          onJoined={handleRoomJoined}
        />
      )}
    </div>
  );
};

export default DashboardPage;
