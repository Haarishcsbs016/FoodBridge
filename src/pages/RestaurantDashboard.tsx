import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { FoodListingCard } from "@/components/FoodListingCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useNavigate } from "react-router-dom";

export const RestaurantDashboard = () => {
  const { userName, role, isAuthenticated } = useAuth();
  const { listings, claimRequests, notifications, createListing, deleteListing, respondToClaim } = useAppData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "reserved" | "claimed" | "expired">("all");
  const [form, setForm] = useState({ foodName: "", quantity: "", expiryTime: "", pickupLocation: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?role=restaurant");
      return;
    }
    if (role && role !== "restaurant") {
      navigate("/dashboard/ngo");
    }
  }, [isAuthenticated, navigate, role]);

  const filtered = useMemo(() => (filter === "all" ? listings : listings.filter((l) => l.status === filter)), [filter, listings]);
  const pendingRequests = useMemo(() => claimRequests.filter((r) => r.status === "pending"), [claimRequests]);
  const completedPickups = useMemo(
    () => notifications.filter((n) => n.audience === "restaurant" && n.type === "claimed"),
    [notifications],
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing = {
      id: Date.now().toString(),
      ...form,
      restaurantName: userName || "My Restaurant",
      status: "available",
      createdAt: new Date().toISOString(),
      distance: 0,
    };
    createListing(newListing);
    setForm({ foodName: "", quantity: "", expiryTime: "", pickupLocation: "" });
    setShowForm(false);
    toast.success("Listing created successfully!");
  };

  const handleDelete = (id: string) => {
    deleteListing(id);
    toast.success("Listing deleted");
  };

  const handleEdit = (id: string) => {
    toast.info("Edit functionality — click to modify listing #" + id);
  };

  const analytics = useMemo(() => {
    const pending = claimRequests.filter((r) => r.status === "pending").length;
    const accepted = claimRequests.filter((r) => r.status === "accepted").length;
    const rejected = claimRequests.filter((r) => r.status === "rejected").length;
    const completed = notifications.filter((n) => n.audience === "restaurant" && n.type === "claimed").length;
    const created = listings.length;
    return { pending, accepted, rejected, completed, created };
  }, [claimRequests, listings.length, notifications]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Restaurant Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your food donations</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Listing"}
          </Button>
        </div>

        {/* Analytics */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Listings</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.created}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Pending requests</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.pending}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Accepted</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.accepted}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.rejected}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Completed pickups</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{analytics.completed}</p>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 animate-slide-up rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Create Food Listing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="foodName">Food Name</Label>
                <Input id="foodName" value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} placeholder="e.g. Butter Chicken" required />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 20 servings" required />
              </div>
              <div>
                <Label htmlFor="expiryTime">Expiry Time</Label>
                <Input id="expiryTime" type="datetime-local" value={form.expiryTime} onChange={(e) => setForm({ ...form, expiryTime: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input id="pickupLocation" value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} placeholder="e.g. 123 Main St" required />
              </div>
            </div>
            <Button type="submit" className="mt-4">Create Listing</Button>
          </form>
        )}

        {pendingRequests.length > 0 && (
          <div className="mb-6 animate-slide-up rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Claim Requests</h2>
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {pendingRequests.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((r) => {
                const listing = listings.find((l) => l.id === r.listingId);
                if (!listing) return null;
                return (
                  <div key={r.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.ngoName} wants “{listing.foodName}”
                      </p>
                      <p className="text-xs text-muted-foreground">{listing.pickupLocation}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          respondToClaim(r.id, "accept");
                          toast.success("Request accepted. NGO has been notified.");
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          respondToClaim(r.id, "reject");
                          toast.info("Request rejected. NGO has been notified.");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedPickups.length > 0 && (
          <div className="mb-6 animate-slide-up rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Completed Orders</h2>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {completedPickups.length}
              </span>
            </div>
            <div className="space-y-2">
              {completedPickups.slice(0, 5).map((n) => {
                const listing = n.listingId ? listings.find((l) => l.id === n.listingId) : undefined;
                return (
                  <div key={n.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium text-foreground">{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {listing ? `${listing.restaurantName} • ${listing.pickupLocation}` : "Completed pickup"}
                      {" • "}
                      {n.time}
                    </p>
                  </div>
                );
              })}
              {completedPickups.length > 5 && (
                <p className="pt-1 text-xs text-muted-foreground">Showing latest 5. See notifications for more.</p>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {(["all", "available", "reserved", "claimed", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No listings match your filter" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <FoodListingCard key={l.id} listing={l} showActions="restaurant" onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
