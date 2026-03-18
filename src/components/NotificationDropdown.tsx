import { Clock, Package, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

const iconMap = {
  new_listing: Package,
  expiring: Clock,
  claimed: CheckCircle,
  claim_request: Package,
  claim_accepted: CheckCircle,
  claim_rejected: Clock,
};

export const NotificationDropdown = ({ onClose }: { onClose: () => void }) => {
  const { role } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const audience = role === "restaurant" ? "restaurant" : "ngo";
  const items = notifications.filter((n) => n.audience === audience);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 animate-slide-up rounded-lg border bg-card shadow-lg">
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <button
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => markAllNotificationsRead(audience)}
            >
              Mark all read
            </button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No notifications yet.</div>
          ) : items.map((n) => {
            const Icon = iconMap[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                }}
                className={`flex w-full items-start gap-3 border-b p-3 text-left last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.type === "expiring" ? "text-accent" : "text-primary"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
