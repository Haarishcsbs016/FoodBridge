function toFoodListingDTO(listing) {
  return {
    id: listing._id.toString(),
    foodName: listing.foodName,
    quantity: listing.quantity,
    expiryTime: listing.expiryTime.toISOString(),
    pickupLocation: listing.pickupLocation,
    restaurantName: listing.restaurantName,
    status: listing.status,
    claimedBy: listing.claimedBy ?? undefined,
    createdAt: listing.createdAt.toISOString(),
    lat: listing.coordinates?.lat ?? undefined,
    lng: listing.coordinates?.lng ?? undefined,
  };
}

module.exports = { toFoodListingDTO };

