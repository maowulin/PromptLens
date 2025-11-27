import { useState } from "react";
import { 
  Activity, 
  Settings, 
  Cast, 
  Mic, 
  Monitor, 
  Wifi, 
  Power,
  ChevronRight,
  Smartphone,
  RefreshCw,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { AudioLevel, RadarScan } from "@/components/Visualizers";
import { cn } from "@/lib/utils";

// --- Types & Mock Data ---
type View = "dashboard" | "devices" | "settings";

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "web";
  ip: string;
  status: "connected" | "idle";
}

// --- Components ---

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "bg-white border border-slate-200 shadow-sm rounded-2xl p-5 transition-all hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
        active ? "bg-indigo-600" : "bg-slate-200"
      )}
    >
      <div
        className={cn(
          "bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300",
          active ? "translate-x-6" : "translate-x-0"
        )}
      />
    </button>
  );
}

// --- Views ---

function DashboardView() {
  const [micActive, setMicActive] = useState(true);
  const [sysActive, setSysActive] = useState(true);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Service Status */}
      <Card className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-sm opacity-20 animate-pulse" />
            <div className="relative w-3 h-3 bg-emerald-500 rounded-full shadow-sm" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">PromptLens Core</h3>
            <p className="text-xs text-slate-500 font-mono">Running on port 48080</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span>HEALTHY</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Microphone */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Microphone</h3>
                <p className="text-xs text-slate-500">Input Capture</p>
              </div>
            </div>
            <Toggle active={micActive} onClick={() => setMicActive(!micActive)} />
          </div>
          
          <div className="h-16 bg-slate-50 rounded-xl flex items-center justify-center px-4 border border-slate-100 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:14px_14px]" />
            
            <AudioLevel active={micActive} intensity={8} />
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
             <span>MacBook Pro Microphone</span>
             <RefreshCw size={14} className="cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </Card>

        {/* System Audio */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Monitor size={20} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">System Audio</h3>
                <p className="text-xs text-slate-500">Output Capture</p>
              </div>
            </div>
            <Toggle active={sysActive} onClick={() => setSysActive(!sysActive)} />
          </div>

          <div className="h-16 bg-slate-50 rounded-xl flex items-center justify-center px-4 border border-slate-100 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:14px_14px]" />
             <AudioLevel active={sysActive} intensity={3} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
             <span>Loopback Device</span>
             <RefreshCw size={14} className="cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function DevicesView() {
  const [connected] = useState<Device[]>([
    // { id: "1", name: "Chrome on MacBook", type: "web", ip: "192.168.1.5", status: "connected" }
  ]);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        {connected.length === 0 ? (
          <div className="flex flex-col items-center gap-6 z-10">
             <RadarScan />
             <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Waiting for connection...</h3>
                <p className="text-slate-500 text-sm max-w-[250px]">
                  Scan the QR code or open the Web Client to connect.
                </p>
             </div>
             
             <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-32 h-32 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">
                  QR Code Placeholder
                </div>
             </div>
             
             <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-100 px-4 py-2 rounded-full font-mono border border-slate-200">
                <Wifi size={14} />
                <span>192.168.1.4:48080</span>
             </div>
          </div>
        ) : (
          <div className="w-full h-full space-y-2">
            <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Connected Devices</h3>
            {connected.map(device => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                       {device.type === 'web' ? <Monitor size={20} /> : <Smartphone size={20} />}
                    </div>
                    <div>
                       <h4 className="font-medium text-slate-900">{device.name}</h4>
                       <p className="text-xs text-slate-500 font-mono">{device.ip}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                       <MoreVertical size={16} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="space-y-4">
        <div className="flex items-center justify-between p-1">
           <div>
             <h3 className="text-slate-900 font-medium">Start on Login</h3>
             <p className="text-xs text-slate-500">Launch application automatically</p>
           </div>
           <Toggle active={false} onClick={() => {}} />
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex items-center justify-between p-1">
           <div>
             <h3 className="text-slate-900 font-medium">Minimize to Tray</h3>
             <p className="text-xs text-slate-500">Keep running in background</p>
           </div>
           <Toggle active={true} onClick={() => {}} />
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">About</h3>
        <div className="flex items-center justify-between text-sm text-slate-600">
           <span>Version</span>
           <span className="font-mono text-slate-500">v0.1.0</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
           <span>Core Engine</span>
           <span className="font-mono text-slate-500">Rust 1.75</span>
        </div>
      </Card>
    </div>
  );
}

// --- Main Layout ---

function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");

  const tabs = [
    { id: "dashboard", icon: Activity, label: "Monitor" },
    { id: "devices", icon: Cast, label: "Connect" },
    { id: "settings", icon: Settings, label: "Config" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
             <div className="w-3 h-3 bg-white/30 rounded-full" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            PromptLens
          </span>
        </div>
        
        {/* Tab Switcher */}
        <nav className="bg-slate-100 p-1 rounded-full border border-slate-200 flex gap-1">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300",
                  isActive 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="w-8 flex justify-end">
           <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Power size={18} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
         {activeView === "dashboard" && <DashboardView />}
         {activeView === "devices" && <DevicesView />}
         {activeView === "settings" && <SettingsView />}
      </main>
    </div>
  );
}

export default App;
