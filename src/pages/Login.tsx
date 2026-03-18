import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Leaf } from "lucide-react";
import { toast } from "sonner";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"restaurant" | "ngo">("restaurant");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");
    if (r === "restaurant" || r === "ngo") setRole(r);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // backend role decides dashboard, but keep UX aligned with toggle
      navigate(role === "restaurant" ? "/dashboard/restaurant" : "/dashboard/ngo");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-lg border bg-card p-8">
          <div className="mb-6 flex flex-col items-center">
            <Leaf className="mb-2 h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your NutriShare account</p>
          </div>

          <div className="mb-6 flex overflow-hidden rounded-lg border">
            <button
              type="button"
              onClick={() => setRole("restaurant")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${role === "restaurant" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Restaurant
            </button>
            <button
              type="button"
              onClick={() => setRole("ngo")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${role === "ngo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Food Bank / NGO
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
