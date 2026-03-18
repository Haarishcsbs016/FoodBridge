const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  listListings,
  myRestaurantListings,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const router = express.Router();

// public listing feed (NGO uses this)
router.get("/", listListings);

// restaurant operations
router.get("/me", requireAuth, requireRole("restaurant"), myRestaurantListings);
router.post("/", requireAuth, requireRole("restaurant"), createListing);
router.put("/:id", requireAuth, requireRole("restaurant"), updateListing);
router.delete("/:id", requireAuth, requireRole("restaurant"), deleteListing);

module.exports = router;

