import { useFrame } from '@react-three/fiber'
import { useFlightPhysics } from '../hooks/useFlightPhysics'
import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import PlaneModel from './PlaneModel'

interface PlaneProps {
  playerName: string
}

export default function Plane({ playerName }: PlaneProps) {
  const meshRef = useFlightPhysics()
  const { selectedPlane, controlInputs } = useGameStore()

  // Camera control state
  const [isRightClicking, setIsRightClicking] = useState(false)
  const [lastRightClickTime, setLastRightClickTime] = useState(0)
  const cameraRotationRef = useRef({ theta: 0, phi: Math.PI / 4 })
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const returnToChaseTimerRef = useRef<number | null>(null)

  // Pooled vectors for camera calculations (avoid allocations in hot path)
  const _defaultOffset = useMemo(() => new THREE.Vector3(), [])
  const _defaultPosition = useMemo(() => new THREE.Vector3(), [])
  const _cameraOffset = useMemo(() => new THREE.Vector3(), [])
  const _desiredPosition = useMemo(() => new THREE.Vector3(), [])

  // Initialize position - start on ground
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, 0.45, 0)
    }
  }, [meshRef])

  // Right-click mouse controls for camera
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault()
        setIsRightClicking(true)
        isDraggingRef.current = true
        lastMousePosRef.current = { x: e.clientX, y: e.clientY }

        if (returnToChaseTimerRef.current) {
          clearTimeout(returnToChaseTimerRef.current)
          returnToChaseTimerRef.current = null
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsRightClicking(false)
        isDraggingRef.current = false
        setLastRightClickTime(Date.now())

        if (returnToChaseTimerRef.current) {
          clearTimeout(returnToChaseTimerRef.current)
        }
        returnToChaseTimerRef.current = window.setTimeout(() => { }, 1000)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - lastMousePosRef.current.x
        const deltaY = e.clientY - lastMousePosRef.current.y

        cameraRotationRef.current.theta -= deltaX * 0.005
        cameraRotationRef.current.phi += deltaY * 0.005
        cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotationRef.current.phi))

        lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('contextmenu', handleContextMenu)
      if (returnToChaseTimerRef.current !== null) {
        clearTimeout(returnToChaseTimerRef.current)
      }
    }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const mesh = meshRef.current
    const camera = state.camera as THREE.PerspectiveCamera

    // Frame-rate independent smoothing factor (exponential decay)
    // Target: 90% of distance covered in ~0.1 seconds regardless of framerate
    const smoothFactor = 1 - Math.pow(0.001, delta)

    // Snap threshold - if camera is within this distance of target, snap directly
    // This prevents micro-jitter that makes the ground appear to shake
    const SNAP_THRESHOLD = 0.01

    // Calculate default chase camera offset (using pooled vectors)
    _defaultOffset.set(0, 3, 8)
    _defaultOffset.applyQuaternion(mesh.quaternion)
    _defaultPosition.copy(mesh.position).add(_defaultOffset)

    if (isRightClicking) {
      const distance = 8
      _cameraOffset.set(
        Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta) * distance,
        Math.cos(cameraRotationRef.current.phi) * distance,
        Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta) * distance
      )

      _cameraOffset.applyQuaternion(mesh.quaternion)
      _desiredPosition.copy(mesh.position).add(_cameraOffset)

      // Snap if close enough, otherwise lerp
      if (camera.position.distanceTo(_desiredPosition) < SNAP_THRESHOLD) {
        camera.position.copy(_desiredPosition)
      } else {
        camera.position.lerp(_desiredPosition, smoothFactor)
      }
      camera.lookAt(mesh.position)
    } else {
      const timeSinceLastClick = Date.now() - lastRightClickTime
      if (timeSinceLastClick > 1000) {
        // Snap if close enough, otherwise lerp
        if (camera.position.distanceTo(_defaultPosition) < SNAP_THRESHOLD) {
          camera.position.copy(_defaultPosition)
        } else {
          camera.position.lerp(_defaultPosition, smoothFactor)
        }
        camera.lookAt(mesh.position)

        // Frame-rate independent rotation smoothing
        const rotationSmoothFactor = 1 - Math.pow(0.001, delta * 2)
        cameraRotationRef.current.theta = THREE.MathUtils.lerp(cameraRotationRef.current.theta, 0, rotationSmoothFactor)
        cameraRotationRef.current.phi = THREE.MathUtils.lerp(cameraRotationRef.current.phi, Math.PI / 4, rotationSmoothFactor)
      } else {
        const distance = 8
        _cameraOffset.set(
          Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta) * distance,
          Math.cos(cameraRotationRef.current.phi) * distance,
          Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta) * distance
        )
        _cameraOffset.applyQuaternion(mesh.quaternion)
        _desiredPosition.copy(mesh.position).add(_cameraOffset)

        // Snap if close enough, otherwise lerp
        if (camera.position.distanceTo(_desiredPosition) < SNAP_THRESHOLD) {
          camera.position.copy(_desiredPosition)
        } else {
          camera.position.lerp(_desiredPosition, smoothFactor)
        }
        camera.lookAt(mesh.position)
      }
    }
  })

  return (
    <group ref={meshRef}>
      {/* Use the modular plane model with control surface animations */}
      <PlaneModel
        variant={selectedPlane}
        controlInputs={controlInputs}
      />

      {/* Player name tag on fuselage */}
      <mesh position={[0, 0.35, 0.6]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}
