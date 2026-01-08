import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { WORLD_LOCATIONS, MAP_BOUNDS, ROAD_NETWORK } from '../config/worldLocations'
import { useKeybindAction, useKeybindDisplay } from '../systems/KeybindManager'
import './Minimap.css'

// =====================================================
// MINIMAP - Interactive navigation minimap
// =====================================================

type MinimapSize = 'small' | 'medium' | 'large'

const SIZE_CONFIG = {
    small: { width: 150, height: 150 },
    medium: { width: 250, height: 250 },
    large: { width: 400, height: 400 },
}

export default function Minimap() {
    const [size, setSize] = useState<MinimapSize>('small')
    const [isFullscreen, setIsFullscreen] = useState(false)

    const planePosition = useGameStore(state => state.planePosition)
    const flightData = useGameStore(state => state.flightData)

    // Get keybind display names from unified system
    const toggleKey = useKeybindDisplay('minimap_toggle')
    const sizeKey = useKeybindDisplay('minimap_size')

    // Use unified keybind system
    useKeybindAction('minimap_toggle', () => {
        setIsFullscreen(prev => !prev)
    })

    useKeybindAction('minimap_size', () => {
        setSize(prev => {
            if (prev === 'small') return 'medium'
            if (prev === 'medium') return 'large'
            return 'small'
        })
    })

    // Convert world coordinates to minimap coordinates
    const worldToMap = (worldX: number, worldZ: number, mapSize: number) => {
        const scale = mapSize / (MAP_BOUNDS.playableRadius * 2.5)
        const centerX = mapSize / 2
        const centerZ = mapSize / 2
        return {
            x: centerX + worldX * scale,
            y: centerZ + worldZ * scale, // Note: Z becomes Y on 2D map
        }
    }

    const currentSize = isFullscreen
        ? { width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 }
        : SIZE_CONFIG[size]

    const playerPos = worldToMap(planePosition.x, planePosition.z, currentSize.width)

    return (
        <>
            {/* Fullscreen overlay backdrop */}
            {isFullscreen && (
                <div className="minimap-backdrop" onClick={() => setIsFullscreen(false)} />
            )}

            <div
                className={`minimap ${isFullscreen ? 'fullscreen' : ''}`}
                style={{
                    width: currentSize.width,
                    height: currentSize.height,
                }}
            >
                {/* Map background */}
                <div className="minimap-background">
                    {/* Terrain circle (playable area) */}
                    <svg
                        viewBox={`0 0 ${currentSize.width} ${currentSize.height}`}
                        className="minimap-svg"
                    >
                        {/* Grass area */}
                        <circle
                            cx={currentSize.width / 2}
                            cy={currentSize.height / 2}
                            r={currentSize.width * 0.4}
                            fill="#3a6b3a"
                        />

                        {/* Mountain border ring */}
                        <circle
                            cx={currentSize.width / 2}
                            cy={currentSize.height / 2}
                            r={currentSize.width * 0.4}
                            fill="none"
                            stroke="#665544"
                            strokeWidth={currentSize.width * 0.05}
                        />

                        {/* Roads */}
                        {ROAD_NETWORK.map((road, i) => {
                            const start = worldToMap(road.start[0], road.start[2], currentSize.width)
                            const end = worldToMap(road.end[0], road.end[2], currentSize.width)
                            return (
                                <line
                                    key={i}
                                    x1={start.x}
                                    y1={start.y}
                                    x2={end.x}
                                    y2={end.y}
                                    stroke="#555555"
                                    strokeWidth={isFullscreen ? 2 : 1}
                                />
                            )
                        })}

                        {/* Runway */}
                        <rect
                            x={currentSize.width / 2 - currentSize.width * 0.08}
                            y={currentSize.height / 2 - 2}
                            width={currentSize.width * 0.16}
                            height={4}
                            fill="#333333"
                        />

                        {/* POI markers */}
                        {WORLD_LOCATIONS.map((loc) => {
                            const pos = worldToMap(loc.position[0], loc.position[2], currentSize.width)
                            const markerSize = isFullscreen ? 16 : 8

                            // Skip if outside visible area
                            if (pos.x < 0 || pos.x > currentSize.width || pos.y < 0 || pos.y > currentSize.height) {
                                return null
                            }

                            return (
                                <g key={loc.id}>
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={markerSize / 2}
                                        fill={getMarkerColor(loc.type)}
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                    />
                                    {isFullscreen && (
                                        <text
                                            x={pos.x}
                                            y={pos.y + markerSize + 8}
                                            textAnchor="middle"
                                            fill="#ffffff"
                                            fontSize="10"
                                            className="minimap-label"
                                        >
                                            {loc.name}
                                        </text>
                                    )}
                                </g>
                            )
                        })}

                        {/* Player marker (arrow pointing in heading direction) */}
                        <g transform={`translate(${playerPos.x}, ${playerPos.y}) rotate(${flightData.heading})`}>
                            <polygon
                                points={isFullscreen ? "0,-12 -6,8 0,4 6,8" : "0,-6 -3,4 0,2 3,4"}
                                fill="#ffcc00"
                                stroke="#000000"
                                strokeWidth={1}
                            />
                        </g>
                    </svg>
                </div>

                {/* Legend (fullscreen only) */}
                {isFullscreen && (
                    <div className="minimap-legend">
                        <div className="legend-item">
                            <span className="legend-marker airport" /> Airport
                        </div>
                        <div className="legend-item">
                            <span className="legend-marker landmark" /> Landmark
                        </div>
                        <div className="legend-item">
                            <span className="legend-marker infrastructure" /> Infrastructure
                        </div>
                        <div className="legend-item">
                            <span className="legend-marker nature" /> Nature
                        </div>
                    </div>
                )}

                {/* Controls hint */}
                <div className="minimap-controls">
                    <span>{toggleKey}: Map</span>
                    <span>{sizeKey}: Size</span>
                </div>

                {/* Compass */}
                <div className="minimap-compass">N</div>
            </div>
        </>
    )
}

function getMarkerColor(type: string): string {
    switch (type) {
        case 'airport': return '#3366cc'
        case 'landmark': return '#cc6633'
        case 'infrastructure': return '#888888'
        case 'nature': return '#33aa33'
        default: return '#cccccc'
    }
}
