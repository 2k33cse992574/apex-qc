import { motion } from 'framer-motion';
import { User, Shield, Activity, Zap, HardDrive, Key } from 'lucide-react';
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

export const ProfilePage = () => {
    return (
        <div className="w-full min-h-screen text-white px-12 py-8 pt-32 selection:bg-yellow-500 selection:text-black font-sans">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-12">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center relative overflow-hidden group">
                        <User className="w-12 h-12 text-primary" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-dashed border-primary/40 rounded-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-6xl font-display tracking-widest leading-none uppercase pt-4 italic">Operator_Alex</h2>
                        <div className="flex gap-4 mt-2">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Authorization Level 9</span>
                            <span className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">ID: APEX-992-QC</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Stats Column */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <Card className="h-64">
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex items-center gap-4">
                                    <Activity className="w-6 h-6 text-primary" />
                                    <h3 className="text-sm font-bold tracking-widest uppercase">Performance Index</h3>
                                </div>
                                <div className="flex items-baseline gap-4 mt-4">
                                    <span className="text-7xl font-display italic text-white uppercase italic">98.4<span className="text-2xl text-primary">%</span></span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase font-medium text-white/40">
                                        <span>Decision_Accuracy</span>
                                        <span>Sync_Rate</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[98%]" />
                                        </div>
                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[92%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="h-64">
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex items-center gap-4">
                                    <Zap className="w-6 h-6 text-primary" />
                                    <h3 className="text-sm font-bold tracking-widest uppercase">Neuromorphic Load</h3>
                                </div>
                                <div className="text-5xl font-display text-primary italic uppercase leading-none mt-4">42.2ms</div>
                                <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Real-time Latency</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                            <div key={i} className={cn("w-1 h-3 rounded-sm", i < 5 ? "bg-primary" : "bg-white/10")} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Credentials Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card className="flex-1">
                            <h3 className="text-2xl font-display tracking-widest uppercase mb-10 pb-4 border-b border-white/5 italic">Security Credentials</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Primary Identity</label>
                                        <div className="bg-white/5 px-6 py-4 rounded-xl border border-white/5 flex items-center gap-4">
                                            <User className="w-4 h-4 text-primary opacity-50" />
                                            <span className="text-sm font-mono tracking-wider">alex_sentinel_prime</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Encrypted Key</label>
                                        <div className="bg-white/5 px-6 py-4 rounded-xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all">
                                            <Key className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-sm font-mono tracking-wider">••••••••••••••••</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-between">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Shield className="text-primary w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Access Logs</span>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2 last:border-0 opacity-40">
                                                    <span>MUM_ZONE_{i * 40}</span>
                                                    <span>AUTHORIZED</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-3 bg-primary text-black font-bold text-[10px] tracking-[0.3em] rounded hover:bg-yellow-400 transition-all uppercase italic">Revoke Session</button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-2 gap-6">
                            <Card className="h-40">
                                <div className="flex items-center gap-4 h-full">
                                    <HardDrive className="w-10 h-10 text-primary opacity-30" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Memory Bank</span>
                                        <span className="text-3xl font-display uppercase italic">842 GB <span className="text-sm text-primary">/ 1 TB</span></span>
                                    </div>
                                </div>
                            </Card>
                            <Card className="h-40">
                                <div className="flex items-center gap-4 h-full">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                        <Shield className="w-10 h-10 text-primary opacity-30" />
                                    </motion.div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Armor integrity</span>
                                        <span className="text-3xl font-display uppercase italic">Max <span className="text-sm text-primary">Sync</span></span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
