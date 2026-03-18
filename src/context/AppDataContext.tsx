import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type FoodListing } from "@/data/mockData";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export type NotificationType = "new_listing" | "claimed" | "expiring" | "claim_request" | "claim_accepted" | "claim_rejected";

export type AppNotification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  audience: "restaurant" | "ngo";
  listingId?: string;
  requestId?: string;
};

export type ClaimRequestStatus = "pending" | "accepted" | "rejected";

export type ClaimRequest = {
  id: string;
  listingId: string;
  ngoName: string;
  status: ClaimRequestStatus;
  createdAt: string;
  updatedAt: string;
  pickupConfirmedAt?: string;
};

type AppDataState = {
  listings: FoodListing[];
  notifications: (AppNotification & { time: string })[];
  claimRequests: ClaimRequest[];
  createListing: (listing: FoodListing) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  requestClaim: (listingId: string, ngoName: string) => Promise<void>;
  respondToClaim: (requestId: string, action: "accept" | "reject") => Promise<void>;
  confirmPickup: (requestId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (audience: AppNotification["audience"]) => Promise<void>;
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const AppDataContext = createContext<AppDataState | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, role } = useAuth();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [storedNotifications, setStoredNotifications] = useState<AppNotification[]>([]);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const pollingRef = useRef<number | null>(null);

  const refreshListings = async () => {
    const data = await apiFetch<FoodListing[]>("/api/listings");
    setListings(data);
  };

  const refreshAuthed = async () => {
    if (!isAuthenticated) {
      setStoredNotifications([]);
      setClaimRequests([]);
      return;
    }
    const claimsPromise =
      role === "restaurant"
        ? apiFetch<ClaimRequest[]>("/api/claims/restaurant/pending", { auth: true })
        : apiFetch<ClaimRequest[]>("/api/claims/me", { auth: true });

    const [notifs, claims] = await Promise.all([
      apiFetch<AppNotification[]>("/api/notifications/me", { auth: true }),
      claimsPromise.catch(() => [] as ClaimRequest[]),
    ]);
    setStoredNotifications(notifs);
    setClaimRequests(claims);
  };

  useEffect(() => {
    void refreshListings();
  }, []);

  useEffect(() => {
    void refreshAuthed();
  }, [isAuthenticated, role]);

  // Poll in background so NGO/Restaurant see updates immediately
  useEffect(() => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    // Always keep listings reasonably fresh (claimed/expired changes)
    const intervalMs = 4000;
    pollingRef.current = window.setInterval(() => {
      void refreshListings();
      if (isAuthenticated) void refreshAuthed();
    }, intervalMs);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [isAuthenticated, role]);

  const createListing = async (listing: FoodListing) => {
    // Use only required fields; backend fills restaurantName/status/createdAt/id
    await apiFetch<FoodListing>("/api/listings", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        foodName: listing.foodName,
        quantity: listing.quantity,
        expiryTime: listing.expiryTime,
        pickupLocation: listing.pickupLocation,
        lat: listing.lat,
        lng: listing.lng,
      }),
    });
    await refreshListings();
    await refreshAuthed();
  };

  const deleteListing = async (id: string) => {
    await apiFetch<void>(`/api/listings/${id}`, { method: "DELETE", auth: true });
    await refreshListings();
    await refreshAuthed();
  };

  const requestClaim = async (listingId: string) => {
    await apiFetch<ClaimRequest>("/api/claims/request", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ listingId }),
    });
    await refreshAuthed();
  };

  const respondToClaim = async (requestId: string, action: "accept" | "reject") => {
    await apiFetch<ClaimRequest>("/api/claims/respond", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ requestId, action }),
    });
    await refreshListings();
    await refreshAuthed();
  };

  const confirmPickup = async (requestId: string) => {
    await apiFetch<ClaimRequest>("/api/claims/confirm-pickup", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ requestId }),
    });
    await refreshAuthed();
  };

  const markNotificationRead = async (id: string) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PUT", auth: true });
    await refreshAuthed();
  };

  const markAllNotificationsRead = async () => {
    await apiFetch("/api/notifications/me/read-all", { method: "PUT", auth: true });
    await refreshAuthed();
  };

  const value: AppDataState = {
    listings,
    notifications: useMemo(
      () => storedNotifications.map((n) => ({ ...n, time: relativeTime(n.createdAt) })),
      [storedNotifications],
    ),
    claimRequests,
    createListing,
    deleteListing,
    requestClaim: async (listingId: string, _ngoName: string) => requestClaim(listingId),
    respondToClaim,
    confirmPickup,
    markNotificationRead,
    markAllNotificationsRead: async (_audience: AppNotification["audience"]) => markAllNotificationsRead(),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be inside AppDataProvider");
  return ctx;
};

