import { useState, useEffect, useMemo } from 'react'
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
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 2 + 2,
  }))
}

// Generate flying planes for background
function generatePlanes(count: number) {
  const planeEmojis = ['✈️', '🛩️', '🛫', '✈️']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: planeEmojis[i % planeEmojis.length],
    top: Math.random() * 60 + 10,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * 15,
    size: Math.random() * 1.5 + 0.8,
    direction: Math.random() > 0.5 ? 1 : -1,
  }))
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [name, setName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showMultiplayerMessage, setShowMultiplayerMessage] = useState(false)
  const { setGameMode, setGamePhase } = useGameStore()

  // Memoize background elements
  const stars = useMemo(() => generateStars(80), [])
  const planes = useMemo(() => generatePlanes(5), [])

  // Subtle parallax effect on mouse move
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
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
    <div className="lobby">
      {/* Animated Background */}
      <div className="lobby-background">
        {/* Gradient Aurora */}
        <div className="aurora" />
        <div className="aurora aurora-2" />

        {/* Twinkling Stars */}
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
              }}
            />
          ))}
        </div>

        {/* Flying Planes */}
        <div className="flying-planes">
          {planes.map(plane => (
            <div
              key={plane.id}
              className={`flying-plane ${plane.direction < 0 ? 'reverse' : ''}`}
              style={{
                top: `${plane.top}%`,
                animationDuration: `${plane.duration}s`,
                animationDelay: `${plane.delay}s`,
                fontSize: `${plane.size}rem`,
              }}
            >
              {plane.emoji}
            </div>
          ))}
        </div>

        {/* Parallax Clouds */}
        <div className="cloud-layer" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
          <div className="cloud cloud-5"></div>
        </div>

        {/* Mountains Silhouette */}
        <div className="mountains">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(13, 31, 48, 0.8)" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            <path fill="rgba(13, 31, 48, 0.6)" d="M0,256L60,234.7C120,213,240,171,360,176C480,181,600,235,720,234.7C840,235,960,181,1080,170.7C1200,160,1320,192,1380,208L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>

        {/* Ground Fog */}
        <div className="ground-fog" />
      </div>

      <div className="lobby-content">
        <div className="logo">
          <span className="logo-icon">✈️</span>
          <h1>Otter Planes</h1>
          <span className="logo-subtitle">IO</span>
        </div>

        <p className="tagline">Realistic flight, multiplayer mayhem</p>

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
            </button>

            <button type="button" className="mode-button multi" onClick={handleMultiplayer}>
              <span className="mode-icon">🌐</span>
              Multiplayer
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
          <span>WASD to fly • Shift/Ctrl throttle • ESC to pause</span>
        </div>
      </div>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
