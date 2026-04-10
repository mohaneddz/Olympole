import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SearchX, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/backgrounds/hero.avif"
          alt="Not found background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center space-y-6 rounded-3xl border border-white/5 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <SearchX className="h-10 w-10 text-cyan-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-6xl font-black tracking-tight text-white drop-shadow-md">404</h2>
          <p className="text-xl font-semibold text-white/90">Area Not Found</p>
          <p className="text-muted-foreground text-sm">The digital frontier you're looking for doesn't exist or has moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button variant="neonPill" asChild className="w-full flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
