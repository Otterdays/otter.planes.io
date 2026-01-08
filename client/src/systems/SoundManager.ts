// Procedural Engine Sound System
export class SoundManager {
  private ctx: AudioContext | null = null
  private engineOsc: OscillatorNode | null = null
  private subOsc: OscillatorNode | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private engineGain: GainNode | null = null
  private noiseGain: GainNode | null = null
  private masterGain: GainNode | null = null
  
  private isInitialized = false
  private currentRPM = 0 // 0 to 1

  constructor() {
    // Lazy init on first interaction
  }

  init() {
    if (this.isInitialized) return
    
    // Create Audio Context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new AudioContext()

    // Master Gain (Volume)
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.4 // Master volume
    this.masterGain.connect(this.ctx.destination)

    // --- ENGINE TONE (Sawtooth) ---
    this.engineOsc = this.ctx.createOscillator()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.value = 60 // Idle rumble

    // Engine Filter (Lowpass to muffle the harsh saw)
    const engineFilter = this.ctx.createBiquadFilter()
    engineFilter.type = 'lowpass'
    engineFilter.frequency.value = 400

    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.value = 0.1

    this.engineOsc.connect(engineFilter)
    engineFilter.connect(this.engineGain)
    this.engineGain.connect(this.masterGain)
    this.engineOsc.start()

    // --- SUB BASS (Square) ---
    this.subOsc = this.ctx.createOscillator()
    this.subOsc.type = 'square'
    this.subOsc.frequency.value = 30 // Half of main

    const subGain = this.ctx.createGain()
    subGain.gain.value = 0.05
    
    this.subOsc.connect(subGain)
    subGain.connect(this.masterGain)
    this.subOsc.start()

    // --- PROPELLER/WIND NOISE ---
    const bufferSize = this.ctx.sampleRate * 2 // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    this.noiseNode = this.ctx.createBufferSource()
    this.noiseNode.buffer = buffer
    this.noiseNode.loop = true

    // Noise Filter (Bandpass for "whoosh")
    const noiseFilter = this.ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 1000
    noiseFilter.Q.value = 1

    this.noiseGain = this.ctx.createGain()
    this.noiseGain.gain.value = 0

    this.noiseNode.connect(noiseFilter)
    noiseFilter.connect(this.noiseGain)
    this.noiseGain.connect(this.masterGain)
    this.noiseNode.start()

    this.isInitialized = true
  }

  update(throttle: boolean, speed: number) {
    if (!this.ctx || !this.isInitialized) return
    
    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    const dt = 0.05 // Smooth transition factor

    // Target RPM based on throttle (0.2 idle, 1.0 max)
    const targetRPM = throttle ? 1.0 : 0.2
    
    // Smoothly interpolate current RPM
    this.currentRPM += (targetRPM - this.currentRPM) * dt

    // --- APPLY TO SOUND ---

    // 1. Engine Pitch (60Hz -> 200Hz)
    if (this.engineOsc && this.subOsc) {
      const baseFreq = 60 + (this.currentRPM * 140)
      this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1)
      this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, this.ctx.currentTime, 0.1)
    }

    // 2. Engine Volume (Louder at high RPM)
    if (this.engineGain) {
      const vol = 0.1 + (this.currentRPM * 0.2)
      this.engineGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1)
    }

    // 3. Prop/Wind Noise (Based on SPEED, not just throttle)
    // Speed ranges roughly 0 to 200
    if (this.noiseGain) {
      const speedFactor = Math.min(speed / 200, 1) // 0 to 1
      const noiseVol = speedFactor * 0.3 // Max noise volume
      this.noiseGain.gain.setTargetAtTime(noiseVol, this.ctx.currentTime, 0.1)
    }
  }

  stop() {
    if (this.ctx) {
      this.ctx.close()
      this.isInitialized = false
    }
  }
}

export const soundManager = new SoundManager()

