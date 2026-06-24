import api from "./axios";

export const createRoom = (data) => api.post('/rooms',data);
export const joinRoom = (inviteCode) => api.post("/rooms/join", { inviteCode});
export const getRooms = () => api.get("/rooms");
export const getRoom = (id) => api.get(`/rooms/${id}`);
export const leaveRoom = (id) => api.post(`/rooms/${id}/leave`);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);