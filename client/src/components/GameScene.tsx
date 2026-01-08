import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import Plane from './Plane'
import HUD from './HUD'
import Grass from './Grass'
import Trees from './Trees'
import Clouds from './Clouds'
import CloudFog from './CloudFog'
import MeadowAccessories from './MeadowAccessories'
import InfiniteTerrain from './InfiniteTerrain'
import WorldManager from './world/WorldManager'
import AudioManager from './AudioManager'
import FPSCounter from './FPSCounter'
import PauseMenu from './PauseMenu'
import Minimap from './Minimap'
import { useGameStore } from '../store/gameStore'
import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import OtherPlane from './OtherPlane'
import { loadSettings } from './Settings'

interface GameSceneProps {
  playerName: string
}

export default function GameScene({ playerName }: GameSceneProps) {
  const { setSocket, otherPlayers, setOtherPlayers, setSocketId } = useGameStore()
  const [settings, setSettings] = useState(() => loadSettings())

  // Reload settings when localStorage changes (user changes settings)
  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(loadSettings())
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check periodically in case settings changed in same window
    const interval = setInterval(() => {
      setSettings(loadSettings())
    }, 500)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Graphics quality presets
  const graphicsConfig = useMemo(() => {
    switch (settings.graphicsQuality) {
      case 'low':
        return {
          antialias: false,
          shadows: false,
          shadowMapSize: 0,
          pixelRatio: 0.75,
        }
      case 'medium':
        return {
          antialias: false,
          shadows: true,
          shadowMapSize: 1024,
          pixelRatio: 1.0,
        }
      case 'high':
      default:
        return {
          antialias: true,
          shadows: true,
          shadowMapSize: 2048,
          pixelRatio: window.devicePixelRatio || 1.0,
        }
    }
  }, [settings.graphicsQuality])

  useEffect(() => {
    const socket = io('http://localhost:3001')
    setSocket(socket)
    setSocketId(socket.id || null)

    socket.on('gameState', (players) => {
      const filteredPlayers = players.filter((player: any) => player.id !== socket.id)
      setOtherPlayers(filteredPlayers)
    })

    return () => {
      socket.disconnect()
    }
  }, [setSocket, setOtherPlayers, setSocketId])

  return (
    <>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75, near: 1, far: 50000 }}
        gl={{
          antialias: graphicsConfig.antialias,
          logarithmicDepthBuffer: true,
          pixelRatio: graphicsConfig.pixelRatio,
        }}
        shadows={graphicsConfig.shadows}
      >
        {/* Scene background color - matches sky horizon */}
        <color attach="background" args={['#87CEEB']} />

        <Sky
          sunPosition={[200, 150, 200]}
          turbidity={6}
          rayleigh={0.4}
          mieCoefficient={0.003}
          mieDirectionalG={0.8}
          distance={450000}
        />

        {/* Atmospheric fog for smooth horizon blending - extends further */}
        <fog attach="fog" args={['#c8d8e8', 3000, 15000]} />

        {/* Stronger ambient for base illumination */}
        <ambientLight intensity={0.8} color="#e8f0ff" />

        {/* Main sun light - brighter */}
        <directionalLight
          position={[150, 120, 100]}
          intensity={1.5}
          color="#fffbe6"
          castShadow={graphicsConfig.shadows}
          shadow-mapSize={graphicsConfig.shadows ? [graphicsConfig.shadowMapSize, graphicsConfig.shadowMapSize] : [0, 0]}
          shadow-camera-far={500}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />

        {/* Fill light from opposite side */}
        <directionalLight
          position={[-80, 50, -80]}
          intensity={0.4}
          color="#b4d4ff"
        />

        {/* Sky/ground hemisphere light */}
        <hemisphereLight args={['#87CEEB', '#4a6b4a', 0.6]} />

        <InfiniteTerrain />
        <Grass />
        <MeadowAccessories />
        <Trees />
        <Clouds />
        <CloudFog />

        <WorldManager />

        <Plane playerName={playerName} />
        {otherPlayers.map((player) => (
          <OtherPlane key={player.id} player={player} />
        ))}
      </Canvas>
      <HUD />
      <FPSCounter />
      <AudioManager />
      <PauseMenu />
      <Minimap />
    </>
  )
}
