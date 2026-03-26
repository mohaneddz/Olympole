import { RegisterForm } from "@/components/forms/RegisterForm";
import { getAppSettings, getPublicEvents } from "@/lib/queries";

export default async function RegisterPage() {
  const [settings, events] = await Promise.all([getAppSettings(), getPublicEvents()]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl flex-1 flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Registration Portal
        </h1>
        <p className="text-lg text-foreground/70">
          Secure your place in the cyber-stadium. Submissions are persisted and reviewed by organizers.
        </p>
      </div>

      {!settings.registration_enabled ? (
        <div className="p-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-200">
          Registration is currently closed by administrators.
        </div>
      ) : (
        <RegisterForm events={events.map((event) => ({ id: event.id, title: event.title }))} />
      )}
    </div>
  );
}
