import { Header } from "@/components/Header";
import { FoodListingCard } from "@/components/FoodListingCard";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { mockListings } from "@/data/mockData";

function getTimeLeft(expiry: string): string {
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function isUrgent(expiry: string): boolean {
  const diff = new Date(expiry).getTime() - Date.now();
  return diff > 0 && diff < 60 * 60 * 1000;
}

export const MapView = () => {
  const { userName, role } = useAuth();
  const { listings, claimRequests, requestClaim } = useAppData();
  const mapListings = useMemo(() => listings.filter((l) => l.lat && l.lng), [listings]);

  const ngoAvailableListingsMain = useMemo(
    () => mapListings.filter((l) => l.status === "available"),
    [mapListings],
  );

  const ngoDemoListings = useMemo(
    () => mockListings.filter((l) => l.lat && l.lng && l.status === "available"),
    [],
  );

  const restaurantListingsOnMap = useMemo(
    () => mapListings.filter((l) => l.restaurantName === userName),
    [mapListings, userName],
  );

  const ngoListingsForView =
    role === "ngo" && ngoAvailableListingsMain.length === 0 ? ngoDemoListings : ngoAvailableListingsMain;

  const markers = role === "restaurant" ? restaurantListingsOnMap : ngoListingsForView;
  const [selected, setSelected] = useState<string | null>(null);
  const selectedListing = markers.find((l) => l.id === selected) ?? markers[0] ?? null;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Map View</h1>
        <p className="mb-6 text-sm text-muted-foreground">Click a marker to view food details</p>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map placeholder */}
          <div className="relative col-span-2 overflow-hidden rounded-lg border bg-card">
            <div className="relative h-[500px] bg-gradient-to-br from-primary/5 to-muted">
              {/* Grid overlay for map feel */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />
              
              {/* Markers */}
              {markers.map((l) => {
                const x = ((l.lng! - 77.195) / 0.04) * 100;
                const y = ((28.64 - l.lat!) / 0.04) * 100;
                const urgent = isUrgent(l.expiryTime);
                const timeLeft = getTimeLeft(l.expiryTime);
                return (
                  <button
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    className={`absolute z-10 flex flex-col items-center transition-transform hover:scale-110 ${
                      selected === l.id ? "scale-110" : ""
                    }`}
                    style={{ left: `${Math.min(90, Math.max(5, x))}%`, top: `${Math.min(90, Math.max(5, y))}%` }}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md ${
                        urgent ? "bg-accent" : selected === l.id ? "bg-secondary" : "bg-primary"
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="mt-1 rounded-md bg-card/95 px-2 py-1 text-[11px] shadow-lg">
                      <p className="max-w-[140px] truncate font-semibold text-foreground">{l.foodName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {l.quantity} • {timeLeft}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="absolute bottom-3 left-3 rounded-md bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow">
                Interactive map — {markers.length} listings nearby
              </div>
            </div>
          </div>

          {/* Detail / listing panel */}
          <div>
            {role === "restaurant" ? (
              <div className="animate-slide-up">
                <h2 className="mb-3 text-lg font-semibold text-foreground">Your Listings on Map</h2>
                {restaurantListingsOnMap.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No listings with map locations yet.</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
                    {restaurantListingsOnMap.map((l) => (
                      <button
                        key={l.id}
                        className={`w-full text-left ${selected === l.id ? "ring-2 ring-primary rounded-lg" : ""}`}
                        onClick={() => setSelected(l.id)}
                      >
                        <FoodListingCard listing={l} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-slide-up">
                <h2 className="mb-3 text-lg font-semibold text-foreground">Available Nearby</h2>
                {ngoListingsForView.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
                    <MapPin className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No available listings with map locations yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
                    {ngoListingsForView.map((l) => {
                      const pending = claimRequests.some(
                        (r) =>
                          r.listingId === l.id &&
                          r.status === "pending",
                      );
                      return (
                        <button
                          key={l.id}
                          className={`w-full text-left ${selected === l.id ? "ring-2 ring-primary rounded-lg" : ""}`}
                          onClick={() => setSelected(l.id)}
                        >
                          <FoodListingCard
                            listing={l}
                            showActions="ngo"
                            onClaim={() => {
                              requestClaim(l.id, userName || "My NGO")
                                .then(() => toast.success("Claim request sent to the restaurant for approval."))
                                .catch((err) =>
                                  toast.error(err instanceof Error ? err.message : "Failed to send claim request")
                                );
                            }}
                            claimDisabled={pending}
                            claimLabel={pending ? "Requested" : "Claim Food"}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
