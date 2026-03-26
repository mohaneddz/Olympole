import { Button } from "@/components/ui/Button";

export default function AdminOverview() {
    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
                <p className="text-foreground/60">Real-time metrics and system alerts for Olympole 2026.</p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-xl bg-card-bg border border-card-border">
                    <p className="text-sm text-foreground/60 font-medium mb-1">Total Registrations</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold font-mono">142,093</h3>
                        <span className="text-green-400 text-sm font-bold">+12%</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-card-bg border border-card-border">
                    <p className="text-sm text-foreground/60 font-medium mb-1">Active Events</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold font-mono text-primary">24</h3>
                        <span className="text-foreground/40 text-sm">Live Now</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-card-bg border border-card-border">
                    <p className="text-sm text-foreground/60 font-medium mb-1">Prediction Pool Size</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold font-mono text-secondary">4.2M</h3>
                        <span className="text-green-400 text-sm font-bold">+5%</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-card-bg border border-card-border border-red-500/30">
                    <p className="text-sm text-foreground/60 font-medium mb-1">System Alerts</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold font-mono text-red-400">2</h3>
                        <span className="text-red-400 text-sm font-bold">Action Required</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Registrations Table */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-card-bg border border-card-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Recent Registrations</h3>
                        <Button variant="outline" size="sm">View All</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-card-border text-foreground/60">
                                    <th className="font-medium pb-3">User ID</th>
                                    <th className="font-medium pb-3">Name</th>
                                    <th className="font-medium pb-3">Category</th>
                                    <th className="font-medium pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {["USR-9921", "USR-9920", "USR-9919", "USR-9918"].map((id, i) => (
                                    <tr key={id} className="hover:bg-white/5">
                                        <td className="py-4 font-mono text-xs">{id}</td>
                                        <td className="py-4 font-medium">Digital Competitor {i + 1}</td>
                                        <td className="py-4 text-foreground/70">{['Athletics', 'Culture', 'Mind Sports', 'Athletics'][i]}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 text-[10px] uppercase font-bold rounded bg-green-500/10 text-green-400 border border-green-500/20">Verified</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity Log */}
                <div className="p-6 rounded-xl bg-card-bg border border-card-border">
                    <h3 className="text-xl font-bold mb-6">System Activity</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-medium">Server Node 4 latency spike</p>
                                <p className="text-xs text-foreground/50">2 mins ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-medium">Match #402 results finalized</p>
                                <p className="text-xs text-foreground/50">14 mins ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-secondary flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-medium">New artwork uploaded by 0xViolet</p>
                                <p className="text-xs text-foreground/50">1 hr ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
