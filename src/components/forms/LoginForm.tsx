"use client";

import { useActionState, useEffect, useState } from "react";
import {
  ArrowRight,
  AtSign,
  ChevronDown,
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
import {
  clearClientAuthDraftCookie,
  readClientAuthDraftCookie,
  writeClientAuthDraftCookie,
} from "@/lib/cookie-drafts";

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

function getInitialAuthDraft() {
  return readClientAuthDraftCookie();
}

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
  const initialDraft = getInitialAuthDraft();
  const [signInState, signInFormAction, signingIn] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction, signingUp] = useActionState(signUpAction, initialState);
  const [mode, setMode] = useState<AuthMode>(initialDraft?.mode === "login" ? "login" : "signup");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: initialDraft?.login_email ?? "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    full_name: initialDraft?.signup_full_name ?? "",
    email: initialDraft?.signup_email ?? "",
    phone: initialDraft?.signup_phone ?? "",
    gender: initialDraft?.signup_gender ?? "male",
    school: initialDraft?.signup_school ?? "",
    year_of_study: initialDraft?.signup_year_of_study ?? "",
    password: "",
  });

  const isLogin = mode === "login";
  const state = isLogin ? signInState : signUpState;
  const pending = isLogin ? signingIn : signingUp;
  const tabPanelClassName = "pr-1";

  const updateLoginField = (name: keyof typeof loginForm, value: string) => {
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const updateSignupField = (name: keyof typeof signupForm, value: string) => {
    setSignupForm((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    writeClientAuthDraftCookie({
      mode,
      login_email: loginForm.email,
      signup_full_name: signupForm.full_name,
      signup_email: signupForm.email,
      signup_phone: signupForm.phone,
      signup_gender: signupForm.gender,
      signup_school: signupForm.school,
      signup_year_of_study: signupForm.year_of_study,
    });
  }, [
    mode,
    loginForm.email,
    signupForm.full_name,
    signupForm.email,
    signupForm.phone,
    signupForm.gender,
    signupForm.school,
    signupForm.year_of_study,
  ]);

  useEffect(() => {
    if (!signInState.ok && !signUpState.ok) {
      return;
    }

    clearClientAuthDraftCookie();
  }, [signInState.ok, signUpState.ok]);

  return (
    <section className="rounded-[32px] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(5,13,35,0.9),rgba(3,9,26,0.88))] px-5 py-6 shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(34,211,238,0.14)] backdrop-blur-sm md:px-8 md:py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <p className="mx-auto mb-4 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-bold tracking-[0.24em] text-cyan-100">
            AUTH PORTAL
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wide text-white md:text-5xl lg:text-6xl">Olympole Account</h1>
          <p className="mt-3 text-[16px] text-cyan-100/70 md:text-2xl">
            Sign in once and participate everywhere (takes one minute)
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
            <form action={signUpFormAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>

              <div>
                <InputField
                  label="Phone Number"
                  name="phone"
                  required
                  autoComplete="tel"
                  placeholder="0551234567"
                  icon={<Phone className="h-5 w-5" />}
                  value={signupForm.phone}
                  onChange={(value) => updateSignupField("phone", value)}
                />
                <p className="mt-1.5 text-xs text-cyan-200/60">Use exactly 10 digits starting with 0.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-cyan-100/90">School</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-100/60">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <select
                      name="school"
                      required
                      value={signupForm.school}
                      onChange={(event) => updateSignupField("school", event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(18,31,58,0.88),rgba(9,17,38,0.88))] pl-10 pr-11 text-cyan-50 outline-none transition [background-image:none] focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                      style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", backgroundImage: "none" }}
                    >
                      <option value="" className="bg-[#0b1735]">Select school</option>
                      <option value="ENSIA" className="bg-[#0b1735]">ENSIA</option>
                      <option value="NHSM" className="bg-[#0b1735]">NHSM</option>
                      <option value="NSNN" className="bg-[#0b1735]">NSNN</option>
                      <option value="ENSSA" className="bg-[#0b1735]">ENSSA</option>
                      <option value="ENSCS" className="bg-[#0b1735]">ENSCS</option>
                      <option value="ESI" className="bg-[#0b1735]">ESI</option>
                      <option value="Others" className="bg-[#0b1735]">Others</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-cyan-100/90">Year</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-100/60">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <select
                      name="year_of_study"
                      required
                      value={signupForm.year_of_study}
                      onChange={(event) => updateSignupField("year_of_study", event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(18,31,58,0.88),rgba(9,17,38,0.88))] pl-10 pr-11 text-cyan-50 outline-none transition [background-image:none] focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                      style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", backgroundImage: "none" }}
                    >
                      <option value="" className="bg-[#0b1735]">Select year</option>
                      <option value="1" className="bg-[#0b1735]">1</option>
                      <option value="2" className="bg-[#0b1735]">2</option>
                      <option value="3" className="bg-[#0b1735]">3</option>
                      <option value="4" className="bg-[#0b1735]">4</option>
                      <option value="5" className="bg-[#0b1735]">5</option>
                      <option value="other" className="bg-[#0b1735]">other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
                  </div>
                </label>
                <fieldset className="space-y-1.5 md:col-span-2">
                  <legend className="text-sm font-semibold text-cyan-100/90">Gender</legend>
                  <div className="flex w-full items-center justify-around gap-6 py-1">
                    <label className="inline-flex items-center gap-2 text-xl text-cyan-50">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={signupForm.gender === "male"}
                        onChange={(event) => updateSignupField("gender", event.target.value)}
                        className="h-4 w-4 accent-cyan-300"
                        required
                      />
                      Male
                    </label>
                    <label className="inline-flex items-center gap-2 text-xl text-cyan-50">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={signupForm.gender === "female"}
                        onChange={(event) => updateSignupField("gender", event.target.value)}
                        className="h-4 w-4 accent-cyan-300"
                        required
                      />
                      Female
                    </label>
                  </div>
                </fieldset>
              </div>

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

        <div className="mt-2 hidden items-center gap-3 text-cyan-100/55 sm:flex">
          <span className="h-px flex-1 bg-cyan-300/20" />
          <span className="text-sm">Why make an account</span>
          <span className="h-px flex-1 bg-cyan-300/20" />
        </div>

        <div className="hidden gap-3 sm:grid sm:grid-cols-3">
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