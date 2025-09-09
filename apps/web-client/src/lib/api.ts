class PromptLensAPI {
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor() {
    // Auto-detect server URL - will try to connect to the desktop app server
    this.baseUrl = this.detectServerUrl();
  }

  private detectServerUrl(): string {
    // Try to get server URL from current location
    const currentHost = window.location.hostname;

    // If we're running on the same host as the desktop app
    if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      return `http://${currentHost}:48080`;
    }

    // Default fallback
    return "http://localhost:48080";
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      this.isConnected = response.ok;
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  async getMetrics(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      return await response.text();
    } catch (error) {
      console.error("Failed to get metrics:", error);
      throw error;
    }
  }

  async startRecording(sampleRate: number = 44100): Promise<{ ok: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/record/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sample_rate: sampleRate }),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<{ ok: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/record/stop`, {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }

  async captureScreenshot(
    mode: "fullscreen" | "window" | "region" = "fullscreen"
  ): Promise<{ image_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/capture/screenshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode }),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      throw error;
    }
  }

  async pairDevice(pairToken: string): Promise<{ session_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/pair`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pair_token: pairToken }),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to pair device:", error);
      throw error;
    }
  }

  async getImage(imageId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/image/${imageId}`);
      return await response.blob();
    } catch (error) {
      console.error("Failed to get image:", error);
      throw error;
    }
  }

  getServerUrl(): string {
    return this.baseUrl;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const api = new PromptLensAPI();
