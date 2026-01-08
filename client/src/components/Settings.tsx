import { useState, useRef, useEffect } from 'react'
import './Settings.css'
import { keybindManager, KeybindAction } from '../systems/KeybindManager'

interface SettingsProps {
    isOpen: boolean
    onClose: () => void
}

export interface GameSettings {
    // Controls
    mouseSensitivity: number
    invertY: boolean
    invertX: boolean
    flightAssist: boolean
    throttleResponse: number
    deadZone: number
    // Audio
    masterVolume: number
    engineVolume: number
    sfxVolume: number
    musicVolume: number
    windVolume: number
    muteWhenUnfocused: boolean
    // Graphics
    graphicsQuality: 'low' | 'medium' | 'high'
    showFPS: boolean
    cloudDensity: number
    drawDistance: number
    shadowQuality: 'off' | 'low' | 'high'
    motionBlur: boolean
    antiAliasing: boolean
    resolutionScale: number
    // Gameplay
    hudOpacity: number
    minimapSize: 'small' | 'medium' | 'large'
    minimapOpacity: number
    showCompass: boolean
    units: 'metric' | 'imperial'
    // Accessibility
    highContrast: boolean
    colorblindMode: 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia'
    screenShake: number
    reduceMotion: boolean
    fontSize: 'normal' | 'large' | 'xlarge'
}

// Default settings
export const defaultSettings: GameSettings = {
    // Controls
    mouseSensitivity: 50,
    invertY: false,
    invertX: false,
    flightAssist: true,
    throttleResponse: 50,
    deadZone: 5,
    // Audio
    masterVolume: 80,
    engineVolume: 70,
    sfxVolume: 70,
    musicVolume: 50,
    windVolume: 60,
    muteWhenUnfocused: true,
    // Graphics
    graphicsQuality: 'high',
    showFPS: false,
    cloudDensity: 70,
    drawDistance: 80,
    shadowQuality: 'high',
    motionBlur: false,
    antiAliasing: true,
    resolutionScale: 100,
    // Gameplay
    hudOpacity: 100,
    minimapSize: 'medium',
    minimapOpacity: 80,
    showCompass: true,
    units: 'imperial',
    // Accessibility
    highContrast: false,
    colorblindMode: 'off',
    screenShake: 50,
    reduceMotion: false,
    fontSize: 'normal',
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

type SettingsTab = 'controls' | 'audio' | 'graphics' | 'gameplay' | 'accessibility' | 'keybinds'

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'controls', label: 'Controls', icon: '🎮' },
    { id: 'audio', label: 'Audio', icon: '🔊' },
    { id: 'graphics', label: 'Graphics', icon: '🖥️' },
    { id: 'gameplay', label: 'Gameplay', icon: '✈️' },
    { id: 'accessibility', label: 'Access', icon: '♿' },
    { id: 'keybinds', label: 'Keybinds', icon: '⌨️' },
]

// Tooltip hints for settings
const TOOLTIPS: Record<string, string> = {
    mouseSensitivity: 'How quickly the camera responds to mouse movement.',
    invertY: 'Reverses the vertical axis - pull back to look up.',
    invertX: 'Reverses the horizontal axis.',
    flightAssist: 'Automatically levels your aircraft when you release controls. Disable for full manual flight.',
    throttleResponse: 'How quickly the throttle increases or decreases.',
    deadZone: 'Ignore small controller stick movements below this threshold.',
    masterVolume: 'Overall volume for all game sounds.',
    engineVolume: 'Volume of aircraft engine sounds.',
    sfxVolume: 'Volume of sound effects like UI clicks and alerts.',
    musicVolume: 'Volume of background music.',
    windVolume: 'Volume of wind and ambient atmospheric sounds.',
    muteWhenUnfocused: 'Automatically mute audio when the game window is not active.',
    graphicsQuality: 'Overall visual quality preset. Affects shadows, anti-aliasing, and resolution.',
    showFPS: 'Display a frames-per-second counter in the corner.',
    cloudDensity: 'How many clouds appear in the sky. Lower for better performance.',
    drawDistance: 'How far you can see before fog obscures the view.',
    shadowQuality: 'Quality of ground shadows. Off gives best performance.',
    motionBlur: 'Adds blur when moving quickly for a cinematic feel.',
    antiAliasing: 'Smooths jagged edges. Disable for better performance.',
    resolutionScale: 'Render at lower resolution for better performance.',
    hudOpacity: 'Transparency of the flight instruments overlay.',
    minimapSize: 'Size of the minimap in the corner of the screen.',
    minimapOpacity: 'Transparency of the minimap.',
    showCompass: 'Display the heading compass at the top of the screen.',
    units: 'Display speed in knots/mph or km/h, altitude in feet or meters.',
    highContrast: 'Increases contrast for better visibility.',
    colorblindMode: 'Adjusts colors for different types of color vision.',
    screenShake: 'Amount of camera shake during turbulence and impacts.',
    reduceMotion: 'Minimizes animations for motion-sensitive users.',
    fontSize: 'Size of text in menus and UI elements.',
}

// ============================================
// TOOLTIP COMPONENT
// ============================================
function Tooltip({ text, visible, x, y }: { text: string; visible: boolean; x: number; y: number }) {
    if (!visible || !text) return null
    return (
        <div
            className="tooltip"
            style={{
                left: x,
                top: y,
                opacity: visible ? 1 : 0
            }}
        >
            {text}
            <div className="tooltip-arrow" />
        </div>
    )
}

// ============================================
// SETTING ROW COMPONENT
// ============================================
interface SettingRowProps {
    label: string
    tooltip?: string
    children: React.ReactNode
    onTooltipShow?: (rect: DOMRect) => void
    onTooltipHide?: () => void
}

function SettingRow({ label, tooltip, children, onTooltipShow, onTooltipHide }: SettingRowProps) {
    const labelRef = useRef<HTMLLabelElement>(null)

    const handleMouseEnter = () => {
        if (tooltip && labelRef.current && onTooltipShow) {
            onTooltipShow(labelRef.current.getBoundingClientRect())
        }
    }

    const handleMouseLeave = () => {
        if (onTooltipHide) onTooltipHide()
    }

    return (
        <div className="setting-row">
            <label
                ref={labelRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={tooltip ? 'has-tooltip' : ''}
            >
                {label}
                {tooltip && <span className="info-icon">ⓘ</span>}
            </label>
            {children}
        </div>
    )
}

// ============================================
// KEYBIND ROW COMPONENT
// ============================================
interface KeybindRowProps {
    action: KeybindAction
    label: string
    listeningFor: KeybindAction | null
    onStartListening: (action: KeybindAction) => void
}

function KeybindRow({ action, label, listeningFor, onStartListening }: KeybindRowProps) {
    const isListening = listeningFor === action
    const displayKey = keybindManager.getDisplayKey(action)

    return (
        <div className="keybind-row">
            <span>{label}</span>
            <button
                className={`keybind-button ${isListening ? 'listening' : ''}`}
                onClick={() => onStartListening(action)}
            >
                {isListening ? 'Press a key...' : displayKey}
            </button>
        </div>
    )
}

// ============================================
// MAIN SETTINGS COMPONENT
// ============================================
export default function Settings({ isOpen, onClose }: SettingsProps) {
    const [settings, setSettings] = useState<GameSettings>(loadSettings)
    const [activeTab, setActiveTab] = useState<SettingsTab>('controls')
    const [hasChanges, setHasChanges] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Tooltip state
    const [tooltipInfo, setTooltipInfo] = useState<{ text: string; rect: DOMRect } | null>(null)
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const tooltipTimeout = useRef<number | null>(null)

    // Keybind rebinding state
    const [listeningFor, setListeningFor] = useState<KeybindAction | null>(null)

    // Tab indicator animation
    const tabsRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    // Update tab indicator position
    useEffect(() => {
        if (tabsRef.current) {
            const activeButton = tabsRef.current.querySelector('.tab-button.active') as HTMLElement
            if (activeButton) {
                setIndicatorStyle({
                    left: activeButton.offsetLeft,
                    width: activeButton.offsetWidth
                })
            }
        }
    }, [activeTab])

    // Handle keybind listening
    useEffect(() => {
        if (!listeningFor) return

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            e.stopPropagation()

            if (e.key === 'Escape') {
                setListeningFor(null)
                return
            }

            const key = e.key.toLowerCase()
            const displayName = e.key.length === 1 ? e.key.toUpperCase() : e.key

            keybindManager.setBinding(listeningFor, key, displayName)
            setListeningFor(null)
            setHasChanges(true)
        }

        window.addEventListener('keydown', handleKeyDown, true)
        return () => window.removeEventListener('keydown', handleKeyDown, true)
    }, [listeningFor])

    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        saveSettings(newSettings)
        setHasChanges(true)
    }

    const showTooltip = (text: string, rect: DOMRect) => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current)
        setTooltipInfo({ text, rect })
        tooltipTimeout.current = window.setTimeout(() => {
            setTooltipVisible(true)
        }, 400)
    }

    const hideTooltip = () => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current)
        setTooltipVisible(false)
        setTooltipInfo(null)
    }

    if (!isOpen) return null

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header Row */}
                <div className="settings-header">
                    <div className="header-left">
                        <span className="header-icon">⚙️</span>
                        <h2>Settings</h2>
                    </div>
                    <div className="header-center">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search settings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                            )}
                        </div>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <span className="close-icon">✕</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="settings-tabs" ref={tabsRef}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                    <div
                        className="tab-indicator"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width
                        }}
                    />
                </div>

                {/* Tab Content */}
                <div className="settings-content">
                    {/* Controls Tab */}
                    {activeTab === 'controls' && (
                        <div className="tab-content">
                            <div className="content-grid">
                                <div className="content-card">
                                    <h4>🖱️ Mouse</h4>
                                    <SettingRow
                                        label="Sensitivity"
                                        tooltip={TOOLTIPS.mouseSensitivity}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.mouseSensitivity, r)}
                                        onTooltipHide={hideTooltip}
                                    >
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
                                    </SettingRow>
                                    <SettingRow
                                        label="Invert Y-Axis"
                                        tooltip={TOOLTIPS.invertY}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.invertY, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.invertY ? 'active' : ''}`}
                                            onClick={() => updateSetting('invertY', !settings.invertY)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.invertY ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Invert X-Axis"
                                        tooltip={TOOLTIPS.invertX}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.invertX, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.invertX ? 'active' : ''}`}
                                            onClick={() => updateSetting('invertX', !settings.invertX)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.invertX ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                </div>

                                <div className="content-card">
                                    <h4>✈️ Flight</h4>
                                    <SettingRow
                                        label="Flight Assist"
                                        tooltip={TOOLTIPS.flightAssist}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.flightAssist, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.flightAssist ? 'active' : ''}`}
                                            onClick={() => updateSetting('flightAssist', !settings.flightAssist)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.flightAssist ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Throttle Response"
                                        tooltip={TOOLTIPS.throttleResponse}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.throttleResponse, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={settings.throttleResponse}
                                                onChange={(e) => updateSetting('throttleResponse', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.throttleResponse}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Dead Zone"
                                        tooltip={TOOLTIPS.deadZone}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.deadZone, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="30"
                                                value={settings.deadZone}
                                                onChange={(e) => updateSetting('deadZone', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.deadZone}%</span>
                                        </div>
                                    </SettingRow>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="tab-content">
                            <div className="content-grid">
                                <div className="content-card">
                                    <h4>🔊 Volume</h4>
                                    <SettingRow
                                        label="Master Volume"
                                        tooltip={TOOLTIPS.masterVolume}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.masterVolume, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.masterVolume}
                                                onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.masterVolume}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Engine"
                                        tooltip={TOOLTIPS.engineVolume}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.engineVolume, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.engineVolume}
                                                onChange={(e) => updateSetting('engineVolume', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.engineVolume}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Sound Effects"
                                        tooltip={TOOLTIPS.sfxVolume}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.sfxVolume, r)}
                                        onTooltipHide={hideTooltip}
                                    >
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
                                    </SettingRow>
                                </div>

                                <div className="content-card">
                                    <h4>🌬️ Ambient</h4>
                                    <SettingRow
                                        label="Music"
                                        tooltip={TOOLTIPS.musicVolume}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.musicVolume, r)}
                                        onTooltipHide={hideTooltip}
                                    >
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
                                    </SettingRow>
                                    <SettingRow
                                        label="Wind Effects"
                                        tooltip={TOOLTIPS.windVolume}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.windVolume, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.windVolume}
                                                onChange={(e) => updateSetting('windVolume', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.windVolume}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Mute When Unfocused"
                                        tooltip={TOOLTIPS.muteWhenUnfocused}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.muteWhenUnfocused, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.muteWhenUnfocused ? 'active' : ''}`}
                                            onClick={() => updateSetting('muteWhenUnfocused', !settings.muteWhenUnfocused)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.muteWhenUnfocused ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Graphics Tab */}
                    {activeTab === 'graphics' && (
                        <div className="tab-content">
                            <div className="content-grid">
                                <div className="content-card">
                                    <h4>📊 Quality</h4>
                                    <SettingRow
                                        label="Preset"
                                        tooltip={TOOLTIPS.graphicsQuality}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.graphicsQuality, r)}
                                        onTooltipHide={hideTooltip}
                                    >
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
                                    </SettingRow>
                                    <SettingRow
                                        label="Resolution Scale"
                                        tooltip={TOOLTIPS.resolutionScale}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.resolutionScale, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="50"
                                                max="100"
                                                step="10"
                                                value={settings.resolutionScale}
                                                onChange={(e) => updateSetting('resolutionScale', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.resolutionScale}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Shadow Quality"
                                        tooltip={TOOLTIPS.shadowQuality}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.shadowQuality, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="button-group">
                                            {(['off', 'low', 'high'] as const).map((q) => (
                                                <button
                                                    key={q}
                                                    className={`quality-button ${settings.shadowQuality === q ? 'active' : ''}`}
                                                    onClick={() => updateSetting('shadowQuality', q)}
                                                >
                                                    {q.charAt(0).toUpperCase() + q.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </SettingRow>
                                </div>

                                <div className="content-card">
                                    <h4>🎬 Effects</h4>
                                    <SettingRow
                                        label="Cloud Density"
                                        tooltip={TOOLTIPS.cloudDensity}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.cloudDensity, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.cloudDensity}
                                                onChange={(e) => updateSetting('cloudDensity', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.cloudDensity}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Draw Distance"
                                        tooltip={TOOLTIPS.drawDistance}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.drawDistance, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="30"
                                                max="100"
                                                value={settings.drawDistance}
                                                onChange={(e) => updateSetting('drawDistance', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.drawDistance}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Anti-Aliasing"
                                        tooltip={TOOLTIPS.antiAliasing}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.antiAliasing, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.antiAliasing ? 'active' : ''}`}
                                            onClick={() => updateSetting('antiAliasing', !settings.antiAliasing)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.antiAliasing ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Motion Blur"
                                        tooltip={TOOLTIPS.motionBlur}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.motionBlur, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.motionBlur ? 'active' : ''}`}
                                            onClick={() => updateSetting('motionBlur', !settings.motionBlur)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.motionBlur ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Show FPS"
                                        tooltip={TOOLTIPS.showFPS}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.showFPS, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.showFPS ? 'active' : ''}`}
                                            onClick={() => updateSetting('showFPS', !settings.showFPS)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.showFPS ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gameplay Tab */}
                    {activeTab === 'gameplay' && (
                        <div className="tab-content">
                            <div className="content-grid">
                                <div className="content-card">
                                    <h4>📍 HUD</h4>
                                    <SettingRow
                                        label="HUD Opacity"
                                        tooltip={TOOLTIPS.hudOpacity}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.hudOpacity, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                value={settings.hudOpacity}
                                                onChange={(e) => updateSetting('hudOpacity', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.hudOpacity}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Show Compass"
                                        tooltip={TOOLTIPS.showCompass}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.showCompass, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.showCompass ? 'active' : ''}`}
                                            onClick={() => updateSetting('showCompass', !settings.showCompass)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.showCompass ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Units"
                                        tooltip={TOOLTIPS.units}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.units, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="button-group">
                                            {(['imperial', 'metric'] as const).map((u) => (
                                                <button
                                                    key={u}
                                                    className={`quality-button ${settings.units === u ? 'active' : ''}`}
                                                    onClick={() => updateSetting('units', u)}
                                                >
                                                    {u.charAt(0).toUpperCase() + u.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </SettingRow>
                                </div>

                                <div className="content-card">
                                    <h4>🗺️ Minimap</h4>
                                    <SettingRow
                                        label="Size"
                                        tooltip={TOOLTIPS.minimapSize}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.minimapSize, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="button-group">
                                            {(['small', 'medium', 'large'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    className={`quality-button ${settings.minimapSize === s ? 'active' : ''}`}
                                                    onClick={() => updateSetting('minimapSize', s)}
                                                >
                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Opacity"
                                        tooltip={TOOLTIPS.minimapOpacity}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.minimapOpacity, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                value={settings.minimapOpacity}
                                                onChange={(e) => updateSetting('minimapOpacity', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.minimapOpacity}%</span>
                                        </div>
                                    </SettingRow>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accessibility Tab */}
                    {activeTab === 'accessibility' && (
                        <div className="tab-content">
                            <div className="content-grid">
                                <div className="content-card">
                                    <h4>👁️ Vision</h4>
                                    <SettingRow
                                        label="High Contrast"
                                        tooltip={TOOLTIPS.highContrast}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.highContrast, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.highContrast ? 'active' : ''}`}
                                            onClick={() => updateSetting('highContrast', !settings.highContrast)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.highContrast ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                    <SettingRow
                                        label="Colorblind Mode"
                                        tooltip={TOOLTIPS.colorblindMode}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.colorblindMode, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <select
                                            className="select-dropdown"
                                            value={settings.colorblindMode}
                                            onChange={(e) => updateSetting('colorblindMode', e.target.value as any)}
                                        >
                                            <option value="off">Off</option>
                                            <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                                            <option value="protanopia">Protanopia (Red-blind)</option>
                                            <option value="tritanopia">Tritanopia (Blue-blind)</option>
                                        </select>
                                    </SettingRow>
                                    <SettingRow
                                        label="Font Size"
                                        tooltip={TOOLTIPS.fontSize}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.fontSize, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="button-group">
                                            {(['normal', 'large', 'xlarge'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    className={`quality-button ${settings.fontSize === s ? 'active' : ''}`}
                                                    onClick={() => updateSetting('fontSize', s)}
                                                >
                                                    {s === 'xlarge' ? 'XL' : s.charAt(0).toUpperCase() + s.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </SettingRow>
                                </div>

                                <div className="content-card">
                                    <h4>🎭 Motion</h4>
                                    <SettingRow
                                        label="Screen Shake"
                                        tooltip={TOOLTIPS.screenShake}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.screenShake, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.screenShake}
                                                onChange={(e) => updateSetting('screenShake', Number(e.target.value))}
                                            />
                                            <span className="slider-value">{settings.screenShake}%</span>
                                        </div>
                                    </SettingRow>
                                    <SettingRow
                                        label="Reduce Motion"
                                        tooltip={TOOLTIPS.reduceMotion}
                                        onTooltipShow={(r) => showTooltip(TOOLTIPS.reduceMotion, r)}
                                        onTooltipHide={hideTooltip}
                                    >
                                        <button
                                            className={`toggle-button ${settings.reduceMotion ? 'active' : ''}`}
                                            onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                                        >
                                            <span className="toggle-slider" />
                                            <span className="toggle-label">{settings.reduceMotion ? 'ON' : 'OFF'}</span>
                                        </button>
                                    </SettingRow>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Keybinds Tab */}
                    {activeTab === 'keybinds' && (
                        <div className="tab-content">
                            <div className="keybind-instructions">
                                Click a key to rebind it. Press ESC to cancel.
                            </div>
                            <div className="content-grid three-col">
                                <div className="content-card">
                                    <h4>✈️ Flight</h4>
                                    <KeybindRow action="pitch_up" label="Pitch Up" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="pitch_down" label="Pitch Down" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="roll_left" label="Roll Left" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="roll_right" label="Roll Right" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="yaw_left" label="Yaw Left" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="yaw_right" label="Yaw Right" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                </div>

                                <div className="content-card">
                                    <h4>⚡ Throttle</h4>
                                    <KeybindRow action="throttle_up" label="Throttle Up" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="throttle_down" label="Throttle Down" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                </div>

                                <div className="content-card">
                                    <h4>🖥️ Interface</h4>
                                    <KeybindRow action="pause" label="Pause Menu" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="minimap_toggle" label="Toggle Map" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="minimap_size" label="Map Size" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="camera_next" label="Next Camera" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                    <KeybindRow action="camera_prev" label="Prev Camera" listeningFor={listeningFor} onStartListening={setListeningFor} />
                                </div>
                            </div>

                            <div className="keybind-reset">
                                <button
                                    className="reset-keybinds-button"
                                    onClick={() => {
                                        keybindManager.resetToDefaults()
                                        setHasChanges(true)
                                    }}
                                >
                                    ↺ Reset All Keybinds
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Row */}
                <div className="settings-footer">
                    <span className="version-text">Otter Planes v1.0</span>
                    <div className="footer-buttons">
                        <button className="reset-button" onClick={() => {
                            setSettings(defaultSettings)
                            saveSettings(defaultSettings)
                            keybindManager.resetToDefaults()
                            setHasChanges(false)
                        }}>
                            ↺ Reset All
                        </button>
                        <button
                            className={`apply-button ${hasChanges ? 'has-changes' : ''}`}
                            onClick={() => {
                                saveSettings(settings)
                                setHasChanges(false)
                                onClose()
                            }}
                        >
                            ✓ Apply & Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Tooltip */}
            {tooltipInfo && (
                <Tooltip
                    text={tooltipInfo.text}
                    visible={tooltipVisible}
                    x={tooltipInfo.rect.left + tooltipInfo.rect.width / 2}
                    y={tooltipInfo.rect.top - 10}
                />
            )}
        </div>
    )
}
