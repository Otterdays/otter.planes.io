import { create } from 'zustand'
import { Socket } from 'socket.io-client'
import * as THREE from 'three'
import { PlaneVariant } from '../components/PlaneModel'

interface Player {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  velocity: [number, number, number]
  timestamp: number
}

interface FlightData {
  speed: number           // Knots
  altitude: number        // Feet
  heading: number         // Degrees
  throttle: number        // 0 to 1
  angleOfAttack: number   // Degrees
  gForce: number          // Load factor
  isStalling: boolean     // Stall warning
}

interface GameState {
  // Connection
  socket: Socket | null
  setSocket: (socket: Socket | null) => void
  socketId: string | null
  setSocketId: (id: string | null) => void

  // Multiplayer
  otherPlayers: Player[]
  setOtherPlayers: (players: Player[]) => void

  // Plane State
  planePosition: THREE.Vector3
  planeRotation: THREE.Euler
  planeVelocity: THREE.Vector3
  setPlaneState: (position: THREE.Vector3, rotation: THREE.Euler, velocity: THREE.Vector3) => void

  // Flight Data (enhanced)
  flightData: FlightData
  setFlightData: (data: Partial<FlightData>) => void

  // Plane Selection
  selectedPlane: PlaneVariant
  setSelectedPlane: (variant: PlaneVariant) => void

  // Game Phase
  gamePhase: 'lobby' | 'selection' | 'flying' | 'builder'
  setGamePhase: (phase: 'lobby' | 'selection' | 'flying' | 'builder') => void

  // Game Mode
  gameMode: 'single' | 'multi'
  setGameMode: (mode: 'single' | 'multi') => void

  // Pause State
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  togglePause: () => void

  // Control Inputs (for visualization)
  controlInputs: {
    pitch: number
    roll: number
    yaw: number
    throttle: number
  }
  setControlInputs: (inputs: Partial<{ pitch: number; roll: number; yaw: number; throttle: number }>) => void

  // Legacy compatibility
  speed: number
  altitude: number
  heading: number

  // Performance tracking
  fps: number
  setFps: (fps: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  // Connection
  socket: null,
  setSocket: (socket) => set({ socket }),
  socketId: null,
  setSocketId: (id) => set({ socketId: id }),

  // Multiplayer
  otherPlayers: [],
  setOtherPlayers: (players) => set({ otherPlayers: players }),

  // Plane State
  planePosition: new THREE.Vector3(0, 5, 0),
  planeRotation: new THREE.Euler(0, 0, 0),
  planeVelocity: new THREE.Vector3(0, 0, 0),
  setPlaneState: (position, rotation, velocity) =>
    set({ planePosition: position, planeRotation: rotation, planeVelocity: velocity }),

  // Flight Data
  flightData: {
    speed: 0,
    altitude: 0,
    heading: 0,
    throttle: 0.2,
    angleOfAttack: 0,
    gForce: 1,
    isStalling: false,
  },
  setFlightData: (data) =>
    set((state) => ({
      flightData: { ...state.flightData, ...data },
      // Legacy compatibility
      speed: data.speed ?? state.flightData.speed,
      altitude: data.altitude ?? state.flightData.altitude,
      heading: data.heading ?? state.flightData.heading,
    })),

  // Plane Selection
  selectedPlane: 'ww2',
  setSelectedPlane: (variant) => set({ selectedPlane: variant }),

  // Game Phase
  gamePhase: 'lobby',
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // Game Mode
  gameMode: 'single',
  setGameMode: (mode) => set({ gameMode: mode }),

  // Pause State (only works in single player)
  isPaused: false,
  setIsPaused: (paused) => set({ isPaused: paused }),
  togglePause: () => set((state) => ({
    isPaused: state.gameMode === 'single' ? !state.isPaused : false
  })),

  // Control Inputs
  controlInputs: { pitch: 0, roll: 0, yaw: 0, throttle: 0.2 },
  setControlInputs: (inputs) =>
    set((state) => ({ controlInputs: { ...state.controlInputs, ...inputs } })),

  // Legacy compatibility
  speed: 0,
  altitude: 0,
  heading: 0,

  // Performance tracking
  fps: 0,
  setFps: (fps) => set({ fps }),
}))
