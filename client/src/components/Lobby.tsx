import { useState, useEffect, useMemo, useRef } from 'react'
import Settings from './Settings'
import { useGameStore } from '../store/gameStore'
import './Lobby.css'

interface LobbyProps {
  onJoin: () => void
}

// Generate random stars for background
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 70, // Keep stars in upper portion
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 2 + 2,
    brightness: Math.random() * 0.5 + 0.5,
  }))
}

// Generate flying planes with contrails
function generatePlanes(count: number) {
  const planeTypes = [
    { emoji: '✈️', size: 1.2, speed: 'fast' },
    { emoji: '🛩️', size: 0.9, speed: 'medium' },
    { emoji: '🛫', size: 1.0, speed: 'medium' },
    { emoji: '✈️', size: 1.5, speed: 'slow' },
  ]
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    ...planeTypes[i % planeTypes.length],
    top: Math.random() * 50 + 10,
    duration: Math.random() * 20 + 25,
    delay: Math.random() * 20,
    direction: Math.random() > 0.5 ? 1 : -1,
    hasContrail: Math.random() > 0.3,
  }))
}

// Generate runway lights
function generateRunwayLights(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (i / (count - 1)) * 80 + 10, // Spread across 80% of screen
    delay: i * 0.1,
  }))
}

// Generate ambient particles (dust/mist)
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.3 + 0.1,
  }))
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [name, setName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showMultiplayerMessage, setShowMultiplayerMessage] = useState(false)
  const { setGameMode, setGamePhase } = useGameStore()
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset')

  // Memoize background elements
  const stars = useMemo(() => generateStars(120), [])
  const planes = useMemo(() => generatePlanes(6), [])
  const runwayLights = useMemo(() => generateRunwayLights(15), [])
  const particles = useMemo(() => generateParticles(30), [])

  // Subtle parallax effect on mouse move
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  // Cycle through times of day
  useEffect(() => {
    const times: ('day' | 'sunset' | 'night')[] = ['sunset', 'night', 'day', 'sunset']
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % times.length
      setTimeOfDay(times[index])
    }, 45000) // Change every 45 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSinglePlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setGameMode('single')
      onJoin()
    }
  }

  const handleMultiplayer = () => {
    setShowMultiplayerMessage(true)
    setTimeout(() => setShowMultiplayerMessage(false), 3000)
  }

  const handlePlaneBuilder = () => {
    setGamePhase('builder')
  }

  return (
    <div className={`lobby time-${timeOfDay}`}>
      {/* Animated Background */}
      <div className="lobby-background">
        {/* Sky Gradient Overlay */}
        <div className="sky-gradient" />

        {/* Sun/Moon Celestial Body */}
        <div
          className="celestial-body"
          style={{
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`
          }}
        >
          <div className="celestial-glow" />
          <div className="celestial-core" />
          {timeOfDay !== 'night' && <div className="lens-flare" />}
          {timeOfDay !== 'night' && <div className="lens-flare flare-2" />}
          {timeOfDay !== 'night' && <div className="sun-rays" />}
        </div>

        {/* Aurora Effect */}
        <div className="aurora" />
        <div className="aurora aurora-2" />

        {/* Twinkling Stars - More visible at night */}
        <div className="starfield" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
          {stars.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                opacity: star.brightness,
              }}
            />
          ))}
        </div>

        {/* Flying Planes with Contrails */}
        <div className="flying-planes">
          {planes.map(plane => (
            <div
              key={plane.id}
              className={`flying-plane ${plane.direction < 0 ? 'reverse' : ''} speed-${plane.speed}`}
              style={{
                top: `${plane.top}%`,
                animationDuration: `${plane.duration}s`,
                animationDelay: `${plane.delay}s`,
                fontSize: `${plane.size}rem`,
              }}
            >
              <span className="plane-emoji">{plane.emoji}</span>
              {plane.hasContrail && <div className="contrail" />}
            </div>
          ))}
        </div>

        {/* Volumetric Clouds - Enhanced */}
        <div className="cloud-layer" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <div className="volumetric-cloud cloud-1">
            <div className="cloud-puff" />
            <div className="cloud-puff puff-2" />
            <div className="cloud-puff puff-3" />
          </div>
          <div className="volumetric-cloud cloud-2">
            <div className="cloud-puff" />
            <div className="cloud-puff puff-2" />
          </div>
          <div className="volumetric-cloud cloud-3">
            <div className="cloud-puff" />
            <div className="cloud-puff puff-2" />
            <div className="cloud-puff puff-3" />
          </div>
          <div className="volumetric-cloud cloud-4">
            <div className="cloud-puff" />
          </div>
        </div>

        {/* Ambient Particles */}
        <div className="particles-layer">
          {particles.map(p => (
            <div
              key={p.id}
              className="ambient-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Mountains Silhouette */}
        <div className="mountains">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path className="mountain-back" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            <path className="mountain-front" d="M0,256L60,234.7C120,213,240,171,360,176C480,181,600,235,720,234.7C840,235,960,181,1080,170.7C1200,160,1320,192,1380,208L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>

        {/* Runway Lights */}
        <div className="runway-lights">
          {runwayLights.map(light => (
            <div
              key={light.id}
              className="runway-light"
              style={{
                left: `${light.left}%`,
                animationDelay: `${light.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Ground Fog */}
        <div className="ground-fog" />

        {/* Window/Cockpit Overlay */}
        <div className="cockpit-overlay">
          <div className="window-reflection" />
          <div className="window-frame" />
        </div>
      </div>

      <div className="lobby-content" ref={contentRef}>
        {/* Radar Ping Animation Behind Logo */}
        <div className="radar-ping" />

        <div className="logo">
          <span className="logo-icon">✈️</span>
          <h1>Otter Planes</h1>
          <span className="logo-subtitle">IO</span>
        </div>

        <p className="tagline">Realistic flight, multiplayer mayhem</p>

        {/* Flight Status Ticker */}
        <div className="flight-ticker">
          <span className="ticker-item">🟢 RUNWAY CLEAR</span>
          <span className="ticker-divider">•</span>
          <span className="ticker-item">☁️ VFR CONDITIONS</span>
          <span className="ticker-divider">•</span>
          <span className="ticker-item">🌡️ 22°C</span>
        </div>

        <form onSubmit={handleSinglePlayer}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your callsign"
            maxLength={20}
            autoFocus
          />

          <div className="mode-buttons">
            <button type="submit" className="mode-button single" disabled={!name.trim()}>
              <span className="mode-icon">🎮</span>
              Single Player
              <span className="mode-hint">Free Flight</span>
            </button>

            <button type="button" className="mode-button multi" onClick={handleMultiplayer}>
              <span className="mode-icon">🌐</span>
              Multiplayer
              <span className="mode-hint">Online</span>
            </button>
          </div>
        </form>

        {/* Minecraft-style "Coming Soon" message */}
        {showMultiplayerMessage && (
          <div className="coming-soon-message">
            <span className="coming-soon-text">Coming Soon™</span>
          </div>
        )}

        <div className="lobby-buttons">
          <button
            className="builder-button"
            onClick={handlePlaneBuilder}
          >
            🔧 Plane Builder
          </button>

          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="lobby-footer">
          <div className="control-hints">
            <span className="hint"><kbd>WASD</kbd> Fly</span>
            <span className="hint"><kbd>⇧/⌃</kbd> Throttle</span>
            <span className="hint"><kbd>ESC</kbd> Pause</span>
          </div>
        </div>
      </div>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
