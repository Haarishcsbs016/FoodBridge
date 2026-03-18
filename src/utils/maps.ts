import type { FoodListing } from "@/data/mockData";

function buildGoogleMapsDirectionsUrl(params: {
  origin?: { lat: number; lng: number } | { address: string };
  destination: { lat?: number; lng?: number; address?: string };
}) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");

  if (params.origin) {
    if ("address" in params.origin) {
      url.searchParams.set("origin", params.origin.address);
    } else {
      url.searchParams.set("origin", `${params.origin.lat},${params.origin.lng}`);
    }
  }

  const { lat, lng, address } = params.destination;
  if (typeof lat === "number" && typeof lng === "number") {
    url.searchParams.set("destination", `${lat},${lng}`);
  } else if (address) {
    url.searchParams.set("destination", address);
  }

  url.searchParams.set("travelmode", "driving");
  return url.toString();
}

async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return await new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function openDirectionsToListing(listing: FoodListing, originAddress?: string) {
  const destination = {
    lat: listing.lat,
    lng: listing.lng,
    address: listing.pickupLocation,
  };

  try {
    if (originAddress && originAddress.trim()) {
      window.open(
        buildGoogleMapsDirectionsUrl({ origin: { address: originAddress.trim() }, destination }),
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
    const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    window.open(buildGoogleMapsDirectionsUrl({ origin, destination }), "_blank", "noopener,noreferrer");
  } catch {
    // Fallback: open without origin (Google Maps will ask / infer origin)
    window.open(buildGoogleMapsDirectionsUrl({ destination }), "_blank", "noopener,noreferrer");
  }
}

