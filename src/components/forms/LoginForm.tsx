"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions/auth";

const initialState = { ok: false, message: "" };

type AuthMode = "login" | "signup";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  rightSlot?: React.ReactNode;
};

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
  icon,
  value,
  onChange,
  rightSlot,
}: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-cyan-100/90">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-100/60">
          {icon}
        </div>
        <input
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="h-12 w-full rounded-xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(18,31,58,0.88),rgba(9,17,38,0.88))] pl-10 pr-11 text-cyan-50 placeholder:text-cyan-100/35 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        />
        {rightSlot ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
      </div>
    </label>
  );
}

export function LoginForm() {
  const [signInState, signInFormAction, signingIn] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction, signingUp] = useActionState(signUpAction, initialState);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    password: "",
  });

  const isLogin = mode === "login";
  const state = isLogin ? signInState : signUpState;
  const pending = isLogin ? signingIn : signingUp;
  const tabPanelClassName = "h-[560px] overflow-y-auto pr-1";

  const updateLoginField = (name: keyof typeof loginForm, value: string) => {
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const updateSignupField = (name: keyof typeof signupForm, value: string) => {
    setSignupForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="rounded-[32px] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(5,13,35,0.9),rgba(3,9,26,0.88))] px-5 py-6 shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(34,211,238,0.14)] backdrop-blur-sm md:px-8 md:py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <p className="mx-auto mb-4 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-bold tracking-[0.24em] text-cyan-100">
            AUTH PORTAL
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wide text-white md:text-7xl">Olympole Access</h1>
          <p className="mt-3 text-[17px] text-cyan-100/70 md:text-[32px]">
            Your cyber-stadium. Your competitions. All in one place.
          </p>
        </header>

        <div className="mx-auto inline-flex w-full rounded-2xl border border-cyan-300/20 bg-[#081731]/80 p-1.5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold transition ${
              isLogin
                ? "border border-cyan-300/60 bg-[#43dbf7] text-[#05203a]"
                : "text-cyan-100/75 hover:text-cyan-100"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold transition ${
              !isLogin
                ? "border border-cyan-300/60 bg-[#0f2f4e] text-cyan-50"
                : "text-cyan-100/75 hover:text-cyan-100"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className={tabPanelClassName}>
          {isLogin ? (
            <form action={signInFormAction} className="space-y-4">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              icon={<AtSign className="h-5 w-5" />}
              value={loginForm.email}
              onChange={(value) => updateLoginField("email", value)}
            />

            <InputField
              label="Password"
              name="password"
              type={showLoginPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              icon={<KeyRound className="h-5 w-5" />}
              value={loginForm.password}
              onChange={(value) => updateLoginField("password", value)}
              rightSlot={(
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((value) => !value)}
                  className="text-cyan-100/60 hover:text-cyan-100"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            />

            <button
              type="submit"
              disabled={pending}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-full border border-cyan-300/45 bg-[linear-gradient(90deg,#29c7ee,#5ad7f1)] text-lg font-black uppercase tracking-[0.18em] text-[#04223e] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Authenticating..." : "Sign In"}
            </button>

            {state.message ? (
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  state.ok
                    ? "border-green-400/40 bg-green-400/10 text-green-300"
                    : "border-red-400/40 bg-red-400/10 text-red-300"
                }`}
              >
                {state.message}
              </p>
            ) : null}
            </form>
          ) : (
            <form action={signUpFormAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Full Name"
                name="full_name"
                required
                autoComplete="name"
                placeholder="Your full name"
                icon={<UserRound className="h-5 w-5" />}
                value={signupForm.full_name}
                onChange={(value) => updateSignupField("full_name", value)}
              />
              <InputField
                label="Username (Optional)"
                name="username"
                autoComplete="username"
                placeholder="username"
                icon={<UserRound className="h-5 w-5" />}
                value={signupForm.username}
                onChange={(value) => updateSignupField("username", value)}
              />
            </div>

            <InputField
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              icon={<AtSign className="h-5 w-5" />}
              value={signupForm.email}
              onChange={(value) => updateSignupField("email", value)}
            />

            <InputField
              label="Phone Number"
              name="phone"
              required
              autoComplete="tel"
              placeholder="+213555555555"
              icon={<Phone className="h-5 w-5" />}
              value={signupForm.phone}
              onChange={(value) => updateSignupField("phone", value)}
            />
            <p className="-mt-3 mb-3 text-xs text-cyan-200/60">Between 6 and 30 chars. Including spaces/symbols.</p>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-cyan-100/90">Bio (Optional)</span>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-4 text-cyan-100/60">
                  <Sparkles className="h-5 w-5" />
                </div>
                <textarea
                  name="bio"
                  maxLength={400}
                  placeholder="Tell us a bit about yourself"
                  value={signupForm.bio}
                  onChange={(event) => updateSignupField("bio", event.target.value)}
                  className="min-h-[96px] w-full resize-y rounded-xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(18,31,58,0.88),rgba(9,17,38,0.88))] pl-10 pr-3 pt-3 text-cyan-50 placeholder:text-cyan-100/35 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                />
              </div>
            </label>

            <InputField
              label="Password"
              name="password"
              type={showSignupPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Enter your password"
              icon={<KeyRound className="h-5 w-5" />}
              value={signupForm.password}
              onChange={(value) => updateSignupField("password", value)}
              rightSlot={(
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((value) => !value)}
                  className="text-cyan-100/60 hover:text-cyan-100"
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            />

            <button
              type="submit"
              disabled={pending}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-cyan-300/45 bg-[linear-gradient(90deg,#29c7ee,#5ad7f1)] text-lg font-black uppercase tracking-[0.18em] text-[#04223e] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Creating..." : "Create Account"}
              <ArrowRight className="h-5 w-5" />
            </button>

            {state.message ? (
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  state.ok
                    ? "border-green-400/40 bg-green-400/10 text-green-300"
                    : "border-red-400/40 bg-red-400/10 text-red-300"
                }`}
              >
                {state.message}
              </p>
            ) : null}
            </form>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-cyan-100/55">
          <span className="h-px flex-1 bg-cyan-300/20" />
          <span className="text-sm">Why athletes choose Olympole</span>
          <span className="h-px flex-1 bg-cyan-300/20" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300/18 bg-[#09142d]/75 p-4">
            <ShieldCheck className="mb-2 h-6 w-6 text-cyan-300" />
            <p className="text-base font-semibold text-cyan-50">Secure Access</p>
            <p className="text-sm text-cyan-100/60">Your data, protected.</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/18 bg-[#09142d]/75 p-4">
            <Trophy className="mb-2 h-6 w-6 text-cyan-300" />
            <p className="text-base font-semibold text-cyan-50">Activity Tracking</p>
            <p className="text-sm text-cyan-100/60">Every match, recorded.</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/18 bg-[#09142d]/75 p-4">
            <Sparkles className="mb-2 h-6 w-6 text-cyan-300" />
            <p className="text-base font-semibold text-cyan-50">Live Updates</p>
            <p className="text-sm text-cyan-100/60">Real-time competition.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
