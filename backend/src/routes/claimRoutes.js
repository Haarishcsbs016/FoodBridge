const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  requestClaim,
  respondToClaim,
  confirmPickup,
  myClaims,
  restaurantPendingClaims,
} = require("../controllers/claimController");

const router = express.Router();

// NGO
router.get("/me", requireAuth, requireRole("ngo"), myClaims);
router.post("/request", requireAuth, requireRole("ngo"), requestClaim);
router.post("/confirm-pickup", requireAuth, requireRole("ngo"), confirmPickup);

// Restaurant
router.get("/restaurant/pending", requireAuth, requireRole("restaurant"), restaurantPendingClaims);
router.post("/respond", requireAuth, requireRole("restaurant"), respondToClaim);

module.exports = router;

