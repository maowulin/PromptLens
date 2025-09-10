import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Circle, Wifi, WifiOff, Headphones } from 'lucide-react'
import { api, type AudioDevices } from '@/lib/api'
import { formatTime } from '@/lib/utils'

export default function DesktopApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [sampleRate, setSampleRate] = useState('44100')
  const [logs, setLogs] = useState<string[]>(['Desktop mode ready'])
  const [audioDevices, setAudioDevices] = useState<AudioDevices | null>(null)
  const [selectedInputId, setSelectedInputId] = useState('')
  const [selectedOutputId, setSelectedOutputId] = useState('')

  // Source toggle: desktop service vs browser mic
  const [audioSource, setAudioSource] = useState<'desktop' | 'browser'>('desktop')
  const [browserStream, setBrowserStream] = useState<MediaStream | null>(null)
  const [browserRecorder, setBrowserRecorder] = useState<MediaRecorder | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => setLogs(['Logs cleared'])

  const doHealthCheck = async () => {
    const ok = await api.healthCheck()
    setIsConnected(ok)
    addLog(ok ? 'Connected to desktop service' : 'Disconnected from desktop service')
    return ok
  }

  useEffect(() => {
    const check = async () => { await doHealthCheck() }
    check()
    const t = setInterval(check, 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let timer: number | undefined
    if (isRecording) {
      timer = window.setInterval(() => setRecordingTime((v) => v + 1), 1000)
    } else {
      setRecordingTime(0)
    }
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [isRecording])

  // Load devices only when using desktop service and connected
  useEffect(() => {
    if (!isConnected || audioSource !== 'desktop') return
    ;(async () => {
      try {
        const devs = await api.getAudioDevices()
        setAudioDevices(devs)
        const defIn = devs.inputs.find((d) => d.is_default)?.id ?? devs.inputs[0]?.id ?? ''
        const defOut = devs.outputs.find((d) => d.is_default)?.id ?? devs.outputs[0]?.id ?? ''
        setSelectedInputId(defIn)
        setSelectedOutputId(defOut)
        addLog(`Loaded devices (in=${devs.inputs.length}, out=${devs.outputs.length})`)
      } catch (e) {
        addLog('Failed to load audio devices')
      }
    })()
  }, [isConnected, audioSource])

  // Cleanup browser stream on unmount
  useEffect(() => {
    return () => {
      try {
        browserRecorder?.stop()
      } catch {}
      browserStream?.getTracks().forEach(t => t.stop())
    }
  }, [browserRecorder, browserStream])

  const handleStartRecording = async () => {
    if (audioSource === 'browser') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const rec = new MediaRecorder(stream)
        rec.ondataavailable = () => { /* TODO: stream to ASR */ }
        rec.start(1000) // capture chunks every second
        setBrowserStream(stream)
        setBrowserRecorder(rec)
        setIsRecording(true)
        addLog('Started browser microphone capture')
      } catch (e) {
        addLog(`Failed to start browser capture: ${e}`)
      }
      return
    }

    try {
      await api.startRecording({
        sampleRate: parseInt(sampleRate),
        inputDeviceId: selectedInputId || undefined,
        outputDeviceId: selectedOutputId || undefined,
        source: 'desktop',
      })
      setIsRecording(true)
      addLog(`Started recording at ${sampleRate} Hz (in=${selectedInputId || 'default'}, out=${selectedOutputId || 'default'})`)
    } catch (e) {
      addLog(`Failed to start recording: ${e}`)
    }
  }

  const handleStopRecording = async () => {
    if (audioSource === 'browser') {
      try {
        if (browserRecorder && browserRecorder.state !== 'inactive') {
          browserRecorder.stop()
        }
      } catch {}
      browserStream?.getTracks().forEach(t => t.stop())
      setBrowserRecorder(null)
      setBrowserStream(null)
      setIsRecording(false)
      addLog(`Stopped browser microphone capture after ${formatTime(recordingTime)}`)
      return
    }

    try {
      await api.stopRecording()
      setIsRecording(false)
      addLog(`Stopped recording after ${formatTime(recordingTime)}`)
    } catch (e) {
      addLog(`Failed to stop recording: ${e}`)
    }
  }

  const serverUrl = api.getServerUrl()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">🖥️ PromptLens Desktop</h1>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-xs text-muted-foreground">Server: {serverUrl}</div>
            <Button size="sm" variant="secondary" onClick={doHealthCheck}>Retry</Button>
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

      <main className="container mx-auto px-4 py-6 pb-20">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record" className="text-xs">Record</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Mic className="mr-2 h-5 w-5" />Audio Recording</CardTitle>
                <CardDescription>Record audio through the desktop service or browser microphone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <Circle className="h-3 w-3 fill-red-500 text-red-500 recording-pulse" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="font-mono text-lg">{isRecording ? formatTime(recordingTime) : '00:00'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio Source</label>
                    <Select value={audioSource} onValueChange={(v: 'desktop' | 'browser') => setAudioSource(v)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop Service</SelectItem>
                        <SelectItem value="browser">Browser (Microphone)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample Rate</label>
                    <Select value={sampleRate} onValueChange={setSampleRate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16000">16 kHz</SelectItem>
                        <SelectItem value="22050">22.05 kHz</SelectItem>
                        <SelectItem value="44100">44.1 kHz</SelectItem>
                        <SelectItem value="48000">48 kHz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Device (Desktop)</label>
                    <Select value={selectedOutputId} onValueChange={setSelectedOutputId} disabled={!isConnected || audioSource !== 'desktop' || !audioDevices || audioDevices.outputs.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select output device" /></SelectTrigger>
                      <SelectContent>
                        {audioDevices?.outputs.map((d) => (
                          <SelectItem key={d.id} value={d.id}><span className="inline-flex items-center"><Headphones className="w-4 h-4 mr-2" />{d.name}{d.is_default ? ' (Default)' : ''}</span></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input Device (Desktop)</label>
                    <Select value={selectedInputId} onValueChange={setSelectedInputId} disabled={!isConnected || audioSource !== 'desktop' || !audioDevices || audioDevices.inputs.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select input device" /></SelectTrigger>
                      <SelectContent>
                        {audioDevices?.inputs.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}{d.is_default ? ' (Default)' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleStartRecording} disabled={isRecording || (audioSource === 'desktop' && !isConnected)} className="flex-1" size="lg">
                    <Mic className="mr-2 h-4 w-4" />Start Recording
                  </Button>
                  <Button onClick={handleStopRecording} disabled={!isRecording} variant="destructive" className="flex-1" size="lg">
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>Runtime logs for desktop client UI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button size="sm" variant="secondary" onClick={clearLogs}>Clear</Button>
                  </div>
                  <div className="h-64 overflow-auto rounded border p-2 bg-background text-sm">
                    {logs.map((l, i) => (<div key={i}>{l}</div>))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}