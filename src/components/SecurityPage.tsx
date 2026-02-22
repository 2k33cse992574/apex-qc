import { ShieldCheck, Lock, Radio, Activity, Terminal, AlertCircle } from 'lucide-react';
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

export const SecurityPage = () => {
    return (
        <div className="w-full min-h-screen text-white px-12 py-8 pt-32 selection:bg-yellow-500 selection:text-black font-sans">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Lock className="w-10 h-10 text-primary" />
                        <h2 className="text-5xl font-display tracking-widest pt-2 uppercase italic leading-none">Security_Telemetry</h2>
                    </div>
                    <div className="bg-primary/10 border border-primary/30 px-6 py-3 rounded-lg flex items-center gap-4">
                        <Activity className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Firewall: ACTIVE</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Security Main Panel */}
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="h-44">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Encryption Level</span>
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-4xl font-display italic text-white uppercase italic">Q-RSA 4096</div>
                                    <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Quantum Resistant Enabled</span>
                                </div>
                            </Card>
                            <Card className="h-44">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Threat Buffer</span>
                                        <Radio className="w-4 h-4 text-primary animate-ping" />
                                    </div>
                                    <div className="text-4xl font-display italic text-white uppercase italic">Zero Sync</div>
                                    <span className="text-[9px] font-bold text-primary tracking-widest uppercase">No breach attempts detected</span>
                                </div>
                            </Card>
                            <Card className="h-44">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Node Purity</span>
                                        <Activity className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-4xl font-display italic text-white uppercase italic">99.8%</div>
                                    <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Protocol Integrity Stable</span>
                                </div>
                            </Card>
                        </div>

                        <Card className="flex-1">
                            <div className="flex flex-col h-[400px]">
                                <div className="flex items-center gap-4 mb-8">
                                    <Terminal className="w-6 h-6 text-primary" />
                                    <h3 className="text-lg font-display tracking-widest uppercase italic pt-2">Encrypted Terminal Feed</h3>
                                </div>
                                <div className="flex-1 bg-black/40 rounded-xl p-8 font-mono text-sm space-y-3 overflow-y-auto">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(i => (
                                        <div key={i} className="flex gap-6 opacity-60 hover:opacity-100 transition-opacity">
                                            <span className="text-primary/70 min-w-[120px] tracking-tighter uppercase font-bold text-[10px]">[SEC_LOG_{i * 1420}]</span>
                                            <span className="text-white/80 lowercase tracking-tight">Handshaking quantum protocol layer {i}... verified.</span>
                                        </div>
                                    ))}
                                    <div className="flex gap-6 text-primary">
                                        <span className="min-w-[120px] tracking-tighter uppercase font-bold text-[10px]">[CRITICAL]</span>
                                        <span className="uppercase tracking-widest font-black animate-pulse">Waiting for operator sign-off...</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Threat Column */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card className="flex-1">
                            <h3 className="text-sm font-bold tracking-widest text-primary mb-8 uppercase">Potential Triggers</h3>
                            <div className="space-y-10">
                                {[
                                    { name: 'Brute_Force', risk: '2%', node: 'Mumbai_E' },
                                    { name: 'XSS_Injection', risk: '0.1%', node: 'Edge_14' },
                                    { name: 'DDoS_Pattern', risk: '4%', node: 'Auth_Main' },
                                    { name: 'Spoof_ID', risk: '1.2%', node: 'Operator_3' }
                                ].map((t, i) => (
                                    <div key={i} className="flex flex-col gap-3 group pointer-events-auto cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors italic">{t.name}</span>
                                            <AlertCircle className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-display text-white/40 tracking-tight italic uppercase group-hover:text-white transition-colors">{t.node}</span>
                                            <span className="text-[10px] font-black text-primary uppercase">{t.risk}</span>
                                        </div>
                                        <div className="w-full h-[1px] bg-white/5 group-hover:bg-primary/20 transition-colors" />
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
