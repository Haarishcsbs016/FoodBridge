const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    expiryTime: { type: Date, required: true },
    pickupLocation: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["available", "reserved", "claimed", "expired"],
      default: "available",
      index: true,
    },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurantName: { type: String, required: true, trim: true },
    claimedBy: { type: String, default: null, trim: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);

