import { useEffect, useRef, useState, useCallback } from "react";
import { getMessages } from "../api/messages";
import { connectSocket, disconnectSocket } from "../lib/socket";

const upsertMessage = (list, message) => {
  const id = String(message._id);
  if (list.some((m) => String(m._id) === id)) return list;
  return [...list, message];
};

const useRoomChat = (roomId, { onOnlineUsersChange } = {}) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const roomIdRef = useRef(roomId);

  const sendMessage = useCallback(
    (content) => {
      const trimmed = content?.trim();
      if (!trimmed || !roomIdRef.current) return false;

      const socket = connectSocket(localStorage.getItem("accessToken"));
      socket?.emit("send-message", {
        roomId: roomIdRef.current,
        content: trimmed,
        type: "text",
      });
      return true;
    },
    [],
  );

  useEffect(() => {
    roomIdRef.current = roomId;
    if (!roomId) return undefined;

    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getMessages(roomId);
        if (active) setMessages(data.messages ?? []);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to load messages");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHistory();

    const token = localStorage.getItem("accessToken");
    const socket = connectSocket(token);
    if (!socket) {
      setError("Not authenticated");
      return () => {
        active = false;
      };
    }

    const onConnect = () => {
      setConnected(true);
      socket.emit("join-room", { roomId });
    };

    const onDisconnect = () => setConnected(false);

    const onNewMessage = (message) => {
      if (String(message.room) !== String(roomId)) return;
      setMessages((prev) => upsertMessage(prev, message));
    };

    const onOnlineUsers = ({ users }) => {
      const list = users ?? [];
      setOnlineUsers(list);
      onOnlineUsersChange?.(list);
    };

    const onConnectError = () => {
      setError("Could not connect to chat");
      setConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("new-message", onNewMessage);
    socket.on("online-users", onOnlineUsers);

    if (socket.connected) onConnect();

    return () => {
      active = false;
      socket.emit("leave-room", { roomId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("new-message", onNewMessage);
      socket.off("online-users", onOnlineUsers);
      disconnectSocket();
      setConnected(false);
      setOnlineUsers([]);
    };
  }, [roomId]);

  return { messages, onlineUsers, loading, connected, error, sendMessage };
};

export default useRoomChat;
