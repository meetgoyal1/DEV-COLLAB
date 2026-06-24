import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { deleteRoom, leaveRoom } from "../api/rooms";

const RoomCard = ({ room, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ownerId = String(room.owner?._id ?? room.owner);
  const userId = String(user?._id ?? user?.id ?? "");
  const isOwner = Boolean(userId && ownerId === userId);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this room?")) return;
    try {
      await deleteRoom(room._id);
      onUpdate(room._id, "delete");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleLeave = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Leave this room?")) return;
    try {
      await leaveRoom(room._id);
      onUpdate(room._id, "delete");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave room");
    }
  };

  const copyInviteCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.inviteCode);
    alert("Invite code copied!");
  };

  return (
    <div
      onClick={() => navigate(`/room/${room._id}`)}
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-teal-500/40 transition group flex flex-col gap-4 shadow-lg shadow-teal-950/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-teal-300 transition">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-slate-500 text-sm mt-0.5 truncate">
              {room.description}
            </p>
          )}
        </div>
        {isOwner && (
          <span className="text-xs bg-teal-500/10 text-teal-300 border border-teal-500/25 px-2 py-0.5 rounded-full shrink-0">
            Owner
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {room.members.slice(0, 4).map((member) => (
            <div
              key={member._id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-white overflow-hidden"
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                member.username?.[0]?.toUpperCase()
              )}
            </div>
          ))}
          {room.members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
              +{room.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-slate-500 text-xs">
          {room.members.length} member{room.members.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={copyInviteCode}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-400 transition font-mono"
        >
          <span>#{room.inviteCode}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <button
              onClick={handleDelete}
              className="text-xs text-slate-500 hover:text-rose-400 transition px-2 py-1 rounded"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="text-xs text-slate-500 hover:text-rose-400 transition px-2 py-1 rounded"
            >
              Leave
            </button>
          )}
          <span className="text-xs text-teal-400 group-hover:text-teal-300 transition">
            Open →
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
