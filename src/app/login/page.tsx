import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-100px)] w-full items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_78%_30%,rgba(56,189,248,0.1),transparent_26%),radial-gradient(circle_at_75%_72%,rgba(217,70,239,0.08),transparent_28%)]" />
      <div className="relative w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
