const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { myNotifications, markRead, markAllRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/me", requireAuth, myNotifications);
router.put("/:id/read", requireAuth, markRead);
router.put("/me/read-all", requireAuth, markAllRead);

module.exports = router;

