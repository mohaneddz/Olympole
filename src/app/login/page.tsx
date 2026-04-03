import { LoginForm } from "@/components/forms/LoginForm";
import { ShieldCheck, Sparkles, Trophy } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-100px)] w-full items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-[-6rem] bottom-[-8rem] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-full max-w-6xl rounded-3xl border border-cyan-300/20 bg-[linear-gradient(140deg,rgba(5,12,34,0.85),rgba(6,18,48,0.86))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.15)] backdrop-blur-md md:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-100">
                AUTH PORTAL
              </p>
              <h1 className="text-4xl font-black uppercase tracking-wider text-white md:text-6xl">
                Olympole Access
              </h1>
              <p className="mt-3 max-w-xl text-base text-cyan-100/70 md:text-lg">
                Sign in or create an account to enter the cyber-stadium and track your registrations, matches, and progress.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-[#0e1731]/80 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold text-white">Secure Access</p>
                <p className="mt-1 text-xs text-cyan-100/65">Account linked to your profile and registrations.</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/15 bg-[#0e1731]/80 p-4">
                <Trophy className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold text-white">Activity Tracking</p>
                <p className="mt-1 text-xs text-cyan-100/65">Keep all event participation in one dashboard.</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/15 bg-[#0e1731]/80 p-4">
                <Sparkles className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold text-white">Live Updates</p>
                <p className="mt-1 text-xs text-cyan-100/65">Get real-time updates for your competitions.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-300/15 bg-[#08112a]/85 p-4 md:p-6">
            <LoginForm />
          </section>
        </div>
      </div>
    </div>
  );
}
