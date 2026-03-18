const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ["restaurant", "ngo"], required: true, index: true },
    type: {
      type: String,
      enum: ["new_listing", "claimed", "expiring", "claim_request", "claim_accepted", "claim_rejected"],
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
    request: { type: mongoose.Schema.Types.ObjectId, ref: "ClaimRequest", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

