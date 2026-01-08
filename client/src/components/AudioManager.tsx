import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadSettings, GameSettings } from './Settings'

// =====================================================
// AUDIO MANAGER - Flight sounds and 8-bit music
// =====================================================

// Web Audio API context (shared)
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext()
    }
    return audioCtx
}

// =====================================================
// ENGINE SOUND GENERATOR
// =====================================================

class EngineSound {
    private ctx: AudioContext
    private oscillator: OscillatorNode | null = null
    private gainNode: GainNode | null = null
    private noiseNode: AudioBufferSourceNode | null = null
    private noiseGain: GainNode | null = null
    private masterGain: GainNode | null = null
    private isPlaying = false
    private volumeMultiplier = 1

    constructor(ctx: AudioContext) {
        this.ctx = ctx
    }

    start() {
        if (this.isPlaying) return

        // Master gain for volume control
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this.volumeMultiplier
        this.masterGain.connect(this.ctx.destination)

        // Main engine tone (low frequency hum)
        this.oscillator = this.ctx.createOscillator()
        this.oscillator.type = 'sawtooth'
        this.oscillator.frequency.value = 80

        this.gainNode = this.ctx.createGain()
        this.gainNode.gain.value = 0.03

        // Create noise for engine rumble
        const noiseBuffer = this.createNoiseBuffer()
        this.noiseNode = this.ctx.createBufferSource()
        this.noiseNode.buffer = noiseBuffer
        this.noiseNode.loop = true

        this.noiseGain = this.ctx.createGain()
        this.noiseGain.gain.value = 0.02

        // Low-pass filter for engine rumble
        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 200

        // Connect everything through master gain
        this.oscillator.connect(this.gainNode)
        this.gainNode.connect(this.masterGain)

        this.noiseNode.connect(filter)
        filter.connect(this.noiseGain)
        this.noiseGain.connect(this.masterGain)

        this.oscillator.start()
        this.noiseNode.start()
        this.isPlaying = true
    }

    stop() {
        if (!this.isPlaying) return

        this.oscillator?.stop()
        this.noiseNode?.stop()
        this.oscillator = null
        this.noiseNode = null
        this.isPlaying = false
    }

    setVolume(vol: number) {
        this.volumeMultiplier = vol
        if (this.masterGain) {
            this.masterGain.gain.value = vol
        }
    }

    // Update engine sound based on throttle and speed
    update(throttle: number, speed: number) {
        if (!this.oscillator || !this.gainNode || !this.noiseGain) return

        // Engine pitch increases with throttle
        const basePitch = 60 + throttle * 80
        const speedBonus = Math.min(speed / 200, 1) * 30
        this.oscillator.frequency.value = basePitch + speedBonus

        // Volume increases with throttle
        this.gainNode.gain.value = 0.02 + throttle * 0.04
        this.noiseGain.gain.value = 0.01 + throttle * 0.03
    }

    private createNoiseBuffer(): AudioBuffer {
        const bufferSize = this.ctx.sampleRate * 2 // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        return buffer
    }
}

// =====================================================
// WIND SOUND GENERATOR
// =====================================================

class WindSound {
    private ctx: AudioContext
    private noiseNode: AudioBufferSourceNode | null = null
    private gainNode: GainNode | null = null
    private masterGain: GainNode | null = null
    private filter: BiquadFilterNode | null = null
    private isPlaying = false
    private volumeMultiplier = 1

    constructor(ctx: AudioContext) {
        this.ctx = ctx
    }

    start() {
        if (this.isPlaying) return

        // Master gain for volume control
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this.volumeMultiplier
        this.masterGain.connect(this.ctx.destination)

        const noiseBuffer = this.createNoiseBuffer()
        this.noiseNode = this.ctx.createBufferSource()
        this.noiseNode.buffer = noiseBuffer
        this.noiseNode.loop = true

        // Bandpass filter for wind character
        this.filter = this.ctx.createBiquadFilter()
        this.filter.type = 'bandpass'
        this.filter.frequency.value = 800
        this.filter.Q.value = 0.5

        this.gainNode = this.ctx.createGain()
        this.gainNode.gain.value = 0

        this.noiseNode.connect(this.filter)
        this.filter.connect(this.gainNode)
        this.gainNode.connect(this.masterGain)

        this.noiseNode.start()
        this.isPlaying = true
    }

    stop() {
        if (!this.isPlaying) return
        this.noiseNode?.stop()
        this.noiseNode = null
        this.isPlaying = false
    }

    setVolume(vol: number) {
        this.volumeMultiplier = vol
        if (this.masterGain) {
            this.masterGain.gain.value = vol
        }
    }

    update(speed: number) {
        if (!this.gainNode || !this.filter) return

        // Wind volume and pitch increase with speed
        const normalizedSpeed = Math.min(speed / 300, 1)
        this.gainNode.gain.value = normalizedSpeed * 0.08
        this.filter.frequency.value = 400 + normalizedSpeed * 1200
    }

    private createNoiseBuffer(): AudioBuffer {
        const bufferSize = this.ctx.sampleRate * 2
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        return buffer
    }
}

// =====================================================
// 8-BIT MUSIC GENERATOR
// =====================================================

class ChiptuneMusicPlayer {
    private ctx: AudioContext
    private masterGain: GainNode | null = null
    private isPlaying = false
    private currentNoteIndex = 0
    private intervalId: number | null = null
    private volumeMultiplier = 1

    // Slow, peaceful 8-bit melody (frequencies in Hz)
    // Using pentatonic scale for calm feel
    private melody = [
        { note: 392, dur: 0.5 },  // G4
        { note: 440, dur: 0.5 },  // A4
        { note: 523, dur: 1 },    // C5
        { note: 440, dur: 0.5 },  // A4
        { note: 392, dur: 0.5 },  // G4
        { note: 330, dur: 1 },    // E4
        { note: 392, dur: 0.5 },  // G4
        { note: 330, dur: 0.5 },  // E4
        { note: 294, dur: 1 },    // D4
        { note: 330, dur: 0.5 },  // E4
        { note: 392, dur: 0.5 },  // G4
        { note: 440, dur: 1 },    // A4
        { note: 0, dur: 0.5 },    // Rest
        { note: 523, dur: 0.5 },  // C5
        { note: 440, dur: 1 },    // A4
        { note: 392, dur: 2 },    // G4
        { note: 0, dur: 1 },      // Rest
    ]

    // Bass line (lower octave, slower)
    private bassline = [
        { note: 196, dur: 2 },    // G3
        { note: 220, dur: 2 },    // A3
        { note: 165, dur: 2 },    // E3
        { note: 147, dur: 2 },    // D3
        { note: 196, dur: 2 },    // G3
        { note: 220, dur: 2 },    // A3
        { note: 262, dur: 2 },    // C4
        { note: 196, dur: 2 },    // G3
    ]

    private currentBassIndex = 0

    constructor(ctx: AudioContext) {
        this.ctx = ctx
    }

    start() {
        if (this.isPlaying) return

        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.08 * this.volumeMultiplier // Quiet background music
        this.masterGain.connect(this.ctx.destination)

        this.isPlaying = true
        this.playNextNote()
    }

    stop() {
        if (this.intervalId) {
            clearTimeout(this.intervalId)
            this.intervalId = null
        }
        this.isPlaying = false
    }

    setVolume(vol: number) {
        this.volumeMultiplier = vol
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(0.15, 0.08 * vol))
        }
    }

    private playNextNote() {
        if (!this.isPlaying || !this.masterGain) return

        const melodyNote = this.melody[this.currentNoteIndex]
        const bassNote = this.bassline[this.currentBassIndex]

        // Play melody note
        if (melodyNote.note > 0) {
            this.playTone(melodyNote.note, melodyNote.dur * 0.8, 'square', 0.5)
        }

        // Play bass note (every 2 melody notes)
        if (this.currentNoteIndex % 2 === 0 && bassNote.note > 0) {
            this.playTone(bassNote.note, 1.5, 'triangle', 0.3)
        }

        // Schedule next note
        const tempo = 400 // ms per beat (slow and peaceful)
        const duration = melodyNote.dur * tempo

        this.intervalId = window.setTimeout(() => {
            this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length
            if (this.currentNoteIndex % 2 === 0) {
                this.currentBassIndex = (this.currentBassIndex + 1) % this.bassline.length
            }
            this.playNextNote()
        }, duration)
    }

    private playTone(
        frequency: number,
        duration: number,
        waveType: OscillatorType,
        volume: number
    ) {
        if (!this.masterGain) return

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = waveType
        osc.frequency.value = frequency

        // 8-bit style: quick attack, sustain, quick release
        const now = this.ctx.currentTime
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(volume, now + 0.02)
        gain.gain.setValueAtTime(volume, now + duration * 0.7)
        gain.gain.linearRampToValueAtTime(0, now + duration)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start(now)
        osc.stop(now + duration)
    }
}

// =====================================================
// MAIN AUDIO HOOK
// =====================================================

export function useAudio() {
    const engineRef = useRef<EngineSound | null>(null)
    const windRef = useRef<WindSound | null>(null)
    const musicRef = useRef<ChiptuneMusicPlayer | null>(null)
    const startedRef = useRef(false)
    const [settings, setSettings] = useState<GameSettings>(loadSettings)

    const { flightData } = useGameStore()

    // Start audio on user interaction
    const startAudio = useCallback(() => {
        if (startedRef.current) return
        startedRef.current = true

        const ctx = getAudioContext()

        // Resume if suspended (browsers require user gesture)
        if (ctx.state === 'suspended') {
            ctx.resume()
        }

        engineRef.current = new EngineSound(ctx)
        windRef.current = new WindSound(ctx)
        musicRef.current = new ChiptuneMusicPlayer(ctx)

        // Apply initial settings
        const currentSettings = loadSettings()
        const musicVol = currentSettings.musicVolume / 100
        const sfxVol = currentSettings.sfxVolume / 100

        musicRef.current.setVolume(musicVol)
        engineRef.current.setVolume(sfxVol)
        windRef.current.setVolume(sfxVol)

        engineRef.current.start()
        windRef.current.start()
        musicRef.current.start()
    }, [])

    // Listen for settings changes (poll localStorage)
    useEffect(() => {
        const checkSettings = () => {
            const newSettings = loadSettings()
            if (
                newSettings.musicVolume !== settings.musicVolume ||
                newSettings.sfxVolume !== settings.sfxVolume
            ) {
                setSettings(newSettings)

                // Apply new volumes
                const musicVol = newSettings.musicVolume / 100
                const sfxVol = newSettings.sfxVolume / 100

                musicRef.current?.setVolume(musicVol)
                engineRef.current?.setVolume(sfxVol)
                windRef.current?.setVolume(sfxVol)
            }
        }

        // Check settings every 500ms for changes
        const interval = setInterval(checkSettings, 500)
        return () => clearInterval(interval)
    }, [settings])

    // Update sounds based on flight data
    useEffect(() => {
        if (!startedRef.current) return

        const throttle = flightData.throttle || 0
        const speed = flightData.speed || 0

        engineRef.current?.update(throttle, speed)
        windRef.current?.update(speed)
    }, [flightData])

    // Cleanup
    useEffect(() => {
        return () => {
            engineRef.current?.stop()
            windRef.current?.stop()
            musicRef.current?.stop()
        }
    }, [])

    return { startAudio }
}

// =====================================================
// AUDIO COMPONENT
// =====================================================

export default function AudioManager() {
    const { startAudio } = useAudio()

    // Start audio on first user click
    useEffect(() => {
        const handleClick = () => {
            startAudio()
            window.removeEventListener('click', handleClick)
        }

        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [startAudio])

    return null // No visual component
}
