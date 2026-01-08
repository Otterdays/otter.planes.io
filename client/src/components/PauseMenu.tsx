import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import Settings from './Settings'
import './PauseMenu.css'

export default function PauseMenu() {
    const { isPaused, togglePause, setIsPaused, gameMode, setGamePhase } = useGameStore()
    const [showSettings, setShowSettings] = useState(false)

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // If settings is open, close it first
                if (showSettings) {
                    setShowSettings(false)
                    return
                }
                // Only toggle pause in single player
                if (gameMode === 'single') {
                    togglePause()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameMode, togglePause, showSettings])

    if (!isPaused) return null

    const handleResume = () => {
        setShowSettings(false)
        setIsPaused(false)
    }

    const handleSettings = () => {
        setShowSettings(true)
    }

    const handleMainMenu = () => {
        setShowSettings(false)
        setIsPaused(false)
        setGamePhase('lobby')
    }

    return (
        <>
            <div className="pause-overlay">
                <div className="pause-menu">
                    <h1 className="pause-title">PAUSED</h1>

                    <div className="pause-buttons">
                        <button className="pause-button resume" onClick={handleResume}>
                            Resume
                        </button>

                        <button className="pause-button settings" onClick={handleSettings}>
                            Settings
                        </button>

                        <button className="pause-button main-menu" onClick={handleMainMenu}>
                            Main Menu
                        </button>
                    </div>

                    <p className="pause-hint">Press ESC to resume</p>
                </div>
            </div>

            {/* Settings panel overlay */}
            <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    )
}
