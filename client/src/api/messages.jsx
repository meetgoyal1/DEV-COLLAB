import api from "./axios";

export const getMessages = (roomId, page = 1) =>
  api.get(`/messages/${roomId}`, { params: { page } });

export const uploadMessageFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/messages/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
