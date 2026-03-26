import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl flex-1 flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Registration Portal
        </h1>
        <p className="text-lg text-foreground/70">
          Secure your place in the cyber-stadium. Fill out your digital dossier below.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-card-border -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center gap-2 px-4 bg-background z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              step === 1 ? "bg-primary text-black glow-border-cyan" : "bg-card-bg border border-card-border text-foreground/50"
            }`}>
              {step === 1 ? 1 : step}
            </div>
            <span className={`text-xs font-medium uppercase tracking-wider ${step === 1 ? "text-primary" : "text-foreground/50"}`}>
              {step === 1 ? "Account" : step === 2 ? "Preferences" : "Confirm"}
            </span>
          </div>
        ))}
      </div>

      <GlowCard glowColor="cyan" className="p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">First Name</label>
              <input type="text" className="w-full h-12 px-4 rounded-md bg-background/50 border border-card-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground" placeholder="Neon" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Last Name</label>
              <input type="text" className="w-full h-12 px-4 rounded-md bg-background/50 border border-card-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground" placeholder="Rider" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Digital ID (Email)</label>
            <input type="email" className="w-full h-12 px-4 rounded-md bg-background/50 border border-card-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground" placeholder="neo@cyber-stadium.net" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Event Category Interest</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-md border border-primary/50 bg-primary/5 cursor-pointer">
                <div className="w-5 h-5 rounded-sm bg-primary text-black flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-primary">Athletics</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-md border border-card-border bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
                <div className="w-5 h-5 rounded-sm border border-card-border bg-background/50"></div>
                <span className="text-sm text-foreground/70">Mind Sports</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-md border border-card-border bg-background/50 cursor-pointer hover:border-secondary/50 transition-colors">
                <div className="w-5 h-5 rounded-sm border border-card-border bg-background/50"></div>
                <span className="text-sm text-foreground/70">Culture Hub</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button variant="neonPill" size="pill" className="w-full sm:w-auto px-8">
              Continue to Step 2
            </Button>
          </div>
        </form>
      </GlowCard>
    </div>
  );
}
