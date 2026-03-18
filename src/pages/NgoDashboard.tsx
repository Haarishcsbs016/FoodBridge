import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { FoodListingCard } from "@/components/FoodListingCard";
import { EmptyState } from "@/components/EmptyState";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { openDirectionsToListing } from "@/utils/maps";
import { useNavigate } from "react-router-dom";

export const NgoDashboard = () => {
  const { userName, userAddress, role, isAuthenticated } = useAuth();
  const { listings, claimRequests, requestClaim, notifications, confirmPickup } = useAppData();
  const navigate = useNavigate();
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [tab, setTab] = useState<"available" | "claimed">(() => {
    const hasNewAccepted = notifications.some((n) => n.audience === "ngo" && n.type === "claim_accepted" && !n.read);
    return hasNewAccepted ? "claimed" : "available";
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?role=ngo");
      return;
    }
    if (role && role !== "ngo") {
      // wrong role opened this page
      navigate("/dashboard/restaurant");
    }
  }, [isAuthenticated, navigate, role]);

  useEffect(() => {
    const hasNewAccepted = notifications.some((n) => n.audience === "ngo" && n.type === "claim_accepted" && !n.read);
    if (hasNewAccepted) setTab("claimed");
  }, [notifications]);

  const available = useMemo(() => {
    return listings.filter((l) => {
      if (l.status !== "available") return false;
      if (distanceFilter !== "all" && l.distance && l.distance > Number(distanceFilter)) return false;
      if (expiryFilter === "1h") {
        const diff = new Date(l.expiryTime).getTime() - Date.now();
        if (diff > 60 * 60 * 1000 || diff <= 0) return false;
      }
      if (expiryFilter === "3h") {
        const diff = new Date(l.expiryTime).getTime() - Date.now();
        if (diff > 3 * 60 * 60 * 1000 || diff <= 0) return false;
      }
      return true;
    });
  }, [distanceFilter, expiryFilter, listings]);

  const claimed = useMemo(() => {
    // claimRequests are already scoped to the logged-in NGO from the backend
    const acceptedIds = new Set(claimRequests.filter((r) => r.status === "accepted").map((r) => r.listingId));
    return listings.filter((l) => acceptedIds.has(l.id));
  }, [claimRequests, listings]);

  const claimRequestByListingId = useMemo(() => {
    const map = new Map<string, (typeof claimRequests)[number]>();
    for (const r of claimRequests) {
      if (r.status !== "accepted") continue;
      map.set(r.listingId, r);
    }
    return map;
  }, [claimRequests]);

  const handleClaim = async (id: string) => {
    try {
      await requestClaim(id, userName || "My NGO");
      toast.success("Claim request sent to the restaurant for approval.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send claim request");
    }
  };

  const analytics = useMemo(() => {
    const pending = claimRequests.filter((r) => r.status === "pending").length;
    const accepted = claimRequests.filter((r) => r.status === "accepted").length;
    const rejected = claimRequests.filter((r) => r.status === "rejected").length;
    const completed = claimRequests.filter((r) => r.status === "accepted" && Boolean(r.pickupConfirmedAt)).length;
    return { pending, accepted, rejected, completed, total: claimRequests.length };
  }, [claimRequests]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">NGO Dashboard</h1>
          <p className="text-sm text-muted-foreground">Find and claim available food donations</p>
        </div>

        {/* Analytics */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Requests sent</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Accepted</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.accepted}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.pending}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Completed pickups</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.completed}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("available")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === "available" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Available ({available.length})
          </button>
          <button
            onClick={() => setTab("claimed")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === "claimed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Claimed ({claimed.length})
          </button>
        </div>

        {tab === "available" && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="w-48">
                <Label className="mb-1 text-xs">Max Distance</Label>
                <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any distance</SelectItem>
                    <SelectItem value="2">Within 2 km</SelectItem>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="mb-1 text-xs">Expiry Window</Label>
                <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="1h">Expiring in 1h</SelectItem>
                    <SelectItem value="3h">Expiring in 3h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {available.length === 0 ? (
              <EmptyState message="No available listings match your filters" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((l) => (
                  <FoodListingCard
                    key={l.id}
                    listing={l}
                    showActions="ngo"
                    onClaim={handleClaim}
                    claimDisabled={claimRequests.some((r) => r.listingId === l.id && r.status === "pending")}
                    claimLabel={claimRequests.some((r) => r.listingId === l.id && r.status === "pending") ? "Requested" : "Claim Food"}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "claimed" && (
          claimed.length === 0 ? (
            <EmptyState message="You haven't claimed any listings yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {claimed.map((l) => (
                <div key={l.id} className="space-y-2">
                  <FoodListingCard listing={l} />
                  {(() => {
                    const req = claimRequestByListingId.get(l.id);
                    const needsConfirm = req && !req.pickupConfirmedAt;
                    if (needsConfirm) {
                      return (
                        <button
                          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            confirmPickup(req.id);
                            toast.success("Pickup confirmed. Opening directions.");
                            void openDirectionsToListing(l, userAddress);
                          }}
                        >
                          Confirm Pickup
                        </button>
                      );
                    }
                    return (
                      <button
                        className="w-full rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => void openDirectionsToListing(l, userAddress)}
                      >
                        Open Location / Directions
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
