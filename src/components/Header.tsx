import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "./NotificationDropdown";
import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";

export const Header = () => {
  const { isAuthenticated, role, userName, logout } = useAuth();
  const { notifications } = useAppData();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDashMenu, setShowDashMenu] = useState(false);
  const unreadCount =
    role === "restaurant"
      ? notifications.filter((n) => n.audience === "restaurant" && !n.read).length
      : role === "ngo"
        ? notifications.filter((n) => n.audience === "ngo" && !n.read).length
        : 0;

  const goDashboard = (target: "restaurant" | "ngo") => {
    setShowDashMenu(false);
    if (!isAuthenticated) {
      navigate(`/login?role=${target}`);
      return;
    }
    if (role === target) {
      navigate(target === "restaurant" ? "/dashboard/restaurant" : "/dashboard/ngo");
      return;
    }
    // switching roles requires re-authentication
    logout();
    navigate(`/login?role=${target}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-end">
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                {userName} ({role === "restaurant" ? "Restaurant" : "NGO"})
              </span>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                      {Math.min(99, unreadCount)}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDashMenu((s) => !s)}
                >
                  Dashboard
                </Button>
                {showDashMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDashMenu(false)} />
                    <div className="absolute right-0 top-12 z-50 w-44 animate-slide-up rounded-lg border bg-card shadow-lg">
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        onClick={() => goDashboard("ngo")}
                      >
                        NGO Dashboard
                      </button>
                      <button
                        className="w-full border-t px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        onClick={() => goDashboard("restaurant")}
                      >
                        Restaurant Dashboard
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Link to="/map">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Map</Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { logout(); navigate("/"); }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
