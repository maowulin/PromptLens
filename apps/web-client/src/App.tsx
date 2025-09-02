import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Tablet
} from 'lucide-react'
import { api } from '@/lib/api'
import { getDeviceInfo, formatTime } from '@/lib/utils'
import './globals.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [sampleRate, setSampleRate] = useState('44100')
  const [captureMode, setCaptureMode] = useState('fullscreen')
  const [pairToken, setPairToken] = useState('mobile_device_001')
  const [logs, setLogs] = useState<string[]>(['Welcome to PromptLens Multi-Device Client!'])
  const [serverUrl, setServerUrl] = useState('')
  const [deviceInfo] = useState(getDeviceInfo())

  useEffect(() => {
    checkConnection()
    setServerUrl(api.getServerUrl())
    
    const interval = setInterval(checkConnection, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => {
    setLogs(['Logs cleared'])
  }

  const checkConnection = async () => {
    try {
      const connected = await api.healthCheck()
      setIsConnected(connected)
      if (connected) {
        addLog('Connected to desktop service')
      } else {
        addLog('Connection lost to desktop service')
      }
    } catch (error) {
      setIsConnected(false)
      addLog('Failed to connect to desktop service')
    }
  }

  const handleStartRecording = async () => {
    try {
      await api.startRecording(parseInt(sampleRate))
      setIsRecording(true)
      addLog(`Started recording at ${sampleRate} Hz`)
    } catch (error) {
      addLog(`Failed to start recording: ${error}`)
    }
  }

  const handleStopRecording = async () => {
    try {
      await api.stopRecording()
      setIsRecording(false)
      addLog(`Stopped recording after ${formatTime(recordingTime)}`)
    } catch (error) {
      addLog(`Failed to stop recording: ${error}`)
    }
  }

  const handleCapture = async () => {
    try {
      const result = await api.captureScreenshot(captureMode as any)
      addLog(`Screenshot captured: ${result.image_id}`)
    } catch (error) {
      addLog(`Screenshot failed: ${error}`)
    }
  }

  const handlePairDevice = async () => {
    try {
      const result = await api.pairDevice(pairToken)
      addLog(`Device paired successfully: ${result.session_id}`)
    } catch (error) {
      addLog(`Pairing failed: ${error}`)
    }
  }

  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

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
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <Circle className="h-3 w-3 fill-red-500 text-red-500 recording-pulse" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="font-mono text-lg">
                      {isRecording ? formatTime(recordingTime) : '00:00'}
                    </span>
                  </div>
                </div>
                
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

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleStartRecording}
                    disabled={isRecording || !isConnected}
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
                    <span className="text-sm text-muted-foreground">Server:</span>
                    <span className="text-sm font-mono">{serverUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Device:</span>
                    <span className="text-sm flex items-center">
                      {getDeviceIcon()}
                      <span className="ml-1">{deviceInfo.deviceType}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Screen:</span>
                    <span className="text-sm font-mono">{deviceInfo.screenSize}</span>
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
                    {logs.join('\n')}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App