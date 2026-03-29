import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Leaf } from "lucide-react";
import { toast } from "sonner";

export const Signup = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"restaurant" | "ngo">("restaurant");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role, address });
      navigate(role === "restaurant" ? "/dashboard/restaurant" : "/dashboard/ngo");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-lg border bg-card p-8">
          <div className="mb-6 flex flex-col items-center">
            <Leaf className="mb-2 h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
            <p className="text-sm text-muted-foreground">Join NutriShare and start making an impact</p>
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
              <Label htmlFor="name">Organization Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "restaurant" ? "Restaurant name" : "NGO name"} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={role === "restaurant" ? "Restaurant address" : "NGO address"}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
