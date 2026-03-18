const ClaimRequest = require("../models/ClaimRequest");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");

const requestClaim = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId || typeof listingId !== "string") return res.status(400).json({ message: "listingId is required" });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "available") return res.status(400).json({ message: "Listing is not available" });

    // Create pending request (unique index prevents duplicates)
    const claim = await ClaimRequest.create({
      listing: listing._id,
      ngo: req.user._id,
      ngoName: req.user.name,
      status: "pending",
    });

    // Notify the restaurant owner
    await Notification.create({
      audience: "restaurant",
      type: "claim_request",
      message: `${req.user.name} requested to claim “${listing.foodName}”`,
      user: listing.restaurant,
      listing: listing._id,
      request: claim._id,
      read: false,
    });

    res.status(201).json({
      id: claim._id.toString(),
      listingId: listing._id.toString(),
      ngoName: claim.ngoName,
      status: claim.status,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      pickupConfirmedAt: claim.pickupConfirmedAt ? claim.pickupConfirmedAt.toISOString() : undefined,
    });
  } catch (err) {
    // handle duplicate pending request nicely
    if (err && err.code === 11000) return res.status(409).json({ message: "Claim request already pending" });
    next(err);
  }
};

const respondToClaim = async (req, res, next) => {
  try {
    const { requestId, action } = req.body;
    if (!requestId || typeof requestId !== "string") return res.status(400).json({ message: "requestId is required" });
    if (action !== "accept" && action !== "reject") return res.status(400).json({ message: "action must be accept or reject" });

    const claim = await ClaimRequest.findById(requestId);
    if (!claim) return res.status(404).json({ message: "Claim request not found" });
    if (claim.status !== "pending") return res.status(400).json({ message: "Claim request is not pending" });

    const listing = await Listing.findById(claim.listing);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.restaurant.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    claim.status = action === "accept" ? "accepted" : "rejected";
    await claim.save();

    if (action === "accept") {
      listing.status = "claimed";
      listing.claimedBy = claim.ngoName;
      await listing.save();
    }

    // Notify NGO
    await Notification.create({
      audience: "ngo",
      type: action === "accept" ? "claim_accepted" : "claim_rejected",
      message:
        action === "accept"
          ? `Your claim was accepted for “${listing.foodName}”. Confirm pickup to get directions.`
          : `Your claim was rejected for “${listing.foodName}”.`,
      user: claim.ngo,
      listing: listing._id,
      request: claim._id,
      read: false,
    });

    res.json({
      id: claim._id.toString(),
      listingId: listing._id.toString(),
      ngoName: claim.ngoName,
      status: claim.status,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      pickupConfirmedAt: claim.pickupConfirmedAt ? claim.pickupConfirmedAt.toISOString() : undefined,
    });
  } catch (err) {
    next(err);
  }
};

const confirmPickup = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    if (!requestId || typeof requestId !== "string") return res.status(400).json({ message: "requestId is required" });

    const claim = await ClaimRequest.findById(requestId);
    if (!claim) return res.status(404).json({ message: "Claim request not found" });
    if (claim.ngo.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
    if (claim.status !== "accepted") return res.status(400).json({ message: "Claim request is not accepted" });
    if (claim.pickupConfirmedAt) return res.status(400).json({ message: "Pickup already confirmed" });

    const listing = await Listing.findById(claim.listing);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    claim.pickupConfirmedAt = new Date();
    await claim.save();

    await Notification.create({
      audience: "restaurant",
      type: "claimed",
      message: `${claim.ngoName} confirmed pickup for “${listing.foodName}”.`,
      user: listing.restaurant,
      listing: listing._id,
      request: claim._id,
      read: false,
    });

    res.json({
      id: claim._id.toString(),
      listingId: listing._id.toString(),
      ngoName: claim.ngoName,
      status: claim.status,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      pickupConfirmedAt: claim.pickupConfirmedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

const myClaims = async (req, res, next) => {
  try {
    const claims = await ClaimRequest.find({ ngo: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json(
      claims.map((c) => ({
        id: c._id.toString(),
        listingId: c.listing.toString(),
        ngoName: c.ngoName,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        pickupConfirmedAt: c.pickupConfirmedAt ? c.pickupConfirmedAt.toISOString() : undefined,
      }))
    );
  } catch (err) {
    next(err);
  }
};

const restaurantPendingClaims = async (req, res, next) => {
  try {
    // show pending claims for restaurant listings
    const listings = await Listing.find({ restaurant: req.user._id }).select("_id");
    const listingIds = listings.map((l) => l._id);
    const claims = await ClaimRequest.find({ listing: { $in: listingIds }, status: "pending" })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(
      claims.map((c) => ({
        id: c._id.toString(),
        listingId: c.listing.toString(),
        ngoName: c.ngoName,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        pickupConfirmedAt: c.pickupConfirmedAt ? c.pickupConfirmedAt.toISOString() : undefined,
      }))
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestClaim,
  respondToClaim,
  confirmPickup,
  myClaims,
  restaurantPendingClaims,
};

