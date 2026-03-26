import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] w-full px-4 py-8">
      <div className="w-full max-w-4xl glass-card rounded-2xl border border-card-border p-8 md:p-10 shadow-2xl backdrop-blur-md bg-background/40">
        <h1 className="text-3xl md:text-5xl font-black mb-3 font-tomo uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Olympole Access</h1>
        <p className="text-foreground/70 mb-8 text-base md:text-lg">Sign in or create an account to enter the cyber-stadium.</p>
        <LoginForm />
      </div>
    </div>
  );
}
