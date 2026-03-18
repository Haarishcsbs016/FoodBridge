const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { toFoodListingDTO } = require("../utils/toFoodListingDTO");

function computeStatus(listing) {
  if (listing.status === "claimed") return "claimed";
  if (listing.expiryTime && new Date(listing.expiryTime).getTime() <= Date.now()) return "expired";
  return listing.status || "available";
}

const listListings = async (req, res, next) => {
  try {
    const status = req.query.status;
    const q = {};
    if (status && ["available", "reserved", "claimed", "expired"].includes(status)) {
      q.status = status;
    }
    const listings = await Listing.find(q).sort({ createdAt: -1 }).limit(200);
    const normalized = listings.map((l) => {
      const obj = l.toObject();
      obj.status = computeStatus(obj);
      return toFoodListingDTO(obj);
    });
    res.json(normalized);
  } catch (err) {
    next(err);
  }
};

const myRestaurantListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ restaurant: req.user._id }).sort({ createdAt: -1 }).limit(200);
    const normalized = listings.map((l) => {
      const obj = l.toObject();
      obj.status = computeStatus(obj);
      return toFoodListingDTO(obj);
    });
    res.json(normalized);
  } catch (err) {
    next(err);
  }
};

const createListing = async (req, res, next) => {
  try {
    const { foodName, quantity, expiryTime, pickupLocation, lat, lng } = req.body;

    if (!foodName || typeof foodName !== "string") return res.status(400).json({ message: "foodName is required" });
    if (!quantity || typeof quantity !== "string") return res.status(400).json({ message: "quantity is required" });
    if (!pickupLocation || typeof pickupLocation !== "string") return res.status(400).json({ message: "pickupLocation is required" });
    if (!expiryTime || typeof expiryTime !== "string") return res.status(400).json({ message: "expiryTime is required" });

    const expiry = new Date(expiryTime);
    if (Number.isNaN(expiry.getTime())) return res.status(400).json({ message: "expiryTime is invalid" });

    const listing = await Listing.create({
      foodName: foodName.trim(),
      quantity: quantity.trim(),
      expiryTime: expiry,
      pickupLocation: pickupLocation.trim(),
      restaurant: req.user._id,
      restaurantName: req.user.name,
      status: expiry.getTime() <= Date.now() ? "expired" : "available",
      coordinates: {
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
      },
    });

    // Notify all NGOs (simple approach): create one notification per NGO user
    // For a real app you might implement sockets or aggregated feeds.
    // We'll keep it simple and safe: no notification fanout unless NGOs exist.
    const ngoUsers = await User.find({ role: "ngo" }).select("_id");
    if (ngoUsers.length > 0) {
      await Notification.insertMany(
        ngoUsers.map((u) => ({
          audience: "ngo",
          type: "new_listing",
          message: `New listing: ${listing.foodName} from ${listing.restaurantName}`,
          user: u._id,
          listing: listing._id,
          read: false,
        }))
      );
    }

    res.status(201).json(toFoodListingDTO(listing));
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { foodName, quantity, expiryTime, pickupLocation, status, lat, lng } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.restaurant.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    if (typeof foodName === "string") listing.foodName = foodName.trim();
    if (typeof quantity === "string") listing.quantity = quantity.trim();
    if (typeof pickupLocation === "string") listing.pickupLocation = pickupLocation.trim();
    if (typeof expiryTime === "string") {
      const expiry = new Date(expiryTime);
      if (Number.isNaN(expiry.getTime())) return res.status(400).json({ message: "expiryTime is invalid" });
      listing.expiryTime = expiry;
    }
    if (typeof status === "string" && ["available", "reserved", "claimed", "expired"].includes(status)) {
      listing.status = status;
    }
    if (typeof lat === "number") listing.coordinates.lat = lat;
    if (typeof lng === "number") listing.coordinates.lng = lng;

    await listing.save();
    const obj = listing.toObject();
    obj.status = computeStatus(obj);
    res.json(toFoodListingDTO(obj));
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.restaurant.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    await listing.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listListings, myRestaurantListings, createListing, updateListing, deleteListing };

