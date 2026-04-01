import Link from "next/link";
import { WritingSubmissionForm } from "@/components/forms/WritingSubmissionForm";
import { VoteSubmissionButton } from "@/components/forms/VoteSubmissionButton";
import { getCurrentUser } from "@/lib/auth";
import { getAppSettings, getPublishedWritingSubmissions, getWritingVoteCounts } from "@/lib/queries";

export default async function WritingContestPage() {
  const [settings, user, entries, voteCounts] = await Promise.all([
    getAppSettings(),
    getCurrentUser(),
    getPublishedWritingSubmissions(),
    getWritingVoteCounts(),
  ]);

  return (
    <div className="container mx-auto flex min-h-screen max-w-7xl flex-1 flex-col gap-12 px-4 py-16">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-indigo-400">Writing Contest</h1>
        <p className="text-xl text-foreground/70 mb-8">&quot;Words are the original code.&quot; Submit, publish, and vote in one workflow.</p>
      </div>

      {settings.writing_enabled ? (
        user ? (
          <WritingSubmissionForm />
        ) : (
          <div className="p-6 rounded-xl border border-card-border bg-card-bg text-foreground/80">
            Login is required for submissions and votes. <Link href="/login" className="text-primary">Go to login</Link>.
          </div>
        )
      ) : (
        <div className="p-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-100">Writing submissions are currently disabled.</div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Published Entries</h2>
        {entries.length === 0 ? (
          <div className="glass-card rounded-xl p-6 border border-card-border">No published entries yet.</div>
        ) : (
          entries.map((entry) => {
            const author = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
            const votes = voteCounts.get(entry.id) ?? 0;
            return (
              <div key={entry.id} className="glass-card rounded-xl p-6 border border-card-border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-2xl font-bold">{entry.title}</h3>
                  {entry.is_featured ? <span className="text-xs border border-primary/40 text-primary px-2 py-1 rounded">Featured</span> : null}
                </div>
                <p className="text-sm text-foreground/60 mb-4">By {author?.full_name || author?.email || "Unknown"} - {entry.category}</p>
                <p className="text-foreground/80 whitespace-pre-wrap">{entry.content}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-indigo-300">{votes} votes</span>
                  {user ? (
                    <VoteSubmissionButton submissionId={entry.id} />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
