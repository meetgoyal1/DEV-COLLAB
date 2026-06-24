const express = require("express");
const router = express.Router();
const { uploadFile , upload , getMessages} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/:roomId", getMessages);

module.exports = router;