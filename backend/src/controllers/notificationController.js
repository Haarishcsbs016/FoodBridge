const Notification = require("../models/Notification");

function toNotificationDTO(n) {
  return {
    id: n._id.toString(),
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
    type: n.type,
    audience: n.audience,
    listingId: n.listing ? n.listing.toString() : undefined,
    requestId: n.request ? n.request.toString() : undefined,
  };
}

const myNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(300);
    res.json(notifications.map(toNotificationDTO));
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: "Notification not found" });
    res.json(toNotificationDTO(n));
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { myNotifications, markRead, markAllRead };

