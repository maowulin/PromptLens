import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function AudioLevel({ active, intensity = 5 }: { active: boolean; intensity?: number }) {
  const [levels, setLevels] = useState<number[]>(new Array(12).fill(10));

  useEffect(() => {
    if (!active) {
      setLevels(new Array(12).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setLevels((prev) =>
        prev.map(() => Math.max(10, Math.random() * 100 * (intensity / 10)))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [active, intensity]);

  return (
    <div className="flex items-end gap-[2px] h-8 opacity-80">
      {levels.map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-t-sm transition-all duration-150",
            active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-200"
          )}
          style={{ height: `${active ? h : 10}%` }}
        />
      ))}
    </div>
  );
}

export function RadarScan() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <div className="absolute w-full h-full border border-indigo-500/20 rounded-full animate-ping opacity-20" />
      <div className="absolute w-24 h-24 border border-indigo-500/30 rounded-full animate-ping delay-75 opacity-20" />
      <div className="absolute w-full h-full border border-slate-200 rounded-full" />
      <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_12px_#6366f1] z-10" />
      <div className="absolute w-full h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent top-1/2 left-0 origin-top animate-spin duration-3000" 
           style={{ transformOrigin: "center top" }}/>
    </div>
  );
}
