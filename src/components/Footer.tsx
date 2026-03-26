import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-card-border mt-auto bg-background py-10">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            OLYMPOLE 2026
                        </span>
                        <p className="mt-4 text-sm text-foreground/60 max-w-xs">
                            The ultimate global event blending sports, cyber-culture, and next-generation competition.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Events</h4>
                        <ul className="space-y-2 text-sm text-foreground/60">
                            <li><Link href="/schedule" className="hover:text-primary transition-colors">Schedule</Link></li>
                            <li><Link href="/sports" className="hover:text-primary transition-colors">Sports Hub</Link></li>
                            <li><Link href="/match-center" className="hover:text-primary transition-colors">Match Center</Link></li>
                            <li><Link href="/results" className="hover:text-primary transition-colors">Results & Brackets</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Culture</h4>
                        <ul className="space-y-2 text-sm text-foreground/60">
                            <li><Link href="/culture/talent" className="hover:text-primary transition-colors">Talent Show</Link></li>
                            <li><Link href="/culture/writing" className="hover:text-primary transition-colors">Writing Contest</Link></li>
                            <li><Link href="/culture/art" className="hover:text-primary transition-colors">Art Exhibition</Link></li>
                            <li><Link href="/predictions" className="hover:text-primary transition-colors">Predictions Hub</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Portal</h4>
                        <ul className="space-y-2 text-sm text-foreground/60">
                            <li><Link href="/register" className="hover:text-primary transition-colors">Register Now</Link></li>
                            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                            <li><span className="hover:text-primary transition-colors cursor-pointer">Support</span></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t border-card-border pt-6 text-center text-sm text-foreground/40">
                    <p>© 2026 Olympole Event Committee. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
