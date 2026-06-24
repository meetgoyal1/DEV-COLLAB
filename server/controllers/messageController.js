const Message = require("../models/messageModel");
const Room = require("../models/roomModel");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const streamifier = require("streamifier");

//multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

//get messages history of room
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const room = await Room.findById(roomId);
    if (!room || !room.isActive)
      return res.status(404).json({ message: "Room not found!" });
    const userId = String(req.user.id);
    const isMember = room.members.some((m) => String(m) === userId);
    if (!isMember) return res.status(403).json({ message: "Not a member" });
    const messages = await Message.find({ room: roomId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const isImage = req.file.mimetype.startsWith("image/");

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "devcollab",
            resource_type: isImage ? "image" : "raw",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();

    res.status(200).json({
      url: result.secure_url,
      fileName: req.file.originalname,
      type: isImage ? "image" : "file",
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

module.exports = { uploadFile, getMessages, upload };