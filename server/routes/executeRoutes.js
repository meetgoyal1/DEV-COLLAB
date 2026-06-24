const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { executeCode } = require("../controllers/executeController");

router.post("/", protect, executeCode);

module.exports = router;