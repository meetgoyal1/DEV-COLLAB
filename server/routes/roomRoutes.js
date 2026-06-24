const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRoom , joinRoom , getRooms , getRoom , leaveRoom , deleteRoom } = require('../controllers/roomController');

router.use(protect);
router.post("/", createRoom);
router.post("/join", joinRoom);
router.get("/", getRooms);
router.get("/:id", getRoom);
router.post("/:id/leave", leaveRoom);
router.delete("/:id", deleteRoom);

module.exports = router;