import { useEffect } from 'react'
import GameScene from './components/GameScene'
import Lobby from './components/Lobby'
import PlaneSelection from './components/PlaneSelection'
import PlaneBuilder from './components/PlaneBuilder'
import { useGameStore } from './store/gameStore'
import { keybindManager } from './systems/KeybindManager'
import './App.css'

function App() {
  const { gamePhase, setGamePhase } = useGameStore()

  // Initialize keybind manager once on app start
  useEffect(() => {
    keybindManager.init()
    return () => keybindManager.destroy()
  }, [])

  // Handle keyboard navigation in plane selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase === 'selection') {
        if (e.key === 'Enter') {
          setGamePhase('flying')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gamePhase, setGamePhase])

  // Render based on game phase
  switch (gamePhase) {
    case 'lobby':
      return <Lobby onJoin={() => setGamePhase('selection')} />
    case 'selection':
      return <PlaneSelection />
    case 'flying':
      return <GameScene playerName="Pilot" />
    case 'builder':
      return <PlaneBuilder />
    default:
      return <Lobby onJoin={() => setGamePhase('selection')} />
  }
}

export default App
