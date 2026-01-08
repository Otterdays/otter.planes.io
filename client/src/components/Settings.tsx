import { useState } from 'react'
import './Settings.css'

interface SettingsProps {
    isOpen: boolean
    onClose: () => void
}

export interface GameSettings {
    musicVolume: number
    sfxVolume: number
    mouseSensitivity: number
    invertY: boolean
    showFPS: boolean
    graphicsQuality: 'low' | 'medium' | 'high'
}

// Default settings
export const defaultSettings: GameSettings = {
    musicVolume: 50,
    sfxVolume: 70,
    mouseSensitivity: 50,
    invertY: false,
    showFPS: false,
    graphicsQuality: 'high',
}

// Load settings from localStorage
export function loadSettings(): GameSettings {
    try {
        const saved = localStorage.getItem('otterPlanes_settings')
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) }
        }
    } catch (e) {
        console.warn('Failed to load settings:', e)
    }
    return defaultSettings
}

// Save settings to localStorage
export function saveSettings(settings: GameSettings): void {
    try {
        localStorage.setItem('otterPlanes_settings', JSON.stringify(settings))
    } catch (e) {
        console.warn('Failed to save settings:', e)
    }
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
    const [settings, setSettings] = useState<GameSettings>(loadSettings)

    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        saveSettings(newSettings)
    }

    if (!isOpen) return null

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>⚙️ Settings</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    {/* Audio Section */}
                    <section className="settings-section">
                        <h3>🔊 Audio</h3>

                        <div className="setting-row">
                            <label>Music Volume</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.musicVolume}
                                    onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                                />
                                <span className="slider-value">{settings.musicVolume}%</span>
                            </div>
                        </div>

                        <div className="setting-row">
                            <label>Sound Effects</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.sfxVolume}
                                    onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                                />
                                <span className="slider-value">{settings.sfxVolume}%</span>
                            </div>
                        </div>
                    </section>

                    {/* Controls Section */}
                    <section className="settings-section">
                        <h3>🎮 Controls</h3>

                        <div className="setting-row">
                            <label>Mouse Sensitivity</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={settings.mouseSensitivity}
                                    onChange={(e) => updateSetting('mouseSensitivity', Number(e.target.value))}
                                />
                                <span className="slider-value">{settings.mouseSensitivity}%</span>
                            </div>
                        </div>

                        <div className="setting-row">
                            <label>Invert Y-Axis</label>
                            <button
                                className={`toggle-button ${settings.invertY ? 'active' : ''}`}
                                onClick={() => updateSetting('invertY', !settings.invertY)}
                            >
                                {settings.invertY ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </section>

                    {/* Graphics Section */}
                    <section className="settings-section">
                        <h3>🖥️ Graphics</h3>

                        <div className="setting-row">
                            <label>Quality</label>
                            <div className="button-group">
                                {(['low', 'medium', 'high'] as const).map((quality) => (
                                    <button
                                        key={quality}
                                        className={`quality-button ${settings.graphicsQuality === quality ? 'active' : ''}`}
                                        onClick={() => updateSetting('graphicsQuality', quality)}
                                    >
                                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-row">
                            <label>Show FPS</label>
                            <button
                                className={`toggle-button ${settings.showFPS ? 'active' : ''}`}
                                onClick={() => updateSetting('showFPS', !settings.showFPS)}
                            >
                                {settings.showFPS ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </section>

                    {/* Keybinds Section */}
                    <section className="settings-section">
                        <h3>⌨️ Keybinds</h3>

                        <div className="keybinds-group">
                            <h4>Flight Controls</h4>
                            <div className="keybind-row">
                                <span>Pitch Up/Down</span>
                                <kbd>W / S</kbd>
                            </div>
                            <div className="keybind-row">
                                <span>Roll Left/Right</span>
                                <kbd>A / D</kbd>
                            </div>
                            <div className="keybind-row">
                                <span>Yaw Left/Right</span>
                                <kbd>Q / E</kbd>
                            </div>
                            <div className="keybind-row">
                                <span>Throttle Up/Down</span>
                                <kbd>Shift / Ctrl</kbd>
                            </div>
                        </div>

                        <div className="keybinds-group">
                            <h4>UI Controls</h4>
                            <div className="keybind-row">
                                <span>Pause Menu</span>
                                <kbd>ESC</kbd>
                            </div>
                            <div className="keybind-row">
                                <span>Toggle Fullscreen Map</span>
                                <kbd>M</kbd>
                            </div>
                            <div className="keybind-row">
                                <span>Cycle Minimap Size</span>
                                <kbd>U</kbd>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="settings-footer">
                    <button className="reset-button" onClick={() => {
                        setSettings(defaultSettings)
                        saveSettings(defaultSettings)
                    }}>
                        Reset to Defaults
                    </button>
                    <button className="apply-button" onClick={() => {
                        saveSettings(settings)
                        onClose()
                    }}>
                        ✓ Apply & Close
                    </button>
                </div>
            </div>
        </div>
    )
}
