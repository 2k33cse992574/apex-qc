import React, { useEffect, useRef } from 'react';

interface LoginPageProps {
    onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number, cols: number, rows: number, grid: Float32Array;
        const resolution = 16;
        const cooling = 0.97;
        const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false };

        const resizeGrid = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            cols = Math.ceil(width / resolution);
            rows = Math.ceil(height / resolution);
            grid = new Float32Array(cols * rows).fill(0);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (mouse.x === -1000) { mouse.prevX = e.clientX; mouse.prevY = e.clientY; }
            else { mouse.prevX = mouse.x; mouse.prevY = mouse.y; }
            mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
        };

        window.addEventListener('resize', resizeGrid);
        window.addEventListener('mousemove', handleMouseMove);
        resizeGrid();

        const getColor = (t: number) => {
            const r = Math.min(255, Math.max(0, t * 2.5 * 255));
            const g = Math.min(255, Math.max(0, (t * 2.5 - 1) * 255));
            const b = Math.min(255, Math.max(0, (t * 2.5 - 2) * 255 + 40));
            return `rgb(${r + 5},${g + 5},${b + 10})`;
        };

        const updateGrid = () => {
            if (mouse.active) {
                const dx = mouse.x - mouse.prevX;
                const dy = mouse.y - mouse.prevY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.ceil(dist / (resolution / 4));
                for (let s = 0; s <= steps; s++) {
                    const t = steps > 0 ? s / steps : 0;
                    const x = mouse.prevX + dx * t;
                    const y = mouse.prevY + dy * t;
                    const col = Math.floor(x / resolution);
                    const row = Math.floor(y / resolution);
                    const radius = 1;
                    for (let i = -radius; i <= radius; i++) {
                        for (let j = -radius; j <= radius; j++) {
                            const c = col + i; const r = row + j;
                            if (c >= 0 && c < cols && r >= 0 && r < rows) {
                                const idx = c + r * cols;
                                if (Math.sqrt(i * i + j * j) <= radius) {
                                    grid[idx] = Math.min(1, grid[idx] + 0.3);
                                }
                            }
                        }
                    }
                }
            }
            if (!mouse.active) { mouse.prevX = mouse.x; mouse.prevY = mouse.y; }

            ctx.fillStyle = "#020202";
            ctx.fillRect(0, 0, width, height);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = c + r * cols;
                    let temp = grid[idx];
                    grid[idx] *= cooling;
                    if (temp > 0.02) {
                        const x = c * resolution;
                        const y = r * resolution;
                        ctx.fillStyle = getColor(temp);
                        const size = resolution * (0.6 + temp * 0.4);
                        ctx.fillRect(x + (resolution - size) / 2, y + (resolution - size) / 2, size, size);
                    }
                }
            }
            requestAnimationFrame(updateGrid);
        };

        const animFrame = requestAnimationFrame(updateGrid);
        return () => {
            window.removeEventListener('resize', resizeGrid);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-[#020202]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />

            {/* Tactical Overlays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[30vw] h-[1px] bg-primary" />
                <div className="absolute top-0 left-0 w-[1px] h-[30vh] bg-primary" />
            </div>

            <div className="login-box relative w-full max-w-[440px] px-8 py-12 m-4 rounded-[2rem] bg-black/40 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-12 h-1 bg-primary mb-6" />
                        <h2 className="text-[54px] font-display text-white tracking-[0.2em] leading-none mb-2">APEX</h2>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-primary/60 uppercase">System Gateway v4.0</span>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="OPERATOR_ID"
                                className="w-full px-6 py-5 rounded-xl border border-white/5 bg-white/5 text-white outline-none text-lg placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all font-mono"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="SECURITY_KEY"
                                className="w-full px-6 py-5 rounded-xl border border-white/5 bg-white/5 text-white outline-none text-lg placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all font-mono"
                            />
                        </div>

                        <button
                            onClick={onLogin}
                            className="w-full mt-4 py-5 rounded-xl border-none bg-primary text-black font-bold text-xl cursor-pointer transition-all hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(255,204,0,0.3)] flex items-center justify-center gap-3 group"
                            style={{ color: 'black' }}
                        >
                            <span>INITIALIZE SESSION</span>
                            <div className="w-4 h-[2px] bg-black/60 group-hover:w-8 transition-all" />
                        </button>

                        <div className="flex justify-between items-center px-2 mt-6">
                            <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Biometric lock active</span>
                            <span className="text-[9px] text-primary font-bold tracking-widest cursor-pointer hover:underline">Forgot access key?</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .login-box {
                    animation: login-premium-entrance 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes login-premium-entrance {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
