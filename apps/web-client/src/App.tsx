import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  MicOff,
  Camera,
  Link,
  ScrollText,
  Circle,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { api, type AudioDevices } from "@/lib/api";
import { getDeviceInfo, formatTime } from "@/lib/utils";
import "./globals.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sampleRate, setSampleRate] = useState("44100");
  const [captureMode, setCaptureMode] = useState("fullscreen");
  const [pairToken, setPairToken] = useState("mobile_device_001");
  const [logs, setLogs] = useState<string[]>([
    "Welcome to PromptLens Multi-Device Client!",
  ]);
  const [serverUrl, setServerUrl] = useState("");
  const [deviceInfo] = useState(getDeviceInfo());
  const [audioDevices, setAudioDevices] = useState<AudioDevices | null>(null);
  const [selectedInputId, setSelectedInputId] = useState<string>("");
  const [selectedOutputId, setSelectedOutputId] = useState<string>("");
  // NEW: audio source selection and browser-side devices cache
 const [audioSource, setAudioSource] = useState<"desktop" | "browser">("browser");
  const [browserDevices, setBrowserDevices] = useState<AudioDevices | null>(null);
 // NEW: mic/speaker test states
 const [micTestRunning, setMicTestRunning] = useState(false);
 const [micLevel, setMicLevel] = useState(0);
 const micTestRef = useRef<{
   ctx: AudioContext;
   analyser: AnalyserNode;
   source: MediaStreamAudioSourceNode;
   stream: MediaStream;
   rafId: number;
 } | null>(null);

  useEffect(() => {
    checkConnection();
    setServerUrl(api.getServerUrl());

    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval = 0;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Load audio devices when connection status changes
  useEffect(() => {
    const load = async () => {
      if (!isConnected || audioSource !== "desktop") return;
      try {
        const devs = await api.getAudioDevices();
        setAudioDevices(devs);
        const defIn = devs.inputs.find((d) => d.is_default)?.id ?? devs.inputs[0]?.id ?? "";
        const defOut = devs.outputs.find((d) => d.is_default)?.id ?? devs.outputs[0]?.id ?? "";
        setSelectedInputId(defIn);
        setSelectedOutputId(defOut);
        addLog(`Audio devices loaded (inputs: ${devs.inputs.length}, outputs: ${devs.outputs.length})`);
      } catch (e) {
        addLog("Failed to load audio devices");
      }
    };
    load();
  }, [isConnected, audioSource]);

  // NEW: enumerate browser devices when source switched to browser
  useEffect(() => {
    const enumerateBrowserDevices = async () => {
      if (audioSource !== "browser") return;
      try {
        // Request mic permission to get device labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices
            .filter((d) => d.kind === "audioinput")
            .map((d, idx) => ({ id: d.deviceId || `in-${idx}`, name: d.label || `Mic ${idx + 1}`, is_default: false }));
          const outputs = devices
            .filter((d) => d.kind === "audiooutput")
            .map((d, idx) => ({ id: d.deviceId || `out-${idx}`, name: d.label || `Speaker ${idx + 1}`, is_default: false }));
          const mapped: AudioDevices = { inputs, outputs };
          setBrowserDevices(mapped);
          const defIn = inputs[0]?.id ?? "";
          const defOut = outputs[0]?.id ?? "";
          setSelectedInputId(defIn);
          setSelectedOutputId(defOut);
          addLog(`Browser devices loaded (inputs: ${inputs.length}, outputs: ${outputs.length})`);
        } finally {
          // stop tracks to release mic
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        addLog("Microphone permission denied or enumerateDevices not available");
      }
    };

    enumerateBrowserDevices();
  }, [audioSource]);

 // NEW: microphone connectivity test (Browser source)
 const startMicTest = async () => {
   if (micTestRunning) return;
   try {
     const constraints: MediaStreamConstraints = {
       audio: selectedInputId ? { deviceId: { exact: selectedInputId } as any } : true,
     };
     const stream = await navigator.mediaDevices.getUserMedia(constraints);
     const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
     await ctx.resume();
     const source = ctx.createMediaStreamSource(stream);
     const analyser = ctx.createAnalyser();
     analyser.fftSize = 2048;
     source.connect(analyser);
     const data = new Uint8Array(analyser.fftSize);
     const loop = () => {
       analyser.getByteTimeDomainData(data);
       // Compute RMS level (0..1)
       let sum = 0;
       for (let i = 0; i < data.length; i++) {
         const v = (data[i] - 128) / 128;
         sum += v * v;
       }
       const rms = Math.sqrt(sum / data.length);
       setMicLevel(rms);
       const rafId = requestAnimationFrame(loop);
       if (micTestRef.current) micTestRef.current.rafId = rafId;
     };
     const rafId = requestAnimationFrame(loop);
     micTestRef.current = { ctx, analyser, source, stream, rafId };
     setMicTestRunning(true);
     addLog("Microphone test started");
   } catch (e) {
     addLog(`Failed to start mic test: ${e}`);
   }
 };

 const stopMicTest = async () => {
   if (!micTestRef.current) return;
   const { ctx, stream, rafId } = micTestRef.current;
   cancelAnimationFrame(rafId);
   stream.getTracks().forEach((t) => t.stop());
   try {
     await ctx.close();
   } catch {}
   micTestRef.current = null;
   setMicTestRunning(false);
   setMicLevel(0);
   addLog("Microphone test stopped");
 };

 // NEW: speaker connectivity test (Browser source)
 const playSpeakerTest = async () => {
   try {
     const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
     await ctx.resume();
     const osc = ctx.createOscillator();
     osc.type = "sine";
     osc.frequency.value = 440; // A4
     const gain = ctx.createGain();
     gain.gain.value = 0.1; // low volume
     const dest = ctx.createMediaStreamDestination();
     osc.connect(gain).connect(dest);
     const audioEl = new Audio();
     // Route to selected output device if supported
     if ((audioEl as any).setSinkId && selectedOutputId) {
       try {
         await (audioEl as any).setSinkId(selectedOutputId);
       } catch (err) {
         addLog(`setSinkId failed: ${err}`);
       }
     }
     audioEl.srcObject = dest.stream as any;
     await audioEl.play();
     osc.start();
     addLog("Playing test tone to speaker");
     setTimeout(async () => {
       osc.stop();
       try { await ctx.close(); } catch {}
       try { audioEl.pause(); audioEl.srcObject = null; } catch {}
       addLog("Speaker test finished");
     }, 1000);
   } catch (e) {
     addLog(`Failed to play test tone: ${e}`);
   }
 };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs(["Logs cleared"]);
  };

  const checkConnection = async () => {
    try {
      const connected = await api.healthCheck();
      setIsConnected(connected);
      if (connected) {
        addLog("Connected to desktop service");
      } else {
        addLog("Connection lost to desktop service");
      }
    } catch (error) {
      setIsConnected(false);
      addLog("Failed to connect to desktop service");
    }
  };

  const handleStartRecording = async () => {
    try {
      await api.startRecording({
        sampleRate: parseInt(sampleRate),
        inputDeviceId: selectedInputId || undefined,
        outputDeviceId: selectedOutputId || undefined,
        source: audioSource,
      });
      setIsRecording(true);
      addLog(`Started recording at ${sampleRate} Hz (source=${audioSource}, in=${selectedInputId || 'default'}, out=${selectedOutputId || 'default'})`);
    } catch (error) {
      addLog(`Failed to start recording: ${error}`);
    }
  };

  const handleStopRecording = async () => {
    try {
      await api.stopRecording();
      setIsRecording(false);
      addLog(`Stopped recording after ${formatTime(recordingTime)}`);
    } catch (error) {
      addLog(`Failed to stop recording: ${error}`);
    }
  };

  const handleCapture = async () => {
    try {
      const result = await api.captureScreenshot(captureMode as any);
      addLog(`Screenshot captured: ${result.image_id}`);
    } catch (error) {
      addLog(`Screenshot failed: ${error}`);
    }
  };

  const handlePairDevice = async () => {
    try {
      const result = await api.pairDevice(pairToken);
      addLog(`Device paired successfully: ${result.session_id}`);
    } catch (error) {
      addLog(`Pairing failed: ${error}`);
    }
  };

  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">📱 PromptLens</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Wifi className="mr-2 h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <WifiOff className="mr-2 h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="record" className="text-xs">
              <Mic className="mr-1 h-4 w-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="capture" className="text-xs">
              <Camera className="mr-1 h-4 w-4" />
              Capture
            </TabsTrigger>
            <TabsTrigger value="pair" className="text-xs">
              <Link className="mr-1 h-4 w-4" />
              Pair
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              <ScrollText className="mr-1 h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Recording Tab */}
          <TabsContent value="record" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Audio Recording
                </CardTitle>
                <CardDescription>
                  Record audio through the desktop application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <Circle className="h-3 w-3 fill-red-500 text-red-500 recording-pulse" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="font-mono text-lg">
                      {isRecording ? formatTime(recordingTime) : "00:00"}
                    </span>
                  </div>
                </div>

                {/* NEW: audio source */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Audio Source</label>
                  <Select value={audioSource} onValueChange={(v) => setAudioSource(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop Service</SelectItem>
                      <SelectItem value="browser">Browser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sample rate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Rate</label>
                  <Select value={sampleRate} onValueChange={setSampleRate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16000">16 kHz</SelectItem>
                      <SelectItem value="22050">22.05 kHz</SelectItem>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Devices */}
                {(() => {
                  const activeDevices = audioSource === "desktop" ? audioDevices : browserDevices;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Input Device</label>
                        <Select
                          value={selectedInputId}
                          onValueChange={setSelectedInputId}
                          disabled={(audioSource === "desktop" && (!isConnected || !activeDevices || activeDevices.inputs.length === 0)) || (audioSource === "browser" && (!activeDevices || activeDevices.inputs.length === 0))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select input device" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeDevices?.inputs.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}{d.is_default ? " (Default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Output Device</label>
                        <Select
                          value={selectedOutputId}
                          onValueChange={setSelectedOutputId}
                          disabled={(audioSource === "desktop" && (!isConnected || !activeDevices || activeDevices.outputs.length === 0)) || (audioSource === "browser" && (!activeDevices || activeDevices.outputs.length === 0))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select output device" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeDevices?.outputs.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}{d.is_default ? " (Default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })()}
+
               {audioSource === "browser" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Mic test */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Microphone Test</label>
                     <div className="flex items-center gap-3">
                       <Button onClick={micTestRunning ? stopMicTest : startMicTest} size="sm">
                         {micTestRunning ? "Stop" : "Start"}
                       </Button>
                       <div className="flex-1 h-2 bg-muted rounded">
                         <div
                           className="h-2 bg-green-500 rounded"
                           style={{ width: `${Math.min(100, Math.round(micLevel * 200))}%` }}
                         />
                       </div>
                     </div>
                     <p className="text-xs text-muted-foreground">Speak into the mic. The bar should move.</p>
                   </div>
                   {/* Speaker test */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Speaker Test</label>
                     <div className="flex items-center gap-3">
                       <Button onClick={playSpeakerTest} size="sm">Play Test Tone</Button>
                     </div>
                     <p className="text-xs text-muted-foreground">A short beep (440Hz) will be played to the selected output device.</p>
                   </div>
                 </div>
               )}

                <div className="flex space-x-2">
                  <Button
                    onClick={handleStartRecording}
                    disabled={isRecording || !isConnected || audioSource !== "desktop"}
                    className="flex-1"
                    size="lg"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                  <Button
                    onClick={handleStopRecording}
                    disabled={!isRecording}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                </div>
                {audioSource === "browser" && (
                  <p className="text-xs text-muted-foreground">
                    Browser source currently supports device enumeration and connectivity tests locally. Start/Stop recording buttons control the Desktop Service and are disabled here.
                  </p>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Capture Tab */}
          <TabsContent value="capture" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Screenshot Capture
                </CardTitle>
                <CardDescription>
                  Capture screenshots from the desktop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capture Mode</label>
                  <Select value={captureMode} onValueChange={setCaptureMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullscreen">Full Screen</SelectItem>
                      <SelectItem value="window">Active Window</SelectItem>
                      <SelectItem value="region">Selected Region</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCapture}
                  disabled={!isConnected}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Screenshot
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pair Tab */}
          <TabsContent value="pair" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link className="mr-2 h-5 w-5" />
                    Device Pairing
                  </CardTitle>
                  <CardDescription>
                    Pair this device with the desktop application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pair Token</label>
                    <input
                      type="text"
                      value={pairToken}
                      onChange={(e) => setPairToken(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter pair token"
                    />
                  </div>

                  <Button
                    onClick={handlePairDevice}
                    disabled={!isConnected}
                    className="w-full"
                    size="lg"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Pair Device
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Server:
                    </span>
                    <span className="text-sm font-mono">{serverUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Device:
                    </span>
                    <span className="text-sm flex items-center">
                      {getDeviceIcon()}
                      <span className="ml-1">{deviceInfo.deviceType}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Screen:
                    </span>
                    <span className="text-sm font-mono">
                      {deviceInfo.screenSize}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ScrollText className="mr-2 h-5 w-5" />
                    Activity Logs
                  </span>
                  <Button onClick={clearLogs} variant="outline" size="sm">
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {logs.join("\n")}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
