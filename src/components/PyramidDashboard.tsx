import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Package,
    Truck,
    Tag,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Activity,
    Zap,
    Cpu,
    Database
} from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

// --- Types ---
type Severity = 'nominal' | 'warning' | 'critical';

interface SystemState {
    orders: number | string;
    stock: number | string;
    riders: number | string;
    severity: Severity;
    severityScore: number;
    statusText: string;
    activeAgents: string[];
    logs: { msg: string; type: 'info' | 'warning' | 'critical' | 'success'; time: string }[];
    decisionReady: boolean;
    incidentResolved: boolean;
}

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("relative h-full rounded-[1.25rem] border-[0.75px] border-[#1E1E1E] p-2 md:rounded-[1.5rem] md:p-3", className)}>
        <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-[0.75px] border-[#1E1E1E] bg-[#0D0D0D] p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
            {children}
        </div>
    </div>
);

const IconPill = ({ icon: Icon, colorClass = "text-[#888888]" }: { icon: any, colorClass?: string }) => (
    <div className="w-10 h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg flex items-center justify-center mb-4">
        <Icon className={cn("w-[18px] h-[18px]", colorClass)} />
    </div>
);

const AgentNode = ({ label, icon: Icon, active, worker = false }: { label: string, icon?: any, active: boolean, worker?: boolean }) => (
    <motion.div
        initial={false}
        animate={{
            borderColor: active ? 'var(--color-primary)' : '#1E1E1E',
            backgroundColor: active ? 'rgba(255,204,0,0.1)' : '#0D0D0D',
            boxShadow: active ? '0 0 15px rgba(255,204,0,0.3)' : 'none'
        }}
        className={cn(
            "flex flex-col items-center justify-center rounded-lg border p-2 transition-all duration-500",
            worker ? "gap-1 p-1" : "gap-2"
        )}
    >
        {Icon && <Icon className={cn("w-4 h-4", active ? "text-yellow-400" : "text-[#444444]")} />}
        <span className={cn(
            "tracking-tighter uppercase",
            worker ? "text-[8px]" : "text-[10px]",
            active ? "text-white font-bold" : "text-[#444444] font-medium"
        )}>{label}</span>
    </motion.div>
);

export const PyramidDashboard = () => {
    const [state, setState] = useState<SystemState>({
        orders: 142,
        stock: "88.4%",
        riders: 42,
        severity: 'nominal',
        severityScore: 0,
        statusText: 'SYSTEM STANDBY / NOMINAL',
        activeAgents: [],
        logs: [{ msg: "System monitoring active...", type: 'info', time: new Date().toLocaleTimeString() }],
        decisionReady: false,
        incidentResolved: false
    });

    const addLog = useCallback((msg: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
        setState(prev => ({
            ...prev,
            logs: [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev.logs].slice(0, 50)
        }));
    }, []);

    const runSimulation = async () => {
        addLog("CRITICAL INCIDENT DETECTED: IPL NIGHT MUMBAI SURGE", 'critical');
        setState(prev => ({ ...prev, severity: 'critical', severityScore: 8.7, statusText: 'CALCULATING SEVERITY...' }));

        await new Promise(r => setTimeout(r, 1000));
        setState(prev => ({ ...prev, orders: '340+', stock: '12.4%', statusText: 'SEVERITY: 8.7/10 - CRITICAL' }));
        addLog("DATA SPIKE: DEMAND +340% DETECTED VIA KINESIS", 'critical');

        await new Promise(r => setTimeout(r, 1000));
        addLog("ORCHESTRATOR: ACTIVATING DOMAIN AGENTS", 'warning');
        setState(prev => ({ ...prev, activeAgents: ['demand', 'inventory', 'logistics', 'pricing', 'risk'] }));

        await new Promise(r => setTimeout(r, 1500));
        addLog("DOMAIN AGENTS: FIRING WORKER TASKS", 'info');
        setState(prev => ({ ...prev, activeAgents: [...prev.activeAgents, 'workers'] }));

        await new Promise(r => setTimeout(r, 1500));
        addLog("CONFLICT DETECTED: PRICING VS RISK (CHURN)", 'warning');
        setState(prev => ({ ...prev, activeAgents: [...prev.activeAgents, 'aggregators'] }));

        await new Promise(r => setTimeout(r, 1500));
        addLog("AGGREGATOR: RESOLVED. APPLYING +6% SURGE & REROUTE", 'success');
        setState(prev => ({ ...prev, decisionReady: true }));

        await new Promise(r => setTimeout(r, 2000));
        addLog("INCIDENT RESOLVED. UPDATING POLICY MEMORY", 'success');
        setState(prev => ({
            ...prev,
            incidentResolved: true,
            stock: '42.1%',
            riders: 88,
            statusText: 'POLICY UPDATED - STANDBY',
            severity: 'nominal',
            activeAgents: []
        }));
    };

    return (
        <div className="w-full min-h-screen text-white px-12 py-8 pt-32 selection:bg-yellow-500 selection:text-black font-sans scroll-smooth">

            {/* Top Status Bar */}
            <div className="fixed top-0 left-0 w-full h-14 bg-black border-b border-[#1E1E1E] z-[50] flex items-center justify-between px-12">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-display text-white tracking-widest pt-1">APEX-QC</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest text-[#10B981] uppercase pt-0.5">Live</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#444444] uppercase pt-0.5 ml-4">Mumbai Ops Zone 4</span>
                </div>
                <div className="flex items-center gap-6 mr-56">
                    <button className="text-[10px] font-bold tracking-widest text-red-500 border border-red-500/30 px-4 py-1.5 rounded hover:bg-red-500 hover:text-white transition-all uppercase">Override System</button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">

                {/* --- Left Column: Incident Feed --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card>
                        <IconPill icon={Database} />
                        <h3 className="text-xl font-semibold mb-2">Real-Time Streams</h3>
                        <div className="space-y-6 mt-4">
                            {[
                                { label: 'Orders/Min', value: state.orders, icon: TrendingUp },
                                { label: 'Stock Level', value: state.stock, icon: Package },
                                { label: 'Active Riders', value: state.riders, icon: Truck },
                                { label: 'Avg Margin', value: '4.2%', icon: Tag },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 border-b border-[#1E1E1E] pb-6 last:border-0 last:pb-0">
                                    <span className="text-[11px] uppercase font-medium text-[#888888] tracking-wider">{item.label}</span>
                                    <div className="flex justify-between items-end">
                                        <span className={cn("text-4xl font-display leading-none", state.severity === 'critical' && i < 2 ? "text-red-500" : "text-white")}>
                                            {item.value}
                                        </span>
                                        <item.icon className="w-4 h-4 text-[#444444] mb-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="h-44">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-widest">AI Core v4.2</h3>
                            <div className="text-[11px] text-[#10B981] font-bold">94% CONFIDENCE</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-4 bg-[#1A1A1A] p-5 rounded-lg border border-[#2A2A2A]">
                                <Cpu className="w-8 h-8 text-yellow-500" />
                                <div className="h-2 flex-1 bg-black rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: ['0%', '94%'] }}
                                        className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(255,204,0,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- Center Column: The Operations Pyramid --- */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Layer 2: Master Orchestrator */}
                    <Card className="flex-none h-auto">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[11px] uppercase font-bold text-[#888888] tracking-widest">Master Orchestrator (Claude 3.5)</span>
                            <div className={cn("px-4 py-2 rounded text-[10px] font-bold tracking-widest pt-2.5",
                                state.severity === 'nominal' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20")}>
                                {state.statusText}
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-16 py-8">
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 rounded-full border border-dashed border-yellow-500/30"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className={cn("w-10 h-10", state.severity === 'critical' ? "text-red-500" : "text-yellow-500")} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="secondary-note text-3xl italic font-semibold tracking-wide h-10 select-none">"Resolving conflicts at 40ms..."</p>
                                <p className="text-[10px] text-[#444444] font-medium tracking-widest uppercase mt-4">Active Multi-Agent Fusion</p>
                            </div>
                        </div>
                    </Card>

                    {/* Layer 3-5: The Infrastructure Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-5 gap-4">
                            <AgentNode label="Demand" icon={TrendingUp} active={state.activeAgents.includes('demand')} />
                            <AgentNode label="Inventory" icon={Package} active={state.activeAgents.includes('inventory')} />
                            <AgentNode label="Logistics" icon={Truck} active={state.activeAgents.includes('logistics')} />
                            <AgentNode label="Pricing" icon={Tag} active={state.activeAgents.includes('pricing')} />
                            <AgentNode label="Risk" icon={ShieldAlert} active={state.activeAgents.includes('risk')} />
                        </div>

                        <div className="grid grid-cols-5 gap-2 md:grid-cols-10 md:gap-3">
                            {['FORECAST', 'BURST', 'STOCK', 'TRANSFER', 'ROUTE', 'ETA', 'BONUS', 'SURGE', 'CHURN', 'METRIC'].map((l, i) => (
                                <AgentNode key={i} label={l} active={state.activeAgents.includes('workers')} worker />
                            ))}
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            <AgentNode label="Conflict" icon={Activity} active={state.activeAgents.includes('aggregators')} />
                            <AgentNode label="Check" icon={ShieldAlert} active={state.activeAgents.includes('aggregators')} />
                            <AgentNode label="Guard" icon={ShieldAlert} active={state.activeAgents.includes('aggregators')} />
                            <AgentNode label="Rank" icon={Activity} active={state.activeAgents.includes('aggregators')} />
                            <AgentNode label="Compress" icon={Activity} active={state.activeAgents.includes('aggregators')} />
                        </div>
                    </div>

                    {/* Layer 6: Fusion Decision */}
                    <div className="h-44 relative mt-2">
                        <AnimatePresence>
                            {state.decisionReady ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-yellow-500 h-full rounded-xl p-8 flex flex-col justify-center items-center gap-4 border border-yellow-400 shadow-[0_0_50px_rgba(255,204,0,0.3)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                                    <div className="flex items-center gap-6">
                                        <CheckCircle2 className="w-12 h-12 text-black" />
                                        <span className="text-6xl font-display text-black italic pt-4">Fusion Executed</span>
                                    </div>
                                    <div className="text-[12px] font-bold tracking-[0.5em] text-black/70 uppercase">Decision Latency: 9.2 Seconds</div>
                                </motion.div>
                            ) : !state.incidentResolved && (
                                <button
                                    onClick={runSimulation}
                                    className="w-full h-full bg-white text-black font-display text-3xl tracking-widest p-5 rounded-xl hover:bg-yellow-500 hover:text-black transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-6 group shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                                >
                                    <span className="pt-2">Trigger Incident: IPL Night Mumbai</span>
                                    <AlertTriangle className="w-8 h-8 group-hover:animate-bounce" />
                                </button>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* --- Right Column: Intelligence Logs --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl flex-1 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-[#1E1E1E] bg-black/40">
                            <h3 className="text-[11px] font-bold uppercase text-[#888888] tracking-widest">Intelligence Feed</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                            {state.logs.map((log, i) => (
                                <div key={i} className={cn(
                                    "text-[12px] font-mono border-l-2 pl-5 py-3 bg-white/[0.02] rounded-r-md transition-all animate-in fade-in slide-in-from-right-2",
                                    log.type === 'critical' ? "border-red-500 text-red-500" :
                                        log.type === 'warning' ? "border-amber-500 text-amber-500" :
                                            log.type === 'success' ? "border-emerald-500 text-emerald-500" :
                                                "border-yellow-500/50 text-[#888888]"
                                )}>
                                    <div className="opacity-30 text-[9px] mb-2 font-sans tracking-widest uppercase">{log.time}</div>
                                    <div className="leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{log.msg}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="flex-none h-36">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-[#888888] mb-6 uppercase tracking-widest">
                            <Clock className="w-4 h-4" />
                            Uptime: 324:12:05
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-display leading-none">99.99</span>
                            <span className="text-[11px] font-bold text-[#10B981] mb-1 tracking-widest">AVAILABILITY</span>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Footer KPI Strip */}
            <div className="fixed bottom-0 left-0 w-full bg-black border-t border-[#1E1E1E] py-6 px-16 flex justify-between items-center z-50">
                {[
                    { label: 'Avg Decision Time', value: '9.2s', trend: '-2.4s', color: 'text-[#10B981]' },
                    { label: 'Cancellation Rate', value: '1.24%', trend: '-0.3%', color: 'text-[#10B981]' },
                    { label: 'Margin Rescue', value: '$4.2k', trend: '+$1.1k', color: 'text-[#10B981]' },
                    { label: 'AI Multi-Agent Load', value: '74%', trend: 'NOMINAL', color: 'text-[#888888]' },
                ].map((kpi, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-4xl font-display tracking-wide">{kpi.value}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#444444]">{kpi.label}</span>
                            <span className={cn("text-[9px] font-black tracking-widest", kpi.color)}>{kpi.trend}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
