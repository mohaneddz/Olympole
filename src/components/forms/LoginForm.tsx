"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

export function LoginForm() {
  const [signInState, signInFormAction, signingIn] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction, signingUp] = useActionState(signUpAction, initialState);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto">
      {isLogin ? (
        <form action={signInFormAction} key="login" className="space-y-5 p-6 md:p-8 rounded-2xl bg-black/40 border border-white/10 shadow-inner animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 uppercase tracking-wide">Login</h3>
          <div className="space-y-4">
            <input name="email" type="email" required placeholder="Email Address" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
            <input name="password" type="password" required placeholder="Password" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
          </div>
          <Button type="submit" variant="neonPill" size="pill" className="w-full mt-2 font-bold tracking-widest uppercase transition-all hover:scale-[1.02]" disabled={signingIn}>
            {signingIn ? "Authenticating..." : "Sign In"}
          </Button>
          {signInState.message ? (
            <p className={signInState.ok ? "text-green-400 text-sm font-medium mt-2" : "text-red-400 text-sm font-medium mt-2"}>{signInState.message}</p>
          ) : null}
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(false)} className="text-white/60 hover:text-white text-sm transition-colors mt-2">
              Don&apos;t have an account? Sign up
            </button>
          </div>
        </form>
      ) : (
        <form action={signUpFormAction} key="signup" className="space-y-5 p-6 md:p-8 rounded-2xl bg-black/40 border border-white/10 shadow-inner animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 uppercase tracking-wide">Create Account</h3>
          <div className="space-y-4">
            <input name="full_name" required placeholder="Full Name" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
            <input name="username" placeholder="Username (optional)" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
            <input name="email" type="email" required placeholder="Email Address" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
            <input name="password" type="password" required placeholder="Password (8+ chars, upper/lower/number)" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
          </div>
          <Button type="submit" variant="neonPill" size="pill" className="w-full mt-2 font-bold tracking-widest uppercase transition-all hover:scale-[1.02]" disabled={signingUp}>
            {signingUp ? "Creating..." : "Sign Up"}
          </Button>
          {signUpState.message ? (
            <p className={signUpState.ok ? "text-green-400 text-sm font-medium mt-2" : "text-red-400 text-sm font-medium mt-2"}>{signUpState.message}</p>
          ) : null}
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(true)} className="text-white/60 hover:text-white text-sm transition-colors mt-2">
              Already have an account? Log in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
