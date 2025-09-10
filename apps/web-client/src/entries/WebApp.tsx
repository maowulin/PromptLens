import { useEffect, useRef, useState } from "react";
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
import { Mic } from "lucide-react";
import type { AudioDevices } from "@/lib/api";

export default function WebApp() {
  const [logs, setLogs] = useState<string[]>(["Web mode ready"]);
  const [browserDevices, setBrowserDevices] = useState<AudioDevices | null>(
    null
  );
  const [selectedInputId, setSelectedInputId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");

  const [micTestRunning, setMicTestRunning] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const micTestRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    source: MediaStreamAudioSourceNode;
    stream: MediaStream;
    rafId: number;
  } | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => setLogs(["Logs cleared"]);

  useEffect(() => {
    const enumerate = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices
            .filter((d) => d.kind === "audioinput")
            .map((d, i) => ({
              id: d.deviceId || `in-${i}`,
              name: d.label || `Mic ${i + 1}`,
              is_default: false,
            }));
          const outputs = devices
            .filter((d) => d.kind === "audiooutput")
            .map((d, i) => ({
              id: d.deviceId || `out-${i}`,
              name: d.label || `Speaker ${i + 1}`,
              is_default: false,
            }));
          setBrowserDevices({ inputs, outputs });
          setSelectedInputId(inputs[0]?.id ?? "");
          setSelectedOutputId(outputs[0]?.id ?? "");
          addLog(
            `Browser devices loaded (inputs=${inputs.length}, outputs=${outputs.length})`
          );
        } finally {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        addLog(`Failed to enumerate devices: ${e}`);
      }
    };
    enumerate();
  }, []);

  const startMicTest = async () => {
    if (micTestRunning) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedInputId
          ? { deviceId: { exact: selectedInputId } as any }
          : true,
      });
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
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

  const playSpeakerTest = async () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      await ctx.resume();
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 440;
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain).connect(dest);
      const audioEl = new Audio();
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
        try {
          await ctx.close();
        } catch {}
        try {
          audioEl.pause();
          audioEl.srcObject = null;
        } catch {}
        addLog("Speaker test finished");
      }, 1000);
    } catch (e) {
      addLog(`Failed to play test tone: ${e}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">🌐 PromptLens Web</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 pb-20">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record" className="text-xs">
              Audio
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Audio Devices
                </CardTitle>
                <CardDescription>
                  Enumerate devices and test connectivity in browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input Device</label>
                    <Select
                      value={selectedInputId}
                      onValueChange={setSelectedInputId}
                      disabled={
                        !browserDevices || browserDevices.inputs.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select input device" />
                      </SelectTrigger>
                      <SelectContent>
                        {browserDevices?.inputs.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                            {d.is_default ? " (Default)" : ""}
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
                      disabled={
                        !browserDevices || browserDevices.outputs.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select output device" />
                      </SelectTrigger>
                      <SelectContent>
                        {browserDevices?.outputs.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                            {d.is_default ? " (Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Microphone Test
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={micTestRunning ? stopMicTest : startMicTest}
                        size="sm"
                      >
                        {micTestRunning ? "Stop" : "Start"}
                      </Button>
                      <div className="flex-1 h-2 bg-muted rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(micLevel * 200)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Speak into the mic. The bar should move.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Speaker Test</label>
                    <div className="flex items-center gap-3">
                      <Button onClick={playSpeakerTest} size="sm">
                        Play Test Tone
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A short beep (440Hz) will be played to the selected output
                      device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>
                  Runtime logs for web client UI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button size="sm" variant="secondary" onClick={clearLogs}>
                      Clear
                    </Button>
                  </div>
                  <div className="h-64 overflow-auto rounded border p-2 bg-background text-sm">
                    {logs.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
