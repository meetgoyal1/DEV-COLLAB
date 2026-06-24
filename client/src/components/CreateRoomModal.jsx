import { useState } from "react";
import { createRoom } from "../api/rooms";

const CreateRoomModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await createRoom(form);
      onCreated(data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-teal-900/40 rounded-2xl w-full max-w-md p-6 shadow-xl shadow-teal-950/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Create a Room</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition text-xl leading-none rounded-lg p-1 hover:bg-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 text-rose-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Room Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Backend Review"
              required
              maxLength={30}
              className="w-full bg-slate-800/80 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Description{" "}
              <span className="text-slate-600 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What's this room for?"
              maxLength={100}
              className="w-full bg-slate-800/80 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-700 text-slate-400 hover:text-teal-200 hover:border-teal-600/40 py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-2.5 rounded-lg transition shadow-md shadow-teal-900/30 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
