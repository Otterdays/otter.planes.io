import { useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadSettings } from './Settings'
import './FPSCounter.css'

// Ring buffer for FPS averaging (last 60 frames)
const FPS_BUFFER_SIZE = 60

export default function FPSCounter() {
  const { fps, setFps } = useGameStore()
  const frameTimeBufferRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef(0)
  const rafIdRef = useRef<number>()

  // Track frame times using requestAnimationFrame
  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now()
      const deltaTime = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now

      // Add to ring buffer
      frameTimeBufferRef.current.push(deltaTime)
      if (frameTimeBufferRef.current.length > FPS_BUFFER_SIZE) {
        frameTimeBufferRef.current.shift()
      }

      frameCountRef.current++

      // Update FPS every 10 frames to avoid excessive store updates
      if (frameCountRef.current % 10 === 0 && frameTimeBufferRef.current.length > 0) {
        const avgFrameTime = frameTimeBufferRef.current.reduce((a, b) => a + b, 0) / frameTimeBufferRef.current.length
        const avgFps = 1000 / avgFrameTime
        setFps(Math.round(avgFps))
      }

      rafIdRef.current = requestAnimationFrame(updateFPS)
    }

    rafIdRef.current = requestAnimationFrame(updateFPS)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [setFps])

  // Check settings to determine visibility
  const settings = loadSettings()
  if (!settings.showFPS) return null

  const currentFps = fps || 0
  const frameTime = frameTimeBufferRef.current.length > 0
    ? frameTimeBufferRef.current[frameTimeBufferRef.current.length - 1]
    : 0

  // Color coding based on performance
  let fpsClass = 'fps-good'
  if (currentFps < 30) fpsClass = 'fps-bad'
  else if (currentFps < 50) fpsClass = 'fps-medium'

  return (
    <div className={`fps-counter ${fpsClass}`}>
      <div className="fps-value">{currentFps}</div>
      <div className="fps-label">FPS</div>
      <div className="fps-frame-time">{frameTime.toFixed(1)}ms</div>
    </div>
  )
}
