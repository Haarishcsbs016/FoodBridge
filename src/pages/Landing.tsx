import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Bell, Clock, MapPin, Leaf, Heart, Users, ArrowRight } from "lucide-react";

const features = [
  { icon: Bell, title: "Real-Time Alerts", desc: "Get instant notifications when fresh food is available near you." },
  { icon: MapPin, title: "Map-Based Pickup", desc: "Locate the nearest pickup point with our integrated map view." },
  { icon: Clock, title: "Expiry Tracking", desc: "Smart countdown timers ensure food is collected while it's fresh." },
];

const stats = [
  { value: "12,400+", label: "Meals Saved", icon: Heart },
  { value: "340+", label: "Partner Restaurants", icon: Leaf },
  { value: "85+", label: "NGOs Connected", icon: Users },
];

export const Landing = () => (
  <div className="min-h-screen">
    <Header />

    {/* Hero */}
    <section className="relative overflow-hidden bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container relative py-24 text-center lg:py-36">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
          🌱 Fighting Food Waste Together
        </span>
        <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Reduce Food Waste,{" "}
          <span className="text-primary">Feed Lives</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Connect surplus food from restaurants to NGOs and food banks in real time. Every meal counts.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="gap-2 px-8 text-base">
              Donate Food <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
              Find Food <MapPin className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y bg-primary/5">
      <div className="container grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <s.icon className="mb-2 h-6 w-6 text-primary" />
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="container py-20">
      <h2 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">How It Works</h2>
      <p className="mx-auto mb-12 max-w-md text-center text-muted-foreground">
        A simple, efficient flow to rescue food and feed communities.
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t bg-card">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">NutriShare</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 NutriShare. Reducing waste, feeding hope.</p>
      </div>
    </footer>
  </div>
);
