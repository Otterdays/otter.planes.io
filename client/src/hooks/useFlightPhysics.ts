import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { soundManager } from '../systems/SoundManager'

// =====================================================
// CONTROL INPUT INTERFACE
// =====================================================

interface FlightControls {
  pitchUp: boolean
  pitchDown: boolean
  rollLeft: boolean
  rollRight: boolean
  yawLeft: boolean
  yawRight: boolean
  throttleUp: boolean
  throttleDown: boolean
}

// =====================================================
// AIRCRAFT CONFIGURATIONS (arcade-tuned)
// =====================================================

export interface PlaneConfig {
  name: string
  maxSpeed: number        // Maximum speed
  acceleration: number    // How fast it speeds up
  liftPower: number       // How much lift at speed
  dragFactor: number      // Air resistance
  rollRate: number        // Roll responsiveness
  pitchRate: number       // Pitch responsiveness
  yawRate: number         // Yaw responsiveness
  turnTightness: number   // How well velocity follows nose
}

export const PLANE_CONFIGS: Record<string, PlaneConfig> = {
  ww2: {
    name: 'P-51 Mustang',
    maxSpeed: 150,
    acceleration: 40,
    liftPower: 2.5,
    dragFactor: 0.02,
    rollRate: 2.5,
    pitchRate: 2.0,
    yawRate: 1.2,
    turnTightness: 3.0,
  },
  jet: {
    name: 'F-22 Raptor',
    maxSpeed: 300,
    acceleration: 80,
    liftPower: 3.0,
    dragFactor: 0.015,
    rollRate: 3.5,
    pitchRate: 2.5,
    yawRate: 1.5,
    turnTightness: 4.0,
  },
  biplane: {
    name: 'Fokker Dr.I',
    maxSpeed: 80,
    acceleration: 25,
    liftPower: 2.0,
    dragFactor: 0.035,
    rollRate: 4.5,
    pitchRate: 3.5,
    yawRate: 2.5,
    turnTightness: 5.0,
  },
  sopwith: {
    name: 'Sopwith Camel',
    maxSpeed: 90,
    acceleration: 28,
    liftPower: 2.2,
    dragFactor: 0.032,
    rollRate: 5.0,      // Famous for quick roll
    pitchRate: 3.2,
    yawRate: 2.8,
    turnTightness: 5.5, // Very agile
  },
  spad: {
    name: 'SPAD XIII',
    maxSpeed: 110,      // Fastest WWI fighter
    acceleration: 32,
    liftPower: 2.3,
    dragFactor: 0.028,
    rollRate: 3.8,
    pitchRate: 3.0,
    yawRate: 2.0,
    turnTightness: 4.0, // Less agile but faster
  },
  boeing747: {
    name: 'Boeing 747',
    maxSpeed: 250,
    acceleration: 20,
    liftPower: 4.0,
    dragFactor: 0.025,
    rollRate: 0.8,
    pitchRate: 0.6,
    yawRate: 0.4,
    turnTightness: 1.5,
  },
  stealth: {
    name: 'B-2 Spirit',
    maxSpeed: 220,
    acceleration: 35,
    liftPower: 3.5,       // Good lift from flying wing design
    dragFactor: 0.018,     // Low drag - optimized shape
    rollRate: 1.8,         // Moderate roll - wide wingspan
    pitchRate: 1.5,        // Slower pitch response
    yawRate: 0.8,          // Relies on drag rudders
    turnTightness: 2.5,    // Wide, stable turns
  },
  interceptor: {
    name: 'MiG-21',
    maxSpeed: 350,         // Very fast
    acceleration: 100,     // Extreme acceleration
    liftPower: 2.8,        // Delta wing lift
    dragFactor: 0.02,
    rollRate: 4.0,         // Quick roll
    pitchRate: 3.0,        // Responsive pitch
    yawRate: 1.8,          // Good yaw authority
    turnTightness: 4.5,    // Tight turns at speed
  },
  otter: {
    name: 'Otterly Ridiculous',
    maxSpeed: 140,         // Decent speed - playful
    acceleration: 50,      // Quick to get going
    liftPower: 2.8,        // Good lift (webbed paws!)
    dragFactor: 0.025,     // Moderate drag (fluffy)
    rollRate: 4.0,         // Playful barrel rolls
    pitchRate: 3.2,        // Agile like a swimming otter
    yawRate: 2.2,          // Good rudder (otter tail)
    turnTightness: 4.5,    // Nimble turns
  },
  tungtung: {
    name: 'Tung Tung Air',
    maxSpeed: 169,         // Nice speed (brain rot energy)
    acceleration: 69,      // Nice acceleration
    liftPower: 3.0,        // Arm flapping provides lift
    dragFactor: 0.03,      // Cylindrical body = more drag
    rollRate: 3.5,         // Decent roll with arm wings
    pitchRate: 2.8,        // Good pitch control
    yawRate: 2.0,          // Reasonable yaw
    turnTightness: 4.0,    // Can turn okay with arm flaps
  },
}

// =====================================================
// PHYSICS CONSTANTS (arcade-friendly)
// =====================================================

const GRAVITY = 5                   // Reduced for easier keyboard/mouse control
const GROUND_HEIGHT = 0.45
const TAKEOFF_SPEED = 20
const THROTTLE_RATE = 1.5           // Fast throttle response
const IDLE_THROTTLE = 0.1
const MIN_CONTROL_SPEED = 15        // Minimum speed for full control authority

// =====================================================
// PHYSICS HOOK
// =====================================================

export function useFlightPhysics() {
  const meshRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
  const throttleRef = useRef(IDLE_THROTTLE)
  const speedRef = useRef(0)  // Current forward speed

  const controlsRef = useRef<FlightControls>({
    pitchUp: false,
    pitchDown: false,
    rollLeft: false,
    rollRight: false,
    yawLeft: false,
    yawRight: false,
    throttleUp: false,
    throttleDown: false,
  })

  // Throttling refs for state updates
  const lastUpdateRef = useRef({ state: 0, flight: 0, network: 0 })
  const UPDATE_INTERVAL_STATE = 33   // ~30fps
  const UPDATE_INTERVAL_FLIGHT = 50  // ~20fps
  const UPDATE_INTERVAL_NETWORK = 50 // ~20fps

  // Pooled vectors (avoid allocations in hot path)
  const _forward = useMemo(() => new THREE.Vector3(), [])
  const _up = useMemo(() => new THREE.Vector3(), [])
  const _right = useMemo(() => new THREE.Vector3(), [])
  const _worldUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const _targetVelocity = useMemo(() => new THREE.Vector3(), [])
  const _velocityScaled = useMemo(() => new THREE.Vector3(), [])
  const _euler = useMemo(() => new THREE.Euler(), [])

  const { socket, setPlaneState, setFlightData, setControlInputs, selectedPlane, isPaused } = useGameStore()

  const config = PLANE_CONFIGS[selectedPlane] || PLANE_CONFIGS.ww2

  // =====================================================
  // INPUT HANDLING
  // =====================================================

  useEffect(() => {
    const initAudio = () => {
      soundManager.init()
      window.removeEventListener('keydown', initAudio)
      window.removeEventListener('mousedown', initAudio)
    }
    window.addEventListener('keydown', initAudio)
    window.addEventListener('mousedown', initAudio)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      switch (e.key.toLowerCase()) {
        case 'w': controlsRef.current.pitchDown = true; break
        case 's': controlsRef.current.pitchUp = true; break
        case 'a': controlsRef.current.rollLeft = true; break
        case 'd': controlsRef.current.rollRight = true; break
        case 'q': controlsRef.current.yawLeft = true; break
        case 'e': controlsRef.current.yawRight = true; break
        case 'shift': controlsRef.current.throttleUp = true; break
        case 'control':
          controlsRef.current.throttleDown = true
          e.preventDefault()
          break
        case ' ': controlsRef.current.throttleDown = true; break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': controlsRef.current.pitchDown = false; break
        case 's': controlsRef.current.pitchUp = false; break
        case 'a': controlsRef.current.rollLeft = false; break
        case 'd': controlsRef.current.rollRight = false; break
        case 'q': controlsRef.current.yawLeft = false; break
        case 'e': controlsRef.current.yawRight = false; break
        case 'shift': controlsRef.current.throttleUp = false; break
        case 'control': controlsRef.current.throttleDown = false; break
        case ' ': controlsRef.current.throttleDown = false; break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('keydown', initAudio)
      window.removeEventListener('mousedown', initAudio)
      soundManager.stop()
    }
  }, [])

  // =====================================================
  // ARCADE PHYSICS SIMULATION
  // =====================================================

  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Skip physics if paused
    if (isPaused) return

    const controls = controlsRef.current
    const mesh = meshRef.current
    const dt = Math.min(delta, 0.05)

    // -----------------------------------------------------
    // THROTTLE
    // -----------------------------------------------------
    if (controls.throttleUp) {
      throttleRef.current = Math.min(1, throttleRef.current + THROTTLE_RATE * dt)
    }
    if (controls.throttleDown) {
      throttleRef.current = Math.max(0, throttleRef.current - THROTTLE_RATE * dt)
    }
    if (!controls.throttleUp && !controls.throttleDown) {
      throttleRef.current = Math.max(IDLE_THROTTLE, throttleRef.current - THROTTLE_RATE * 0.3 * dt)
    }
    const throttle = throttleRef.current

    // -----------------------------------------------------
    // STATE
    // -----------------------------------------------------
    const isOnGround = mesh.position.y <= GROUND_HEIGHT + 0.1
    let speed = speedRef.current

    // Get orientation vectors (using pooled vectors)
    _forward.set(0, 0, -1).applyQuaternion(mesh.quaternion)
    _up.set(0, 1, 0).applyQuaternion(mesh.quaternion)
    _right.set(1, 0, 0).applyQuaternion(mesh.quaternion)

    // -----------------------------------------------------
    // SPEED (simple acceleration/drag model)
    // -----------------------------------------------------
    const targetSpeed = throttle * config.maxSpeed
    const speedDiff = targetSpeed - speed

    // Accelerate towards target speed
    if (speedDiff > 0) {
      speed += config.acceleration * throttle * dt
    } else {
      // Drag slows you down
      speed -= speed * config.dragFactor * dt * 10
    }

    // Clamp speed
    speed = Math.max(0, Math.min(config.maxSpeed, speed))
    speedRef.current = speed

    // -----------------------------------------------------
    // ROTATIONAL CONTROLS
    // -----------------------------------------------------
    const pitchInput = (controls.pitchUp ? 1 : 0) - (controls.pitchDown ? 1 : 0)
    const rollInput = (controls.rollRight ? 1 : 0) - (controls.rollLeft ? 1 : 0)
    const yawInput = (controls.yawRight ? 1 : 0) - (controls.yawLeft ? 1 : 0)

    // Control effectiveness scales with speed
    const controlEffect = Math.min(1, speed / 30)

    if (isOnGround) {
      // On ground - only allow yaw steering, NO roll or pitch
      const steerInput = yawInput !== 0 ? yawInput : rollInput * 0.3  // Roll acts as weak ground steering
      mesh.rotateY(-steerInput * config.yawRate * dt)

      // Pitch up for takeoff (only if going fast enough)
      if (controls.pitchUp && speed > TAKEOFF_SPEED * 0.7) {
        mesh.rotateX(config.pitchRate * dt * 0.5)
      }

      // Force level on ground - aggressive leveling
      _euler.setFromQuaternion(mesh.quaternion)
      _euler.x *= 0.85  // Strongly level pitch
      _euler.z *= 0.8   // Very strongly level roll - no tipping!
      mesh.quaternion.setFromEuler(_euler)
    } else {
      // Airborne controls - full control authority scales with speed
      const speedFactor = Math.min(1, speed / MIN_CONTROL_SPEED)

      mesh.rotateX(pitchInput * config.pitchRate * controlEffect * dt)
      mesh.rotateZ(-rollInput * config.rollRate * controlEffect * dt)
      mesh.rotateY(-yawInput * config.yawRate * 0.5 * controlEffect * dt)

      // Bank-induced turn (rolling causes turning) - only effective at speed
      const bankAngle = Math.asin(Math.max(-1, Math.min(1, _right.y)))
      mesh.rotateY(bankAngle * config.turnTightness * speedFactor * dt)
    }

    // -----------------------------------------------------
    // VELOCITY (follows nose direction)
    // -----------------------------------------------------
    const velocity = velocityRef.current

    // Base velocity in forward direction (using pooled vector)
    _targetVelocity.copy(_forward).multiplyScalar(speed)

    // Smoothly align velocity with nose (arcade-style)
    velocity.lerp(_targetVelocity, config.turnTightness * dt)

    // -----------------------------------------------------
    // LIFT & GRAVITY (more forgiving)
    // -----------------------------------------------------
    if (!isOnGround) {
      // Lift based on speed
      const liftAmount = speed * config.liftPower * 0.1
      const pitchFactor = _forward.dot(_worldUp)  // How much nose is pointing up (-1 to 1)

      // More forgiving lift calculation:
      // - When level (pitchFactor ~0): full lift
      // - When climbing (pitchFactor > 0): slightly reduced lift but still positive
      // - When diving (pitchFactor < 0): reduced lift
      const liftMultiplier = 1 - Math.abs(pitchFactor) * 0.3
      velocity.y += liftAmount * liftMultiplier * dt

      // Reduced gravity when climbing with throttle (thrust helps maintain altitude)
      const gravityReduction = throttle > 0.5 && pitchFactor > 0 ? 0.6 : 1.0
      velocity.y -= GRAVITY * gravityReduction * dt

      // Gentle auto-leveling tendency (reduced from before)
      // Only apply subtle pitch-down if going very slow
      if (speed < MIN_CONTROL_SPEED && velocity.y > 0 && pitchFactor > 0.3) {
        velocity.y *= 0.98  // Gentle slowdown, not aggressive
      }
    } else {
      // On ground - no vertical velocity
      velocity.y = Math.max(0, velocity.y)
    }

    // -----------------------------------------------------
    // UPDATE POSITION
    // -----------------------------------------------------
    _velocityScaled.copy(velocity).multiplyScalar(dt)
    mesh.position.add(_velocityScaled)

    // Ground collision
    if (mesh.position.y < GROUND_HEIGHT) {
      mesh.position.y = GROUND_HEIGHT
      velocity.y = 0

      // Reduce forward speed on ground impact (gentle friction)
      if (speedRef.current > 5) {
        speedRef.current *= 0.98
      }

      // Force level on ground - very aggressive to prevent flipping
      _euler.setFromQuaternion(mesh.quaternion)
      _euler.x = _euler.x * 0.8  // Level pitch quickly
      _euler.z = _euler.z * 0.7  // Level roll VERY quickly - no wingtip strikes!
      mesh.quaternion.setFromEuler(_euler)
    }

    // -----------------------------------------------------
    // G-FORCE & AOA (for HUD)
    // -----------------------------------------------------
    const gForce = 1 + Math.abs(pitchInput) * 2
    const angleOfAttack = _forward.dot(_worldUp) * 57.3  // Convert to degrees

    // -----------------------------------------------------
    // SOUND
    // -----------------------------------------------------
    soundManager.update(throttle > 0.5, speed)

    // -----------------------------------------------------
    // UPDATE STATE (throttled)
    // -----------------------------------------------------
    const now = Date.now()

    // Throttle plane state updates (~30fps)
    if (now - lastUpdateRef.current.state >= UPDATE_INTERVAL_STATE) {
      setPlaneState(mesh.position.clone(), mesh.rotation.clone(), velocity.clone())
      lastUpdateRef.current.state = now
    }

    // Throttle flight data updates (~20fps - HUD doesn't need 60fps)
    if (now - lastUpdateRef.current.flight >= UPDATE_INTERVAL_FLIGHT) {
      const speedKnots = speed * 1.944
      const altitudeFeet = mesh.position.y * 3.281
      const headingDegrees = ((Math.atan2(-_forward.x, -_forward.z) * 180 / Math.PI) + 360) % 360

      setFlightData({
        speed: speedKnots,
        altitude: altitudeFeet,
        heading: headingDegrees,
        throttle,
        angleOfAttack,
        gForce,
        isStalling: speed < 15 && !isOnGround,
      })

      setControlInputs({
        pitch: pitchInput,
        roll: rollInput,
        yaw: yawInput,
        throttle,
      })

      lastUpdateRef.current.flight = now
    }

    // Throttle network updates (~20fps - sufficient for multiplayer sync)
    if (socket && socket.connected && now - lastUpdateRef.current.network >= UPDATE_INTERVAL_NETWORK) {
      socket.emit('playerUpdate', {
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        velocity: [velocity.x, velocity.y, velocity.z],
      })
      lastUpdateRef.current.network = now
    }
  })

  return meshRef
}
