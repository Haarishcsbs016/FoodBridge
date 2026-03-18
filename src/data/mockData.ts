export interface FoodListing {
  id: string;
  foodName: string;
  quantity: string;
  expiryTime: string;
  pickupLocation: string;
  restaurantName: string;
  status: "available" | "reserved" | "claimed" | "expired";
  claimedBy?: string;
  createdAt: string;
  distance?: number;
  lat?: number;
  lng?: number;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "new_listing" | "claimed" | "expiring";
}

export const mockListings: FoodListing[] = [
  {
    id: "1",
    foodName: "Butter Chicken & Naan",
    quantity: "20 servings",
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    pickupLocation: "123 Main St, Downtown",
    restaurantName: "Spice Garden",
    status: "available",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    distance: 1.2,
    lat: 28.6139,
    lng: 77.209,
  },
  {
    id: "2",
    foodName: "Mixed Vegetable Rice",
    quantity: "15 servings",
    expiryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    pickupLocation: "45 Park Ave, Midtown",
    restaurantName: "Green Leaf Bistro",
    status: "available",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    distance: 0.8,
    lat: 28.6129,
    lng: 77.2295,
  },
  {
    id: "3",
    foodName: "Pasta Alfredo",
    quantity: "10 servings",
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    pickupLocation: "789 Oak Blvd, Uptown",
    restaurantName: "Bella Italia",
    status: "claimed",
    claimedBy: "City Food Bank",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    distance: 3.1,
    lat: 28.6353,
    lng: 77.225,
  },
  {
    id: "4",
    foodName: "Fresh Salad Bowls",
    quantity: "25 servings",
    expiryTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    pickupLocation: "22 River Rd, Eastside",
    restaurantName: "Farm Table",
    status: "available",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    distance: 2.4,
    lat: 28.6225,
    lng: 77.2155,
  },
  {
    id: "5",
    foodName: "Sandwich Platter",
    quantity: "30 servings",
    expiryTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    pickupLocation: "56 Hill St, Westend",
    restaurantName: "Corner Deli",
    status: "expired",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    distance: 4.5,
    lat: 28.6085,
    lng: 77.2015,
  },
  {
    id: "6",
    foodName: "Dal Makhani & Roti",
    quantity: "18 servings",
    expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    pickupLocation: "88 Temple Rd, Old City",
    restaurantName: "Punjab Kitchen",
    status: "available",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    distance: 1.7,
    lat: 28.6315,
    lng: 77.2185,
  },
];

export const mockNotifications: Notification[] = [
  { id: "1", message: "New listing: Butter Chicken & Naan from Spice Garden", time: "2 min ago", read: false, type: "new_listing" },
  { id: "2", message: "Mixed Vegetable Rice expires in 45 minutes!", time: "5 min ago", read: false, type: "expiring" },
  { id: "3", message: "Pasta Alfredo was claimed by City Food Bank", time: "15 min ago", read: true, type: "claimed" },
  { id: "4", message: "New listing: Fresh Salad Bowls from Farm Table", time: "20 min ago", read: true, type: "new_listing" },
];
