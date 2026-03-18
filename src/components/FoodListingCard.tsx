import { FoodListing } from "@/data/mockData";
import { Clock, MapPin, Package, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function getTimeLeft(expiry: string): string {
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

function isUrgent(expiry: string): boolean {
  return new Date(expiry).getTime() - Date.now() < 60 * 60 * 1000 && new Date(expiry).getTime() > Date.now();
}

interface Props {
  listing: FoodListing;
  onClaim?: (id: string) => void;
  claimDisabled?: boolean;
  claimLabel?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showActions?: "restaurant" | "ngo";
}

export const FoodListingCard = ({ listing, onClaim, claimDisabled, claimLabel, onDelete, onEdit, showActions }: Props) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(listing.expiryTime));
  const urgent = isUrgent(listing.expiryTime);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(listing.expiryTime)), 30000);
    return () => clearInterval(interval);
  }, [listing.expiryTime]);

  const statusColors = {
    available: "bg-primary/10 text-primary",
    reserved: "bg-amber-100 text-amber-800",
    claimed: "bg-blue-100 text-blue-700",
    expired: "bg-muted text-muted-foreground",
  };

  return (
    <div className="animate-slide-up rounded-lg border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">{listing.foodName}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[listing.status]}`}>
          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
        </span>
      </div>

      <p className="mb-3 text-sm font-medium text-muted-foreground">{listing.restaurantName}</p>

      <div className="mb-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>{listing.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{listing.pickupLocation}</span>
          {listing.distance && (
            <span className="ml-auto text-xs font-medium text-foreground">{listing.distance} km</span>
          )}
        </div>
        <div className={`flex items-center gap-2 ${urgent ? "font-semibold text-accent" : ""}`}>
          <Clock className={`h-4 w-4 ${urgent ? "text-accent" : ""}`} />
          <span>{timeLeft}</span>
        </div>
      </div>

      {showActions === "ngo" && listing.status === "available" && (
        <Button className="w-full" disabled={claimDisabled} onClick={() => onClaim?.(listing.id)}>
          {claimLabel ?? "Claim Food"}
        </Button>
      )}

      {showActions === "restaurant" && (
        <div className="flex gap-2">
          {listing.status === "available" && (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(listing.id)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => onDelete?.(listing.id)}>
                Delete
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
