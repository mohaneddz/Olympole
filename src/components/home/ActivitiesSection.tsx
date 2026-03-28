import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function ActivitiesSection() {
  return (
    <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(5,5,15),rgb(2,2,8))] border-t border-card-border overflow-hidden">
      {/* Background image imitating the provided design's pitch */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020208] to-transparent z-10" />
        <Image
          src="/images/backgrounds/background.png"
          alt="Pitch Background"
          fill
          className="object-cover"
        />
      </div>

      <div className="container relative z-20 mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16">
          <Image
            src="/images/brand/fire.png"
            alt="Olympics Flame Logo"
            width={80}
            height={80}
            className="mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            Activities
          </h2>
          <div className="h-1 w-24 bg-cyan-400 rounded-full mb-6 mx-auto shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
          <p className="text-xl md:text-2xl text-foreground font-medium max-w-2xl">
            Register On Your Favorite Activity and Join the Fun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Collective Sports Column */}
          <div className="flex flex-col gap-4 rounded-xl border-2 border-pink-400/50 p-6 bg-background/40 backdrop-blur-sm shadow-[0_0_20px_rgba(244,114,182,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-pink-400 text-2xl">⚽</span>
              <h3 className="text-2xl font-bold text-pink-100">Collective Sports</h3>
            </div>
            
            <div className="flex items-center justify-between bg-pink-400 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:scale-[1.02] transition-transform">
              <span>Football</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-pink-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-pink-400 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:scale-[1.02] transition-transform">
              <span>Basketball</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-pink-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-pink-400 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:scale-[1.02] transition-transform">
              <span>Handball</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-pink-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-pink-400 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:scale-[1.02] transition-transform">
              <span>Volleyball</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-pink-400 font-bold px-6">REGISTER</Button>
            </div>
          </div>

          {/* Individual Sports Column */}
          <div className="flex flex-col gap-4 rounded-xl border-2 border-yellow-300/50 p-6 bg-background/40 backdrop-blur-sm shadow-[0_0_20px_rgba(253,224,71,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-yellow-300 text-2xl">🏋️</span>
              <h3 className="text-2xl font-bold text-yellow-100">Individual Sports</h3>
            </div>
            
            <div className="flex items-center justify-between bg-yellow-300 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(253,224,71,0.3)] hover:scale-[1.02] transition-transform">
              <span>Swimming</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-yellow-300 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-yellow-300 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(253,224,71,0.3)] hover:scale-[1.02] transition-transform">
              <span>Tennis</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-yellow-300 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-yellow-300 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(253,224,71,0.3)] hover:scale-[1.02] transition-transform">
              <span>Chess</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-yellow-300 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-yellow-300 text-gray-900 rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(253,224,71,0.3)] hover:scale-[1.02] transition-transform">
              <span>Running</span>
              <Button className="bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-yellow-300 font-bold px-6">REGISTER</Button>
            </div>
          </div>

          {/* Cultural Events Column */}
          <div className="flex flex-col gap-4 rounded-xl border-2 border-cyan-400/50 p-6 bg-background/40 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-cyan-400 text-2xl">🎨</span>
              <h3 className="text-2xl font-bold text-cyan-100">Cultural Events</h3>
            </div>
            
            <div className="flex items-center justify-between bg-cyan-400 text-white rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-transform">
              <span>Talent Show</span>
              <Button className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white hover:text-cyan-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-cyan-400 text-white rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-transform">
              <span>Knowledge Cup</span>
              <Button className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white hover:text-cyan-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-cyan-400 text-white rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-transform">
              <span>Writing Contest</span>
              <Button className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white hover:text-cyan-400 font-bold px-6">REGISTER</Button>
            </div>
            <div className="flex items-center justify-between bg-cyan-400 text-white rounded-lg px-6 py-4 font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-transform">
              <span>Drawing & Art</span>
              <Button className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white hover:text-cyan-400 font-bold px-6">REGISTER</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}