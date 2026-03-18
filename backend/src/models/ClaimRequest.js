const mongoose = require("mongoose");

const claimRequestSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ngoName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
    pickupConfirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// prevent multiple pending requests for same listing by same NGO
claimRequestSchema.index(
  { listing: 1, ngo: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

module.exports = mongoose.model("ClaimRequest", claimRequestSchema);

