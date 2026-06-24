const Room = require("../models/roomModel");
const { nanoid } = require("nanoid");

//create room
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ message: "Room name is Required!" });
    const inviteCode = nanoid(8).toUpperCase();
    const room = await Room.create({
      name,
      description: description || "",
      owner: req.user.id,
      members: [req.user.id],
      inviteCode: inviteCode,
    });
    await room.populate("owner", "username avatar");
    await room.populate("members", "username avatar");
    res.status(200).json({ message: "Room created successfully!", room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//join a room by invite code
const joinRoom = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode)
      return res.status(400).json({ message: "Invite Code required!" });
    const room = await Room.findOne({
      inviteCode: inviteCode.toUpperCase(),
      isActive: true,
    });
    if (!room) return res.status(400).json({ message: "Invalid Invite Code!" });
    const userId = String(req.user.id);
    //already member
    if (room.members.some((m) => String(m) === userId)) {
      await room.populate("owner", "username avatar");
      await room.populate("members", "username avatar");
      return res
        .status(200)
        .json({ message: "Already a member of room", room });
    }

    //add new member
    room.members.push(userId);
    await room.save();
    await room.populate("owner", "username avatar");
    await room.populate("members", "username avatar");
    res.status(200).json({ message: "Room joined succesfully!", room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get my rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user.id,
      isActive: true,
    })
      .populate("owner", "username avatar")
      .populate("members", "username avatar")
      .sort({ updatedAt: -1 });
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get single room
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("owner", "username avatar email")
      .populate("members", "username avatar email");
    if (!room || !room.isActive)
      return res.status(404).json({ message: "Room not found!" });
    const userId = String(req.user.id);
    const isMember = room.members.some((m) => String(m._id ?? m) === userId);
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this room!" });
    }
    res.status(200).json({ room });
  } catch (error) {
    res.status(500).json({ message: "server error!", error: error.message });
  }
};

//delete a room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (String(room.owner) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only owner can delete the room" });
    }
    room.isActive = false;
    await room.save();
    res.status(200).json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//leave a room
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive)
      return res.status(404).json({ message: "Room not found" });
    //owner cant leave must delete
    if (String(room.owner) === String(req.user.id)) {
      return res
        .status(400)
        .json({ message: "Owner can't leave a room! Please delete it" });
    }
    const userId = String(req.user.id);
    room.members = room.members.filter((m) => String(m) !== userId);
    await room.save();
    res.status(200).json({ message: "Left room successfully" });
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message});
  }
};

module.exports = {createRoom , joinRoom , getRooms , getRoom , leaveRoom , deleteRoom};
