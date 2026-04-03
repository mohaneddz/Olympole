"use client";

import { useActionState, useMemo, useState } from "react";
import { AtSign, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

type AuthMode = "login" | "signup";

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
  icon,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-cyan-100/80">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/55">
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
          className="h-12 w-full rounded-xl border border-cyan-300/20 bg-[#111a2f] pl-10 pr-3 text-white placeholder:text-cyan-100/35 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25"
        />
      </div>
    </label>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const checks = useMemo(
    () => ({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
    }),
    [value]
  );
  const score = Object.values(checks).filter(Boolean).length;
  const scoreLabel = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";

  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#0f172a]/80 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-cyan-100/70">Password strength</span>
        <span className="font-semibold text-cyan-100">{scoreLabel}</span>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 rounded-full ${score >= level ? "bg-cyan-300" : "bg-cyan-100/15"}`}
          />
        ))}
      </div>
      <ul className="space-y-1 text-xs text-cyan-100/65">
        <li>{checks.length ? "✓" : "○"} At least 8 characters</li>
        <li>{checks.upper ? "✓" : "○"} One uppercase letter</li>
        <li>{checks.lower ? "✓" : "○"} One lowercase letter</li>
        <li>{checks.number ? "✓" : "○"} One number</li>
      </ul>
    </div>
  );
}

export function LoginForm() {
  const [signInState, signInFormAction, signingIn] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction, signingUp] = useActionState(signUpAction, initialState);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");

  const isLogin = mode === "login";
  const state = isLogin ? signInState : signUpState;
  const pending = isLogin ? signingIn : signingUp;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5 inline-flex rounded-full border border-cyan-300/25 bg-[#0c1630]/80 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            isLogin ? "bg-cyan-300 text-[#031528]" : "text-cyan-100/70 hover:text-cyan-100"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            !isLogin ? "bg-cyan-300 text-[#031528]" : "text-cyan-100/70 hover:text-cyan-100"
          }`}
        >
          Create Account
        </button>
      </div>

      {isLogin ? (
        <form
          action={signInFormAction}
          key="login"
          className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(11,18,40,0.95),rgba(6,12,30,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]"
        >
          <Field
            label="Email Address"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={<AtSign className="h-4 w-4" />}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-cyan-100/80">Password</span>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/55">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                name="password"
                type={showLoginPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-cyan-300/20 bg-[#111a2f] pl-10 pr-11 text-white placeholder:text-cyan-100/35 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-100/55 hover:text-cyan-100"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <Button
            type="submit"
            variant="neonPill"
            size="pill"
            className="mt-2 w-full text-base font-black tracking-[0.18em] uppercase"
            disabled={pending}
          >
            {pending ? "Authenticating..." : "Sign In"}
          </Button>

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
        <form
          action={signUpFormAction}
          key="signup"
          className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(11,18,40,0.95),rgba(6,12,30,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Full Name"
              name="full_name"
              required
              autoComplete="name"
              placeholder="Your full name"
              icon={<UserRound className="h-4 w-4" />}
            />
            <Field
              label="Username (Optional)"
              name="username"
              autoComplete="username"
              placeholder="username"
              icon={<UserRound className="h-4 w-4" />}
            />
          </div>

          <Field
            label="Email Address"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={<AtSign className="h-4 w-4" />}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-cyan-100/80">Password</span>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/55">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                name="password"
                type={showSignupPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="8+ chars, upper/lower/number"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-cyan-300/20 bg-[#111a2f] pl-10 pr-11 text-white placeholder:text-cyan-100/35 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-100/55 hover:text-cyan-100"
                aria-label={showSignupPassword ? "Hide password" : "Show password"}
              >
                {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <PasswordStrength value={signupPassword} />

          <Button
            type="submit"
            variant="neonPill"
            size="pill"
            className="mt-2 w-full text-base font-black tracking-[0.18em] uppercase"
            disabled={pending}
          >
            {pending ? "Creating..." : "Create Account"}
          </Button>

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
  );
}
