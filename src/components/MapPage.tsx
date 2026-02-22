import { motion } from 'framer-motion';
import { Map as MapIcon, ShieldAlert, Target, Crosshair } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("relative h-full rounded-[1.25rem] border-[0.75px] border-[#1E1E1E] p-2 md:rounded-[1.5rem] md:p-3", className)}>
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-[0.75px] border-[#1E1E1E] bg-[#0D0D0D] p-6 shadow-sm">
            {children}
        </div>
    </div>
);

export const MapPage = () => {
    return (
        <div className="w-full min-h-screen text-white px-12 py-8 pt-32 selection:bg-yellow-500 selection:text-black font-sans overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <MapIcon className="w-8 h-8 text-primary" />
                        <h2 className="text-4xl font-display tracking-widest pt-2">GEOSPATIAL INTELLIGENCE</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Active Zone</span>
                            <span className="text-2xl font-display">MUMBAI_SECTOR_7</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Tactical Map View */}
                    <div className="lg:col-span-3">
                        <Card className="h-[700px]">
                            <div className="absolute inset-0 bg-[#050505] overflow-hidden">
                                {/* Grid Background */}
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)',
                                    backgroundSize: '30px 30px'
                                }} />

                                {/* Geometric Map Outlines Placeholder */}
                                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 700">
                                    <path d="M100 200 L300 150 L500 250 L800 200 L900 400 L700 600 L400 550 L100 500 Z" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                                    <path d="M200 300 L400 280 L600 350 L750 300 L850 500 L650 650 L350 600 L200 500 Z" fill="none" stroke="var(--color-primary)" strokeWidth="1" />
                                </svg>

                                {/* Heat Map Nodes */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute top-[30%] left-[45%] w-32 h-32 bg-primary/20 rounded-full blur-3xl"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute top-[60%] left-[20%] w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"
                                />

                                {/* Markers */}
                                <div className="absolute top-[35%] left-[48%] flex flex-col items-center">
                                    <Target className="text-primary w-6 h-6" />
                                    <div className="bg-black/80 backdrop-blur-md px-3 py-1 border border-primary/50 rounded mt-2">
                                        <span className="text-[10px] font-bold tracking-tighter uppercase">Incident_Alpha</span>
                                    </div>
                                </div>

                                <div className="absolute top-[65%] left-[22%] flex flex-col items-center">
                                    <ShieldAlert className="text-orange-500 w-6 h-6 animate-pulse" />
                                    <div className="bg-black/80 backdrop-blur-md px-3 py-1 border border-orange-500/50 rounded mt-2">
                                        <span className="text-[10px] font-bold tracking-tighter uppercase">High_Load_Zone</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tactical Radar Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[1000px] h-[1000px] border border-white/5 rounded-full -top-[150px] -left-[100px]"
                                />
                                <div className="absolute bottom-12 right-12 flex flex-col gap-4">
                                    <div className="bg-black/60 p-4 border border-white/10 rounded-lg">
                                        <div className="text-[9px] text-primary font-bold uppercase tracking-widest mb-2">Live Telemetry</div>
                                        <div className="flex gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white/40">LAT: 19.0760° N</span>
                                                <span className="text-[10px] text-white/40">LNG: 72.8777° E</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xl font-display text-primary uppercase">99.8% Sync</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <Card className="h-44">
                            <div className="flex flex-col justify-between h-full">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Regional Severity</span>
                                <div className="flex items-end justify-between">
                                    <span className="text-5xl font-display text-primary leading-none">0.8</span>
                                    <ShieldAlert className="w-6 h-6 text-primary/40" />
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[8%]" />
                                </div>
                            </div>
                        </Card>

                        <Card className="flex-1">
                            <h3 className="text-sm font-bold tracking-widest text-primary mb-6 uppercase">Target Points</h3>
                            <div className="space-y-6 overflow-y-auto max-h-[400px]">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex flex-col gap-2 border-b border-white/5 pb-4 last:border-0 pointer-events-auto cursor-pointer group">
                                        <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest">
                                            <span>Vector_{i * 124}</span>
                                            <span>9.2s</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xl font-display group-hover:text-primary transition-colors italic uppercase">Point_Sync_{i}</span>
                                            <Crosshair className="w-4 h-4 text-white/20 group-hover:text-primary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
