import React, { useEffect, useRef, useState } from 'react';

interface ApexCinematicLoaderProps {
    onComplete: () => void;
}

export const ApexCinematicLoader: React.FC<ApexCinematicLoaderProps> = ({ onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number, cols: number, rows: number, grid: Float32Array;
        const resolution = 12;
        const cooling = 0.96;
        const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false };

        const resizeGrid = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            cols = Math.ceil(width / resolution);
            rows = Math.ceil(height / resolution);
            grid = new Float32Array(cols * rows).fill(0);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (mouse.x === -1000) {
                mouse.prevX = e.clientX;
                mouse.prevY = e.clientY;
            } else {
                mouse.prevX = mouse.x;
                mouse.prevY = mouse.y;
            }
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
        };

        window.addEventListener('resize', resizeGrid);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        resizeGrid();

        const getColor = (t: number) => {
            const r = Math.min(255, Math.max(0, t * 2.5 * 255));
            const g = Math.min(255, Math.max(0, (t * 2.5 - 1) * 255));
            const b = Math.min(255, Math.max(0, (t * 2.5 - 2) * 255 + 50));
            return `rgb(${r + 10},${g + 10},${b + 15})`;
        };

        const sequence = [
            { text: "Worker", delay: 1000, font: 'Bebas Neue' },
            { text: "Agent", delay: 1000, glitch: true, font: 'Bebas Neue' },
            { text: "APEX", delay: 1200, bold: true, heat: true, font: 'Bebas Neue' },
            { text: "अपेक्स", delay: 900, bold: true, font: 'Bpmf Zihi Kai Std' },
            { text: "ایپکس", delay: 900, bold: true, font: 'Bpmf Zihi Kai Std' },
            { text: "APEX", delay: 1000, bold: true, font: 'Bebas Neue' }
        ];

        let step = 0;

        const scrambleText = (str: string) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let result = '';
            for (let i = 0; i < str.length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            return result;
        };

        const typeEffect = (target: HTMLDivElement, text: string, cb: () => void, font: string) => {
            target.style.fontFamily = font;
            let i = 0;
            const interval = setInterval(() => {
                target.textContent = text.slice(0, i) + scrambleText(text.slice(i));
                i++;
                if (i > text.length) {
                    clearInterval(interval);
                    target.textContent = text;
                    if (cb) cb();
                }
            }, 40);
        };

        const convergeHeat = (cb: () => void) => {
            const duration = 1500;
            const start = performance.now();
            const stepFunc = (time: number) => {
                const t = (time - start) / duration;
                if (t >= 1) {
                    cb();
                    return;
                }
                ctx.fillStyle = "#050505";
                ctx.fillRect(0, 0, width, height);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const idx = c + r * cols;
                        let temp = grid[idx] * (1 - t);
                        if (temp > 0.03) {
                            const x = c * resolution;
                            const y = r * resolution;
                            const dx = width / 2 - x;
                            const dy = height / 2 - y;
                            ctx.fillStyle = getColor(temp);
                            const size = resolution * (0.7 + temp * 0.4);
                            const offset = (resolution - size) / 2;
                            ctx.fillRect(x + offset + dx * t, y + offset + dy * t, size, size);
                        }
                    }
                }
                requestAnimationFrame(stepFunc);
            };
            requestAnimationFrame(stepFunc);
        };

        const runSequence = () => {
            if (step >= sequence.length) {
                convergeHeat(() => {
                    setIsFadingOut(true);
                    setTimeout(onComplete, 1000);
                });
                return;
            }

            if (!textRef.current) return;
            const current = sequence[step];
            const textEl = textRef.current;

            textEl.className = 'text-box';
            if (current.bold) textEl.classList.add('bold');
            if (current.glitch) textEl.classList.add('glitch');

            typeEffect(textEl, current.text, () => {
                setTimeout(runSequence, current.delay);
            }, current.font);

            step++;
        };

        const updateGrid = () => {
            const currentStep = sequence[step - 1];
            if (mouse.active || currentStep?.heat) {
                const dx = mouse.x - mouse.prevX;
                const dy = mouse.y - mouse.prevY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const strokeSteps = Math.ceil(dist / (resolution / 2));

                for (let s = 0; s <= strokeSteps; s++) {
                    const t = strokeSteps > 0 ? s / strokeSteps : 0;
                    const x = mouse.prevX + dx * t;
                    const y = mouse.prevY + dy * t;
                    const col = Math.floor(x / resolution);
                    const row = Math.floor(y / resolution);
                    const radius = 1;

                    for (let i = -radius; i <= radius; i++) {
                        for (let j = -radius; j <= radius; j++) {
                            const c = col + i;
                            const r = row + j;
                            if (c >= 0 && c < cols && r >= 0 && r < rows) {
                                const idx = c + r * cols;
                                if (Math.sqrt(i * i + j * j) <= radius) {
                                    grid[idx] = Math.min(1, grid[idx] + 0.5);
                                }
                            }
                        }
                    }
                }
            }

            if (!mouse.active) {
                mouse.prevX = mouse.x;
                mouse.prevY = mouse.y;
            }

            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, width, height);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = c + r * cols;
                    let temp = grid[idx];
                    grid[idx] *= cooling;
                    if (temp > 0.03) {
                        const x = c * resolution;
                        const y = r * resolution;
                        ctx.fillStyle = getColor(temp);
                        const size = resolution * (0.7 + temp * 0.4);
                        const offset = (resolution - size) / 2;
                        ctx.fillRect(x + offset, y + offset, size, size);
                    }
                }
            }
            requestAnimationFrame(updateGrid);
        };

        runSequence();
        const animFrame = requestAnimationFrame(updateGrid);

        return () => {
            window.removeEventListener('resize', resizeGrid);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animFrame);
        };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] bg-[#050505] overflow-hidden ${isFadingOut ? 'opacity-0 transition-opacity duration-1000 pointer-events-none' : ''}`}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-12">
                <div ref={textRef} className="text-box text-white text-center font-display text-[clamp(48px,10vw,80px)] tracking-[6px] whitespace-pre" />
            </div>

            <style>{`
        .text-box.bold { font-weight: 700; font-size: clamp(64px,15vw,120px); }
        .text-box.glitch { position: relative; display: inline-block; }
        .text-box.glitch::before, .text-box.glitch::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0.7;
        }
        .text-box.glitch::before { animation: loader-glitch-1 2s infinite linear alternate-reverse; clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%); }
        .text-box.glitch::after { animation: loader-glitch-2 1.5s infinite linear alternate-reverse; clip-path: polygon(0 85%, 100% 85%, 100% 88%, 0 88%); }
        
        @keyframes loader-glitch-1 {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(3px, -1px); }
          60% { transform: translate(-2px, 1px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes loader-glitch-2 {
          0% { transform: translate(0, 0); }
          20% { transform: translate(3px, -1px); }
          40% { transform: translate(-2px, 2px); }
          60% { transform: translate(1px, -2px); }
          80% { transform: translate(-3px, 1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
        </div>
    );
};
